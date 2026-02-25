import React from 'react';
import { cn } from '../utils/cn';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
        selected
          ? 'bg-primary text-white shadow-sm'
          : 'bg-surface text-text border border-border hover:bg-border-light',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </button>
  );
}
