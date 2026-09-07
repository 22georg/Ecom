# MARQIVO — Cart, Wishlist, Pricing Engine & Shipping Specification

## Overview

The MARQIVO Shopping Subsystem provides a persistent, production-ready shopping cart and pricing engine. It supports guest carts via HTTP-Only session tokens, authenticated customer carts, automatic guest-to-customer cart merging upon login, backend-authoritative monetary calculations, real-time inventory stock revalidation, promo coupon validation, shipping method selection, and wishlist management.

---

## 1. Cart Lifecycle & Data Architecture

MARQIVO's cart model operates on PostgreSQL via Prisma ORM:

* **Cart**: Entity storing `customerId` (nullable for guest carts), `sessionToken` (unique guest cookie identifier), `couponCode`, `shippingMethodId`, `status` (`ACTIVE`, `CONVERTED`, `ABANDONED`), and currency (`BDT`).
* **CartItem**: Variant-aware line items linking to `ProductVariant`. Stores `variantId`, `quantity`, `unitPrice`. Unique constraint on `[cartId, variantId]` prevents duplicate rows for identical variant option selections.
* **Coupon**: Promo code entity storing `code`, `discountType` (`FIXED` vs `PERCENTAGE`), `discountValue`, `minOrderValue`, `maxDiscount`, `usageLimit`, `usedCount`, `startsAt`, `expiresAt`, `isActive`.
* **Wishlist** & **WishlistItem**: Customer saved items table mapping `customerId` to saved `productId` records.

---

## 2. Backend-Authoritative Pricing Engine (`CartService`)

Clients **never** supply or compute authoritative monetary totals or prices. The browser submits only variant IDs, quantities, promo code strings, or shipping method IDs.

$$\text{Line Subtotal} = \text{variant.price} \times \text{quantity}$$

$$\text{Cart Subtotal} = \sum \text{Line Subtotal}$$

$$\text{Grand Total} = \text{Subtotal} - \text{Coupon Discount} + \text{Shipping Total} + \text{Tax Total}$$

### Stock Revalidation & Alerts
Before returning cart payloads, `CartService` calculates available warehouse stock:

$$\text{Available Stock} = \sum (\text{quantityOnHand} - \text{quantityReserved})$$

* If $\text{requested quantity} > \text{available stock}$, a stock alert flag and message are generated (e.g. `"Only 3 units available in stock"`).
* If $\text{available stock} = 0$, status is set to `out_of_stock` and checkout is blocked.

---

## 3. Guest Cart & Login Merge Algorithm

1. **Guest Session Cookie**: Unauthenticated visitors receive a 256-bit random hex token stored in HTTP-Only cookie `mq_cart_token`.
2. **Merge on Login**: When a customer logs in via `/api/auth/login`, `CartService.mergeGuestCartIntoCustomerCart` is invoked:
   - Duplicate variant items between guest and customer carts combine quantities (bounded by available inventory).
   - Unique guest items are reassigned to the customer's active cart.
   - The guest cart record is deleted, and cookie `mq_cart_token` is cleared.

---

## 4. API Endpoints Map

| Endpoint | Method | Functionality |
|---|---|---|
| `/api/cart` | `GET` | Retrieves active cart with revalidated pricing, item breakdown, stock alerts, and totals |
| `/api/cart/items` | `POST` | Add variant item to cart with stock validation (`{ variantId: string, quantity?: number }`) |
| `/api/cart/items/[id]` | `PATCH` | Update cart item quantity (`{ quantity: number }`) |
| `/api/cart/items/[id]` | `DELETE` | Remove item from cart |
| `/api/cart/coupon` | `POST` / `DELETE` | Apply (`{ code: string }`) or remove active promo coupon |
| `/api/cart/shipping-methods` | `GET` | Retrieve available shipping options based on cart subtotal |
| `/api/cart/shipping-method` | `POST` | Select shipping method (`{ shippingMethodId: string }`) |
| `/api/account/wishlist` | `GET` / `POST` | IDOR-safe customer wishlist retrieval and item toggle |

---

## 5. UI Component System

| Component | Path | Responsibility |
|---|---|---|
| `CartDrawer` | `src/components/cart/CartDrawer.tsx` | Slide-out mini-cart with free shipping progress bar & checkout links |
| `CartItemRow` | `src/components/cart/CartItemRow.tsx` | Line item row with variant badges, unit price, quantity buttons, and subtotals |
| `CartSummaryPanel` | `src/components/cart/CartSummaryPanel.tsx` | Order summary breakdown, coupon input, shipping selector, and checkout CTA |
| `CouponInputBox` | `src/components/cart/CouponInputBox.tsx` | Promo code input with apply/remove handlers and feedback |
| `EmptyCartView` | `src/components/cart/EmptyCartView.tsx` | Polished empty cart state |
| `CartPage` | `src/app/cart/page.tsx` | Dedicated 2-column cart page |
| `WishlistPage` | `src/app/wishlist/page.tsx` | Full saved wishlist workspace with "Move to Cart" actions |

---

## 6. Prompt 7 Integration Boundary

Prompt 6 prepares the cart contract so Prompt 7 (Checkout, Payment Architecture & Order Creation) can consume active cart totals, selected shipping options, applied coupons, and validated variant items without altering the cart engine.
