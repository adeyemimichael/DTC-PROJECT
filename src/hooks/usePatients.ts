import { useCallback, useState } from "react";
import { getSignedUrl } from "@/lib/utils/storage";
import type { VitalRecord } from "./useVitals";

export const getAgeFromDob = (dateOfBirth?: string | null): number | null => {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

export const resolveValue = <T,>(value: T | null | undefined, fallback: T): T => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
};

export const getPrimaryImage = (
  value: { avatar_url?: string | null; passport_url?: string | null } | null | undefined,
  fallback = "",
): string => {
  if (!value) return fallback;

  return value.avatar_url ?? value.passport_url ?? fallback;
};

const resolveStoragePathUrl = async (
  value: string | null | undefined,
  bucket: "avatars" | "passports" | "patient-uploads" | "medical-documents",
): Promise<string | null> => {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;

  return getSignedUrl(bucket, value);
};

export const formatPatientSince = (createdAt?: string | null): string => {
  if (!createdAt) return "Recently";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatPatientStatus = (status?: string | null): string => {
  if (!status) return "No active condition recorded";

  switch (status) {
    case "active":
      return "Active patient";
    case "pending_payment":
      return "Pending payment";
    case "inactive":
      return "Inactive patient";
    default:
      return status;
  }
};

export interface PatientRecord {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  blood_group?: string | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
  next_of_kin_relationship?: string | null;
  passport_url?: string | null;
  status?: string | null;
}

export interface PatientMedicalRecord {
  id: string;
  patient_id?: string | null;
  clinician_id?: string | null;
  category?: string | null;
  title?: string | null;
  details?: Record<string, unknown> | string | null;
  pdf_storage_path?: string | null;
  status?: string | null;
  created_at?: string | null;
  clinician?: {
    full_name?: string | null;
  } | null;
  signedUrl?: string | null;
}

export interface PatientUploadRecord {
  id: string;
  patient_id?: string | null;
  file_type?: string | null;
  category?: string | null;
  storage_path?: string | null;
  description?: string | null;
  created_at?: string | null;
  signedUrl?: string | null;
}

export function usePatients() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<PatientMedicalRecord[]>([]);
  const [patientUploads, setPatientUploads] = useState<PatientUploadRecord[]>([]);

  const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true);
  const [isLoadingVitals, setIsLoadingVitals] = useState<boolean>(false);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState<boolean>(false);
  const [isLoadingPatientUploads, setIsLoadingPatientUploads] = useState<boolean>(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [vitalsError, setVitalsError] = useState<string | null>(null);
  const [medicalRecordsError, setMedicalRecordsError] = useState<string | null>(null);
  const [patientUploadsError, setPatientUploadsError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setIsLoadingPatients(true);
    setPatientsError(null);

    try {
      const response = await fetch("/api/patients", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch patients");
      }

      const patientList = Array.isArray(result.data) ? result.data : [];

      const resolvedPatients = await Promise.all(
        patientList.map(async (patient: PatientRecord) => {
          const avatarUrl = patient.avatar_url
            ? await resolveStoragePathUrl(patient.avatar_url, "avatars")
            : null;
          const passportUrl = patient.passport_url
            ? await resolveStoragePathUrl(patient.passport_url, "passports")
            : null;

          return {
            ...patient,
            avatar_url: avatarUrl ?? patient.avatar_url ?? null,
            passport_url: passportUrl ?? patient.passport_url ?? null,
          };
        }),
      );

      setPatients(resolvedPatients);
      return resolvedPatients;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred while fetching patients";

      setPatientsError(message);
      setPatients([]);
      return [];
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  const fetchPatientVitals = useCallback(async (patientId: string) => {
    if (!patientId) {
      setVitals([]);
      setVitalsError(null);
      return [];
    }

    setIsLoadingVitals(true);
    setVitalsError(null);

    try {
      const response = await fetch(
        `/api/patients/vitals?patient_id=${encodeURIComponent(patientId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch patient vitals");
      }

      const patientVitals = Array.isArray(result.data) ? result.data : [];
      setVitals(patientVitals);
      return patientVitals;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching patient vitals";

      setVitalsError(message);
      setVitals([]);
      return [];
    } finally {
      setIsLoadingVitals(false);
    }
  }, []);

  const fetchPatientMedicalRecords = useCallback(async (patientId: string) => {
    if (!patientId) {
      setMedicalRecords([]);
      setMedicalRecordsError(null);
      return [];
    }

    setIsLoadingMedicalRecords(true);
    setMedicalRecordsError(null);

    try {
      const response = await fetch(
        `/api/patients/medical-documents?patient_id=${encodeURIComponent(patientId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch patient medical records");
      }

      const patientMedicalRecords = Array.isArray(result.data) ? result.data : [];

      const recordsWithSignedUrl = await Promise.all(
        patientMedicalRecords.map(async (record: PatientMedicalRecord) => ({
          ...record,
          signedUrl: await getSignedUrl("medical-documents", record.pdf_storage_path),
        })),
      );

      setMedicalRecords(recordsWithSignedUrl);
      return recordsWithSignedUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching patient medical records";

      setMedicalRecordsError(message);
      setMedicalRecords([]);
      return [];
    } finally {
      setIsLoadingMedicalRecords(false);
    }
  }, []);

  const fetchPatientUploads = useCallback(async (patientId: string) => {
    if (!patientId) {
      setPatientUploads([]);
      setPatientUploadsError(null);
      return [];
    }

    setIsLoadingPatientUploads(true);
    setPatientUploadsError(null);

    try {
      const response = await fetch(
        `/api/patients/uploads?patient_id=${encodeURIComponent(patientId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch patient uploads");
      }

      const uploads = Array.isArray(result.data) ? result.data : [];

      const uploadsWithSignedUrl = await Promise.all(
        uploads.map(async (upload: PatientUploadRecord) => ({
          ...upload,
          signedUrl: await getSignedUrl("patient-uploads", upload.storage_path),
        })),
      );

      setPatientUploads(uploadsWithSignedUrl);
      return uploadsWithSignedUrl;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred while fetching patient uploads";

      setPatientUploadsError(message);
      setPatientUploads([]);
      return [];
    } finally {
      setIsLoadingPatientUploads(false);
    }
  }, []);

  const getPatientById = useCallback(
    (patientId: string) => {
      return patients.find((patient) => patient.id === patientId) || null;
    },
    [patients],
  );

  const loadPatientById = useCallback(
    async (patientId: string) => {
      const patient = getPatientById(patientId);
      setSelectedPatient(patient);

      if (!patientId) {
        setVitals([]);
        return null;
      }

      const patientVitals = await fetchPatientVitals(patientId);
      return patient ? { patient, vitals: patientVitals } : null;
    },
    [fetchPatientVitals, getPatientById],
  );

  const latestVital = vitals.length > 0 ? vitals[0] : null;
  const hasVitals = vitals.length > 0;

  return {
    patients,
    selectedPatient,
    vitals,
    medicalRecords,
    patientUploads,
    latestVital,
    hasVitals,
    isLoadingPatients,
    isLoadingVitals,
    isLoadingMedicalRecords,
    isLoadingPatientUploads,
    patientsError,
    vitalsError,
    medicalRecordsError,
    patientUploadsError,
    fetchPatients,
    fetchPatientVitals,
    fetchPatientMedicalRecords,
    fetchPatientUploads,
    getPatientById,
    loadPatientById,
  };
}
