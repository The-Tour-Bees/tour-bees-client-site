# Task: Admin CRUD for Trips, Hotels and Houseboats

The admin panel already manages Events end to end. Mirror that implementation EXACTLY for Trips, Hotels and Houseboats. Study these first and copy their patterns (auth, layout, styling, error handling):
- app/admin/events/page.js, app/admin/events/new/page.js, app/admin/events/[id]/edit/page.js
- app/api/admin/events/route.js, app/api/admin/events/[id]/route.js
- components/admin/EventForm.js
- lib/event-input.js (validation schema pattern), lib/auth/api.js (begin/handleError/json), lib/auth/guard.js (apiUser)
- lib/admin-data.js (see how events are fetched for admin lists — extend the same way if it has per-entity helpers)
- Admin sidebar: components/admin/AdminSidebar.js — add Trips, Hotels, Houseboats links in the same style/section as Events.
- Reuse components/Select.js and components/DatePicker.js for any dropdown/date fields, like EventForm does. Do not introduce new UI libraries or new styling systems.

## Build for EACH of Trip, Hotel, Houseboat
1. Admin list page: app/admin/trips/page.js, app/admin/hotels/page.js, app/admin/houseboats/page.js — table/cards like the events list: title/name, slug, place/destination, price (BDT), published status, sort order, edit link, delete button WITH a browser confirm() before deleting.
2. New page + edit page: app/admin/trips/new/page.js, app/admin/trips/[id]/edit/page.js (same for hotels, houseboats), all rendering ONE shared form component per entity: components/admin/TripForm.js, HotelForm.js, HouseboatForm.js.
3. API routes: app/api/admin/trips/route.js (POST), app/api/admin/trips/[id]/route.js (PATCH/PUT + DELETE as the events [id] route does), same for hotels and houseboats. Admin-only via apiUser(["admin"]), same begin/handleError/json helpers, duplicate slug -> 409 with field error on slug, exactly like events.
4. Validation: add lib/trip-input.js, lib/hotel-input.js, lib/houseboat-input.js following lib/event-input.js's schema style (check how eventSchema is consumed by begin()).

## Fields (from models/Trip.js, Hotel.js, Houseboat.js — cover ALL of these)
Trip: slug, scope (select: domestic/international), title, summary, description (textarea), destination, durationDays (number), basePriceBdt (number), images (one URL per line textarea — first line is the cover; this is the image URL field), tags (comma-separated), inclusions (one per line), exclusions (one per line), itinerary (keep simple: one entry per line as "Title | text"), published (checkbox), sortOrder (number).
Hotel: slug, name, type (select: hotel/resort), place, stars (number 1-5, optional), summary, description, basePriceBdt, amenities (one per line), images (one URL per line), tags (comma-separated), published, sortOrder.
Houseboat: slug, name, place, summary, description, cabins (number, optional), capacity (number, optional), dayTrip (checkbox), basePriceBdt, amenities (one per line), images (one URL per line), tags (comma-separated), published, sortOrder.

Do NOT change the Mongoose models. Do NOT touch Phase 7 / EMI anything. Do NOT add a currency-rates screen (no rates model exists).

## Finish
- Run npm run build; it MUST pass. Fix errors until it does.
- Write a short summary of files created/changed + build result to ADMIN_CRUD_RESULT.md.
- git add -A and commit with message: Admin CRUD for trips, hotels and houseboats mirroring the events admin
