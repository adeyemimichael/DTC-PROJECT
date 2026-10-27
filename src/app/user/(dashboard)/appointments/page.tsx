'use client';

import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { BookAppointmentButton } from '@/components/common/BookAppointmentButton';
import {
  CalendarDays,
  Clock,
  Calendar,
  Video,
  Loader2,
  CreditCard,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useAppointments } from '@/hooks';
import type { Appointment } from '@/lib/types/appointment';
import toast from 'react-hot-toast';

type FilterTab = 'all' | 'upcoming' | 'past';

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const {
    appointments,
    isLoading,
    cancelAppointment,
    fetchAppointments,
  } = useAppointments({
    autoFetch: true,
  });

  // Filtering appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const appDate = new Date(appointment.scheduled_at);
    const now = new Date();

    if (activeTab === 'upcoming') {
      return (
        appDate >= now &&
        !['cancelled', 'declined', 'completed'].includes(appointment.status)
      );
    }

    if (activeTab === 'past') {
      return (
        appDate < now || ['completed', 'cancelled', 'declined'].includes(appointment.status)
      );
    }

    return true; // 'all'
  });

  // Revalidate / Verify payment for an appointment
  const handleVerifyPayment = async (app: Appointment) => {
    // Get latest payment reference
    const latestPayment = app.payments?.[app.payments.length - 1] || app.payments?.[0];
    const reference = latestPayment?.paystack_reference;

    if (!reference) {
      toast.error('No payment reference found. Please click Pay Now to initiate payment.');
      return;
    }

    setActionLoading(`verify-${app.id}`);
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment not completed or verified yet.');
      }

      toast.success('Payment verified! Your appointment has been submitted for approval.');
      await fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Payment not verified yet. Please click Pay Now to complete payment.');
    } finally {
      setActionLoading(null);
    }
  };

  // Pay Now: reinitialize Paystack checkout and redirect
  const handlePayNow = async (app: Appointment) => {
    setActionLoading(`pay-${app.id}`);
    try {
      const res = await fetch('/api/payments/reinitialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: app.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.');
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        throw new Error('No payment URL returned.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment.');
      setActionLoading(null);
    }
  };

  // Format date helper
  const formatDateBlock = (dateString: string) => {
    const date = new Date(dateString);

    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getBadgeVariant = (status: string): 'success' | 'warning' | 'danger' | 'subtle' => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
      case 'pending_payment':
      case 'pending_approval':
        return 'warning';
      case 'cancelled':
      case 'declined':
      case 'missed':
        return 'danger';
      case 'completed':
      default:
        return 'subtle';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Pending Payment';
      case 'pending_approval':
        return 'Awaiting Approval';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-page-fade">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-primary-deepblue tracking-tight">
            Appointments
          </h2>
          <p className="text-sm text-primary-gray mt-1 font-semibold">
            Manage your scheduled consultations
          </p>
        </div>
        <BookAppointmentButton className="btn-primary flex items-center gap-2 shadow-sm w-full sm:w-auto">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </BookAppointmentButton>
      </div>

      {/* Segmented Filter Control */}
      <div className="bg-slate-100 p-1 rounded-full flex gap-1 w-full sm:w-fit select-none overflow-x-auto">
        {(['all', 'upcoming', 'past'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 lg:px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 capitalize cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white text-primary-deepblue shadow-sm'
                  : 'text-primary-gray hover:text-primary-deepblue'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Cards List Stack */}
      <div className="space-y-4 lg:space-y-6">
        {isLoading ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-blue mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading appointments...</p>
          </Card>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const { month, day, time } = formatDateBlock(app.scheduled_at);
            const isPast =
              ['completed', 'cancelled', 'declined'].includes(app.status) ||
              new Date(app.scheduled_at).getTime() < Date.now();

            const serviceName = app.services?.name || 'General Consultation';
            const doctorName = app.profiles?.full_name || 'Assigned Clinician';
            const durationText = app.services?.duration_minutes
              ? `${app.services.duration_minutes} min`
              : '30 min';
            const priceText = app.services?.price
              ? `${app.services.currency || 'NGN'} ${Number(app.services.price).toLocaleString()}`
              : 'Free';

            const isPendingPayment = app.status === 'pending_payment';

            return (
              <Card
                key={app.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6 hover:border-slate-200 transition-colors"
              >
                {/* Left Section: Date & Time Info */}
                <div className="flex items-center gap-4 shrink-0 flex-row md:flex-col">
                  {/* Date Capsule Box */}
                  <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {month}
                    </span>
                    <span className="text-xl lg:text-2xl font-bold text-primary-deepblue -mt-1">
                      {day}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-black">{time}</p>
                    <p className="text-xs font-normal text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {durationText}
                    </p>
                  </div>
                </div>

                {/* Middle Section: Appointment description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base lg:text-lg font-bold text-black truncate">
                      {serviceName}
                    </h3>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">
                    {doctorName}
                  </p>
                  {app.reason && (
                    <p className="text-sm font-normal text-primary-gray mt-2 leading-relaxed">
                      {app.reason}
                    </p>
                  )}

                  {/* Pending payment helper banner */}
                  {isPendingPayment && (
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Payment pending. Click Pay Now or Verify if already debited.</span>
                    </div>
                  )}

                  {/* Telehealth Video Call link */}
                  {app.meeting_link && !isPendingPayment && (
                    <div className="mt-2.5">
                      <a
                        href={app.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-blue hover:underline bg-blue-50 px-2.5 py-1 rounded-lg"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Telehealth Video Call
                      </a>
                    </div>
                  )}
                </div>

                {/* Right Section: Status, Price & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col justify-between items-start md:items-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                  <div className="flex items-center md:items-end justify-between md:justify-start gap-4 md:flex-col w-full md:w-auto">
                    <Badge variant={getBadgeVariant(app.status)}>
                      {getStatusLabel(app.status)}
                    </Badge>
                    <span className="text-lg lg:text-xl font-bold text-primary-deepblue md:mt-1">
                      {priceText}
                    </span>
                  </div>

                  {/* Actions Group */}
                  {!isPast && (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      {/* For Pending Payment: Show Pay Now & Verify Payment */}
                      {isPendingPayment ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionLoading === `pay-${app.id}`}
                            onClick={() => handlePayNow(app)}
                            className="btn-primary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                          >
                            {actionLoading === `pay-${app.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5" />
                            )}
                            Pay Now
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={actionLoading === `verify-${app.id}`}
                            onClick={() => handleVerifyPayment(app)}
                            className="bg-blue-50 text-primary-blue hover:bg-blue-100 border-0 py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            {actionLoading === `verify-${app.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                            Verify
                          </Button>
                        </>
                      ) : null}

                      {/* Cancel Button */}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => cancelAppointment(app.id)}
                        className="bg-secondary-lightred text-primary-red py-1.5 px-3 text-xs border-0 hover:bg-red-100 font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-secondary-blue text-primary-blue rounded-2xl flex items-center justify-center mb-6">
              <CalendarDays className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-primary-deepblue">
              No appointments found
            </h3>
            <p className="text-sm text-primary-gray mt-2 max-w-sm font-medium">
              There are no appointments listed under the &quot;{activeTab}&quot; tab filter.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
