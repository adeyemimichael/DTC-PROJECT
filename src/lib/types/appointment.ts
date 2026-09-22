/**
 *hope this march Appointment data structure matching  Supabase database
 */
export interface Appointment {
  id: string;
  patient_id: string;
  clinician_id: string | null;
  service_id: string;
  scheduled_at: string; // ISO date string
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason: string | null;
  patient_upload_id: string | null;
  booked_by: string;
  created_at: string;
  updated_at: string;
  
  // Related data from JOIN queries
  services?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  profiles?: {
    id: string;
    full_name: string;
  };
}

/**
 * API response structure from /api/appointments
 */
export interface AppointmentResponse {
  data: Appointment[];
}
