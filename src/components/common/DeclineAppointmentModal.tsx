'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ThumbsDown, Loader2 } from 'lucide-react';
import type { AppointmentData } from './AppointmentDetailsModal';

interface DeclineAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onDecline: (id: string, reason: string) => Promise<{ success: boolean }>;
  onAppointmentUpdated?: () => void;
}

export function DeclineAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onDecline,
  onAppointmentUpdated,
}: DeclineAppointmentModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSubmitting(true);
    const result = await onDecline(appointment!.id, reason.trim());
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
            <h2 className="text-xl font-bold text-gray-900">Decline Appointment</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Warning banner */}
          <div className="bg-[#ffdfdf] border border-[#f80400]/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#f80400] shrink-0 mt-0.5" />
            <p className="text-sm text-[#041544] font-medium leading-relaxed">
              Declining will notify the patient and release the time slot. Please provide a clear reason.
            </p>
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

          {/* Reason textarea */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Reason for Declining <span className="text-[#f80400]">*</span>
            </label>
            <textarea
              required
              rows={4}
              maxLength={400}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Requested specialist care requires a cardiologist. Recommending specialist referral."
              className="w-full p-4 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f80400]/20 focus:border-[#f80400] transition-all resize-none"
            />
            <div className="text-right text-xs font-medium text-gray-400">
              {reason.length}/400
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-[#f3f4f6] text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer text-center disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-[#f80400] text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {isSubmitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ThumbsDown className="h-4 w-4" />}
              {isSubmitting ? 'Declining...' : 'Decline Appointment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
