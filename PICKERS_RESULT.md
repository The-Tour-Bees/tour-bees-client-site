# Pickers result

**Status: implemented, but `npm run build` was NOT run.** The sandbox refused to run it ("This command requires approval"), so nothing here is build-verified and nothing is committed. Run `npm run build`, then commit.

## Components
- `components/DatePicker.js` (client). Props: `name` (renders a hidden input so FormData sees it), `value` + `onChange(value)` (controlled) or `defaultValue` (uncontrolled), `min` / `max` (YYYY-MM-DD; `min="today"` is also accepted), `id`, `className`, `variant` (`"field"` | `"bare"`), `ariaLabel`, `placeholder`, plus `aria-*` passthrough. The value is always YYYY-MM-DD and is displayed as e.g. "25 Nov 2026".
  - Opens on click and closes on outside click, Escape (focus returns to the trigger) or selection.
  - Grid keyboard: arrows, Home/End, PageUp/PageDown.
  - Has `role="dialog"`, `role="grid"`, `aria-selected`, and a visible focus ring. Clear and Today footer. On mobile (640px and under) the popover docks to the bottom of the screen.
- `components/Select.js` (client). Props: `name`, `options` as `[{value,label}]`, `value` + `onChange` or `defaultValue`, `id`, `className`, `ariaLabel`, plus `aria-*` passthrough. A hidden input carries the value, so GET filter forms submit the same names and values as before. Uses combobox/listbox/option roles. Supports arrow keys, Home/End, Enter/Space and Escape.
- Styles are in `app/globals.css` under the `.datepicker` and `.select` sections at the end of the file.

## Call sites changed
- `app/Hero.js`: check-in has `min="today"`. Check-out has `min=checkIn`. Moving check-in past check-out sets check-out to the new check-in date.
- `components/admin/EventForm.js`: `startsOn` and `endsOn`. Past dates are allowed.
- `components/admin/AddUserForm.js`: `dateOfBirth` and `expiresAt`. Past dates are allowed.
- `components/EventFilters.js`, `StayFilters.js` and `TripFilters.js`: every select converted.
- `components/EnquiryForm.js`: the select field type (user-facing).

## Open
- `npm run build` has not been run. A visual check in a browser has not been done either.
- Not converted, left as native selects: `components/CurrencySwitcher.js` (header-styled `.currency` select) and the admin selects (`BookingStatusSelect`, `EnquiryRow`, `BookingForm`, and the selects in `EventForm` and `AddUserForm`).
- Admin forms have no min/max between `startsOn` and `endsOn`. The task did not ask for it.
