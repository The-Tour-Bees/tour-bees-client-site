# Polish run — result

All five items are built and committed on branch **`polish-run`** (not on `main`, nothing pushed).
The final `npm run build` passes with no `MONGODB_URI` and no other env vars. Phase 7 (EMI) and the
section-14 owner decisions were not touched. No new packages, accounts or paid services.

## Before you deploy

```bash
git checkout main && git merge --ff-only polish-run
```

Your local `main` was already 13 commits ahead of and 2 behind `origin/main` (as of the last fetch), so a plain push
will be rejected. The 2 remote commits have the same files as local commit `11d296b`, so this replays only the later
work on top of them:

```bash
git rebase --onto origin/main 11d296b main   # run `git fetch` first; if origin/main has moved again, check it
```

## 1. Rate limiting — `58c8706`

`lib/rate-limit.js`: in-memory token bucket per IP and route, no dependencies. Always on.

| Route (POST) | Limit |
| --- | --- |
| `/api/enquiries` | 5 / min |
| `/api/auth/login`, `verify-otp`, `forgot-password`, `reset-password` | 5 / min each |
| `/api/bookings`, callers without a session only | 5 / min |
| `/api/auth/logout` | 20 / min |

Over the limit: HTTP 429, `Retry-After`, `{ "error": "Too many attempts. Please wait N seconds and try again." }`.
Admin routes and `change-password` are unchanged.

- `/api/bookings` is not a public route: only signed-in host, agent and admin accounts can book. Signed-in users are
  therefore never throttled there. An anonymous call now gets 401 even when sign-in is not configured (was 503).
- Each server instance counts separately, so on Vercel this slows abuse but is not an exact global limit.
- Visitors behind one shared IP (common on mobile networks) share a limit, and rejected form submissions count too.
- The IP comes from `x-real-ip` / `x-forwarded-for`. Vercel sets these; another host's proxy must overwrite them.

**Verify** (on a local `npm start`): run this seven times; the sixth and seventh print 429.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST -d '{}' http://localhost:3000/api/enquiries
```

## 2. Cloudflare Turnstile — `5f6ce7d` (env-gated)

On every enquiry form and on the guest-booking form (`/admin/bookings/new`, so staff see it too).

| Env var | Unset | Set |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | no widget, no Cloudflare script | widget shown (**rebuild / redeploy needed**) |
| `TURNSTILE_SECRET_KEY` | not checked, one log warning | checked with `siteverify`; failures get 400 |

- **Set both or neither.** A secret without a site key rejects every submission.
- With the secret set, submissions are refused if Cloudflare cannot be reached.
- Documented in README ("Spam protection"), LAUNCH_CHECKLIST.md and `.env.example`.

Tested in headless Chromium with Cloudflare's dummy keys: the always-pass secret saved an enquiry and a booking; the
always-fail secret rejected both with a visible message, and the contact form showed a fresh widget; with no secret,
enquiries saved. **Your real keys have not been tested.**

**Verify:** add both keys in Vercel, redeploy, send one enquiry and create one booking.

## 3. Open Graph image — `0e10514`

- `public/og.jpg`, 1200×630: existing artwork and logo, "The Tour Bees", "Tour For Life", thetourbees.com.
- Regenerate with `node scripts/og/make-og.mjs` (Linux; uses the `sharp` that Next.js installs).
- Added Geist and Instrument Serif font files with their OFL licences in `scripts/og/fonts/` (from Google Fonts).
- Default `openGraph` and `twitter` image in `app/layout.js`. Event, trip and stay pages with a photo share that photo
  in both; before, Twitter kept the default, and a page without a photo lost its Open Graph tags.

**Verify:** view the page source for `og:image` and `twitter:image`, or use a social share debugger after deploying.

## 4. Booking and enquiry notifications — `1cbb5cc` (env-gated)

This did not exist yet. The webhook was only used to deliver sign-in codes and temporary passwords.

With `NOTIFY_WEBHOOK_URL` set (`NOTIFY_WEBHOOK_TOKEN` optional, sent as a Bearer token), each saved enquiry and
booking sends:

```json
{ "type": "booking", "id": "…", "name": "…", "contact": { "mobile": "…", "email": "" }, "item": "…", "date": "2026-11-25T20:42:45.114Z" }
```

- `type` is `booking` or `enquiry`. `date` is when the record was created. For enquiries `item` is e.g. `hotel: <name>`.
- Sent after the response, 3 s timeout, no retry; failures are only logged.
- **The same URL also receives `{ channel, to, message }`** for codes and passwords. Your receiver must handle both.

Tested against a local receiver: success, HTTP 500, hang, connection refused and URL unset. The enquiry and booking
succeeded every time. No real provider has been tested.

**Verify:** point the URL at your receiver, send one enquiry, check the payload.

## 5. Spacing and alignment — `0ca87e7`

Checked 21 public pages with demo data at 320, 390, 768, 1024, 1280 and 1440 px, before and after.

| Fixed | Where |
| --- | --- |
| Portrait photos stretched some cards taller than their neighbours | all listing and recommendation cards |
| Missing divider beside "Guests" | houseboat filters, desktop |
| Stray dividers and square corners on dropdowns; Apply button out of line | filters, phone and tablet |
| "Guests" took a full row instead of pairing with "Place" | houseboat filters, 390 and 768 px |
| Section headings had no space above them | Booking Conditions |
| Intro text indented compared with the sections below | About |
| Content edges a few px out of line | header (≤1280 px), form and text columns (≤860 px) |
| Oversized gap under the page title | phones and tablets |
| Larger padding than neighbouring cards | Domestic / International cards, phones |
| Second button had no style | 404 page |
| Selected tab was unreadable (admin, found while testing item 2) | New booking form |

After the fixes there was no horizontal overflow at the widths measured. Real phones were not tested.

## Found but not changed

- **`scripts/seed-demo.mjs` fails to run:** `models/Event.js` imports `./User` without `.js` (`ERR_MODULE_NOT_FOUND`).
  `models/Commission.js` has the same style of import. Adding `.js` should fix it; this matters for the pending reseed.
  For testing I used a temporary loader, leaving the files as they were.
- The "confirmed" booking status pill uses `var(--blue)`, which is not defined, so it has no background colour.
- Date fields in the public enquiry forms are still the browser's native inputs, not the themed date picker.
- The home page shows "2,400+ hand-picked stays and tours" and Lisbon / Kyoto / Banff chips. Check these before launch.

## How testing was done

Production builds on a loopback port, with a temporary MongoDB container seeded with demo data. The container and
temporary files were removed afterwards; the live database was not used.
