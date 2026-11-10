"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, Search, X, FileText, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks";
import { useAppointments } from "@/hooks/useAppointments";
import { AppointmentDetailsModal } from "@/components/common/AppointmentDetailsModal";
import { ApproveAppointmentModal } from "@/components/common/ApproveAppointmentModal";
import { DeclineAppointmentModal } from "@/components/common/DeclineAppointmentModal";
import { CancelAppointmentModal } from "@/components/common/CancelAppointmentModal";
import { RescheduleAppointmentModal } from "@/components/common/RescheduleAppointmentModal";
import { CompleteAppointmentModal } from "@/components/common/CompleteAppointmentModal";
import { NoShowModal } from "@/components/common/NoShowModal";
import type { AppointmentData } from "@/components/common/AppointmentDetailsModal";
import type { Appointment } from "@/lib/types/appointment";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(minutes?: number): string {
  return minutes ? `${minutes} min` : "30 min";
}

// Maps the API Appointment shape to the display shape consumed by the UI and modals.
// patient_profile is the joined patient data returned by the API.
function toDisplayData(apt: Appointment): AppointmentData {
  const p = (apt as any).patient || (apt as any).profiles;
  const patientName = p?.full_name ?? "Patient";
  const patientAge = p?.date_of_birth
    ? Math.floor(
        (new Date().getTime() - new Date(p.date_of_birth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      )
    : undefined;
  const avatarUrl =
    p?.passport_signed_url ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=f4f4f5&color=374151&size=80`;

  const isPending =
    apt.status === "pending_approval" || apt.status === "pending";

  const displayStatus: AppointmentData["status"] =
    apt.status === "completed"
      ? "completed"
      : apt.status === "cancelled"
        ? "cancelled"
        : apt.status === "declined"
          ? "declined"
          : isPending
            ? "pending"
            : apt.status === "confirmed"
              ? "in_progress"
              : "upcoming";

  return {
    id: apt.id,
    patientName,
    age: patientAge ?? "—",
    gender: p?.gender ?? "—",
    bloodType: p?.blood_group ?? "—",
    avatar: avatarUrl,
    date: formatDate(apt.scheduled_at),
    time: formatTime(apt.scheduled_at),
    duration: formatDuration(apt.services?.duration_minutes),
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
    phone: p?.phone ?? "—",
    email: p?.email ?? "—",
    status: displayStatus,
    rawStatus: apt.status,
    cancellationReason: apt.cancellation_reason ?? undefined,
    cancelledBy: apt.cancelled_by ?? undefined,
    scheduledAt: apt.scheduled_at,
    consultationNotes: apt.completion_note ?? undefined,
    doctorName: apt.clinician?.full_name ?? "Dr. Stephen Adeyemi",
    completedDate:
      apt.status === "completed"
        ? formatDate(apt.updated_at ?? apt.scheduled_at)
        : undefined,
  };
}

export default function DoctorAppointmentsPage() {
  const { profile } = useProfile();
  const {
    appointments: rawAppointments,
    isLoading,
    fetchAppointments,
    approveAppointment,
    declineAppointment,
    cancelAppointment,
    rescheduleAppointment,
    completeAppointment,
    updateMeetingLink,
    markAsMissed,
  } = useAppointments({ autoFetch: true });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "upcoming" | "completed" | "cancelled"
  >("all");

  // Shared appointment selection — one piece of state drives all four modals
  const [selectedDisplay, setSelectedDisplay] =
    useState<AppointmentData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isNoShowOpen, setIsNoShowOpen] = useState(false);

  const appointments = useMemo(
    () => rawAppointments.map(toDisplayData),
    [rawAppointments],
  );

  function openDetails(item: AppointmentData) {
    setSelectedDisplay(item);
    setIsDetailsOpen(true);
  }

  // These close the details modal first, then open the target modal
  function openApprove(item?: AppointmentData) {
    if (item) setSelectedDisplay(item);
    setIsDetailsOpen(false);
    setIsApproveOpen(true);
  }

  function openDecline(item?: AppointmentData) {
    if (item) setSelectedDisplay(item);
    setIsDetailsOpen(false);
    setIsDeclineOpen(true);
  }

  function openCancel(item?: AppointmentData) {
    if (item) setSelectedDisplay(item);
    setIsDetailsOpen(false);
    setIsCancelOpen(true);
  }

  function openReschedule(item?: AppointmentData) {
    if (item) setSelectedDisplay(item);
    setIsDetailsOpen(false);
    setIsRescheduleOpen(true);
  }

  function openComplete(item?: AppointmentData) {
    if (item) setSelectedDisplay(item);
    setIsDetailsOpen(false);
    setIsCompleteOpen(true);
  }

  function openNoShow(item?: AppointmentData) {
    if (item) setSelectedDisplay(item);
    setIsDetailsOpen(false);
    setIsNoShowOpen(true);
  }

  async function handleApprove(id: string, meetingLink: string) {
    const result = await approveAppointment(id, meetingLink);
    if (result.success) {
      await fetchAppointments();
      setIsApproveOpen(false);
    }
    return result;
  }

  async function handleDecline(id: string, reason: string) {
    const result = await declineAppointment(id, reason);
    if (result.success) {
      await fetchAppointments();
      setIsDeclineOpen(false);
    }
    return result;
  }

  async function handleCancel(id: string, reason: string) {
    const result = await cancelAppointment(id, reason);
    if (result.success) {
      await fetchAppointments();
      setIsCancelOpen(false);
    }
    return result;
  }

  async function handleReschedule(id: string, scheduledAt: string) {
    const result = await rescheduleAppointment(id, scheduledAt);
    if (result.success) {
      await fetchAppointments();
      setIsRescheduleOpen(false);
    }
    return result;
  }

  async function handleComplete(id: string, note: string, noteId?: string) {
    const result = await completeAppointment(id, note, noteId);
    if (result.success) {
      await fetchAppointments();
      setIsCompleteOpen(false);
    }
    return result;
  }

  async function handleUpdateMeetingLink(id: string, link: string) {
    const result = await updateMeetingLink(id, link);
    if (result.success) await fetchAppointments();
    return result;
  }

  async function handleMarkMissed(id: string) {
    const result = await markAsMissed(id);
    if (result.success) {
      await fetchAppointments();
      setIsNoShowOpen(false);
    }
    return result;
  }

  const pendingCount = rawAppointments.filter(
    (a) => a.status === "pending_approval" || a.status === "pending",
  ).length;
  const confirmedCount = rawAppointments.filter(
    (a) => a.status === "confirmed",
  ).length;
  const completedCount = rawAppointments.filter(
    (a) => a.status === "completed",
  ).length;
  const cancelledCount = rawAppointments.filter(
    (a) => a.status === "cancelled" || a.status === "declined",
  ).length;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      let matchesTab = true;
      if (activeTab === "pending") {
        matchesTab =
          apt.status === "pending" ||
          apt.rawStatus === "pending_approval" ||
          apt.rawStatus === "pending";
      } else if (activeTab === "upcoming") {
        matchesTab =
          (apt.status === "in_progress" ||
            apt.status === "upcoming" ||
            apt.rawStatus === "confirmed") &&
          apt.rawStatus !== "cancelled" &&
          apt.rawStatus !== "declined" &&
          apt.rawStatus !== "pending_approval" &&
          apt.rawStatus !== "pending";
      } else if (activeTab === "completed") {
        matchesTab = apt.status === "completed" || apt.rawStatus === "completed";
      } else if (activeTab === "cancelled") {
        matchesTab =
          apt.status === "cancelled" ||
          apt.status === "declined" ||
          apt.rawStatus === "cancelled" ||
          apt.rawStatus === "declined";
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.type.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q) ||
        apt.time.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [appointments, activeTab, searchQuery]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {profile?.full_name ? (
            <>
              <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
                {getGreeting()}, {profile.full_name}
              </h1>
              <p className="text-base font-medium text-primary-gray mt-1.5">
                Manage all patient appointments
              </p>
            </>
          ) : (
            <>
              <div className="h-9 w-72 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-4 w-40 rounded bg-slate-100 animate-pulse mt-2" />
            </>
          )}
        </div>

        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-gray-200/80 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-red/20 focus:border-primary-red transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-200/40 rounded-2xl w-fit">
        {(
          [
            { id: "all", label: "All" },
            { id: "pending", label: `Pending (${pendingCount})` },
            {
              id: "upcoming",
              label: `Confirmed (${confirmedCount})`,
            },
            { id: "completed", label: `Completed (${completedCount})` },
            {
              id: "cancelled",
              label: `Cancelled / Declined (${cancelledCount})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      <div className="bg-white rounded-2xl p-6 lg:p-7 border border-gray-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary-red" />
            <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
              All Appointments
            </h2>
          </div>
          <span className="text-[15px] font-medium text-primary-gray">
            {completedCount} completed · {confirmedCount} confirmed ·{" "}
            {pendingCount} pending · {cancelledCount} cancelled/declined
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-primary-blue" />
            <p className="text-sm font-medium">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-medium">
            No appointments found matching your filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-[#FCFCFC] hover:bg-[#f5f5f7] transition-colors duration-150 border border-slate-100/60"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-24 shrink-0 text-left">
                    <div className="text-base font-semibold text-gray-900">
                      {item.time}
                    </div>
                    <div className="text-sm text-primary-gray font-normal mt-0.5">
                      {item.duration}
                    </div>
                  </div>

                  <span
                    className={`h-3 w-3 rounded-full shrink-0 ${
                      item.status === "cancelled" ||
                      item.rawStatus === "cancelled"
                        ? "bg-rose-500"
                        : item.status === "declined" ||
                            item.rawStatus === "declined"
                          ? "bg-gray-400"
                          : item.status === "pending" ||
                              item.rawStatus === "pending_approval" ||
                              item.rawStatus === "pending"
                            ? "bg-amber-500"
                            : item.status === "in_progress" ||
                                item.status === "upcoming" ||
                                item.rawStatus === "confirmed"
                              ? "bg-blue-500"
                              : item.status === "completed"
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                    }`}
                  />

                  <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                    <Image
                      src={item.avatar}
                      alt={item.patientName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {item.patientName}
                    </h3>
                    <p className="text-[15px] text-primary-gray truncate mt-1 font-normal">
                      {item.type} · {item.room} · {item.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
                  {/* Pending */}
                  {(item.status === "pending" ||
                    item.rawStatus === "pending_approval" ||
                    item.rawStatus === "pending") &&
                    item.rawStatus !== "cancelled" &&
                    item.rawStatus !== "declined" && (
                      <>
                        <button
                          onClick={() => openApprove(item)}
                          className="px-5 py-2.5 rounded-lg bg-primary-red text-white text-[15px] font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openDecline(item)}
                          className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => openDetails(item)}
                          className="px-4 py-2.5 rounded-lg text-primary-gray hover:text-gray-900 text-[15px] font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </>
                    )}

                  {/* Confirmed / In Progress */}
                  {(item.status === "in_progress" ||
                    (item.status === "upcoming" &&
                      item.rawStatus === "confirmed")) &&
                    item.rawStatus !== "cancelled" &&
                    item.rawStatus !== "declined" &&
                    item.rawStatus !== "pending_approval" &&
                    item.rawStatus !== "pending" && (
                      <>
                        {item.meetLink && (
                          <a
                            href={item.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 rounded-lg bg-blue-50 text-primary-blue text-[15px] font-normal hover:bg-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            Join Call
                          </a>
                        )}
                        <button
                          onClick={() => openDetails(item)}
                          className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-normal hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </>
                    )}

                  {/* Completed */}
                  {(item.status === "completed" ||
                    item.rawStatus === "completed") && (
                    <>
                      <span className="text-[15px] font-normal  text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                        Completed
                      </span>
                      <button
                        onClick={() => openDetails(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#e8f0fe] text-primary-blue text-[15px] font-normal  hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="h-4 w-4" />
                        View Notes
                      </button>
                    </>
                  )}

                  {/* Cancelled */}
                  {(item.status === "cancelled" ||
                    item.rawStatus === "cancelled") && (
                    <>
                      <span className="text-[15px] font-normal  text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
                        Cancelled
                      </span>
                      <button
                        onClick={() => openDetails(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-normal hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </>
                  )}

                  {/* Declined */}
                  {(item.status === "declined" ||
                    item.rawStatus === "declined") && (
                    <>
                      <span className="text-[15px] font-normal  text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                        Declined
                      </span>
                      <button
                        onClick={() => openDetails(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AppointmentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        appointment={selectedDisplay}
        onUpdateAppointment={setSelectedDisplay}
        onOpenApprove={() => openApprove()}
        onOpenDecline={() => openDecline()}
        onOpenCancel={() => openCancel()}
        onOpenReschedule={() => openReschedule()}
        onOpenComplete={() => openComplete()}
        onOpenNoShow={() => openNoShow()}
        onUpdateMeetingLink={handleUpdateMeetingLink}
        onAppointmentUpdated={fetchAppointments}
      />

      <ApproveAppointmentModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        appointment={selectedDisplay}
        onApprove={handleApprove}
        onAppointmentUpdated={fetchAppointments}
      />

      <DeclineAppointmentModal
        isOpen={isDeclineOpen}
        onClose={() => setIsDeclineOpen(false)}
        appointment={selectedDisplay}
        onDecline={handleDecline}
        onAppointmentUpdated={fetchAppointments}
      />

      <CancelAppointmentModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        appointment={selectedDisplay}
        onCancel={handleCancel}
        onAppointmentUpdated={fetchAppointments}
      />

      <RescheduleAppointmentModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        appointment={selectedDisplay}
        onReschedule={handleReschedule}
        onAppointmentUpdated={fetchAppointments}
      />

      <CompleteAppointmentModal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        appointment={selectedDisplay}
        onComplete={handleComplete}
        onAppointmentUpdated={fetchAppointments}
      />

      <NoShowModal
        isOpen={isNoShowOpen}
        onClose={() => setIsNoShowOpen(false)}
        appointment={selectedDisplay}
        onMarkMissed={handleMarkMissed}
        onAppointmentUpdated={fetchAppointments}
      />
    </div>
  );
}
