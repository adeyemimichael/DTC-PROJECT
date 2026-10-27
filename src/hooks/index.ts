/**
 * Custom React Hooks
 */

export { useAuth } from './useAuth';
export { usePassportUpload } from './usePassportUpload';
export { useFileUpload } from './useFileUpload';
export { usePatients } from './usePatients';
export type { PatientRecord } from './usePatients';
export { useVitals } from './useVitals';
export type { VitalRecord, CreateVitalInput } from './useVitals';
export { useProfile } from './useProfile';
export type { UserProfile, UpdateProfileInput } from './useProfile';
export { useServices } from './useServices';
export type { Service, ServiceInput } from './useServices';
export { useMedicalDocuments, categoryLabel, statusLabel } from './useMedicalDocuments';
export type {
  MedicalDocument,
  MedicalDocumentCategory,
  MedicalDocumentStatus,
  MedicalDocumentDetails,
  UploadMedicalDocumentInput,
} from './useMedicalDocuments';
