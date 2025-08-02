import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 300);
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-50 border-green-200 text-green-800',
      iconClassName: 'text-green-500',
    },
    error: {
      icon: AlertCircle,
      className: 'bg-red-50 border-red-200 text-red-800',
      iconClassName: 'text-red-500',
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClassName: 'text-yellow-500',
    },
    info: {
      icon: Info,
      className: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClassName: 'text-blue-500',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <div
      className={clsx(
        'flex items-start space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-300',
        config.className,
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0',
        className
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <Icon className={clsx('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClassName)} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-medium mb-1">{title}</h4>
        )}
        <p className="text-sm">{message}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        aria-label="Close notification"
        className="flex-shrink-0 ml-2"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { Toast }; 