import React from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const checkboxVariants = cva(
  'peer relative flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-secondary-300 bg-white text-white focus-visible:ring-primary-500 hover:border-primary-400 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600',
        error: 'border-error-300 bg-white text-white focus-visible:ring-error-500 hover:border-error-400 data-[state=checked]:bg-error-600 data-[state=checked]:border-error-600',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    error, 
    helperText, 
    containerClassName, 
    id, 
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className={clsx('space-y-2', containerClassName)}>
        <div className="flex items-start space-x-3">
          <div className="relative">
            <input
              id={checkboxId}
              type="checkbox"
              className="peer sr-only"
              ref={ref}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={clsx(
                checkboxVariants({ variant: error ? 'error' : variant, size, className }),
                'peer-checked:data-[state=checked]'
              )}
            >
              <svg
                className="h-3 w-3 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </label>
          </div>
          
          {label && (
            <div className="flex-1">
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-secondary-700 cursor-pointer"
              >
                {label}
              </label>
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${checkboxId}-error`} className="text-sm text-error-600 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${checkboxId}-helper`} className="text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants }; 