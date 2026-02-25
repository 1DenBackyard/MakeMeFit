import React, { useEffect } from 'react';
import { cn } from '../utils/cn';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const styles = {
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    info: 'bg-primary text-white',
  };
  
  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
        'px-6 py-3 rounded-lg shadow-lg',
        'animate-in slide-in-from-bottom-4',
        styles[type]
      )}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
