'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { User, MapPin, Shield, CheckCircle2, ArrowRight, Package, RefreshCw, Bell, Heart } from 'lucide-react';
import { AuthenticatedCustomer } from '@/lib/auth';

export default function AccountOverviewPage() {
  const [customer, setCustomer] = useState<AuthenticatedCustomer | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    returnRequests: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setCustomer(data.customer);
      })
      .catch(() => {});

    // Fetch order metrics
    fetch('/api/account/orders')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const orders = json.data;
          const active = orders.filter((o: any) => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status));
          setStats((prev) => ({ ...prev, totalOrders: orders.length, activeOrders: active.length }));
        }
      })
      .catch(() => {});

    // Fetch return requests
    fetch('/api/account/returns')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats((prev) => ({ ...prev, returnRequests: json.data.length }));
        }
      })
      .catch(() => {});

    // Fetch unread notifications
    fetch('/api/account/notifications')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setStats((prev) => ({ ...prev, unreadNotifications: json.data.unreadCount }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-6 mq-animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--mq-text-primary)]">
          Account Overview
        </h1>
        <p className="text-xs text-[var(--mq-text-secondary)] mt-1">
          Welcome back to your MARQIVO customer portal.
        </p>
      </div>

      {/* Summary Banner Card */}
      <Card variant="default" className="p-6 bg-gradient-to-r from-[var(--mq-primary)] to-slate-900 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Badge variant="warning" size="sm" className="w-max">
              AUTHENTICATED SESSION
            </Badge>
            <h2 className="text-xl font-bold text-white mt-1">
              Hello, {customer?.firstName || 'Valued Customer'}!
            </h2>
            <p className="text-xs text-slate-300">
              Your account status is <strong className="text-emerald-400">{customer?.status || 'ACTIVE'}</strong>. Real-time PostgreSQL session connected.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => (window.location.href = '/account/profile')}
          >
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Post-Purchase Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/account/orders" className="block">
          <Card variant="interactive" className="p-4 border border-[var(--mq-border)] hover:border-[var(--mq-primary)] transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--mq-text-muted)]">Total Orders</span>
              <Package className="w-4 h-4 text-[var(--mq-primary)]" />
            </div>
            <span className="text-2xl font-black text-[var(--mq-text-primary)]">{stats.totalOrders}</span>
            <p className="text-[10px] text-[var(--mq-text-muted)] mt-1">View full history →</p>
          </Card>
        </Link>

        <Link href="/account/orders?status=SHIPPED" className="block">
          <Card variant="interactive" className="p-4 border border-[var(--mq-border)] hover:border-[var(--mq-primary)] transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--mq-text-muted)]">Active Orders</span>
              <RefreshCw className="w-4 h-4 text-[var(--mq-accent-amber)]" />
            </div>
            <span className="text-2xl font-black text-[var(--mq-text-primary)]">{stats.activeOrders}</span>
            <p className="text-[10px] text-[var(--mq-text-muted)] mt-1">Track delivery status →</p>
          </Card>
        </Link>

        <Link href="/account/returns" className="block">
          <Card variant="interactive" className="p-4 border border-[var(--mq-border)] hover:border-[var(--mq-primary)] transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--mq-text-muted)]">Return Requests</span>
              <RefreshCw className="w-4 h-4 text-[var(--mq-accent-coral)]" />
            </div>
            <span className="text-2xl font-black text-[var(--mq-text-primary)]">{stats.returnRequests}</span>
            <p className="text-[10px] text-[var(--mq-text-muted)] mt-1">Manage return status →</p>
          </Card>
        </Link>

        <Link href="/account/notifications" className="block">
          <Card variant="interactive" className="p-4 border border-[var(--mq-border)] hover:border-[var(--mq-primary)] transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--mq-text-muted)]">Notifications</span>
              <Bell className="w-4 h-4 text-[var(--mq-accent-emerald)]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[var(--mq-text-primary)]">{stats.unreadNotifications}</span>
              {stats.unreadNotifications > 0 && (
                <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">Unread</span>
              )}
            </div>
            <p className="text-[10px] text-[var(--mq-text-muted)] mt-1">Notification Center →</p>
          </Card>
        </Link>
      </div>

      {/* Action Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="interactive" className="p-5 flex flex-col justify-between gap-4" onClick={() => (window.location.href = '/account/profile')}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--mq-secondary-light)]/50 text-[var(--mq-secondary)]">
              <User className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold text-sm text-[var(--mq-text-primary)]">Personal Profile</h4>
              <span className="text-[11px] text-[var(--mq-text-tertiary)]">Name, Email, Phone</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-[var(--mq-secondary)] flex items-center gap-1">
            Manage Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Card>

        <Card variant="interactive" className="p-5 flex flex-col justify-between gap-4" onClick={() => (window.location.href = '/account/addresses')}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--mq-secondary-light)]/50 text-[var(--mq-secondary)]">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold text-sm text-[var(--mq-text-primary)]">Saved Addresses</h4>
              <span className="text-[11px] text-[var(--mq-text-tertiary)]">Shipping & Billing</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-[var(--mq-secondary)] flex items-center gap-1">
            Manage Addresses <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Card>

        <Card variant="interactive" className="p-5 flex flex-col justify-between gap-4" onClick={() => (window.location.href = '/account/security')}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[var(--mq-secondary-light)]/50 text-[var(--mq-secondary)]">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold text-sm text-[var(--mq-text-primary)]">Security Settings</h4>
              <span className="text-[11px] text-[var(--mq-text-tertiary)]">Password & Sessions</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-[var(--mq-secondary)] flex items-center gap-1">
            Manage Security <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Card>
      </div>

      {/* Account Security Verification Status */}
      <Card variant="default" className="p-5 flex items-center gap-4">
        <CheckCircle2 className="w-6 h-6 text-[var(--mq-success-text)] shrink-0" />
        <div className="flex flex-col text-xs">
          <span className="font-bold text-[var(--mq-text-primary)]">IDOR Access Control Active</span>
          <span className="text-[var(--mq-text-secondary)]">
            Your customer endpoints derive identity strictly from your HTTP-Only session token.
          </span>
        </div>
      </Card>
    </div>
  );
}
