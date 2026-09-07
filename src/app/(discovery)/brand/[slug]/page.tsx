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
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, ChevronRight, Award, ExternalLink, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SortSelect } from '@/components/discovery/SortSelect';

export const dynamic = 'force-dynamic';

interface BrandPageProps {
  params: { slug: string };
  searchParams: {
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
    ratingAvg: p.ratingAvg ? Number(p.ratingAvg) : 4.6,
    reviewCount: p.reviewCount || 10,
    mediaUrl,
    stockStatus: 'in_stock',
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const brandSlug = params.slug;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const rating = searchParams.rating ? Number(searchParams.rating) : undefined;
  const sort = (searchParams.sort as any) || 'featured';
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;

  const [brand, filterResult, facets] = await Promise.all([
    CatalogService.getBrandBySlug(brandSlug),
    CatalogService.getFilteredProducts({
      brandSlugs: [brandSlug],
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      pageSize: 12,
    }),
    CatalogService.getAvailableFilters(),
  ]);

  const brandName = brand?.name || brandSlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const products = (filterResult.items || []).map(mapToCardData);
  const totalPages = filterResult.totalPages || 1;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Brands', href: '/search' },
    { label: brandName, href: `/brand/${brandSlug}` },
  ];

  return (
    <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 mq-container py-8">
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Brand Hero Header */}
        <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-6 sm:p-8 rounded-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {brand?.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brandName}
                className="w-16 h-16 rounded-xl object-contain bg-[var(--mq-surface-muted)] border border-[var(--mq-border)] p-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[var(--mq-primary)] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                {brandName.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--mq-text-primary)]">
                  {brandName}
                </h1>
                <Badge variant="info" size="sm">Verified Brand Partner</Badge>
              </div>
              <p className="text-xs text-[var(--mq-text-tertiary)] max-w-xl mt-1">
                {brand?.description || `Explore authentic products manufactured by ${brandName} with official warranty and instant shipping.`}
              </p>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-semibold text-[var(--mq-text-secondary)] shrink-0">Sort:</span>
            <SortSelect currentSort={sort} />
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              brands={facets.brands}
              subcategories={facets.subcategories}
            />
          </aside>

          <section className="lg:col-span-3 space-y-6">
            <div className="lg:hidden flex items-center justify-between bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-3 rounded-lg">
              <span className="text-xs font-bold text-[var(--mq-text-primary)]">Refine Brand Catalog</span>
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
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[var(--mq-text-primary)]">No Active Brand Products</h3>
                <p className="text-xs text-[var(--mq-text-tertiary)] max-w-sm mt-1 mb-6">
                  There are currently no active products listed for {brandName} matching your filter criteria.
                </p>
                <a href="/search">
                  <Button variant="outline" size="sm">
                    Browse All Brands
                  </Button>
                </a>
              </div>
            )}

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
