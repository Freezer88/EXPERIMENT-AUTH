import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

// Skip to content link
export interface SkipToContentProps {
  targetId: string;
  children?: React.ReactNode;
  className?: string;
}

export const SkipToContent: React.FC<SkipToContentProps> = ({
  targetId,
  children = 'Skip to main content',
  className,
}) => {
  return (
    <a
      href={`#${targetId}`}
      className={clsx(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
};

// Focus trap component
export interface FocusTrapProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  className,
  active = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Screen reader only text
export interface SrOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export const SrOnly: React.FC<SrOnlyProps> = ({ children, className }) => (
  <span className={clsx('sr-only', className)}>{children}</span>
);

// Visually hidden component
export interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, className }) => (
  <span
    className={clsx(
      'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
      className
    )}
  >
    {children}
  </span>
);

// Live region for announcements
export interface LiveRegionProps {
  children: React.ReactNode;
  className?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  className,
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
}) => (
  <div
    className={clsx('sr-only', className)}
    aria-live={ariaLive}
    aria-atomic={ariaAtomic}
  >
    {children}
  </div>
);

// Announcement component
export interface AnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

export const Announcement: React.FC<AnnouncementProps> = ({
  message,
  priority = 'polite',
  className,
}) => {
  const [announcements, setAnnouncements] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (message) {
      setAnnouncements(prev => [...prev, message]);
    }
  }, [message]);

  return (
    <LiveRegion
      aria-live={priority}
      aria-atomic={true}
      className={className}
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </LiveRegion>
  );
};

// Keyboard navigation component
export interface KeyboardNavProps {
  children: React.ReactNode;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const KeyboardNav: React.FC<KeyboardNavProps> = ({
  children,
  className,
  onKeyDown,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    onKeyDown?.(event);
  };

  return (
    <div
      className={className}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

// High contrast mode support
export interface HighContrastProps {
  children: React.ReactNode;
  className?: string;
}

export const HighContrast: React.FC<HighContrastProps> = ({ children, className }) => (
  <div
    className={clsx(
      'supports-[filter:contrast(1.5)]:contrast-[1.5]',
      className
    )}
  >
    {children}
  </div>
);

// Reduced motion support
export interface ReducedMotionProps {
  children: React.ReactNode;
  className?: string;
}

export const ReducedMotion: React.FC<ReducedMotionProps> = ({ children, className }) => (
  <div
    className={clsx(
      'motion-reduce:animate-none motion-reduce:transition-none',
      className
    )}
  >
    {children}
  </div>
);

// Color scheme support
export interface ColorSchemeProps {
  children: React.ReactNode;
  className?: string;
  scheme?: 'light' | 'dark' | 'auto';
}

export const ColorScheme: React.FC<ColorSchemeProps> = ({
  children,
  className,
  scheme = 'auto',
}) => (
  <div
    className={clsx(
      scheme === 'light' && 'light',
      scheme === 'dark' && 'dark',
      className
    )}
  >
    {children}
  </div>
);

// Focus indicator component
export interface FocusIndicatorProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'thick' | 'dotted';
}

export const FocusIndicator: React.FC<FocusIndicatorProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  const focusClasses = {
    default: 'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    thick: 'focus:outline-none focus:ring-4 focus:ring-ring focus:ring-offset-4',
    dotted: 'focus:outline-none focus:ring-2 focus:ring-dotted focus:ring-ring focus:ring-offset-2',
  };

  return (
    <div className={clsx(focusClasses[variant], className)}>
      {children}
    </div>
  );
};

// ARIA label component
export interface AriaLabelProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export const AriaLabel: React.FC<AriaLabelProps> = ({
  children,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}) => (
  <div
    className={className}
    aria-label={ariaLabel}
    aria-labelledby={ariaLabelledby}
    aria-describedby={ariaDescribedby}
  >
    {children}
  </div>
);

// Error boundary with accessibility
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  className?: string;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  children,
  fallback: Fallback,
  className,
}) => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const resetError = () => setError(null);

  if (error) {
    return Fallback ? (
      <Fallback error={error} resetError={resetError} />
    ) : (
      <div
        className={clsx('p-4 bg-destructive/10 border border-destructive rounded-md', className)}
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}; 