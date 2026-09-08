-- ============================================================
-- MARQIVO E-COMMERCE PLATFORM - FULL SUPABASE INITIALIZATION SQL
-- Execute this script in Supabase SQL Editor to initialize database schema & seed data
-- ============================================================

-- 1. DROP EXISTING ENUMS & TABLES (IF RE-INITIALIZING)
DROP TABLE IF EXISTS "system_events" CASCADE;
DROP TABLE IF EXISTS "admin_audit_logs" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "admin_permissions" CASCADE;
DROP TABLE IF EXISTS "admin_role_users" CASCADE;
DROP TABLE IF EXISTS "admin_roles" CASCADE;
DROP TABLE IF EXISTS "admin_sessions" CASCADE;
DROP TABLE IF EXISTS "admin_users" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "product_reviews" CASCADE;
DROP TABLE IF EXISTS "refunds" CASCADE;
DROP TABLE IF EXISTS "return_items" CASCADE;
DROP TABLE IF EXISTS "returns" CASCADE;
DROP TABLE IF EXISTS "shipments" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "coupons" CASCADE;
DROP TABLE IF EXISTS "wishlist_items" CASCADE;
DROP TABLE IF EXISTS "wishlists" CASCADE;
DROP TABLE IF EXISTS "cart_items" CASCADE;
DROP TABLE IF EXISTS "carts" CASCADE;
DROP TABLE IF EXISTS "inventory_movements" CASCADE;
DROP TABLE IF EXISTS "inventory_items" CASCADE;
DROP TABLE IF EXISTS "warehouses" CASCADE;
DROP TABLE IF EXISTS "product_media" CASCADE;
DROP TABLE IF EXISTS "product_variant_options" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;
DROP TABLE IF EXISTS "product_option_values" CASCADE;
DROP TABLE IF EXISTS "product_options" CASCADE;
DROP TABLE IF EXISTS "product_categories" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "brands" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "customer_addresses" CASCADE;
DROP TABLE IF EXISTS "password_reset_tokens" CASCADE;
DROP TABLE IF EXISTS "email_verification_tokens" CASCADE;
DROP TABLE IF EXISTS "customer_sessions" CASCADE;
DROP TABLE IF EXISTS "customer_auth" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;

DROP TYPE IF EXISTS "AccountStatus" CASCADE;
DROP TYPE IF EXISTS "ProductStatus" CASCADE;
DROP TYPE IF EXISTS "ProductType" CASCADE;
DROP TYPE IF EXISTS "MovementType" CASCADE;
DROP TYPE IF EXISTS "DiscountType" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "FulfillmentStatus" CASCADE;
DROP TYPE IF EXISTS "ReturnStatus" CASCADE;
DROP TYPE IF EXISTS "RefundStatus" CASCADE;

-- 2. CREATE ENUMS
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DISABLED');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "ProductType" AS ENUM ('PHYSICAL', 'DIGITAL');
CREATE TYPE "MovementType" AS ENUM ('INBOUND', 'OUTBOUND', 'RESERVATION', 'RELEASE', 'ADJUSTMENT', 'RETURN');
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENTAGE');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'REFUNDED', 'FAILED');
CREATE TYPE "FulfillmentStatus" AS ENUM ('UNFULFILLED', 'PARTIAL', 'FULFILLED', 'RETURNED');
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- 3. CREATE TABLES

-- Customers
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT true,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_auth" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "resetToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_auth_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_sessions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT,
    "recipientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'BD',
    "isDefaultShip" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultBill" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- Catalog: Categories, Brands, Products
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "parentId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDesc" TEXT,
    "fullDesc" TEXT,
    "brandId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "ProductType" NOT NULL DEFAULT 'PHYSICAL',
    "metaTitle" TEXT,
    "metaKeywords" TEXT,
    "ratingAvg" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_categories" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("productId","categoryId")
);

