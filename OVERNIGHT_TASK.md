# Overnight task — The Tour Bees client site (autonomous, owner approved)

You are running unattended overnight in /root/tour-bees (Next.js + MongoDB, repo: The-Tour-Bees/tour-bees-client-site, branch main).
The owner approved this run and said: follow the plan, and you are free to add sensible improvements of your own.

## First
- Read master_plan.md in full. It is the source of truth.
- Phases 0-6 are already done (see git log). Phase 7 (EMI) is ON HOLD — do NOT build EMI payments; the /emi page stays as-is / coming soon.
- Run npm install first.

## Main work
1. **Phase 8 — Smart features (rule-based v1, per plan section 5.2):**
   - Recommendation logic (date-based and place-based) in a service module, reusing existing data helpers (MongoDB when configured, data-file fallback like the rest of the site).
   - GET /api/recommendations?from=&to=&place= route handler with validation.
   - Surface recommendations: on Home (a strip/section), on Events and Customized Trip pages, and a 'You may also like' strip on event, trip, hotel and houseboat detail pages.
   - Rank: soonest / availability / matching place+tags first. No ML.
2. **Phase 9 — Polish and launch prep (code parts only):**
   - Per-page SEO: title/description metadata for every public page, Open Graph defaults, app/sitemap (sitemap.xml) and robots.txt covering public routes (exclude /admin and /api).
   - Accessibility pass: labelled form fields, focus states, alt text, keyboard-friendly nav — fix what you find.
   - Performance: use next/image where images are plain <img> and it is safe to swap; keep everything else stable.
   - Analytics: add Vercel Analytics (@vercel/analytics) in the root layout if it installs cleanly; if it causes any build trouble, drop it and note why.
   - QA: npm run build must pass. Fix build errors you introduce. Note any pre-existing issues you find but do not rewrite unrelated code.
3. **Your own improvements (owner explicitly allowed):** if you see small, high-value, low-risk improvements that fit the plan (e.g. better empty states, 404 page, loading states, README run instructions, a launch checklist file), do them and say what and why in the result file. Stay inside the plan's spirit. Do NOT decide the section-14 open questions on your own (brand colours, Developed By name, VIP pricing, Bengali version) — leave those.

## Rules
- Commit after Phase 8 and after Phase 9 (and per own-improvement if substantial), with clear messages matching the repo style ('Add phase 8: ...').
- Push to origin main. A GitHub token is in /root/.github_token — you may configure the remote with it locally to push, but NEVER print the token in any output, log, commit or file.
- The build must pass without MONGODB_URI set (fallbacks must keep working).
- Do not commit .env files or secrets.
- If a step fails 3 times, move on and record it; do not stop the whole run.

## Deliverable
Write /root/tour-bees/OVERNIGHT_RESULT.md at the end: what was built per phase, your own improvements and why, build result, commits made, whether push succeeded, anything blocked or left for the owner (incl. the section-14 open questions still open).
Also update master_plan.md section 2 (Current State) to reflect phases 8 and 9 being done, in the same commit as Phase 9.
