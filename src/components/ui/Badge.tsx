import React from 'react';
import { StatusVariant } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full tracking-wide shrink-0';

  const variants: Record<StatusVariant, string> = {
    neutral: 'bg-[var(--mq-surface-muted)] text-[var(--mq-text-secondary)] border border-[var(--mq-border)]',
    primary: 'bg-[var(--mq-primary-light)] text-[var(--mq-primary)] border border-[var(--mq-border)]',
    success: 'bg-[var(--mq-success-bg)] text-[var(--mq-success-text)] border border-[var(--mq-success-border)]',
    warning: 'bg-[var(--mq-warning-bg)] text-[var(--mq-warning-text)] border border-[var(--mq-warning-border)]',
    error: 'bg-[var(--mq-error-bg)] text-[var(--mq-error-text)] border border-[var(--mq-error-border)]',
    info: 'bg-[var(--mq-info-bg)] text-[var(--mq-info-text)] border border-[var(--mq-info-border)]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
};
