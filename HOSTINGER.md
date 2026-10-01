# Putting the Aven website on Hostinger

This site is a Node.js (Next.js) app with a MySQL database. It runs on
Hostinger **Business** or **Cloud** hosting as a **Node.js Web App**.

The database is set up once by importing `hostinger-setup.sql` in
phpMyAdmin (step 1). It creates every table, the 5 membership plans and the
admin account, with no demo data.

---

## 1. Create the MySQL database

1. In **hPanel** open **Websites → your site → Databases → MySQL Databases**.
2. Create a database with a user and a strong password, and write down all
   three. Hostinger adds a prefix, so they look like `u123456789_aven`,
   `u123456789_avenuser` and your password.
3. The database host is usually `localhost`.
4. Open **phpMyAdmin** for that database → **Import** → choose
   `hostinger-setup.sql` (in the project folder) → **Go**. Do this **once only**.

Your connection address (`DATABASE_URL`) is then:

```
mysql://u123456789_avenuser:YOUR_PASSWORD@localhost:3306/u123456789_aven
```

> If the password contains special characters like `@ # : / ? &`, replace
> each with its code: `@`→`%40`, `#`→`%23`, `:`→`%3A`, `/`→`%2F`, `?`→`%3F`,
> `&`→`%26`. The easiest option is a password of only letters and numbers.

## 2. Create the Node.js app

1. In **hPanel** go to **Websites → Add website → Node.js Apps**.
2. Choose **Upload your website files** and upload `aven-resort-hostinger.zip`.
   Or connect your GitHub repository instead.
3. Framework: **Next.js**. Node version: **20** or newer.
4. Build command: `npm run build`.
5. Start command: `npm run start`.

> The zip already contains the finished website (the `.next` folder), built on
> a computer. Hostinger's shared servers are too old to run the Next.js 16
> compiler, so `npm run build` there only prepares the database client
> (`prisma generate`) and `npm run start` runs the finished site. To change
> the website, rebuild locally with `npm run build:site` and upload a new zip.

## 3. Add the environment variables

Add these in the app's **Environment variables** section *before* the first
deploy.

| Name | Value |
|---|---|
| `DATABASE_URL` | The address from step 1 |
| `AUTH_SECRET` | A long random string, at least 32 characters. It signs logins, so keep it secret and never change it after launch. |
| `NEXT_PUBLIC_SITE_URL` | Your domain, e.g. `https://avenlimited.com` (no `/` at the end) |
| `CRON_SECRET` | Another random string, used by the daily reminder job (step 5) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | The Gmail address emails are sent from |
| `SMTP_PASS` | A Google **App Password** for that Gmail. Create it under Google Account → Security → 2-Step Verification → App passwords. |
| `MAIL_FROM` | e.g. `Aven Eco Luxury Resort <info.avenlimited@gmail.com>` |

The four `SMTP_` settings and `MAIL_FROM` are needed for password reset
codes, receipts, reminders and admin messages. Without them the site still
works, but no email is sent.

Add these later, when SSLCommerz gives you your store:

| Name | Value |
|---|---|
| `SSLCOMMERZ_STORE_ID` | Your store ID |
| `SSLCOMMERZ_STORE_PASSWORD` | Your store password |
| `SSLCOMMERZ_IS_LIVE` | `false` while testing on their sandbox, `true` for real payments |

Until SSLCommerz is added, customers can reserve shares and pay by bank or
bKash. You record those payments in admin → Payments.

## 4. Deploy and sign in

1. Click **Deploy** and wait for the build to finish (a few minutes).
2. Open `https://yourdomain/login` and sign in as admin with:
   - email `admin@aventeaempire.com`
   - the admin password you were given (it is not written in this guide)
3. To change the admin password, open your name at the top right → **Change password**.

The database starts empty apart from the plans and the admin account. There
are no demo customers, payments or leads.

## 5. Daily installment reminders (cron job)

In **hPanel → Advanced → Cron Jobs**, add a job that runs **once a day**
with this command:

```
wget -q -O /dev/null "https://yourdomain/api/cron/reminders?key=YOUR_CRON_SECRET"
```

Replace `yourdomain` and `YOUR_CRON_SECRET` with your own values. The job
sends due-soon, due-today and overdue reminders, and never sends the same
reminder twice. Reminders also go out when a shareholder opens their
dashboard, and from admin → Installments → **Send reminders now**.

## 6. When SSLCommerz is connected

In the SSLCommerz merchant panel, set the **IPN URL** to:

```
https://yourdomain/api/payments/ipn
```

The success, fail and cancel return addresses are sent with each payment
automatically.

---

### Updating the site later

Upload the new files, or push to GitHub, and redeploy. Your data stays in the
database. If an update adds new tables, I'll give you a small SQL file to
import for just those.

### Uploaded images

Images uploaded in admin → Media library are stored in the database itself.
They're included in your database backups, and nothing extra is needed on
the server.

---

## Updating the live site (only the files that are needed)

Hostinger only needs these 7 items to run the site. `src/` and the design
folders are **not** uploaded; they stay on the computer where the site is built.

| Item | What it is |
|---|---|
| `.next/` | The finished website (built with `npm run build:site`) |
| `public/` | Images, logo and brochure files |
| `prisma/schema.prisma` | Database description, used to prepare the database client |
| `package.json`, `package-lock.json` | The list of packages Hostinger installs |
| `next.config.mjs` | Site settings (redirects) |
| `.env` | Passwords and addresses for avenresort.com — keep private |

To build the update zip on the computer:

1. `npm run build:site` with the production settings loaded (see `.env` in the zip).
2. Zip the 7 items above, and nothing else.

On Hostinger: open the Node.js app → **Deployments / Settings** → upload the zip
→ **Deploy**. Build command `npm run build`, start command `npm run start`.

If an update changes the database, a small `hostinger-update-N.sql` file comes
with it. Import it **once** in phpMyAdmin before deploying. Your data is kept.
