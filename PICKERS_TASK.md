# Task: themed date picker + themed dropdown (approved design)

The design was approved by the owner from a preview. Implement it faithfully:

## Design spec (from the approved preview)
- Accent: var(--amber) (#f5a623 family, hover #ffb840), text #1c1c1e, rounded corners ~10-14px, soft shadow on popovers.
- Date field: looks like the site's normal form input, right side has a small amber calendar icon; value displayed friendly, e.g. "25 Nov 2026" (underlying value stays YYYY-MM-DD).
- Calendar popover: month title centred with prev/next month buttons in soft muted square buttons; weekday header Mo-Su muted small; day cells rounded 8px; SELECTED day = solid amber fill, dark text, bold; days before the min date muted/faded; footer row with "Clear" (muted, left) and "Today" (amber, bold, right).
- Dropdown: field looks like a normal input with a chevron; open list is a rounded card with soft shadow; selected option has a light amber background tint (rgba(245,166,35,.16)), bold text and an amber check mark on the right; other options plain rows with hover tint.

## Part 1: components/DatePicker.js (client component)
- Replaces every native <input type="date">: app/Hero.js (check-in/check-out), components/admin/EventForm.js (startsOn, endsOn), components/admin/AddUserForm.js (dateOfBirth, expiresAt). Search the repo for any other type="date" and convert those too.
- Keep each call site's existing data flow EXACTLY (forms read values by field name / inputProps pattern; Hero reads its two values for search). Use a hidden input with the field name/value if a form relies on FormData by name — verify per call site.
- min/max via props: past days disabled ONLY in Hero (booking/search); admin forms (date of birth!) must allow past dates.
- Hero range: check-out cannot be before check-in; moving check-in past check-out clears/adjusts check-out predictably.
- Opens on click, closes on outside click and Escape; keyboard accessible (Tab/Enter/Escape at minimum, visible focus); aria dialog/grid attributes. Mobile friendly. No new npm dependencies. Styles in app/globals.css in a clearly marked .datepicker section, reusing existing variables/classes where possible.

## Part 2: components/Select.js (client component) — themed dropdown
- Replaces native <select className="form__input"> in the FILTER bars: components/EventFilters.js (place, sort), components/StayFilters.js, components/TripFilters.js — inspect each; convert every filter-bar select. These filters submit as a GET form read from searchParams: the component must keep submitting the same field names/values (hidden input pattern is fine).
- Also check other user-facing (non-admin) selects elsewhere in app/ and components/ and convert them too; leave admin selects alone unless trivially safe.
- Behaviour: opens on click, closes on outside click/Escape, arrow-key navigation nice-to-have, aria listbox/option roles, selected option shown per the design spec above.

## Verify
- npm run build passes.
- Grep: no type="date" remains in app/ or components/; no native <select> remains in the three filter components.
- Write PICKERS_RESULT.md summarising component APIs, call sites changed, anything left open.
- Commit on top of current HEAD with a clear message. Do NOT push (no valid token on this VM).
