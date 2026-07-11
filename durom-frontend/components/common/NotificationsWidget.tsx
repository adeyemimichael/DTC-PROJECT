'use client';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

const notifications = [
  {
    title: 'Lab Results Available',
    message: 'Your blood work results from May 18 are now available in your Medical Info section.',
    time: '1 day ago',
  },
  {
    title: 'Prescription Renewed',
    message: 'Your cetirizine prescription has been renewed through June 2026.',
    time: '3 days ago',
  },
  {
    title: 'Profile Updated',
    message: 'Your emergency contact information was successfully updated.',
    time: '5 days ago',
  },
  {
    title: 'Payment Confirmed',
    message: 'Your payment of $150 for Specialist Care on May 18 has been processed.',
    time: '1 week ago',
  },
];

export function NotificationsWidget() {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary-red" />
          <h3 className="text-base font-medium text-black">
            Notifications
          </h3>
          <Badge variant="danger">2 New</Badge>
        </div>
        <Link 
          href="#" 
          className="text-xs font-medium text-black hover:text-primary-deepblue hover:underline"
        >
          Mark all read
        </Link>
      </div>

      <div className="space-y-6">
        {notifications.map((note, idx) => (
          <div key={idx} className="border-b border-slate-50 last:border-b-0 pb-4 last:pb-0">
            <h4 className="text-sm font-medium text-black">
              {note.title}
            </h4>
            <p className="text-sm text-primary-gray mt-1 leading-relaxed font-medium">
              {note.message}
            </p>
            <span className="text-xs text-slate-400 mt-2 block font-normal">
              {note.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
