'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Safe internal redirect
      const safeReturnTo = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/account';
      router.push(safeReturnTo);
      router.refresh();
    } catch (err) {
      setError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card variant="elevated" className="p-6 md:p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@marqivo.local"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wide text-[var(--mq-text-primary)]">
              Password
            </label>
            <a href="/forgot-password" className="text-xs text-[var(--mq-secondary)] hover:underline">
              Forgot Password?
            </a>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[var(--mq-text-tertiary)] hover:text-[var(--mq-text-primary)]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--mq-border)] text-center text-xs text-[var(--mq-text-secondary)]">
        <span>Don't have an account? </span>
        <a href="/register" className="font-bold text-[var(--mq-secondary)] hover:underline">
          Create an Account
        </a>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--mq-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6 mq-animate-fade-in">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--mq-secondary)] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            M
          </div>
          <h1 className="text-2xl font-extrabold font-display text-[var(--mq-text-primary)]">
            Sign in to MARQIVO
          </h1>
          <p className="text-xs text-[var(--mq-text-secondary)]">
            Access your customer portal, orders, and saved addresses.
          </p>
        </div>

        <Suspense fallback={<Card variant="elevated" className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--mq-secondary)]" /></Card>}>
          <LoginForm />
        </Suspense>

        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--mq-text-tertiary)]">
          <ShieldCheck className="w-4 h-4 text-[var(--mq-secondary)]" />
          <span>Encrypted Session • HTTP-Only Cookie Protection</span>
        </div>
      </div>
    </div>
  );
}
