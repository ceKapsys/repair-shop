# Audit — existing code vs. build prompt

Audited 2026-11-13 on branch `build/settings-public-booking` (33 modified + ~25 untracked files on top of
`8eacdd9`, none committed). Baseline before any change: `pnpm typecheck` clean, `pnpm lint` clean.
A snapshot of the working tree was taken before the first edit.

## Stack detected

| Layer | Found | Spec | Verdict |
| --- | --- | --- | --- |
| Framework | Next.js 15.5.29 App Router, React 19.1, TypeScript strict, `src/` layout, Turbopack | Next 15 App Router | keep |
| Package manager | pnpm 10 | repo's own | keep |
| DB | Mongoose 9, cached connection (`src/lib/db.ts`), Atlas cluster `dev` with data | Mongoose + Atlas | keep |
| Auth | next-auth 5.0.0-beta.32 credentials, bcryptjs, own TOTP (`src/lib/totp.ts`), roles owner/editor | Auth.js v5 | keep |
| Styling | Tailwind v4, own primitives (cva), **no shadcn/ui** | Tailwind v4 + shadcn/ui | keep own primitives (see conflict 4) |
| Motion | `motion` 14 installed, barely used | `motion` + LazyMotion | extend |
| Rich text | Tiptap 3 (JSON + sanitised HTML) | Tiptap | keep |
| Media | Cloudinary signed uploads | Cloudinary | keep |
| Email | Resend + react-email | same | keep |
| Forms | react-hook-form installed; admin uses an own form kit with shared Zod schemas | RHF + Zod | keep own kit (conflict 5) |
| Spam | Turnstile + Upstash Ratelimit (in-memory fallback) + honeypot | same | keep |
| Tests | **none** (no Vitest, no Playwright) | Vitest + Playwright | build |
| Errors | no Sentry | Sentry | build (optional at runtime) |

## Existing data (Atlas `dev`, read-only check)

services 8 · serviceCategories 6 · brands 5 · devices 12 · posts 2 · postCategories 3 · gallery 4 ·
reviews 5 · pages 13 · bookings 4 · users 2 · settings 1 · redirects 0.
`services.priceType` values in use: `fixed`, `from`, `quote` (no `range`). Settings: currency USD,
timezone America/New_York, `branding.primaryColor` `#0F766E`.

## Conflicts and the choice made

