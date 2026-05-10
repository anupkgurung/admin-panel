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
- `props` must validate against the in-code catalog schema (**`validateSectionProps`**, AJV); DB **`component_definitions.schema`** is kept in sync optionally via **`sync:components`** but is not the runtime source of truth
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

## Phase 10 — Refactor (Complexity Reduction) (2–4 days)
**Outcome**: same product behavior, smaller surface area. The architecture stays "DB-driven UI", but with **code as the source of truth for components**, fewer round-trips per request, simpler mutation plumbing, and shared types instead of duplicated DTOs.

### Decisions locked for this phase
- **In scope now**: items R1, R2, R3, R4 (Option B), R5, R7, R8 below.
- **Deferred (recorded, not implemented now)**: R6 (singleton `site_settings` enforcement), R9 (env validation at boot), R10 (admin draft preview route), R11 (hashed admin password), R12 (caching + tag revalidation).

### R1. Component source-of-truth = code
**Outcome**: a theme's available components are derived from the in-code registry; the DB is no longer asked "which components does this theme allow?".

- Registry stays at [`lib/registry/index.ts`](lib/registry/index.ts) and remains canonical for `themeKey × componentKey → React component`.
- Add a single helper to read allowed component keys from the registry:
  - `getAllowedComponents(themeKey: string): string[]` returning `Object.keys(registry[themeKey] ?? {})`.
- Replace every read of `theme.allowedComponents` (DB JSON column) with this helper:
  - [`lib/admin/activeTheme.ts`](lib/admin/activeTheme.ts)
  - [`lib/admin/publishGuards.ts`](lib/admin/publishGuards.ts) (both `findThemeSectionsViolatingAllowlist` and `findPageSectionsAllowlistViolations`)
  - [`app/api/site/active-theme/route.ts`](app/api/site/active-theme/route.ts)
  - [`app/admin/pages/page.tsx`](app/admin/pages/page.tsx)
  - [`app/api/pages/[pageId]/sections/route.ts`](app/api/pages/[pageId]/sections/route.ts) (the inline `asAllowlist` + theme join)
- Drop the duplicated `asAllowlist()` helper from all four files above.
- Keep the DB column for now (no migration in this phase), but treat it as unused. A follow-up cleanup can drop `themes.allowed_components` once no code reads it.

### R2. Co-locate component schemas with React components
**Outcome**: schema, name, and the React component live together; the seed becomes a sync step, not the source of truth.

