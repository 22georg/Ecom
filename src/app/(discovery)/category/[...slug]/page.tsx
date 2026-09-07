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
import { ChevronLeft, ChevronRight, SlidersHorizontal, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SortSelect } from '@/components/discovery/SortSelect';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { slug?: string[] };
  searchParams: {
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    sort?: string;
    page?: string;
    q?: string;
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

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const slugArray = params.slug || [];
  const categorySlug = slugArray[0];
  const subCategorySlug = slugArray[1];

  const brandSlugs = searchParams.brand ? searchParams.brand.split(',').filter(Boolean) : [];
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const rating = searchParams.rating ? Number(searchParams.rating) : undefined;
  const sort = (searchParams.sort as any) || 'featured';
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const query = searchParams.q || undefined;

  // Fetch product list & facet data concurrently
  const [filterResult, facets] = await Promise.all([
    CatalogService.getFilteredProducts({
      categorySlug,
      subCategorySlug,
      brandSlugs,
      minPrice,
      maxPrice,
      rating,
      sort,
      page,
      pageSize: 12,
      query,
    }),
    CatalogService.getAvailableFilters(categorySlug),
  ]);

  const products = (filterResult.items || []).map(mapToCardData);
  const totalPages = filterResult.totalPages || 1;

  // Breadcrumb items
  const formatSlug = (s?: string) =>
    s ? s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  const categoryName = formatSlug(categorySlug);
  const subCategoryName = formatSlug(subCategorySlug);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: categoryName || 'Catalog', href: categorySlug ? `/category/${categorySlug}` : '/category' },
    ...(subCategorySlug
      ? [{ label: subCategoryName, href: `/category/${categorySlug}/${subCategorySlug}` }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1 mq-container py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbs} className="mb-6" />

        {/* Page Title Header & Sorting Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--mq-border)] pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-[var(--mq-text-primary)] capitalize">
              {subCategoryName || categoryName || 'Product Catalog'}
            </h1>
            <p className="text-xs text-[var(--mq-text-tertiary)] mt-1">
              Showing {products.length} of {filterResult.total || 0} products matching current parameters.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--mq-text-secondary)] shrink-0">Sort By:</span>
            <SortSelect currentSort={sort} />
          </div>
        </div>

        {/* Layout Grid: Sidebar + Main Listing */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <FilterSidebar
              brands={facets.brands}
              subcategories={facets.subcategories}
              categorySlug={categorySlug}
            />
          </aside>

          {/* Main Catalog Content */}
          <section className="lg:col-span-3 space-y-6">
            {/* Mobile Filter Drawer Trigger */}
            <div className="lg:hidden flex items-center justify-between bg-[var(--mq-surface-card)] border border-[var(--mq-border)] p-3 rounded-lg">
              <span className="text-xs font-bold text-[var(--mq-text-primary)]">Refine Catalog</span>
              <MobileFilterDrawer
                brands={facets.brands}
                subcategories={facets.subcategories}
                categorySlug={categorySlug}
              />
            </div>

            {/* Active Filter Chips */}
            <ActiveFilterChips brands={facets.brands} />

            {/* Products Grid */}
            {products.length > 0 ? (
              <ProductGrid products={products} columns={3} />
            ) : (
              <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[var(--mq-surface-muted)] text-[var(--mq-text-tertiary)] flex items-center justify-center mb-4">
                  <PackageX className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[var(--mq-text-primary)]">No Matching Products Found</h3>
                <p className="text-xs text-[var(--mq-text-tertiary)] max-w-sm mt-1 mb-6">
                  We couldn't find any products matching your selected filters. Try broadening your price range or clearing specific criteria.
                </p>
                <a href={categorySlug ? `/category/${categorySlug}` : '/category'}>
                  <Button variant="outline" size="sm">
                    Reset Filter Criteria
                  </Button>
                </a>
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
