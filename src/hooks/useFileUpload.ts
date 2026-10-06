import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getSignedUrl } from "@/lib/utils/storage";

interface UploadState {
  isUploading: boolean;
  isFetching: boolean;
  progress: number;
  error: string | null;
}

interface PatientUploadData {
  id: string;
  patient_id: string;
  file_type: string;
  category: "lab_result_scan" | "general";
  storage_path: string;
  description: string | null;
  created_at: string;
  signedUrl?: string;
}

interface PatientUploadResult {
  success: boolean;
  data?: PatientUploadData;
  signedUrl?: string;
  error?: string;
}

interface FetchUploadsResult {
  success: boolean;
  data?: PatientUploadData[];
  error?: string;
}

interface UploadDocumentInput {
  file: File;
  description?: string;
  category: "lab_result_scan" | "general";
}

/**
 * Hook for managing patient documents (upload + fetch)
 * - Uploads files with metadata in ONE request
 * - Fetches existing uploads with signed URLs
 */
export function useFileUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    isFetching: false,
    progress: 0,
    error: null,
  });

  const [uploads, setUploads] = useState<PatientUploadData[]>([]);

  /**
   * Fetch all existing patient uploads with signed URLs
   */
  const fetchUploads = useCallback(async (): Promise<FetchUploadsResult> => {
    setState((prev) => ({ ...prev, isFetching: true, error: null }));

    try {
      const response = await fetch("/api/patients/uploads", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch uploads");
      }

      const uploadedFiles: PatientUploadData[] = result.data || [];

      // Generate signed URLs for all files
      const filesWithSignedUrls = await Promise.all(
        uploadedFiles.map(async (file) => {
          const signedUrl = await getSignedUrl(
            "patient-uploads",
            file.storage_path,
          );
          return {
            ...file,
            signedUrl: signedUrl || undefined,
          };
        }),
      );

      setUploads(filesWithSignedUrls);
      setState((prev) => ({ ...prev, isFetching: false }));

      return { success: true, data: filesWithSignedUrls };
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch uploads";
      setState((prev) => ({ ...prev, isFetching: false, error: errorMessage }));
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Upload patient document
   * - Supports: images, PDFs, audio, video
   * - Max size: 50MB
  
   */
  const uploadDocument = useCallback(
    async ({
      file,
      description,
      category,
    }: UploadDocumentInput): Promise<PatientUploadResult> => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "audio/mpeg",
        "audio/mp4",
        "audio/wav",
        "video/mp4",
        "video/quicktime",
        "application/pdf",
      ];
      const maxBytes = 50 * 1024 * 1024; // 50 MB

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        const errorMessage =
          "Invalid file type. Allowed: images (JPEG, PNG), audio (MP3, MP4, WAV), video (MP4, MOV), PDF";
        setState({
          isUploading: false,
          isFetching: false,
          progress: 0,
          error: errorMessage,
        });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validate file size
      if (file.size > maxBytes) {
        const errorMessage = "File must be smaller than 50 MB";
        setState({
          isUploading: false,
          isFetching: false,
          progress: 0,
          error: errorMessage,
        });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Validate category
      if (!["lab_result_scan", "general"].includes(category)) {
        const errorMessage =
          'Invalid category. Must be "lab_result_scan" or "general"';
        setState({
          isUploading: false,
          isFetching: false,
          progress: 0,
          error: errorMessage,
        });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }

      setState({
        isUploading: true,
        isFetching: false,
        progress: 0,
        error: null,
      });

      try {
        // Build FormData with file, description, and category
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);
        if (description) {
          formData.append("description", description);
        }

        setState((prev) => ({ ...prev, progress: 30 }));

        const response = await fetch("/api/patients/uploads", {
          method: "POST",
          body: formData,
        });

        setState((prev) => ({ ...prev, progress: 70 }));

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to upload document");
        }

        setState({
          isUploading: false,
          isFetching: false,
          progress: 100,
          error: null,
        });
        toast.success("Document uploaded successfully!");

        // Generate signed URL for the uploaded file (private bucket)
        const signedUrl = await getSignedUrl(
          "patient-uploads",
          responseData.data.storage_path,
        );

        const uploadedFile = {
          ...responseData.data,
          signedUrl: signedUrl || undefined,
        };

        // Add to uploads list
        setUploads((prev) => [uploadedFile, ...prev]);

        return {
          success: true,
          data: uploadedFile,
          signedUrl: signedUrl || undefined,
        };
      } catch (error: any) {
        const errorMessage = error.message || "Failed to upload document";
        setState({
          isUploading: false,
          isFetching: false,
          progress: 0,
          error: errorMessage,
        });
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [],
  );

  /**
   * Delete an upload from the list (optimistic update)
   */
  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      isFetching: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    // State
    uploads,
    isUploading: state.isUploading,
    isFetching: state.isFetching,
    progress: state.progress,
    error: state.error,

    // Actions
    fetchUploads,
    uploadDocument,
    removeUpload,
    clearError,
    reset,
  };
}
