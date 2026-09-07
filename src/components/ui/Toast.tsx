'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { StatusVariant, ToastMessage } from '@/types';

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type: StatusVariant) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[var(--mq-success)] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[var(--mq-error)] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[var(--mq-warning)] shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-[var(--mq-info)] shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-lg bg-[var(--mq-surface)] border border-[var(--mq-border)] shadow-lg mq-animate-fade-in text-sm"
          >
            {getIcon(t.type)}
            <div className="flex-1 flex flex-col gap-0.5">
              <h5 className="font-semibold text-[var(--mq-text-primary)]">{t.title}</h5>
              {t.description && <p className="text-xs text-[var(--mq-text-secondary)]">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-[var(--mq-text-tertiary)] hover:text-[var(--mq-text-primary)] transition-colors rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
