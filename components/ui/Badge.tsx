import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'featured';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-700 border border-primary-200',
  featured: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white border-0',
  success: 'bg-success-50 text-success-600 border border-success-100',
  warning: 'bg-warning-50 text-warning-600 border border-warning-100',
  error: 'bg-error-50 text-error-600 border border-error-100',
  neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
};

export function Badge({
  variant = 'primary',
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full
        text-xs font-semibold
        ${variantStyles[variant]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
