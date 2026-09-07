'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { User, Mail, Phone, Save } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { addToast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.customer) {
          setFirstName(data.customer.firstName || '');
          setLastName(data.customer.lastName || '');
          setEmail(data.customer.email || '');
          setPhone(data.customer.phone || '');
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile.');
        setIsSaving(false);
        return;
      }

      addToast({
        type: 'success',
        title: 'Profile Updated',
        description: 'Your personal details have been saved to your account.',
      });
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
          My Profile
        </h1>
        <p className="text-xs text-[var(--mq-text-secondary)] mt-1">
          Manage your personal information and contact details.
        </p>
      </div>

      <Card variant="default">
        <Card.Header>
          <Card.Title>Personal Details</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address (Account Identity)"
              value={email}
              disabled
              helperText="Email changes require verification."
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801700000000"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
              className="w-max mt-2"
            >
              Save Profile Changes
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
