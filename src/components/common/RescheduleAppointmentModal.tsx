'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader2, RefreshCw } from 'lucide-react';
import type { AppointmentData } from './AppointmentDetailsModal';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onReschedule: (id: string, scheduledAt: string) => Promise<{ success: boolean }>;
  onAppointmentUpdated?: () => void;
}

export function RescheduleAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onReschedule,
  onAppointmentUpdated,
}: RescheduleAppointmentModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      setDate(tmrw.toISOString().split('T')[0]);
      setTime('09:00');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) return;

    const [hours, minutes] = time.split(':');
    const scheduledDate = new Date(`${date}T${hours || '09'}:${minutes || '00'}:00`);
    if (isNaN(scheduledDate.getTime())) return;

    setIsSubmitting(true);
    const result = await onReschedule(appointment!.id, scheduledDate.toISOString());
    setIsSubmitting(false);
    if (result.success) {
      onAppointmentUpdated?.();
      onClose();
    }
  }

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              {appointment.patientName}
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
          {/* Current appointment info */}
          <div className="bg-[#f4f4f5] rounded-2xl p-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span className="font-semibold text-gray-900">{appointment.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Previously Scheduled</span>
              <span className="font-semibold text-gray-900">{appointment.date} · {appointment.time}</span>
            </div>
            {appointment.cancellationReason && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs font-semibold text-rose-600 block">Cancellation / Decline Reason:</span>
                <span className="text-xs text-gray-700">{appointment.cancellationReason}</span>
              </div>
            )}
          </div>

          {/* New Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              New Date <span className="text-primary-red">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
              />
            </div>
          </div>

          {/* New Time */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              New Time <span className="text-primary-red">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                required
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
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
              disabled={isSubmitting || !date || !time}
              className="flex-1 py-3.5 rounded-2xl bg-primary-blue text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {isSubmitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <RefreshCw className="h-4 w-4" />}
              {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
