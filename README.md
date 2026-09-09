# Bookseller

A PWA marketplace where storytellers, writers and creators sell books and
products directly to readers — bank transfer payments, subscriber
notifications, and an admin dashboard to keep fraudsters out.

## What's included

- **Marketplace**: browse/search approved listings by category.
- **Selling**: anyone can register, add payout bank details, and submit a
  listing (title, description, cover image, price). Listings go to an admin
  review queue before they go live.
- **Seller pages**: `/sellers/<username>` — public storefront with a
  subscribe button. Subscribers get an in-app notification when that seller
  publishes something new.
- **Orders & payment**: buyer starts an order, sees the seller's bank
  details, marks it paid; seller confirms payment received. Either side can
  report the other (didn't deliver / didn't pay), which automatically flags
  the order and the reported account and alerts admins.
- **Admin dashboard** (`/admin`): approve/reject listings, flag/ban users,
  review and resolve reports.
- **Notifications**: in-app bell, polled every 30s (no external service
  required).
- **PWA**: installable, with a basic offline app-shell service worker.

## Stack

Next.js (App Router) + Neon Postgres (`@neondatabase/serverless`) +
Vercel Blob (image uploads) + JWT auth in an httpOnly cookie
(`bcryptjs` + `jsonwebtoken`). No other paid services required.

## Deploy — same flow you've used before (GitHub → Vercel, no local setup)

1. **Create the database.** Go to [neon.tech](https://neon.tech), create a
   free project, then open its **SQL Editor** and paste in the entire
   contents of `lib/schema.sql`, then run it. Copy the connection string
   from the Neon dashboard (starts with `postgres://...`).

2. **Push this project to a new GitHub repo** (upload the files via the
   GitHub web UI, same as your other projects).

3. **Import the repo into Vercel** (vercel.com → Add New → Project → pick
   the repo).

4. **Add environment variables** in Vercel's project settings before the
   first deploy, or redeploy after adding them:
   - `DATABASE_URL` — the Neon connection string from step 1.
   - `JWT_SECRET` — any long random string (e.g. generate one at
     [randomkeygen.com](https://randomkeygen.com)).
   - `BLOB_READ_WRITE_TOKEN` — in your Vercel project, go to **Storage →
     Create Database → Blob**, then copy the token it gives you.

5. **Deploy.** Vercel will run `npm install` and `next build` automatically.

6. **Make yourself admin.** Register a normal account on the live site,
   then in Neon's SQL Editor run:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'your@email.com';
   ```
   Refresh the site and you'll see an **Admin** link in the top bar.

## Notes on payments

This uses manual bank-transfer confirmation, matching what you did for Jam
Fresh — there's no payment gateway integration. Buyers see the seller's
bank details on the order and mark it paid themselves; sellers confirm once
the money lands in their account. If you later want automatic verification
(Paystack/Flutterwave), that would replace the `mark-paid` /
`confirm-payment` routes with a webhook.

## Notes on notifications

Notifications are stored in Postgres and the bell in the top bar polls
`/api/notifications` every 30 seconds — no Pusher/email setup needed to get
started. If you want real-time push or email digests later, that's a
separate add-on, not a rebuild.
