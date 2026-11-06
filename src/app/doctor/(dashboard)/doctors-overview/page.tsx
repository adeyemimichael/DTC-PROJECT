'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import { useProfile } from '@/hooks';
import type { Appointment } from '@/lib/types/appointment';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PatientRecord {
  id: string;
  full_name?: string | null;
  email?: string | null;
}

// ── Mock data (shown when real data is empty) ─────────────────────────────────

interface MockScheduleItem {
  id: string;
  name: string;
  avatar: string;
  service: string;
  room: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  reason: string;
}

interface MockPendingRequest {
  id: string;
  name: string;
  service: string;
  time: string;
  date: string;
  reason: string;
}

const MOCK_SCHEDULE: MockScheduleItem[] = [
  {
    id: 'mock-s1',
    name: 'Sarah Mitchell',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    service: 'General Consultation',
    room: 'Room 3',
    time: '9:00 AM',
    duration: '30 min',
    status: 'upcoming',
    reason: 'Annual health check-up and blood work review',
  },
  {
    id: 'mock-s2',
    name: 'Michael Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    service: 'Specialist Care',
    room: 'Room 1',
    time: '9:45 AM',
    duration: '45 min',
    status: 'upcoming',
    reason: 'Persistent migraines and neurological assessment',
  },
  {
    id: 'mock-s3',
    name: 'Emily Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    service: 'General Consultation',
    room: 'Room 2',
    time: '11:30 AM',
    duration: '30 min',
    status: 'in_progress',
    reason: 'Follow-up on thyroid panel results',
  },
  {
    id: 'mock-s4',
    name: 'David Thompson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    service: 'Telemedicine',
    room: 'Virtual',
    time: '2:00 PM',
    duration: '30 min',
    status: 'in_progress',
    reason: 'Blood pressure medication review',
  },
  {
    id: 'mock-s5',
    name: 'Aisha Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    service: 'Specialist Care',
    room: 'Room 1',
    time: '9:00 AM',
    duration: '30 min',
    status: 'completed',
    reason: 'Lower back pain — possible disc issue',
  },
  {
    id: 'mock-s6',
    name: 'Robert Kim',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    service: 'General Consultation',
    room: 'Room 2',
    time: '9:00 AM',
    duration: '30 min',
    status: 'completed',
    reason: 'Seasonal allergy review',
  },
];

