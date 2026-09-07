'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch (err) {
      setError('An unexpected network error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="p-6 md:p-8">
      {isSuccess ? (
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-[var(--mq-success-bg)] text-[var(--mq-success-text)] rounded-full border border-[var(--mq-success-border)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[var(--mq-text-primary)]">Password Reset Complete</h3>
          <p className="text-xs text-[var(--mq-text-secondary)]">
            Your password has been updated. You can now sign in with your new credentials.
          </p>
          <Button variant="primary" size="md" onClick={() => (window.location.href = '/login')}>
            Proceed to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Update Password
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[var(--mq-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6 mq-animate-fade-in">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--mq-secondary)] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            M
          </div>
          <h1 className="text-2xl font-extrabold font-display text-[var(--mq-text-primary)]">
            Create New Password
          </h1>
          <p className="text-xs text-[var(--mq-text-secondary)]">
            Enter your new password to restore account access.
          </p>
        </div>

        <Suspense fallback={<Card variant="elevated" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--mq-secondary)]" /></Card>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
