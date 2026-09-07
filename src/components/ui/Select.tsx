import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ComponentSize } from '@/types';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  selectSize?: ComponentSize;
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      selectSize = 'md',
      containerClassName = '',
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const sizes: Record<ComponentSize, string> = {
      sm: 'h-8 pl-3 pr-8 text-xs',
      md: 'h-10 pl-3.5 pr-9 text-sm',
      lg: 'h-12 pl-4 pr-10 text-base',
    };

    const borderStyle = error
      ? 'border-[var(--mq-error)] focus:border-[var(--mq-error)] focus:ring-[var(--mq-error-bg)]'
      : 'border-[var(--mq-border)] focus:border-[var(--mq-border-focus)] focus:ring-[rgba(13,148,136,0.2)]';

    return (
      <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold tracking-wide text-[var(--mq-text-primary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full appearance-none rounded-md bg-[var(--mq-surface)] text-[var(--mq-text-primary)] border transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-[var(--mq-surface-muted)] disabled:opacity-70 disabled:cursor-not-allowed ${sizes[selectSize]} ${borderStyle} ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-[var(--mq-text-tertiary)] flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
