'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Lock, Shield, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SecurityPage() {
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/account/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update password.');
        setIsSaving(false);
        return;
      }

      addToast({
        type: 'success',
        title: 'Password Updated',
        description: 'Your security password has been changed. Other active sessions have been revoked.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSaving(false);
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 mq-animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--mq-text-primary)]">
          Security & Password
        </h1>
        <p className="text-xs text-[var(--mq-text-secondary)] mt-1">
          Update your authentication password and session preferences.
        </p>
      </div>

      <Card variant="default">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[var(--mq-secondary)]" />
            <span>Change Account Password</span>
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              size="md"
              isLoading={isSaving}
              leftIcon={<Shield className="w-4 h-4" />}
              className="w-max mt-2"
            >
              Update Password
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
