import React from 'react';
import { Loader2 } from 'lucide-react';
import { ComponentSize, ComponentVariant } from '@/types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ComponentVariant;
  size?: ComponentSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Standardized CSS styles using MARQIVO design tokens
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none rounded-md';

    const variants: Record<ComponentVariant, string> = {
      primary:
        'bg-[var(--mq-primary)] text-[var(--mq-primary-foreground)] hover:bg-[var(--mq-primary-hover)] active:bg-[var(--mq-primary-active)] shadow-sm focus:ring-[var(--mq-secondary)]',
      secondary:
        'bg-[var(--mq-secondary)] text-[var(--mq-secondary-foreground)] hover:bg-[var(--mq-secondary-hover)] active:bg-[var(--mq-secondary-active)] shadow-sm focus:ring-[var(--mq-secondary)]',
      outline:
        'border border-[var(--mq-border)] bg-[var(--mq-surface)] text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] hover:border-[var(--mq-border-hover)] focus:ring-[var(--mq-secondary)]',
      ghost:
        'text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] active:bg-[var(--mq-surface-hover)] focus:ring-[var(--mq-secondary)]',
      danger:
        'bg-[var(--mq-error)] text-white hover:bg-[var(--mq-error-hover)] active:bg-[#b91c1c] shadow-sm focus:ring-[var(--mq-error)]',
    };

    const sizes: Record<ComponentSize, string> = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 h-8',
      md: 'px-4 py-2 text-sm gap-2 h-10',
      lg: 'px-6 py-3 text-base gap-2.5 h-12',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
