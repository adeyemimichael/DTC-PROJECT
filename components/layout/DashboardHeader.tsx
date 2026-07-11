'use client';

import { Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const pathname = usePathname();
  
  const getHeaderTitle = (path: string) => {
    if (path.includes('overview')) return 'Overview';
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('medical-info')) return 'Medical Info';
    if (path.includes('settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-slate-300 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center">
      
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 mr-2 text-slate-500 hover:text-primary-deepblue md:hidden rounded-lg hover:bg-slate-50 cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-primary-deepblue tracking-tight">
          {getHeaderTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        
        <button className="relative p-2 text-slate-400 hover:text-primary-deepblue hover:bg-slate-50 rounded-full transition-colors duration-200 cursor-pointer">
          <Bell className="h-6 w-6" />
        </button>

        {/* User Account avatar slot */}
        <div className="flex items-center gap-2 lg:gap-3 border-l border-slate-100 pl-3 lg:pl-6">
          <span className="text-sm font-semibold text-primary-deepblue hidden md:block">
            Sarah
          </span>
          <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full overflow-hidden relative border border-slate-100 bg-slate-100">
            <Image
              src="/images/sarah_avatar.png"
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