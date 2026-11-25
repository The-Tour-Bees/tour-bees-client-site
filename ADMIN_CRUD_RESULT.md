# Admin CRUD for Trips, Hotels, Houseboats — result

Created (per entity: trips / hotels / houseboats):
- `app/admin/<entity>/page.js` (list with edit link and confirm()-guarded delete), `new/page.js`, `[id]/edit/page.js`
- `components/admin/{Trip,Hotel,Houseboat}Form.js` (shared create/edit form, uses Select), `Delete{Trip,Hotel,Houseboat}Button.js`
- `app/api/admin/<entity>/route.js` (POST) and `[id]/route.js` (PATCH/PUT + DELETE); admin-only via apiUser(["admin"]), begin/handleError/json, duplicate slug -> 409 with slug field error
- `lib/{trip,hotel,houseboat}-input.js` (zod schemas in the style of event-input.js)

Changed: `components/admin/AdminSidebar.js` (Trips, Hotels, Houseboats links after Events).

Notes: the events [id] route has no DELETE, so the DELETE handlers were written new. Models, Phase 7/EMI untouched; no currency-rates screen.

Build: `npm run build` passes.
