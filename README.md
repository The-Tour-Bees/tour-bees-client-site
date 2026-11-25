# The Tour Bees — client site

Next.js (App Router) + MongoDB. Plan and scope: [master_plan.md](master_plan.md). Launch steps: [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).

## Run it

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI and AUTH_SECRET (see comments inside)
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
```

The site builds and runs **without** `MONGODB_URI`: content falls back to `lib/data/*` (empty by default), and
forms/sign-in show a friendly "not set up yet" state.

## Useful scripts

- `node scripts/seed-demo.mjs` — load demo events, trips, hotels and houseboats into MongoDB.
- `node scripts/create-admin.mjs` — create the first admin account.
- `node scripts/og/make-og.mjs` — rebuild the 1200×630 share image `public/og.jpg` (Linux).
- `GET /api/health` — database connection check.
- `GET /api/recommendations?from=YYYY-MM-DD&to=YYYY-MM-DD&place=Khulna` — rule-based recommendations.

## Spam protection

- **Rate limiting** (`lib/rate-limit.js`, always on): per IP and route, 5 POSTs a minute for enquiries, sign-in /
  one-time-code routes and booking calls without a session; 20 a minute for sign-out. Signed-in staff are not limited
  when booking, and admin routes are not limited. Counts live in memory, so each server instance counts separately.
  The IP comes from `x-real-ip` / `x-forwarded-for`: Vercel sets these; behind another host, the proxy must overwrite them.
- **Cloudflare Turnstile** (off until configured) on the enquiry forms and the guest-booking form:

| Variable | Used for |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Shows the widget. Built into the pages, so rebuild / redeploy after changing it. |
| `TURNSTILE_SECRET_KEY` | Server-side check of each submission. Unset: submissions are not checked (one warning in the log). |

Set both together (Cloudflare dashboard → Turnstile → add the site's domain). A secret key without a site key rejects
every submission. When the secret is set and Cloudflare cannot be reached, submissions are refused with a retry message.

## Notifications

Set `NOTIFY_WEBHOOK_URL` (and optionally `NOTIFY_WEBHOOK_TOKEN`, sent as `Authorization: Bearer …`). The one URL
receives two payload shapes, so the receiver should branch on which field is present:

| When | JSON body |
| --- | --- |
| A code or temporary password must be sent to a user | `{ "channel": "sms", "to": "+880…", "message": "…" }` |
| An enquiry or booking is saved | `{ "type": "enquiry" or "booking", "id", "name", "contact": { "mobile", "email" }, "item", "date" }` |

`date` is when the record was created (ISO 8601, UTC). `item` is the booking title, or `<enquiry type>: <subject or listing>`.
Booking and enquiry posts are sent after the response, time out after 3 seconds, are not retried, and never fail the
request; failures are logged. The records stay in the admin panel either way.

## Layout

`app/` pages and route handlers · `components/` UI · `lib/` data helpers, auth, `lib/services/recommendations.js` · `models/` Mongoose schemas.
