import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <label
      className={`inline-flex items-start gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--mq-secondary)] ${
          isSm ? 'w-8 h-4' : 'w-11 h-6'
        } ${checked ? 'bg-[var(--mq-secondary)]' : 'bg-[var(--mq-border-hover)]'}`}
      >
        <span
          className={`inline-block rounded-full bg-white shadow transform transition duration-200 ease-in-out ${
            isSm ? 'w-3 h-3' : 'w-5 h-5'
          } ${checked ? (isSm ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0.5'}`}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col text-sm">
          {label && <span className="font-medium text-[var(--mq-text-primary)]">{label}</span>}
          {description && <span className="text-xs text-[var(--mq-text-tertiary)]">{description}</span>}
        </div>
      )}
    </label>
  );
};
