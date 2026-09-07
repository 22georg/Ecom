# MARQIVO — Database & Data Architecture Specification

**Tagline:** Modern commerce, intelligently connected.  
**Engine:** PostgreSQL  
**ORM / Data Access:** Prisma ORM (`@prisma/client`)  
**Deployment Target:** Railway PostgreSQL (`DATABASE_URL`)

---

## 1. Overview & Architectural Principles

MARQIVO's database architecture is built 100% independently from requirements to support the complete commerce lifecycle:
```
CUSTOMER → ACCOUNT → ADDRESS → DISCOVERY → PRODUCT → VARIANT → CART → COUPON → CHECKOUT → ORDER → INVENTORY → PAYMENT → SHIPMENT → RETURN → REFUND → REVIEW
```

### Core Integrity Guarantees
1. **Financial Precision:** All monetary amounts (`price`, `subtotal`, `grandTotal`, `taxTotal`, `discountTotal`, `shippingTotal`, `amount`, `refund`) use exact `Decimal(12,2)` numeric fields in PostgreSQL. No JavaScript floating-point numbers are used for authoritative money calculations.
2. **Identifier Strategy:** Internal relationships use non-sequential **UUID v4** primary keys (`@default(uuid())`). Public order references use human-friendly, unique order numbers (e.g. `MQV-2026-948201`).
3. **Auditable Movement & Snapshots:** 
   - Historical orders preserve snapshots of product names, SKUs, unit prices, line totals, and shipping/billing addresses at checkout time.
   - All inventory stock adjustments are recorded in an auditable transaction log table (`inventory_movements`).
   - Administrative actions are recorded in `admin_audit_logs`.
4. **Soft Deletes & Archiving:** Product catalog entities, categories, and customer records include `deletedAt` / `archivedAt` / `isActive` lifecycle fields to preserve historical order references without accidental cascade deletion.

---

