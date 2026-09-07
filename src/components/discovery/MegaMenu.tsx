'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
}

export const MegaMenu: React.FC = () => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/catalog/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          // Dynamic fallback categories
          setCategories([
            {
              id: 'c1',
              name: 'Smart Hardware',
              slug: 'smart-hardware',
              children: [
                { id: 'c11', name: 'Sensors & IoT', slug: 'sensors' },
                { id: 'c12', name: 'Security Pods', slug: 'security-pods' },
              ],
            },
            {
              id: 'c2',
              name: 'Minimal Workspace',
              slug: 'minimal-workspace',
              children: [
                { id: 'c21', name: 'Ergonomic Stands', slug: 'stands' },
                { id: 'c22', name: 'Desk Lighting', slug: 'lighting' },
              ],
            },
            {
              id: 'c3',
              name: 'Audio Architecture',
              slug: 'audio-architecture',
              children: [
                { id: 'c31', name: 'Wireless Pods', slug: 'wireless-pods' },
                { id: 'c32', name: 'Acoustic Drivers', slug: 'drivers' },
              ],
            },
            {
              id: 'c4',
              name: 'Carry & Apparel',
              slug: 'carry-apparel',
              children: [
                { id: 'c41', name: 'Tech Packs', slug: 'tech-packs' },
                { id: 'c42', name: 'Minimal Apparel', slug: 'apparel' },
              ],
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav aria-label="Main Store Navigation" className="relative hidden md:block">
      <div className="mq-container flex items-center gap-8 py-2.5 text-xs font-semibold">
        <a
          href="/search"
          className="text-[var(--mq-secondary)] font-bold hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Products</span>
        </a>

        {categories.map((cat) => {
          const hasChildren = cat.children && cat.children.length > 0;
          return (
            <div
              key={cat.id}
              className="relative group py-1"
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <a
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1 text-[var(--mq-text-secondary)] hover:text-[var(--mq-text-primary)] transition-colors py-1"
              >
                <span>{cat.name}</span>
                {hasChildren && <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform" />}
              </a>

              {/* Mega Dropdown Menu */}
              {hasChildren && hoveredCategory === cat.id && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-xl shadow-xl p-4 z-50 mq-animate-fade-in flex flex-col gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--mq-secondary)] border-b border-[var(--mq-border)] pb-2 mb-1">
                    {cat.name} Subcategories
                  </div>
                  {cat.children!.map((sub) => (
                    <a
                      key={sub.id}
                      href={`/category/${cat.slug}/${sub.slug}`}
                      className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)] hover:text-[var(--mq-secondary)] transition-colors flex items-center justify-between"
                    >
                      <span>{sub.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};
