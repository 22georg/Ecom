import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this section. Please check your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-[var(--mq-error-bg)] border border-[var(--mq-error-border)] rounded-xl ${className}`}>
      <div className="p-3 bg-red-100 rounded-full mb-3 text-[var(--mq-error)]">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-[var(--mq-error-text)]">{title}</h4>
      <p className="text-xs text-[var(--mq-error-text)]/80 max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button variant="danger" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
