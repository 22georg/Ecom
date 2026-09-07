'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Request failed. Please try again.');
        setIsLoading(false);
        return;
      }

      setMessage(data.message || 'If an account exists for that email address, password reset instructions have been sent.');
      setIsLoading(false);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--mq-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6 mq-animate-fade-in">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--mq-secondary)] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            M
          </div>
          <h1 className="text-2xl font-extrabold font-display text-[var(--mq-text-primary)]">
            Reset Password
          </h1>
          <p className="text-xs text-[var(--mq-text-secondary)]">
            Enter your email address to receive password reset instructions.
          </p>
        </div>

        <Card variant="elevated" className="p-6 md:p-8">
          {message ? (
            <div className="flex flex-col gap-4 text-center">
              <Alert variant="info">{message}</Alert>
              <Button variant="outline" size="md" onClick={() => (window.location.href = '/login')}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <Alert variant="error">{error}</Alert>}

              <Input
                label="Registered Email Address"
                type="email"
                placeholder="alex@marqivo.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Instructions
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-[var(--mq-border)] text-center text-xs">
            <a href="/login" className="inline-flex items-center gap-1.5 text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)]">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
