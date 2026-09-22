'use client';

import { useState } from 'react';
import { X, Activity, Heart, Thermometer, Weight, Info, CheckCircle2, AlertCircle, Scale, Droplet } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateVitalInput } from '@/src/hooks/useVitals';

interface InitialVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitVitals: (vitals: CreateVitalInput) => Promise<{ success: boolean; error?: string }>;
}

export function InitialVitalsModal({ isOpen, onClose, onSubmitVitals }: InitialVitalsModalProps) {
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    spo2: '',
    bloodSugar: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.systolic.trim()) {
      newErrors.systolic = 'Systolic BP is required';
    } else if (isNaN(Number(formData.systolic)) || Number(formData.systolic) <= 0) {
      newErrors.systolic = 'Enter a valid number';
    }

    if (!formData.diastolic.trim()) {
      newErrors.diastolic = 'Diastolic BP is required';
    } else if (isNaN(Number(formData.diastolic)) || Number(formData.diastolic) <= 0) {
      newErrors.diastolic = 'Enter a valid number';
    }

    if (!formData.heartRate.trim()) {
      newErrors.heartRate = 'Heart rate is required';
    } else if (isNaN(Number(formData.heartRate)) || Number(formData.heartRate) <= 0) {
      newErrors.heartRate = 'Enter a valid number';
    }

    if (!formData.temperature.trim()) {
      newErrors.temperature = 'Temperature is required';
    } else if (isNaN(Number(formData.temperature)) || Number(formData.temperature) <= 0) {
      newErrors.temperature = 'Enter a valid number';
    }

    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = 'Enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    const payload: CreateVitalInput = {
      blood_pressure_systolic: Number(formData.systolic),
      blood_pressure_diastolic: Number(formData.diastolic),
      heart_rate_bpm: Number(formData.heartRate),
      temperature_c: Number(formData.temperature),
      weight_kg: Number(formData.weight),
      height_cm: formData.height ? Number(formData.height) : null,
      spo2_percent: formData.spo2 ? Number(formData.spo2) : null,
      blood_sugar_mmol: formData.bloodSugar ? Number(formData.bloodSugar) : null,
      notes: formData.notes.trim() || null,
    };

    const res = await onSubmitVitals(payload);

    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } else {
      setServerError(res.error || 'Failed to save vitals. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop overlay dismissible on click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-primary-blue">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Record Your Initial Vitals</h3>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                Set up your baseline metrics for better health tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isSuccess ? (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 fill-emerald-50" />
              <h4 className="text-xl font-bold text-slate-900">Vitals Recorded Successfully!</h4>
              <p className="text-sm text-slate-500 max-w-sm font-normal">
                Your health metrics have been saved. Your care team now has your baseline information.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info banner */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex gap-3 text-slate-600">
                <Info className="h-5 w-5 text-primary-blue shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Recording your baseline vitals helps your doctor monitor your progress over time. Fields marked with <span className="text-red-500 font-bold">*</span> are required.
                </p>
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 text-xs">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Core Metrics Section (Required) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Core Health Metrics
                  </h4>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Blood Pressure */}
                  <div className="md:col-span-2">
                    <label className="text-[14px] font-semibold text-slate-800 block mb-2 select-none flex items-center gap-1.5">
                      <Heart className="h-4 w-4 text-red-500" />
                      Blood Pressure (mmHg) <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Systolic (e.g. 120)"
                        value={formData.systolic}
                        onChange={(e) => handleChange('systolic', e.target.value)}
                        error={errors.systolic}
                      />
                      <Input
                        placeholder="Diastolic (e.g. 80)"
                        value={formData.diastolic}
                        onChange={(e) => handleChange('diastolic', e.target.value)}
                        error={errors.diastolic}
                      />
                    </div>
                  </div>

                  {/* Heart Rate */}
                  <Input
                    label="Heart Rate (bpm) *"
                    placeholder="e.g 72"
                    leftIcon={<Activity className="h-4 w-4 text-rose-500" />}
                    value={formData.heartRate}
                    onChange={(e) => handleChange('heartRate', e.target.value)}
                    error={errors.heartRate}
                  />

                  {/* Temperature */}
                  <Input
                    label="Temperature (°C) *"
                    placeholder="e.g 36.5"
                    leftIcon={<Thermometer className="h-4 w-4 text-amber-500" />}
                    value={formData.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    error={errors.temperature}
                  />

                  {/* Weight */}
                  <div className="md:col-span-2">
                    <Input
                      label="Current Weight (kg) *"
                      placeholder="e.g 70"
                      leftIcon={<Weight className="h-4 w-4 text-blue-500" />}
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                      error={errors.weight}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Metrics Section (Optional) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Additional Metrics
                  </h4>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Optional
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Height (cm)"
                    placeholder="e.g 175"
                    leftIcon={<Scale className="h-4 w-4 text-emerald-500" />}
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                  />
                  <Input
                    label="Oxygen (SpO2 %)"
                    placeholder="e.g 98"
                    leftIcon={<Activity className="h-4 w-4 text-teal-500" />}
                    value={formData.spo2}
                    onChange={(e) => handleChange('spo2', e.target.value)}
                  />
                  <Input
                    label="Blood Sugar (mmol/L)"
                    placeholder="e.g 5.4"
                    leftIcon={<Droplet className="h-4 w-4 text-purple-500" />}
                    value={formData.bloodSugar}
                    onChange={(e) => handleChange('bloodSugar', e.target.value)}
                  />
                </div>


                <div className="space-y-2">
                  <label className="text-[14px] font-semibold text-slate-800 block select-none">
                    Additional Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any symptoms, conditions, or extra observations..."
                    className="w-full bg-white border border-slate-200 rounded-[10px] p-3 text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary-blue focus:ring-1 focus:ring-primary-blue outline-none transition-all"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto text-slate-600 border-slate-200 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto btn-primary py-3 px-6 rounded-xl text-sm font-bold shadow-sm"
                >
                  {isSubmitting ? 'Saving Vitals...' : 'Save & Continue'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