| # | Conflict | Choice |
| --- | --- | --- |
| 1 | Colour tokens are a teal/slate palette named `primary / foreground / muted / border / background`; spec locks Sapphire Nightfall named `primary / ink / ink-soft / steel / mist / bg / surface / line / night …` | Replace values and rename token classes across all components (spec §9.1 says replace). |
| 2 | Fonts are Inter + Plus Jakarta Sans; spec locks Geist + Geist Mono | Replace. Adds `geist` package. |
| 3 | Settings has a **brand-colour control** (`branding.primaryColor`) that re-themes the site; spec: "No brand-colour control" | Remove the control and the override. The stored field is left in the DB untouched (ignored). |
| 4 | No shadcn/ui; the repo has its own Button, Field, Dialog (native `<dialog>`), Switch, Badge, toasts (sonner) | Keep. They meet the spec's behaviour (focus, keyboard, tokens); swapping ~15 working components for shadcn would be a rewrite with no user-visible gain. |
| 5 | Admin forms use an own form kit rather than React Hook Form | Keep. Zod schemas are shared client/server as the spec requires. |
| 6 | Price model is `priceType: fixed/from/range/quote` + `priceMin/priceMax` + `showPrice`; device repairs carry `price` + `showPrice`. Spec: `fixed/from/hidden` + `price`; device repairs carry `priceType` | Non-breaking: `hidden` added to the enum and offered in admin (fixed / from / hidden). Legacy `quote` reads as `hidden`; legacy `range` reads as `from`. `priceMin` stays as the stored price field (no rename). Device repairs gain `priceType` (default derived from `showPrice`). Migration `scripts/migrations/001-price-type.ts` (dry-run default) rewrites `quote → hidden`. |
| 7 | Env names differ: `EMAIL_FROM`, `OWNER_EMAIL/OWNER_PASSWORD`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` vs spec `MAIL_FROM`, `SEED_ADMIN_*`, `NEXT_PUBLIC_GA_ID`, `TURNSTILE_SITE_KEY` | Spec names become canonical in `.env.example`; code reads the spec name first and falls back to the old name so the existing `.env.local` keeps working. Turnstile's site key must reach the browser, so it is passed from the server at render time (no `NEXT_PUBLIC_` needed). |
| 8 | Phone validation is generic international; seed/dev data is US (USD, New York). Spec locks Bangladesh 11-digit validation and copy | Follow the spec for the customer booking phone. Shop contact numbers in Settings stay free-form. |
| 9 | Copy is inline in components and differs from the locked copy deck | Move all public strings to `src/content/copy.ts` and use the locked wording verbatim. |
| 10 | Default hero text in settings differs from the locked home copy; settings stores `hero.title/subtitle` | Locked copy is the default; Settings hero fields stay as optional overrides (`eyebrow?`, `title?`, `sub?` per spec §5). |
| 11 | `seo.metaTitle` max 70 / `metaDescription` max 200 in Mongoose and Zod; spec ≤60 / ≤160 | Leave the storage limits (existing docs may exceed 60/160; tightening would make them unsaveable). The editor counters and SEO health table flag anything over 60/160. |
| 12 | Spec paths `app/globals.css`, `lib/…`, `content/copy.ts`; repo uses `src/` | Keep `src/` (`src/app/globals.css`, `src/content/copy.ts`). |
| 13 | `/admin/dev-login` + a fixed dev password accepted by `authorize()` when `NODE_ENV !== "production"` | Kept (it is gated and useful locally) but flagged: it must never run with a non-production `NODE_ENV` against real data. Listed under "Open risks". |
| 14 | Extra `pages` collection (editable intro/body/SEO for fixed pages) not in the spec | Keep; it is how "static pages embed seo" is met. |
| 15 | Three Python wheel files (`pymongo*.whl`, `dnspython*.whl`) sit untracked in the repo root | Not part of the app. Left alone; safe to delete by hand. |

## Feature inventory

Status: exists / partial / missing / conflicts. Action: keep / extend / refactor / build / replace.

### §4 Routes

| Feature | Status | Where | Action | Notes |
| --- | --- | --- | --- | --- |
| `/` home | partial | `src/app/(site)/page.tsx` | refactor | Has hero, popular services, brand picker, FAQ. Missing trust strip, how-it-works, emergency band, gallery, blog teasers, final CTA; copy and layout not per spec. |
| `/services`, `/services/[slug]` | exists | `src/app/(site)/services/**` | extend | Align copy, fact row, price wording, tokens. |
| `/devices`, `/devices/[brand]`, `/devices/[brand]/[model]` | exists | `src/app/(site)/devices/**` | extend | Align copy, empty state. |
| `/emergency` | exists | `src/app/(site)/emergency/page.tsx` | extend | Locked copy, closed copy with next opening. |
| `/book`, `/book/success` | exists | `src/app/(site)/book/**`, `components/site/booking-form.tsx` | extend | See §6. |
| `/blog`, `/blog/[slug]`, `/blog/category/[slug]` | missing | stubs | build | Data layer exists. |
| `/gallery` | missing | stub | build | |
| `/reviews` | missing | stub | build | `reviews-section.tsx` exists for home. |
| `/about`, `/contact`, `/service-area`, `/privacy`, `/terms` | missing | stubs | build | `pages` docs exist in DB. |
| `/sitemap.xml`, `/robots.txt` | exists | `src/app/sitemap.ts`, `robots.ts` | extend | Add post categories; `lastModified` for static pages. |
| Floating WhatsApp + Call, sticky Book button | exists | `contact-fab.tsx`, `header.tsx` | refactor | WhatsApp button uses a raw hex; messages not page-aware per copy deck. |
| Admin routes (login, dashboard, bookings, services, categories, devices, settings, users) | exists | `src/app/admin/**` | keep | |
| Admin blog, gallery, reviews, seo | missing | stubs | build | |

### §5 Data model

| Feature | Status | Where | Action | Notes |
| --- | --- | --- | --- | --- |
| `services` | conflicts | `models/Service.ts` | extend | Price model, conflict 6. Indexes present. |
| `serviceCategories`, `brands`, `postCategories` | exists | `models/*` | keep | |
| `devices` | partial | `models/Device.ts` | extend | Add `repairs[].priceType`. |
| `bookings` | exists | `models/Booking.ts` | keep | `whatsapp` instead of `whatsappOptIn` (kept); snapshot labels are an addition. |
| `posts`, `gallery`, `reviews`, `redirects`, `users` | exists | `models/*` | keep | |
| `settings` singleton | partial | `models/Settings.ts`, `lib/settings.ts` | extend | Add `hero.eyebrow`; drop brand colour from the app (conflict 3). |
| Shared `seo` sub-document | exists | `models/_shared.ts` | keep | Conflict 11. |
| `scripts/seed.ts` | exists | `scripts/seed.ts` | extend | Idempotent already; align env names and price types. |
| Migrations folder with dry-run | missing | — | build | `scripts/migrations/`. |

### §6 Booking

| Feature | Status | Where | Action | Notes |
| --- | --- | --- | --- | --- |
| Standard 4-step flow, prefill, custom device | exists | `booking-form.tsx` | extend | Locked copy, progress labels, sessionStorage persistence, direction-aware motion. |
| Photos (≤3, signed upload) | exists | `lib/upload-client.ts`, `api/upload/sign` | extend | Enforce 8 MB with locked message. |
| Slots, lead time, capacity | exists | `lib/availability.ts` | keep | Check-then-insert race documented in BUILD_PLAN. |
| Area list + outside-area copy | partial | `booking-form.tsx` | extend | |
| Phone validation (BD 11 digits) | conflicts | `lib/validation/booking.ts` | replace | Conflict 8. |
| Emergency flow open/closed | exists | `emergency/page.tsx`, `availability.ts` | extend | Locked copy. |
| Server Action: Zod → Turnstile → rate limit → save → emails | exists | `book/actions.ts`, `lib/booking.ts` | extend | Subjects per copy deck; record email failures for the dashboard warning. |
| Email-failure dashboard warning | missing | — | build | |
| GA4 events | partial | `lib/analytics.ts` | extend | Events defined; GA script loader to verify. |
| Success page with booking no. + WhatsApp | exists | `book/success/page.tsx` | extend | Locked copy, check-mark draw. |

### §7 Admin

| Feature | Status | Where | Action | Notes |
| --- | --- | --- | --- | --- |
| Layout (sidebar / mobile tab bar) | exists | `components/admin/shell.tsx` | extend | Mobile tabs should be Bookings, Services, Devices, Blog, More. |
| Dashboard | partial | `admin/(panel)/page.tsx` | extend | Missing 7-day chart, new reviews, pages-missing-SEO count, email-failure warning. |
| Bookings | exists | `admin/(panel)/bookings/**` | keep | Detail is a page rather than a drawer (kept; deep-linkable from emails). |
| Services, Categories, Devices | exists | `admin/(panel)/{services,categories,devices}/**` | extend | Price type options (conflict 6). |
| Blog, Gallery, Reviews, SEO | missing | stubs | build | Generic save/delete/reorder actions and Zod schemas already exist. |
| Settings | conflicts | `settings/settings-editor.tsx` | refactor | Remove brand colour (conflict 3). |
| Users, Account (2FA) | exists | `users/**`, `account/**` | keep | |
| Autosave, unsaved guard, undo delete, confirm, skeletons, blur errors | exists | `components/admin/form.tsx`, `delete-button.tsx` | keep | |
| Role checks inside every action | exists | `admin/(panel)/actions.ts` (`requireRole`) | keep | |

### §8 SEO

| Feature | Status | Where | Action | Notes |
| --- | --- | --- | --- | --- |
| `<SeoFields>` component | exists | `components/admin/seo-panel.tsx`, `lib/seo-score.ts` | keep | |
| `generateMetadata()` with fallbacks | exists | `lib/seo.ts` | extend | Default service title/description templates per spec. |
| JSON-LD | partial | `components/site/json-ld.tsx` + pages | extend | Add `BlogPosting`. |
| Sitemap / robots | exists | — | extend | |
| Redirects in middleware | missing | `middleware.ts` guards `/admin` only | build | Slug-change redirects are already written to the collection. |
| OG images via `next/og` | missing | — | build | |
| Redirects manager, SEO health table | missing | — | build | |

### §9–11 Design, copy, motion

| Feature | Status | Where | Action | Notes |
| --- | --- | --- | --- | --- |
| Colour tokens | conflicts | `globals.css` | replace | Conflict 1. |
| Lint rule against raw colours | missing | `eslint.config.mjs` | build | |
| Typography | conflicts | `layout.tsx`, `globals.css` | replace | Conflict 2. |
| Dark mode with manual toggle | partial | `globals.css` (media query only) | extend | Add `.dark` class + footer toggle. |
| Header / mobile menu / footer | partial | `components/site/*` | refactor | No mobile menu; header lacks Contact; footer not Night. |
| Before/after slider, lightbox | missing | — | build | |
| `content/copy.ts` | missing | — | build | Conflict 9. |
| Motion tokens | exists | `globals.css` | extend | Add `lib/motion.ts`, LazyMotion, reveal/stagger, booking step slide. |
| Accessibility basics | partial | — | extend | Skip link, focus ring present; axe run to add. |

### §12–13 Integrations, security, quality

| Feature | Status | Where | Action | Notes |
| --- | --- | --- | --- | --- |
| Google Business OAuth + sync + Places fallback + cron | missing | settings fields only | build | |
| Email templates | exists | `src/emails/*` | extend | Copy deck wording. |
| Maps embed | missing | — | build | With contact/service-area pages. |
| GA4 + Search Console | partial | `layout.tsx` verification tag | extend | |
| bcrypt, TOTP, lockout, rate limit | exists | `auth.ts`, `lib/totp.ts` | keep | |
| AES-256-GCM for secrets | exists | `lib/crypto.ts` | keep | |
| Security headers | partial | `next.config.ts` | extend | CSP missing. |
| Mongo operator-injection guard | partial | `String()` casts, Zod ids | extend | Set `sanitizeFilter` + `strictQuery` globally. |
| Auto-delete cancelled bookings (cron) | missing | — | build | |
| Vitest unit tests | missing | — | build | |
| Playwright E2E + axe | missing | — | build | Needs a disposable database to run; see "Open risks". |
| Sentry | missing | — | build | No-op without `SENTRY_DSN`. |

## New dependencies

| Package | Why |
| --- | --- |
| `geist` | Locked fonts (Geist, Geist Mono) via `next/font`. |
| `vitest` (dev) | Unit tests required by §13. |
| `@playwright/test`, `@axe-core/playwright` (dev) | E2E + accessibility checks required by §13. |
| `mongodb-memory-server` (dev) | Disposable database so tests never touch Atlas. |

## Phase plan

1. **Foundation alignment** — tokens, fonts, colour lint, `copy.ts`, env names, price-type alignment, migration, mongoose guards.
2. **Admin alignment** — remove brand colour, price options, mobile tabs, dashboard gaps.
3. **Catalogue alignment** — locked copy and price wording on service/device pages, metadata defaults.
4. **Booking alignment** — BD phone, locked copy, persistence, email subjects, failure warning, success page.
5. **Home + static pages** — home sections, header/mobile menu/footer with theme toggle, contact, service area, about, legal, CSP.
6. **Blog, gallery, reviews** — admin + public, Google sync, cron.
7. **SEO + polish + tests** — redirects middleware and manager, SEO health, OG images, motion, Vitest, Playwright, README.

## Open risks

- Nothing on this branch is committed. Commit before deploying so the work has history.
- `/admin/dev-login` (conflict 13).
- Real email delivery, Cloudinary uploads, Turnstile and Google OAuth need live keys to verify.
- Slot capacity is check-then-insert (two simultaneous submissions can share the last place).

## Changelog

### 2026-11-13 — Phase 0 + phase 1 (in progress)

- Audit written. No blocking questions.
- Tokens replaced with Sapphire Nightfall in `src/app/globals.css`; Tailwind's default palette and shadows removed, so only token classes exist. Token classes renamed across all components. Light/dark via `.dark` / `.light` class with system fallback (footer toggle still to build).
- Fonts switched to Geist + Geist Mono (`geist` package added).
- ESLint rule added that fails on raw hex / rgb / default-palette classes in `src/**` (emails exempt). Stylelint not added: `globals.css` is the only CSS file and is the token file.
- Brand-colour control removed from Settings (conflict 3). `contacts.whatsappMessage` setting removed: WhatsApp prefills are locked, page-aware copy.
- `src/content/copy.ts` created with the full locked copy deck. Only the site layout uses it so far.
- Price model aligned to fixed / from / hidden with legacy read support (conflict 6); admin editors updated; `verbPhrase` field added to services for the locked lead sentence.
- Env names aligned with fallbacks (conflict 7); `.env.example` rewritten.
- `scripts/seed.ts` replaced: the old one overwrote settings and passwords on each run, hard-coded passwords and inserted demo bookings and reviews. The new one only inserts missing records and takes the owner from env.
- Migrations added, dry-run only so far (not applied): `001-price-type`, `002-legacy-demo-copy`.
- `sanitizeFilter` not set globally: it would wrap the app's own `$in` / `$ne` filters. Inputs are Zod-validated to primitives before they reach a filter.
- Checks: `pnpm typecheck` clean. `pnpm lint` fails with 7 raw-colour errors, all in `src/app/(site)/page.tsx` (home page, due for its rewrite in phase 5). Build, tests not run yet.
