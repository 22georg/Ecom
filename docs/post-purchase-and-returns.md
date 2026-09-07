# MARQIVO Post-Purchase, Tracking, Returns, Refunds, Reviews & Notifications

**Tagline:** Modern commerce, intelligently connected.  
**Prompt 08 Technical Specification**

---

## 1. Subsystem Architecture Overview

MARQIVO's post-purchase customer workspace provides real-time transaction tracking, 14-day policy-bounded return request processing, financial refund logging, verified purchase review moderation, and persistent event-driven notifications.

```
+-------------------+       +-----------------------+       +------------------------+
| Customer Account  | ----> | Post-Purchase Engine  | ----> | PostgreSQL Database    |
| - Orders & Track  |       | - Order History       |       | - Orders & OrderItems  |
| - Returns Request |       | - Return Processing   |       | - Returns & ReturnItems|
| - Product Reviews |       | - Refund Calculations |       | - ProductReviews       |
| - Notifications   |       | - Verified Reviews    |       | - Notifications        |
+-------------------+       +-----------------------+       +------------------------+
```

---

## 2. Core Post-Purchase Subsystems

### A. Order Tracking & Status Progression (`TrackingService`)
- Order status lifecycle: `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED` (or `CANCELLED`).
- Tracking timeline data structures provide shipment carrier name, tracking reference number, dispatch timestamp, and estimated delivery dates.

### B. Order Cancellation (`POST /api/account/orders/[orderNumber]/cancel`)
- Customers may cancel orders currently in `PENDING` or `CONFIRMED` status.
- Order status is set to `CANCELLED`, warehouse inventory stock (`quantityOnHand`) is restored in an atomic `$transaction`, and an `OUTBOUND` / `RELEASE` movement log is recorded.

### C. Return & Refund Engine (`ReturnService` & `RefundService`)
- **Return Policy Validation**:
  1. Order status must be `DELIVERED`.
  2. Submission date must be within the 14-day return window.
  3. Returned item quantities cannot exceed original order quantities minus previously returned items.
- **Return Status Progression**: `REQUESTED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `COMPLETED` / `REJECTED`.
- **Refund Validation**: Refund amounts are bounded by the total order grand total ($\sum \text{Refunds} \le \text{Refundable Amount}$).

### D. Verified Purchase Reviews (`ReviewService`)
- Verified status (`isVerifiedPurchase: true`) is awarded only when an order line item exists for the logged-in customer.
- Sanitizes comment body using XSS sanitizer (`sanitize-html.ts`).
- Recalculates product rating summary (`ratingAvg` and `reviewCount`) on the `Product` entity upon review submission.

### E. Notification Center (`NotificationService`)
- Notifications are stored in PostgreSQL (`Notification` entity) with read/unread flags (`isRead`) and direct action links (`actionUrl`).
- Real-time endpoints support fetching unread counts, marking single items as read, or marking all notifications as read.

---

## 3. API Contract Reference

| Endpoint | Method | Description | Security |
| :--- | :--- | :--- | :--- |
| `/api/account/orders` | `GET` | IDOR-safe customer order history | Authenticated Session |
| `/api/account/orders/[orderNumber]/cancel` | `POST` | Cancels eligible order and releases inventory | Authenticated Session |
| `/api/account/returns` | `GET` / `POST` | Retrieves return requests or submits new return request | Authenticated Session |
| `/api/account/refunds` | `GET` | Retrieves customer refund history | Authenticated Session |
| `/api/catalog/reviews` | `GET` / `POST` | Fetches PDP reviews or submits verified purchase review | Authenticated / Public |
| `/api/account/notifications` | `GET` | Fetches notifications and unread count | Authenticated Session |
| `/api/account/notifications/[id]` | `PATCH` | Marks single notification as read | Authenticated Session |
| `/api/account/notifications/mark-all-read` | `POST` | Marks all customer notifications as read | Authenticated Session |
