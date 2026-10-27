import { useCallback, useState } from 'react';

export type MedicalDocumentCategory =
  | 'lab_order'
  | 'prescription'
  | 'referral'
  | 'clinical_note';

export type MedicalDocumentStatus =
  | 'ordered'
  | 'result_uploaded'
  | 'completed';

/** Per-category details shapes  */
export type MedicalDocumentDetails =
  | { test_name: string; instructions?: string }          
  | { medications: string[] }                             
  | { referred_to: string; reason: string }              
  | { content: string };                                  

export interface MedicalDocument {
  id: string;
  patient_id: string;
  clinician_id: string;
  category: MedicalDocumentCategory;
  title: string | null;
  details: MedicalDocumentDetails | Record<string, unknown>;
  pdf_storage_path: string | null;
  status: MedicalDocumentStatus | null;
  created_at: string;
  signedUrl?: string | null;
  clinician?: { full_name?: string | null } | null;
}

export interface UploadMedicalDocumentInput {
  file: File;
  patient_id: string;
  title: string;
  category: MedicalDocumentCategory;
  details: MedicalDocumentDetails;
  /** Only required for lab_order  */
  status?: MedicalDocumentStatus;
}

export type MedicalDocumentResult = { success: boolean; error?: string };

/** Normalise category  */
export function categoryLabel(category: string): string {
  switch (category) {
    case 'lab_order':    return 'Lab Order';
    case 'prescription': return 'Prescription';
    case 'referral':     return 'Referral';
    case 'clinical_note':return 'Clinical Note';
    default:             return category;
  }
}

/** Normalise  status  */
export function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'ordered':         return 'Ordered';
    case 'result_uploaded': return 'Result Uploaded';
    case 'completed':       return 'Completed';
    default:                return '—';
  }
}

/**
 * Hook for fetching and uploading medical documents.
 */
export function useMedicalDocuments() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = useCallback(async (patientId?: string) => {
    setIsLoadingDocuments(true);
    setDocumentsError(null);

    try {
      const url = patientId
        ? `/api/patients/medical-documents?patient_id=${encodeURIComponent(patientId)}`
        : '/api/patients/medical-documents';

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch medical documents');
      }

      setDocuments(Array.isArray(result.data) ? result.data : []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch medical documents';
      setDocumentsError(message);
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  const uploadDocument = useCallback(
    async (input: UploadMedicalDocumentInput): Promise<MedicalDocumentResult> => {
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', input.file);
        formData.append('patient_id', input.patient_id);
        formData.append('title', input.title);
        formData.append('category', input.category);
        // details must be a JSON string — the route calls JSON.parse() on it
        formData.append('details', JSON.stringify(input.details));
        // status only sent for lab_order; omitting it lets the DB store null
        if (input.category === 'lab_order' && input.status) {
          formData.append('status', input.status);
        }

        // Do NOT set Content-Type header 
        const response = await fetch('/api/patients/medical-documents', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: result.error || 'Failed to upload medical document',
          };
        }

        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to upload medical document';
        return { success: false, error: message };
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    documents,
    isLoadingDocuments,
    documentsError,
    isUploading,
    fetchDocuments,
    uploadDocument,
  };
}
