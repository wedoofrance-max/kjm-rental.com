import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  shadow?: 'sm' | 'md' | 'lg';
}

const shadowStyles = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export function Card({
  children,
  hoverable = false,
  shadow = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-neutral-200
        transition-all duration-300
        ${shadowStyles[shadow]}
        ${hoverable ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-5 border-b border-neutral-100 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardBody({ children, className, ...props }: CardBodyProps) {
  return (
    <div className={`p-6 ${className || ''}`} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-neutral-100 bg-neutral-50 rounded-b-2xl ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
