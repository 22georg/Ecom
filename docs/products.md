# MARQIVO — Product System & Detail Page (PDP) Architecture Specification

## Overview

The MARQIVO Product Subsystem provides a real, database-driven Product Detail Page (PDP) experience at `/product/[slug]`. It includes multi-option variant matrix selection, high-resolution media galleries with zoom and lightbox modals, XSS-sanitized HTML descriptions, category-specific specification tables, verified customer reviews, wishlist integration, and Schema.org JSON-LD structured data.

---

## 1. Data Model & Architecture

MARQIVO's product subsystem operates on top of PostgreSQL via Prisma ORM:

* **Product**: Base entity storing name, slug, description, lifecycle status (`DRAFT`, `ACTIVE`, `ARCHIVED`), rating averages, and metadata.
* **Brand**: Manufacturer details, logo URL, and website link.
* **ProductCategory**: Junction table mapping products to hierarchical category nodes.
* **ProductOption**: Defines variant dimensions (e.g. Color, Size, Storage, RAM, Edition).
* **ProductOptionValue**: Discrete choices for each option (e.g. Matte Black, Pearl White, 256GB).
* **ProductVariant**: Specific purchasable SKU holding unit price, compare-at price, weight, barcode, and active state.
* **ProductVariantOption**: Junction matrix matching a variant to its specific set of option values.
* **ProductMedia**: High-resolution image records with display order, alt text, and primary flag.
* **InventoryItem**: Stock quantities per warehouse per variant.
* **WishlistItem**: Authenticated customer saved products.

---

## 2. API Endpoints

### `GET /api/catalog/products/[slug]`
Public customer-facing product detail endpoint.

* **Response Payload**:
  * Returns complete product detail tree (breadcrumbs, brand, options, variants, media, pricing, specifications, highlights, reviews summary, and related products).
  * Enforces public visibility (`status === 'ACTIVE'`, `deletedAt === null`). Returns HTTP `404 Not Found` for draft/archived products.
  * **Customer Security**: Excludes internal cost prices (`costPrice`), supplier info, and warehouse notes.

### `GET /api/account/wishlist`
Retrieves saved products for the authenticated customer.

* **Security**: Identity derived strictly from `mq_session` HTTP-Only session cookie (IDOR protection).

### `POST /api/account/wishlist`
Toggles wishlist state (adds if not saved, removes if saved).

* **Payload**: `{ "productId": "..." }`
* **Response**: `{ "success": true, "isSaved": boolean, "totalCount": number }`

---

## 3. Variant Selection Matrix Algorithm

The client-side `ProductDetailView` component calculates valid option choices dynamically:

$$\text{Candidate Selections} = \{\text{Selected Options}\} \cup \{\text{Target Option} = \text{Target Value}\}$$

1. **Validation Check**: Evaluates if candidate selections match at least one active variant.
2. **Disabling Invalid Combinations**: If no variant exists for a given option combination (e.g. Matte Black + 512GB), the option chip is disabled and flagged.
3. **Price & Stock Updates**: Selecting a matching variant immediately updates the price display, compare-at discount badge, SKU label, availability badge, and image context.

---

## 4. UI Component Map

| Component | Path | Functionality |
|---|---|---|
| `ProductBreadcrumbs` | `src/components/pdp/ProductBreadcrumbs.tsx` | Multi-level category hierarchy breadcrumbs |
| `ProductGallery` | `src/components/pdp/ProductGallery.tsx` | Main viewport, hover zoom lens, thumbnail carousel, lightbox with `Esc`/Arrow navigation |
| `ProductSummaryHeader` | `src/components/pdp/ProductSummaryHeader.tsx` | Title, brand link, dynamic variant SKU, rating anchor `#reviews` |
| `ProductPriceDisplay` | `src/components/pdp/ProductPriceDisplay.tsx` | BDT (`৳`) formatting, compare-at strikethrough, discount %, price range |
| `ProductOptionSelector` | `src/components/pdp/ProductOptionSelector.tsx` | Interactive option chips disabling impossible variant choices |
| `ProductAvailabilityBadge` | `src/components/pdp/ProductAvailabilityBadge.tsx` | Visual signals for In Stock, Low Stock, and Out of Stock |
| `ProductQuantitySelector` | `src/components/pdp/ProductQuantitySelector.tsx` | Accessible increment/decrement input with inventory bounds |
| `ProductPurchasePanel` | `src/components/pdp/ProductPurchasePanel.tsx` | Add to Cart CTA foundation, Wishlist toggle with toast feedback, native sharing |
| `ProductInfoTabs` | `src/components/pdp/ProductInfoTabs.tsx` | Overview (sanitized HTML), Specifications table, What's Included, Shipping |
| `ProductReviewsSection` | `src/components/pdp/ProductReviewsSection.tsx` | Rating distribution bar chart, approved customer reviews |
| `RelatedProductsSection` | `src/components/pdp/RelatedProductsSection.tsx` | Cross-sell product cards grid |
| `RecentlyViewedTracker` | `src/components/pdp/RecentlyViewedTracker.tsx` | Client-side localStorage telemetry tracker |
| `MobileStickyPurchaseBar` | `src/components/pdp/MobileStickyPurchaseBar.tsx` | Fixed mobile bottom purchase bar |

---

## 5. Security & SEO

* **XSS HTML Protection**: Product descriptions are passed through `sanitizeHtml` (`src/lib/sanitize-html.ts`) to strip `<script>`, `<iframe>`, `onload`, `onerror`, and `javascript:` URLs.
* **SEO Metadata**: `generateMetadata` dynamically populates OpenGraph tags, canonical links, and meta descriptions.
* **Schema.org Structured Data**: Injects JSON-LD script for Google Search indexing (`Product`, `Offer`, `Brand`, `AggregateRating`).
