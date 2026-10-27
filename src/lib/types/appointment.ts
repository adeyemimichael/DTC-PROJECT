/**
 * Appointment data structure matching Supabase database
 */
export type AppointmentStatus =
  | "pending"
  | "pending_payment"
  | "pending_approval"
  | "confirmed"
  | "declined"
  | "completed"
  | "cancelled"
  | "missed";

export interface Appointment {
  id: string;
  patient_id: string;
  clinician_id: string | null;
  service_id: string;
  scheduled_at: string; // ISO date string
  status: AppointmentStatus;
  booked_by: "patient" | "admin" | string;
  reason: string | null;
  patient_upload_id: string | null;
  completion_note?: string | null;
  completion_note_id?: string | null;
  meeting_link?: string | null;
  cancelled_by?: "patient" | "admin" | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;

  // Related data from JOIN queries
  services?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency?: string;
    duration?: number;
    duration_minutes?: number;
  };
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
  };
  payments?: {
    id: string;
    paystack_reference: string;
    paystack_access_code: string | null;
    status: string;
    amount: number;
    created_at?: string;
  }[];
}

export interface AvailableSlot {
  time: string; // "09:00"
  label: string; // "9:00 AM"
  start_iso: string; // "2026-11-04T09:00:00.000Z"
  available: boolean;
}

export interface DayAvailableSlots {
  date: string; // "2026-11-04"
  day: string; // "Wednesday"
  available_count: number;
  slots: AvailableSlot[];
}

export interface AppointmentResponse {
  data: Appointment[];
}
