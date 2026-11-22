# The Tour Bees — Master Plan

**Site:** thetourbees.com
**Tagline:** Tour For Life

Source of truth for what we are building: the website sitemap, the admin panel (individual login system), the technical approach, data model, page-by-page specs and a phased delivery plan. Items marked **[Proposed]** are my suggestions, not decisions from the original plan images. Items marked **[Open]** need an answer from the team (collected in section 14).

---

## 1. Overview

The Tour Bees is a travel platform offering events, customized trips, hotel/resort and houseboat enquiries, VIP membership, investor onboarding and EMI (credit card instalment) payment for tour packages. It has two parts:

1. **Public website** — for visitors, members and guests.
2. **Admin panel** (`/admin`) — individual logins for Hosts, Agents and Members, each with its own permissions, plus an admin who approves accounts.

### Confirmed decisions

| Decision | Answer |
|----------|--------|
| EMI System | Lets a customer pay for a tour package in instalments using a credit card. (The sitemap image says "EHI"; confirmed as EMI.) |
| Hotel / Resort / Houseboat bookings | **Enquiry only.** The guest submits a request; the team confirms and collects payment offline. |
| Admin panel location | Same Next.js app, under `/admin`. |
| Currencies | Every price available in **BDT, USD, EU (EUR), INR**. |
| Responsiveness | Fully mobile responsive with a hamburger menu (done for the Home hero). |

### Goals

- Let visitors discover trips and events quickly and send an enquiry or book in a few steps.
- Give Hosts, Agents and Members their own logins with only the data they need.
- Recommend trips and events by date and by place.
- Show prices in the visitor's preferred currency.

### Non-goals (for now)

- Online payment for hotel, resort or houseboat bookings (enquiry only).
- Native mobile apps.
- Multi-language support (unless the team asks).

---

## 2. Current State

Built so far (Next.js App Router, plain JS, deployed on Vercel):

- `app/Hero.js` — hero section with dimmed background, nav, search card (Stays / Tours / Activities tabs, location, dates, guests, popular chips).
- Mobile responsive layout with hamburger menu (`app/globals.css`).
- `public/hero-bg.png`, `public/logo.png`.

Everything else in this plan is still to build.

---

## 3. Website Sitemap

```
thetourbees.com
│
├── Home Page                      /
├── About Us                       /about
├── Events                         /events
│   ├── Previous                   /events/previous
│   ├── Ongoing                    /events/ongoing
│   └── Upcoming                   /events/upcoming
├── Be a VIP Member                /vip
├── Be an Investor                 /investor
├── EMI System                     /emi
├── Customized Trip                /custom-trip
│   ├── Domestic                   /custom-trip/domestic
│   └── International              /custom-trip/international
├── Hotel / Resort Booking         /hotels
├── Houseboat Booking              /houseboats
├── Contact Us                     /contact
├── Other's Project                /projects
│
├── Footer (on every page)
│   ├── Developed By [ ]
│   ├── About Us                   /about
│   ├── Contact Us                 /contact
│   └── Booking Conditions         /booking-conditions
│
└── Admin Panel                    /admin   (see section 8)
```

URLs are **[Proposed]**; they can be changed freely before launch.

### Header navigation **[Proposed]**

