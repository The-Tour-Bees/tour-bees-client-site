# Task: custom themed date picker (replace native date inputs)

The site (Next.js App Router, plain JS) currently uses native <input type="date"> which looks different on Windows/Mac/devices. Build ONE reusable custom date picker component matching the site theme and use it everywhere a date is picked.

## Theme
- Accent: var(--amber) (see app/globals.css, .btn--primary uses it, hover #ffb840), dark text #1c1c1e.
- Match existing form styling: look at how other inputs/fields are styled (globals.css form classes, components/admin Field styles) and reuse the same classes/variables so the picker trigger looks like the current inputs.

## Component: components/DatePicker.js (client component)
Requirements:
- Props compatible with current usage: it must work as a controlled/uncontrolled form field giving the parent a YYYY-MM-DD string value (the existing forms read values by field name / inputProps pattern in admin forms, and Hero.js reads its two date values for search). Inspect each call site and keep its data flow working exactly (form submissions and the hero search must behave as before).
- Calendar popover: month grid, prev/next month buttons, today highlighted, selected day in amber, days outside the current month muted or hidden, past days disabled ONLY where the call site is a booking/search context (Hero) — admin forms (date of birth!) must allow past dates. Make min/max configurable via props.
- Range behaviour in Hero.js: check-in and check-out pickers coordinate — check-out cannot be before check-in; selecting a new check-in after check-out adjusts or clears check-out sensibly (keep it simple and predictable).
- Interactions: opens on click/focus, closes on outside click and Escape, keyboard accessible (arrow keys nice-to-have; at minimum Tab/Enter/Escape work and focus is visible), aria attributes for the dialog/grid.
- Display format in the field: friendly format like "25 Nov 2026" while the underlying value stays YYYY-MM-DD.
- Mobile friendly: popover fits small screens.
- No new npm dependencies. Plain React + existing CSS (add styles to app/globals.css with a clear .datepicker section).
- Keep a hidden input with the field name/value if a call site's form relies on FormData by name — verify per call site.

## Call sites to convert
1. app/Hero.js — check-in / check-out (lines ~105, ~112)
2. components/admin/EventForm.js — startsOn, endsOn
3. components/admin/AddUserForm.js — dateOfBirth, expiresAt
Search the repo for any other type="date" inputs and convert those too.

## Verify
- npm run build passes.
- Grep confirms no type="date" inputs remain in app/ and components/.
- Write DATEPICKER_RESULT.md summarising the component API, call sites changed, and anything left open.
- Commit on top of current HEAD with a clear message. Do NOT push (no valid token on this VM).
