'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from "next/image";
import { 
  LayoutGrid, 
  CalendarDays, 
  HeartPulse, 
  Users,
  MessageSquare,
  HelpCircle, 
  Settings,
  X,
  LucideIcon
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

const patientMainNavigation: NavItem[] = [
  { name: 'Overview', href: '/patient/overview', icon: LayoutGrid },
  { name: 'Appointments', href: '/patient/appointments', icon: CalendarDays },
  { name: 'Medical Info', href: '/patient/medical-info', icon: HeartPulse },
];

const patientFooterNavigation: NavItem[] = [
  { name: 'Help', href: '/patient/help', icon: HelpCircle },
  { name: 'Settings', href: '/patient/settings', icon: Settings },
];

const doctorMainNavigation: NavItem[] = [
  { name: 'Overview', href: '/doctor/doctors-overview', icon: LayoutGrid },
  { name: 'Appointments', href: '/doctor/appointments', icon: CalendarDays },
  { name: 'Patients', href: '/doctor/patients', icon: Users },
  { name: 'Messages', href: '/doctor/messages', icon: MessageSquare, badge: 2 },
];

const doctorFooterNavigation: NavItem[] = [
  { name: 'Help', href: '/doctor/help', icon: HelpCircle },
  { name: 'Settings', href: '/doctor/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const isDoctor = pathname?.startsWith('/doctor');

  const mainNav = isDoctor ? doctorMainNavigation : patientMainNavigation;
  const footerNav = isDoctor ? doctorFooterNavigation : patientFooterNavigation;

  return (
    <aside className="w-64 flex flex-col h-full relative bg-white border-r border-slate-200 shrink-0">
      {onClose && (
        <button 
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-primary-deepblue md:hidden rounded-lg hover:bg-slate-50 absolute top-4 right-4 cursor-pointer z-20"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Brand Logo Header */}
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <Link href="/" className="flex flex-col">
          <Image
            src="/images/logo.png"
            alt="Durom's Touch Clinic Logo"
            width={130}
            height={40}
            priority
            className="object-contain"
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 bg-white">
        {mainNav.map((item) => {
          const isActive = pathname === item.href || (item.name === 'Overview' && pathname?.includes('overview'));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#ffebeb] text-brand-red'
                  : 'text-gray-700 hover:bg-slate-50 hover:text-brand-red'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-red' : 'text-gray-500 group-hover:text-brand-red'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span className="h-5 w-5 rounded-full bg-brand-red text-white text-xs font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Footer Navigation (Help & Settings) */}
      <div className="p-4 border-t border-slate-100 space-y-1.5">
        {footerNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#ffebeb] text-brand-red'
                  : 'text-gray-600 hover:bg-slate-50 hover:text-brand-red'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-brand-red' : 'text-gray-400 group-hover:text-brand-red'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
