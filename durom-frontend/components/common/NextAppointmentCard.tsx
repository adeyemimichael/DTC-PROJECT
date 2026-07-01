import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock } from 'lucide-react';

export function NextAppointmentCard() {
  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-black flex items-center gap-2">
          <Calendar className="h-5 w-5 text-black  " />
          Next Appointment
        </h3>
        <Badge variant="success"
       >Confirmed</Badge>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-6 mb-6">
        <div>
          <h4 className="text-xl font-semibold text-black">
            General Consultation
          </h4>
          <p className="text-sm text-primary-gray mt-1 font-sans">
            Dr. Stephen Adeyemi
          </p>
        </div>
        <div className="text-2xl font-semibold text-black mt-3 md:mt-0">
          $49.00
        </div>
      </div>

      <div className="flex flex-col  sm:items-start justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 text-sm font-normal text-primary-gray">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary-gray" />
            2026-06-03 at 10:30 AM
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary-gray" />
            30 min
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">
            View details
          </Button>
          <Button variant="outline" size="sm">
            Reschedule
          </Button>
          <Button variant="danger" size="sm" className='bg-secondary-lightred  text-primary-red'>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
