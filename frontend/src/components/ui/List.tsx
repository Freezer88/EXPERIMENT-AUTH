import React from 'react';
import { clsx } from 'clsx';
import { cva, type VariantProps } from 'class-variance-authority';

const listVariants = cva(
  'divide-y divide-border',
  {
    variants: {
      variant: {
        default: 'bg-background border border-border rounded-lg',
        ghost: 'bg-transparent',
        bordered: 'bg-background border border-border rounded-lg',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ListItem {
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export interface ListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listVariants> {
  items: ListItem[];
  emptyMessage?: string;
  loading?: boolean;
}

const List = React.forwardRef<HTMLDivElement, ListProps>(
  ({ className, variant, size, items, emptyMessage = 'No items available', loading = false, ...props }, ref) => {
    if (loading) {
      return (
        <div className={clsx('animate-pulse', className)}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted h-16 border-b border-border last:border-b-0" />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div
          ref={ref}
          className={clsx(
            'flex items-center justify-center py-8 text-muted-foreground',
            className
          )}
          {...props}
        >
          {emptyMessage}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(listVariants({ variant, size, className }))}
        {...props}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={clsx(
              'flex items-center px-4 py-3 transition-colors',
              item.onClick && !item.disabled && 'cursor-pointer hover:bg-accent/50',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => item.onClick && !item.disabled && item.onClick()}
          >
            {item.icon && (
              <div className="flex-shrink-0 mr-3 text-muted-foreground">
                {item.icon}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                
                {item.action && (
                  <div className="flex-shrink-0 ml-3">
                    {item.action}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

List.displayName = 'List';

export { List }; 