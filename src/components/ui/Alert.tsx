import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { StatusVariant } from '@/types';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const icons: Record<string, React.ReactNode> = {
    info: <Info className="w-5 h-5 text-[var(--mq-info-text)] shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-[var(--mq-success-text)] shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--mq-warning-text)] shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--mq-error-text)] shrink-0 mt-0.5" />,
  };

  const variants = {
    info: 'bg-[var(--mq-info-bg)] border-[var(--mq-info-border)] text-[var(--mq-info-text)]',
    success: 'bg-[var(--mq-success-bg)] border-[var(--mq-success-border)] text-[var(--mq-success-text)]',
    warning: 'bg-[var(--mq-warning-bg)] border-[var(--mq-warning-border)] text-[var(--mq-warning-text)]',
    error: 'bg-[var(--mq-error-bg)] border-[var(--mq-error-border)] text-[var(--mq-error-text)]',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-lg border text-sm transition-all duration-200 ${variants[variant]} ${className}`}
    >
      {icons[variant]}
      <div className="flex-1 flex flex-col gap-1">
        {title && <h5 className="font-semibold leading-tight">{title}</h5>}
        <div className="opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/5 transition-colors text-current shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
