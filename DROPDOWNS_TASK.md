# Task: theme the remaining native selects (Tour Bees)

Public filter selects are already themed via components/Select.js (commit f576871).
Remaining native <select> elements to convert to the same themed design/language
as components/Select.js and components/DatePicker.js (amber theme, same popover
behaviour, no native OS dropdown list):

1. components/CurrencySwitcher.js — header currency switcher (keep it compact).
2. Admin selects:
   - components/admin/BookingStatusSelect.js
   - components/admin/AddUserForm.js (status, bloodGroup, tier)
   - components/admin/EnquiryRow.js (status)
   - components/admin/BookingForm.js (eventId)
   - components/admin/EventForm.js (hostId)

Rules:
- Reuse/extend the existing Select component where practical; preserve every
  field name, value set, default value and onChange/save behaviour exactly.
- Admin table selects must stay compact and usable inside table rows.
- Do NOT change any API routes, data shapes or unrelated styling.
- Run npm run build; it must pass.
- Commit locally with a clear message. Do NOT push (token is dead; publishing
  is handled separately).
- Write DROPDOWNS_RESULT.md: files changed, build result, anything left native and why.
