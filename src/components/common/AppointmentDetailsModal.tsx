"use client";
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Phone,
  Mail,
  Video,
  FileText,
  Printer,
  User,
  ExternalLink,
  CheckCircle2,
  Link2,
  Loader2,
  Activity,
  AlertTriangle,
} from "lucide-react";

import type { AppointmentStatus } from "@/lib/types/appointment";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppointmentData {
  id: string;
  patientName: string;
  age: string | number;
  gender: string;
  bloodType: string;
  avatar: string;
  date: string;
  time: string;
  duration: string;
  room: string;
  isVirtual?: boolean;
  patientUploadId?: string;
  meetLink?: string;
  type: string;
  patientId: string; // Truncated display ID shown in the UI
  rawPatientId: string; // Full UUID used for API calls (vitals, documents)
  reason: string;
  knownConditions?: string[];
  phone: string;
  email: string;
  status:
    | "pending"
    | "upcoming"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "declined";
  rawStatus?: AppointmentStatus;
  cancellationReason?: string;
  cancelledBy?: string;
  scheduledAt?: string;
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

interface VitalRecord {
  id: string;
  recorded_at: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate_bpm?: number;
  temperature_c?: number;
  weight_kg?: number;
  blood_sugar_mmol?: number;
}

interface MedicalDocument {
  id: string;
  title: string;
  category: string;
  created_at: string;
  pdf_storage_path: string;
  clinician?: { full_name: string };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentData | null;
  onUpdateAppointment?: (updated: AppointmentData) => void;
  // Callbacks that open the separate action modals
  onOpenApprove?: () => void;
  onOpenDecline?: () => void;
  onOpenCancel?: () => void;
  onOpenReschedule?: () => void;
  onOpenComplete?: () => void;
  onOpenNoShow?: () => void;
  // Inline update link (no separate modal needed — small inline action)
  onUpdateMeetingLink?: (
    id: string,
    link: string,
  ) => Promise<{ success: boolean }>;
  onAppointmentUpdated?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onUpdateAppointment,
  onOpenApprove,
  onOpenDecline,
  onOpenCancel,
  onOpenReschedule,
  onOpenComplete,
  onOpenNoShow,
  onUpdateMeetingLink,
  onAppointmentUpdated,
}: AppointmentDetailsModalProps) {
  // Inline edit-link state (shown right beside the Join Meeting button)
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [editLink, setEditLink] = useState("");
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Vitals and medical documents — fetched when the modal opens
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [patientUpload, setPatientUpload] = useState<any>(null);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingPatientUpload, setIsLoadingPatientUpload] = useState(false);

  useEffect(() => {
    if (appointment && isOpen) {
      setIsEditingLink(false);
      setEditLink(appointment.meetLink || "");

      // Fetch vitals for this patient
      setIsLoadingVitals(true);
      fetch(`/api/patients/vitals?patient_id=${appointment.rawPatientId}`)
        .then((r) => r.json())
        .then((res) => setVitals(Array.isArray(res.data) ? res.data : []))
        .catch(() => setVitals([]))
        .finally(() => setIsLoadingVitals(false));

      // Fetch medical documents for this patient
      setIsLoadingDocs(true);
      fetch(
        `/api/patients/medical-documents?patient_id=${appointment.rawPatientId}`,
      )
        .then((r) => r.json())
        .then((res) => setDocuments(Array.isArray(res.data) ? res.data : []))
        .catch(() => setDocuments([]))
        .finally(() => setIsLoadingDocs(false));

      // Fetch patient upload for this appointment
      if (appointment.patientUploadId) {
        setIsLoadingPatientUpload(true);
        fetch(`/api/patients/uploads?id=${appointment.patientUploadId}`)
          .then((r) => r.json())
          .then((res) => {
            setPatientUpload(res.data);
          })
          .catch(() => setPatientUpload(null))
          .finally(() => setIsLoadingPatientUpload(false));
      }
    }
  }, [appointment?.rawPatientId, isOpen]);

  if (!isOpen || !appointment) return null;

  // ── Inline meeting link save ────────────────────────────────────────────────
  async function handleSaveLink(e: React.FormEvent) {
    e.preventDefault();
    if (!editLink.trim() || !onUpdateMeetingLink || !appointment) return;
    setIsSavingLink(true);
    const result = await onUpdateMeetingLink(appointment.id, editLink.trim());
    setIsSavingLink(false);
    if (result.success) {
      setIsEditingLink(false);
      onAppointmentUpdated?.();
    }
  }

  const meetUrl = appointment.meetLink;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8 shadow-2xl relative border border-gray-100 my-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-6">
          {/* ── Header ── */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Appointment Details
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              {appointment.date || "Saturday, July 18, 2026"}
            </p>
          </div>

          {/* ── Patient Info Banner ── */}
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
                  {appointment.age} years · {appointment.gender} · Blood:{" "}
                  {appointment.bloodType}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              {(appointment.status === "pending" ||
                appointment.rawStatus === "pending_approval" ||
                appointment.rawStatus === "pending") && (
                <span className="bg-[#fef3c7] text-[#d97706] text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                  Pending Approval
                </span>
              )}
              {(appointment.status === "cancelled" ||
                appointment.rawStatus === "cancelled") && (
                <span className="bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                  Cancelled
                </span>
              )}
              {(appointment.status === "declined" ||
                appointment.rawStatus === "declined") && (
                <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                  Declined
                </span>
              )}
              {(appointment.status === "in_progress" ||
                appointment.rawStatus === "confirmed") && (
                <span className="bg-[#e0e7ff] text-[#4f46e5] text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                  Confirmed
                </span>
              )}
              {appointment.status === "upcoming" &&
                appointment.rawStatus !== "pending_approval" &&
                appointment.rawStatus !== "pending" &&
                appointment.rawStatus !== "confirmed" &&
                appointment.rawStatus !== "cancelled" &&
                appointment.rawStatus !== "declined" && (
                  <span className="bg-[#fee2e2] text-[#ef4444] text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                    Upcoming
                  </span>
                )}
              {appointment.status === "completed" && (
                <span className="bg-[#e6f4ea] text-[#1e8e3e] text-xs font-semibold px-3 py-1.5 rounded-lg inline-block">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* ── Cancellation / Decline Reason Banner ── */}
          {(appointment.status === "cancelled" ||
            appointment.status === "declined" ||
            appointment.rawStatus === "cancelled" ||
            appointment.rawStatus === "declined" ||
            appointment.cancellationReason) && (
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {appointment.status === "declined" ||
                  appointment.rawStatus === "declined"
                    ? "Appointment Declined"
                    : "Appointment Cancelled"}
                  {appointment.cancelledBy
                    ? ` by ${appointment.cancelledBy}`
                    : ""}
                </span>
              </div>
              <p className="text-sm text-gray-700 font-normal pl-6 leading-relaxed">
                {appointment.cancellationReason || "No reason specified."}
              </p>
            </div>
          )}

          {/* ── 2×2 Info Grid ── */}
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
                {appointment.isVirtual ? "Virtual" : "In-person"}
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

          {/* ── Reason for Visit ── */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-gray-900">
              Reason for Visit
            </h4>
            <div className="bg-[#f4f4f5] rounded-2xl p-4 text-sm font-medium text-gray-700 leading-relaxed">
              {appointment.reason}
            </div>
          </div>

          {/* ── Vitals & Medical Records ── */}
          <div className="space-y-5 pt-1 border-t border-gray-100">
            {/* Latest Vital Signs */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-500" />
                <h4 className="text-base font-bold text-gray-900">
                  Latest Vital Signs
                </h4>
              </div>

              {isLoadingVitals ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading vitals...
                </div>
              ) : vitals.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">
                  No vitals recorded yet.
                </p>
              ) : (
                <>
                  {/* Latest reading cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const latest = vitals[0];
                      const cards = [
                        {
                          label: "Blood Pressure",
                          value:
                            latest.blood_pressure_systolic &&
                            latest.blood_pressure_diastolic
                              ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`
                              : "—",
                          unit: "mmHg",
                        },
                        {
                          label: "Heart Rate",
                          value: latest.heart_rate_bpm ?? "—",
                          unit: "bpm",
                        },
                        {
                          label: "Weight",
                          value: latest.weight_kg ?? "—",
                          unit: "kg",
                        },
                        {
                          label: "Blood Sugar",
                          value: latest.blood_sugar_mmol ?? "—",
                          unit: "mmol/L",
                        },
                      ];
                      return cards.map((card) => (
                        <div
                          key={card.label}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="mb-2 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-semibold text-emerald-600">
                              Recorded
                            </span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {String(card.value)}
                            <span className="ml-1 text-xs font-medium text-gray-500">
                              {card.unit}
                            </span>
                          </p>
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            {card.label}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Vitals history table */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      <h4 className="text-base font-bold text-gray-900">
                        Vitals Tracking History
                      </h4>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500">
                          <tr>
                            <th className="px-3 py-2.5 font-semibold">Date</th>
                            <th className="px-3 py-2.5 font-semibold">
                              Weight
                            </th>
                            <th className="px-3 py-2.5 font-semibold">Temp</th>
                            <th className="px-3 py-2.5 font-semibold">HR</th>
                            <th className="px-3 py-2.5 font-semibold">BP</th>
                            <th className="px-3 py-2.5 font-semibold">Sugar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vitals.map((v, i) => (
                            <tr
                              key={v.id}
                              className={
                                i % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                              }
                            >
                              <td className="px-3 py-2.5 font-medium text-gray-700">
                                {new Date(v.recorded_at).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700">
                                {v.weight_kg ? `${v.weight_kg} kg` : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700">
                                {v.temperature_c ? `${v.temperature_c}°C` : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700">
                                {v.heart_rate_bpm
                                  ? `${v.heart_rate_bpm} bpm`
                                  : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700">
                                {v.blood_pressure_systolic &&
                                v.blood_pressure_diastolic
                                  ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}`
                                  : "—"}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700">
                                {v.blood_sugar_mmol
                                  ? `${v.blood_sugar_mmol} mmol`
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Medical Records */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <h4 className="text-base font-bold text-gray-900">
                  Medical Records
                </h4>
              </div>

              {isLoadingDocs ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading records...
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">
                  No medical documents uploaded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {doc.title}
                            <span className="ml-1 text-xs font-medium text-blue-600 capitalize">
                              {doc.category}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            {doc.clinician?.full_name
                              ? ` · ${doc.clinician.full_name}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/api/patients/medical-documents/${doc.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Patient Upload */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <h4 className="text-base font-bold text-gray-900">
                  Patient Upload
                </h4>
              </div>

              {isLoadingPatientUpload ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading patient upload...
                </div>
              ) : !patientUpload ? (
                <p className="text-sm text-gray-400 py-2">
                  No patient upload available for this appointment.
                </p>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {patientUpload.description}
                        <span className="ml-1 text-xs font-medium text-blue-600 capitalize">
                          {patientUpload.category}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(patientUpload.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/patients/uploads/${patientUpload.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    View
                  </a>
                </div>
              )}
            </section>
          </div>

          {/* ── Google Meet Link + inline Update Link ── */}
          {(appointment.isVirtual ||
            appointment.type.toLowerCase().includes("telemedicine") ||
            appointment.status === "in_progress") && (
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-4 space-y-3">
              {/* Link display row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#0149ff] text-white flex items-center justify-center shrink-0">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Google Meet Link
                    </span>
                    {meetUrl ? (
                      <a
                        href={meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-sans text-primary-blue truncate hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span className="truncate">{meetUrl}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium mt-0.5 block">
                        No link added yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Join + Update Link buttons side by side */}
                <div className="flex items-center gap-2 shrink-0">
                  {meetUrl && (
                    <a
                      href={meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 text-primary-blue font-bold text-sm rounded-2xl border border-primary-blue hover:bg-primary-blue/10 transition-colors text-center whitespace-nowrap"
                    >
                      Join Meeting
                    </a>
                  )}
                  {appointment.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => setIsEditingLink((v) => !v)}
                      className="px-4 py-2.5 bg-[#0149ff] text-white font-bold text-sm rounded-2xl hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Link2 className="h-4 w-4" />
                      {meetUrl ? "Update Link" : "Add Link"}
                    </button>
                  )}
                </div>
              </div>

              {/* Inline edit form — shown when Update Link is clicked */}
              {isEditingLink && appointment.status !== "completed" && (
                <form
                  onSubmit={handleSaveLink}
                  className="flex items-center gap-2 pt-1"
                >
                  <input
                    required
                    type="url"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#bfdbfe] bg-white text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0149ff]/20 focus:border-[#0149ff] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSavingLink || !editLink.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#0149ff] text-white font-bold text-sm hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60 whitespace-nowrap"
                  >
                    {isSavingLink ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {isSavingLink ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingLink(false);
                      setEditLink(appointment.meetLink || "");
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white border border-[#bfdbfe] text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Known Conditions ── */}
          {appointment.status !== "completed" &&
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

          {/* ── Contact Information ── */}
          {appointment.status !== "completed" && (
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

          {/* ── Completed: Notes & Medical File ── */}
          {appointment.status === "completed" && (
            <div className="space-y-2">
              <h4 className="text-base font-bold text-gray-900">
                Consultation Notes
              </h4>
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-5 space-y-3">
                <p className="text-sm font-medium text-gray-800 leading-relaxed italic">
                  &quot;
                  {appointment.consultationNotes ||
                    "TSH levels normalized. Continue current levothyroxine dosage. Patient reports improved energy levels."}
                  &quot;
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#16a34a]">
                  <User className="h-3.5 w-3.5" />
                  <span>
                    {appointment.doctorName || "Dr. Stephen Adeyemi"} ·{" "}
                    {appointment.completedDate || "May 30, 2026"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Bottom Primary Action Buttons ── */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            {/* cancelled or declined: Reschedule Appointment */}
            {(appointment.status === "cancelled" ||
              appointment.status === "declined" ||
              appointment.rawStatus === "cancelled" ||
              appointment.rawStatus === "declined") && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReschedule?.();
                }}
                className="w-full py-4 rounded-2xl bg-primary-blue text-white font-bold text-base hover:opacity-90 transition-all cursor-pointer shadow-md text-center flex items-center justify-center gap-2"
              >
                Reschedule Appointment
              </button>
            )}

            {/* pending: Approve Appointment + Decline */}
            {(appointment.status === "pending" ||
              appointment.rawStatus === "pending_approval" ||
              appointment.rawStatus === "pending") &&
              appointment.rawStatus !== "cancelled" &&
              appointment.rawStatus !== "declined" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenApprove?.();
                    }}
                    className="flex-1 py-4 rounded-2xl bg-primary-red text-white font-bold text-base hover:opacity-90 transition-all cursor-pointer shadow-md text-center"
                  >
                    Approve Appointment
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDecline?.();
                    }}
                    className="px-5 py-4 rounded-2xl bg-[#f3f4f6] text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              )}

            {/* in_progress / confirmed: Complete + No-Show + Cancel */}
            {(appointment.status === "in_progress" ||
              (appointment.status === "upcoming" &&
                appointment.rawStatus === "confirmed")) &&
              appointment.rawStatus !== "cancelled" &&
              appointment.rawStatus !== "declined" && (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenComplete?.();
                    }}
                    className="w-full py-4 rounded-2xl bg-[#0149ff] text-white font-bold text-base hover:opacity-90 transition-all cursor-pointer shadow-md text-center"
                  >
                    Complete Appointment
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNoShow?.();
                      }}
                      className="py-3 rounded-xl bg-[#e7eeff] text-[#0149ff] font-semibold text-sm hover:bg-secondary-blue transition-colors cursor-pointer text-center"
                    >
                      No-Show
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCancel?.();
                      }}
                      className="py-3 rounded-xl bg-rose-50 text-rose-600 font-semibold text-sm hover:bg-rose-100 transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
