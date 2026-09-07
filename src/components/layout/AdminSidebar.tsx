'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  activePath,
  onNavigate,
}) => {
  const menuGroups = [
    {
      title: 'Management',
      items: [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" />, badge: '124' },
        { id: 'categories', label: 'Categories', icon: <FolderTree className="w-5 h-5" /> },
        { id: 'inventory', label: 'Inventory', icon: <Boxes className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Commerce Engine',
      items: [
        { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" />, badge: '8 New' },
        { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
        { id: 'promotions', label: 'Promotions', icon: <Tag className="w-5 h-5" /> },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
      ],
    },
  ];

  return (
    <aside
      className={`relative h-screen bg-[var(--mq-primary)] text-white border-r border-slate-800 transition-all duration-300 flex flex-col z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-[var(--mq-secondary)] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            M
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-display font-extrabold text-lg tracking-tight text-white leading-none">
                MARQIVO
              </span>
              <span className="text-[10px] font-semibold text-[var(--mq-secondary)] tracking-wider uppercase mt-1">
                Admin Console
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {group.title}
              </span>
            )}
            {group.items.map((item) => {
              const isActive = activePath === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                    isActive
                      ? 'bg-[var(--mq-secondary)] text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <Badge variant={isActive ? 'neutral' : 'warning'} size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Platform Status Footer */}
      {!collapsed && (
        <div className="p-3.5 m-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[var(--mq-secondary)] shrink-0" />
          <div className="flex flex-col text-[11px] truncate">
            <span className="font-semibold text-white">Railway Production</span>
            <span className="text-slate-400">PostgreSQL Ready</span>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex absolute -right-3.5 top-20 w-7 h-7 rounded-full bg-[var(--mq-surface)] border border-[var(--mq-border)] text-[var(--mq-text-primary)] items-center justify-center shadow-md hover:bg-[var(--mq-surface-muted)] transition-colors z-40"
        aria-label="Toggle sidebar collapse"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};
