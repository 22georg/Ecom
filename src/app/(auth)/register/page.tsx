'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms of Service to register.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.details?.join(', ') || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Account registered successfully!');
      setIsLoading(false);
    } catch (err) {
      setError('An unexpected network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--mq-background)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6 mq-animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--mq-secondary)] text-white flex items-center justify-center font-bold text-2xl shadow-md">
            M
          </div>
          <h1 className="text-2xl font-extrabold font-display text-[var(--mq-text-primary)]">
            Create MARQIVO Account
          </h1>
          <p className="text-xs text-[var(--mq-text-secondary)]">
            Join MARQIVO for intelligent shopping, order tracking, and custom wishlists.
          </p>
        </div>

        {/* Card Container */}
        <Card variant="elevated" className="p-6 md:p-8">
          {successMessage ? (
            <div className="flex flex-col items-center text-center p-4 gap-4">
              <div className="p-3 bg-[var(--mq-success-bg)] text-[var(--mq-success-text)] rounded-full border border-[var(--mq-success-border)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[var(--mq-text-primary)]">Check Your Inbox</h3>
              <p className="text-xs text-[var(--mq-text-secondary)] leading-relaxed">
                {successMessage}
              </p>
              <Button variant="primary" size="md" onClick={() => (window.location.href = '/login')}>
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <Alert variant="error">{error}</Alert>}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Last Name"
                  placeholder="Rahman"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="alex@marqivo.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Phone Number (Optional)"
                type="tel"
                placeholder="+8801700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Checkbox
                label="I agree to the MARQIVO Terms of Service and Privacy Policy"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                containerClassName="mt-1"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="mt-2"
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t border-[var(--mq-border)] text-center text-xs text-[var(--mq-text-secondary)]">
            <span>Already have an account? </span>
            <a href="/login" className="font-bold text-[var(--mq-secondary)] hover:underline">
              Sign In
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
