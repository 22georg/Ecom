# MARQIVO Checkout, Payment Architecture & Order Engine

**Tagline:** Modern commerce, intelligently connected.  
**Prompt 07 Technical Specification**

---

## 1. Overview

MARQIVO's checkout and order processing pipeline is an independently implemented, production-grade commerce transaction engine. It guarantees strict server-side financial authority, concurrency-safe inventory allocation, decoupled payment adapter extensibility, and IDOR-safe guest and customer order verification.

```
+------------------+       +---------------------+       +----------------------+
|  Active Cart     | ----> |  Checkout Engine    | ----> |  Payment Provider    |
|  (Recalculated)  |       |  (Server Validate)  |       |  (COD / Gateway)     |
+------------------+       +---------------------+       +----------------------+
                                  |                                 |
                                  v                                 v
                       +------------------------------------------------+
                       | Atomic Prisma Transaction                      |
                       | - Create Order & Item Snapshots                |
                       | - Decrement InventoryOnHand (InventoryItem)    |
                       | - Log Outbound InventoryMovement               |
                       | - Increment Coupon usedCount                   |
                       | - Update Cart status = 'CONVERTED'             |
                       | - Log SystemEvent ('order.created')            |
                       +------------------------------------------------+
                                  |
                                  v
                       +------------------------------------------------+
                       | Order Confirmation Page                        |
                       | /order-confirmation/[orderNumber]?token=xxx    |
                       +------------------------------------------------+
```

---

## 2. Key Architecture Components

### A. Payment Engine Adapters (`src/services/payment/`)
MARQIVO uses a decoupled `PaymentProviderAdapter` design pattern. The central dispatcher (`PaymentService`) routes payment lifecycle calls to specific adapter instances:
- **`CashOnDeliveryAdapter` (`COD`)**: Sets order status to `CONFIRMED` and payment status to `PENDING` until cash is collected at doorstep delivery.
- **`OnlineGatewayAdapter` (`ONLINE_GATEWAY`)**: Handles digital card, mobile banking (bKash/Nagad), and gateway payments with server-side HMAC-SHA256 signature verification and webhook processing.

### B. Historical Order Snapshot Preservation
To ensure that changes to product pricing, product names, or variant options do not alter historical financial records, MARQIVO creates immutable snapshots inside the database during order creation:
- **Address Snapshot**: `shippingName`, `shippingPhone`, `shippingAddress`, `shippingCity`, `shippingState`, `shippingPostalCode`, `shippingCountry`.
- **Order Item Snapshot**: `productName`, `variantTitle` (e.g., "Color: Black / Size: XL"), `sku`, `imageUrl`, `unitPrice`, `discount`, `lineTotal`.

### C. IDOR Protection & Guest Security
- **Authenticated Customers**: Order access is restricted strictly to orders owned by `session.customerId`.
- **Guest Checkout**: Guest orders generate a cryptographically secure 256-bit random hex token (`guestToken`). Access to `/order-confirmation/[orderNumber]` or `/api/orders/[orderNumber]` for guest purchases requires providing `?token=[guestToken]`.

---

## 3. Database Schema Entities

- **`Order`**: Primary transaction entity (`orderNumber`, `customerId`, `guestEmail`, `guestToken`, `status`, `paymentStatus`, `fulfillmentStatus`, financial breakdown, address snapshots).
- **`OrderItem`**: Historical item lines with `variantTitle` and `imageUrl` snapshots.
- **`Payment`**: Payment transaction record storing provider code, `transactionRef`, status, and raw JSON payload.
- **`InventoryItem` & `InventoryMovement`**: Deducts warehouse stock levels and records `OUTBOUND` movement logs.
- **`SystemEvent`**: Audit event logging (`order.created`, `payment.succeeded`, `payment.failed`).

---

## 4. API Specification

| Endpoint | Method | Description | Security |
| :--- | :--- | :--- | :--- |
| `/api/checkout/validate` | `POST` | Validates active cart items, stock, coupon, and delivery eligibility | Session / Guest Cookie |
| `/api/checkout/place-order` | `POST` | Executes atomic order placement transaction | Server-authoritative |
| `/api/orders/[orderNumber]` | `GET` | Retrieves full order confirmation breakdown | Session OR Guest Token |
| `/api/webhooks/payment` | `POST` | Payment gateway asynchronous event listener | HMAC Signature & Idempotency Check |

---

## 5. Security & Financial Integrity Rules

1. **Browser Non-Authority**: Frontend applications submit only address fields, payment provider selection, and delivery instructions. Prices, subtotals, discounts, shipping fees, and grand totals are calculated 100% on the server.
2. **Idempotency Locks**: Submitting an order sets an active processing lock and marks the cart status as `CONVERTED`, preventing duplicate order creation or double charging.
3. **Database Concurrency**: Order creation, inventory stock deduction, and coupon usage increments occur within a single atomic database `$transaction`.
