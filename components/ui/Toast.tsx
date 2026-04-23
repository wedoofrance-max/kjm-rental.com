'use client';

import React, { useEffect } from 'react';
import { useUIStore } from '../../lib/stores/uiStore';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const typeStyles = {
  success: {
    wrapper: 'bg-white border border-success-200 shadow-lg shadow-success-500/10',
    icon: 'text-success-500',
    bar: 'bg-success-500',
  },
  error: {
    wrapper: 'bg-white border border-error-200 shadow-lg shadow-error-500/10',
    icon: 'text-error-500',
    bar: 'bg-error-500',
  },
  info: {
    wrapper: 'bg-white border border-primary-200 shadow-lg shadow-primary-500/10',
    icon: 'text-primary-500',
    bar: 'bg-primary-500',
  },
  warning: {
    wrapper: 'bg-white border border-warning-200 shadow-lg shadow-warning-500/10',
    icon: 'text-warning-500',
    bar: 'bg-warning-500',
  },
};

const icons = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = typeStyles[type];

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl
        pointer-events-auto min-w-[280px] max-w-sm
        animate-slideIn overflow-hidden relative
        ${styles.wrapper}
      `}
    >
      {/* Color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${styles.bar}`} />

      <span className={`flex-shrink-0 ${styles.icon}`}>{icons[type]}</span>
      <p className="text-sm font-medium text-neutral-800 flex-1">{message}</p>
      <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 flex-shrink-0 ml-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
