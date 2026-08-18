'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Phone,
  Mail,
  Video,
  UploadCloud,
  FileText,
  Printer,
  User,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export interface AppointmentData {
  id: string;
  patientName: string;
  age: string;
  gender: string;
  bloodType: string;
  avatar: string;
  date: string;
  time: string;
  duration: string;
  room: string;
  isVirtual?: boolean;
  meetLink?: string;
  type: string;
  patientId: string;
  reason: string;
  knownConditions?: string[];
  phone: string;
  email: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  consultationNotes?: string;
  doctorName?: string;
  completedDate?: string;
  medicalFile?: {
    name: string;
    type: string;
    date: string;
    doctor: string;
  };
}

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onUpdateAppointment?: (updated: AppointmentData) => void;
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onUpdateAppointment,
}: AppointmentDetailsModalProps) {
  const [currentModalStep, setCurrentModalStep] = useState<
    'overview' | 'complete_form'
  >('overview');

  const [notesText, setNotesText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Sync state when modal opens or appointment changes
  useEffect(() => {
    if (appointment) {
      setCurrentModalStep('overview');
      setNotesText(appointment.consultationNotes || '');
      setUploadedFileName(appointment.medicalFile?.name || null);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleStartAppointment = () => {
    const updated: AppointmentData = {
      ...appointment,
      status: 'in_progress',
    };
    if (onUpdateAppointment) onUpdateAppointment(updated);
  };

  const handleOpenCompleteForm = () => {
    setCurrentModalStep('complete_form');
  };

  const handleSaveAndComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppointmentData = {
      ...appointment,
      status: 'completed',
      consultationNotes:
        notesText.trim() ||
        'TSH levels normalized. Continue current levothyroxine dosage. Patient reports improved energy levels.',
      doctorName: appointment.doctorName || 'Dr. Stephen Adeyemi',
      completedDate:
        appointment.completedDate ||
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      medicalFile: uploadedFileName
        ? {
            name: uploadedFileName,
            type: 'Lab Result',
            date: new Date().toISOString().split('T')[0],
            doctor: appointment.doctorName || 'Dr. Stephen Adeyemi',
          }
        : appointment.medicalFile ,
    };

    if (onUpdateAppointment) onUpdateAppointment(updated);
    setCurrentModalStep('overview');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const meetUrl =
    appointment.meetLink;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 lg:p-8 shadow-2xl relative border border-gray-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* STEP 1: OVERVIEW MODAL  */}
        {currentModalStep === 'overview' && (
          <div className="space-y-6">
            {/* Header Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Appointment Details
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {appointment.date || 'Saturday, July 18, 2026'}
              </p>
            </div>

            {/* Patient Info Banner */}
            <div className="bg-[#f4f4f5] rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-200">
                  <Image
                    src={appointment.avatar}
                    alt={appointment.patientName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {appointment.patientName}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                    {appointment.age} years · {appointment.gender} Blood:{' '}
                    {appointment.bloodType}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {appointment.status === 'upcoming' && (
                  <span className="bg-[#fee2e2] text-[#ef4444] text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                    Upcoming
                  </span>
                )}
                {appointment.status === 'in_progress' && (
                  <span className="bg-[#e0e7ff] text-[#4f46e5] text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                    In Progress
                  </span>
                )}
                {appointment.status === 'completed' && (
                  <span className="bg-[#e6f4ea] text-[#1e8e3e] text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                    Completed
                  </span>
                )}
              </div>
            </div>

            {/* 2x2 Grid Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f4f4f5] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  TIME
                </span>
                <p className="text-base font-bold text-gray-900">
                  {appointment.time}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {appointment.duration}
                </p>
              </div>

              <div className="bg-[#f4f4f5] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  ROOM
                </span>
                <p className="text-base font-bold text-gray-900">
                  {appointment.room}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {appointment.isVirtual ? 'Virtual' : 'In-person'}
                </p>
              </div>

              <div className="bg-[#f4f4f5] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  TYPE
                </span>
                <p className="text-base font-bold text-gray-900 truncate">
                  {appointment.type}
                </p>
              </div>

              <div className="bg-[#f4f4f5] rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  PATIENT ID
                </span>
                <p className="text-base font-bold text-gray-900">
                  {appointment.patientId}
                </p>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="space-y-2">
              <h4 className="text-base font-bold text-gray-900">
                Reason for Visit
              </h4>
              <div className="bg-[#f4f4f5] rounded-2xl p-4 text-sm font-medium text-gray-700 leading-relaxed">
                {appointment.reason}
              </div>
            </div>

            {/* Google Meet Link Section  */}
            {(appointment.isVirtual ||
              appointment.type.toLowerCase().includes('telemedicine') ||
              appointment.status === 'in_progress') && (
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#0149ff] text-white flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Google Meet Link
                    </span>
                    <a
                      href={meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-sans text-primary-blue truncate hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span className="truncate">{meetUrl}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                </div>

                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-primary-blue font-bold text-sm rounded-2xl border border-primary-blue hover:bg-primary-blue/10 transition-colors text-center"
                >
                  Join Meeting
                </a>
              </div>
            )}

            {/* Known Conditions (If not completed) */}
            {appointment.status !== 'completed' &&
              appointment.knownConditions &&
              appointment.knownConditions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-gray-900">
                    Known Conditions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {appointment.knownConditions.map((cond, i) => (
                      <span
                        key={i}
                        className="bg-[#e8f0fe] text-[#1a73e8] text-xs font-semibold px-4 py-2 rounded-full"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Contact Information (If not completed) */}
            {appointment.status !== 'completed' && (
              <div className="space-y-2.5 pt-1 border-t border-gray-100">
                <h4 className="text-base font-bold text-gray-900">
                  Contact Information
                </h4>
                <div className="space-y-2 text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{appointment.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{appointment.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Completed State: Consultation Notes & Medical File */}
            {appointment.status === 'completed' && (
              <>
                {/* Consultation Notes Card */}
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-gray-900">
                    Consultation Notes
                  </h4>
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 space-y-3">
                    <p className="text-sm font-medium text-gray-800 leading-relaxed italic">
                      &quot;
                      {appointment.consultationNotes ||
                        'TSH levels normalized. Continue current levothyroxine dosage. Patient reports improved energy levels.'}
                      &quot;
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-[#16a34a]">
                      <User className="h-3.5 w-3.5" />
                      <span>
                        {appointment.doctorName || 'Dr. Stephen Adeyemi'} ·{' '}
                        {appointment.completedDate || 'May 30, 2026'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medical File Card */}
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-gray-900">
                    Medical File
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-gray-900 truncate">
                          {appointment.medicalFile?.name || 'Lipid Panel'}
                        </h5>
                        <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                          {appointment.medicalFile?.type || 'Lab Result'} ·{' '}
                          {appointment.medicalFile?.date || '2026-05-18'} ·{' '}
                          {appointment.medicalFile?.doctor ||
                            'Dr. Stephen Adeyemi'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => alert('Downloading medical file...')}
                      className="h-9 w-9 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                      title="Download/Print File"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Bottom Primary Action Button */}
            <div className="pt-4 border-t border-gray-100">
              {appointment.status === 'upcoming' && (
                <button
                  onClick={handleStartAppointment}
                  className="w-full py-4 rounded-2xl bg-[#f80400] text-white font-bold text-base hover:opacity-90 transition-all cursor-pointer shadow-md text-center"
                >
                  Start Appointment
                </button>
              )}

              {appointment.status === 'in_progress' && (
                <button
                  onClick={handleOpenCompleteForm}
                  className="w-full py-4 rounded-2xl bg-[#0149ff] text-white font-bold text-base hover:opacity-90 transition-all cursor-pointer shadow-md text-center"
                >
                  Complete Appointment
                </button>
              )}
            </div>
          </div>
        )}

        {/* ----------------- STEP 2: COMPLETE APPOINTMENT FORM ----------------- */}
        {currentModalStep === 'complete_form' && (
          <form onSubmit={handleSaveAndComplete} className="space-y-6">
            {/* Header */}
            <div className="pb-3 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                Complete Appointment
              </h2>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Add consultation notes before marking as completed.
              </p>
            </div>

            {/* Consultation Notes Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Consultation Notes <span className="text-gray-400 font-normal">(required)</span>
              </label>
              <textarea
                required
                maxLength={500}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder="Enter diagnosis, treatment plan, prescriptions, and follow-up recommendations..."
                className="w-full h-36 p-4 rounded-2xl border border-gray-200 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0149ff]/20 focus:border-[#0149ff] transition-all resize-none"
              />
              <div className="text-right text-xs font-medium text-gray-400">
                {notesText.length}/500
              </div>
            </div>

            {/* Upload Medical Record Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Upload Medical Record <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Upload your medical documents — lab results, imaging scans, prescriptions, or clinical notes. Supported formats: PDF, JPG, PNG, DICOM (max 25 MB).
              </p>

              <label className="border-2 border-dashed border-gray-200 hover:border-[#0149ff] rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 bg-gray-50/50 hover:bg-blue-50/20 transition-all cursor-pointer group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.dicom"
                  className="hidden"
                />
                <div className="h-12 w-12 rounded-full bg-gray-100 group-hover:bg-blue-100/70 text-gray-500 group-hover:text-[#0149ff] flex items-center justify-center transition-colors">
                  <UploadCloud className="h-6 w-6" />
                </div>

                <div className="text-center">
                  <span className="text-sm font-bold text-gray-800 block">
                    {uploadedFileName || 'Drag & drop your file here'}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 block mt-0.5">
                    or click to browse files
                  </span>
                </div>
              </label>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCurrentModalStep('overview')}
                className="flex-1 py-3.5 rounded-2xl bg-[#f3f4f6] text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-sm transition-colors cursor-pointer text-center shadow-md"
              >
                Save & Complete
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
