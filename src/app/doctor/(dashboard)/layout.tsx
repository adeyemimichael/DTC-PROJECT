'use client';

import { useState } from 'react';
import { BookAppointmentModal } from '@/components/common/BookAppointmentModal';
import { BookingContext } from '@/context/BookingContext';

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <BookingContext.Provider value={() => setIsBookingOpen(true)}>
      <div className="flex min-h-screen bg-slate-100 font-sans overflow-x-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}

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
