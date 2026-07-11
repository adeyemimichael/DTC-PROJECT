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
    <aside className="w-full flex flex-col h-full relative bg-secondary-white border-r border-slate-200">
     
      {onClose && (
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-primary-deepblue md:hidden rounded-lg hover:bg-slate-50 absolute top-4 right-4 cursor-pointer z-20"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Brand Logo Header */}
      <div className="h-20 flex items-center px-8 lg:px-10 border-b border-white">
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

    
      <nav className="flex-1 px-5 lg:px-8 py-10 space-y-1.5 bg-white">
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm text-primary-red font-semibold rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-secondary-lightred text-primary-red!'
                  : 'text-primary-red hover:bg-slate-50 hover:text-primary-red'
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
