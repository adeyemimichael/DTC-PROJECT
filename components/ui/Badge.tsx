import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'danger' | 'subtle';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-secondary-blue text-primary-blue',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    error: 'bg-secondary-lightred text-primary-red',
    danger: 'bg-primary-red text-white',
    subtle: 'bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-2 rounded-full text-xs font-semibold tracking-wide uppercase',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}