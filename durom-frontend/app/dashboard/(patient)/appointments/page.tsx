'use client';

import { useState, useMemo } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { CalendarDays, Clock, Calendar } from 'lucide-react';

type FilterTab = 'all' | 'upcoming' | 'past';

interface Appointment {
  id: string;
  type: string;
  doctor: string;
  description: string;
  dateTime: string; // ISO string 
  duration: string;
  price: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    type: 'General Consultation',
    doctor: 'Dr. Stephen Adeyemi',
    description: 'Annual health check-up and blood work review',
    dateTime: '2026-06-03T10:30:00.000Z',
    duration: '30 min',
    price: '$49.00',
    status: 'confirmed',
  },
  {
    id: '2',
    type: 'Telemedicine',
    doctor: 'Dr. Stephen Adeyemi',
    description: 'Follow-up on blood pressure medication adjustment',
    dateTime: '2026-06-15T14:00:00.000Z',
    duration: '20 min',
    price: '$35.00',
    status: 'pending',
  },
  {
    id: '3',
    type: 'Specialist Care',
    doctor: 'Dr. Stephen Adeyemi',
    description: 'Back Pain Evaluation & Diagnostic Review',
    dateTime: '2026-05-18T11:45:00.000Z',
    duration: '45 min',
    price: '$150.00',
    status: 'completed',
  },
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

 // Filtering appointments
const filteredAppointments = mockAppointments.filter((appointment) => {
  const appDate = new Date(appointment.dateTime);
  const now = new Date('2026-06-01T00:00:00.000Z');
  
  if (activeTab === 'upcoming') {
    return appDate >= now && appointment.status !== 'cancelled';
  }
  
  if (activeTab === 'past') {
    return appDate < now || ['completed', 'cancelled'].includes(appointment.status);
  }
  
  return true; // 'all'
});

// Format date
const formatDateBlock = (dateString: string) => {
  const date = new Date(dateString);
  
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }), // 'Jan', 'Feb', etc.
    day: date.getDate(),
    time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
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
        <Button className="btn-primary flex items-center gap-2 shadow-sm w-full sm:w-auto">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </Button>
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
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const { month, day, time } = formatDateBlock(app.dateTime);
            const isPast = app.status === 'completed' || app.status === 'cancelled';

            return (
              <Card key={app.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
                
                {/* Left Section: Date & Time Info */}
                <div className="flex items-center gap-4 shrink-0 flex-row md:flex-col">
                  {/* Date Capsule Box */}
                  <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{month}</span>
                    <span className="text-xl lg:text-2xl font-medium text-primary-deepblue -mt-1">{day}</span>
                  </div>
                  
              
                  <div>
                    <p className="text-sm font-medium text-black">{time}</p>
                    <p className="text-xs font-normal text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {app.duration}
                    </p>
                  </div>
                </div>

                {/* Middle Section: Appointment description */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base lg:text-lg font-medium text-black truncate">{app.type}</h3>
                  <p className="text-sm font-medium text-slate-400 mt-0.5">{app.doctor}</p>
                  <p className="text-sm font-normal text-primary-gray mt-2 leading-relaxed">{app.description}</p>
                </div>

                {/* Right Section: Status, Price & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col justify-between items-start md:items-end gap-4 w-full md:w-auto shrink-0 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                  
                  <div className="flex items-center md:items-end justify-between md:justify-start gap-4 md:flex-col w-full md:w-auto">
                    <Badge variant={app.status === 'confirmed' ? 'success' : app.status === 'pending' ? 'warning' : 'subtle'}>
                      {app.status}
                    </Badge>
                    <span className="text-lg lg:text-xl font-medium text-primary-deepblue md:mt-1">{app.price}</span>
                  </div>

                  {/* Actions Group (Only if not past) */}
                  {!isPast && (
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        Reschedule
                      </Button>
                      <Button variant="danger" size="sm" className="bg-secondary-lightred text-primary-red w-full sm:w-auto border-0 hover:bg-red-100">
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
