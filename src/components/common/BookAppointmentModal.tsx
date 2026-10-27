'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '../ui';
import { X, ArrowLeft, CheckCircle2, Loader2, FileText, Calendar, Clock } from 'lucide-react';
import {
  useServices,
  useAppointments,
  useFileUpload,
  type Service,
} from '@/hooks';
import type { DayAvailableSlots, AvailableSlot } from '@/lib/types/appointment';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookAppointmentModal({ isOpen, onClose }: BookAppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<DayAvailableSlots | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [selectedUploadId, setSelectedUploadId] = useState<string>('');

  // 1. Services hook
  const { services, isLoadingServices, servicesError } = useServices();

  // 2. Appointments hook (slots fetching & booking)
  const {
    fetchAvailableSlotsRange,
    bookAppointment,
    isBooking,
  } = useAppointments({ autoFetch: false });

  // 3. File upload hook (for attaching medical documents/scans to the appointment)
  const { uploads, fetchUploads, isFetching: isFetchingUploads } = useFileUpload();

  // Dynamic slot dates state
  const [availableDays, setAvailableDays] = useState<DayAvailableSlots[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch patient uploads when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUploads();
    }
  }, [isOpen, fetchUploads]);

  if (!isOpen) return null;

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedDay(null);
    setSelectedSlot(null);
    setSelectedTime('');
    setReason('');
    setSelectedUploadId('');
    setAvailableDays([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Step 1: Select Service & Fetch dynamic slots for the next 7 days
  const handleServiceSelect = async (service: Service) => {
    setSelectedService(service);
    setIsLoadingSlots(true);
    nextStep();

    try {
      const daysData = await fetchAvailableSlotsRange(service.id, 7);
      setAvailableDays(daysData);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Step 2: Select Date
  const handleDateSelect = (dayObj: DayAvailableSlots) => {
    if (dayObj.available_count === 0) return;
    setSelectedDay(dayObj);
    setSelectedDate(dayObj.date);
    nextStep();
  };

  // Step 3: Select Time Slot
  const handleTimeSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setSelectedTime(slot.label);
    nextStep();
  };

  // Step 4: Submit Booking & redirect to Paystack
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedSlot) return;

    const res = await bookAppointment({
      service_id: selectedService.id,
      scheduled_at: selectedSlot.start_iso,
      reason: reason.trim() || undefined,
      patient_upload_id: selectedUploadId || undefined,
    });

    if (res.success && !res.redirecting) {
      nextStep();
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  const steps = [1, 2, 3, 4];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop clickaway */}
      <div className="absolute inset-0 cursor-default" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-8 duration-300">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-bold text-primary-deepblue">Book Appointment</h3>
          <button
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-primary-deepblue hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Stepper Progress Bar (Only show if not success step 5) */}
          {currentStep <= 4 && (
            <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-8 select-none">
              {steps.map((step, idx) => (
                <React.Fragment key={step}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${currentStep >= step ? 'bg-primary-red text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                    {step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${currentStep > step ? 'bg-primary-red' : 'bg-slate-200'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Subheader Back navigation (Only if step 2-4) */}
          {currentStep > 1 && currentStep <= 4 && (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-primary-deepblue hover:text-primary-blue font-medium text-base cursor-pointer select-none"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>
                {currentStep === 2 && `Select Date — ${selectedService?.name}`}
                {currentStep === 3 && `Select Time — ${selectedDate ? formatDateDisplay(selectedDate) : ''}`}
                {currentStep === 4 && 'Details & Confirm'}
              </span>
            </button>
          )}

          {/* Step 1: Select Service */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-black mb-2">Select Service</h4>
              <div className="space-y-3">
                {servicesError ? (
                  <p className="text-sm text-rose-500 font-normal py-6 text-center">
                    {servicesError}
                  </p>
                ) : isLoadingServices ? (
                  <p className="text-sm text-slate-400 font-normal py-6 text-center flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary-blue" />
                    Loading services...
                  </p>
                ) : services.length === 0 ? (
                  <p className="text-sm text-slate-400 font-normal py-6 text-center">
                    No services available right now.
                  </p>
                ) : (
                  services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="w-full flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200 text-left cursor-pointer group"
                    >
                      <div>
                        <h5 className="font-semibold text-primary-deepblue group-hover:text-primary-blue transition-colors">
                          {service.name}
                        </h5>
                        <span className="text-xs text-primary-gray font-normal block mt-0.5">
                          {service.duration_minutes} minutes
                        </span>
                      </div>
                      <span className="text-base font-bold text-primary-deepblue">
                        {service.currency || 'NGN'} {Number(service.price).toLocaleString()}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Select Date */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-black mb-2">Select an Available Date</h4>

              {isLoadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-blue" />
                  <p className="text-sm text-slate-500 font-medium">Checking doctor availability...</p>
                </div>
              ) : availableDays.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No upcoming dates available right now.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableDays.map((dayObj) => {
                    const isAvailable = dayObj.available_count > 0;
                    return (
                      <button
                        key={dayObj.date}
                        disabled={!isAvailable}
                        onClick={() => handleDateSelect(dayObj)}
                        className={`w-full p-4 border rounded-xl text-left transition-all duration-200 ${
                          isAvailable
                            ? 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer group'
                            : 'border-slate-100/60 bg-slate-50/40 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className={`h-4 w-4 ${isAvailable ? 'text-primary-blue' : 'text-slate-400'}`} />
                          <h5 className={`font-semibold text-sm ${isAvailable ? 'text-primary-deepblue group-hover:text-primary-blue' : 'text-slate-400'}`}>
                            {formatDateDisplay(dayObj.date)}
                          </h5>
                        </div>
                        <span className={`text-xs block ${isAvailable ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                          {isAvailable
                            ? `${dayObj.available_count} slot${dayObj.available_count > 1 ? 's' : ''} available`
                            : 'No slots available'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Time */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-black mb-2">Select a Time Slot</h4>

              {!selectedDay || selectedDay.slots.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No available time slots on this day. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {selectedDay.slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot)}
                      className="p-3 border border-slate-200/80 rounded-xl hover:border-primary-blue hover:bg-blue-50/50 transition-all text-center font-semibold text-xs md:text-sm text-primary-deepblue hover:text-primary-blue cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Reason, Document Selection & Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-5">
              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Service</span>
                  <span className="text-primary-deepblue font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Date</span>
                  <span className="text-primary-deepblue font-semibold">
                    {selectedDate ? formatDateDisplay(selectedDate) : ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Time</span>
                  <span className="text-primary-deepblue font-semibold">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Duration</span>
                  <span className="text-primary-deepblue font-semibold">
                    {selectedService ? `${selectedService.duration_minutes} minutes` : ''}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200/60 pt-2.5">
                  <span className="text-slate-500 font-semibold">Total Fee</span>
                  <span className="text-primary-red font-bold text-base">
                    {selectedService ? `${selectedService.currency || 'NGN'} ${Number(selectedService.price).toLocaleString()}` : ''}
                  </span>
                </div>
              </div>

              {/* Attach Existing Uploaded Document */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary-blue" />
                  Attach Uploaded Medical Document (optional)
                </label>
                <select
                  value={selectedUploadId}
                  onChange={(e) => setSelectedUploadId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-800 focus:border-primary-blue focus:outline-none transition-colors"
                >
                  <option value="">None — No document attached</option>
                  {uploads.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.description || `${doc.category} (${doc.file_type})`} — {new Date(doc.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {uploads.length === 0 && !isFetchingUploads && (
                  <span className="text-[11px] text-slate-400 font-normal">
                    You have no uploaded documents. You can upload files anytime in your Medical Records.
                  </span>
                )}
              </div>

              {/* Textarea Reason */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Reason for Visit (optional)
                </label>
                <textarea
                  placeholder="Briefly describe your symptoms or reason for this appointment..."
                  value={reason}
                  maxLength={500}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full min-h-[90px] bg-white border border-slate-200 rounded-xl p-3.5 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-primary-blue transition-colors resize-none"
                />
                <span className="text-[11px] font-normal text-slate-400 self-end">
                  {reason.length}/500
                </span>
              </div>

              {/* Submit Trigger */}
              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full btn-primary py-3.5 rounded-xl text-sm md:text-base font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                {isBooking && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                {isBooking ? 'Securing Slot & Opening Paystack...' : 'Confirm & Proceed to Payment'}
              </Button>
            </div>
          )}

          {/* Success State Screen */}
          {currentStep === 5 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 fill-emerald-50" />
              <h4 className="text-xl font-bold text-primary-deepblue">Booking Created!</h4>
              <p className="text-sm text-primary-gray max-w-xs font-semibold leading-relaxed">
                Your appointment for <strong>{selectedService?.name}</strong> on <strong>{selectedDate ? formatDateDisplay(selectedDate) : ''}</strong> at <strong>{selectedTime}</strong> has been registered.
              </p>
              <div className="w-full pt-4 max-w-xs">
                <Button onClick={handleClose} className="w-full btn-primary py-3 rounded-xl text-sm font-bold">
                  Done
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
