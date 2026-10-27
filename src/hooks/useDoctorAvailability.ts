import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DayAvailability {
  day: string;
  day_of_week?: number;
  active: boolean;
  slots: TimeSlot[];
}

export function useDoctorAvailability(clinicianId?: string) {
  const [availability, setAvailability] = useState<DayAvailability[]>([
    {
      day: 'Monday',
      day_of_week: 1,
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Tuesday',
      day_of_week: 2,
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Wednesday',
      day_of_week: 3,
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Thursday',
      day_of_week: 4,
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Friday',
      day_of_week: 5,
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Saturday',
      day_of_week: 6,
      active: false,
      slots: [],
    },
    {
      day: 'Sunday',
      day_of_week: 0,
      active: false,
      slots: [],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = clinicianId
        ? `/api/appointments/availability?clinician_id=${encodeURIComponent(clinicianId)}`
        : '/api/appointments/availability';

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch availability schedule');
      }

      if (Array.isArray(result.data) && result.data.length > 0) {
        setAvailability(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setError(err.message || 'Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [clinicianId]);

  const saveAvailability = useCallback(
    async (updatedSchedule: DayAvailability[]) => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await fetch('/api/appointments/availability', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedule: updatedSchedule,
            clinician_id: clinicianId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to save availability');
        }

        setAvailability(updatedSchedule);
        toast.success('Weekly schedule updated successfully!');
        return { success: true };
      } catch (err: any) {
        console.error('Error saving availability:', err);
        const msg = err.message || 'Failed to save availability';
        setError(msg);
        toast.error(msg);
        return { success: false, error: msg };
      } finally {
        setIsSaving(false);
      }
    },
    [clinicianId],
  );

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    availability,
    setAvailability,
    isLoading,
    isSaving,
    error,
    fetchAvailability,
    saveAvailability,
  };
}

