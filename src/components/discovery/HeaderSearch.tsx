'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Package, FolderTree, Tag, X } from 'lucide-react';

interface SuggestionItem {
  id: string;
  name: string;
  slug: string;
  type: 'product' | 'category' | 'brand';
  price?: number;
}

export const HeaderSearch: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced Autocomplete Search Query
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/catalog/search/autocomplete?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();

        const combined: SuggestionItem[] = [];

        if (data.products) {
          data.products.forEach((p: any) => {
            combined.push({
              id: p.id,
              name: p.name,
              slug: p.slug,
              type: 'product',
              price: p.variants?.[0]?.price ? Number(p.variants[0].price) : undefined,
            });
          });
        }

        if (data.categories) {
          data.categories.forEach((c: any) => {
            combined.push({
              id: c.id,
              name: c.name,
              slug: c.slug,
              type: 'category',
            });
          });
        }

        if (data.brands) {
          data.brands.forEach((b: any) => {
            combined.push({
              id: b.id,
              name: b.name,
              slug: b.slug,
              type: 'brand',
            });
          });
        }

        setSuggestions(combined);
        setIsOpen(combined.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Handle Outside Click & Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard Navigation Handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'product') {
      router.push(`/search?q=${encodeURIComponent(item.name)}`);
    } else if (item.type === 'category') {
      router.push(`/category/${item.slug}`);
    } else if (item.type === 'brand') {
      router.push(`/brand/${item.slug}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-[var(--mq-text-tertiary)] pointer-events-none">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[var(--mq-secondary)]" /> : <Search className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search products, brands, categories..."
          className="w-full h-10 pl-10 pr-9 rounded-full bg-[var(--mq-surface-muted)] text-sm text-[var(--mq-text-primary)] border border-[var(--mq-border)] focus:outline-none focus:border-[var(--mq-secondary)] focus:ring-2 focus:ring-[rgba(13,148,136,0.2)] transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 p-1 text-[var(--mq-text-tertiary)] hover:text-[var(--mq-text-primary)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-12 z-50 bg-[var(--mq-surface)] border border-[var(--mq-border)] rounded-xl shadow-xl overflow-hidden mq-animate-fade-in text-xs max-h-96 overflow-y-auto">
          <div className="p-2 border-b border-[var(--mq-border)] text-[11px] font-bold text-[var(--mq-text-tertiary)] uppercase tracking-wider">
            Search Suggestions
          </div>
          <div className="flex flex-col">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 text-left transition-colors ${
                    isSelected ? 'bg-[var(--mq-surface-muted)] text-[var(--mq-secondary)]' : 'text-[var(--mq-text-primary)] hover:bg-[var(--mq-surface-muted)]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    {item.type === 'product' && <Package className="w-4 h-4 text-[var(--mq-secondary)] shrink-0" />}
                    {item.type === 'category' && <FolderTree className="w-4 h-4 text-[var(--mq-accent)] shrink-0" />}
                    {item.type === 'brand' && <Tag className="w-4 h-4 text-[var(--mq-info)] shrink-0" />}
                    <span className="font-semibold truncate">{item.name}</span>
                  </div>
                  {item.price !== undefined && (
                    <span className="mq-price text-xs font-bold text-[var(--mq-text-primary)]">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                  {item.type !== 'product' && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--mq-surface-muted)] text-[var(--mq-text-tertiary)]">
                      {item.type}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
