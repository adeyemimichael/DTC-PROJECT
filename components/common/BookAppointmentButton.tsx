'use client';

import * as React from 'react';
import { Button, ButtonProps } from '@/components/ui';
import { useBooking } from '@/app/dashboard/(patient)/layout';

export interface BookAppointmentButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export function BookAppointmentButton({ className, children, ...props }: BookAppointmentButtonProps) {
  const openBooking = useBooking();

  return (
    <Button 
      onClick={openBooking}
      className={className} 
      {...props}
    >
      {children}
    </Button>
  );
}
