import React from 'react';
import { cn } from '../utils/cn';

interface DividerProps {
  className?: string;
  label?: string;
}

export function Divider({ className, label }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)}>
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-text-secondary">{label}</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    );
  }
  
  return <div className={cn('h-px bg-border my-4', className)} />;
}
