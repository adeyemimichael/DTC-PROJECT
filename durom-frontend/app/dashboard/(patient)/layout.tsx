'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-secondary-white font-sans overflow-x-hidden">
      {/* Persistent Left Navigation Sidebar (Desktop only) */}
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
  );
}
