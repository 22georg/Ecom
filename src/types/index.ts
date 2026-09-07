export type ThemeMode = 'light' | 'dark';

export type ShellMode = 'storefront' | 'admin' | 'design-system';

export type ComponentSize = 'sm' | 'md' | 'lg';

export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type StatusVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: StatusVariant;
  title: string;
  description?: string;
  duration?: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  badge?: string;
  imageUrl: string;
}
