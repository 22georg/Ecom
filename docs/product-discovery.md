# MARQIVO — Product Discovery & Catalog Architecture Specification

## Overview

The MARQIVO Product Discovery subsystem provides high-performance, real-time catalog navigation, debounced search autocomplete, faceted multi-select filtering, dynamic category tree rendering, and brand-based browsing. It connects directly to MARQIVO's PostgreSQL database via Prisma ORM.

---

## 1. Architectural Highlights

1. **Sub-second Response Times**: Query execution optimized via indexed database fields (`slug`, `status`, `deletedAt`, `categoryId`, `brandId`).
2. **Dynamic Server Pre-rendering**: Pages pre-render server-side with `force-dynamic` fallback strategy to guarantee build isolation.
3. **URL Parameter State Sync**: All active filter selections (`brand`, `minPrice`, `maxPrice`, `rating`, `sort`, `page`, `q`) map directly to URL search parameters for shareable, bookmarkable, SEO-friendly catalog URLs.
4. **Debounced Search Autocomplete**: Client-side header search component features 200ms debouncing, live autocomplete dropdowns with product thumbnails, category suggestions, brand matches, clear query buttons, and keyboard accessibility (`Up`, `Down`, `Enter`, `Esc`).

---

## 2. API Endpoints

### `GET /api/catalog/products`
Executes faceted search, filtering, sorting, and pagination.

* **Query Parameters**:
  * `category`: Parent category slug
  * `subCategory`: Subcategory slug
  * `brand`: Comma-separated brand slugs (e.g. `nexus-tech,aura-minimal`)
  * `minPrice`: Minimum numerical price
  * `maxPrice`: Maximum numerical price
  * `rating`: Minimum average rating filter (1–5)
  * `sort`: Whitelisted sort option (`featured`, `newest`, `price_asc`, `price_desc`, `rating`)
  * `page`: Page index (1-based)
  * `pageSize`: Results per page (default: 12)
  * `q`: Search query string

### `GET /api/catalog/search/autocomplete`
Returns debounced search suggestions.

* **Query Parameters**: `q` (Minimum 2 characters)
* **Response Payload**:
  ```json
  {
    "products": [{ "id": "...", "name": "...", "slug": "...", "variants": [...], "media": [...] }],
    "categories": [{ "id": "...", "name": "...", "slug": "..." }],
    "brands": [{ "id": "...", "name": "...", "slug": "..." }]
  }
  ```

### `GET /api/catalog/filters`
Retrieves available brand facets, subcategory options, and price range limits.

### `GET /api/catalog/categories`
Retrieves the complete hierarchical category tree (Root categories with nested children).

---

## 3. UI Component Architecture

| Component | Path | Responsibility |
|---|---|---|
| `HeaderSearch` | `src/components/discovery/HeaderSearch.tsx` | Debounced search bar with live suggestion dropdown & keyboard navigation |
| `MegaMenu` | `src/components/discovery/MegaMenu.tsx` | Desktop hover mega menu displaying category tree and subcategories |
| `MobileCategoryDrawer` | `src/components/discovery/MobileCategoryDrawer.tsx` | Touch-optimized slide-out mobile category navigation drawer |
| `FilterSidebar` | `src/components/discovery/FilterSidebar.tsx` | Faceted multi-select filter panel (brands, price inputs, ratings) |
| `MobileFilterDrawer` | `src/components/discovery/MobileFilterDrawer.tsx` | Mobile filter drawer with instant result counter CTA button |
| `ActiveFilterChips` | `src/components/discovery/ActiveFilterChips.tsx` | Dismissible active filter chips & clear-all trigger |
| `ProductCard` | `src/components/discovery/ProductCard.tsx` | Product presentation card with aspect-ratio media box, price calculations, discount badges, ratings & wishlist button |
| `ProductGrid` | `src/components/discovery/ProductGrid.tsx` | Responsive product grid container supporting skeleton loading and empty states |

---

## 4. Route Mapping

* `/` — Storefront Homepage with hero, category tiles, featured hardware, new arrivals, and brand showcase.
* `/category/[...slug]` — Category & Subcategory listing pages with dynamic breadcrumbs, faceted sidebar, sorting & pagination.
* `/search` — Catalog search results page with query highlight, faceted filtering, and empty state keyword recommendations.
* `/brand/[slug]` — Dedicated brand catalog page with brand header banner, logo avatar, and filtered product listings.

---

## 5. Security & Data Integrity

* **SQL Injection Prevention**: Sorting parameters are mapped to strict internal Prisma OrderBy objects. Unrecognized sort parameters default safely to `createdAt: desc`.
* **Safe Decimal Calculations**: Pricing values returned from Prisma `Decimal` fields are converted using explicit JavaScript `Number()` coercion with 2-decimal formatting.
* **Deletion Filtering**: Soft-deleted products (`deletedAt != null`) or inactive status products are automatically excluded from discovery queries.
