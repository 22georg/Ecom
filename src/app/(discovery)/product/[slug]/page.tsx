import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StorefrontHeader } from '@/components/layout/StorefrontHeader';
import { StorefrontFooter } from '@/components/layout/StorefrontFooter';
import { ProductDetailService } from '@/services/product-detail.service';
import { ProductDetailView } from '@/components/pdp/ProductDetailView';
import { Button } from '@/components/ui/Button';
import { PackageX, ArrowLeft, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: { slug: string };
  searchParams: { variant?: string };
}

/**
 * Generate SEO Metadata & OpenGraph Tags dynamically from PostgreSQL product data
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await ProductDetailService.getProductDetailBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | MARQIVO Commerce',
      description: 'The requested product is no longer available.',
    };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://marqivo.com';
  const canonicalUrl = `${appUrl}/product/${product.slug}`;
  const primaryMediaUrl = product.media[0]?.mediaUrl;

  return {
    title: `${product.name} | MARQIVO Commerce`,
    description: product.shortDesc || `Buy ${product.name} with official warranty and instant shipping on MARQIVO.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} | MARQIVO Connected Commerce`,
      description: product.shortDesc || `Buy ${product.name} on MARQIVO platform.`,
      url: canonicalUrl,
      type: 'website',
      images: primaryMediaUrl ? [{ url: primaryMediaUrl, alt: product.name }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await ProductDetailService.getProductDetailBySlug(params.slug);

  // If product is unpublished, archived, soft-deleted, or non-existent: Proper 404 experience
  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
        <StorefrontHeader />

        <main className="flex-1 mq-container py-16 flex items-center justify-center">
          <div className="bg-[var(--mq-surface-card)] border border-[var(--mq-border)] rounded-2xl p-12 max-w-lg text-center shadow-md flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[var(--mq-surface-muted)] text-[var(--mq-text-tertiary)] flex items-center justify-center mb-6">
              <PackageX className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-[var(--mq-text-primary)]">
              Product Not Found
            </h1>
            <p className="text-xs text-[var(--mq-text-tertiary)] mt-2 mb-8 leading-relaxed max-w-sm">
              The product you are attempting to open does not exist, has been archived, or is currently unpublished from our public catalog.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="/search">
                <Button variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
                  Explore Catalog
                </Button>
              </a>
              <a href="/">
                <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Return Home
                </Button>
              </a>
            </div>
          </div>
        </main>

        <StorefrontFooter />
      </div>
    );
  }

  // Schema.org JSON-LD Structured Data for Search Engine Indexing
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.media.map((m) => m.mediaUrl),
    description: product.shortDesc || product.name,
    sku: product.variants[0]?.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || 'MARQIVO',
    },
    offers: {
      '@type': 'Offer',
      url: `https://marqivo.com/product/${product.slug}`,
      priceCurrency: 'BDT',
      price: product.pricing.defaultPrice,
      availability: product.variants[0]?.isAvailable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.reviewsSummary.totalCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.reviewsSummary.average,
            reviewCount: product.reviewsSummary.totalCount,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen bg-[var(--mq-surface-bg)] flex flex-col font-sans">
      {/* Inject Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <StorefrontHeader />

      <main className="flex-1 mq-container py-8">
        <ProductDetailView product={product} />
      </main>

      <StorefrontFooter />
    </div>
  );
}
