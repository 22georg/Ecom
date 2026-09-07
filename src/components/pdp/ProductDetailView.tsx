'use client';

import React, { useState, useMemo } from 'react';
import { FormattedProductDetail, FormattedVariant } from '@/services/product-detail.service';
import { ProductBreadcrumbs } from './ProductBreadcrumbs';
import { ProductGallery } from './ProductGallery';
import { ProductSummaryHeader } from './ProductSummaryHeader';
import { ProductPriceDisplay } from './ProductPriceDisplay';
import { ProductAvailabilityBadge } from './ProductAvailabilityBadge';
import { ProductOptionSelector } from './ProductOptionSelector';
import { ProductQuantitySelector } from './ProductQuantitySelector';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import { ProductInfoTabs } from './ProductInfoTabs';
import { ProductReviewsSection } from './ProductReviewsSection';
import { RelatedProductsSection } from './RelatedProductsSection';
import { RecentlyViewedTracker } from './RecentlyViewedTracker';
import { MobileStickyPurchaseBar } from './MobileStickyPurchaseBar';
import { useToast } from '../ui/Toast';

interface ProductDetailViewProps {
  product: FormattedProductDetail;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const { addToast } = useToast();

  // 1. Initialize default option selections from the first available variant
  const initialSelections = useMemo(() => {
    const defaults: { [optName: string]: string } = {};
    const firstVariant = product.variants[0];
    if (firstVariant) {
      firstVariant.options.forEach((o) => {
        defaults[o.optionName] = o.optionValue;
      });
    } else {
      product.options.forEach((opt) => {
        if (opt.values.length > 0) {
          defaults[opt.name] = opt.values[0].value;
        }
      });
    }
    return defaults;
  }, [product]);

  const [selectedOptions, setSelectedOptions] = useState<{ [optName: string]: string }>(initialSelections);
  const [quantity, setQuantity] = useState(1);

  // 2. Derive matching variant from selected option matrix
  const activeVariant: FormattedVariant | undefined = useMemo(() => {
    return product.variants.find((v) => {
      return Object.entries(selectedOptions).every(([optName, optVal]) => {
        const match = v.options.find((o) => o.optionName === optName && o.optionValue === optVal);
        return Boolean(match);
      });
    });
  }, [product.variants, selectedOptions]);

  // Fallback variant values if specific combination is unmatched
  const activePrice = activeVariant ? activeVariant.price : product.pricing.defaultPrice;
  const activeCompareAtPrice = activeVariant ? activeVariant.compareAtPrice : product.pricing.defaultCompareAtPrice;
  const activeSku = activeVariant ? activeVariant.sku : product.variants[0]?.sku;
  const activeStockStatus = activeVariant ? activeVariant.stockStatus : 'in_stock';
  const activeStockQty = activeVariant ? activeVariant.stockQty : 10;
  const isAvailable = activeVariant ? activeVariant.isAvailable : true;

  const activeVariantLabel = activeVariant
    ? activeVariant.options.map((o) => o.optionValue).join(' / ')
    : '';

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    addToast({
      type: 'success',
      title: 'Added to Cart',
      description: `${quantity}x ${product.name} (${activeVariantLabel || 'Standard'}) added to cart.`,
    });
  };

  return (
    <div className="pb-16">
      {/* Top Breadcrumb Navigation */}
      <ProductBreadcrumbs items={product.breadcrumbs} className="mb-6" />

      {/* Main 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery & Lightbox */}
        <div className="lg:col-span-6 sticky top-24">
          <ProductGallery media={product.media} productName={product.name} />
        </div>

        {/* Right Column: Purchasing & Product Summary */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <ProductSummaryHeader
            name={product.name}
            brand={product.brand}
            selectedSku={activeSku}
            ratingSummary={product.reviewsSummary}
            shortDesc={product.shortDesc}
          />

          <ProductPriceDisplay
            price={activePrice}
            compareAtPrice={activeCompareAtPrice}
            hasPriceRange={!activeVariant && product.pricing.hasPriceRange}
            minPrice={product.pricing.minPrice}
            maxPrice={product.pricing.maxPrice}
          />

          <ProductAvailabilityBadge stockStatus={activeStockStatus} stockQty={activeStockQty} />

          <ProductOptionSelector
            options={product.options}
            variants={product.variants}
            selectedOptions={selectedOptions}
            onSelectOption={handleOptionChange}
          />

          <ProductQuantitySelector
            quantity={quantity}
            maxStock={activeStockQty}
            onChangeQuantity={setQuantity}
            disabled={!isAvailable}
          />

          <ProductPurchasePanel
            productId={product.id}
            productName={product.name}
            variantId={activeVariant?.id}
            quantity={quantity}
            isAvailable={isAvailable}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>

      {/* Structured Info Tabs (Description, Specs, Box Contents, Shipping) */}
      <ProductInfoTabs
        description={product.fullDesc}
        specifications={product.specifications}
        highlights={product.highlights}
        whatsIncluded={product.whatsIncluded}
        shippingNotice={product.shippingNotice}
        returnNotice={product.returnNotice}
      />

      {/* Customer Reviews Telemetry */}
      <ProductReviewsSection summary={product.reviewsSummary} reviews={product.reviews} />

      {/* Cross-Sell Related Products */}
      <RelatedProductsSection products={product.relatedProducts as any} />

      {/* Client Recently Viewed Tracker */}
      <RecentlyViewedTracker
        currentProduct={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: activePrice,
          mediaUrl: product.media[0]?.mediaUrl,
          categoryName: product.breadcrumbs[1]?.label,
        }}
      />

      {/* Mobile Bottom Sticky Purchase Action Bar */}
      <MobileStickyPurchaseBar
        productName={product.name}
        price={activePrice}
        selectedVariantLabel={activeVariantLabel}
        isAvailable={isAvailable}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};
