import React from 'react';
import { clsx } from 'clsx';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, helperText, containerClassName, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={clsx('space-y-2', containerClassName)}>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              id={radioId}
              type="radio"
              className={clsx(
                'peer h-4 w-4 shrink-0 rounded-full border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                error && 'border-destructive',
                className
              )}
              ref={ref}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${radioId}-error` : helperText ? `${radioId}-helper` : undefined}
              {...props}
            />
            <div className="absolute left-0 top-0 h-4 w-4 rounded-full border-2 border-transparent peer-data-[state=checked]:border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
          </div>
          {label && (
            <label htmlFor={radioId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </label>
          )}
        </div>
        {error && (
          <p id={`${radioId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${radioId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio }; 