import React from 'react';
import { cn } from '../utils/cn';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, className, ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-text mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          'w-full px-4 py-2.5 rounded-md border resize-y',
          error ? 'border-error focus:ring-error' : 'border-border focus:ring-primary',
          'bg-background text-text placeholder:text-text-light',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'transition-colors duration-200',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
}
