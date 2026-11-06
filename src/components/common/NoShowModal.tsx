'use client';

import React, { useState, useEffect } from 'react';
import { X, UserX, Loader2 } from 'lucide-react';
import type { AppointmentData } from './AppointmentDetailsModal';

interface NoShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onMarkMissed: (id: string) => Promise<{ success: boolean }>;
  onAppointmentUpdated?: () => void;
}

export function NoShowModal({
  isOpen,
  onClose,
  appointment,
  onMarkMissed,
  onAppointmentUpdated,
}: NoShowModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setIsSubmitting(false);
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  async function handleConfirm() {
    setIsSubmitting(true);
    const result = await onMarkMissed(appointment!.id);
    setIsSubmitting(false);
    if (result.success) {
      onAppointmentUpdated?.();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Mark as No-Show</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              {appointment.patientName} · {appointment.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Warning banner */}
          <div className="bg-[#e7eeff] border border-[#0149ff]/20 rounded-2xl p-4 flex items-start gap-3">
            <UserX className="h-5 w-5 text-[#0149ff] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#041544]">Patient did not show up</p>
              <p className="text-sm text-[#041544]/70 font-medium leading-relaxed mt-0.5">
                This will mark the appointment as <strong>missed</strong>. The time slot will be released and the patient will be notified.
              </p>
            </div>
          </div>

          {/* Appointment summary */}
          <div className="bg-[#f4f4f5] rounded-2xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Patient</span>
              <span className="font-semibold text-gray-900">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold text-gray-900">{appointment.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Scheduled</span>
              <span className="font-semibold text-gray-900">{appointment.date} · {appointment.time}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-[#f3f4f6] text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer text-center disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-[#f80400] text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {isSubmitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <UserX className="h-4 w-4" />}
              {isSubmitting ? 'Marking...' : 'Mark as Missed'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
