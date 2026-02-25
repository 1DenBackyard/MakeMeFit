import React from 'react';
import { cn } from '../utils/cn';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Screen({ children, className, header, footer }: ScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {header && (
        <header className="sticky top-0 z-10 bg-white border-b border-border shadow-sm">
          {header}
        </header>
      )}
      <main className={cn('flex-1 overflow-y-auto', className)}>
        {children}
      </main>
      {footer && (
        <footer className="border-t border-border bg-white">
          {footer}
        </footer>
      )}
    </div>
  );
}
