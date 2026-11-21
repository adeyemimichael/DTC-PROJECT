"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { BookAppointmentModal } from "@/components/common/BookAppointmentModal";
import { ApproveAppointmentModal } from "@/components/common/ApproveAppointmentModal";
import { BookingContext } from "@/context/BookingContext";
import { ApproveModalContext } from "@/context/ApproveModalContext";
import {
  doctorNavigationConfig,
  defaultDoctorUser,
} from "@/config/navigationConfig";
import type { AppointmentData } from "@/components/common/AppointmentDetailsModal";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Approve modal state — lifted to layout level so it renders outside
  // the overflow-x-hidden wrapper, same as BookAppointmentModal
  const [approveAppointment, setApproveAppointment] = useState<AppointmentData | null>(null);
  const [onApproveCallback, setOnApproveCallback] = useState<
    ((id: string, link: string) => Promise<{ success: boolean }>) | null
  >(null);
  const [onApprovedCallback, setOnApprovedCallback] = useState<(() => void) | null>(null);

  const openApproveModal = (
    appointment: AppointmentData,
    onApprove: (id: string, link: string) => Promise<{ success: boolean }>,
    onApproved?: () => void,
  ) => {
    setApproveAppointment(appointment);
    setOnApproveCallback(() => onApprove);
    setOnApprovedCallback(() => onApproved ?? null);
  };

  const closeApproveModal = () => {
    setApproveAppointment(null);
    setOnApproveCallback(null);
    setOnApprovedCallback(null);
  };

  return (
    <BookingContext.Provider value={() => setIsBookingOpen(true)}>
      <ApproveModalContext.Provider value={openApproveModal}>
        <div className="min-h-screen bg-slate-100 font-sans overflow-x-hidden">
          {/* Fixed Config-Driven Navigation Sidebar */}
          <Sidebar
            config={doctorNavigationConfig}
            user={defaultDoctorUser}
            isMobileOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content Area offset by sidebar width on desktop */}
          <div className="md:pl-64 flex flex-col min-h-screen pt-16 lg:pt-20">
            {/* Top Header */}
            <DashboardHeader onMenuToggle={() => setIsSidebarOpen(true)} />

            {/* Dynamic Page Routing Frame */}
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-page-fade">
              {children}
            </main>
          </div>
        </div>

        {/* Global Booking Modal — outside overflow wrapper */}
        <BookAppointmentModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
        />

        {/* Global Approve Modal — outside overflow wrapper, same level as BookAppointmentModal */}
        <ApproveAppointmentModal
          isOpen={approveAppointment !== null}
          onClose={closeApproveModal}
          appointment={approveAppointment}
          onApprove={onApproveCallback ?? (async () => ({ success: false }))}
          onAppointmentUpdated={onApprovedCallback ?? undefined}
        />
      </ApproveModalContext.Provider>
    </BookingContext.Provider>
  );
}
