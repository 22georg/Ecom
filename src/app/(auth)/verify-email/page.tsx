'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please check your verification link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage('Network error while verifying token.');
      }
    };

    verify();
  }, [token]);

  return (
    <Card variant="elevated" className="p-8 text-center flex flex-col items-center gap-4">
      {status === 'loading' && (
        <>
          <Loader2 className="w-10 h-10 text-[var(--mq-secondary)] animate-spin" />
          <h3 className="text-lg font-bold text-[var(--mq-text-primary)]">Verifying Your Account...</h3>
          <p className="text-xs text-[var(--mq-text-secondary)]">Please wait while we validate your token.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="p-3 bg-[var(--mq-success-bg)] text-[var(--mq-success-text)] rounded-full border border-[var(--mq-success-border)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--mq-text-primary)]">Email Verified!</h3>
          <p className="text-xs text-[var(--mq-text-secondary)] leading-relaxed">{message}</p>
          <Button variant="primary" size="md" className="mt-2" onClick={() => (window.location.href = '/login')}>
            Sign In Now
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="p-3 bg-[var(--mq-error-bg)] text-[var(--mq-error-text)] rounded-full border border-[var(--mq-error-border)]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--mq-error-text)]">Verification Failed</h3>
          <p className="text-xs text-[var(--mq-text-secondary)] leading-relaxed">{message}</p>
          <Button variant="outline" size="md" className="mt-2" onClick={() => (window.location.href = '/login')}>
            Back to Sign In
          </Button>
        </>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[var(--mq-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md mq-animate-fade-in">
        <Suspense fallback={<Card variant="elevated" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--mq-secondary)]" /></Card>}>
          <VerifyEmailForm />
        </Suspense>
      </div>
    </div>
  );
}
