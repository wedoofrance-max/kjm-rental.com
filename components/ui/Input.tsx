'use client';

import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  success,
  helperText,
  icon,
  className,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-neutral-700">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={`
            w-full bg-white text-neutral-900 text-base
            border rounded-xl px-4 py-3
            transition-all duration-200
            placeholder:text-neutral-400
            focus:outline-none
            disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error
              ? 'border-error-500 focus:border-error-500 ring-1 ring-error-500/20'
              : success
              ? 'border-success-500 focus:border-success-500 ring-1 ring-success-500/20'
              : focused
              ? 'border-primary-400 ring-2 ring-primary-500/15 shadow-sm'
              : 'border-neutral-200 hover:border-neutral-300'
            }
            ${className || ''}
          `}
          {...props}
        />

        {success && !error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-error-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-neutral-500">{helperText}</p>}
    </div>
  );
}
