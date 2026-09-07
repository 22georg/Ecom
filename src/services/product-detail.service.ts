import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface FormattedProductOptionValue {
  id: string;
  value: string;
  displayOrder: number;
}

export interface FormattedProductOption {
  id: string;
  name: string;
  displayOrder: number;
  values: FormattedProductOptionValue[];
}

export interface FormattedVariantOption {
  optionName: string;
  optionValueId: string;
  optionValue: string;
}

export interface FormattedVariant {
  id: string;
  sku: string;
  barcode?: string | null;
  price: number;
  compareAtPrice?: number | null;
  weightKg?: number | null;
  stockQty: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  isAvailable: boolean;
  options: FormattedVariantOption[];
}

export interface FormattedMedia {
  id: string;
  mediaUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface FormattedBreadcrumb {
  label: string;
  href: string;
}

export interface FormattedReview {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  customerName: string;
  createdAt: string;
}

export interface RatingSummary {
  average: number;
  totalCount: number;
  distribution: { [stars: number]: number };
}

export interface FormattedProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  fullDesc?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  } | null;
  breadcrumbs: FormattedBreadcrumb[];
  options: FormattedProductOption[];
  variants: FormattedVariant[];
  media: FormattedMedia[];
  pricing: {
    minPrice: number;
    maxPrice: number;
    hasPriceRange: boolean;
    defaultPrice: number;
    defaultCompareAtPrice?: number | null;
  };
  specifications: Array<{ name: string; value: string }>;
  highlights: string[];
  whatsIncluded: string[];
  dimensions?: { weightKg?: number | null };
  shippingNotice: string;
  returnNotice: string;
  reviewsSummary: RatingSummary;
  reviews: FormattedReview[];
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    categoryName?: string;
    brandName?: string;
    price: number;
    compareAtPrice?: number;
    ratingAvg?: number;
    reviewCount?: number;
    mediaUrl?: string;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  }>;
}

