# 911 Mobile Repair Shop

Public website + single-owner admin panel for a door-to-door and emergency device repair shop.
Customers find a repair, see the price and book a visit in under a minute; the owner manages every
word, price and photo from `/admin`.

**Stack:** Next.js 15 (App Router, Server Actions) · TypeScript · MongoDB Atlas + Mongoose · Zod ·
Auth.js v5 · Tailwind CSS v4 · Motion · Resend · Cloudinary · Turnstile + Upstash rate limiting · Vercel.

See [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md) for scope, phases and progress.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in MONGODB_URI and AUTH_SECRET at minimum
pnpm seed                    # creates the settings doc (+ owner if OWNER_EMAIL/OWNER_PASSWORD set)
pnpm dev
```

For a local database: `docker run -d --name mongo -p 27017:27017 mongo:8` and
`MONGODB_URI=mongodb://localhost:27017/repairshop`.

The public site builds and runs without a database — it falls back to the placeholder defaults in
`src/lib/site.ts`. The admin panel needs `MONGODB_URI` and `AUTH_SECRET`.

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm seed` | Upsert settings and owner account |

To run a production build next to `pnpm dev` without the two overwriting each other, build into
another folder: `NEXT_DIST_DIR=.next-test pnpm build && NEXT_DIST_DIR=.next-test pnpm start -p 3100`.

## Layout

```
src/
  app/
    (site)/          public pages — header, footer, floating WhatsApp/Call buttons
    admin/login      sign-in
    admin/(panel)/   authenticated admin (sidebar on desktop, bottom tabs on mobile)
    api/auth/        Auth.js handlers
    sitemap.ts, robots.ts
  auth.ts            Credentials provider, lockout after 5 failures, requireRole()
  auth.config.ts     edge-safe config used by middleware (guards /admin/*)
  components/        site/, admin/, ui/
  lib/               db connection, settings loader, SEO metadata, Zod schemas, analytics
  models/            the 11 Mongoose collections + shared seo sub-schema
scripts/seed.ts
```

## Conventions

- **Settings over constants.** Shop name, contacts, hero text, brand colour etc. come from the
  `settings` document via `getSettings()` (cached, tag `settings`). Admin saves call
  `revalidateTag()` so public pages update within seconds.
- **Validation:** one Zod schema per form in `src/lib/validation`, used on client and server.
- **Auth:** call `requireRole()` at the top of every admin Server Action — never rely on hidden UI.
- **Design tokens** are CSS variables in `src/app/globals.css` (colours, radius, shadows, motion
  easings/durations). Don't hard-code colours in components.
- **Motion:** UI motion < 300 ms, transform/opacity only, respect `prefers-reduced-motion`.
