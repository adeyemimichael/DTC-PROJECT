'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, CheckCircle2, Loader2, FileText } from 'lucide-react';
import type { AppointmentData } from './AppointmentDetailsModal';

interface CompleteAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onComplete: (id: string, note: string, noteId?: string) => Promise<{ success: boolean }>;
  onAppointmentUpdated?: () => void;
}

export function CompleteAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onComplete,
  onAppointmentUpdated,
}: CompleteAppointmentModalProps) {
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setUploadedFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!notes.trim()) return;
    setIsSubmitting(true);
    const result = await onComplete(appointment!.id, notes.trim());
    setIsSubmitting(false);
    if (result.success) {
      onAppointmentUpdated?.();
      onClose();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadedFile(e.target.files?.[0] ?? null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 my-6 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Complete Consultation</h2>
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

          {/* Consultation notes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Consultation Notes <span className="text-[#f80400]">*</span>
            </label>
            <textarea
              required
              rows={5}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter diagnosis, treatment plan, prescriptions, and follow-up recommendations..."
              className="w-full p-4 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0149ff]/20 focus:border-[#0149ff] transition-all resize-none"
            />
            <div className="text-right text-xs font-medium text-gray-400">
              {notes.length}/1000
            </div>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Attach Medical Record{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Lab results, imaging scans, prescriptions or clinical notes. PDF, JPG, PNG — max 25 MB.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-[#0149ff] rounded-2xl p-5 flex flex-col items-center justify-center gap-2.5 bg-gray-50/50 hover:bg-blue-50/20 transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />

              {uploadedFile ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#0149ff] flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-blue-100/70 text-gray-500 group-hover:text-[#0149ff] flex items-center justify-center transition-colors">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold text-gray-800 block">
                      Drag & drop or click to browse
                    </span>
                    <span className="text-xs font-semibold text-gray-400 block mt-0.5">
                      PDF, JPG, PNG · max 25 MB
                    </span>
                  </div>
                </>
              )}
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
              disabled={isSubmitting || !notes.trim()}
              className="flex-1 py-3.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
            >
              {isSubmitting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CheckCircle2 className="h-4 w-4" />}
              {isSubmitting ? 'Saving...' : 'Save & Complete'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
