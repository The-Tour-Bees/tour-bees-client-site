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
- `GET /api/health` — database connection check.
- `GET /api/recommendations?from=YYYY-MM-DD&to=YYYY-MM-DD&place=Khulna` — rule-based recommendations.

## Layout

`app/` pages and route handlers · `components/` UI · `lib/` data helpers, auth, `lib/services/recommendations.js` · `models/` Mongoose schemas.
