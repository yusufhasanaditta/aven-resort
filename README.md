# Aven Tea Empire

Investor website for a 5-star eco-luxury resort across five tea hills in Srimangal, Bangladesh. Next.js 16 (App Router), Tailwind v4, React Three Fiber, Prisma.

## Run locally

```bash
npm install
npx prisma migrate dev     # creates prisma/dev.db (SQLite)
npm run db:seed            # 4 membership plans, site assets, admin account
npm run dev
```

Seeded admin login: `admin@aventeaempire.com` / `ChangeMe!2026` — **change it immediately** (or set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before seeding).

## What's in it

| Area | Where |
| --- | --- |
| Pages | Home, Membership, Wellness, Ownership (share calculator), Masterplan (3D + 26 zone functions), Accommodations, Experiences, Gallery, About, Contact |
| Accounts | `/register`, `/login`, `/account` (holdings, payment history, instalments) |
| Admin | `/admin` — overview, shareholders, enquiries, editable plan pricing, image replacement |
| Content | `src/data/*` (typed, sourced from the project PDFs) |
| Numerals | `.font-numeral` / `<Num>` — sans, tabular, lining figures for every stat |

## Before going live

1. **SSLCommerz** — set `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD` (sandbox first: https://developer.sslcommerz.com/registration/), `SSLCOMMERZ_IS_LIVE=true` for production, and `NEXT_PUBLIC_SITE_URL` to the public origin (SSLCommerz posts back to `/api/payments/ipn`). Until set, orders are recorded and the shareholder is told the gateway isn't connected — no payment is ever faked.
2. **Database** — SQLite cannot persist on Vercel (read-only, ephemeral filesystem). Change `provider` in `prisma/schema.prisma` to `postgresql`, set `DATABASE_URL` to a hosted Postgres (Neon / Vercel Postgres / Supabase), run `prisma migrate deploy` and `npm run db:seed`.
3. **Image uploads** — `/api/admin/assets/upload` writes to `public/uploads`, fine locally / self-hosted; on Vercel it returns 501 until swapped for Vercel Blob (or S3/Cloudinary). See the comment at the top of that file.
4. **Secrets** — set a long random `AUTH_SECRET`; rotate the seeded admin password.
5. **Unit price** — `৳500,000` per unit is a **placeholder** (the masterplan document gives unit-share ranges but no price). Set the real figure in Admin → Membership plans.
6. **Legal** — share sales to the public need regulatory review in Bangladesh; this codebase handles the mechanics, not the compliance.
