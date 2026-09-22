import { useState, useEffect, useCallback } from 'react';

export interface VitalRecord {
  id: string;
  patient_id: string;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate_bpm: number;
  temperature_c: number;
  weight_kg: number;
  height_cm?: number | null;
  spo2_percent?: number | null;
  blood_sugar_mmol?: number | null;
  notes?: string | null;
  recorded_at: string;
}

export interface CreateVitalInput {
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
  heart_rate_bpm: number;
  temperature_c: number;
  weight_kg: number;
  height_cm?: number | null;
  spo2_percent?: number | null;
  blood_sugar_mmol?: number | null;
  notes?: string | null;
}

export function useVitals() {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vitals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch vitals');
      }

      setVitals(result.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while fetching vitals';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVital = async (input: CreateVitalInput): Promise<{ success: boolean; data?: VitalRecord; error?: string }> => {
    try {
      const response = await fetch('/api/vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to record vitals' };
      }

      const newRecord: VitalRecord = result.data;
      setVitals((prev) => [newRecord, ...prev]);
      return { success: true, data: newRecord };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while recording vitals';
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const latestVital = vitals.length > 0 ? vitals[0] : null;
  const hasVitals = vitals.length > 0;

  return {
    vitals,
    latestVital,
    hasVitals,
    isLoading,
    error,
    fetchVitals,
    createVital,
  };
}
