# 🗄️ MARQIVO — Supabase PostgreSQL Database Setup & Upload Guide

This guide details how to connect MARQIVO to a **Supabase PostgreSQL** database, push the database schema, and seed initial Admin & Customer accounts.

---

## Step 1: Create a Supabase Project

1. Sign in to your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Click **New Project** and select your organization.
3. Enter your project details:
   - **Name**: `MARQIVO Commerce`
   - **Database Password**: Set a strong password (save this password!).
   - **Region**: Choose the region closest to your users.
4. Click **Create new project** and wait ~2 minutes for provision completion.

---

## Step 2: Obtain Connection URLs

In your Supabase project dashboard:
1. Navigate to **Project Settings** (gear icon at the bottom left) ➔ **Database**.
2. Scroll to **Connection strings**:
   - Select **URI** tab.
   - Mode: **Transaction** (Port `6543`) ➔ Copy this URL as `DATABASE_URL`.
   - Mode: **Session / Direct** (Port `5432`) ➔ Copy this URL as `DIRECT_URL`.

### Example `.env` Configuration:
```env
# Supabase Transaction Pooler URL (Used by application at runtime)
DATABASE_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Direct Connection URL (Used by Prisma for migrations/schema push)
DIRECT_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

JWT_SECRET="super-secret-jwt-key-marqivo-2026"
ADMIN_JWT_SECRET="super-secret-admin-jwt-key-marqivo-2026"
```

---

## Step 3: Push Database Schema to Supabase

Run the following command in your terminal inside the project directory:

```bash
npx prisma db push
```

This command will:
- Connect directly to your Supabase PostgreSQL instance.
- Create all 30+ tables, relations, indexes, and enums defined in `prisma/schema.prisma`.

---

## Step 4: Seed Initial Admin & Customer Data

Run the seed command to populate default categories, products, inventory, admin accounts, and customer credentials:

```bash
npm run prisma:seed
```

### Pre-Configured Accounts:
- **Admin Portal Account**:
  - Email: `admin@marqivo.com`
  - Password: `MarqivoAdmin2026!`
- **Customer Account**:
  - Email: `customer@marqivo.com`
  - Password: `CustomerPassword2026!`

---

## Step 5: Verification

Verify your tables in Supabase:
1. Go to **Table Editor** in your Supabase Dashboard.
2. You will see tables such as `customers`, `products`, `orders`, `admin_users`, etc., populated with seed data.
