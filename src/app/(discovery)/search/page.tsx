import React from 'react';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';
import { FilterSidebar } from '@/components/discovery/FilterSidebar';
import { MobileFilterDrawer } from '@/components/discovery/MobileFilterDrawer';
import { ActiveFilterChips } from '@/components/discovery/ActiveFilterChips';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { CatalogService } from '@/services/catalog.service';
import { ProductCardData } from '@/components/discovery/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ChevronLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SortSelect } from '@/components/discovery/SortSelect';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: {
    q?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    sort?: string;
    page?: string;
  };
}

function mapToCardData(p: any): ProductCardData {
  const firstVariant = p.variants?.[0];
  const price = firstVariant ? Number(firstVariant.price) : 99.99;
  const compareAtPrice = firstVariant?.compareAtPrice ? Number(firstVariant.compareAtPrice) : undefined;
  const mediaUrl = p.media?.[0]?.mediaUrl;
  const categoryName = p.categories?.[0]?.category?.name;
  const brandName = p.brand?.name;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName,
    brandName,
    price,
    compareAtPrice,
    ratingAvg: p.ratingAvg ? Number(p.ratingAvg) : 4.5,
    reviewCount: p.reviewCount || 8,
    mediaUrl,
    stockStatus: 'in_stock',
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const brandSlugs = searchParams.brand ? searchParams.brand.split(',').filter(Boolean) : [];
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const rating = searchParams.rating ? Number(searchParams.rating) : undefined;
  const sort = (searchParams.sort as any) || 'featured';
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;

  const [filterResult, facets] = await Promise.all([
    CatalogService.getFilteredProducts({
      query,
      brandSlugs,
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      pageSize: 12,
    }),
    CatalogService.getAvailableFilters(),
  ]);

  const products = (filterResult.items || []).map(mapToCardData);
  const totalPages = filterResult.totalPages || 1;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search Results', href: '/search' },
  ];

  return (
    <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 mq-container py-8">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Search Header Banner */}
        <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-6 sm:p-8 rounded-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--mq-secondary)] uppercase tracking-wider mb-1">
                <Search className="w-3.5 h-3.5" />
                <span>Search Catalog</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--mq-text-primary)]">
                {query ? (
                  <>
                    Results for <span className="text-[var(--mq-secondary)]">"{query}"</span>
                  </>
                ) : (
                  'All Catalog Products'
                )}
              </h1>
              <p className="text-xs text-[var(--mq-text-tertiary)] mt-1">
                Found {filterResult.total || 0} product matches across all categories.
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--mq-text-secondary)] shrink-0">Sort By:</span>
              <SortSelect currentSort={sort} />
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              brands={facets.brands}
              subcategories={facets.subcategories}
            />
          </aside>

          <section className="lg:col-span-3 space-y-6">
            <div className="lg:hidden flex items-center justify-between bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-3 rounded-lg">
              <span className="text-xs font-bold text-[var(--mq-text-primary)]">Refine Results</span>
              <MobileFilterDrawer
                brands={facets.brands}
                subcategories={facets.subcategories}
              />
            </div>

            <ActiveFilterChips brands={facets.brands} />

            {products.length > 0 ? (
              <ProductGrid products={products} columns={3} />
            ) : (
              <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--mq-surface-muted)] text-[var(--mq-text-tertiary)] flex items-center justify-center mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[var(--mq-text-primary)]">No Search Results Found</h3>
                <p className="text-xs text-[var(--mq-text-tertiary)] max-w-sm mt-1 mb-6">
                  We couldn't find any products matching <span className="font-semibold">"{query}"</span>. Try checking spelling or using more generic keywords.
                </p>

                {/* Popular Keywords Fallback */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                  <span className="text-xs text-[var(--mq-text-tertiary)] w-full mb-1 font-semibold">Try searching for:</span>
                  {['Electronics', 'Laptop', 'Smartphones', 'Audio', 'Fashion'].map((term) => (
                    <a
                      key={term}
                      href={`/search?q=${encodeURIComponent(term)}`}
                      className="px-3 py-1.5 rounded-full bg-[var(--mq-surface-muted)] hover:bg-[var(--mq-secondary)] hover:text-white text-xs font-semibold transition-colors"
                    >
                      {term}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--mq-border)] pt-6 mt-8">
                <a
                  href={
                    page > 1
                      ? `?${new URLSearchParams({ ...searchParams, page: (page - 1).toString() }).toString()}`
                      : '#'
                  }
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    page <= 1 ? 'text-[var(--mq-text-tertiary)] pointer-events-none' : 'text-[var(--mq-secondary)] hover:underline'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </a>

                <span className="text-xs font-semibold text-[var(--mq-text-secondary)]">
                  Page {page} of {totalPages}
                </span>

                <a
                  href={
                    page < totalPages
                      ? `?${new URLSearchParams({ ...searchParams, page: (page + 1).toString() }).toString()}`
                      : '#'
                  }
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    page >= totalPages ? 'text-[var(--mq-text-tertiary)] pointer-events-none' : 'text-[var(--mq-secondary)] hover:underline'
                  }`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </section>
        </div>
      </main>

      <StorefrontFooter />
    </div>
  );
}
