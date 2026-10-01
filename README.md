# Aven Tea Empire

Investor website for a 5-star eco-luxury resort across five tea hills in Srimangal, Bangladesh. Next.js 16 (App Router), Tailwind v4, React Three Fiber, Prisma (MySQL).

**Deploying:** see [HOSTINGER.md](HOSTINGER.md) — step-by-step for a Hostinger Node.js Web App with MySQL.

## Run locally

Production uses MySQL. For local development either point `DATABASE_URL` at a MySQL/MariaDB database (e.g. XAMPP) and run:

```bash
npm install
npm run db:push     # creates the tables
npm run db:seed     # 5 membership plans + admin account (no demo data)
npm run dev
```

…or use a SQLite file: generate a copy of `prisma/schema.prisma` with `provider = "sqlite"` and the `@db.*` attributes removed as `prisma/schema.local.prisma`, set `DATABASE_URL="file:./prisma/dev.db"`, then `npx prisma db push --schema prisma/schema.local.prisma` and `npx prisma generate --schema prisma/schema.local.prisma`.

Seeded admin login: `admin@aventeaempire.com` with the password in `SEED_ADMIN_PASSWORD` (without it, the seed generates one and prints it once).

## What's in it

| Area | Where |
| --- | --- |
| Pages | Home, Ownership (price chart + share calculator), Wellness, Amenities, Stay, Masterplan, Gallery, About, Contact, FAQ |
| Accounts | `/register`, `/login`, `/forgot-password` (emailed code), `/account` (holdings, installment tracker, payments, receipts, profile) |
| Payments | SSLCommerz (`src/lib/sslcommerz.ts`, `src/lib/payments.ts`); built-in test checkout in development; bank/bKash offline payments recorded by admin |
| Admin | `/admin` — CRM, applications, shareholders (create, edit, message, allocate shares, password help), installments, payments, packages, website content, media library, activity log |
| Content | Defaults in `src/data/*`; everything editable in admin is stored in the database |

## Environment variables

See the table in [HOSTINGER.md](HOSTINGER.md#3-add-the-environment-variables).

## Before going live

1. **SSLCommerz** — add the store credentials (see HOSTINGER.md step 3 and 6).
2. **Email** — set the SMTP variables so password-reset codes, receipts and reminders are sent.
3. **Secrets** — a long random `AUTH_SECRET`, and change the admin password after first sign-in.
4. **Legal** — share sales to the public need regulatory review in Bangladesh; this codebase handles the mechanics, not the compliance.