## 2. Mermaid Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    Customer ||--o| CustomerAuth : "has credentials"
    Customer ||--o{ CustomerAddress : "owns multiple"
    Customer ||--o{ Cart : "has active/past"
    Customer ||--o{ Wishlist : "owns"
    Customer ||--o{ Order : "places"
    Customer ||--o{ ProductReview : "submits"

    Category ||--o| Category : "parent hierarchy"
    Category ||--o{ ProductCategory : "belongs to"
    Brand ||--o{ Product : "manufactures"
    Product ||--o{ ProductCategory : "tagged in"
    Product ||--o{ ProductOption : "defines options"
    Product ||--o{ ProductVariant : "has variants"
    Product ||--o{ ProductMedia : "has media"
    Product ||--o{ ProductReview : "receives"

    ProductOption ||--o{ ProductOptionValue : "has values"
    ProductVariant ||--o{ ProductVariantOption : "configured with"
    ProductOptionValue ||--o{ ProductVariantOption : "links"
    ProductVariant ||--o{ InventoryItem : "stocked as"

    Warehouse ||--o{ InventoryItem : "stores"
    Warehouse ||--o{ InventoryMovement : "records"

    Cart ||--o{ CartItem : "contains"
    CartItem }|--|| ProductVariant : "references"

    Order ||--o{ OrderItem : "contains"
    OrderItem }|--o| ProductVariant : "references"
    Order ||--o{ Payment : "has transactions"
    Order ||--o{ Shipment : "fulfilled via"
    Order ||--o{ Return : "initiates"

    Return ||--o{ ReturnItem : "contains"
    Payment ||--o{ Refund : "issues"

    AdminUser ||--o{ AdminRoleUser : "assigned"
    AdminRole ||--o{ AdminRoleUser : "defines"
    AdminRole ||--o{ RolePermission : "grants"
    AdminPermission ||--o{ RolePermission : "defines"
    AdminUser ||--o{ AdminAuditLog : "performs"
```

---

## 3. Domain Entity Groups (27 Relational Tables)

### A. Customer Domain
- **`customers`:** Primary customer account entity (`email`, `firstName`, `lastName`, `phone`, `isActive`, `isVerified`).
- **`customer_auth`:** Isolated authentication credential storage (`passwordHash`, `lastLoginAt`, `failedAttempts`, `lockedUntil`, `resetToken`).
- **`customer_addresses`:** Multiple address management (`recipientName`, `addressLine1`, `addressLine2`, `city`, `state`, `postalCode`, `country`, `isDefaultShip`, `isDefaultBill`).

### B. Catalog Domain
- **`categories`:** Self-referencing tree hierarchy for unlimited nested categories (`name`, `slug`, `parentId`, `displayOrder`).
- **`brands`:** Original brand entity (`name`, `slug`, `description`, `logoUrl`).
- **`products`:** Core product presentation (`name`, `slug`, `shortDesc`, `fullDesc`, `status`, `type`, `ratingAvg`, `reviewCount`).
- **`product_categories`:** Many-to-many junction joining products and categories.
- **`product_options`:** Dynamic option types (`Color`, `Size`, `Storage`, `Material`).
- **`product_option_values`:** Specific option values (`Black`, `256GB`, `XL`).
- **`product_variants`:** Purchasable SKUs (`sku`, `price`, `compareAtPrice`, `costPrice`, `weightKg`, `isActive`).
- **`product_variant_options`:** Many-to-many junction joining variants to option values.
- **`product_media`:** Media gallery references (`mediaUrl`, `altText`, `displayOrder`, `isPrimary`).

### C. Inventory Domain
- **`warehouses`:** Physical warehouse locations (`name`, `code`, `address`, `city`, `country`).
- **`inventory_items`:** Stock levels per variant per warehouse (`quantityOnHand`, `quantityReserved`, `reorderThreshold`).
- **`inventory_movements`:** Auditable inventory transaction log (`movementType`: `INBOUND`, `OUTBOUND`, `RESERVATION`, `RELEASE`, `ADJUSTMENT`, `RETURN`).

### D. Commerce & Promotion Domain
- **`carts` & `cart_items`:** Shopping cart sessions and line item quantities with price snapshots.
- **`wishlists` & `wishlist_items`:** Customer saved item lists with unique constraints to prevent duplicates.
- **`coupons`:** Promotion codes supporting fixed or percentage discounts, order minimums, and usage limits.

### E. Order & Payment Domain
- **`orders`:** Central order ledger (`orderNumber`, `status`, `paymentStatus`, `fulfillmentStatus`, `subtotal`, `discountTotal`, `shippingTotal`, `taxTotal`, `grandTotal`, `shippingName`, `shippingAddress`, `billingAddress`).
- **`order_items`:** Historical purchase line items (`productName`, `sku`, `quantity`, `unitPrice`, `discount`, `lineTotal`).
- **`payments`:** Provider-agnostic payment transaction ledger (`provider`: Stripe, SSLCommerz, bKash, COD; `amount`, `status`).
- **`shipments`:** Delivery tracking records (`carrier`, `trackingNumber`, `status`).
- **`returns` & `return_items`:** Customer return request management.
- **`refunds`:** Financial refund records associated with payments and returns.

### F. Engagement Domain
- **`product_reviews`:** Customer ratings (1–5 constraint) and review text with admin approval flag.
- **`notifications`:** Customer notification pipeline (`type`, `title`, `message`, `isRead`).

### G. Admin & Audit Domain
- **`admin_users`**, **`admin_roles`**, **`admin_permissions`**, **`role_permissions`**: Granular role-based access control (RBAC).
- **`admin_audit_logs`**: Administrative audit trail (`adminUserId`, `action`, `entityType`, `entityId`, `payload`).
- **`system_events`**: Event/webhook event queue for asynchronous event processing.

---

## 4. Key Database Commands & CLI Usage

### Validate Schema Syntax
```bash
npx prisma validate
```

### Generate TypeScript Client Types
```bash
npx prisma generate
```

### Execute Migration against PostgreSQL
```bash
npx prisma migrate dev --name init_marqivo_schema
```

### Seed Development Data
```bash
npm run prisma:seed
```

---

## 5. Railway Environment Configuration

To deploy on Railway PostgreSQL, set the following environment variable in Railway Dashboard:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/railway?schema=public"
```
