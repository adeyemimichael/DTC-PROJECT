"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Video,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Inbox,
} from "lucide-react";
import { useProfile, usePatients, useAppointments } from "@/hooks";
import type { Appointment } from "@/lib/types/appointment";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { ApproveAppointmentModal } from "@/components/common/ApproveAppointmentModal";
import { DeclineAppointmentModal } from "@/components/common/DeclineAppointmentModal";
import type { AppointmentData } from "@/components/common/AppointmentDetailsModal";

// ── Helpers ───────────────────────────────────────────────────────────────────

function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisMonth(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number, currency = "NGN"): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function statusDot(status: string): string {
  switch (status) {
    case "confirmed":
      return "bg-amber-500";
    case "completed":
      return "bg-emerald-500";
    default:
      return "bg-slate-400";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DoctorsOverviewPage() {
  const { profile } = useProfile();
  const {
    patients,
    isLoadingPatients,
    fetchPatients,
  } = usePatients();

  const {
    appointments,
    isLoading: isLoadingAppointments,
    fetchAppointments,
    approveAppointment,
    declineAppointment,
    patchAppointment,
  } = useAppointments({ autoFetch: true });

  const [selectedAppointmentForApprove, setSelectedAppointmentForApprove] =
    useState<AppointmentData | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  const [selectedAppointmentForDecline, setSelectedAppointmentForDecline] =
    useState<AppointmentData | null>(null);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    type: "success" | "error";
    message: string;
  } | null>(null);

  const router = useRouter();

  // Load patients list on mount
  useEffect(() => {
    void fetchPatients();
  }, [fetchPatients]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  // Today's confirmed/completed appointments
  const todayAppointments = useMemo(
    () => appointments.filter((a) => isToday(a.scheduled_at)),
    [appointments],
  );

  const todayCompleted = todayAppointments.filter(
    (a) => a.status === "completed",
  ).length;

  const todayRemaining = todayAppointments.filter((a) =>
    ["confirmed", "pending_approval", "pending"].includes(a.status),
  ).length;

  // Pending approval
  const pendingRequests = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === "pending_approval" || a.status === "pending",
      ),
    [appointments],
  );

  // Revenue this month — sum payments[].amount where status = 'success'
  const revenueThisMonth = useMemo(() => {
    let total = 0;
    for (const apt of appointments) {
      if (!isThisMonth(apt.scheduled_at)) continue;
      if (!apt.payments) continue;
      for (const p of apt.payments) {
        if (p.status === "success") total += Number(p.amount) || 0;
      }
    }
    return total;
  }, [appointments]);

  // Today's schedule (confirmed + completed), sorted by time
  const todaySchedule = useMemo(
    () =>
      todayAppointments
        .filter((a) => ["confirmed", "completed"].includes(a.status))
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime(),
        ),
    [todayAppointments],
  );

  // ── Patient name lookup ────────────────────────────────────────────────────
  const getPatientDisplayName = useCallback(
    (apt: Appointment): string => {
      if (apt.patient?.full_name) return apt.patient.full_name;
      const found = patients.find((p) => p.id === apt.patient_id);
      return found?.full_name ?? "Patient";
    },
    [patients],
  );

  const getPatientAvatar = useCallback(
    (apt: Appointment, name: string): string => {
      const p = apt.patient;
      if (p?.passport_signed_url) return p.passport_signed_url;
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f4f4f5&color=374151&size=80`;
    },
    [],
  );

  const toAppointmentData = useCallback(
    (apt: Appointment): AppointmentData => {
      const name = getPatientDisplayName(apt);
      const avatar = getPatientAvatar(apt, name);
      const pat = (apt.patient || patients.find((p) => p.id === apt.patient_id)) as any;

      const patientAge = pat?.date_of_birth
        ? Math.floor(
            (new Date().getTime() - new Date(pat.date_of_birth).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25),
          )
        : "—";

      return {
        id: apt.id,
        patientName: name,
        age: patientAge,
        gender: pat?.gender || "—",
        bloodType: pat?.blood_group || "—",
        avatar,
        date: formatDateShort(apt.scheduled_at),
        time: formatTime(apt.scheduled_at),
        duration: apt.services?.duration_minutes
          ? `${apt.services.duration_minutes} min`
          : "30 min",
        room: "Virtual",
        patientUploadId: apt.patient_upload_id ?? undefined,
        isVirtual: Boolean(apt.meeting_link),
        meetLink: apt.meeting_link ?? undefined,
        type: apt.services?.name ?? "Consultation",
        patientId: apt.patient_id
          ? apt.patient_id.slice(0, 8).toUpperCase()
          : "PATIENT",
        rawPatientId: apt.patient_id,
        reason: apt.reason ?? "—",
        phone: pat?.phone ?? "—",
        email: pat?.email ?? "—",
        status: "pending",
        rawStatus: apt.status,
        cancellationReason: apt.cancellation_reason ?? undefined,
        cancelledBy: apt.cancelled_by ?? undefined,
        scheduledAt: apt.scheduled_at,
      };
    },
    [getPatientDisplayName, getPatientAvatar, patients],
  );

  // ── Approve / Decline Modals ───────────────────────────────────────────────
  const handleOpenApprove = (req: Appointment) => {
    setSelectedAppointmentForApprove(toAppointmentData(req));
    setIsApproveOpen(true);
  };

  const handleApproveConfirm = async (id: string, meetingLink: string) => {
    const result = await approveAppointment(id, meetingLink);
    if (result.success) {
      setIsApproveOpen(false);
      await fetchAppointments();
    }
    return result;
  };

  const handleOpenDecline = (req: Appointment) => {
    setSelectedAppointmentForDecline(toAppointmentData(req));
    setIsDeclineOpen(true);
  };

  const handleDeclineConfirm = async (id: string, reason: string) => {
    const result = await declineAppointment(id, reason);
    if (result.success) {
      setIsDeclineOpen(false);
      await fetchAppointments();
    }
    return result;
  };

  const isLoading = isLoadingAppointments || isLoadingPatients;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 animate-page-fade">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {profile?.full_name ? (
            <>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                {getGreeting()}, {profile.full_name}
              </h1>
              <p className="text-base font-medium text-primary-gray mt-1.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </>
          ) : (
            <>
              <div className="h-9 w-72 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-4 w-40 rounded bg-slate-100 animate-pulse mt-2" />
            </>
          )}
        </div>
        <Button
          onClick={() => router.push("/doctor/appointments")}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary-red text-white font-semibold text-base hover:opacity-90 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <Calendar className="h-5 w-5" />
          Manage Appointments
        </Button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-base font-medium text-gray-600">
            Today&apos;s Appointments
          </span>
          <div className="mt-3.5">
            {isLoading ? (
              <div className="h-9 w-16 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                  {todayCompleted}/{todayAppointments.length}
                </span>
                <p className="text-sm font-semibold text-amber-500 mt-1.5">
                  {todayRemaining} remaining
                </p>
              </>
            )}
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-base font-medium text-gray-600">
            Total Patients
          </span>
          <div className="mt-3.5">
            {isLoadingPatients ? (
              <div className="h-9 w-16 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                  {patients.length.toLocaleString()}
                </span>
                <p className="text-sm font-semibold text-primary-red mt-1.5">
                  Registered patients
                </p>
              </>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-base font-medium text-gray-600">
            Pending Requests
          </span>
          <div className="mt-3.5">
            {isLoadingAppointments ? (
              <div className="h-9 w-16 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                  {pendingRequests.length}
                </span>
                <p className="text-sm font-semibold text-amber-500 mt-1.5">
                  Awaiting confirmation
                </p>
              </>
            )}
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-base font-medium text-gray-600">
            Revenue This Month
          </span>
          <div className="mt-3.5">
            {isLoadingAppointments ? (
              <div className="h-9 w-24 rounded bg-slate-200 animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                  {formatCurrency(revenueThisMonth)}
                </span>
                <p className="text-sm font-semibold text-emerald-500 mt-1.5">
                  Verified payments
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left: Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-7 border border-gray-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary-red" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Today&apos;s Schedule
              </h2>
            </div>
            <span className="text-[15px] font-medium text-primary-gray">
              {todayCompleted} completed · {todayRemaining} remaining
            </span>
          </div>

          {isLoadingAppointments ? (
            <div className="py-16 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary-blue" />
              Loading schedule...
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="py-16 px-6 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-3.5">
                <CalendarDays className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No appointments scheduled for today
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mt-1">
                You have no confirmed consultations for today. Check upcoming
                bookings or view pending requests on the right.
              </p>
              <Link
                href="/doctor/appointments"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-red hover:underline"
              >
                View all appointments <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySchedule.map((apt) => {
                const name = getPatientDisplayName(apt);
                const avatar = getPatientAvatar(apt, name);
                const serviceName = apt.services?.name ?? "Consultation";
                const duration = apt.services?.duration_minutes
                  ? `${apt.services.duration_minutes} min`
                  : "—";
                const isCompleted = apt.status === "completed";

                return (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FCFCFC] hover:bg-[#f5f5f7] transition-colors border border-slate-100/60"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Time */}
                      <div className="w-24 shrink-0">
                        <div className="text-base font-bold text-gray-900">
                          {formatTime(apt.scheduled_at)}
                        </div>
                        <div className="text-sm text-primary-gray font-normal mt-0.5">
                          {duration}
                        </div>
                      </div>

                      {/* Dot */}
                      <span
                        className={`h-3 w-3 rounded-full shrink-0 ${statusDot(apt.status)}`}
                      />

                      {/* Avatar */}
                      <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                        <Image
                          src={avatar}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {name}
                        </h3>
                        <p className="text-[15px] text-primary-gray truncate mt-0.5 font-normal">
                          {serviceName}
                          {apt.reason ? ` · ${apt.reason}` : ""}
                        </p>
                        {apt.meeting_link && (
                          <a
                            href={apt.meeting_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary-blue hover:underline mt-1"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Video Call
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Status badge & link */}
                    <div className="flex items-center gap-3 shrink-0 justify-end">
                      {isCompleted ? (
                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                          Completed
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                          Confirmed
                        </span>
                      )}
                      <Link
                        href="/doctor/appointments"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View in Appointments"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Pending Requests */}
        <div className="bg-white rounded-2xl p-6 lg:p-7 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <Clock className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Pending Requests
              </h2>
            </div>
            {!isLoadingAppointments && (
              <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </div>

          {isLoadingAppointments ? (
            <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Loading requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-14 px-4 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-3">
                <Inbox className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                No pending requests
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                All patient appointment bookings have been reviewed and
                approved.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => {
                const name = getPatientDisplayName(req);
                const serviceName = req.services?.name ?? "Consultation";
                const feedback =
                  actionFeedback?.id === req.id ? actionFeedback : null;
                const isApproving = actionLoading === `confirmed-${req.id}`;
                const isDeclining = actionLoading === `declined-${req.id}`;
                const isBusy = isApproving || isDeclining;

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-amber-400/40 bg-white space-y-3.5 shadow-2xs hover:border-amber-500 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {name}
                        </h3>
                        <p className="text-[15px] font-medium text-primary-gray mt-0.5">
                          {serviceName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[15px] font-bold text-primary-blue block">
                          {formatTime(req.scheduled_at)}
                        </span>
                        <span className="text-sm font-semibold text-gray-400">
                          {formatDateShort(req.scheduled_at)}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    {req.reason && (
                      <p className="text-[15px] text-primary-gray leading-relaxed font-normal">
                        {req.reason}
                      </p>
                    )}

                    {/* Feedback */}
                    {feedback && (
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg ${
                          feedback.type === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {feedback.type === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        {feedback.message}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleOpenApprove(req)}
                        className="flex-1 py-3 rounded-xl bg-primary-red text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer text-center inline-flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleOpenDecline(req)}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer text-center inline-flex items-center justify-center gap-1.5"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ApproveAppointmentModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        appointment={selectedAppointmentForApprove}
        onApprove={handleApproveConfirm}
        onAppointmentUpdated={fetchAppointments}
      />

      <DeclineAppointmentModal
        isOpen={isDeclineOpen}
        onClose={() => setIsDeclineOpen(false)}
        appointment={selectedAppointmentForDecline}
        onDecline={handleDeclineConfirm}
        onAppointmentUpdated={fetchAppointments}
      />
    </div>
  );
}
