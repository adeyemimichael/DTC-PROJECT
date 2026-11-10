'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, CheckCircle2, Loader2 } from 'lucide-react';
import type { AppointmentData } from './AppointmentDetailsModal';

interface ApproveAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onApprove: (id: string, meetingLink: string) => Promise<{ success: boolean }>;
  onAppointmentUpdated?: () => void;
}

export function ApproveAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onApprove,
  onAppointmentUpdated,
}: ApproveAppointmentModalProps) {
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMeetingLink(appointment?.meetLink || '');
      setIsSubmitting(false);
    }
  }, [isOpen, appointment?.meetLink]);

  if (!isOpen || !appointment) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!meetingLink.trim()) return;
    setIsSubmitting(true);
    const result = await onApprove(appointment!.id, meetingLink.trim());
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
            <h2 className="text-xl font-bold text-gray-900">Confirm Appointment</h2>
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

          {/* Meeting link input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-900">
                Google Meet / Zoom Link <span className="text-[#f80400]">*</span>
              </label>
              {!meetingLink && (
                <button
                  type="button"
                  onClick={() => setMeetingLink('https://meet.google.com/dr-stephen-consult')}
                  className="text-xs font-semibold text-[#0149ff] hover:underline cursor-pointer"
                >
                  Use default link
                </button>
              )}
            </div>
            <div className="relative">
              <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0149ff]/20 focus:border-[#0149ff] transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 font-medium">
              The patient will receive this link to join the consultation.
            </p>
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
              disabled={isSubmitting || !meetingLink.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-[#0149ff] text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {isSubmitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />}
              {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
