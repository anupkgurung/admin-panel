# Phase-wise implementation plan (Next.js App Router + Prisma + Postgres)

This breaks the MVP into phases that keep you shipping something usable early, while building on a stable foundation (no overengineering).

## Locked decisions (this MVP)
- **Single-site MVP**: no `sites` table for now; we keep a singleton `SiteSettings` row that points at the **active theme**.
- **Per-theme page scope**: every `Page` belongs to exactly one `Theme` via `pages.theme_id`. The active theme acts as a filter — only pages of the active theme are visible publicly and in admin. Switching themes hides the previous theme's pages without deleting them; reactivating brings them back.
- **Slug uniqueness is per-theme**: `(theme_id, slug)` is unique. `modern` and `minimal` can each own their own `/`.
- **Allowlist source-of-truth**: every allowlist check reads from **`page.theme.allowedComponents`** (or, for the theme-switch guard, the destination theme's own `allowedComponents`). The active theme is only used for visibility filtering and auto-attaching newly-created pages.
- **Theme switch rule**: when admin changes the active theme, **block the switch** if any sections of the destination theme's own pages use components not in that theme's `allowed_components`. (Sections of other themes' pages are not validated because they won't render under the new active theme.)
- **Per-page publish rule**: block publish if any section's component is not in the page's theme's `allowedComponents`, or any section's `props` fail AJV validation.
- **UI**: Tailwind CSS (no component library yet).
- **Auth**: NextAuth/Auth.js, single admin (credentials), protect `/admin/*` and admin write APIs.
- **Public access**: public site is read-only and viewable by anyone; only logged-in admin can edit.

## Future-use suggestions (not in MVP, recorded for later)
- **Multi-tenant `sites` table**: introduce when supporting multiple websites/customers.
- **Cross-theme editing**: allow admin to browse/edit pages of any theme without switching the active site theme.
- **Auto-disable on theme switch**: alternative rule to "block switch" (we chose block switch).

## Guiding principles
- **One repo, one deploy**: public site + admin + APIs in a single Next.js app.
- **DB is the source of truth**: pages/sections/themes/components come from Postgres.
- **Validate on write**: never let invalid `props` reach the DB.
- **Ship thin vertical slices**: public rendering first (read path), then admin editing (write path), then auth/publish hardening.

## Phase 0 — Project scaffold + decisions (0.5–1 day)
**Outcome**: a runnable Next.js App Router project wired to Postgres via Prisma, with environment setup and conventions.

- **Create Next.js app** with App Router.
- **Add Prisma** + Postgres connection:
  - `DATABASE_URL` in `.env`
  - `lib/db.ts` exports a singleton Prisma client
- **UI**: Tailwind installed and wired up (`globals.css`).
- **Auth**: NextAuth/Auth.js installed; configured fully in Phase 6.

Deliverables:
- running dev server
- Prisma client generation works
- a health page/route confirms DB connectivity (server-side)

## Phase 1 — Database + seed catalog (1 day)
**Outcome**: DDL/Prisma models exist, you can seed themes + components + a sample page.

Implement the MVP schema:
- `themes` (with required `allowed_components`)
- `site_settings` (singleton; `active_theme_id` → `themes.id`)
- `component_definitions`
- `pages` (FK `theme_id` → `themes.id`; `(theme_id, slug)` unique)
- `page_sections`
- `assets` (keep it; minimal columns)

Add seed data:
- Theme `modern` (active) and theme `minimal` tokens
- Component definitions `hero`, `faq` with schemas
- `SiteSettings` singleton with `active_theme_id` = `modern`
- A `Home` page bound to `modern` (status `published`) with 2 sections (hero + faq)

Deliverables:
- migrations applied
- seed script that creates deterministic sample content

## Phase 2 — Public read path: render a page from DB (vertical slice) (1–2 days)
**Outcome**: public route renders `/` dynamically from DB data.

Implement:
- **Public route** (server component):
  - `app/(site)/[[...slug]]/page.tsx` (or your preferred pattern)
  - query: page by `slug`, join `theme`, load ordered sections, join component key
- **Component registry**:
  - `ComponentRegistry[themeKey][componentKey] -> ReactComponent`
  - build `UnknownSection` fallback
- **Theme tokens plumbing**:
  - pass tokens through context/provider or as props
  - components use tokens (at least colors/spacing) to prove theming works

Deliverables:
- visiting `/` renders the seeded hero + faq
- disabled sections are skipped
- unknown components don’t crash the page

## Phase 3 — Minimal “catalog” APIs (read-only) (0.5–1 day)
**Outcome**: the admin can discover themes/components and fetch schemas.

Route handlers:
- `GET /api/themes`
- `GET /api/components`
- `GET /api/components/:key/schema`

Notes:
- These can be public or admin-only; simplest is admin-only once auth exists.

Deliverables:
- JSON endpoints return catalog data used by the admin UI

## Phase 4 — Admin builder (no auth yet): edit props + reorder + enable/disable (2–4 days)
**Outcome**: you can update a draft page and see the changes in public rendering (after publish in later phase).

Admin routes:
- `/admin/pages` list pages
- `/admin/pages/[pageId]` builder UI

Admin features:
- list current sections (ordered)
- add section (from theme allowlist)
- remove section
- toggle enabled
- reorder sections (simple up/down buttons first; drag/drop later)
- edit section props via schema-driven form

Schema-driven form:
- MVP options:
  - **Fastest**: use `@rjsf/core` to render JSON Schema forms
  - **More control**: implement a small mapper for the subset of JSON Schema you need (string/number/boolean/object/array/enum)

Deliverables:
- editing a section’s props persists to DB and re-renders on next page request
- reorder persists and affects render order

## Phase 5 — Write APIs + server validation + theme allowlist enforcement (1–2 days)
**Outcome**: all writes are validated and safe; admin cannot save invalid props or disallowed components.

Implement write route handlers:
- `POST /api/pages` create draft page
- `PATCH /api/pages/:pageId` update title/slug/theme
- `POST /api/pages/:pageId/sections` add section
- `PATCH /api/sections/:sectionId` update props/enabled/order
- `POST /api/pages/:pageId/sections/reorder` batch reorder

Validation rules (server-side, mandatory):
- `component_definition_id` must exist
- component key must be **allowed** by page’s theme (`themes.allowed_components`)
- `props` must validate against `component_definitions.schema` (AJV)
- apply schema defaults if desired (AJV `useDefaults`)

Deliverables:
- invalid payloads return clear 400 errors
- DB never stores invalid props

## Phase 6 — Auth & authorization (required before production) (1–2 days)
**Outcome**: admin is protected; APIs are not writable publicly.

Implement:
- protect `/admin/*` routes (middleware or server checks)
- protect all admin write APIs
- minimal roles:
  - `admin`: full access
  - `editor`: can edit content but not manage themes/components (optional)

Deliverables:
- unauthenticated users cannot access admin or write APIs
- authenticated users can edit as expected

## Phase 7 — Draft → publish workflow + active theme switch (0.5–1 day)
**Outcome**: safe publishing; public site only shows published pages of the active theme; admin can switch the active theme with a guard scoped to that theme's own pages.

Implement:
- `POST /api/pages/:pageId/publish` sets:
  - `status='published'`
  - `published_at=now()`
- `POST /api/pages/:pageId/unpublish`
- Public read query filters `status='published'` AND `theme_id = active_theme_id`
- **Active site theme API**:
  - `GET /api/site/active-theme` returns current active theme.
  - `PATCH /api/site/active-theme` body `{ themeKey }` to switch.
- **Theme-switch publish guard**:
  - When activating theme T, scan only sections on pages owned by T; if any uses a component not in T's `allowed_components`, **block the switch** and return a clear error listing the offending sections.
- **Per-page publish guard**:
  - Block publish if any section on the page uses a component not in **the page's theme's** `allowed_components` (not the active theme — see "Allowlist source-of-truth" in Locked decisions).
  - Block publish if any section's props fail AJV validation.
- **Active-theme scoping for admin/write APIs**:
  - All page-by-id endpoints (`GET/PATCH /api/pages/:pageId`, `POST /api/pages/:pageId/sections`, `POST /api/pages/:pageId/sections/reorder`, publish/unpublish, and `/api/sections/:sectionId`) return 404 if the resolved page belongs to a non-active theme. This prevents cross-theme writes and avoids leaking IDs across themes.

Deliverables:
- editing drafts doesn't affect public until publish
- admin can switch active theme from the admin UI; switches that would break the destination theme's own content are blocked with a precise error
- pages created under one theme do not appear (publicly or in admin) when another theme is active

## Phase 8 — Caching strategy (keep simple) + operational hardening (0.5–1 day)
**Outcome**: deployed site reflects changes reliably.

MVP:
- keep public pages **dynamic** (no static caching)

Later (optional, still simple):
- add tag-based revalidation on publish/update:
  - revalidate `page:<id>` or `slug:/pricing`

Operational hardening:
- rate-limit write endpoints (basic)
- audit logs (optional)

## Phase 9 — UX polish (optional, time-boxed) (1–3 days)
**Outcome**: admin feels like a real product.

- drag/drop ordering
- nicer form widgets (color picker, image picker from `assets`)
- section previews
- empty states + error messaging

## Final testing plan (run before launch)

### A) Data + validation tests (backend/API)
- **Schema validation**:
  - saving invalid `props` is rejected (400) with clear errors
  - saving unknown additional props is rejected if schema has `additionalProperties:false`
- **Theme allowlist (page.theme is source-of-truth)**:
  - cannot add a section whose component is not in **the page's theme's** `allowed_components`
  - cannot change a section’s `component_definition_id` to a disallowed component
- **Per-theme page scope**:
  - creating a page auto-attaches it to the active theme
  - `(theme_id, slug)` is the uniqueness key — same slug allowed under different themes
  - page-by-id endpoints return 404 for pages owned by a non-active theme
  - section-by-id endpoints return 404 for sections whose page is owned by a non-active theme
- **Ordering invariants**:
  - reorder endpoint results in deterministic render order
  - no duplicate `instance_key` per page

### B) Rendering tests (public)
- **Happy path**: `/` renders hero + faq from DB (only when the page's theme is the active theme)
- **Theme isolation**: a page bound to theme A is 404 when theme B is active
- **Disabled sections**: a disabled section does not render
- **Unknown component**: renders `UnknownSection` and does not crash
- **Published-only**: draft pages return 404 (or a controlled "not found")

### C) Admin workflow tests (end-to-end)
- **Login required**:
  - unauthenticated cannot access `/admin`
  - unauthenticated cannot call write APIs
- **Edit + publish**:
  - edit hero headline → save → (draft shows in admin)
  - publish → public route reflects changes
- **Reorder**:
  - reorder sections → save → public render order matches
- **Theme switch (per-theme isolation)**:
  - active = modern → create `/promo`, publish → visible at `/promo`
  - switch active → minimal → `/promo` returns 404; admin pages list does not include `/promo`
  - switch active back → modern → `/promo` reappears
  - reduce `modern.allowed_components` to exclude `hero` while a `modern` page still uses `hero` → reactivating `modern` is **blocked** with violations listing only `modern` pages

### D) Smoke tests in production-like environment
- seed minimal content and verify rendering
- verify env vars (`DATABASE_URL`, auth secrets)
- verify DB migrations apply cleanly
- basic load test: render a page repeatedly (ensure no memory leak / DB pool issues)

### Tooling suggestions (keep minimal)
- **API tests**: Vitest + supertest-style fetch to route handlers (or just integration tests hitting `next dev`/`next start`)
- **E2E**: Playwright for admin flows (login, edit, publish, verify public)

