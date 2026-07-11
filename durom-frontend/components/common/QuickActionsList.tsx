'use client';

import { Card } from '@/components/ui/Card';
import { Calendar, FolderKey, MessageSquare } from 'lucide-react';
import { useBooking } from '@/app/dashboard/(patient)/layout';

const actions = [
  {
    title: 'Book Appointment',
    description: 'Schedule a new consultation',
    icon: Calendar,
    iconBg: 'bg-primary-red text-white',
  },
  {
    title: 'View Records',
    description: 'Access your medical files',
    icon: FolderKey,
    iconBg: 'bg-primary-blue text-white',
  },
  {
    title: 'Message Doctor',
    description: 'Send a message to Dr. Stephen',
    icon: MessageSquare,
    iconBg: 'bg-primary-black text-white',
  },
];

export function QuickActionsList() {
  const openBooking = useBooking();

  return (
    <Card>
      <h3 className="text-base font-medium text-black mb-6">
        Quick Actions
      </h3>

      <div className="space-y-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() => {
                if (act.title === 'Book Appointment') {
                  openBooking();
                }
              }}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 text-left group cursor-pointer"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-black group-hover:text-primary-blue transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-primary-gray mt-0.5 font-medium">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
