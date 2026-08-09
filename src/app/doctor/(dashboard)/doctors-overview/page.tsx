'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Calendar, Clock, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useBooking } from '@/context/BookingContext';

interface ScheduleItem {
  id: string;
  time: string;
  duration: string;
  dotColor: string; // 'red' | 'amber' | 'blue' | 'emerald'
  avatar: string;
  name: string;
  details: string;
  status: 'start' | 'complete' | 'completed';
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

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    {
      id: '1',
      time: '9:00 AM',
      duration: '30 min',
      dotColor: 'bg-red-500',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      name: 'Sarah Mitchell',
      details: 'General Consultation · Room 3 · Annual health check-up and blood work review',
      status: 'start',
    },
    {
      id: '2',
      time: '9:45 AM',
      duration: '45 min',
      dotColor: 'bg-amber-500',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      name: 'Michael Chen',
      details: 'Specialist Care · Room 1 · Persistent migraines and neurological assessment',
      status: 'start',
    },
    {
      id: '3',
      time: '11:30 AM',
      duration: '30 min',
      dotColor: 'bg-blue-500',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      name: 'Emily Rodriguez',
      details: 'General Consultation · Room 2 · Follow-up on thyroid panel results',
      status: 'complete',
    },
    {
      id: '4',
      time: '2:00 PM',
      duration: '30 min',
      dotColor: 'bg-blue-500',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      name: 'David Thompson',
      details: 'Telemedicine · Virtual · Blood pressure medication review',
      status: 'complete',
    },
    {
      id: '5',
      time: '9:00 AM',
      duration: '30 min',
      dotColor: 'bg-emerald-500',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      name: 'Aisha Okonkwo',
      details: 'Specialist Care · Room 1 · Lower back pain — possible disc issue',
      status: 'completed',
    },
    {
      id: '6',
      time: '9:00 AM',
      duration: '30 min',
      dotColor: 'bg-emerald-500',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      name: 'Robert Kim',
      details: 'General Consultation · Room 2 · Seasonal allergy review',
      status: 'completed',
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

  const [selectedPatientModal, setSelectedPatientModal] = useState<ScheduleItem | null>(null);

  const handleActionClick = (id: string, action: 'start' | 'complete') => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (action === 'start') {
            return { ...item, status: 'complete' };
          } else if (action === 'complete') {
            return { ...item, status: 'completed', dotColor: 'bg-emerald-500' };
          }
        }
        return item;
      })
    );
  };

  const handleRequestDecision = (id: string, decision: 'approved' | 'declined') => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: decision } : req))
    );
  };

  const activeRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6 max-w-350 mx-auto pb-10">
      {/* Header Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
            Good morning, Dr. Adeyemi
          </h1>
          <p className="text-sm font-medium text-primary-gray  mt-1">
            Friday, July 17, 2026
          </p>
        </div>

        <button
          onClick={openBooking}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-red text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-sm shrink-0 cursor-pointer"
        >
          <Calendar className="h-4 w-4" />
          <span>Manage Appointment</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-600">Today&apos;s Appointments</span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">2/8</span>
            <p className="text-xs font-semibold text-amber-500 mt-1">6 remaining</p>
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-600">Total Patients</span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">5,247</span>
            <p className="text-xs font-semibold text-primary-red mt-1">Lifetime clinic patients</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-600">Pending Requests</span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">3</span>
            <p className="text-xs font-semibold text-amber-500 mt-1">Awaiting confirmation</p>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between">
          <span className="text-sm font-medium text-gray-600">Revenue This Month</span>
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">$12,450</span>
            <p className="text-xs font-semibold text-emerald-500 mt-1">+12.5% (24h)</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Left Column: Today's Schedule (2 cols wide) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="text-brand-red">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Today&apos;s Schedule</h2>
            </div>
            <span className="text-sm font-medium text-primary-gray ">
              2 completed · 4 remaining · 2 in progress
            </span>
          </div>

          {/* Schedule List */}
          <div className="space-y-3 ">
            {schedule.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#FCFCFC] hover:bg-[#f5f5f7] transition-colors duration-150"
              >
                {/* Left info */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Time */}
                  <div className="w-20 shrink-0 text-left">
                    <div className="text-sm font-bold text-gray-900">{item.time}</div>
                    <div className="text-sm text-primary-gray font-normal">{item.duration}</div>
                  </div>

                  {/* Dot indicator */}
                  <div className="shrink-0 flex items-center justify-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.dotColor}`} />
                  </div>

                  {/* Avatar */}
                  <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Patient & Consultation Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-primary-gray  truncate mt-0.5 font-normal">
                      {item.details}
                    </p>
                  </div>
                </div>

                {/* Right actions/status */}
                <div className="flex items-center gap-2 shrink-0 sm:self-center">
                  {item.status === 'start' && (
                    <button
                      onClick={() => handleActionClick(item.id, 'start')}
                      className="px-3.5 py-3 rounded-md bg-[#fff8ee] text-amber-500 text-sm font-sans hover:bg-amber-100 transition-colors"
                    >
                      Start
                    </button>
                  )}

                  {item.status === 'complete' && (
                    <button
                      onClick={() => handleActionClick(item.id, 'complete')}
                      className="px-3.5 py-3 rounded-md bg-[#e6f4ea] text-[#1e8e3e] text-sm font-sans hover:bg-emerald-100 transition-colors"
                    >
                      Complete
                    </button>
                  )}

                  {item.status === 'completed' && (
                    <span className="text-md font-sans text-primary-gray px-2 py-1">
                      Completed
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedPatientModal(item)}
                    className="px-3.5 py-3 rounded-md bg-[#f3f4f6] text-gray-700 text-md font-sans hover:bg-gray-200 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Requests (1 col wide) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Pending Requests</h2>
            </div>
            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
              {activeRequests.length}
            </span>
          </div>

          {/* Pending items */}
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-amber-500 bg-white space-y-3 shadow-2xs hover:border-gray-200 transition-all"
              >
                {/* Header row: Patient name + date/time */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{req.name}</h3>
                    <p className="text-sm font-medium text-primary-gray  mt-0.5">{req.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-primary-blue block">{req.time}</span>
                    <span className="text-sm font-semibold text-gray-400">{req.date}</span>
                  </div>
                </div>

                {/* Reason */}
                <p className="text-sm font-sans text-primary-gray leading-relaxed font-medium">
                  {req.reason}
                </p>

                {/* Status or Buttons */}
                {req.status === 'pending' ? (
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      onClick={() => handleRequestDecision(req.id, 'approved')}
                      className="flex-1 py-3 rounded-md bg-primary-red text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer text-center"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestDecision(req.id, 'declined')}
                      className="flex-1 py-3 rounded-md bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer text-center"
                    >
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="pt-1 flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-3 rounded-md w-full text-center ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-primary-red'
                      }`}
                    >
                      {req.status === 'approved' ? ' Approved' : ' Declined'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative border border-gray-100">
            <button
              onClick={() => setSelectedPatientModal(null)}
              className="absolute top-4 right-4 p-2 text-primary-gray  hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-full overflow-hidden border border-gray-200">
                <Image
                  src={selectedPatientModal.avatar}
                  alt={selectedPatientModal.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPatientModal.name}
                </h3>
                <p className="text-sm text-primary-gray  font-medium">
                  Appointment: {selectedPatientModal.time} ({selectedPatientModal.duration})
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
              <div>
                <span className="text-xs font-semibold text-primary-gray  uppercase tracking-wider block">
                  Consultation Details
                </span>
                <p className="text-gray-800 font-medium mt-1 p-3 rounded-sm">
                  {selectedPatientModal.details}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
