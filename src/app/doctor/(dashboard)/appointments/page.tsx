'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, Search, X, FileText, Video } from 'lucide-react';
import {
  AppointmentDetailsModal,
  AppointmentData,
} from '@/components/common/AppointmentDetailsModal';

export default function DoctorAppointmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'all' | 'pending' | 'upcoming' | 'completed'
  >('all');
  const [activeModalAppointment, setActiveModalAppointment] =
    useState<AppointmentData | null>(null);

  const [appointments, setAppointments] = useState<AppointmentData[]>([
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
  ]);

  const handleUpdateAppointment = (updated: AppointmentData) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === updated.id ? updated : apt))
    );
    setActiveModalAppointment(updated);
  };

  const handleApprove = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: 'upcoming' } : apt
      )
    );
  };

  const handleDecline = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  // Counts for filter pills
  const pendingCount = 0; // Or if any pending
  const upcomingCount = appointments.filter((a) => a.status === 'upcoming')
    .length;
  const completedCount = appointments.filter((a) => a.status === 'completed')
    .length;
  const inProgressCount = appointments.filter((a) => a.status === 'in_progress')
    .length;

  // Filtered appointment list
  const filteredAppointments = appointments.filter((apt) => {
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = false;
    if (activeTab === 'upcoming')
      matchesTab = apt.status === 'upcoming' || apt.status === 'in_progress';
    if (activeTab === 'completed') matchesTab = apt.status === 'completed';

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      apt.patientName.toLowerCase().includes(query) ||
      apt.type.toLowerCase().includes(query) ||
      apt.reason.toLowerCase().includes(query) ||
      apt.time.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Good morning, Dr. Adeyemi
          </h1>
          <p className="text-base font-medium text-primary-gray mt-1.5">
            Manage all patient appointments
          </p>
        </div>

        {/* Search Input Box */}
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-200/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingCount + inProgressCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-white text-gray-900 shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Main Appointments Card List */}
      <div className="bg-white rounded-2xl p-6 lg:p-7 border border-gray-100 shadow-xs space-y-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-primary-red">
              <Calendar className="h-6 w-6" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
              All Appointments
            </h2>
          </div>
          <span className="text-[15px] font-medium text-primary-gray">
            {completedCount} completed · {upcomingCount} remaining ·{' '}
            {inProgressCount} in progress
          </span>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
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
                {/* Left info */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Time & duration */}
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
                    <span
                      className={`h-3 w-3 rounded-full ${
                        item.status === 'upcoming'
                          ? 'bg-amber-500'
                          : item.status === 'in_progress'
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Avatar */}
                  <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                    <Image
                      src={item.avatar}
                      alt={item.patientName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Patient & Consultation details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                      {item.patientName}
                    </h3>
                    <p className="text-[15px] text-primary-gray truncate mt-1 font-normal">
                      {item.type} · {item.room} · {item.reason}
                    </p>
                  </div>
                </div>

                {/* Right action buttons / status */}
                <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
                  {/* Upcoming status: Start + Details */}
                  {item.status === 'upcoming' && (
                    <>
                      <button
                        onClick={() => setActiveModalAppointment(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#fff8ee] text-amber-600 text-[15px] font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => setActiveModalAppointment(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </>
                  )}

                  {/* In Progress status: Complete + Details */}
                  {item.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => setActiveModalAppointment(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#e6f4ea] text-[#1e8e3e] text-[15px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => setActiveModalAppointment(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#f3f4f6] text-gray-700 text-[15px] font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </>
                  )}

                  {/* Completed status: Completed text + View Notes */}
                  {item.status === 'completed' && (
                    <>
                      <span className="text-[15px] font-semibold text-primary-gray px-3 py-1">
                        Completed
                      </span>
                      <button
                        onClick={() => setActiveModalAppointment(item)}
                        className="px-5 py-2.5 rounded-lg bg-[#e8f0fe] text-primary-blue text-[15px] font-semibold hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="h-4 w-4" />
                        <span>View Notes</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
