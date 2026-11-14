# Build plan — 911 Mobile Repair Shop

Source plan: "Device Repair Shop Website — Build Plan" (Nov 12, 2026). Eight weeks, one full-stack
developer; booking-ready site live after week 5.

**v1 scope:** public site with booking + single-owner admin. **Not in v1:** online payment, customer
login, live technician tracking, multi-branch, non-English.

## Progress

Legend: [x] done and verified · [~] backend/library done, UI or wiring still to do · [ ] not started

### Week 0 — Research and setup
- [x] Repo scaffolded: Next.js 15, TypeScript, Tailwind v4, ESLint, Prettier
- [x] Dependencies installed (Mongoose, Zod, Auth.js v5, Motion, Tiptap, dnd-kit, sonner, react-email, Resend, Upstash)
- [x] `.env.example` with every integration's variables
- [ ] Competitor scan, customer research, keyword list
- [ ] Vercel project, Atlas cluster, Resend domain, Cloudinary, Google Business Profile API application

### Week 1 — Design system
- [x] Colour, type, radius, shadow and motion tokens (light + dark); brand-colour override from settings
- [x] Primitives: Button, Field, Switch, Badge, Card, Skeleton, Modal/Drawer (native `<dialog>`), ConfirmDialog, toasts (sonner)
- [ ] Mockups / sign-off for home, service, device, booking

### Week 2 — Data and admin foundation
- [x] 12 Mongoose models (11 from the plan + `pages` for editable fixed pages), shared `seo` sub-schema, booking-number counter
- [x] Auth.js login, bcrypt, lockout after 5 failures, per-IP rate limit, middleware on `/admin/*`, `requireRole()`
- [x] TOTP 2FA at login (RFC 6238, `src/lib/totp.ts`) and enrolment under Account (QR + manual key, confirm with a code before it is stored; owner can switch it off for a user)
- [x] Admin shell (sidebar / mobile tab bar), skeleton loading state, toasts
- [x] Admin form kit (`src/components/admin/form.tsx`): shared Zod validation on blur + save, inline errors, unsaved-changes guard, Ctrl/Cmd+S, autosave hook
- [x] Shared SEO tab: focus/secondary keywords, title/description counters + pixel warning, OG, canonical, noindex, Google snippet preview (desktop/mobile), checklist score
- [x] Image upload: signed Cloudinary uploads, client-side compression, drag-and-drop, required alt text, URL paste fallback
- [x] Rich-text editor (Tiptap): headings, lists, quote, callout, tables, images, links, internal-link picker
- [x] Generic save/delete/undo/reorder/toggle server actions with slug-change 301 redirects (`app/admin/(panel)/actions.ts`)
- [x] Settings editor (owner only): shop, hero, branding, contacts, socials, opening hours, service areas, booking windows/capacity/notice/closed days, emergency fee and per-weekday hours, alert emails, customer email toggles, analytics, FAQs
- [x] Users admin (owner only): add/edit/delete, Owner/Editor roles, password reset (also unlocks), last-owner and self-delete guards
- [x] Account page: change password, set up / turn off 2FA
- [x] Role checks re-read the user from the database on every admin action, so role changes and deleted users take effect immediately

### Week 3 — Catalogue
- [x] Services admin: drag-to-reorder list, live/price toggles, editor (price type, show-price, duration, warranty, parts, emergency, devices, FAQs, images, rich text, SEO, card preview)
- [x] Categories admin (service + blog categories, with SEO)
- [x] Devices admin: brand → model tree, brand reorder, bulk add models, model editor with per-model repair price matrix + show-price per row, specs, SEO
- [x] Public data layer (`src/lib/data.ts`, cached + tag-revalidated)
- [x] Public pages: services index (grouped by category), service detail (price box, warranty, parts, models, FAQs, related), devices index (by type), brand, model (per-model price list, specs)
- [x] JSON-LD: LocalBusiness (hours, areas, rating), Service + Offer, OfferCatalog per model, FAQPage, BreadcrumbList
- [x] DB-driven sitemap (services, brands, models, posts; skips noindex)
- [x] Home: popular services, brand picker, FAQ

### Week 4 — Booking
- [x] Booking Zod schemas, slot availability + capacity (`src/lib/availability.ts`), emergency open/closed per weekday, Turnstile verify, rate limit, email templates (admin alert, customer confirmation, status update)
- [x] Booking UI: standard (device → problem → time → details) and emergency (device → problem → details), prefill from `?device=` / `?service=`, live estimate, “not listed” device, “not sure” problem, optional photos and location, honeypot + Turnstile, success page
- [x] Submit Server Action (`src/lib/booking.ts`): re-checks area, catalogue, slot capacity and emergency hours on the server; emails sent after the response with `after()`
- [x] Bookings admin: status tabs, search, type/area/date filters, emergencies pinned, one-tap call/WhatsApp, quick status change, detail page (status, quote, notes, history, optional customer email)
- [x] CSV export (respects filters, formula-injection safe)
- [x] Dashboard: emergency queue, today, next 7 days, counts, services missing a meta description
- [x] Floating WhatsApp/Call buttons with GA4 event hooks

### Week 5 — Soft launch
- [x] Route skeleton for every public page; security headers; robots
- [ ] Page content, CSP, Lighthouse, accessibility pass

### Week 6 — Content features
- [ ] Blog admin + public, gallery admin + public, reviews (Google OAuth sync, Places fallback, cron)

### Week 7 — SEO and polish
- [ ] SEO admin (defaults, redirects UI, health table), pages editor, motion polish, Playwright tests

## Verified so far
Against a local MongoDB 8: seed → owner login → create service → appears in list → create brand. `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.

Nov 12 (settings, public catalogue, booking), against a throwaway local MongoDB 6 and a production build:
model page shows per-model price → Book prefills device + repair → estimate sums two repairs → full slot
becomes unavailable (capacity 1) → booking saved with number, labels, estimate, source → admin alert and
customer confirmation emails queued → emergency request with an unlisted device → dashboard shows emergency
queue and upcoming visit → detail page: status + quote + note saved, customer emailed → quick status change
keeps the quote → CSV export → Settings save updates the public site → editor created, blocked from
Settings → 2FA enrolled with a real TOTP code → no horizontal scroll at 375 px.

Not yet tested: real email delivery (no Resend key), Cloudinary photo uploads, Turnstile widget, 2FA sign-in prompt after enrolment.

Known limits: slot capacity is check-then-insert, so two people submitting the last place in the same
second can both get it.

## Decisions (closed)

| Topic | Decision |
| --- | --- |
| Device types | Phones, laptops/PCs, tablets, consoles, smartwatches, audio |
| Emergency | Hours and response time per weekday in admin; outside hours offer next slot |
| Pricing | Per service and per device repair: fixed, "from", range or hidden |
| Warranty/parts | Per service (warranty days + parts note) |
| Booking alerts | Email list in admin; emergencies by email too |
| Google reviews | Business Profile via OAuth; Places API fallback |
| Language | English only |
| Shop name | **911 Mobile Repair Shop** |
| Areas, domain, logo, colours, photos | Placeholders; owner fills in admin Settings before launch |
