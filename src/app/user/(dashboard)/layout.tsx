'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { BookAppointmentModal } from '@/components/common/BookAppointmentModal';
import { BookingContext } from '@/context/BookingContext';
import { patientNavigationConfig, defaultPatientUser } from '@/config/navigationConfig';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <BookingContext.Provider value={() => setIsBookingOpen(true)}>
      <div className="min-h-screen bg-slate-100 font-sans overflow-x-hidden">
        {/* Fixed Config-Driven Navigation Sidebar */}
        <Sidebar
          config={patientNavigationConfig}
          user={defaultPatientUser}
          isMobileOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area offset by sidebar width on desktop */}
        <div className="md:pl-64 flex flex-col min-h-screen">
          {/* Top Header */}
          <DashboardHeader onMenuToggle={() => setIsSidebarOpen(true)} />

          {/* Dynamic Page Routing Frame */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-page-fade">
            {children}
          </main>
        </div>
      </div>

      {/* Global Stepper Booking Modal */}
      <BookAppointmentModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </BookingContext.Provider>
  );
}
