import { useCallback, useEffect, useState } from 'react';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceInput {
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  currency?: string;
  is_active?: boolean;
}

export type ServiceResult = { success: boolean; error?: string };


export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoadingServices(true);
    setServicesError(null);

    try {
      const response = await fetch('/api/services', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch services');
      }

      setServices(Array.isArray(result.data) ? result.data : []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch services';
      setServicesError(message);
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  }, []);

  const createService = useCallback(
    async (input: ServiceInput): Promise<ServiceResult> => {
      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to create service' };
        }

        await fetchServices();
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to create service';
        return { success: false, error: message };
      }
    },
    [fetchServices],
  );

  const updateService = useCallback(
    async (id: string, patch: Partial<ServiceInput>): Promise<ServiceResult> => {
      try {
        const response = await fetch(`/api/services?id=${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to update service' };
        }

        await fetchServices();
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to update service';
        return { success: false, error: message };
      }
    },
    [fetchServices],
  );

  const deleteService = useCallback(
    async (id: string): Promise<ServiceResult> => {
      try {
        const response = await fetch(
          `/api/services?id=${encodeURIComponent(id)}`,
          { method: 'DELETE' },
        );

        const result = await response.json();

        if (!response.ok) {
          return { success: false, error: result.error || 'Failed to delete service' };
        }

        await fetchServices();
        return { success: true };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete service';
        return { success: false, error: message };
      }
    },
    [fetchServices],
  );

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  return {
    services,
    isLoadingServices,
    servicesError,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
}
