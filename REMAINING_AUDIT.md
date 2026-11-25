# Remaining work audit — thetourbees.com
Written 2026-11-25. Scope: everything incomplete EXCLUDING Phase 7 (EMI, on hold by decision).

## Being fixed in this run (2026-11-25)
- [ ] Admin panel has no editing screens for Trips, Hotels, Houseboats (Users, Events, Bookings, Commissions, Enquiries exist). Admin CRUD being built now.
- [ ] Listings use cartoon demo SVGs (/demo/*.svg). Seed script being updated to real stock photos; live DB still needs a reseed afterwards (no MONGODB_URI on this VM — run scripts/seed-demo.mjs where the URI lives, or update image fields in Atlas).

## Code not built yet
- Currency rates are hardcoded placeholders in lib/currency.js (TODO in code: replace with an admin-managed currency_rates table). No rates model exists yet, so no admin rates screen was built in this run.
- Rate limiting / spam protection (Turnstile) on public enquiry and booking forms — not built (LAUNCH_CHECKLIST final checks).
- Proper 1200x630 Open Graph image (public/hero-bg.png is the current default).

## Owner decisions still open (master_plan.md section 14)
- Brand colours: navy + gold vs the built dark + amber.
- "Developed By" name (lib/site.js -> developer).
- VIP plan pricing and renewal.
- Is EU pricing in EUR?
- What "Other's Project" shows; Bengali (Bangla) version of the site?
- admin-login-requirements.md is referenced by the plan but not in this repo.

## Content still demo / placeholder
- Demo rows (8 events, 12 trips, 8 hotels, 4 houseboats, 2 demo hosts, all flagged demo: true) still in the live DB — replace with the business's real listings and remove demo rows before public launch.
- About Us text, contact details in lib/site.js, Booking Conditions text.

## Accounts / services (checklist boxes are stale — several are actually done)
- Done 2026-11-25: MongoDB Atlas M0 cluster, MONGODB_URI + AUTH_SECRET in Vercel (Production + Preview), domain thetourbees.com live with HTTPS, demo content seeded.
- NOTIFY_WEBHOOK_URL / NOTIFY_WEBHOOK_TOKEN not set — OTP and enquiry notifications have no webhook target yet.
- Vercel Analytics: code is in the layout; confirm it is enabled in the project dashboard.
- Submit https://thetourbees.com/sitemap.xml to Google Search Console.
- First admin exists (panel in use); scripts/create-admin.mjs remains the way to add another.

## Manual final checks not yet done
- Test on real phones (iOS Safari, Android Chrome) at phone/tablet/desktop widths.
- Sign-in flows: wrong password, pending, inactive, OTP expiry, password reset.
- Each role sees only its own data.
- Currency switcher BDT/USD/EUR/INR — browser-verified working 2026-11-25 (custom dropdown, repricing correct).
- Enquiry forms reach the admin inbox (needs a live test submission).
- /api/health returns ok in production.