const MOCK_PENDING: MockPendingRequest[] = [
  {
    id: 'mock-p1',
    name: 'Marcus Wright',
    service: 'General Consultation',
    time: '9:00 AM',
    date: 'Thu, Jun 4',
    reason: 'New patient — comprehensive physical examination',
  },
  {
    id: 'mock-p2',
    name: 'Linda Thompson',
    service: 'General Consultation',
    time: '2:00 PM',
    date: 'Fri, Jun 5',
    reason: 'New patient — routine check-up and blood work',
  },
  {
    id: 'mock-p3',
    name: 'Sarah Mitchell',
    service: 'Telemedicine',
    time: '2:00 PM',
    date: 'Mon, Jun 18',
    reason: 'Follow-up on blood pressure medication adjustment',
  },
];

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
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateShort(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number, currency = 'NGN'): string {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function statusDot(status: string): string {
  switch (status) {
    case 'confirmed':    return 'bg-amber-500';
    case 'completed':    return 'bg-emerald-500';
    default:             return 'bg-slate-400';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DoctorsOverviewPage() {
  const openBooking = useBooking();
  const { profile } = useProfile();

  // ── State ──────────────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    id: string;
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setIsLoadingAppointments(true);
    try {
      const res = await fetch('/api/appointments');
      const result = await res.json();
      if (res.ok) setAppointments(Array.isArray(result.data) ? result.data : []);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    setIsLoadingPatients(true);
    try {
      const res = await fetch('/api/patients');
      const result = await res.json();
      if (res.ok) setPatients(Array.isArray(result.data) ? result.data : []);
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    void fetchAppointments();
    void fetchPatients();
  }, [fetchAppointments, fetchPatients]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  // Today's confirmed/completed appointments
  const todayAppointments = useMemo(
    () => appointments.filter((a) => isToday(a.scheduled_at)),
    [appointments],
  );

  const todayCompleted = todayAppointments.filter(
    (a) => a.status === 'completed',
  ).length;

  const todayRemaining = todayAppointments.filter((a) =>
    ['confirmed', 'pending_approval'].includes(a.status),
  ).length;

  // Pending approval
  const pendingRequests = useMemo(
    () => appointments.filter((a) => a.status === 'pending_approval'),
    [appointments],
  );

  // Revenue this month — sum payments[].amount where status = 'success'
  const revenueThisMonth = useMemo(() => {
    let total = 0;
    for (const apt of appointments) {
      if (!isThisMonth(apt.scheduled_at)) continue;
      if (!apt.payments) continue;
      for (const p of apt.payments) {
        if (p.status === 'success') total += p.amount;
      }
    }
    return total;
  }, [appointments]);

  // Today's schedule (confirmed + completed), sorted by time
  const todaySchedule = useMemo(
    () =>
      todayAppointments
        .filter((a) => ['confirmed', 'completed'].includes(a.status))
        .sort(
          (a, b) =>
            new Date(a.scheduled_at).getTime() -
            new Date(b.scheduled_at).getTime(),
        ),
    [todayAppointments],
  );

  // ── Patient name lookup ────────────────────────────────────────────────────
  const patientName = useCallback(
    (patientId: string): string => {
      return (
        patients.find((p) => p.id === patientId)?.full_name ?? 'Patient'
      );
    },
    [patients],
  );

  // ── Approve / Decline ──────────────────────────────────────────────────────
  const handleDecision = async (
    id: string,
    decision: 'confirmed' | 'declined',
  ) => {
    setActionLoading(`${decision}-${id}`);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Request failed');

      setActionFeedback({
        id,
        type: 'success',
        message: decision === 'confirmed' ? 'Appointment approved.' : 'Appointment declined.',
      });
      await fetchAppointments();
    } catch (err: unknown) {
      setActionFeedback({
        id,
        type: 'error',
        message: err instanceof Error ? err.message : 'Something went wrong.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const isLoading = isLoadingAppointments || isLoadingPatients;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">

      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {profile?.full_name ? (
            <>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                {getGreeting()}, {profile.full_name}
              </h1>
              <p className="text-base font-medium text-primary-gray mt-1.5">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
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
        <button
          onClick={openBooking}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary-red text-white font-semibold text-base hover:opacity-90 transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <Calendar className="h-5 w-5" />
          Manage Appointments
        </button>
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
            <div className="py-12 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary-blue" />
              Loading schedule...
            </div>
          ) : todaySchedule.length === 0 ? (
            /* ── Mock schedule fallback ── */
            <div className="space-y-4">
              {MOCK_SCHEDULE.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FCFCFC] hover:bg-[#f5f5f7] transition-colors border border-slate-100/60"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Time */}
                    <div className="w-24 shrink-0">
                      <div className="text-base font-bold text-gray-900">{item.time}</div>
                      <div className="text-sm text-primary-gray font-normal mt-0.5">{item.duration}</div>
                    </div>

                    {/* Status dot */}
                    <span className={`h-3 w-3 rounded-full shrink-0 ${
                      item.status === 'completed' ? 'bg-emerald-500' :
                      item.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-amber-500'
                    }`} />

                    {/* Avatar */}
                    <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                      <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Name + details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-[15px] text-primary-gray truncate mt-0.5 font-normal">
                        {item.service} · {item.room} · {item.reason}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {item.status === 'upcoming' && (
                      <>
                        <button className="px-5 py-2.5 rounded-lg bg-[#fff8ee] text-amber-600 text-[15px] font-semibold hover:bg-amber-100 transition-colors cursor-pointer">
                          Start
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                          Details
                        </button>
                      </>
                    )}
                    {item.status === 'in_progress' && (
                      <>
                        <button className="px-5 py-2.5 rounded-lg bg-[#e6f4ea] text-[#1e8e3e] text-[15px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer">
                          Complete
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                          Details
                        </button>
                      </>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-[15px] font-semibold text-primary-gray px-3 py-1">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {todaySchedule.map((apt) => {
                const name = patientName(apt.patient_id);
                const serviceName = apt.services?.name ?? 'Consultation';
                const duration = apt.services?.duration_minutes
                  ? `${apt.services.duration_minutes} min`
                  : '—';
                const isCompleted = apt.status === 'completed';

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
                      <span className={`h-3 w-3 rounded-full shrink-0 ${statusDot(apt.status)}`} />

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {name}
                        </h3>
                        <p className="text-[15px] text-primary-gray truncate mt-0.5 font-normal">
                          {serviceName}
                          {apt.reason ? ` · ${apt.reason}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                          Completed
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                          Confirmed
                        </span>
                      )}
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
            <div className="py-10 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              Loading requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            /* ── Mock pending requests fallback ── */
            <div className="space-y-4">
              {MOCK_PENDING.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-amber-400/40 bg-white space-y-3.5 shadow-2xs hover:border-amber-500 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{req.name}</h3>
                      <p className="text-[15px] font-medium text-primary-gray mt-0.5">{req.service}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[15px] font-bold text-primary-blue block">{req.time}</span>
                      <span className="text-sm font-semibold text-gray-400">{req.date}</span>
                    </div>
                  </div>
                  <p className="text-[15px] text-primary-gray leading-relaxed font-normal">{req.reason}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      className="flex-1 py-3 rounded-xl bg-primary-red text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer text-center"
                    >
                      Approve
                    </button>
                    <button
                      className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer text-center"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => {
                const name = patientName(req.patient_id);
                const serviceName = req.services?.name ?? 'Consultation';
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
                        <h3 className="text-base font-bold text-gray-900">{name}</h3>
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
                          feedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {feedback.type === 'success' ? (
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
                        disabled={isBusy}
                        onClick={() => handleDecision(req.id, 'confirmed')}
                        className="flex-1 py-3 rounded-xl bg-primary-red text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer text-center inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {isApproving && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {isApproving ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        disabled={isBusy}
                        onClick={() => handleDecision(req.id, 'declined')}
                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer text-center inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {isDeclining && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {isDeclining ? 'Declining...' : 'Decline'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
