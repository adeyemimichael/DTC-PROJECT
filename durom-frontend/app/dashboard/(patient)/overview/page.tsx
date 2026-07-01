import { Button } from '@/components/ui/Button';
import { NextAppointmentCard } from '@/components/common/NextAppointmentCard';
import { RecentActivityTimeline } from '@/components/common/RecentActivityTimeline';
import { QuickActionsList } from '@/components/common/QuickActionsList';
import { NotificationsWidget } from '@/components/common/NotificationsWidget';
import { Calendar } from 'lucide-react';

export default async function OverviewPage() {
  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-black tracking-tight">
            Welcome back, Sarah
          </h2>
          <p className="text-sm text-primary-gray mt-1 font-sans">
            Member since January 2024
          </p>
        </div>
        <Button className="btn-primary flex items-center gap-2 shadow-sm w-full sm:w-auto">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </Button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <NextAppointmentCard />
           <RecentActivityTimeline />
        </div>
        

  
        <div className="space-y-6 lg:space-y-8">
          
          <QuickActionsList />
          <NotificationsWidget />
        </div>
     
          
        
      </div>
    </div>
  );
}
