'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { X, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Service {
  name: string;
  duration: string;
  price: string;
}

const services: Service[] = [
  { name: 'General Consultation', duration: '30 minutes', price: '$75' },
  { name: 'Special Care', duration: '45 minutes', price: '$150' },
  { name: 'Telemedicine', duration: '20 minutes', price: '$45' },
];

const dates = [
  { day: 'Wed, June 3', slots: '4 slots available' },
  { day: 'Thur, June 4', slots: '5 slots available' },
  { day: 'Fri, June 5', slots: '3 slots available' },
  { day: 'Mon, June 8', slots: '2 slots available' },
  { day: 'Tue, June 9', slots: '4 slots available' },
  { day: 'Wed, June 10', slots: '4 slots available' },
];

const times = ['9:30 AM', '10:00 AM', '2:30 PM'];

export function BookAppointmentModal({ isOpen, onClose }: BookAppointmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [vitals, setVitals] = useState({
    weight: '',
    temperature: '',
    heartRate: '',
    systolic: '',
    diastolic: '',
    bloodSugar: '',
  });

  if (!isOpen) return null;

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setReason('');
    setVitals({
      weight: '',
      temperature: '',
      heartRate: '',
      systolic: '',
      diastolic: '',
      bloodSugar: '',
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    nextStep();
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    nextStep();
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    nextStep();
  };

  const handleVitalsChange = (field: string, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [1, 2, 3, 4, 5];

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
          
          {/* Stepper Progress Bar (Only show if not success step 6) */}
          {currentStep <= 5 && (
            <div className="flex items-center justify-between w-full max-w-sm mx-auto mb-8 select-none">
              {steps.map((step, idx) => (
                <React.Fragment key={step}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep >= step ? 'bg-primary-red text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                      currentStep > step ? 'bg-primary-red' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Subheader Back navigation (Only if step 2-5) */}
          {currentStep > 1 && currentStep <= 5 && (
            <button 
              onClick={prevStep}
              className="flex items-center gap-2 text-primary-deepblue hover:text-primary-blue font-medium text-base cursor-pointer select-none"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>
                {currentStep === 2 && `Select Date — ${selectedService?.name}`}
                {currentStep === 3 && `Select Time — ${selectedDate}`}
                {currentStep === 4 && 'Reason for Visit'}
                {currentStep === 5 && 'Record Current Vitals'}
              </span>
            </button>
          )}

          {/* Step 1: Select Service */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-black mb-2">Select Service</h4>
              <div className="space-y-3">
                {services.map((service, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleServiceSelect(service)}
                    className="w-full flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200 text-left cursor-pointer group"
                  >
                    <div>
                      <h5 className="font-normal text-primary-deepblue group-hover:text-primary-blue transition-colors">
                        {service.name}
                      </h5>
                      <span className="text-xs text-primary-gray font-normal block mt-0.5">{service.duration}</span>
                    </div>
                    <span className="text-base font-normal text-primary-deepblue">{service.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {dates.map((date, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDateSelect(date.day)}
                    className="w-full p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200 text-left cursor-pointer group"
                  >
                    <h5 className="font-normal text-primary-deepblue group-hover:text-primary-blue transition-colors">
                      {date.day}
                    </h5>
                    <span className="text-xs text-primary-gray font-normal block mt-0.5">{date.slots}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {times.map((time, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTimeSelect(time)}
                    className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200 text-center font-normal text-primary-deepblue hover:text-primary-blue cursor-pointer"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Reason for Visit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-semibold">Service</span>
                  <span className="text-primary-deepblue font-normal">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Date</span>
                  <span className="text-primary-deepblue font-normal">{selectedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Time</span>
                  <span className="text-primary-deepblue font-normal">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-medium">Duration</span>
                  <span className="text-primary-deepblue font-normal">{selectedService?.duration}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-200/60 pt-3">
                  <span className="text-slate-400 font-medium">Total</span>
                  <span className="text-primary-red font-normal">{selectedService?.price}</span>
                </div>
              </div>

              {/* Textarea Reason */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-normal text-primary-deepblue select-none">
                  Reason for Visit (optional)
                </label>
                <textarea
                  placeholder="Briefly describe your symptoms or your reasons for this appointment..."
                  value={reason}
                  maxLength={500}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full min-h-30 bg-white border border-slate-200 rounded-[10px] p-4 text-sm font-medium text-primary-deepblue placeholder:text-slate-400/70 outline-none hover:border-slate-300 focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all duration-200 resize-none"
                />
                <span className="text-[11px] font-normal text-slate-400 self-end">
                  {reason.length}/500
                </span>
              </div>

              {/* Submit Trigger */}
              <Button onClick={nextStep} className="w-full btn-primary py-4 rounded-xl text-base font-bold">
                Next: Record Vitals
              </Button>
            </div>
          )}

          {/* Step 5: Record Current Vitals */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* HIPAA Disclaimer Info block */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex gap-3 text-slate-500">
                <Info className="h-5 w-5 text-primary-blue shrink-0 mt-0.5" />
                <p className="text-xs font-normal leading-relaxed">
                  Tracking your vitals at every visit helps Dr. Stephen monitor trends over time. Investing in a bathroom scale, digital thermometer, and BP apparatus makes at-home tracking easy and reliable.
                </p>
              </div>

              {/* Vitals Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Current Weight (kg)"
                    placeholder="e.g 72"
                    value={vitals.weight}
                    onChange={(e) => handleVitalsChange('weight', e.target.value)}
                  />
                  <Input
                    label="Temperature (°C)"
                    placeholder="e.g 36.5"
                    value={vitals.temperature}
                    onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                  />
                </div>
                
                <Input
                  label="Heart Rate (bpm)"
                  placeholder="e.g 72"
                  value={vitals.heartRate}
                  onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
                />

                <div>
                  <label className="text-sm font-normal text-primary-deepblue block mb-2 select-none">
                    Blood Pressure (mmHg)
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      placeholder="Systolic"
                      value={vitals.systolic}
                      onChange={(e) => handleVitalsChange('systolic', e.target.value)}
                    />
                    <span className="text-slate-300 font-normal text-lg">/</span>
                    <Input
                      placeholder="Diastolic"
                      value={vitals.diastolic}
                      onChange={(e) => handleVitalsChange('diastolic', e.target.value)}
                    />
                  </div>
                </div>

                <Input
                  label="Fasting Blood Sugar (mg/dL) (Optional)"
                  placeholder="e.g 92"
                  value={vitals.bloodSugar}
                  onChange={(e) => handleVitalsChange('bloodSugar', e.target.value)}
                />
              </div>

              {/* Confirm Trigger */}
              <Button onClick={nextStep} className="w-full btn-primary py-4 rounded-xl text-base font-bold">
                Confirm Booking
              </Button>
            </div>
          )}

          {/* Step 6: Success State Screen overlay */}
          {currentStep === 6 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 fill-emerald-50" />
              <h4 className="text-xl font-bold text-primary-deepblue">Booking Confirmed!</h4>
              <p className="text-sm text-primary-gray max-w-xs font-semibold leading-relaxed">
                Your appointment for **{selectedService?.name}** on **{selectedDate}** at **{selectedTime}** has been successfully scheduled.
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
