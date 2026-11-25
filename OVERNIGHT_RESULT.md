# Overnight result

## Phase 8 — Smart features (commit `Add phase 8: ...`)
- `lib/services/recommendations.js`: `recommend({from,to,place,limit,perKind})` and `related({kind,slug,place,tags})`. Rule-based, reuses `listEvents`/`listTrips`/`listStays` (so MongoDB when configured, data-file fallback otherwise).
  - Events: dropped if past, fully booked, or outside the date window; scored by overlap with dates, soonest start, ongoing, few seats left.
  - Trips/stays (no fixed dates): season tags (winter/monsoon/summer/autumn) derived from the chosen dates.
  - Place: exact match > contains > tag > title/summary mention; non-matching items are dropped when a place is given.
- `GET /api/recommendations?from=&to=&place=&limit=`: zod validation (real dates, `to` needs `from`, `to >= from`, place ≤ 80 chars, limit 1–24), 400 with issues on bad input, short CDN cache.
- UI: `RecommendationStrip` on Home ("Picked for you"), Events ("Make a trip of it"), Customized Trip (events/stays to pair; follows `?q=`), and "You may also like" on event, trip, hotel and houseboat detail pages. Strips render nothing when empty.
- Tested with temporary sample data (reverted): API results, all four validation errors, strips render. Note: lib/data arrays are empty and no DB is configured here, so strips are empty until content exists.

## Phase 9 — Polish and launch prep (code parts)
- SEO: titles/descriptions for every public page (added to events sub-pages, home absolute title, login/forgot-password noindex); Open Graph + Twitter defaults in root layout; `robots.txt` now also disallows `/api` and `/forgot-password`; sitemap rebuilds hourly (`revalidate`) so DB content appears without redeploy. (sitemap/robots already existed from earlier phases.)
- Accessibility: skip link, `#main` landmarks (home, site, admin), global `:focus-visible` ring, reduced-motion rule. Existing forms already had labels; header/menu already had aria attributes.
- Performance: `SmartImage` wrapper using `next/image` for local (/public) images in listing cards and detail galleries; SVGs unoptimised; remote URLs stay plain `<img>` because no remote host is configured (Cloudinary later). Logo and project images left as plain `<img>` (tiny / empty-alt, low value).
- Analytics: `@vercel/analytics` installed cleanly and added to the root layout; build passes.
- master_plan.md section 2 updated.

## My own improvements
- `app/not-found.js` (branded 404 with header and links), `app/(site)/error.js` (retry state), README with run instructions, `LAUNCH_CHECKLIST.md`.
- Tried a `loading.js`, **removed**: it made missing detail pages return HTTP 200 (soft 404, bad for SEO). 404s verified as 404.

## Build
`npm run build` passes, with no `MONGODB_URI` set. Smoke tested via `next start`: pages 200, unknown pages 404, robots/sitemap OK.

## Commits / push
Commits: `d8d081a` Add phase 8, `fb6256f` Add phase 9.

## Left for the owner
- Section 14 open questions untouched: EMI gateway/tenures, Developed By name, EUR pricing, Other's Project, VIP purchase/pricing, separate Admin account, brand colours, admin-login-requirements.md, MongoDB Atlas account, Bengali version.
- Phase 7 (EMI) still on hold. Turnstile/rate limiting on public forms not built (listed in the launch checklist).
- Content: lib/data arrays are empty; real data needs seeding (recommendations show nothing until then).
- Better 1200×630 Open Graph image; remote image host config when Cloudinary is added.

## Push status: FAILED (blocked)
`git push origin main` was rejected: the token in /root/.github_token returns HTTP 401 from the GitHub API ("Invalid username or token"), so it is expired, revoked or malformed. Two auth styles were tried; the token was not written to the remote config or any file. Both commits exist locally on `main`. To publish: provide a valid token (or run `git push origin main` from a signed-in machine).
