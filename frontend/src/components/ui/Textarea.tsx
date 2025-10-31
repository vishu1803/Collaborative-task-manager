import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, className, required, disabled, ...props },
    ref
  ) => {
    return (
      <div className="flex flex-col space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-800">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          disabled={disabled}
          className={clsx(
            'block w-full rounded-md border shadow-sm transition-colors duration-200',
            'px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white',
            'focus:outline-none focus:ring-2 min-h-[100px]',
            'resize-y scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
            error && [
              'border-red-400 focus:ring-red-500 focus:border-red-500',
              'hover:border-red-500',
            ],
            !error && [
              'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
              'hover:border-gray-400',
            ],
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 animate-shake" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
