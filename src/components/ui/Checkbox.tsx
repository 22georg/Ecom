import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
  containerClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, containerClassName = '', className = '', id, checked, disabled, onChange, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${containerClassName}`}
      >
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div className="w-4 h-4 rounded border border-[var(--mq-border)] bg-[var(--mq-surface)] peer-checked:bg-[var(--mq-secondary)] peer-checked:border-[var(--mq-secondary)] peer-focus:ring-2 peer-focus:ring-[var(--mq-secondary-light)] transition-all duration-150 flex items-center justify-center">
            <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150 stroke-[3]" />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col text-sm">
            {label && <span className="font-medium text-[var(--mq-text-primary)]">{label}</span>}
            {description && <span className="text-xs text-[var(--mq-text-tertiary)]">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