- Hero and FAQ JSON schemas live in [`components/themes/_definitions/marketing.ts`](components/themes/_definitions/marketing.ts) with the other marketing section schemas (still exported via [`components/themes/_definitions/index.ts`](components/themes/_definitions/index.ts)). Their React implementations live in [`components/sections/marketing.tsx`](components/sections/marketing.tsx) alongside NavHeader, FeatureGrid, etc.
- Move the inline schemas out of [`prisma/seed.ts`](prisma/seed.ts) and into those files.
- Add a `npm run sync:components` script that upserts `component_definitions` from the in-code definitions:
  - keeps the DB row (so `page_sections.component_definition_id` FK still works)
  - keeps `schema` in DB (so AJV still validates server-side without importing component code into routes that don't need it)
- The seed continues to run components sync first, then site/themes/page seed.

### R3. Collapse `asAllowlist` + `Json` typing dance
**Outcome**: fewer "is this actually a `string[]`?" checks scattered across the codebase.

- Once R1 lands, the only remaining `asAllowlist` consumer is theme bootstrap. Remove the helper from:
  - [`lib/admin/publishGuards.ts`](lib/admin/publishGuards.ts)
  - [`lib/admin/activeTheme.ts`](lib/admin/activeTheme.ts)
  - [`app/api/site/active-theme/route.ts`](app/api/site/active-theme/route.ts)
  - [`app/admin/pages/page.tsx`](app/admin/pages/page.tsx)
- No DB migration in this phase. Switching `themes.allowed_components` to a real Postgres `text[]` is left as a follow-up cleanup.

### R4. Single-query authorization (Option B)
**Outcome**: every page/section route does **one** scoped DB call instead of `loadActivePage` + a second `findUnique`.

- Replace the `load + verify + load` pattern with `findFirst({ where: { id, themeId: activeTheme.id }, include: ... })` (and analogous `update({ where: { id_themeId: ... } })` shapes). A single `null` result covers both not-found and wrong-theme.
- Apply to:
  - [`app/api/pages/[pageId]/route.ts`](app/api/pages/[pageId]/route.ts) — `GET`, `PATCH`
  - [`app/api/pages/[pageId]/sections/route.ts`](app/api/pages/[pageId]/sections/route.ts) — `POST`
  - [`app/api/pages/[pageId]/sections/reorder/route.ts`](app/api/pages/[pageId]/sections/reorder/route.ts) — `POST`
  - [`app/api/pages/[pageId]/publish/route.ts`](app/api/pages/[pageId]/publish/route.ts) — `POST`
  - [`app/api/pages/[pageId]/unpublish/route.ts`](app/api/pages/[pageId]/unpublish/route.ts) — `POST`
  - [`app/api/sections/[sectionId]/route.ts`](app/api/sections/[sectionId]/route.ts) — `PATCH`, `DELETE` (scope by `page.themeId = activeTheme.id` in the `where`)
- Delete [`lib/admin/loadActivePage.ts`](lib/admin/loadActivePage.ts) once no callsites remain.
- Keep the 404-not-403 behavior (do not leak existence of pages/sections owned by non-active themes).

### R5. Server actions for admin mutations
**Outcome**: admin UI calls server actions directly; client-side `fetch('/api/...')`, `formatError`, and ad-hoc HTTP envelopes are removed.

- Create a single admin actions module, e.g. `lib/admin/actions.ts`, with `"use server"` exports:
  - `createPage(input)`, `updatePage(pageId, input)`
  - `addSection(pageId, componentKey)`, `updateSection(sectionId, patch)`, `deleteSection(sectionId)`
  - `reorderSection(pageId, sectionId, direction)` (see R7)
  - `publishPage(pageId)`, `unpublishPage(pageId)`
  - `setActiveTheme(themeKey)`
- Each action runs `requireAdmin()` server-side, performs the single-query write from R4, and ends with `revalidatePath('/admin/pages')` and/or `revalidatePath('/admin/pages/[pageId]')` as appropriate.
- Migrate clients off `fetch()`:
  - [`components/admin/NewPageForm.tsx`](components/admin/NewPageForm.tsx)
  - [`components/admin/PageBuilder.tsx`](components/admin/PageBuilder.tsx) (drop `call()` + `formatError`)
  - [`components/admin/PublishControls.tsx`](components/admin/PublishControls.tsx)
  - [`components/admin/ActiveThemeSwitcher.tsx`](components/admin/ActiveThemeSwitcher.tsx)
- Server actions return a typed result envelope (e.g. `{ ok: true, ... } | { ok: false, code, details? }`) so UI error handling is one shape.
- Decide per-route whether to **keep** the JSON `/api/*` handlers as a thin external API or **delete** them. Default for this phase: keep handlers that route handlers reuse internally, delete ones with no remaining callers (notably `/api/components/*` and `/api/themes`). Re-evaluate at the end of the phase.

### R7. Reorder = one update per move
**Outcome**: moving a section is a single `UPDATE`, not a multi-row transaction.

- Switch `page_sections.order` to a fractional rank (`Decimal` or `Float`/`Numeric`) so a move can compute `newOrder = (prev.order + next.order) / 2`:
  - one Prisma migration on [`prisma/schema.prisma`](prisma/schema.prisma) and [`prisma/migrations/`](prisma/migrations/) changing the column type and preserving existing values (current ints map cleanly).
- Replace the batch reorder endpoint logic in [`app/api/pages/[pageId]/sections/reorder/route.ts`](app/api/pages/[pageId]/sections/reorder/route.ts):
  - input becomes `{ sectionId, beforeId?: string | null, afterId?: string | null }` (or `{ sectionId, direction: -1 | 1 }` and the server resolves neighbors).
  - performs **one** `pageSection.update({ where: { id, page: { themeId: active.id } }, data: { order: midpoint } })`.
- Update the corresponding `moveSection` flow in [`components/admin/PageBuilder.tsx`](components/admin/PageBuilder.tsx) (or, after R5, the `reorderSection` server action) to send a single move instead of a two-row swap.
- Add a lightweight compaction path for the rare case where neighboring `order` values converge below a threshold; not required to ship.
- Render order in [`app/(site)/[[...slug]]/page.tsx`](app/(site)/[[...slug]]/page.tsx) and admin builder remains `orderBy: { order: 'asc' }` — no read-side changes.

### R8. Centralized DTO/types
**Outcome**: one place defines what a `Page`, `Section`, `Theme`, and violation shape look like across server and client.

- Add `lib/types/admin.ts` (or `lib/types/page.ts`) exporting:
  - `PageWithSections = Prisma.PageGetPayload<{ include: { sections: { include: { componentDefinition: true } } } }>`
  - `PageDTO`, `SectionDTO`, `ComponentDef` (UI-facing shapes derived from the Prisma type via small mappers)
  - `ActiveThemeDTO` (already partially exists in [`lib/admin/activeTheme.ts`](lib/admin/activeTheme.ts) — move/rename here)
  - `AllowlistViolation`, `PropsViolation`, `PublishError` (currently re-declared in [`components/admin/PublishControls.tsx`](components/admin/PublishControls.tsx) and [`lib/admin/publishGuards.ts`](lib/admin/publishGuards.ts))
- Consumers to refactor:
  - [`components/admin/PageBuilder.tsx`](components/admin/PageBuilder.tsx) — drop local `ComponentDef`, `SectionDTO`, `PageDTO`, `ActiveTheme`
  - [`components/admin/PublishControls.tsx`](components/admin/PublishControls.tsx) — drop local violation types
  - [`components/admin/ActiveThemeSwitcher.tsx`](components/admin/ActiveThemeSwitcher.tsx) — drop local `Theme`, `Violation`
  - [`app/admin/pages/[pageId]/page.tsx`](app/admin/pages/[pageId]/page.tsx) — use the shared mapper instead of inlining the `PageDTO` shape
  - [`lib/renderer/DynamicRenderer.tsx`](lib/renderer/DynamicRenderer.tsx) — keep `RenderableSection` here (public-render-only) but re-export from `lib/types` if it grows.
- Provide a single mapper, e.g. `toPageDTO(page: PageWithSections): PageDTO`, used by both the admin RSC entry and (after R5) any server action that needs to return a page payload.

### Execution order
1. **R4** single-query inline checks — backend-only, behavior-preserving; unblocks R7 and reduces churn for R5.
2. **R7** one-update reorder — narrow change; easy to verify after R4.
3. **R1 + R3** code-first allowlist + delete duplicated `asAllowlist` — pure refactor, small diff.
4. **R8** centralize DTO/types — done before R5 so server actions return shared types.
5. **R5** migrate admin mutations to server actions — biggest UI change; do last.
6. **R2** co-locate component schemas + `sync:components` script — independent; can land any time after R1.

### Deliverables
- No `loadActivePage` callers remain; helper file removed.
- Page/section mutation routes (and any retained JSON handlers) perform exactly one DB read or write per request for the page-ownership check.
- Admin UI components contain no `fetch('/api/...')` calls; mutations go through server actions in `lib/admin/actions.ts`.
- `page_sections.order` is a fractional rank; reorder endpoint performs a single `UPDATE`.
- A single `lib/types/admin.ts` (or equivalent) is the only place these DTOs are defined.
- **Allowlists**: handlers and guards use **`resolveAllowedKeysForTheme(themeKey, theme.allowedComponents)`** (from [`lib/sections/catalog.ts`](lib/sections/catalog.ts)), intersecting normalized `themes.allowed_components` with known catalog keys. [`getAllowedComponents(themeKey)`](lib/registry/index.ts) remains as a shim that calls **`resolveAllowedKeysForTheme(themeKey, undefined)`** (full catalog keys for registered themes). `asAllowlist()` is gone.
- **Validation + admin picker metadata**: section props validate with **`validateSectionProps` / AJV against in-code JSON Schemas** from [`components/themes/_definitions`](components/themes/_definitions/index.ts); the app does **not** read **`component_definitions.schema`** on write/publish paths. **`toPageDTO` / admin APIs** overlay catalog `name` and `schema` when present so the SchemaForm stays in sync with code. DB rows (`component_definitions` + `component_definition_id` FK) remain for integrity and **`sync:components`** / seeds.

### Refactor verification (regression checks)
Re-run these against the existing behavior — none of the user-visible behavior should change:
- Theme isolation: a page bound to theme A returns 404 (public + admin write APIs) when theme B is active.
- Publish guard: blocks on allowlist violations (theme = page's theme) and on AJV failures, with the same error payload shape consumed by `PublishControls`.
- Theme switch guard: blocks switching to a destination theme whose own pages contain disallowed sections.
- Reorder: rendered order in `app/(site)/[[...slug]]/page.tsx` and the admin builder matches the order chosen in the UI; arbitrary up/down moves remain stable.
- Section CRUD via server actions: add / toggle enabled / edit props / delete behave identically to the previous JSON-fetch flow.
- AJV validation rejects invalid props on both `addSection` and `updateSection` paths.
- Admin authentication is still enforced on every mutating server action (no action runs without `requireAdmin`).

### Out of scope (deferred, recorded for later)
- **R6** Make `site_settings` a true singleton (DB-enforced) and/or replace it with `themes.is_active`.
- **R9** Validate required env (`DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) at module load.
- **R10** Admin draft-preview route at `/admin/preview/[pageId]` that bypasses the published filter.
- **R11** Replace plaintext `ADMIN_PASSWORD` with a hashed credential (`ADMIN_PASSWORD_HASH` + bcrypt/argon2 compare).
- **R12** Tag-based caching with `revalidateTag('page:'+id)` + drop `force-dynamic` from public routes.

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

