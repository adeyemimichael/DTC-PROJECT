'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
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
    /* Backdrop — exact same pattern as BookAppointmentModal */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">

      {/* Click-outside-to-close — same as BookAppointmentModal */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      {/* Modal Card — same sizing, rounding, shadow, entrance animation */}
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-8 duration-300">

        {/* Header — same layout as BookAppointmentModal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-primary-deepblue">Confirm Appointment</h3>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              {appointment.patientName} · {appointment.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-primary-deepblue hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content — same as BookAppointmentModal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Appointment summary card */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Patient</span>
              <span className="font-semibold text-primary-deepblue">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Service</span>
              <span className="font-semibold text-primary-deepblue">{appointment.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Scheduled</span>
              <span className="font-semibold text-primary-deepblue">
                {appointment.date} · {appointment.time}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 font-medium">Duration</span>
              <span className="font-semibold text-primary-deepblue">{appointment.duration}</span>
            </div>
          </div>

          {/* Meeting link input */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Google Meet / Zoom Link <span className="text-primary-red">*</span>
                </label>
                {!meetingLink && (
                  <button
                    type="button"
                    onClick={() => setMeetingLink('https://meet.google.com/dr-stephen-consult')}
                    className="text-xs font-semibold text-primary-blue hover:underline cursor-pointer"
                  >
                    Use default link
                  </button>
                )}
              </div>
              <div className="relative">
                <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  required
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all bg-white"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                The patient will receive this link to join the consultation.
              </p>
            </div>

            {/* Actions — Cancel is plain text, Confirm uses the reusable Button + btn-primary */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-center disabled:opacity-50"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting || !meetingLink.trim()}
                className="flex-1 btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                {isSubmitting
                  ? <Loader2 className="h-4 w-4 animate-spin text-white" />
                  : <CheckCircle2 className="h-4 w-4" />}
                {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
