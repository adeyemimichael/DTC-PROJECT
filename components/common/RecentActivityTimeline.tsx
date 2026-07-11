import { Card } from '@/components/ui/Card';
import { History } from 'lucide-react';

const activities = [
  {
    title: 'Appointment Completed',
    description: 'Specialist Care — Back Pain Evaluation',
    time: 'May 18, 2026 — 11:45 AM',
  },
  {
    title: 'Lab Results Uploaded',
    description: 'CBC and Lipid Panel results available',
    time: 'May 20, 2026 — 9:15 AM',
  },
  {
    title: 'Prescription Renewed',
    description: 'Cetirizine 10mg renewed',
    time: 'May 22, 2026 — 2:30 PM',
  },
  {
    title: 'Payment Processed',
    description: '$150 for Specialist Care — May 18',
    time: 'May 18, 2026 — 3:00 PM',
  },
];

export function RecentActivityTimeline() {
  return (
    <Card>
      <h3 className="text-base font-medium text-black  flex items-center gap-2 mb-8">
        <History className="h-5 w-5 text-primary-blue " />
        Recent Activity
      </h3>

      <div className="relative border-l border-slate-100 ml-3 pl-6 space-y-8">
        {activities.map((item, idx) => (
          <div key={idx} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary-blue ring-4 ring-white" />
            <div>
              <h4 className="text-sm font-normal text-black">
                {item.title}
              </h4>
              <p className="text-sm text-primary-gray mt-1 font-medium">
                {item.description}
              </p>
              <span className="text-xs text-slate-400 mt-1 block font-normal ">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
