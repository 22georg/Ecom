# MARQIVO Admin Dashboard & Business Operations Documentation

## Overview

The MARQIVO Admin Platform (`/admin`) is an original, production-ready operational management system built directly on top of MARQIVO's PostgreSQL database architecture and Next.js 14 backend APIs.

---

## 1. Administrative Architecture & Security Model

```text
Admin User Client
      │
      ├─── HTTP-Only Secure Cookie: `mq_admin_session` (12h expiration)
      ▼
Next.js Middleware (/src/middleware.ts)
      │
      ├─── Path Matcher: `/admin/:path*` (Bypasses `/admin/login`)
      ▼
Backend Authorization Layer (/src/lib/admin-auth.ts)
      │
      ├─── RBAC Check: `hasPermission(adminUser, permissionCode)`
      ▼
Business Service Engine (/src/services/admin-*.service.ts)
      │
      ├─── Database Audit Recorder (`admin_audit_logs`)
      ▼
PostgreSQL Database (Prisma ORM)
```

---

## 2. Implemented Roles & RBAC Permission Matrix

| Administrative Role | Key Permissions Assigned | Purpose |
| :--- | :--- | :--- |
| **SuperAdmin** | `*` (All system domain permissions) | Full operational control over catalog, orders, inventory, financial refunds, users, and RBAC matrix. |
| **CatalogManager** | `products.*`, `categories.*`, `reviews.moderate` | Management of catalog items, variant pricing, category trees, and review publishing. |
| **OrderManager** | `orders.*`, `returns.*`, `refunds.*` | Processing order state transitions, registering shipment tracking, approving return requests, issuing refunds. |
| **InventoryManager**| `inventory.*`, `products.view` | Monitoring stock levels across warehouses, recording manual stock adjustment deltas. |
| **CustomerSupport** | `customers.view`, `orders.view`, `returns.view`, `reviews.view` | Read-only inspection of customer profiles, order histories, and addresses. |

---

## 3. Seed Credentials & Initial Account Setup

- **SuperAdmin Email:** `admin@marqivo.com`
- **SuperAdmin Password:** `MarqivoAdmin2026!`
- **Initial Seed Helper:** [`src/lib/seed-admin.ts`](file:///d:/Saas%20Development%20project/WEBSITE/ECOMMERCE/src/lib/seed-admin.ts)

---

## 4. Administrative Routes & Management Workspaces

| Admin Route | Workspace Description | Key Capabilities |
| :--- | :--- | :--- |
| `/admin/login` | Administrator Authentication | Secure sign-in form setting HTTP-Only `mq_admin_session` session cookie. |
| `/admin/dashboard` | Real-time Operations Dashboard | Aggregated KPIs (Gross/Net sales, AOV, order status counts, low stock alerts, SVG sales trend charts). |
| `/admin/products` | Catalog Management | Filter by status (`ACTIVE`, `DRAFT`, `ARCHIVED`), SKU/name search, product creation modal with initial stock. |
| `/admin/categories` | Category Hierarchy Tree | Manage top-level primary categories and nested subcategory trees. |
| `/admin/inventory` | Stock & Warehouse Control | Live stock levels across warehouses, controlled adjustment drawer (`INBOUND`, `OUTBOUND`, `CORRECTION`), movement audit log. |
| `/admin/customers` | Customer Directory | Search customers, view order count, address history, and customer profile drawer (`/admin/customers/[id]`). |
| `/admin/orders` | Order Operations | Search orders, filter by status, detail workspace (`/admin/orders/[id]`), state machine updates (`PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`, `CANCELLED`), shipment creation modal, printable invoices. |
| `/admin/returns` | Return Requests Workspace | Moderate customer 14-day return submissions (`REQUESTED` $\rightarrow$ `APPROVED` $\rightarrow$ `REJECTED` $\rightarrow$ `COMPLETED`). |
| `/admin/refunds` | Refund Ledger | Audit historical customer refunds across payment gateways. |
| `/admin/reviews` | Review Moderation | Approve or unpublish customer product reviews; automatically recalculates product `ratingAvg` and `reviewCount`. |
| `/admin/coupons` | Promotional Coupons | Create percentage/fixed discount codes, set minimum order thresholds and usage caps. |
| `/admin/shipping` | Shipping Settings | Configure shipping method rate tiers and logistics carrier zones. |
| `/admin/tax` | Tax Configuration | Value-Added Tax (VAT) rate configuration foundation. |
| `/admin/reports` | Reports & Data Export | Download authoritative CSV files for Orders, Products, Inventory, and Customers. |
| `/admin/admin-users` | Admin User Management | SuperAdmin interface to provision admin user accounts and assign roles. |
| `/admin/roles` | RBAC Matrix Inspector | Visual inspection matrix for permissions granted to each administrative role. |
| `/admin/audit-logs` | Administrative Audit Trail | Real-time auditable history of admin edits, inventory movements, status updates, and JSON payload diffs. |
