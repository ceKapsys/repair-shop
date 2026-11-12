# Build plan — 911 Mobile Repair Shop

Source plan: "Device Repair Shop Website — Build Plan" (Nov 12, 2026). Eight weeks, one full-stack
developer; booking-ready site live after week 5.

**v1 scope:** public site with booking + single-owner admin. **Not in v1:** online payment, customer
login, live technician tracking, multi-branch, non-English.

## Progress

### Week 0 — Research and setup
- [x] Repo scaffolded: Next.js 15, TypeScript, Tailwind v4, ESLint, Prettier
- [x] Dependencies: Mongoose, Zod, Auth.js v5, Motion, RHF, Resend, Upstash, Lucide
- [x] `.env.example` with every integration's variables
- [ ] Competitor scan (5–8 local + 2 national) → battlecard with 3 positioning gaps
- [ ] Customer research (5–8 calls + top 20 booking messages) → top 5 questions, channel split, trust signals
- [ ] Keyword list
- [ ] Vercel project, Atlas cluster, Resend domain (SPF/DKIM/DMARC), Cloudinary
- [ ] Apply for Google Business Profile API access
- **Gate:** owner approves positioning, keyword list and sitemap

### Week 1 — Design system
- [x] Colour, type, radius, shadow and motion tokens as CSS variables (light + dark)
- [x] Fonts via `next/font` (Inter body, Plus Jakarta Sans headings)
- [x] Button primitive with press/hover motion; brand-colour override from settings
- [ ] shadcn/ui components (inputs, dialog, drawer, toast, table, tabs)
- [ ] Mockups: home, service, device, booking
- **Gate:** owner signs off home and booking screens

### Week 2 — Data and admin foundation
- [x] All 11 Mongoose models + shared `seo` sub-schema, indexes, booking-number counter
- [x] Auth.js credentials login, bcrypt, lockout after 5 failures, middleware on `/admin/*`, `requireRole()`
- [x] Admin shell: sidebar (desktop), bottom tab bar (mobile), role-filtered nav
- [x] Seed script (settings + owner)
- [ ] TOTP 2FA for owner
- [ ] Settings editor (logo, contacts, hours, areas, slots, emergency schedule, alert emails)
- [ ] Shared SEO tab component
- [ ] Users admin

### Week 3 — Catalogue
- [ ] Services, categories, brands, devices admin
- [ ] Public service and device pages, price toggle, JSON-LD, DB-driven sitemap

### Week 4 — Booking
- [ ] Standard (4-step) and emergency flows, slots and capacity
- [ ] Server Action: Zod + Turnstile + rate limit → save → Resend alerts → success page
- [ ] Bookings admin, GA4 events
- [x] Floating WhatsApp/Call buttons with page-aware message and click tracking hooks

### Week 5 — Soft launch
- [x] Route skeleton for home, contact, service area, legal pages
- [ ] Content for those pages; CSP header; Lighthouse ≥ 90; accessibility pass
- **Gate:** 3 test bookings end to end with the owner

### Week 6 — Content features
- [ ] Blog (Tiptap, scheduling), gallery (before/after), Google review sync

### Week 7 — SEO and polish
- [ ] Launch pages + 6 posts, redirects manager, SEO health table, motion polish, Playwright tests, Search Console
- **Gate:** full launch

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
