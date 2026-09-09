'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';
import {
  AppointmentDetailsModal,
  AppointmentData,
} from '@/components/common/AppointmentDetailsModal';

interface ScheduleItem {
  id: string;
  time: string;
  duration: string;
  dotColor: string;
  avatar: string;
  name: string;
  details: string;
  status: 'start' | 'complete' | 'completed';
  appointmentData: AppointmentData;
}

interface PendingRequest {
  id: string;
  name: string;
  time: string;
  date: string;
  type: string;
  reason: string;
  status?: 'pending' | 'approved' | 'declined';
}

export default function DoctorsOverviewPage() {
  const openBooking = useBooking();

  const [activeModalAppointment, setActiveModalAppointment] =
    useState<AppointmentData | null>(null);

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    {
      id: '1',
      time: '9:00 AM',
      duration: '30 min',
      dotColor: 'bg-red-500',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      name: 'Sarah Mitchell',
      details:
        'General Consultation · Room 3 · Annual health check-up and blood work review',
      status: 'start',
      appointmentData: {
        id: 'pat-001',
        patientName: 'Sarah Mitchell',
        age: '37',
        gender: 'Female',
        bloodType: 'O+',
        avatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        date: 'Saturday, July 18, 2026',
        time: '9:00 AM',
        duration: '30 min',
        room: 'Room 3',
        isVirtual: false,
        type: 'General Consultation',
        patientId: 'pat-001',
        reason: 'Annual health check-up and blood work review',
        knownConditions: ['Seasonal Allergies', 'Migraine (occasional)'],
        phone: '+1 (312) 555-0184',
        email: 'sarah.mitchell@email.com',
        status: 'upcoming',
      },
    },
    {
      id: '2',
      time: '9:45 AM',
      duration: '45 min',
      dotColor: 'bg-amber-500',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      name: 'Michael Chen',
      details:
        'Specialist Care · Room 1 · Persistent migraines and neurological assessment',
      status: 'start',
      appointmentData: {
        id: 'pat-002',
        patientName: 'Michael Chen',
        age: '42',
        gender: 'Male',
        bloodType: 'A+',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        date: 'Saturday, July 18, 2026',
        time: '9:45 AM',
        duration: '45 min',
        room: 'Room 1',
        isVirtual: false,
        type: 'Specialist Care',
        patientId: 'pat-002',
        reason: 'Persistent migraines and neurological assessment',
        knownConditions: ['Hypertension', 'Tension Headaches'],
        phone: '+1 (312) 555-0199',
        email: 'michael.chen@email.com',
        status: 'upcoming',
      },
    },
    {
      id: '3',
      time: '11:30 AM',
      duration: '30 min',
      dotColor: 'bg-blue-500',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      name: 'Emily Rodriguez',
      details:
        'General Consultation · Room 2 · Follow-up on thyroid panel results',
      status: 'complete',
      appointmentData: {
        id: 'pat-003',
        patientName: 'Emily Rodriguez',
        age: '29',
        gender: 'Female',
        bloodType: 'B+',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        date: 'Saturday, July 18, 2026',
        time: '11:30 AM',
        duration: '30 min',
        room: 'Room 2',
        isVirtual: false,
        type: 'General Consultation',
        patientId: 'pat-003',
        reason: 'Follow-up on thyroid panel results',
        knownConditions: ['Hypothyroidism'],
        phone: '+1 (312) 555-0123',
        email: 'emily.rodriguez@email.com',
        status: 'in_progress',
      },
    },
    {
      id: '4',
      time: '2:00 PM',
      duration: '30 min',
      dotColor: 'bg-blue-500',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      name: 'David Thompson',
      details: 'Telemedicine · Virtual · Blood pressure medication review',
      status: 'complete',
      appointmentData: {
        id: 'pat-004',
        patientName: 'David Thompson',
        age: '51',
        gender: 'Male',
        bloodType: 'AB+',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        date: 'Saturday, July 18, 2026',
        time: '2:00 PM',
        duration: '30 min',
        room: 'Virtual',
        isVirtual: true,
        meetLink: 'https://meet.google.com/durom-clinic-room3',
        type: 'Telemedicine',
        patientId: 'pat-004',
        reason: 'Blood pressure medication review',
        knownConditions: ['Stage 1 Hypertension'],
        phone: '+1 (312) 555-0177',
        email: 'david.thompson@email.com',
        status: 'in_progress',
      },
    },
    {
      id: '5',
      time: '9:00 AM',
      duration: '30 min',
      dotColor: 'bg-emerald-500',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      name: 'Aisha Okonkwo',
      details: 'Specialist Care · Room 1 · Lower back pain — possible disc issue',
      status: 'completed',
      appointmentData: {
        id: 'pat-005',
        patientName: 'Aisha Okonkwo',
        age: '34',
        gender: 'Female',
        bloodType: 'O-',
        avatar:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        date: 'Saturday, July 18, 2026',
        time: '9:00 AM',
        duration: '30 min',
        room: 'Room 1',
        isVirtual: false,
        type: 'Specialist Care',
        patientId: 'pat-005',
        reason: 'Lower back pain — possible disc issue',
        knownConditions: ['Lumbar Strain'],
        phone: '+1 (312) 555-0144',
        email: 'aisha.okonkwo@email.com',
        status: 'completed',
        consultationNotes:
          'L4-L5 lumbar strain confirmed. Recommended physical therapy twice weekly and prescribed anti-inflammatory treatment.',
        doctorName: 'Dr. Stephen Adeyemi',
        completedDate: 'May 30, 2026',
        medicalFile: {
          name: 'Lumbar Spine X-Ray',
          type: 'Imaging Scan',
          date: '2026-05-30',
          doctor: 'Dr. Stephen Adeyemi',
        },
      },
    },
    {
      id: '6',
      time: '9:00 AM',
      duration: '30 min',
      dotColor: 'bg-emerald-500',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      name: 'Robert Kim',
      details: 'General Consultation · Room 2 · Seasonal allergy review',
      status: 'completed',
      appointmentData: {
        id: 'pat-006',
        patientName: 'Robert Kim',
        age: '45',
        gender: 'Male',
        bloodType: 'A-',
        avatar:
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        date: 'Saturday, July 18, 2026',
        time: '9:00 AM',
        duration: '30 min',
        room: 'Room 2',
        isVirtual: false,
        type: 'General Consultation',
        patientId: 'pat-006',
        reason: 'Seasonal allergy review',
        knownConditions: ['Allergic Rhinitis'],
        phone: '+1 (312) 555-0188',
        email: 'robert.kim@email.com',
        status: 'completed',
        consultationNotes:
          'TSH levels normalized. Continue current levothyroxine dosage. Patient reports improved energy levels.',
        doctorName: 'Dr. Stephen Adeyemi',
        completedDate: 'May 30, 2026',
        medicalFile: {
          name: 'Lipid Panel',
          type: 'Lab Result',
          date: '2026-05-18',
          doctor: 'Dr. Stephen Adeyemi',
        },
      },
    },
  ]);

  const [requests, setRequests] = useState<PendingRequest[]>([
    {
      id: 'r1',
      name: 'Marcus Wright',
      time: '9:00 AM',
      date: 'Thu, Jun 4',
      type: 'General Consultation',
      reason: 'Reason: New patient — comprehensive physical examination',
      status: 'pending',
    },
    {
      id: 'r2',
      name: 'Linda Thompson',
      time: '2:00 PM',
      date: 'Fri, Jun 5',
      type: 'General Consultation',
      reason: 'Reason: New patient — routine check-up and blood work',
      status: 'pending',
    },
    {
      id: 'r3',
      name: 'Sarah Mitchell',
      time: '2:00 PM',
      date: 'Mon, Jun 15',
      type: 'Telemedicine',
      reason: 'Reason: Follow-up on blood pressure medication adjustment',
      status: 'pending',
    },
  ]);

  const handleUpdateAppointment = (updated: AppointmentData) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.appointmentData.id === updated.id) {
          const newStatus =
            updated.status === 'upcoming'
              ? 'start'
              : updated.status === 'in_progress'
              ? 'complete'
              : 'completed';
          const newDotColor =
            updated.status === 'upcoming'
              ? 'bg-amber-500'
              : updated.status === 'in_progress'
              ? 'bg-blue-500'
              : 'bg-emerald-500';

          return {
            ...item,
            status: newStatus,
            dotColor: newDotColor,
            appointmentData: updated,
          };
        }
        return item;
      })
    );
    setActiveModalAppointment(updated);
  };

  const handleRequestDecision = (
    id: string,
    decision: 'approved' | 'declined'
  ) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: decision } : req))
    );
  };

  const activeRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Good morning, Dr. Adeyemi
          </h1>
          <p className="text-base font-medium text-primary-gray mt-1.5">
            Friday, July 17, 2026
          </p>
        </div>

        <button
          onClick={openBooking}
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary-red text-white font-semibold text-base hover:opacity-90 transition-all duration-200 shadow-sm shrink-0 cursor-pointer"
        >
          <Calendar className="h-5 w-5" />
          <span>Manage Appointment</span>
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
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              2/8
            </span>
            <p className="text-sm font-semibold text-amber-500 mt-1.5">
              6 remaining
            </p>
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-base font-medium text-gray-600">
            Total Patients
          </span>
          <div className="mt-3.5">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              5,247
            </span>
            <p className="text-sm font-semibold text-primary-red mt-1.5">
              Lifetime clinic patients
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-base font-medium text-gray-600">
            Pending Requests
          </span>
          <div className="mt-3.5">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              3
            </span>
            <p className="text-sm font-semibold text-amber-500 mt-1.5">
              Awaiting confirmation
            </p>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-base font-medium text-gray-600">
            Revenue This Month
          </span>
          <div className="mt-3.5">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              $12,450
            </span>
            <p className="text-sm font-semibold text-emerald-500 mt-1.5">
              +12.5% (24h)
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Today's Schedule (2 cols wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 lg:p-7 border border-gray-100 shadow-xs">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="text-primary-red">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Today&apos;s Schedule
              </h2>
            </div>
            <span className="text-[15px] font-medium text-primary-gray">
              2 completed · 4 remaining · 2 in progress
            </span>
          </div>

          {/* Schedule List */}
          <div className="space-y-4">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 rounded-2xl bg-[#FCFCFC] hover:bg-[#f5f5f7] transition-colors duration-150 border border-slate-100/60"
              >
                {/* Left info */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Time */}
                  <div className="w-24 shrink-0 text-left">
                    <div className="text-base font-bold text-gray-900">
                      {item.time}
                    </div>
                    <div className="text-sm text-primary-gray font-normal mt-0.5">
                      {item.duration}
                    </div>
                  </div>

                  {/* Dot indicator */}
                  <div className="shrink-0 flex items-center justify-center">
                    <span className={`h-3 w-3 rounded-full ${item.dotColor}`} />
                  </div>

                  {/* Avatar */}
                  <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Patient & Consultation Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-[15px] text-primary-gray truncate mt-1 font-normal">
                      {item.details}
                    </p>
                  </div>
                </div>

                {/* Right actions/status */}
                <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
                  {item.status === 'start' && (
                    <button
                      onClick={() =>
                        setActiveModalAppointment(item.appointmentData)
                      }
                      className="px-4 py-2.5 rounded-lg bg-[#fff8ee] text-amber-600 text-[15px] font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      Start
                    </button>
                  )}

                  {item.status === 'complete' && (
                    <button
                      onClick={() =>
                        setActiveModalAppointment(item.appointmentData)
                      }
                      className="px-4 py-2.5 rounded-lg bg-[#e6f4ea] text-[#1e8e3e] text-[15px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  )}

                  {item.status === 'completed' && (
                    <span className="text-[15px] font-semibold text-primary-gray px-3 py-1">
                      Completed
                    </span>
                  )}

                  <button
                    onClick={() =>
                      setActiveModalAppointment(item.appointmentData)
                    }
                    className="px-4 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Requests (1 col wide) */}
        <div className="bg-white rounded-2xl p-6 lg:p-7 border border-gray-100 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <Clock className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Pending Requests
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
              {activeRequests.length}
            </span>
          </div>

          {/* Pending items */}
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl border border-amber-500/40 bg-white space-y-3.5 shadow-2xs hover:border-amber-500 transition-all"
              >
                {/* Header row: Patient name + date/time */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {req.name}
                    </h3>
                    <p className="text-[15px] font-medium text-primary-gray mt-0.5">
                      {req.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-primary-blue block">
                      {req.time}
                    </span>
                    <span className="text-sm font-semibold text-gray-400">
                      {req.date}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <p className="text-[15px] text-primary-gray leading-relaxed font-normal">
                  {req.reason}
                </p>

                {/* Status or Buttons */}
                {req.status === 'pending' ? (
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleRequestDecision(req.id, 'approved')}
                      className="flex-1 py-3 rounded-xl bg-primary-red text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer text-center"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestDecision(req.id, 'declined')}
                      className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer text-center"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="pt-1 flex items-center gap-2">
                    <span
                      className={`text-sm font-bold px-3 py-2.5 rounded-xl w-full text-center ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-primary-red'
                      }`}
                    >
                      {req.status === 'approved' ? '✓ Approved' : '✕ Declined'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Step Interactive Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={Boolean(activeModalAppointment)}
        onClose={() => setActiveModalAppointment(null)}
        appointment={activeModalAppointment}
        onUpdateAppointment={handleUpdateAppointment}
      />
    </div>
  );
}
