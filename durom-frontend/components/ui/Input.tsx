import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, leftIcon, rightIcon, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('w-full flex flex-col gap-2', containerClassName)}>
        {label && (
          <label className="text-[15px] font-semibold text-primary-deepblue select-none">
            {label}
          </label>
        )}
        <div className="relative w-full flex items-center">
          {leftIcon && (
            <div className="absolute left-4 text-slate-400 flex items-center justify-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-white border border-slate-200 rounded-[10px] px-4 py-3.5 text-[15px] font-medium text-primary-deepblue placeholder:text-slate-400/70 transition-all duration-200 outline-none hover:border-slate-300 focus:border-primary-blue focus:ring-1 focus:ring-primary-blue',
              !!leftIcon && 'pl-11',
              !!rightIcon && 'pr-11',
              error && 'border-primary-red hover:border-primary-red focus:border-primary-red focus:ring-primary-red',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-slate-400 flex items-center justify-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-semibold text-primary-red mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
