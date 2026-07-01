'use client';

import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function DashboardHeader() {
  const pathname = usePathname();
  
  const getHeaderTitle = (path: string) => {
    if (path.includes('overview')) return 'Overview';
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('medical-info')) return 'Medical Info';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-bold text-primary-deepblue tracking-tight">
        {getHeaderTitle(pathname)}
      </h1>

      <div className="flex items-center gap-6">
        {/* Notification bell widget */}
        <button className="relative p-2 text-slate-400 hover:text-primary-deepblue hover:bg-slate-50 rounded-full transition-colors duration-200 cursor-pointer">
          <Bell className="h-6 w-6" />
         
        </button>

        {/* User Account avatar slot */}
        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
          <span className="text-sm font-semibold text-primary-deepblue hidden sm:block">
            Sarah
          </span>
          <div className="h-10 w-10 rounded-full overflow-hidden relative border border-slate-100 bg-slate-100">
            <Image
              src="/images/Sarah_avatar.png"
              alt="Sarah Profile Avatar"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}