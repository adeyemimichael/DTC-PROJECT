'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Lock,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ShieldAlert,
} from 'lucide-react';

export default function PatientSettingsPage() {
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
    firstName: 'Adesare',
    lastName: 'Adegbagi',
    email: 'ade@gmail.com',
    phone: '+234 703 666 1092',
    dob: '2007-10-10',
    gender: 'Female',
    bloodGroup: 'O+',
    address: '4517 Washington Ave. Manchester, Kentucky 39495',
    avatar: '/images/sarah_avatar.png',
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

  // 2. Emergency Contact State
  const [emergencyContact, setEmergencyContact] = useState({
    fullName: 'Adesare',
    phone: '0817126465333',
    relationship: 'Spouse',
  });

  const handleSaveEmergencyContact = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Emergency contact saved successfully!');
  };

  // 3. Password Modal State
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

  // 4. Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      showToast('Please type "DELETE" to confirm account removal', 'error');
      return;
    }
    showToast('Account deletion request submitted.', 'error');
    setIsDeleteModalOpen(false);
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
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner group bg-amber-400 flex items-center justify-center">
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
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
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
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
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
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
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

              {/* Row 3: Phone Number & Date of Birth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
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
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={accountInfo.dob}
                      onChange={(e) =>
                        setAccountInfo((prev) => ({ ...prev, dob: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Gender & Blood Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={accountInfo.gender}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, gender: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none bg-white transition-all"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Blood Group
                  </label>
                  <select
                    value={accountInfo.bloodGroup}
                    onChange={(e) =>
                      setAccountInfo((prev) => ({ ...prev, bloodGroup: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none bg-white transition-all"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Residential Address */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={accountInfo.address}
                  onChange={(e) =>
                    setAccountInfo((prev) => ({ ...prev, address: e.target.value }))
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

      {/* CARD 2: Password */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold text-slate-900">Password</h2>
        <p className="text-xs text-slate-500 font-normal mt-0.5 mb-5">Last changed 3 months ago</p>

        <div>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="bg-[#eef4ff] hover:bg-[#e2edff] text-[#0149ff] font-semibold text-xs md:text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </section>

      {/* CARD 3: Emergency Contact */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-6">Emergency Contact</h2>

        <form onSubmit={handleSaveEmergencyContact} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={emergencyContact.fullName}
                onChange={(e) =>
                  setEmergencyContact((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={emergencyContact.phone}
                onChange={(e) =>
                  setEmergencyContact((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                value={emergencyContact.relationship}
                onChange={(e) =>
                  setEmergencyContact((prev) => ({ ...prev, relationship: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm md:text-base font-normal focus:border-[#0149ff] focus:ring-1 focus:ring-[#0149ff] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#f85c59] hover:bg-[#e04b48] text-white px-7 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs active:scale-[0.99]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* CARD 4: Danger Zone */}
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
        <h2 className="text-lg md:text-xl font-bold text-[#f80400] mb-2">Danger Zone</h2>
        <p className="text-xs md:text-sm text-slate-500 font-normal mb-5 leading-relaxed">
          Once you delete your account, there is no going back. All your medical records, appointments, and personal data will be permanently removed.
        </p>

        <div>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="border border-rose-300 hover:border-rose-400 text-[#f80400] hover:bg-rose-50 font-semibold text-xs md:text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* MODAL 1: Change Password */}
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

      {/* MODAL 2: Delete Account Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-900">Delete Account</h3>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                This action cannot be undone. To permanently delete your patient account and all associated medical data, please type <strong className="text-rose-600">DELETE</strong> below.
              </p>

              <div>
                <input
                  type="text"
                  required
                  placeholder='Type "DELETE" to confirm'
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#f80400] hover:bg-[#d80300] rounded-xl shadow-xs"
                >
                  Permanently Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
