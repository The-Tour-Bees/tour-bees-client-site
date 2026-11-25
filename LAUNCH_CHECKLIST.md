# Launch checklist — thetourbees.com

## Owner decisions still needed (master_plan.md section 14)
- [ ] Brand colours (navy + gold, or dark + amber)
- [ ] "Developed By" name (`lib/site.js` → `developer`)
- [ ] VIP plans, pricing and renewal
- [ ] EU pricing is EUR? · Other's Project content · Bengali version? · EMI gateway (Phase 7, on hold)

## Content
- [ ] Real photos, events, trips, hotels, houseboats (replace demo data; remove demo rows)
- [ ] About Us text, contact details in `lib/site.js`, Booking Conditions text
- [x] Open Graph image: `public/og.jpg` (1200×630); regenerate with `node scripts/og/make-og.mjs`

## Accounts and services
- [ ] MongoDB Atlas cluster; set `MONGODB_URI` in Vercel (Production + Preview)
- [ ] `AUTH_SECRET` (32+ chars) in Vercel; never commit `.env`
- [ ] `NOTIFY_WEBHOOK_URL` / `NOTIFY_WEBHOOK_TOKEN` for OTP messages and new booking / enquiry alerts; the receiver must handle both payload shapes (README, "Notifications")
- [ ] Turnstile: create a widget for thetourbees.com in Cloudflare, set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` together in Vercel, redeploy, then send one test enquiry and one test booking (optional; forms work without it)
- [ ] Create the first admin: `node scripts/create-admin.mjs`
- [ ] Domain thetourbees.com added in Vercel, HTTPS on
- [ ] Vercel Analytics enabled in the project dashboard (the code is already in the layout)
- [ ] Submit `https://thetourbees.com/sitemap.xml` to Google Search Console

## Final checks
- [ ] `npm run build` passes; `/api/health` returns ok in production
- [ ] Test on real phones (iOS Safari, Android Chrome) at phone/tablet/desktop widths
- [ ] Sign-in flows: wrong password, pending, inactive, OTP expiry, password reset
- [ ] Each role sees only its own data
- [ ] Currency switcher in BDT, USD, EUR, INR
- [ ] Enquiry forms reach the admin inbox
- [x] Rate limiting on public forms and sign-in routes (built; in-memory, per server instance)
- [ ] Spam protection (Turnstile) on forms: built, active once both keys above are set
