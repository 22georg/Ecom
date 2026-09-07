'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, MapPin, Shield, LogOut, Package, Heart, Bell, LayoutDashboard, ChevronRight } from 'lucide-react';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AuthenticatedCustomer } from '@/lib/auth';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [customer, setCustomer] = useState<AuthenticatedCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
        } else {
          // Dev fallback customer for preview if DB connection placeholder is active
          setCustomer({
            id: 'dev-customer-id',
            email: 'alex.dev@marqivo.local',
            firstName: 'Alex',
            lastName: 'Rahman',
            phone: '+8801700000000',
            isActive: true,
            isVerified: true,
            status: 'ACTIVE',
          });
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/account', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Profile', href: '/account/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Addresses', href: '/account/addresses', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Orders & Tracking', href: '/account/orders', icon: <Package className="w-4 h-4" /> },
    { label: 'Returns & Refunds', href: '/account/returns', icon: <Package className="w-4 h-4" /> },
    { label: 'Notifications', href: '/account/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Saved Wishlists', href: '/wishlist', icon: <Heart className="w-4 h-4" /> },
    { label: 'Security & Password', href: '/account/security', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--mq-background)]">
      <StorefrontHeader theme="light" onToggleTheme={() => {}} />

      <main className="mq-container py-10 flex-1 flex flex-col md:flex-row gap-8">
        {/* Customer Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
          <Card variant="default" className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--mq-primary)] text-white font-bold flex items-center justify-center text-lg shrink-0">
              {customer ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}` : 'CU'}
            </div>
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-[var(--mq-text-primary)] truncate">
                {customer ? `${customer.firstName} ${customer.lastName}` : 'Customer'}
              </span>
              <span className="text-xs text-[var(--mq-text-tertiary)] truncate">{customer?.email}</span>
              <div className="mt-1">
                <Badge variant={customer?.isVerified ? 'success' : 'warning'} size="sm">
                  {customer?.isVerified ? 'Verified Account' : 'Verification Required'}
                </Badge>
              </div>
            </div>
          </Card>

          <Card variant="default" className="p-2 flex flex-col gap-1">
            {navItems.map((item, idx) => {
              const isActive = pathname === item.href;
              const isPlaceholder = item.href === '#';
              return (
                <a
                  key={idx}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[var(--mq-secondary)] text-white shadow-xs'
                      : isPlaceholder
                      ? 'text-[var(--mq-text-tertiary)] hover:bg-[var(--mq-surface-muted)]'
                      : 'text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-2 border-t border-[var(--mq-border)]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </Card>
        </aside>

        {/* Content Workspace Area */}
        <div className="flex-1 min-w-0">{children}</div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
