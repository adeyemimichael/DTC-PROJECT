'use client';

import { useState, createContext, useContext } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { BookAppointmentModal } from '@/components/common/BookAppointmentModal';

const BookingContext = createContext<() => void>(() => {});
export const useBooking = () => useContext(BookingContext);

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <BookingContext.Provider value={() => setIsBookingOpen(true)}>
      <div className="flex min-h-screen bg-slate-100 font-sans overflow-x-hidden">
       
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Drawer Overlay Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Semi-transparent Backdrop clickaway */}
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            />
            
            {/* Slide-in sidebar container */}
            <div className="relative flex flex-col w-full max-w-[280px] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300 z-50">
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
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
