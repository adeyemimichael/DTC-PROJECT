import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import type {
  Appointment,
  AvailableSlot,
  DayAvailableSlots,
} from "@/lib/types/appointment";
import { getSignedUrl } from "@/lib/utils/storage";

export interface BookAppointmentPayload {
  service_id: string;
  scheduled_at: string;
  reason?: string;
  patient_upload_id?: string;
  clinician_id?: string;
  callback_url?: string;
}

export interface DoctorPatchResult {
  success: boolean;
  data?: Appointment;
  error?: string;
}

export function useAppointments(options?: {
  patient_id?: string;
  status?: string;
  upcoming?: boolean;
  autoFetch?: boolean;
}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options?.patient_id) params.set("patient_id", options.patient_id);
      if (options?.status) params.set("status", options.status);
      if (options?.upcoming) params.set("upcoming", "true");

      const url = `/api/appointments${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok)
        throw new Error(result.error || "Failed to fetch appointments");

      const appointmentsList = Array.isArray(result.data) ? result.data : [];

      // Generate signed URLs for all patient passports simultaneously
      const appointmentsWithSignedUrls = await Promise.all(
        appointmentsList.map(async (appointment: any) => {
          // Check if the appointment has a patient object and a passport path
          const passportPath = appointment.patient?.passport_url;

          return {
            ...appointment,
            patient: appointment.patient
              ? {
                  ...appointment.patient,
                  passport_signed_url: passportPath
                    ? await getSignedUrl("passports", passportPath)
                    : null,
                }
              : null,
          };
        }),
      );

      setAppointments(appointmentsWithSignedUrls);
    } catch (err: any) {
      setError(err.message || "Failed to fetch appointments");
    } finally {
      setIsLoading(false);
    }
  }, [options?.patient_id, options?.status, options?.upcoming]);

  // Returns available slots across multiple days — used in date pickers
  const fetchAvailableSlotsRange = useCallback(
    async (
      serviceId?: string,
      days = 7,
      clinicianId?: string,
    ): Promise<DayAvailableSlots[]> => {
      try {
        const params = new URLSearchParams();
        params.set("days", String(days));
        if (serviceId) params.set("service_id", serviceId);
        if (clinicianId) params.set("clinician_id", clinicianId);

        const response = await fetch(
          `/api/appointments/available-slots?${params.toString()}`,
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Failed to fetch available dates");
        return Array.isArray(result.data) ? result.data : [];
      } catch {
        return [];
      }
    },
    [],
  );

  // Returns time slots for a single date — used after a date is selected
  const fetchAvailableSlotsForDate = useCallback(
    async (
      date: string,
      serviceId?: string,
      clinicianId?: string,
    ): Promise<AvailableSlot[]> => {
      try {
        const params = new URLSearchParams({ date });
        if (serviceId) params.set("service_id", serviceId);
        if (clinicianId) params.set("clinician_id", clinicianId);

        const response = await fetch(
          `/api/appointments/available-slots?${params.toString()}`,
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Failed to fetch available slots");
        return result.data?.slots || [];
      } catch {
        return [];
      }
    },
    [],
  );

  const bookAppointment = useCallback(
    async (payload: BookAppointmentPayload) => {
      setIsBooking(true);
      setError(null);
      try {
        const response = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Failed to book appointment");

        // Redirect to Paystack if a payment URL is returned
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return { success: true, redirecting: true, data: result.data };
        }

        toast.success("Appointment booked successfully!");
        await fetchAppointments();
        return { success: true, redirecting: false, data: result.data };
      } catch (err: any) {
        const msg = err.message || "Failed to book appointment";
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setIsBooking(false);
      }
    },
    [fetchAppointments],
  );

  const cancelAppointment = useCallback(
    async (id: string, reason?: string) => {
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "cancelled",
            cancellation_reason: reason || "Cancelled by patient",
          }),
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Failed to cancel appointment");
        toast.success("Appointment cancelled successfully.");
        await fetchAppointments();
        return { success: true };
      } catch (err: any) {
        const msg = err.message || "Failed to cancel appointment";
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [fetchAppointments],
  );

  // Shared PATCH helper used by all doctor actions below
  const patchAppointment = useCallback(
    async (
      id: string,
      body: Record<string, unknown>,
    ): Promise<DoctorPatchResult> => {
      setIsActing(true);
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Update failed");

        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, ...result.data } : apt)),
        );
        return { success: true, data: result.data };
      } catch (err: any) {
        return { success: false, error: err.message || "Update failed" };
      } finally {
        setIsActing(false);
      }
    },
    [],
  );

  const approveAppointment = useCallback(
    async (id: string, meetingLink: string): Promise<DoctorPatchResult> => {
      const result = await patchAppointment(id, {
        status: "confirmed",
        meeting_link: meetingLink,
      });
      if (result.success) toast.success("Appointment confirmed.");
      else toast.error(result.error || "Failed to confirm appointment");
      return result;
    },
    [patchAppointment],
  );

  const declineAppointment = useCallback(
    async (id: string, reason: string): Promise<DoctorPatchResult> => {
      const result = await patchAppointment(id, {
        status: "declined",
        cancellation_reason: reason,
      });
      if (result.success) toast.success("Appointment declined.");
      else toast.error(result.error || "Failed to decline appointment");
      return result;
    },
    [patchAppointment],
  );

  const rescheduleAppointment = useCallback(
    async (id: string, scheduledAt: string): Promise<DoctorPatchResult> => {
      const result = await patchAppointment(id, {
        scheduled_at: scheduledAt,
        status: "confirmed",
      });
      if (result.success) toast.success("Appointment rescheduled.");
      else toast.error(result.error || "Failed to reschedule appointment");
      return result;
    },
    [patchAppointment],
  );

  const updateMeetingLink = useCallback(
    async (id: string, meetingLink: string): Promise<DoctorPatchResult> => {
      const result = await patchAppointment(id, { meeting_link: meetingLink });
      if (result.success) toast.success("Meeting link updated.");
      else toast.error(result.error || "Failed to update meeting link");
      return result;
    },
    [patchAppointment],
  );

  const completeAppointment = useCallback(
    async (
      id: string,
      completionNote: string,
      completionNoteId?: string,
    ): Promise<DoctorPatchResult> => {
      const body: Record<string, unknown> = {
        status: "completed",
        completion_note: completionNote,
      };
      if (completionNoteId) body.completion_note_id = completionNoteId;
      const result = await patchAppointment(id, body);
      if (result.success)
        toast.success("Consultation completed and notes saved.");
      else toast.error(result.error || "Failed to complete appointment");
      return result;
    },
    [patchAppointment],
  );

  const markAsMissed = useCallback(
    async (id: string): Promise<DoctorPatchResult> => {
      const result = await patchAppointment(id, { status: "missed" });
      if (result.success) toast.success("Appointment marked as missed.");
      else toast.error(result.error || "Failed to mark as missed");
      return result;
    },
    [patchAppointment],
  );

  useEffect(() => {
    if (options?.autoFetch !== false) fetchAppointments();
  }, [fetchAppointments, options?.autoFetch]);

  return {
    appointments,
    isLoading,
    isBooking,
    isActing,
    error,
    fetchAppointments,
    fetchAvailableSlotsRange,
    fetchAvailableSlotsForDate,
    bookAppointment,
    cancelAppointment,
    patchAppointment,
    approveAppointment,
    declineAppointment,
    rescheduleAppointment,
    updateMeetingLink,
    completeAppointment,
    markAsMissed,
  };
}
