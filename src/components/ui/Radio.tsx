import React from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
  containerClassName?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, containerClassName = '', className = '', id, disabled, ...props }, ref) => {
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
            type="radio"
            id={inputId}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className="w-4 h-4 rounded-full border border-[var(--mq-border)] bg-[var(--mq-surface)] peer-checked:border-[var(--mq-secondary)] peer-focus:ring-2 peer-focus:ring-[var(--mq-secondary-light)] transition-all duration-150 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[var(--mq-secondary)] opacity-0 peer-checked:opacity-100 transition-opacity duration-150" />
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

Radio.displayName = 'Radio';