CREATE TABLE "product_options" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_option_values" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "compareAtPrice" DECIMAL(12,2),
    "costPrice" DECIMAL(12,2),
    "weightKg" DECIMAL(8,3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_variant_options" (
    "variantId" TEXT NOT NULL,
    "optionValueId" TEXT NOT NULL,
    CONSTRAINT "product_variant_options_pkey" PRIMARY KEY ("variantId","optionValueId")
);

CREATE TABLE "product_media" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "altText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- Inventory & Warehouses
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'BD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderThreshold" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory_movements" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- Carts & Wishlists
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "sessionToken" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "couponCode" TEXT,
    "shippingMethodId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Wishlist',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- Coupons & Orders
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "minOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "maxDiscount" DECIMAL(12,2),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "guestEmail" TEXT,
    "guestToken" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discountTotal" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "shippingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "taxTotal" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "shippingName" TEXT NOT NULL,
    "shippingPhone" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingPostalCode" TEXT,
    "shippingCountry" TEXT DEFAULT 'BD',
    "billingName" TEXT,
    "billingAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT,
    "productName" TEXT NOT NULL,
    "variantTitle" TEXT,
    "sku" TEXT NOT NULL,
    "imageUrl" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "lineTotal" DECIMAL(12,2) NOT NULL,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "transactionRef" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- Admin Users, Roles & Permissions
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_role_users" (
    "adminUserId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "admin_role_users_pkey" PRIMARY KEY ("adminUserId","roleId")
);

CREATE TABLE "admin_permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId","permissionId")
);

CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- 4. CREATE INDEXES & UNIQUE CONSTRAINTS
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE UNIQUE INDEX "customer_auth_customerId_key" ON "customer_auth"("customerId");
CREATE UNIQUE INDEX "customer_sessions_tokenHash_key" ON "customer_sessions"("tokenHash");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_slug_idx" ON "categories"("slug");
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_slug_idx" ON "products"("slug");
CREATE INDEX "products_status_idx" ON "products"("status");
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");
CREATE INDEX "product_variants_sku_idx" ON "product_variants"("sku");
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");
CREATE UNIQUE INDEX "admin_roles_name_key" ON "admin_roles"("name");
CREATE UNIQUE INDEX "admin_permissions_code_key" ON "admin_permissions"("code");

-- 5. FOREIGN KEY CONSTRAINTS
ALTER TABLE "customer_auth" ADD CONSTRAINT "customer_auth_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_sessions" ADD CONSTRAINT "customer_sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- 6. INITIAL SEED DATA
-- ============================================================

