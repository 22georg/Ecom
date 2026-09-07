'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '../layout/AdminSidebar';
import { AdminTopbar } from '../layout/AdminTopbar';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DataTable } from '../ui/DataTable';
import { ThemeMode, MetricCardData } from '@/types';
import { useToast } from '../ui/Toast';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Plus,
  ArrowUpRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';

interface AdminShellProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSwitchToStorefront: () => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  theme,
  onToggleTheme,
  onSwitchToStorefront,
}) => {
  const { addToast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  const metricCards: MetricCardData[] = [
    {
      id: 'm1',
      title: 'Gross Revenue',
      value: '$48,920.50',
      change: '+14.2%',
      isPositive: true,
      period: 'vs last month',
    },
    {
      id: 'm2',
      title: 'Completed Orders',
      value: '1,248',
      change: '+8.6%',
      isPositive: true,
      period: 'vs last month',
    },
    {
      id: 'm3',
      title: 'Active Customers',
      value: '3,890',
      change: '+12.1%',
      isPositive: true,
      period: 'vs last month',
    },
    {
      id: 'm4',
      title: 'Checkout Conversion',
      value: '3.42%',
      change: '+0.5%',
      isPositive: true,
      period: 'vs last month',
    },
  ];

  const recentOrders = [
    { id: 'ORD-9021', customer: 'Sarah Jenkins', total: 348.0, status: 'Paid', items: 3, date: '10 mins ago' },
    { id: 'ORD-9020', customer: 'Marcus Vance', total: 149.0, status: 'Processing', items: 1, date: '25 mins ago' },
    { id: 'ORD-9019', customer: 'Elena Rostova', total: 899.0, status: 'Fulfilled', items: 2, date: '1 hour ago' },
    { id: 'ORD-9018', customer: 'David Chen', total: 229.0, status: 'Pending', items: 1, date: '2 hours ago' },
  ];

  const orderColumns = [
    {
      header: 'Order Reference',
      accessorKey: 'id' as const,
      cell: (o: any) => <span className="mq-mono font-bold text-xs text-[var(--mq-text-primary)]">{o.id}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customer' as const,
      cell: (o: any) => <span className="font-medium text-xs text-[var(--mq-text-primary)]">{o.customer}</span>,
    },
    {
      header: 'Order Value',
      cell: (o: any) => <span className="mq-price text-xs">${o.total.toFixed(2)}</span>,
    },
    {
      header: 'Payment Status',
      cell: (o: any) => {
        const variantMap: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
          Paid: 'success',
          Processing: 'info',
          Fulfilled: 'success',
          Pending: 'warning',
        };
        return <Badge variant={variantMap[o.status] || 'neutral'}>{o.status}</Badge>;
      },
    },
    {
      header: 'Placed',
      accessorKey: 'date' as const,
      cell: (o: any) => <span className="text-xs text-[var(--mq-text-tertiary)]">{o.date}</span>,
    },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--mq-background)] text-[var(--mq-text-primary)] transition-colors duration-200">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activePath={activeNav}
        onNavigate={setActiveNav}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          theme={theme}
          onToggleTheme={onToggleTheme}
          onSwitchToStorefront={onSwitchToStorefront}
        />

        <main className="p-6 md:p-8 flex-1 flex flex-col gap-8 overflow-y-auto">
          {/* Header Title & CTA Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-display text-[var(--mq-text-primary)]">
                Business Administration Dashboard
              </h1>
              <p className="text-xs text-[var(--mq-text-secondary)] mt-1">
                Real-time commerce telemetry, order processing pipeline, and catalog metrics.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() =>
                  addToast({
                    type: 'success',
                    title: 'Create Product Modal',
                    description: 'Product creation wizard ready for Prompt 2 catalog binding.',
                  })
                }
              >
                New Product
              </Button>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metricCards.map((m) => (
              <Card key={m.id} variant="default" className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--mq-text-secondary)]">{m.title}</span>
                  <div className="p-2 rounded-lg bg-[var(--mq-secondary-light)]/40 text-[var(--mq-secondary)]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-extrabold font-display text-[var(--mq-text-primary)]">
                    {m.value}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] mt-1">
                    <span className="font-bold text-[var(--mq-success-text)] flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {m.change}
                    </span>
                    <span className="text-[var(--mq-text-tertiary)]">{m.period}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Layout: Orders & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders List (Spans 2 columns) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Card variant="default">
                <Card.Header className="flex items-center justify-between">
                  <div>
                    <Card.Title>Live Orders Pipeline</Card.Title>
                    <Card.Description>Recent customer transactions requiring fulfillment.</Card.Description>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All Orders
                  </Button>
                </Card.Header>
                <Card.Content>
                  <DataTable
                    columns={orderColumns}
                    data={recentOrders}
                    keyExtractor={(o) => o.id}
                  />
                </Card.Content>
              </Card>
            </div>

            {/* Platform & Inventory Status Side Cards */}
            <div className="flex flex-col gap-6">
              <Card variant="default">
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-[var(--mq-secondary)]" />
                    <span>Inventory Status</span>
                  </Card.Title>
                </Card.Header>
                <Card.Content className="flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-surface-muted)]">
                    <span>Active SKUs</span>
                    <span className="font-bold text-[var(--mq-text-primary)]">124 Items</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-warning-bg)] text-[var(--mq-warning-text)] border border-[var(--mq-warning-border)]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Low Stock Alert</span>
                    </div>
                    <span className="font-bold">3 SKUs</span>
                  </div>
                  <Button variant="outline" size="sm" fullWidth className="mt-2">
                    Manage Stock Adjustments
                  </Button>
                </Card.Content>
              </Card>

              <Card variant="default" className="bg-gradient-to-br from-[var(--mq-primary)] to-slate-900 text-white">
                <Card.Content className="flex flex-col gap-3">
                  <Badge variant="warning" size="sm" className="w-max">
                    RAILWAY TARGET
                  </Badge>
                  <h4 className="text-base font-bold text-white">Database Architecture Ready</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    MARQIVO is prepared for PostgreSQL relational schema initialization in Prompt 2.
                  </p>
                </Card.Content>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
