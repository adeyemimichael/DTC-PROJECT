'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Calendar, Search, X, FileText, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks';
import { useAppointments } from '@/hooks/useAppointments';
import { AppointmentDetailsModal } from '@/components/common/AppointmentDetailsModal';
import { ApproveAppointmentModal } from '@/components/common/ApproveAppointmentModal';
import { DeclineAppointmentModal } from '@/components/common/DeclineAppointmentModal';
import { CompleteAppointmentModal } from '@/components/common/CompleteAppointmentModal';
import { NoShowModal } from '@/components/common/NoShowModal';
import type { AppointmentData } from '@/components/common/AppointmentDetailsModal';
import type { Appointment } from '@/lib/types/appointment';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(minutes?: number): string {
  return minutes ? `${minutes} min` : '30 min';
}

// Maps the API Appointment shape to the display shape consumed by the UI and modals.
// patient_profile is the joined patient data returned by the API.
function toDisplayData(apt: Appointment): AppointmentData {
  const p = (apt as any).patient_profile;
  const patientName = p?.full_name ?? (apt as any).patient_name ?? `Patient ${apt.patient_id.slice(0, 6)}`;
  const avatarUrl = p?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(patientName)}&background=f4f4f5&color=374151&size=80`;

  const displayStatus: AppointmentData['status'] =
    apt.status === 'completed' ? 'completed' :
    apt.status === 'confirmed' ? 'in_progress' :
    'upcoming';

  return {
    id: apt.id,
    patientName,
    age: p?.age ?? '—',
    gender: p?.gender ?? '—',
    bloodType: p?.blood_group ?? '—',
    avatar: avatarUrl,
    date: formatDate(apt.scheduled_at),
    time: formatTime(apt.scheduled_at),
    duration: formatDuration(apt.services?.duration_minutes),
    room: apt.meeting_link ? 'Virtual' : 'Room 1',
    isVirtual: Boolean(apt.meeting_link),
    meetLink: apt.meeting_link ?? undefined,
    type: apt.services?.name ?? 'Consultation',
    patientId: apt.patient_id.slice(0, 8).toUpperCase(),
    rawPatientId: apt.patient_id,
    reason: apt.reason ?? '—',
    phone: p?.phone ?? '—',
    email: p?.email ?? '—',
    status: displayStatus,
    consultationNotes: apt.completion_note ?? undefined,
    doctorName: apt.profiles?.full_name ?? 'Dr. Stephen Adeyemi',
    completedDate: apt.status === 'completed' ? formatDate(apt.updated_at ?? apt.scheduled_at) : undefined,
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
    completeAppointment,
    updateMeetingLink,
    markAsMissed,
  } = useAppointments({ autoFetch: true });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'upcoming' | 'completed'>('all');

  // Shared appointment selection — one piece of state drives all four modals
  const [selectedDisplay, setSelectedDisplay] = useState<AppointmentData | null>(null);
  const [isDetailsOpen,  setIsDetailsOpen]  = useState(false);
  const [isApproveOpen,  setIsApproveOpen]  = useState(false);
  const [isDeclineOpen,  setIsDeclineOpen]  = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isNoShowOpen,   setIsNoShowOpen]   = useState(false);

  const appointments = useMemo(() => rawAppointments.map(toDisplayData), [rawAppointments]);

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
    if (result.success) { await fetchAppointments(); setIsApproveOpen(false); }
    return result;
  }

  async function handleDecline(id: string, reason: string) {
    const result = await declineAppointment(id, reason);
    if (result.success) { await fetchAppointments(); setIsDeclineOpen(false); }
    return result;
  }

  async function handleComplete(id: string, note: string) {
    const result = await completeAppointment(id, note);
    if (result.success) { await fetchAppointments(); setIsCompleteOpen(false); }
    return result;
  }

  async function handleUpdateMeetingLink(id: string, link: string) {
    const result = await updateMeetingLink(id, link);
    if (result.success) await fetchAppointments();
    return result;
  }

  async function handleMarkMissed(id: string) {
    const result = await markAsMissed(id);
    if (result.success) { await fetchAppointments(); setIsNoShowOpen(false); }
    return result;
  }

  const pendingCount    = rawAppointments.filter((a) => a.status === 'pending_approval').length;
  const upcomingCount   = appointments.filter((a) => a.status === 'upcoming').length;
  const completedCount  = appointments.filter((a) => a.status === 'completed').length;
  const inProgressCount = appointments.filter((a) => a.status === 'in_progress').length;

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      let matchesTab = true;
      if (activeTab === 'pending')   matchesTab = rawAppointments.find((r) => r.id === apt.id)?.status === 'pending_approval';
      if (activeTab === 'upcoming')  matchesTab = apt.status === 'upcoming' || apt.status === 'in_progress';
      if (activeTab === 'completed') matchesTab = apt.status === 'completed';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        apt.patientName.toLowerCase().includes(q) ||
        apt.type.toLowerCase().includes(q) ||
        apt.reason.toLowerCase().includes(q) ||
        apt.time.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [appointments, rawAppointments, activeTab, searchQuery]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {profile?.full_name ? (
            <>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
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
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-200/60 rounded-2xl w-fit">
        {(
          [
            { id: 'all',       label: 'All' },
            { id: 'pending',   label: `Pending (${pendingCount})` },
            { id: 'upcoming',  label: `Upcoming (${upcomingCount + inProgressCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
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
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">All Appointments</h2>
          </div>
          <span className="text-[15px] font-medium text-primary-gray">
            {completedCount} completed · {upcomingCount} remaining · {inProgressCount} in progress
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
                    <div className="text-base font-bold text-gray-900">{item.time}</div>
                    <div className="text-sm text-primary-gray font-normal mt-0.5">{item.duration}</div>
                  </div>

                  <span className={`h-3 w-3 rounded-full shrink-0 ${
                    item.status === 'upcoming' ? 'bg-amber-500' :
                    item.status === 'in_progress' ? 'bg-blue-500' :
                    'bg-emerald-500'
                  }`} />

                  <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                    <Image src={item.avatar} alt={item.patientName} fill className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{item.patientName}</h3>
                    <p className="text-[15px] text-primary-gray truncate mt-1 font-normal">
                      {item.type} · {item.room} · {item.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
                  {item.status === 'upcoming' && (
                    <>
                      <button onClick={() => openDetails(item)} className="px-5 py-2.5 rounded-lg bg-[#fff8ee] text-amber-600 text-[15px] font-semibold hover:bg-amber-100 transition-colors cursor-pointer">
                        Start
                      </button>
                      <button onClick={() => openDetails(item)} className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                        Details
                      </button>
                    </>
                  )}

                  {item.status === 'in_progress' && (
                    <>
                      <button onClick={() => openComplete(item)} className="px-5 py-2.5 rounded-lg bg-[#e6f4ea] text-[#1e8e3e] text-[15px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer">
                        Complete
                      </button>
                      <button onClick={() => openDetails(item)} className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                        Details
                      </button>
                    </>
                  )}

                  {item.status === 'completed' && (
                    <>
                      <span className="text-[15px] font-semibold text-primary-gray px-3 py-1">Completed</span>
                      <button onClick={() => openDetails(item)} className="px-5 py-2.5 rounded-lg bg-[#e8f0fe] text-primary-blue text-[15px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        View Notes
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
