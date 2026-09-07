# MARQIVO — Authentication, Customer Accounts & Access Control Specification

**Tagline:** Modern commerce, intelligently connected.  
**Security Standard:** OWASP Compliant Server-Side Session Authentication  
**Password Hashing:** `bcrypt` (12 Salt Rounds)  
**Session Cookie:** `mq_session` (HTTP-Only, Secure, SameSite=Lax)

---

## 1. Authentication Lifecycle & Workflows

### A. Registration Flow (`POST /api/auth/register`)
1. Client submits `firstName`, `lastName`, `email`, `password`, `confirmPassword`.
2. Server validates input using Zod schemas and normalizes email (`lowercase` + `trim`).
3. Checks for duplicate email in PostgreSQL `customers` table.
4. Hashes password using bcrypt with 12 salt rounds into `customer_auth`.
5. Sets initial status to `PENDING_VERIFICATION`.
6. Generates cryptographically secure verification token (`crypto.randomBytes(32)`) and stores SHA-256 hash in `email_verification_tokens`.
7. Dispatches verification link via development mail provider (`src/lib/email.ts`).

### B. Login & Session Creation (`POST /api/auth/login`)
1. Rate-limited to max 5 failed attempts per 15-minute window per IP.
2. Server validates credentials against stored bcrypt hash.
3. Checks account status (`ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`, `DISABLED`).
4. On success, generates raw 256-bit session token, stores SHA-256 hash in `customer_sessions`, and sets HTTP-Only `mq_session` cookie (`maxAge`: 7 days, `sameSite`: `lax`).
5. Returns safe authenticated customer profile (zero password hashes/tokens returned).

### C. Logout & Session Revocation (`POST /api/auth/logout`)
1. Server marks session as `revokedAt = NOW()` in `customer_sessions` table.
2. Clears `mq_session` HTTP-Only cookie.

### D. Email Verification (`POST /api/auth/verify-email`)
1. Single-use verification link validates token hash against `email_verification_tokens`.
2. Updates `isVerified = true` and `status = ACTIVE`.

### E. Password Reset (`POST /api/auth/forgot-password` & `POST /api/auth/reset-password`)
1. Enumeration-safe request endpoint always returns generic success message.
2. Generates single-use, 1-hour reset token stored as SHA-256 hash in `password_reset_tokens`.
3. Validates reset token, updates bcrypt password hash, and revokes all active customer sessions (`revokeAllCustomerSessions`).

---

## 2. Insecure Direct Object Reference (IDOR) Protection

All protected customer endpoints (`/api/account/profile`, `/api/account/security`, `/api/account/addresses`, `/api/account/addresses/[id]`) derive identity strictly from `getCurrentCustomer()` using the verified `mq_session` HTTP-Only cookie.

> **RULE:** Client-supplied customer IDs in API bodies or route parameters are strictly ignored. Customer A can never view or modify Customer B's resources.

---

## 3. API Contract Summary

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | No | Register new customer account |
| `/api/auth/login` | `POST` | No | Login and obtain `mq_session` cookie |
| `/api/auth/logout` | `POST` | Yes | Logout and revoke active session |
| `/api/auth/me` | `GET` | Yes | Get authenticated customer details |
| `/api/auth/verify-email` | `POST` | No | Single-use email verification |
| `/api/auth/forgot-password` | `POST` | No | Request password reset instructions |
| `/api/auth/reset-password` | `POST` | No | Reset password using valid token |
| `/api/account/profile` | `PUT` | Yes | Update profile name and phone |
| `/api/account/security` | `POST` | Yes | Change password |
| `/api/account/addresses` | `GET` / `POST` | Yes | List / create customer addresses |
| `/api/account/addresses/[id]` | `PUT` / `DELETE` | Yes | Update / delete specific address |

---

## 4. Development Email Behavior

When `EMAIL_PROVIDER=development`, emails are cleanly logged to system output:
```
------------------------------------------------------------
✉️ [MARQIVO DEV MAIL DISPATCHER] To: alex.dev@marqivo.local
📌 Subject: Verify your MARQIVO account
📄 Message Body: ... http://localhost:3000/verify-email?token=...
------------------------------------------------------------
```
