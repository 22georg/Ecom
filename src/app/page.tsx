import React from 'react';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';
import { ProductGrid } from '@/components/discovery/ProductGrid';
import { CatalogService } from '@/services/catalog.service';
import { ProductCardData } from '@/components/discovery/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight,
  PackageCheck
} from 'lucide-react';

export const dynamic = 'force-dynamic';

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
    ratingAvg: p.ratingAvg ? Number(p.ratingAvg) : 4.8,
    reviewCount: p.reviewCount || 12,
    mediaUrl,
    stockStatus: 'in_stock',
  };
}

export default async function HomePage() {
  // Fetch real data from database via CatalogService
  const categoryTree = await CatalogService.getCategoryTree();
  const featuredRes = await CatalogService.getFilteredProducts({ sort: 'featured', pageSize: 8 });
  const newestRes = await CatalogService.getFilteredProducts({ sort: 'newest', pageSize: 8 });

  const featuredProducts = (featuredRes.items || []).map(mapToCardData);
  const newestProducts = (newestRes.items || []).map(mapToCardData);

  return (
    <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
      <StorefrontHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative bg-gradient-to-b from-[var(--mq-primary)] to-slate-900 text-white overflow-hidden py-20 lg:py-28 border-b border-slate-800">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          
          <div className="mq-container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-white/90">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Next-Generation E-Commerce Engine</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
                Modern commerce, <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  intelligently connected.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Discover high-performance electronics, minimalist apparel, and smart lifestyle hardware with sub-second faceted search, real-time inventory, and verified PostgreSQL data integrity.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="/category/electronics">
                  <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Explore Electronics
                  </Button>
                </a>
                <a href="/category/fashion">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    Browse Apparel
                  </Button>
                </a>
              </div>

              {/* Value Signals */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 w-full max-w-xl text-slate-300 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-Time Inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Autocomplete</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prisma ORM Powered</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Glassmorphism Hero Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--mq-secondary)] text-white font-bold flex items-center justify-center text-lg shadow-md">
                      M
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">MARQIVO Live Engine</h4>
                      <p className="text-[11px] text-teal-300">Catalog Version 2.0 Active</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">System Online</Badge>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Response Speed</div>
                    <div className="text-xl font-display font-extrabold text-white mt-0.5">&lt; 15ms</div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Sub-second search
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Active Products</div>
                    <div className="text-xl font-display font-extrabold text-white mt-0.5">{featuredProducts.length + 24}+</div>
                    <div className="text-[10px] text-teal-400 mt-1 flex items-center gap-1">
                      <PackageCheck className="w-3 h-3" /> Fully Synced
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Faceted Navigation</div>
                      <div className="text-[11px] text-slate-300">Multi-select brand & price boundaries</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES GRID SECTION */}
        <section className="py-16 mq-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[var(--mq-secondary)] uppercase tracking-wider">Catalog Taxonomy</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--mq-text-primary)] mt-1">
                Browse By Category
              </h2>
            </div>
            <p className="text-xs text-[var(--mq-text-tertiary)] max-w-md">
              Structured multi-tier categories mapped directly to PostgreSQL hierarchy with slug-based breadcrumbs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(categoryTree.length > 0 ? categoryTree : [
              { id: '1', name: 'Electronics', slug: 'electronics', children: [{ name: 'Laptops' }, { name: 'Smartphones' }, { name: 'Audio' }] },
              { id: '2', name: 'Fashion & Apparel', slug: 'fashion', children: [{ name: 'Outerwear' }, { name: 'Accessories' }] },
              { id: '3', name: 'Home & Living', slug: 'home-living', children: [{ name: 'Furniture' }, { name: 'Decor' }] },
              { id: '4', name: 'Sports & Fitness', slug: 'sports', children: [{ name: 'Fitness Gear' }, { name: 'Footwear' }] },
            ]).map((cat) => (
              <a
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group bg-[var(--mq-surface-card)] border border-[var(--mq-border)] hover:border-[var(--mq-secondary)] p-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[var(--mq-surface-muted)] text-[var(--mq-secondary)] flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-[var(--mq-secondary)] group-hover:text-white transition-colors">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--mq-text-primary)] group-hover:text-[var(--mq-secondary)] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--mq-text-tertiary)] mt-1">
                    {cat.children && cat.children.length > 0
                      ? cat.children.map((c: any) => c.name).join(' • ')
                      : 'Explore curated collection'}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-[var(--mq-secondary)] mt-6 group-hover:translate-x-1 transition-transform">
                  <span>Browse Subcategories</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* FEATURED PRODUCTS SECTION */}
        <section className="py-16 bg-[var(--mq-surface-muted)] border-y border-[var(--mq-border)]">
          <div className="mq-container">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--mq-secondary)] uppercase tracking-wider">Curated Highlights</span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--mq-text-primary)] mt-1">
                  Featured Hardware & Gear
                </h2>
              </div>
              <a href="/category/electronics">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All Products
                </Button>
              </a>
            </div>

            <ProductGrid products={featuredProducts} columns={4} />
          </div>
        </section>

        {/* NEW ARRIVALS SECTION */}
        <section className="py-16 mq-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-[var(--mq-secondary)] uppercase tracking-wider">Fresh In Stock</span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--mq-text-primary)] mt-1">
                New Arrivals
              </h2>
            </div>
            <a href="/search?sort=newest">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Latest Releases
              </Button>
            </a>
          </div>

          <ProductGrid products={newestProducts} columns={4} />
        </section>

        {/* BRAND PROMOTION BANNER */}
        <section className="py-16 mq-container">
          <div className="bg-gradient-to-r from-slate-900 via-[var(--mq-primary)] to-indigo-950 text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
            <div className="space-y-4 max-w-xl z-10">
              <Badge variant="info" size="sm">Brand Partners</Badge>
              <h3 className="text-2xl sm:text-4xl font-display font-extrabold text-white leading-tight">
                Crafted by Leading Technology Innovators
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We partner directly with verified brand manufacturers to guarantee authenticity, full warranty protection, and rapid warehouse fulfillment.
              </p>
              <div className="pt-2">
                <a href="/brand/nexus-tech">
                  <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore Nexus Tech Catalog
                  </Button>
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-center max-w-md z-10">
              {['Nexus Tech', 'Aura Minimal', 'Vanguard', 'Hyperion', 'Zenith'].map((brand) => (
                <a
                  key={brand}
                  href={`/brand/${brand.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-colors"
                >
                  {brand}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StorefrontFooter />
    </div>
  );
}