-- Seed Default Warehouse
INSERT INTO "warehouses" ("id", "name", "code", "city", "country", "isActive", "createdAt", "updatedAt")
VALUES ('wh-dhaka-001', 'MARQIVO Central Warehouse', 'MARQIVO-DHAKA-WH', 'Dhaka', 'BD', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Categories
INSERT INTO "categories" ("id", "name", "slug", "description", "displayOrder", "isActive", "createdAt", "updatedAt") VALUES
('cat-elec-001', 'Electronics', 'electronics', 'Consumer tech and smart gadgets', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-audio-002', 'Audio & Headphones', 'audio-headphones', 'Studio wireless headphones and earbuds', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-wear-003', 'Smart Wearables', 'smart-wearables', 'Fitness bands, smartwatches, and trackers', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-acc-004', 'Mobile Accessories', 'mobile-accessories', 'Chargers, powerbanks, cables, and mounts', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cat-home-005', 'Smart Home & IoT', 'smart-home-iot', 'Connected lighting, security, and sensors', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Brand
INSERT INTO "brands" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt") VALUES
('brand-mqv-001', 'MARQIVO Premium', 'marqivo-premium', 'Official MARQIVO flagship gear', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Initial Products (PDP catalog items)
INSERT INTO "products" ("id", "name", "slug", "shortDesc", "fullDesc", "brandId", "status", "type", "ratingAvg", "reviewCount", "createdAt", "updatedAt", "publishedAt") VALUES
('prod-pdp-001', 'MARQIVO Studio Wireless ANC Headphones (Midnight Black)', 'marqivo-studio-wireless-anc-headphones-black', 'Flagship noise-canceling headphones with 45-hour battery life and Hi-Res spatial audio.', 'Experience pure acoustic perfection with the MARQIVO Studio Wireless ANC Headphones. Featuring custom-tuned 40mm titanium drivers.', 'brand-mqv-001', 'ACTIVE', 'PHYSICAL', 4.90, 42, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-pdp-002', 'MARQIVO Pulse Smartwatch Pro', 'marqivo-pulse-smartwatch-pro', 'Sleek AMOLED health tracker with ECG, GPS, and 14-day battery.', 'Track your wellness with pinpoint accuracy using the MARQIVO Pulse Smartwatch Pro.', 'brand-mqv-001', 'ACTIVE', 'PHYSICAL', 4.80, 28, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Link Products to Categories
INSERT INTO "product_categories" ("productId", "categoryId") VALUES
('prod-pdp-001', 'cat-audio-002'),
('prod-pdp-001', 'cat-elec-001'),
('prod-pdp-002', 'cat-wear-003'),
('prod-pdp-002', 'cat-elec-001');

-- Seed Product Media
INSERT INTO "product_media" ("id", "productId", "mediaUrl", "displayOrder", "isPrimary", "createdAt") VALUES
('med-001', 'prod-pdp-001', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80', 0, true, CURRENT_TIMESTAMP),
('med-002', 'prod-pdp-002', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80', 0, true, CURRENT_TIMESTAMP);

-- Seed Product Variants
INSERT INTO "product_variants" ("id", "productId", "sku", "price", "compareAtPrice", "isActive", "createdAt", "updatedAt") VALUES
('var-001', 'prod-pdp-001', 'MQV-ANC-BLK', 8500.00, 10500.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('var-002', 'prod-pdp-002', 'MQV-PLS-WATCH', 12500.00, 15000.00, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Seed Inventory Items
INSERT INTO "inventory_items" ("id", "variantId", "warehouseId", "quantityOnHand", "reorderThreshold", "updatedAt") VALUES
('inv-001', 'var-001', 'wh-dhaka-001', 50, 5, CURRENT_TIMESTAMP),
('inv-002', 'var-002', 'wh-dhaka-001', 35, 5, CURRENT_TIMESTAMP);

-- Seed Admin RBAC Roles & SuperAdmin User
INSERT INTO "admin_roles" ("id", "name", "description") VALUES
('role-superadmin', 'SuperAdmin', 'Full administrative control over all system domains');

INSERT INTO "admin_users" ("id", "email", "name", "passwordHash", "isActive", "createdAt") VALUES
('admin-user-001', 'admin@marqivo.com', 'MARQIVO Lead Administrator', '$2a$12$jXEI7DX/8Ssl48HbBRL8LO7Z1a2ch.tiQ7XRPJPPilYeHeQstVX6.', true, CURRENT_TIMESTAMP);

INSERT INTO "admin_role_users" ("adminUserId", "roleId") VALUES
('admin-user-001', 'role-superadmin');

-- Seed Demo Customer Account (customer@marqivo.com / CustomerPass2026!)
INSERT INTO "customers" ("id", "email", "firstName", "lastName", "phone", "isActive", "isVerified", "status", "createdAt", "updatedAt") VALUES
('cust-demo-001', 'customer@marqivo.com', 'Tanvir', 'Alam', '+8801700000000', true, true, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "customer_auth" ("id", "customerId", "passwordHash", "createdAt", "updatedAt") VALUES
('auth-demo-001', 'cust-demo-001', '$2a$12$6pTYBRKtRLhwrRG8jRMEMu/xQyAXWK95fl0NBwgLBR/zDSF1cMKn2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================
-- INITIALIZATION COMPLETE
-- SuperAdmin Login: admin@marqivo.com / MarqivoAdmin2026!
-- Demo Customer Login: customer@marqivo.com / CustomerPass2026!
-- ============================================================
