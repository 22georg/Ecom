import React from 'react';
import { ComponentSize } from '@/types';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: ComponentSize;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      inputSize = 'md',
      containerClassName = '',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizes: Record<ComponentSize, string> = {
      sm: 'h-8 px-2.5 text-xs',
      md: 'h-10 px-3.5 text-sm',
      lg: 'h-12 px-4 text-base',
    };

    const iconPaddingLeft = leftIcon ? (inputSize === 'sm' ? 'pl-8' : inputSize === 'lg' ? 'pl-11' : 'pl-10') : '';
    const iconPaddingRight = rightIcon ? (inputSize === 'sm' ? 'pr-8' : inputSize === 'lg' ? 'pr-11' : 'pr-10') : '';

    const borderStyle = error
      ? 'border-[var(--mq-error)] focus:border-[var(--mq-error)] focus:ring-[var(--mq-error-bg)]'
      : 'border-[var(--mq-border)] focus:border-[var(--mq-border-focus)] focus:ring-[rgba(13,148,136,0.2)]';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-[var(--mq-text-primary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-[var(--mq-text-tertiary)] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full rounded-md bg-[var(--mq-surface)] text-[var(--mq-text-primary)] placeholder-[var(--mq-text-tertiary)] border transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-[var(--mq-surface-muted)] disabled:opacity-70 disabled:cursor-not-allowed ${sizes[inputSize]} ${iconPaddingLeft} ${iconPaddingRight} ${borderStyle} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[var(--mq-text-tertiary)] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <span className="text-xs font-medium text-[var(--mq-error)]">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[var(--mq-text-tertiary)]">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
