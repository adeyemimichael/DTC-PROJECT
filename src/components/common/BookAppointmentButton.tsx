'use client';

import * as React from 'react';
import { Button, ButtonProps } from '@/components/ui';
import { useBooking } from '@/context/BookingContext';

export interface BookAppointmentButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export function BookAppointmentButton({ className, children, disabled, onClick, ...props }: BookAppointmentButtonProps) {
  const openBooking = useBooking();
  const isDisabled = disabled ?? true;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
    if (!event.defaultPrevented) {
      openBooking();
    }
  };

  return (
    <Button
      disabled={isDisabled}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
