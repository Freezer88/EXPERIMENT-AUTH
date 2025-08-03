import React from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  'animate-spin',
  {
    variants: {
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
      },
      spinnerColor: {
        primary: 'text-primary-600',
        secondary: 'text-secondary-600',
        white: 'text-white',
        success: 'text-success-600',
        error: 'text-error-600',
        warning: 'text-warning-600',
      },
    },
    defaultVariants: {
      size: 'md',
      spinnerColor: 'primary',
    },
  }
);

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  showLabel?: boolean;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, spinnerColor, label = 'Loading...', showLabel = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('flex items-center justify-center', className)}
        role="status"
        aria-label={label}
        {...props}
      >
        <svg
          className={clsx(spinnerVariants({ size, spinnerColor }))}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {showLabel && (
          <span className="sr-only">{label}</span>
        )}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Loading overlay component
export interface LoadingOverlayProps {
  isVisible: boolean;
  label?: string;
  backdrop?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  label = 'Loading...',
  backdrop = true,
  className,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-secondary-900/50 backdrop-blur-sm',
        className
      )}
    >
      <div className="bg-white rounded-lg shadow-xl border border-secondary-200 p-6 flex flex-col items-center space-y-4">
        <Spinner size="lg" spinnerColor="primary" />
        <p className="text-sm font-medium text-secondary-700">{label}</p>
      </div>
    </div>
  );
};

// Loading button component
export interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  size?: VariantProps<typeof spinnerVariants>['size'];
  spinnerColor?: VariantProps<typeof spinnerVariants>['spinnerColor'];
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  className,
  size = 'sm',
  spinnerColor = 'white',
}) => {
  return (
    <div className={clsx('relative inline-flex items-center', className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size} spinnerColor={spinnerColor} />
        </div>
      )}
      <div className={clsx(loading && 'opacity-0')}>
        {children}
      </div>
    </div>
  );
};

export { Spinner, spinnerVariants }; 