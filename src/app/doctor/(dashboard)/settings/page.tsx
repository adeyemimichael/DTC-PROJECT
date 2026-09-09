'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Clock,
  Plus,
  Edit2,
  Check,
  Lock,
  Video,
  Upload,
  X,
  AlertCircle,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  duration: string;
  price: number;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  day: string;
  active: boolean;
  slots: TimeSlot[];
}

export default function DoctorSettingsPage() {
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // 1. Account Information State
  const [accountInfo, setAccountInfo] = useState({
    firstName: 'Dr. Stephen',
    lastName: 'Adeyemi',
    email: 'dr.adeyemi@duromsclinic.com',
    phone: '+1 (312) 555-0100',
    specialty: 'Internal Medicine',
    license: 'IL-MD-094721',
    experience: '18+ years',
    qualifications: 'M.D. Royal College of Physicians (UK)',
    avatar: '/images/stephen.jpg',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAccountInfo((prev) => ({ ...prev, avatar: url }));
      showToast('Profile photo updated successfully!');
    }
  };

  const handleSaveAccountInfo = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Account information updated successfully!');
  };

  // 2. Services & Pricing State
  const [services, setServices] = useState<ServiceItem[]>([
    { id: '1', name: 'General Consultation', duration: '30 min', price: 75 },
    { id: '2', name: 'Specialist Care', duration: '45 min', price: 150 },
    { id: '3', name: 'Telemedicine', duration: '20 min', price: 50 },
  ]);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', duration: '30 min', price: '' });

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({ name: '', duration: '30 min', price: '' });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      duration: service.duration,
      price: service.price.toString(),
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) return;

    if (editingService) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: serviceForm.name,
                duration: serviceForm.duration,
                price: parseFloat(serviceForm.price) || 0,
              }
            : s
        )
      );
      showToast('Service updated successfully!');
    } else {
      const newService: ServiceItem = {
        id: Date.now().toString(),
        name: serviceForm.name,
        duration: serviceForm.duration,
        price: parseFloat(serviceForm.price) || 0,
      };
      setServices((prev) => [...prev, newService]);
      showToast('New service added successfully!');
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Service removed.');
  };

  // 3. Weekly Availability State
  const [availability, setAvailability] = useState<DayAvailability[]>([
    {
      day: 'Monday',
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Tuesday',
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Wednesday',
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Thursday',
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Friday',
      active: true,
      slots: [
        { start: '8:00 AM', end: '12:00 PM' },
        { start: '2:00 PM', end: '5:00 PM' },
      ],
    },
    {
      day: 'Saturday',
      active: false,
      slots: [],
    },
    {
      day: 'Sunday',
      active: false,
      slots: [],
    },
  ]);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [tempAvailability, setTempAvailability] = useState<DayAvailability[]>([]);

  const handleOpenScheduleModal = () => {
    setTempAvailability(JSON.parse(JSON.stringify(availability)));
    setIsScheduleModalOpen(true);
  };

  const handleToggleDay = (index: number) => {
    setTempAvailability((prev) => {
      const updated = [...prev];
      const dayObj = { ...updated[index] };
      dayObj.active = !dayObj.active;
      if (dayObj.active && dayObj.slots.length === 0) {
        dayObj.slots = [{ start: '8:00 AM', end: '12:00 PM' }];
      }
      updated[index] = dayObj;
      return updated;
    });
  };

  const handleAddBlock = (dayIndex: number) => {
    setTempAvailability((prev) => {
      const updated = [...prev];
      const dayObj = { ...updated[dayIndex] };
      const lastSlot = dayObj.slots[dayObj.slots.length - 1];
      const newStart = lastSlot ? '1:00 PM' : '9:00 AM';
      const newEnd = lastSlot ? '5:00 PM' : '1:00 PM';
      dayObj.slots = [...dayObj.slots, { start: newStart, end: newEnd }];
      updated[dayIndex] = dayObj;
      return updated;
    });
  };

  const handleRemoveBlock = (dayIndex: number, slotIndex: number) => {
    setTempAvailability((prev) => {
      const updated = [...prev];
      const dayObj = { ...updated[dayIndex] };
      dayObj.slots = dayObj.slots.filter((_, idx) => idx !== slotIndex);
      updated[dayIndex] = dayObj;
      return updated;
    });
  };

  const handleUpdateSlotTime = (
    dayIndex: number,
    slotIndex: number,
    field: 'start' | 'end',
    val: string
  ) => {
    setTempAvailability((prev) => {
      const updated = [...prev];
      const dayObj = { ...updated[dayIndex] };
      const slots = [...dayObj.slots];
      slots[slotIndex] = { ...slots[slotIndex], [field]: val };
      dayObj.slots = slots;
      updated[dayIndex] = dayObj;
      return updated;
    });
  };

  const handleSaveSchedule = () => {
    setAvailability(tempAvailability);
    setIsScheduleModalOpen(false);
    showToast('Weekly schedule updated successfully!');
  };

  // Calculate stats for availability
  const activeDaysCount = availability.filter((a) => a.active).length;
  const timeBlocksCount = availability.reduce(
    (acc, curr) => acc + (curr.active ? curr.slots.length : 0),
    0
  );

  const tempActiveDaysCount = tempAvailability.filter((a) => a.active).length;
  const tempTimeBlocksCount = tempAvailability.reduce(
    (acc, curr) => acc + (curr.active ? curr.slots.length : 0),
    0
  );

  // 4. Meeting Link State
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/dr-adeyemi-consult');

  const handleSaveMeetingLink = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Meeting link saved successfully!');
  };

  // 5. Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('Please fill in all required password fields', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    showToast('Password changed successfully!');
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />

      {/* CARD 1: Account Information */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6">Account Information</h2>

        <form onSubmit={handleSaveAccountInfo} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Avatar Column */}
            <div className="flex flex-col items-center shrink-0 mx-auto md:mx-0">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner group">
                <Image
                  src={accountInfo.avatar}
                  alt={accountInfo.firstName}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-xs md:text-sm font-semibold text-[#0149ff] hover:text-blue-700 hover:underline transition-colors focus:outline-none"
              >
                Change Photo
              </button>
            </div>

            {/* Form Fields Column */}
            <div className="flex-1 w-full space-y-4">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={accountInfo.firstName}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={accountInfo.lastName}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={accountInfo.email}
                  onChange={(e) =>
                    setAccountInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                />
              </div>

              {/* Row 3: Phone Number & Specialty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={accountInfo.phone}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={accountInfo.specialty}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, specialty: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Medical License & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Medical License
                  </label>
                  <input
                    type="text"
                    value={accountInfo.license}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, license: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={accountInfo.experience}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, experience: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 5: Qualifications */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Qualifications
                </label>
                <input
                  type="text"
                  value={accountInfo.qualifications}
                  onChange={(e) =>
                    setAccountInfo((prev) => ({ ...prev, qualifications: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#f80400] hover:bg-[#d80300] text-white px-7 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs active:scale-[0.99]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* CARD 2: Services & Pricing */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-5">Services & Pricing</h2>

        <div className="space-y-3 mb-5">
          {services.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-all"
            >
              <div>
                <h3 className="text-sm md:text-base font-semibold text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">{item.duration}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-base md:text-lg font-bold text-[#f80400]">
                  ${item.price}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenEditService(item)}
                  className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleOpenAddService}
          className="text-[#0149ff] hover:text-blue-700 font-semibold text-sm inline-flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </section>

      {/* CARD 3: Weekly Availability */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Weekly Availability</h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {activeDaysCount} days · {timeBlocksCount} time blocks
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenScheduleModal}
            className="bg-[#eef4ff] hover:bg-[#e2edff] text-[#0149ff] font-semibold text-xs md:text-sm px-4 py-2 rounded-xl transition-colors"
          >
            Edit Schedule
          </button>
        </div>

        <div className="space-y-4">
          {availability.map((dayItem) => (
            <div
              key={dayItem.day}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 last:border-0 gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-[130px]">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    dayItem.active ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
                <span className="text-sm font-semibold text-slate-900">{dayItem.day}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {dayItem.active ? (
                  dayItem.slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {slot.start} — {slot.end}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-medium">Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CARD 4: Meeting Link */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4">Meeting Link</h2>

        <form onSubmit={handleSaveMeetingLink} className="space-y-4">
          <div>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="Enter your google meet link for appointments..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal placeholder:text-slate-400 focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="bg-[#f80400] hover:bg-[#d80300] text-white px-7 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs active:scale-[0.99]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* CARD 5: Password */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold text-slate-900">Password</h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5 mb-5">Last changed 3 months ago</p>

        <div>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-[#eef4ff] hover:bg-[#e2edff] text-[#0149ff] font-semibold text-xs md:text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Change Password
          </button>
        </div>
      </section>

      {/* MODAL 1: Add / Edit Service */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. General Consultation"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Duration
                  </label>
                  <select
                    value={serviceForm.duration}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none bg-white"
                  >
                    <option value="15 min">15 min</option>
                    <option value="20 min">20 min</option>
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min">90 min</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="75"
                    value={serviceForm.price}
                    onChange={(e) =>
                      setServiceForm((prev) => ({ ...prev, price: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingService ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteService(editingService.id);
                      setIsServiceModalOpen(false);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#0149ff] hover:bg-blue-700 rounded-xl shadow-xs"
                  >
                    Save Service
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Availability Schedule */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">Manage Availability</h3>
                <p className="text-xs md:text-sm text-slate-500 font-normal mt-1">
                  Toggle days on/off, add multiple time blocks per day, and remove slots you&apos;re unavailable for.
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Days List (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-6">
              {tempAvailability.map((dayItem, idx) => (
                <div
                  key={dayItem.day}
                  className={`rounded-2xl p-4 md:p-5 transition-all border ${
                    dayItem.active
                      ? 'bg-[#f4f4f6] border-slate-200/60'
                      : 'bg-[#fafafa] border-slate-100'
                  }`}
                >
                  {/* Card Header: Switch + Day Name + Add Block Link */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Custom Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleDay(idx)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          dayItem.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            dayItem.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <span
                        className={`text-sm md:text-base font-bold ${
                          dayItem.active ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {dayItem.day}
                      </span>
                    </div>

                    {dayItem.active && (
                      <button
                        type="button"
                        onClick={() => handleAddBlock(idx)}
                        className="text-xs md:text-sm font-semibold text-[#0149ff] hover:text-blue-700 hover:underline transition-colors"
                      >
                        + Add block
                      </button>
                    )}
                  </div>

                  {/* Card Body: Active Time Blocks OR Disabled State Note */}
                  {dayItem.active ? (
                    <div className="mt-3.5 space-y-2.5">
                      {dayItem.slots.map((slot, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-white rounded-xl p-3 flex items-center justify-between border border-slate-200/70 shadow-2xs"
                        >
                          <span className="text-xs font-semibold text-slate-400 w-6">
                            #{sIdx + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={slot.start}
                              onChange={(e) =>
                                handleUpdateSlotTime(idx, sIdx, 'start', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs md:text-sm font-medium text-slate-800 focus:border-[#0149ff] focus:outline-none text-center w-24 md:w-32 bg-white"
                            />
                            <span className="text-slate-400 font-medium text-sm px-1">—</span>
                            <input
                              type="text"
                              value={slot.end}
                              onChange={(e) =>
                                handleUpdateSlotTime(idx, sIdx, 'end', e.target.value)
                              }
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs md:text-sm font-medium text-slate-800 focus:border-[#0149ff] focus:outline-none text-center w-24 md:w-32 bg-white"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(idx, sIdx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic font-normal mt-2 ml-14">
                      Day is disabled — toggle on to add time blocks.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <span className="text-xs md:text-sm font-medium text-slate-600">
                {tempActiveDaysCount} days active · {tempTimeBlocksCount} time blocks total
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#f0f0f2] hover:bg-[#e4e4e7] text-slate-700 text-xs md:text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="px-6 py-2.5 rounded-xl bg-[#f80400] hover:bg-[#d80300] text-white text-xs md:text-sm font-semibold transition-colors shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Change Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-[#0149ff] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#0149ff] hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
