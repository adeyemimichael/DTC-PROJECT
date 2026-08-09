import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3.5 py-1.5 text-sm rounded-md gap-1.5',
      md: 'px-6 py-4 text-base rounded-lg gap-2 font-bold',
      lg: 'px-7 py-4.5 text-lg font-semibold rounded-xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          `btn-${variant}`,
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
