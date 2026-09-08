# 🚀 MARQIVO — Vercel Deployment & Hosting Guide

This guide details how to deploy the MARQIVO platform to **Vercel** with Supabase PostgreSQL integration.

---

## Step 1: Push Code to GitHub

Ensure all your latest changes are pushed to your GitHub repository:

```bash
git add .
git commit -m "feat: configure Supabase PostgreSQL and Vercel readiness"
git push origin main
```

---

## Step 2: Import Project in Vercel

1. Log in to **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** ➔ **Project**.
3. Select your GitHub repository (`MARQIVO_ecom`).
4. Configure Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

---

## Step 3: Configure Environment Variables in Vercel

Before clicking **Deploy**, expand the **Environment Variables** section in Vercel and add the following:

| Key | Example Value | Description |
|-----|---------------|-------------|
| `DATABASE_URL` | `postgres://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` | Supabase Transaction Pooler URL |
| `DIRECT_URL` | `postgres://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres` | Supabase Direct Connection URL |
| `JWT_SECRET` | `super-secret-jwt-key-marqivo-2026` | Customer JWT Secret |
| `ADMIN_JWT_SECRET` | `super-secret-admin-jwt-key-marqivo-2026` | Admin JWT Secret |
| `NODE_ENV` | `production` | Production Environment Flag |

---

## Step 4: Deploy & Verify

1. Click **Deploy**.
2. Vercel will install dependencies (automatically running `prisma generate` via `postinstall`), build all 64 pages & API routes, and deploy to your custom `.vercel.app` domain.
3. Open your live Vercel URL to test:
   - **Storefront**: `https://your-app.vercel.app`
   - **Admin Portal**: `https://your-app.vercel.app/admin/login`
   - **Customer Portal**: `https://your-app.vercel.app/login`
