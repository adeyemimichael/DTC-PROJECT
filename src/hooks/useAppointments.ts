import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import type {
  Appointment,
  AvailableSlot,
  DayAvailableSlots,
} from '@/lib/types/appointment';

export interface BookAppointmentPayload {
  service_id: string;
  scheduled_at: string;
  reason?: string;
  patient_upload_id?: string;
  clinician_id?: string;
  callback_url?: string;
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
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch appointments list
  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.patient_id) params.set('patient_id', options.patient_id);
      if (options?.status) params.set('status', options.status);
      if (options?.upcoming) params.set('upcoming', 'true');

      const url = `/api/appointments${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch appointments');
      }

      setAppointments(Array.isArray(result.data) ? result.data : []);
    } catch (err: any) {
      console.error('Fetch appointments error:', err);
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  }, [options?.patient_id, options?.status, options?.upcoming]);

  // 2. Fetch available slots for next N days (default 7)
  const fetchAvailableSlotsRange = useCallback(
    async (serviceId?: string, days = 7, clinicianId?: string): Promise<DayAvailableSlots[]> => {
      try {
        const params = new URLSearchParams();
        params.set('days', String(days));
        if (serviceId) params.set('service_id', serviceId);
        if (clinicianId) params.set('clinician_id', clinicianId);

        const response = await fetch(`/api/appointments/available-slots?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch available dates');
        }

        return Array.isArray(result.data) ? result.data : [];
      } catch (err: any) {
        console.error('Fetch slots range error:', err);
        return [];
      }
    },
    [],
  );

  // 3. Fetch slots for a single date
  const fetchAvailableSlotsForDate = useCallback(
    async (
      date: string,
      serviceId?: string,
      clinicianId?: string,
    ): Promise<AvailableSlot[]> => {
      try {
        const params = new URLSearchParams({ date });
        if (serviceId) params.set('service_id', serviceId);
        if (clinicianId) params.set('clinician_id', clinicianId);

        const response = await fetch(`/api/appointments/available-slots?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch available slots');
        }

        return result.data?.slots || [];
      } catch (err: any) {
        console.error('Fetch slots for date error:', err);
        return [];
      }
    },
    [],
  );

  // 4. Book an appointment
  const bookAppointment = useCallback(
    async (payload: BookAppointmentPayload) => {
      setIsBooking(true);
      setError(null);

      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to book appointment');
        }

        // If Paystack payment URL is returned, redirect
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
          return { success: true, redirecting: true, data: result.data };
        }

        toast.success('Appointment booked successfully!');
        await fetchAppointments();
        return { success: true, redirecting: false, data: result.data };
      } catch (err: any) {
        console.error('Booking error:', err);
        const msg = err.message || 'Failed to book appointment';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setIsBooking(false);
      }
    },
    [fetchAppointments],
  );

  // 5. Cancel an appointment
  const cancelAppointment = useCallback(
    async (id: string, reason?: string) => {
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'cancelled',
            cancellation_reason: reason || 'Cancelled by patient',
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to cancel appointment');
        }

        toast.success('Appointment cancelled successfully.');
        await fetchAppointments();
        return { success: true };
      } catch (err: any) {
        console.error('Cancellation error:', err);
        const msg = err.message || 'Failed to cancel appointment';
        toast.error(msg);
        return { success: false, error: msg };
      }
    },
    [fetchAppointments],
  );

  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchAppointments();
    }
  }, [fetchAppointments, options?.autoFetch]);

  return {
    appointments,
    isLoading,
    isBooking,
    error,
    fetchAppointments,
    fetchAvailableSlotsRange,
    fetchAvailableSlotsForDate,
    bookAppointment,
    cancelAppointment,
  };
}

