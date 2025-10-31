import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'error'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className, required, disabled, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-800">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            className={clsx(
              'block w-full rounded-md border shadow-sm transition-colors duration-200',
              'px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-500',
              'bg-white focus:outline-none focus:ring-2 appearance-none',
              error && [
                'border-red-400 focus:ring-red-500 focus:border-red-500',
                'hover:border-red-500'
              ],
              !error && [
                'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                'hover:border-gray-400'
              ],
              disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className={clsx(
                'h-5 w-5 transition-colors duration-200',
                error ? 'text-red-400' : 'text-gray-400',
                disabled && 'opacity-50'
              )}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
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

Select.displayName = 'Select';
