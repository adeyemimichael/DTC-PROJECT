'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from "next/image"
import { 
  LayoutDashboard, 
  CalendarDays, 
  HeartPulse, 
  HelpCircle, 
  Settings,
  X
} from 'lucide-react';

const mainNavigation = [
  { name: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
  { name: 'Medical Info', href: '/dashboard/medical-info', icon: HeartPulse },
];

const footerNavigation = [
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full flex flex-col h-full relative">
     
      {onClose && (
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-primary-deepblue md:hidden rounded-lg hover:bg-slate-50 absolute top-4 right-4 cursor-pointer z-20"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Brand Logo Header */}
      <div className="h-20 flex items-center px-6 lg:px-8 border-b border-slate-50">
        <Link href="/" className="flex flex-col">
          <Image
            src="/images/logo.webp"
            alt="logo"
            width={114}
            height={40}
            priority
          />
        </Link>
      </div>

    
      <nav className="flex-1 px-3 lg:px-4 py-6 space-y-1.5">
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary-lightred text-primary-red'
                  : 'text-black hover:bg-slate-50 hover:text-primary-red'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-red' : 'text-black group-hover:text-primary-deepblue'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation (Help & Settings) */}
      <div className="p-4 border-t border-slate-50 space-y-1.5">
        {footerNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary-lightred text-primary-red'
                  : 'text-primary-gray hover:bg-slate-50 hover:text-primary-red'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-red' : 'text-slate-400 group-hover:text-primary-red'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
