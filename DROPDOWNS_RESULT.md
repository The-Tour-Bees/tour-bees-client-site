# Dropdowns result

## Files changed
- components/Select.js: added `rootClassName` prop (wrapper modifier classes).
- components/CurrencySwitcher.js, components/admin/BookingStatusSelect.js, components/admin/EnquiryRow.js: compact themed Select (`.select--compact`, reusing `.currency` / `.table__select` looks).
- components/admin/AddUserForm.js (status, bloodGroup, tier), BookingForm.js (eventId), EventForm.js (hostId): themed Select, same names, defaults and value sets (hidden input keeps FormData/submit behaviour).
- app/globals.css: compact/right-aligned/disabled styles for the shared Select.

## Build
`npm run build` passes.

## Left native
Nothing from the task list. Not browser-tested visually (build and code review only).
