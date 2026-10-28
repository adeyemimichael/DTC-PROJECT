'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Calendar,
  Clock,
  Loader2,
  CalendarX2,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAppointments } from '@/hooks';
import type { Appointment } from '@/lib/types/appointment';

/** Format a price number with the service's real currency */
function formatPrice(price: number, currency = 'NGN'): string {
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${Number(price).toLocaleString()}`;
  }
}

/** Format an ISO date to "June 03, 2026 at 10:30 AM" */
function formatAppointmentDate(iso: string): string {
  const date = new Date(iso);
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr} at ${timeStr}`;
}

/** Friendly status label */
function statusLabel(status: string): string {
  switch (status) {
    case 'pending_payment':   return 'Pending Payment';
    case 'pending_approval':  return 'Awaiting Approval';
    case 'confirmed':         return 'Confirmed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/** Badge variant per status */
function badgeVariant(status: string): 'success' | 'warning' | 'subtle' {
  if (status === 'confirmed')                           return 'success';
  if (['pending', 'pending_approval', 'pending_payment'].includes(status)) return 'warning';
  return 'subtle';
}

export function NextAppointmentCard() {
  // Use the same hook as the full appointments page — upcoming: true scopes
  // the query to only future non-cancelled/declined appointments.
  const { appointments, isLoading, error, cancelAppointment } = useAppointments({
    upcoming: true,
    autoFetch: true,
  });

  // Pick the soonest confirmed / pending_approval / pending appointment
  const ACTIVE_STATUSES = ['confirmed', 'pending_approval', 'pending'];
  const next: Appointment | null =
    appointments
      .filter((a) => ACTIVE_STATUSES.includes(a.status))
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
      )[0] ?? null;

  // ── Cancel confirmation modal state ──────────────────────────────────────
  const [isCancelOpen, setIsCancelOpen]   = useState(false);
  const [cancelReason, setCancelReason]   = useState('');
  const [isCancelling, setIsCancelling]   = useState(false);

  const openCancel  = () => { setIsCancelOpen(true); setCancelReason(''); };
  const closeCancel = () => { setIsCancelOpen(false); setCancelReason(''); };

  const handleConfirmCancel = async () => {
    if (!next) return;
    setIsCancelling(true);
    await cancelAppointment(next.id, cancelReason.trim() || undefined);
    setIsCancelling(false);
    closeCancel();
  };

  // ── Loading / error / empty states ───────────────────────────────────────
  if (isLoading) {
    return (
      <Card className="p-10 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary-blue" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-10 text-center text-sm text-rose-500 font-normal">
        {error}
      </Card>
    );
  }

  if (!next) {
    return (
      <Card className="p-10 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm text-primary-gray font-medium">
          No upcoming appointments
        </p>
        <p className="text-xs text-slate-400 font-normal max-w-xs">
          Book a consultation to get started.
        </p>
      </Card>
    );
  }

  const serviceName  = next.services?.name || 'Consultation';
  const doctorName   = next.profiles?.full_name || 'Assigned Clinician';
  const price        = Number(next.services?.price ?? 0);
  const currency     = next.services?.currency || 'NGN';
  const durationMins = next.services?.duration_minutes ?? next.services?.duration ?? 30;

  return (
    <>
      <Card>
        {/* Card Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-black flex items-center gap-2">
            <Calendar className="h-5 w-5 text-black" />
            Next Appointment
          </h3>
          <Badge variant={badgeVariant(next.status)}>
            {statusLabel(next.status)}
          </Badge>
        </div>

        {/* Service + Doctor + Price */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 mb-6 gap-3">
          <div>
            <h4 className="text-xl font-semibold text-black">{serviceName}</h4>
            <p className="text-sm text-primary-gray mt-1 font-normal">
              {doctorName}
            </p>
          </div>
          <div className="text-xl font-semibold text-black shrink-0">
            {formatPrice(price, currency)}
          </div>
        </div>

        {/* Date / Time row + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm font-normal text-primary-gray">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatAppointmentDate(next.scheduled_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {durationMins} min
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/user/appointments">
              <Button
                variant="secondary"
                size="sm"
                className="inline-flex items-center gap-1.5 w-full sm:w-auto"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View details
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              onClick={openCancel}
              className="bg-secondary-lightred text-primary-red border-0 hover:bg-red-100 w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>

      {/* Cancel Confirmation Modal */}
      {isCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 pt-24 sm:pt-4 pb-4 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closeCancel} />

          <div className="relative bg-white rounded-2xl p-5 sm:p-7 max-w-xl w-full shadow-lg border border-slate-100 z-10 animate-in slide-in-from-bottom-4 duration-200">

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <CalendarX2 className="w-5 h-5 text-primary-red" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cancel Appointment</h3>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={closeCancel}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Appointment summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Service</span>
                <span className="text-slate-900 font-semibold">{serviceName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Date</span>
                <span className="text-slate-900 font-semibold">
                  {new Date(next.scheduled_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Time</span>
                <span className="text-slate-900 font-semibold">
                  {new Date(next.scheduled_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {next.profiles?.full_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Doctor</span>
                  <span className="text-slate-900 font-semibold">{next.profiles.full_name}</span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for cancellation{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Schedule conflict, feeling better, need to reschedule..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                maxLength={300}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary-red focus:ring-1 focus:ring-primary-red focus:outline-none resize-none transition-all font-normal"
              />
              <span className="text-[11px] text-slate-400 font-normal float-right mt-1">
                {cancelReason.length}/300
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                variant="secondary"
                onClick={closeCancel}
                disabled={isCancelling}
                className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 font-semibold text-sm py-2.5"
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 bg-primary-red hover:bg-[#d80300] text-white border-0 font-semibold text-sm py-2.5 inline-flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Appointment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