Home · Events (dropdown: Previous / Ongoing / Upcoming) · Customized Trip (dropdown: Domestic / International) · Hotel / Resort · Houseboat · Be a VIP Member · More (About Us, Be an Investor, EMI System, Other's Project, Contact Us) · currency switcher · Sign in. Collapses into the hamburger menu on screens 860px wide and under.

---

## 4. Technical Approach **[Proposed]**

| Area | Choice | Why |
|------|--------|-----|
| Framework | Next.js (App Router), already in use | Already set up; SSR/ISR for SEO on public pages. |
| Hosting | Vercel | Already deploying there. |
| Database | Postgres via Vercel Marketplace (Neon) | Relational data fits users, bookings, events, commissions. |
| ORM | Drizzle or Prisma | Typed queries and migrations. |
| Auth | Auth.js or Clerk, plus custom OTP and approval flow | Password login, OTP, reset; roles stored on the user. |
| OTP / SMS | SMS gateway for Bangladesh (e.g. SSL Wireless, BulkSMSBD) and email | Mobile OTP is required by the plan. |
| File storage | Vercel Blob | Profile photos, event images, NID uploads. |
| Email | Resend or similar | Enquiry notifications, temporary passwords, resets. |
| Payments (EMI only) | A Bangladesh gateway that supports card instalments (e.g. SSLCommerz, bKash PGW, EBL/City Bank EMI) | Only needed for the EMI System. |
| Currency | Stored base price in BDT plus rate table for USD / EUR / INR | One source of truth, converted for display. |
| Styling | Existing global CSS design tokens | Match what is already built. |
| Validation | Zod on every form and API route | Consistent server-side checks. |
| Analytics | Vercel Analytics, optionally GA4 | Track enquiries and conversions. |

### Project structure **[Proposed]**

```
app/
  (site)/              public pages, shared header + footer
    page.js            Home
    about/ events/ vip/ investor/ emi/ custom-trip/
    hotels/ houseboats/ contact/ projects/ booking-conditions/
  (auth)/login, register, forgot-password, verify-otp
  admin/               role-aware dashboard (host / agent / member / admin)
  api/                 route handlers (enquiries, auth, events, currency)
components/            Header, Footer, SearchCard, PriceTag, CurrencySwitcher, EnquiryForm, ...
lib/                   db, auth, currency, recommendations, validators
public/                static assets
```

---

## 5. Global Features

### 5.1 Multi-currency prices

- Every product price is stored once in a base currency (BDT) and displayed in BDT, USD, EUR or INR.
- A **currency switcher** in the header; the choice is remembered (cookie) and applied site-wide.
- Exchange rates live in a `currency_rates` table, updated by an admin or a daily job. Show the rate date in the admin panel.
- A shared `PriceTag` component is the only place that formats prices (symbol, decimals, thousands separators).
- **[Open]** Is EU pricing in euros (EUR)?

### 5.2 Smart recommendations

| Feature | Behaviour |
|---------|-----------|
| **Date Based Recommendation** | User picks dates (or a month). We list events, trips and stays available in that window, ranked by soonest, availability and popularity. Also seasonal suggestions (e.g. winter, monsoon, Eid holidays). |
| **Place Based Recommendation** | User picks or types a destination. We list trips, events and stays for that place plus nearby or similar places. |

Version 1 is rule-based (filters, tags, region, season, popularity). Machine learning is not needed at launch. Surface it on the Home search card, on Events and Customized Trip pages, and as a "You may also like" strip on detail pages.

### 5.3 Enquiry and lead handling

- One shared enquiry form component, used for Hotel / Resort, Houseboat, Customized Trip, Be an Investor and Contact Us, each with its own fields.
- On submit: save to the database, email the team, send a confirmation to the guest, and show the enquiry in the admin panel with a status (New → Contacted → Confirmed → Closed / Cancelled).
- Spam protection (Cloudflare Turnstile or similar) and rate limiting.

### 5.4 SEO, performance, accessibility

- Per-page title, description and Open Graph image; sitemap.xml and robots.txt.
- Optimised images (`next/image`), fonts loaded once.
- Keyboard-friendly navigation, visible focus states, sufficient contrast, labelled form fields.

---

## 6. Page Specifications

### 6.1 Home Page — `/`
- Hero with search (Stays / Tours / Activities), already built. Search results go to the relevant listing page.
- Sections: upcoming events, featured customized trips (domestic and international), popular destinations, hotel/resort and houseboat highlights, VIP membership call to action, EMI call to action, testimonials, investor teaser, footer.
- Recommendation strips (date and place based).

### 6.2 About Us — `/about`
- Company story, mission ("Tour For Life"), team, milestones, partners. Mostly static content managed in code or a simple admin-editable block.

### 6.3 Events — `/events`
- Landing page with three tabs or sub-pages: **Previous**, **Ongoing**, **Upcoming**.
- Event card: image, title, location, dates, price (multi-currency), host, status badge.
- Filters: date range, place, price, host. Sort by date.
- Event detail page: gallery, itinerary, inclusions, host profile, price, seats left, enquiry or book button.
- Previous events act as a gallery and social proof (photos, short recap).
- Status is computed from dates: past → Previous, today within range → Ongoing, future → Upcoming.

### 6.4 Be a VIP Member — `/vip`
- Benefits, member prices vs regular prices, plans and duration, FAQ.
- Sign-up flow creates a Member account (Regular or VIP, with expiry) via the same approval process.
- **[Open]** How is VIP purchased and renewed?

### 6.5 Be an Investor — `/investor`
- Why invest, current projects, expected structure, contact. Enquiry form (name, contact, interest, amount range, message). Leads go to the admin panel.

### 6.6 EMI System — `/emi`
- Explains how to pay for a tour package in instalments using a credit card.
- EMI calculator: choose a package (or enter an amount), pick a tenure, see monthly payment and total cost.
- List of participating banks and cards, terms, and a "Pay with EMI" flow through the payment gateway.
- **[Open]** Gateway, banks, tenures (3/6/12 months?), who bears interest and fees.

### 6.7 Customized Trip — `/custom-trip`
- Two paths: **Domestic** and **International**.
- Each lists ready-made packages plus a "Build my trip" enquiry form: destination, dates, travellers, budget (with currency), interests, hotel level, transport, notes.
- Package detail page: itinerary, inclusions and exclusions, price per person, enquiry and EMI buttons.

### 6.8 Hotel / Resort Booking — `/hotels`
- Search by place, dates and guests (reuses the hero search card).
- Listing with photos, location, price per night, amenities.
- **Enquiry only:** detail page has an "Send booking enquiry" form. No online payment.

### 6.9 Houseboat Booking — `/houseboats`
- Same pattern as hotels: listing, detail, enquiry form (dates, guests, cabins, day or overnight).

### 6.10 Contact Us — `/contact`
- Phone, WhatsApp, email, address and map, social links, contact form.

### 6.11 Other's Project — `/projects`
- Showcase of other projects: card grid with image, name, short description, link.
- **[Open]** What exactly belongs here, and do cards link to external sites?

### 6.12 Booking Conditions — `/booking-conditions`
- Terms for booking, enquiries, cancellation, refunds, EMI and VIP. Linked from the footer and from every enquiry form.

### 6.13 Footer (every page)
- Developed By [ ] (**[Open]** name), About Us, Contact Us, Booking Conditions. Optionally social links and a short tagline.

---

## 7. Public Sign-in and Registration

- The header "Sign in" button leads to the shared login page used by Hosts, Agents and Members (section 8.4).
- Visitors can enquire without an account.
- Members create an account through VIP sign-up or are added by an admin.

---

## 8. Admin Panel — Individual Login System (`/admin`)

Users: **Our Hosts / Agents / Members**, plus an **Admin** who manages everything. Each user logs in individually and sees only their own data.

### 8.1 Roles and permissions

| Role | Can do |
|------|--------|
| **Host** | Runs trips and events · sees own assigned events · creates guest bookings |
| **Agent** | Sells tours · creates guest bookings · sees own sales and commission |
| **Member** | Sees own bookings and history · gets VIP offers and member prices · manages own profile |
| **Admin** **[Proposed]** | Approves accounts, adds and edits all users, events, trips, listings, enquiries, commissions and currency rates |

Permissions are enforced on the server for every request, not just by hiding menu items.

### 8.2 Add new user — information to collect

**Account**
- Account Type: Host / Agent / Member
- Full Name
- Username (unique)
- Email Address (unique)
- Mobile / WhatsApp (unique)
- Temporary Password (auto-generated)
- Profile Photo

**Personal and role details**
- Blood Group · Date of Birth
- NID Number
- Present Address
- Emergency Contact
- Agent only: Commission % · bKash / Nagad number
- Member only: Regular / VIP · Expiry
- Status: Active / Inactive

Validation: username, email and mobile must be unique; mobile validated as a Bangladesh number (with international numbers allowed for foreign members **[Proposed]**); NID format checked; passwords stored as secure hashes; NID and personal data visible only to the admin and the owner.

### 8.3 Dashboards **[Proposed]**

| Role | Screens |
|------|---------|
| Host | My events (assigned), event detail and guest list, create guest booking, profile |
| Agent | My sales, create guest booking, commission summary and statement, profile |
| Member | My bookings and history, VIP offers and member prices, profile |
| Admin | Users (list, add, edit, approve, deactivate), events, trips, hotels and houseboats, enquiries, bookings, commissions and payouts, currency rates, site content |

### 8.4 Login system

1. **Mobile / Email + Password** — either identifier works.
2. **OTP Verification** — sent to mobile (SMS) or email on first login, on mobile/email change, and optionally on every login.
3. **Forgot Password Reset** — reset link or OTP, then a new password.
4. **Admin Approval First** — a new account is created as *Pending*. It cannot log in until an admin approves it.

Account lifecycle: **Created (temporary password) → Pending approval → Approved → first login with OTP → forced password change → Active** (or **Inactive** / rejected).

Security: hashed passwords, rate-limited login and OTP attempts with lockout, OTP expiry (e.g. 5 minutes), secure session cookies, audit log of admin actions.

---

## 9. Data Model **[Proposed]**

| Table | Key fields |
|-------|-----------|
| `users` | id, account_type (host / agent / member / admin), full_name, username, email, mobile, password_hash, must_change_password, photo_url, blood_group, date_of_birth, nid_number, present_address, emergency_contact, status (active / inactive), approval_status (pending / approved / rejected), created_at |
| `agent_profiles` | user_id, commission_percent, bkash_number, nagad_number |
| `member_profiles` | user_id, tier (regular / vip), expires_at |
| `otps` | id, user_id, channel, code_hash, expires_at, attempts, used_at |
| `events` | id, title, slug, description, location, starts_on, ends_on, host_id, base_price_bdt, seats, status, images |
| `trips` | id, title, slug, scope (domestic / international), destination, duration, itinerary, inclusions, base_price_bdt, images |
| `hotels` | id, name, type (hotel / resort), place, amenities, base_price_bdt, images |
| `houseboats` | id, name, place, cabins, capacity, base_price_bdt, images |
| `enquiries` | id, type (hotel / houseboat / custom_trip / investor / contact), payload, contact info, status, assigned_to, created_at |
| `bookings` | id, product_type, product_id, guest details, created_by (host / agent / member), amount, currency, status |
| `commissions` | id, agent_id, booking_id, percent, amount_bdt, status (due / paid) |
| `emi_plans` | id, bank, tenure_months, interest_percent, min_amount |
| `emi_payments` | id, booking_id, plan_id, gateway_ref, status |
| `currency_rates` | currency, rate_to_bdt, updated_at |
| `projects` | id, name, description, image, url |
| `audit_log` | id, actor_id, action, target, created_at |

---

## 10. Content Needed From The Team

- Logo files and brand colours (the sitemap and admin images use a navy and gold palette; the current site uses dark with amber accents — confirm which to follow).
- Photos for events, destinations, hotels, resorts and houseboats.
- About Us text, team photos, contact details, social links.
- Booking Conditions, cancellation and refund policy, EMI terms.
- VIP plans, benefits and pricing; investor information.
- Initial list of events, packages, hotels and houseboats with prices.
- Name for "Developed By [ ]".

---

## 11. Delivery Plan **[Proposed]**

Rough effort assumes one developer; adjust as the team grows.

| Phase | Scope | Output | Estimate |
|-------|-------|--------|----------|
| 0. Foundation | Shared layout, header with dropdowns and hamburger, footer, design tokens, `PriceTag` and currency switcher, base components, database and deploy setup | Site shell on every page | 1 week |
| 1. Static content pages | About Us, Contact Us (with form), Booking Conditions, Other's Project, Be a VIP Member, Be an Investor (with enquiry form) | Core informational pages and lead capture | 1 week |
| 2. Events | Events landing, Previous / Ongoing / Upcoming, event detail, filters | Working events section fed by the database | 1–1.5 weeks |
| 3. Trips | Customized Trip, Domestic and International, package detail, "Build my trip" enquiry | Trip browsing and enquiry flow | 1–1.5 weeks |
| 4. Hotels and houseboats | Listings, detail pages, enquiry forms, search card wired in | Enquiry-only booking flows | 1–1.5 weeks |
| 5. Auth and admin core | Database users, login (password), OTP, forgot password, admin approval, admin add-new-user form, role-based layout | Individual logins work end to end | 2 weeks |
| 6. Role dashboards | Host, Agent, Member dashboards, guest booking creation, commission tracking, enquiry management, content management in admin | Full admin panel | 2–3 weeks |
| 7. EMI System | EMI page, calculator, gateway integration, payment records | Credit card instalments live | 1–2 weeks (depends on gateway approval) |
| 8. Smart features | Date based and place based recommendations, "You may also like" | Recommendations on Home, Events, Trips | 1 week |
| 9. Polish and launch | SEO, performance, accessibility, QA on real phones, analytics, domain, launch checklist | Production release at thetourbees.com | 1 week |

Phases 1 to 4 can run partly in parallel with 5 once the shell is done. Phase 7 should start the gateway application early because approval can take time.

---

## 12. Testing and Quality

- Test every page at phone, tablet and desktop widths.
- Test the login flows: wrong password, locked account, expired OTP, pending account, inactive account, password reset.
- Check that each role can only see its own data (try opening other users' URLs).
- Check currency display and rounding in all four currencies.
- Test enquiry forms: validation, spam protection, email delivery, admin visibility.
- EMI: test in the gateway sandbox before going live.

---

## 13. Risks

| Risk | Mitigation |
|------|-----------|
| SMS OTP delivery or cost in Bangladesh | Pick a local provider early; keep email OTP as a fallback. |
| EMI gateway approval takes long | Apply during phase 0 or 1; build the EMI page and calculator first. |
| Sensitive personal data (NID, blood group, address) | Restrict access by role, encrypt at rest where possible, keep an audit log, collect only what is needed. |
| Content not ready (photos, text, prices) | Build with placeholders; track the content checklist in section 10. |
| Scope creep from open questions | Close section 14 before building the affected phase. |
| Exchange rates going stale | Daily rate update and a visible "rates as of" date in admin. |

---

## 14. Open Questions

- **EMI System:** which payment gateway and banks/cards, which tenures (3/6/12 months?), and who bears interest or fees?
- Who is credited in **Developed By [ ]**?
- Is **EU** pricing in euros (EUR)?
- What does **Other's Project** show, and should it link to external sites?
- How is a member's **VIP** status purchased and renewed, and what does it cost?
- Should there also be a separate **Admin** (super user) account? I assumed yes.
- Brand colours: the plan images use navy and gold; the built hero uses dark with amber. Which should the site follow?
- `admin-login-requirements.md` is referenced in the plan images but is not in this repo. Is it available?
- Is a Bengali (বাংলা) version of the site needed?
