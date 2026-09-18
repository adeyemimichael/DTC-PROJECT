'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api/client';
import { Appointment } from '@/lib/types/appointment';
import { formatAppointmentDate, formatPrice, formatDuration, isUpcoming } from '@/lib/utils/formatters';

export function NextAppointmentCard() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointment() {
      setLoading(true);
      const { data, error } = await fetchApi<Appointment[]>('/api/appointments');
      
      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      // Find next upcoming appointment
      const upcomingAppointments = data
        ?.filter(appointment => isUpcoming(appointment.scheduled_at))
        ?.filter(appointment => appointment.status === 'confirmed' || appointment.status === 'pending')
        ?.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

      setAppointment(upcomingAppointments?.[0] || null);
      setLoading(false);
    }

    loadAppointment();
  }, []);

  // Simplified state handling
  if (loading) return <Card className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary-blue mx-auto" /></Card>;
  if (error) return <Card className="p-12 text-center text-red-600">{error}</Card>;
  if (!appointment) return <Card className="p-12 text-center text-primary-gray">No upcoming appointments</Card>;

  // Success state - show appointment
  const badgeVariant = appointment.status === 'confirmed' ? 'success' : 'warning';

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-black flex items-center gap-2">
          <Calendar className="h-5 w-5 text-black" />
          Next Appointment
        </h3>
        <Badge variant={badgeVariant}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-6 mb-6">
        <div>
          <h4 className="text-xl font-semibold text-black">
            {appointment.services?.name || 'Consultation'}
          </h4>
          <p className="text-sm text-primary-gray mt-1 font-sans">
            {appointment.profiles?.full_name || 'Dr. Stephen Oguntoye'}
          </p>
        </div>
        <div className="text-2xl font-semibold text-black mt-3 md:mt-0">
          {formatPrice(appointment.services?.price || 0)}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div className="flex flex-wrap items-center gap-4 text-sm font-normal text-primary-gray">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary-gray" />
            {formatAppointmentDate(appointment.scheduled_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary-gray" />
            {formatDuration(appointment.services?.duration || 30)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button variant="secondary" size="sm" className="w-full sm:w-auto">
            View details
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            Reschedule
          </Button>
          <Button variant="danger" size="sm" className="bg-secondary-lightred text-primary-red w-full sm:w-auto border-0 hover:bg-red-100">
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
