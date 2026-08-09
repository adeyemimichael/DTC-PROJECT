'use client';

import { Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  const isDoctor = pathname?.startsWith('/doctor');
  
  const getHeaderTitle = (path: string) => {
    if (path.includes('overview')) return 'Overview';
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('patients')) return 'Patients';
    if (path.includes('messages')) return 'Messages';
    if (path.includes('medical-info')) return 'Medical Info';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('help')) return 'Help';
    return 'Dashboard';
  };

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 mr-2 text-slate-500 hover:text-primary-deepblue md:hidden rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight font-sans">
          {getHeaderTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button className="relative p-2 text-slate-500 hover:text-gray-900 hover:bg-slate-50 rounded-full transition-colors duration-200 cursor-pointer">
          <Bell className="h-5 w-5" />
        </button>

        {/* User Account avatar slot */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full overflow-hidden relative border border-slate-200 bg-slate-100 shrink-0">
            <Image
              src={isDoctor ? "/images/stephen.jpg" : "/images/sarah_avatar.png"}
              alt="User Avatar"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}