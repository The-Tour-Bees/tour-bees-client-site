# Date picker result

**Status: implemented, build-verified (`npm run build` passes), committed.** The calendar styling was aligned to the "Tour Bees Date Picker Design" artifact: month title on the left with both chevron nav buttons grouped on the right (no button background), circular day cells, selected day as an amber filled circle with dark bold text, past/disabled days muted, white popover with 18px radius and soft shadow, hairline footer with Clear (left, grey) and Today (right, amber bold), and the field trigger showing an amber calendar icon on the left with the value in "25 Nov 2026" format. On mobile the popover now sits under the field (capped at 100vw - 24px) instead of docking to the bottom of the screen.

## Component API — components/DatePicker.js (client)

- Props: `name` (renders a hidden input so FormData sees it), `value` + `onChange(value)` (controlled) or `defaultValue` (uncontrolled), `min` / `max` (YYYY-MM-DD; `min="today"` also accepted), `id`, `className`, `variant` (`"field"` | `"bare"`), `ariaLabel`, `placeholder`, plus `aria-*` passthrough.
- Value is always YYYY-MM-DD, displayed as e.g. "25 Nov 2026".
- Opens on click; closes on outside click, Escape (focus returns to the trigger) or selection.
- Grid keyboard: arrows, Home/End, PageUp/PageDown. `role="dialog"` / `role="grid"`, `aria-selected`, visible focus ring. Clear and Today footer actions.
- Styles: `app/globals.css`, `.datepicker` section. No new dependencies.

## Call sites converted (no `type="date"` inputs remain in app/ or components/)

- `app/Hero.js` — check-in (`min="today"`) / check-out (`min=checkIn`); moving check-in past check-out sets check-out to the new check-in. Defaults unchanged (2026-12-05 → 2026-12-14) and the search flow is untouched.
- `components/admin/EventForm.js` — `startsOn`, `endsOn` (past dates allowed).
- `components/admin/AddUserForm.js` — `dateOfBirth`, `expiresAt` (past dates allowed).

## Companion work in the same changeset

`components/Select.js` (themed dropdown, same design artifact) is wired into `components/EventFilters.js`, `StayFilters.js`, `TripFilters.js` and the select field of `components/EnquiryForm.js`, with `.select` styles beside `.datepicker` in globals.css. Left as native selects (out of scope): `CurrencySwitcher` and the admin row/form selects.

## Verified

- `npm run build` passes.
- Production server smoke test: homepage renders 2 date-picker triggers showing "5 Dec 2026" / "14 Dec 2026", zero `type="date"` inputs.
