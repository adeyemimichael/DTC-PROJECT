import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]',
        hoverable && 'hover:shadow-[0_10px_25px_-5px_rgba(4,21,68,0.06)] hover:-translate-y-0.5',
        className
      )}
      {...props}
    />
  );
}