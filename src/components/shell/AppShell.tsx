'use client';

import React, { useState, useEffect } from 'react';
import { ShellMode, ThemeMode } from '@/types';
import { StorefrontShell } from './StorefrontShell';
import { AdminShell } from './AdminShell';
import { DesignSystemWorkbench } from './DesignSystemWorkbench';
import { ToastProvider } from '../ui/Toast';
import { Store, Shield, Palette, Moon, Sun } from 'lucide-react';

export const AppShell: React.FC = () => {
  const [shellMode, setShellMode] = useState<ShellMode>('storefront');
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Handle Theme switching by toggling [data-theme] on <html> document element
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ToastProvider>
      <div className="relative min-h-screen flex flex-col">
        {/* TOP FLOATING PERSISTENT CONTROLLER BAR */}
        <div className="sticky top-0 z-50 bg-[var(--mq-primary)] text-white px-4 py-2 flex items-center justify-between shadow-md border-b border-slate-700 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[var(--mq-secondary)] text-white font-bold flex items-center justify-center text-[10px]">
                M
              </div>
              <span className="font-bold tracking-tight text-white font-display hidden sm:inline">MARQIVO Shell</span>
            </div>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-slate-300 hidden md:inline">Modern commerce, intelligently connected.</span>
          </div>

          {/* Mode Navigation Pills */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setShellMode('storefront')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                shellMode === 'storefront'
                  ? 'bg-[var(--mq-secondary)] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Storefront Shell</span>
            </button>

            <button
              onClick={() => setShellMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                shellMode === 'admin'
                  ? 'bg-[var(--mq-secondary)] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>

            <button
              onClick={() => setShellMode('design-system')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                shellMode === 'design-system'
                  ? 'bg-[var(--mq-secondary)] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Design System Workbench</span>
              <span className="sm:hidden">UI Kit</span>
            </button>
          </div>

          {/* Theme Quick Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        {/* ACTIVE SHELL VIEW RENDER */}
        <div className="flex-1">
          {shellMode === 'storefront' && (
            <StorefrontShell theme={theme} onToggleTheme={toggleTheme} />
          )}

          {shellMode === 'admin' && (
            <AdminShell
              theme={theme}
              onToggleTheme={toggleTheme}
              onSwitchToStorefront={() => setShellMode('storefront')}
            />
          )}

          {shellMode === 'design-system' && <DesignSystemWorkbench />}
        </div>
      </div>
    </ToastProvider>
  );
};
