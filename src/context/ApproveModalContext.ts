'use client';

import { createContext, useContext } from 'react';
import type { AppointmentData } from '@/components/common/AppointmentDetailsModal';

export type OpenApproveModal = (
  appointment: AppointmentData,
  onApprove: (id: string, link: string) => Promise<{ success: boolean }>,
  onApproved?: () => void,
) => void;

export const ApproveModalContext = createContext<OpenApproveModal>(() => {});

export function useApproveModal(): OpenApproveModal {
  return useContext(ApproveModalContext);
}
