import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getSignedUrl } from '@/lib/utils/storage';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UploadResult {
  success: boolean;
  path?: string;
  signedUrl?: string;
  error?: string;
}

export function usePassportUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadPassport = useCallback(async (file: File): Promise<UploadResult> => {
  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

   
    if (!allowedTypes.includes(file.type)) {
      const errorMessage = 'Please upload a valid image file (JPEG or PNG)';
      setState({ isUploading: false, progress: 0, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }


    if (file.size > maxBytes) {
      const errorMessage = 'Passport file must be smaller than 5 MB';
      setState({ isUploading: false, progress: 0, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }

    setState({ isUploading: true, progress: 0, error: null });

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

  
      setState((prev) => ({ ...prev, progress: 30 }));

      const response = await fetch('/api/upload/passport', {
        method: 'POST',
        body: formData,
      });

      setState((prev) => ({ ...prev, progress: 70 }));

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload passport');
      }

      setState({ isUploading: false, progress: 100, error: null });
      toast.success('Passport uploaded successfully!');

      // Generate signed URL from the path
      const signedUrl = await getSignedUrl('passports', data.data.path);

      return {
        success: true,
        path: data.data.path,
        signedUrl: signedUrl || undefined,
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to upload passport';
      setState({ isUploading: false, progress: 0, error: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
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
      progress: 0,
      error: null,
    });
  }, []);

  return {
    // State
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,

    // Actions
    uploadPassport,
    clearError,
    reset,
  };
}
