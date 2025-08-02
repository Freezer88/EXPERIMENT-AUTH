import React from 'react';
import { clsx } from 'clsx';

// Responsive breakpoint utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Responsive container component
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'xl',
  padding = 'md',
  center = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16',
  };

  return (
    <div
      className={clsx(
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

// Responsive grid component
export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
}) => {
  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const gridColsClasses = [
    'grid',
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`,
  ].filter(Boolean);

  return (
    <div className={clsx(gridColsClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
};

// Responsive text component
export interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  weight?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' },
  weight = { sm: 'font-normal', md: 'font-medium', lg: 'font-semibold', xl: 'font-bold' },
}) => {
  const sizeClasses = [
    size.sm,
    size.md && `md:${size.md}`,
    size.lg && `lg:${size.lg}`,
    size.xl && `xl:${size.xl}`,
  ].filter(Boolean);

  const weightClasses = [
    weight.sm,
    weight.md && `md:${weight.md}`,
    weight.lg && `lg:${weight.lg}`,
    weight.xl && `xl:${weight.xl}`,
  ].filter(Boolean);

  return (
    <div className={clsx(sizeClasses, weightClasses, className)}>
      {children}
    </div>
  );
};

// Responsive spacing component
export interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  padding?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  margin?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  className,
  padding,
  margin,
}) => {
  const paddingClasses = padding
    ? [
        padding.sm,
        padding.md && `md:${padding.md}`,
        padding.lg && `lg:${padding.lg}`,
        padding.xl && `xl:${padding.xl}`,
      ].filter(Boolean)
    : [];

  const marginClasses = margin
    ? [
        margin.sm,
        margin.md && `md:${margin.md}`,
        margin.lg && `lg:${margin.lg}`,
        margin.xl && `xl:${margin.xl}`,
      ].filter(Boolean)
    : [];

  return (
    <div className={clsx(paddingClasses, marginClasses, className)}>
      {children}
    </div>
  );
};

// Responsive visibility component
export interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  className?: string;
  show?: {
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
  };
  hide?: {
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
  };
}

export const ResponsiveVisibility: React.FC<ResponsiveVisibilityProps> = ({
  children,
  className,
  show,
  hide,
}) => {
  const visibilityClasses = [];

  if (show) {
    if (show.sm === false) visibilityClasses.push('hidden');
    if (show.md === false) visibilityClasses.push('md:hidden');
    if (show.lg === false) visibilityClasses.push('lg:hidden');
    if (show.xl === false) visibilityClasses.push('xl:hidden');
  }

  if (hide) {
    if (hide.sm) visibilityClasses.push('hidden');
    if (hide.md) visibilityClasses.push('md:hidden');
    if (hide.lg) visibilityClasses.push('lg:hidden');
    if (hide.xl) visibilityClasses.push('xl:hidden');
  }

  return (
    <div className={clsx(visibilityClasses, className)}>
      {children}
    </div>
  );
};

// Responsive aspect ratio component
export interface ResponsiveAspectRatioProps {
  children: React.ReactNode;
  className?: string;
  ratio?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export const ResponsiveAspectRatio: React.FC<ResponsiveAspectRatioProps> = ({
  children,
  className,
  ratio = { sm: 'aspect-square', md: 'aspect-video', lg: 'aspect-video', xl: 'aspect-video' },
}) => {
  const ratioClasses = [
    ratio.sm,
    ratio.md && `md:${ratio.md}`,
    ratio.lg && `lg:${ratio.lg}`,
    ratio.xl && `xl:${ratio.xl}`,
  ].filter(Boolean);

  return (
    <div className={clsx('relative', ratioClasses, className)}>
      {children}
    </div>
  );
};

// Responsive image component
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  loading?: 'lazy' | 'eager';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = { sm: 'w-full', md: 'w-full', lg: 'w-full', xl: 'w-full' },
  loading = 'lazy',
}) => {
  const sizeClasses = [
    sizes.sm,
    sizes.md && `md:${sizes.md}`,
    sizes.lg && `lg:${sizes.lg}`,
    sizes.xl && `xl:${sizes.xl}`,
  ].filter(Boolean);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={clsx('object-cover', sizeClasses, className)}
    />
  );
};

// Responsive navigation component
export interface ResponsiveNavigationProps {
  children: React.ReactNode;
  className?: string;
  mobileMenu?: React.ReactNode;
  desktopMenu?: React.ReactNode;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  children,
  className,
  mobileMenu,
  desktopMenu,
}) => {
  return (
    <nav className={className}>
      {/* Mobile menu */}
      <div className="md:hidden">{mobileMenu}</div>
      
      {/* Desktop menu */}
      <div className="hidden md:block">{desktopMenu}</div>
      
      {/* Fallback content */}
      {children}
    </nav>
  );
}; 