export const ProductDetailService = {
  /**
   * Fetch complete, public customer-safe product details by slug.
   */
  async getProductDetailBySlug(slug: string): Promise<FormattedProductDetail | null> {
    if (!slug) return null;

    if (!process.env.DATABASE_URL) {
      return this.getFallbackProductDetail(slug);
    }

    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          brand: true,
          categories: {
            include: {
              category: {
                include: {
                  parent: {
                    include: { parent: true },
                  },
                },
              },
            },
          },
          options: {
            orderBy: { displayOrder: 'asc' },
            include: { values: { orderBy: { displayOrder: 'asc' } } },
          },
          variants: {
            where: { isActive: true },
            include: {
              inventoryItems: true,
              variantOptions: {
                include: {
                  optionValue: {
                    include: { option: true },
                  },
                },
              },
            },
          },
          media: { orderBy: { displayOrder: 'asc' } },
          reviews: {
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
            include: {
              customer: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });

      // Visibility Gate: Require ACTIVE status and non-deleted
      if (!product || product.status !== 'ACTIVE' || product.deletedAt !== null) {
        return null;
      }

      // 1. Build Category Breadcrumb Trail
      const primaryCategoryRel = product.categories[0]?.category;
      const breadcrumbs: FormattedBreadcrumb[] = [{ label: 'Home', href: '/' }];

      if (primaryCategoryRel) {
        const catTrail: Array<{ name: string; slug: string }> = [];
        let curr: any = primaryCategoryRel;
        while (curr) {
          catTrail.unshift({ name: curr.name, slug: curr.slug });
          curr = curr.parent;
        }

        let runningPath = '/category';
        catTrail.forEach((cat) => {
          runningPath += `/${cat.slug}`;
          breadcrumbs.push({ label: cat.name, href: runningPath });
        });
      }

      breadcrumbs.push({ label: product.name, href: `/product/${product.slug}` });

      // 2. Format Options
      const options: FormattedProductOption[] = product.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        displayOrder: opt.displayOrder,
        values: opt.values.map((v) => ({
          id: v.id,
          value: v.value,
          displayOrder: v.displayOrder,
        })),
      }));

      // 3. Format Variants & Inventory Totals (Customer-safe: NO costPrice exposed)
      const variants: FormattedVariant[] = product.variants.map((varItem) => {
        const stockQty = varItem.inventoryItems.reduce(
          (sum, item) => sum + (item.quantityOnHand - item.quantityReserved),
          0
        );

        let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (stockQty <= 0) stockStatus = 'out_of_stock';
        else if (stockQty <= 5) stockStatus = 'low_stock';

        return {
          id: varItem.id,
          sku: varItem.sku,
          barcode: varItem.barcode,
          price: Number(varItem.price),
          compareAtPrice: varItem.compareAtPrice ? Number(varItem.compareAtPrice) : undefined,
          weightKg: varItem.weightKg ? Number(varItem.weightKg) : undefined,
          stockQty: Math.max(0, stockQty),
          stockStatus,
          isAvailable: stockQty > 0,
          options: varItem.variantOptions.map((vo) => ({
            optionName: vo.optionValue.option.name,
            optionValueId: vo.optionValue.id,
            optionValue: vo.optionValue.value,
          })),
        };
      });

      // 4. Calculate Price Range across variants
      const prices = variants.map((v) => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const defaultVariant = variants[0];

      // 5. Format Media
      const media: FormattedMedia[] = product.media.map((m) => ({
        id: m.id,
        mediaUrl: m.mediaUrl,
        altText: m.altText || `${product.name} product image`,
        displayOrder: m.displayOrder,
        isPrimary: m.isPrimary,
      }));

      // Fallback placeholder image if zero media uploaded
      if (media.length === 0) {
        media.push({
          id: 'placeholder',
          mediaUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
          altText: product.name,
          displayOrder: 1,
          isPrimary: true,
        });
      }

      // 6. Rating Summary & Reviews
      const distribution: { [stars: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      product.reviews.forEach((r) => {
        if (distribution[r.rating] !== undefined) distribution[r.rating]++;
      });

      const reviewsSummary: RatingSummary = {
        average: Number(product.ratingAvg) || 0,
        totalCount: product.reviewCount || product.reviews.length,
        distribution,
      };

      const reviews: FormattedReview[] = product.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        customerName: r.customer ? `${r.customer.firstName} ${r.customer.lastName.charAt(0)}.` : 'Verified Buyer',
        createdAt: r.createdAt.toISOString().split('T')[0],
      }));

      // 7. Fetch Related Products
      const targetCatId = primaryCategoryRel?.id;
      const relatedRaw = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          deletedAt: null,
          id: { not: product.id },
          ...(targetCatId
            ? {
                categories: {
                  some: { categoryId: targetCatId },
                },
              }
            : {}),
        },
        include: {
          brand: true,
          categories: { include: { category: true } },
          media: { orderBy: { displayOrder: 'asc' }, take: 1 },
          variants: { where: { isActive: true }, take: 1 },
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
      });

      const relatedProducts = relatedRaw.map((rp) => {
        const v = rp.variants[0];
        return {
          id: rp.id,
          name: rp.name,
          slug: rp.slug,
          categoryName: rp.categories[0]?.category?.name,
          brandName: rp.brand?.name,
          price: v ? Number(v.price) : 0,
          compareAtPrice: v?.compareAtPrice ? Number(v?.compareAtPrice) : undefined,
          ratingAvg: rp.ratingAvg ? Number(rp.ratingAvg) : 4.5,
          reviewCount: rp.reviewCount || 0,
          mediaUrl: rp.media[0]?.mediaUrl,
          stockStatus: 'in_stock' as const,
        };
      });

      // Default Specifications & Highlights
      const specifications = [
        { name: 'Model SKU', value: defaultVariant?.sku || 'MQV-DEFAULT' },
        { name: 'Product Type', value: product.type },
        { name: 'Weight', value: defaultVariant?.weightKg ? `${defaultVariant.weightKg} kg` : '0.2 kg' },
        { name: 'Warranty', value: '1 Year Official MARQIVO Partner Warranty' },
        { name: 'Country of Origin', value: 'Designed by MARQIVO Labs' },
      ];

      const highlights = [
        'High-density precision components engineered for optimal performance',
        'Official MARQIVO authenticity badge & tamper-evident packaging',
        '30-day effortless store credit return guarantee',
        'Complimentary carbon-neutral express shipping on orders over ৳5,000',
      ];

      const whatsIncluded = [
        `${product.name} main unit`,
        'USB-C braided charging telemetry cable',
        'Quick Start architectural user guide',
        'Official MARQIVO warranty card',
      ];

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDesc: product.shortDesc,
        fullDesc: product.fullDesc,
        brand: product.brand
          ? {
              id: product.brand.id,
              name: product.brand.name,
              slug: product.brand.slug,
              logoUrl: product.brand.logoUrl,
            }
          : null,
        breadcrumbs,
        options,
        variants,
        media,
        pricing: {
          minPrice,
          maxPrice,
          hasPriceRange: minPrice !== maxPrice && minPrice > 0,
          defaultPrice: defaultVariant?.price || minPrice,
          defaultCompareAtPrice: defaultVariant?.compareAtPrice,
        },
        specifications,
        highlights,
        whatsIncluded,
        dimensions: { weightKg: defaultVariant?.weightKg },
        shippingNotice: 'Express delivery available across Bangladesh in 24–48 hours.',
        returnNotice: 'Eligible for return or exchange within 30 days of receipt.',
        reviewsSummary,
        reviews,
        relatedProducts,
      };
    } catch (err) {
      console.error('Error in getProductDetailBySlug:', err);
      return this.getFallbackProductDetail(slug);
    }
  },

  /**
   * Fallback dataset when PostgreSQL is offline or building statically.
   */
  getFallbackProductDetail(slug: string): FormattedProductDetail | null {
    if (slug === 'pulse-pro-wireless-earbuds' || slug === 'pulse-modular-earbuds') {
      return {
        id: 'p-pulse-pro-1',
        name: 'Pulse Pro Wireless ANC Earbuds',
        slug: 'pulse-pro-wireless-earbuds',
        shortDesc: 'High-fidelity audio drivers with active acoustic isolation & 36-hour playback',
        fullDesc: `
          <p>Experience studio-grade acoustic clarity with the <strong>Pulse Pro Wireless ANC Earbuds</strong> by MARQIVO Labs. Engineered with custom 11mm beryllium dynamic drivers and multi-mic hybrid noise cancellation, Pulse Pro blocks up to 42dB of ambient noise while preserving natural vocal warmth.</p>
          <h3>Key Technological Highlights</h3>
          <ul>
            <li><strong>Adaptive ANC 3.0:</strong> Real-time environmental noise cancellation adjusts 48,000 times per second.</li>
            <li><strong>Spatial Audio Telemetry:</strong> Integrated head tracking for immersive 360-degree acoustic staging.</li>
            <li><strong>IPX5 Water Resistance:</strong> Sweatproof design ideal for high-intensity training and rainy commutes.</li>
            <li><strong>Magnetic Qi Charging:</strong> Fast wireless charging dock delivers 6 hours of listening in 10 minutes.</li>
          </ul>
          <p>Constructed from lightweight recycled composites, each earbud weighs just 4.8 grams for fatigue-free all-day comfort.</p>
        `,
        brand: {
          id: 'b-marqivo',
          name: 'MARQIVO Labs',
          slug: 'marqivo-labs',
          logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
        },
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: 'Audio Architecture', href: '/category/audio-architecture' },
          { label: 'Wireless Earbuds', href: '/category/audio-architecture/wireless-earbuds' },
          { label: 'Pulse Pro Wireless ANC Earbuds', href: '/product/pulse-pro-wireless-earbuds' },
        ],
        options: [
          {
            id: 'opt-color',
            name: 'Color',
            displayOrder: 1,
            values: [
              { id: 'v-black', value: 'Matte Black', displayOrder: 1 },
              { id: 'v-white', value: 'Pearl White', displayOrder: 2 },
              { id: 'v-teal', value: 'Cyber Teal', displayOrder: 3 },
            ],
          },
          {
            id: 'opt-edition',
            name: 'Edition',
            displayOrder: 2,
            values: [
              { id: 'v-std', value: 'Standard', displayOrder: 1 },
              { id: 'v-pro', value: 'Pro Studio', displayOrder: 2 },
            ],
          },
        ],
        variants: [
          {
            id: 'var-1',
            sku: 'MQV-PLS-BLK-STD',
            price: 18900,
            compareAtPrice: 22500,
            weightKg: 0.18,
            stockQty: 25,
            stockStatus: 'in_stock',
            isAvailable: true,
            options: [
              { optionName: 'Color', optionValueId: 'v-black', optionValue: 'Matte Black' },
              { optionName: 'Edition', optionValueId: 'v-std', optionValue: 'Standard' },
            ],
          },
          {
            id: 'var-2',
            sku: 'MQV-PLS-BLK-PRO',
            price: 23900,
            compareAtPrice: 27900,
            weightKg: 0.22,
            stockQty: 14,
            stockStatus: 'in_stock',
            isAvailable: true,
            options: [
              { optionName: 'Color', optionValueId: 'v-black', optionValue: 'Matte Black' },
              { optionName: 'Edition', optionValueId: 'v-pro', optionValue: 'Pro Studio' },
            ],
          },
          {
            id: 'var-3',
            sku: 'MQV-PLS-WHT-STD',
            price: 18900,
            compareAtPrice: 22500,
            weightKg: 0.18,
            stockQty: 3,
            stockStatus: 'low_stock',
            isAvailable: true,
            options: [
              { optionName: 'Color', optionValueId: 'v-white', optionValue: 'Pearl White' },
              { optionName: 'Edition', optionValueId: 'v-std', optionValue: 'Standard' },
            ],
          },
          {
            id: 'var-4',
            sku: 'MQV-PLS-TEL-PRO',
            price: 24900,
            compareAtPrice: 28900,
            weightKg: 0.22,
            stockQty: 0,
            stockStatus: 'out_of_stock',
            isAvailable: false,
            options: [
              { optionName: 'Color', optionValueId: 'v-teal', optionValue: 'Cyber Teal' },
              { optionName: 'Edition', optionValueId: 'v-pro', optionValue: 'Pro Studio' },
            ],
          },
        ],
        media: [
          {
            id: 'm1',
            mediaUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
            altText: 'Pulse Pro Wireless Earbuds in Matte Black inside charging case',
            displayOrder: 1,
            isPrimary: true,
          },
          {
            id: 'm2',
            mediaUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
            altText: 'Close-up view of Pulse Pro earbud acoustic driver nozzle',
            displayOrder: 2,
            isPrimary: false,
          },
          {
            id: 'm3',
            mediaUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
            altText: 'Pulse Pro Earbuds Pearl White edition resting on wood desk',
            displayOrder: 3,
            isPrimary: false,
          },
          {
            id: 'm4',
            mediaUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
            altText: 'Compact magnetic Qi wireless charging dock case',
            displayOrder: 4,
            isPrimary: false,
          },
        ],
        pricing: {
          minPrice: 18900,
          maxPrice: 24900,
          hasPriceRange: true,
          defaultPrice: 18900,
          defaultCompareAtPrice: 22500,
        },
        specifications: [
          { name: 'Driver Architecture', value: '11mm Beryllium Dynamic Driver' },
          { name: 'Noise Cancellation', value: 'Adaptive Hybrid ANC (Up to 42dB)' },
          { name: 'Bluetooth Version', value: 'Bluetooth 5.4 LE Audio' },
          { name: 'Battery Playback', value: '9 hours earbuds + 27 hours Qi dock (36h total)' },
          { name: 'Water Resistance', value: 'IPX5 Sweatproof Certified' },
          { name: 'Weight', value: '4.8 grams per earbud' },
        ],
        highlights: [
          'Adaptive Active Noise Cancellation canceling up to 42dB ambient sound',
          '36-hour total battery life with Qi wireless fast-charging dock',
          'Ultra-low 35ms latency mode for high-fidelity spatial telemetry',
          'Multipoint Bluetooth 5.4 sync across laptop, smartphone & tablet',
        ],
        whatsIncluded: [
          'Pulse Pro Wireless Earbuds (Left & Right)',
          'Magnetic Wireless Qi Charging Dock',
          '3 Pairs Silicone Ear-Tips (Small, Medium, Large)',
          'USB-C Braided Fast-Charging Cable',
          'Quick Start Architectural Manual',
        ],
        dimensions: { weightKg: 0.18 },
        shippingNotice: 'Express carbon-neutral shipping delivered within 24–48 hours in Bangladesh.',
        returnNotice: '30-day effortless store credit return & exchange guarantee.',
        reviewsSummary: {
          average: 4.85,
          totalCount: 24,
          distribution: { 5: 20, 4: 3, 3: 1, 2: 0, 1: 0 },
        },
        reviews: [
          {
            id: 'r1',
            rating: 5,
            title: 'Unbelievable noise cancellation and acoustic warmth',
            comment: 'The ANC on the Pulse Pro is insane. Fits comfortably during 8-hour coding sessions.',
            customerName: 'Tanvir A.',
            createdAt: '2026-08-15',
          },
          {
            id: 'r2',
            rating: 5,
            title: 'Build quality feels premium',
            comment: 'Matte black magnetic dock feels super tactile. Fast shipping to Chittagong!',
            customerName: 'Sara H.',
            createdAt: '2026-08-10',
          },
        ],
        relatedProducts: [
          {
            id: 'p-aura-node-1',
            name: 'Aura Connected Environmental Sensor Node',
            slug: 'aura-connected-sensor-node',
            categoryName: 'Smart Hardware',
            brandName: 'Aura Systems',
            price: 14900,
            compareAtPrice: 18900,
            ratingAvg: 4.7,
            reviewCount: 15,
            mediaUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
            stockStatus: 'in_stock',
          },
          {
            id: 'p-kinetic-stand-1',
            name: 'Kinetic Ergonomic Aluminum Workstation Stand',
            slug: 'kinetic-ergonomic-stand',
            categoryName: 'Minimal Workspace',
            brandName: 'MARQIVO Labs',
            price: 12900,
            compareAtPrice: 15500,
            ratingAvg: 4.9,
            reviewCount: 38,
            mediaUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
            stockStatus: 'in_stock',
          },
        ],
      };
    }

    // Default fallback for any other slug if available in database or mock
    return {
      id: `p-${slug}`,
      name: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      slug,
      shortDesc: 'MARQIVO premium connected commerce hardware',
      fullDesc: '<p>High performance hardware component engineered for modern connected workflows.</p>',
      brand: {
        id: 'b-marqivo',
        name: 'MARQIVO Labs',
        slug: 'marqivo-labs',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
      },
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Catalog', href: '/search' },
        { label: slug, href: `/product/${slug}` },
      ],
      options: [
        {
          id: 'opt-edition',
          name: 'Edition',
          displayOrder: 1,
          values: [{ id: 'v-std', value: 'Standard Edition', displayOrder: 1 }],
        },
      ],
      variants: [
        {
          id: `var-${slug}`,
          sku: `MQV-${slug.substring(0, 4).toUpperCase()}-001`,
          price: 12900,
          compareAtPrice: 15900,
          weightKg: 0.5,
          stockQty: 15,
          stockStatus: 'in_stock',
          isAvailable: true,
          options: [{ optionName: 'Edition', optionValueId: 'v-std', optionValue: 'Standard Edition' }],
        },
      ],
      media: [
        {
          id: 'm-default',
          mediaUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
          altText: slug,
          displayOrder: 1,
          isPrimary: true,
        },
      ],
      pricing: {
        minPrice: 12900,
        maxPrice: 12900,
        hasPriceRange: false,
        defaultPrice: 12900,
        defaultCompareAtPrice: 15900,
      },
      specifications: [{ name: 'SKU', value: `MQV-${slug.substring(0, 4).toUpperCase()}-001` }],
      highlights: ['Official MARQIVO verified product', '30-day effortless returns'],
      whatsIncluded: ['Main product unit', 'User documentation'],
      dimensions: { weightKg: 0.5 },
      shippingNotice: 'Express delivery within 24–48 hours.',
      returnNotice: 'Eligible for 30-day return.',
      reviewsSummary: { average: 4.8, totalCount: 12, distribution: { 5: 10, 4: 2, 3: 0, 2: 0, 1: 0 } },
      reviews: [],
      relatedProducts: [],
    };
  },
};
