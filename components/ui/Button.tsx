import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 border-0',
  secondary:
    'bg-neutral-900 text-white font-semibold hover:bg-neutral-800 active:bg-neutral-900 border border-neutral-800',
  outline:
    'bg-white text-primary-600 font-semibold border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50 active:bg-primary-100',
  ghost:
    'bg-transparent text-neutral-700 font-medium hover:bg-neutral-100 active:bg-neutral-200 border-0',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5 rounded-lg',
  md: 'px-5 py-3 text-base gap-2 rounded-xl',
  lg: 'px-7 py-4 text-lg gap-2.5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-sans
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden group
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className || ''}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shine effect for primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}

      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin flex-shrink-0" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
