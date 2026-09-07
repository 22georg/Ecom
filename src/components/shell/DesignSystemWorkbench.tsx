'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  Search,
} from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Radio } from '../ui/Radio';
import { Toggle } from '../ui/Toggle';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { Breadcrumb } from '../ui/Breadcrumb';
import { Pagination } from '../ui/Pagination';
import { DataTable } from '../ui/DataTable';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { useToast } from '../ui/Toast';
import { DemoProduct } from '@/types';

export const DesignSystemWorkbench: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('components');

  // Form State
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [selectValue, setSelectValue] = useState('option1');
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioSelected, setRadioSelected] = useState('radio1');
  const [toggleChecked, setToggleChecked] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Demo Table Data
  const demoProducts: DemoProduct[] = [
    {
      id: 'MQ-101',
      name: 'Aura Connected Sensor Node',
      category: 'Smart Hardware',
      price: 149.0,
      originalPrice: 189.0,
      rating: 4.8,
      reviewCount: 34,
      stockStatus: 'in_stock',
      badge: 'FEATURED',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
    },
    {
      id: 'MQ-102',
      name: 'Kinetic Ergonomic Workstation',
      category: 'Minimal Workspace',
      price: 899.0,
      rating: 4.9,
      reviewCount: 112,
      stockStatus: 'in_stock',
      badge: 'BESTSELLER',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
    },
    {
      id: 'MQ-103',
      name: 'Pulse Modular Wireless Earbuds',
      category: 'Audio Architecture',
      price: 229.0,
      originalPrice: 269.0,
      rating: 4.6,
      reviewCount: 58,
      stockStatus: 'low_stock',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
    },
    {
      id: 'MQ-104',
      name: 'Cipher Encryption Storage Pod',
      category: 'Security Hardware',
      price: 349.0,
      rating: 4.7,
      reviewCount: 19,
      stockStatus: 'out_of_stock',
      imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147',
    },
  ];

  const tableColumns = [
    {
      header: 'Product ID',
      accessorKey: 'id' as keyof DemoProduct,
      sortable: true,
      cell: (p: DemoProduct) => <span className="mq-mono text-xs font-semibold">{p.id}</span>,
    },
    {
      header: 'Product Details',
      cell: (p: DemoProduct) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[var(--mq-surface-muted)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--mq-border)]">
            {p.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-[var(--mq-text-primary)]">{p.name}</span>
            <span className="text-[11px] text-[var(--mq-text-tertiary)]">{p.category}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Price',
      cell: (p: DemoProduct) => (
        <div className="flex items-center gap-2">
          <span className="mq-price text-xs">${p.price.toFixed(2)}</span>
          {p.originalPrice && (
            <span className="text-[11px] text-[var(--mq-text-tertiary)] line-through">
              ${p.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Availability',
      cell: (p: DemoProduct) => {
        const variantMap = {
          in_stock: { v: 'success' as const, label: 'In Stock' },
          low_stock: { v: 'warning' as const, label: 'Low Stock' },
          out_of_stock: { v: 'error' as const, label: 'Out of Stock' },
        };
        const conf = variantMap[p.stockStatus];
        return <Badge variant={conf.v}>{conf.label}</Badge>;
      },
    },
    {
      header: 'Actions',
      cell: (p: DemoProduct) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" aria-label="Edit">
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" aria-label="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--mq-background)] p-6 md:p-10 mq-animate-fade-in">
      <div className="mq-container flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--mq-border)] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md">
                MARQIVO v1.0 Foundation
              </Badge>
              <span className="text-xs text-[var(--mq-text-tertiary)]">Design System Workbench</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[var(--mq-text-primary)] mt-1">
              Design System & Component Catalog
            </h1>
            <p className="text-sm text-[var(--mq-text-secondary)] mt-1">
              Centralized design tokens, typography scale, responsive UI controls, and system state placeholders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() =>
                addToast({
                  type: 'success',
                  title: 'Design System Verified',
                  description: 'All 18 core UI components rendering with zero warnings.',
                })
              }
            >
              Test Notification
            </Button>
            <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
              Launch Dialog Test
            </Button>
          </div>
        </div>

        {/* Tab Switcher */}
        <Tabs
          tabs={[
            { id: 'components', label: 'Interactive Components', badge: '18' },
            { id: 'tokens', label: 'Color Tokens & Palette', icon: <Palette className="w-4 h-4" /> },
            { id: 'typography', label: 'Typography Scale', icon: <Layers className="w-4 h-4" /> },
            { id: 'states', label: 'Loading & System States' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />

        {/* TAB 1: COMPONENTS */}
        {activeTab === 'components' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BUTTON SYSTEM */}
            <Card variant="default">
              <Card.Header>
                <Card.Title>1. Button System</Card.Title>
                <Card.Description>Primary, Secondary, Outline, Ghost, Danger variants with loading and icon states.</Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                  <Button variant="secondary" isLoading>Processing</Button>
                  <Button variant="outline" leftIcon={<Plus className="w-4 h-4" />}>
                    Add Item
                  </Button>
                </div>
              </Card.Content>
            </Card>

            {/* FORM CONTROLS */}
            <Card variant="default">
              <Card.Header>
                <Card.Title>2. Form Controls & Inputs</Card.Title>
                <Card.Description>Validated inputs, selects, checkboxes, radios, and switch toggles.</Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    placeholder="alex@marqivo.local"
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      if (e.target.value.length < 4 && e.target.value.length > 0) {
                        setInputError('Email must be at least 4 characters');
                      } else {
                        setInputError('');
                      }
                    }}
                    error={inputError}
                    leftIcon={<Search className="w-4 h-4" />}
                  />
                  <Select
                    label="Platform Environment"
                    options={[
                      { label: 'Railway PostgreSQL (Production)', value: 'option1' },
                      { label: 'Local Development DB', value: 'option2' },
                      { label: 'Staging Sandbox', value: 'option3' },
                    ]}
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--mq-border)]">
                  <Checkbox
                    label="Enable Real-Time Inventory Sync"
                    description="Automatically reserve stock during checkout flow."
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                  />
                  <Toggle
                    label="Dark Theme Mode"
                    checked={toggleChecked}
                    onChange={setToggleChecked}
                    size="sm"
                  />
                </div>
              </Card.Content>
            </Card>

            {/* CARD & BADGES */}
            <Card variant="default">
              <Card.Header>
                <Card.Title>3. Status Badges & Alerts</Card.Title>
                <Card.Description>Visual status indicators and contextual notification callouts.</Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">Neutral</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
                <Alert variant="info" title="Railway Deployment Target Ready">
                  PostgreSQL database schema migrations and environment config are prepared for Prompt 2 execution.
                </Alert>
                <Alert variant="warning" title="Inventory Stock Advisory">
                  3 products have reached their low stock threshold.
                </Alert>
              </Card.Content>
            </Card>

            {/* BREADCRUMB & PAGINATION */}
            <Card variant="default">
              <Card.Header>
                <Card.Title>4. Navigation Controls</Card.Title>
                <Card.Description>Hierarchical breadcrumbs and pagination controllers.</Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-6">
                <Breadcrumb
                  items={[
                    { label: 'Catalog', href: '#' },
                    { label: 'Hardware', href: '#' },
                    { label: 'Sensors & IoT' },
                  ]}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={5}
                  onPageChange={setCurrentPage}
                />
              </Card.Content>
            </Card>

            {/* DATA TABLE DEMO */}
            <div className="lg:col-span-2">
              <Card variant="default">
                <Card.Header>
                  <Card.Title>5. Responsive Data Table Component</Card.Title>
                  <Card.Description>Clean tabular presentation with sorted columns and action buttons.</Card.Description>
                </Card.Header>
                <Card.Content>
                  <DataTable
                    columns={tableColumns}
                    data={demoProducts}
                    keyExtractor={(item) => item.id}
                  />
                </Card.Content>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: COLOR TOKENS */}
        {activeTab === 'tokens' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <Card.Header>
                <Card.Title>Primary & Secondary Tokens</Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-primary)] text-white text-xs font-mono">
                  <span>--mq-primary</span>
                  <span>#0F172A</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-secondary)] text-white text-xs font-mono">
                  <span>--mq-secondary</span>
                  <span>#0D9488</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-accent)] text-slate-900 text-xs font-mono">
                  <span>--mq-accent</span>
                  <span>#F59E0B</span>
                </div>
              </Card.Content>
            </Card>

            <Card variant="default">
              <Card.Header>
                <Card.Title>Surface & Background Tokens</Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-background)] border border-[var(--mq-border)] text-xs font-mono">
                  <span>--mq-background</span>
                  <span>#F8FAFC</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-surface)] border border-[var(--mq-border)] text-xs font-mono">
                  <span>--mq-surface</span>
                  <span>#FFFFFF</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-surface-muted)] border border-[var(--mq-border)] text-xs font-mono">
                  <span>--mq-surface-muted</span>
                  <span>#F1F5F9</span>
                </div>
              </Card.Content>
            </Card>

            <Card variant="default">
              <Card.Header>
                <Card.Title>Status Tokens</Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-3 text-xs font-mono">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-success-bg)] text-[var(--mq-success-text)] border border-[var(--mq-success-border)]">
                  <span>Success</span>
                  <span>#10B981</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-warning-bg)] text-[var(--mq-warning-text)] border border-[var(--mq-warning-border)]">
                  <span>Warning</span>
                  <span>#F59E0B</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--mq-error-bg)] text-[var(--mq-error-text)] border border-[var(--mq-error-border)]">
                  <span>Error</span>
                  <span>#EF4444</span>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}

        {/* TAB 3: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <Card variant="default">
            <Card.Header>
              <Card.Title>MARQIVO Typography Hierarchy</Card.Title>
              <Card.Description>Google Fonts: Outfit (Display & Headings), Plus Jakarta Sans (Body & UI), JetBrains Mono (Code & Prices).</Card.Description>
            </Card.Header>
            <Card.Content className="flex flex-col gap-6">
              <div>
                <span className="text-xs font-mono text-[var(--mq-text-tertiary)]">Display Heading (H1 - Outfit)</span>
                <h1 className="text-4xl font-extrabold text-[var(--mq-text-primary)]">
                  Modern commerce, intelligently connected.
                </h1>
              </div>
              <div>
                <span className="text-xs font-mono text-[var(--mq-text-tertiary)]">Section Heading (H2)</span>
                <h2 className="text-3xl font-bold text-[var(--mq-text-primary)]">
                  Seamless Discovery & Intelligent Purchasing
                </h2>
              </div>
              <div>
                <span className="text-xs font-mono text-[var(--mq-text-tertiary)]">Sub-heading (H3)</span>
                <h3 className="text-2xl font-bold text-[var(--mq-text-primary)]">
                  Product Catalog & Real-Time Stock Engine
                </h3>
              </div>
              <div>
                <span className="text-xs font-mono text-[var(--mq-text-tertiary)]">Body Text (Plus Jakarta Sans)</span>
                <p className="text-sm text-[var(--mq-text-secondary)] leading-relaxed max-w-2xl">
                  Customers receive clear, unbiased information to make confident purchasing decisions. The checkout pipeline validates inventory live and connects domain events to automated fulfillment workflows.
                </p>
              </div>
              <div>
                <span className="text-xs font-mono text-[var(--mq-text-tertiary)]">Price & Data Formatting (JetBrains Mono)</span>
                <div className="flex items-center gap-4 mt-1">
                  <span className="mq-price text-xl text-[var(--mq-secondary)]">$149.00 USD</span>
                  <span className="mq-mono text-xs bg-[var(--mq-surface-muted)] px-2 py-1 rounded border border-[var(--mq-border)]">
                    SKU: MQ-HARDWARE-9092
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        )}

        {/* TAB 4: STATES */}
        {activeTab === 'states' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="default">
              <Card.Header>
                <Card.Title>Skeleton Loading Placeholders</Card.Title>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={120} />
                <div className="flex gap-4">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card variant="default">
              <Card.Header>
                <Card.Title>Empty State Pattern</Card.Title>
              </Card.Header>
              <Card.Content>
                <EmptyState
                  title="Your Wishlist is Empty"
                  description="Explore our curated catalog to save hardware, apparel, and smart home items for later."
                  actionLabel="Browse Catalog"
                  onAction={() =>
                    addToast({
                      type: 'info',
                      title: 'Redirecting to Shop...',
                    })
                  }
                />
              </Card.Content>
            </Card>

            <div className="md:col-span-2">
              <Card variant="default">
                <Card.Header>
                  <Card.Title>Error State Pattern</Card.Title>
                </Card.Header>
                <Card.Content>
                  <ErrorState
                    title="Failed to Connect to Railway PostgreSQL"
                    description="Database connection timeout. Ensure DATABASE_URL is properly configured in environment settings."
                    onRetry={() =>
                      addToast({
                        type: 'warning',
                        title: 'Retrying connection...',
                      })
                    }
                  />
                </Card.Content>
              </Card>
            </div>
          </div>
        )}

        {/* MODAL TEST HARNESS */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="MARQIVO System Modal Test"
          description="Accessible dialog box with trap focus and backdrop blur."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  addToast({ type: 'success', title: 'Action Confirmed!' });
                }}
              >
                Confirm Action
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3 text-sm text-[var(--mq-text-secondary)]">
            <p>
              This dialog overlay demonstrates accessibility compliance, keyboard ESC listener, and clean surface design tokens.
            </p>
            <Alert variant="success" title="Ready for Prompt 2 Integration">
              Components are prepared to bind to PostgreSQL models and Prisma/Drizzle ORM service layers.
            </Alert>
          </div>
        </Modal>
      </div>
    </div>
  );
};
