import React from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-95',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm hover:shadow-md active:bg-primary-700 border border-primary-500 hover:border-primary-600',
        secondary: 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus-visible:ring-primary-500 shadow-sm hover:shadow-md active:bg-primary-100',
        outline: 'bg-transparent text-primary-600 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus-visible:ring-primary-500 active:bg-primary-100',
        ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500 active:bg-primary-100',
        destructive: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-sm hover:shadow-md active:bg-error-700 border border-error-500 hover:border-error-600',
        success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500 shadow-sm hover:shadow-md active:bg-success-700 border border-success-500 hover:border-success-600',
        warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500 shadow-sm hover:shadow-md active:bg-warning-700 border border-warning-500 hover:border-warning-600',
        error: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-sm hover:shadow-md active:bg-error-700 border border-error-500 hover:border-error-600',
        link: 'bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus-visible:ring-primary-500',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        {!loading && leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
        <span className="flex items-center justify-center">{children}</span>
        {!loading && rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 