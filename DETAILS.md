# Details: DDL relationships, dummy data, render query, column descriptions

This document explains how the MVP PostgreSQL DDL maps to the runtime + admin behavior of the schema-driven CMS/page-builder.

## How the DDL relates (tables + relationships)

### `themes`
**What it represents**: a “theme” (like a WordPress theme / Shopify theme) that defines global styling via design tokens.

- **Relationship**: `themes (1) → pages (many)` via `pages.theme_id`.
- **Why it’s relational**: pages must be bound to a theme; theme selection should be indexed and enforced.
- **Why `tokens` is JSONB**: design tokens evolve (new scales, new tokens) without needing schema migrations.
- **Optional**: `allowed_components` can be a simple JSON allowlist (`["hero","faq"]`) for MVP. If you don’t need theme restrictions yet, omit it.

### `component_definitions`
**What it represents**: the global catalog of available section components (Hero, FAQ, Gallery, …) and their schemas.

- **Relationship**: `component_definitions (1) → page_sections (many)` via FK `page_sections.component_definition_id`.
- **Why it exists**:
  - schema-driven admin form generation
  - server-side validation source of truth
  - shared definition used across many pages and themes (component reuse across themes is natural)

### `pages`
**What it represents**: a routable page (slug + title) with publishing state, bound to a theme.

- **Relationship**:
  - `pages.theme_id → themes.id`
  - `pages (1) → page_sections (many)` via `page_sections.page_id`
- **Why it’s relational**: easy lookup by slug, draft/publish flags, and safe deletes.

### `page_sections`
**What it represents**: one “section instance” on a page.

- **Structure is relational**:
  - ordering (`"order"`)
  - enable/disable (`enabled`)
  - identity (`instance_key`)
  - parent page (`page_id`)
  - component type (`component_definition_id`)
- **Props are JSONB**:
  - flexible per component
  - validated against the component schema on write

### `assets` (optional)
**What it represents**: uploaded or external media used by section props.

- If you don’t need uploads yet, store URLs directly in `page_sections.props` and omit this table.

## Why this is NOT “one giant JSON blob”
- A page is not stored as a single `pages.content jsonb`.
- Instead, **each section is a row** (`page_sections`) so you can:
  - reorder via `"order"`
  - enable/disable per section
  - update one section without rewriting the entire page
  - query “which pages use component X?”

## Dummy dataset (FK-based, consistent with the DDL)

Below is a complete, realistic “Home page” dataset: theme + two components + one page + two sections.

```sql
-- Theme
insert into themes (id, key, name, tokens, allowed_components)
values (
  '11111111-1111-1111-1111-111111111111',
  'modern',
  'Modern',
  '{
    "colors": { "primary": "#2F6BFF", "text": "#111827", "bg": "#FFFFFF" },
    "radius": { "sm": 8, "md": 12 },
    "spacing": { "sectionY": 64 }
  }'::jsonb,
  '["hero","faq"]'::jsonb
);

-- Component schemas (simplified)
insert into component_definitions (id, key, name, schema)
values
(
  '22222222-2222-2222-2222-222222222222',
  'hero',
  'Hero',
  '{
    "type":"object",
    "additionalProperties": false,
    "required":["headline","cta"],
    "properties":{
      "variant":{"type":"string","enum":["centered","split"],"default":"centered"},
      "headline":{"type":"string","minLength":1,"maxLength":80},
      "subheadline":{"type":"string","maxLength":180},
      "cta":{
        "type":"object",
        "additionalProperties": false,
        "required":["label","href"],
        "properties":{
          "label":{"type":"string","minLength":1,"maxLength":30},
          "href":{"type":"string","minLength":1},
          "style":{"type":"string","enum":["primary","secondary"],"default":"primary"}
        }
      }
    }
  }'::jsonb
),
(
  '33333333-3333-3333-3333-333333333333',
  'faq',
  'FAQ',
  '{
    "type":"object",
    "additionalProperties": false,
    "required":["items"],
    "properties":{
      "title":{"type":"string","default":"FAQs","maxLength":60},
      "items":{
        "type":"array",
        "minItems":1,
        "maxItems":20,
        "items":{
          "type":"object",
          "additionalProperties": false,
          "required":["question","answer"],
          "properties":{
            "question":{"type":"string","minLength":1,"maxLength":120},
            "answer":{"type":"string","minLength":1,"maxLength":400}
          }
        }
      }
    }
  }'::jsonb
);

-- Page (homepage)
insert into pages (id, theme_id, slug, title, status, published_at)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '/',
  'Home',
  'published',
  now()
);

-- Page sections (composition)
insert into page_sections
  (id, page_id, component_definition_id, "order", enabled, instance_key, props)
values
(
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  10,
  true,
  'hero_main',
  '{
    "variant":"split",
    "headline":"Build landing pages in minutes",
    "subheadline":"Schema-driven sections with theme tokens.",
    "cta":{"label":"Get started","href":"/signup","style":"primary"}
  }'::jsonb
),
(
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  40,
  true,
  'faq_general',
  '{
    "title":"Common questions",
    "items":[
      {"question":"Do you store HTML?","answer":"No. We store structure + props and render React."},
      {"question":"Can I reorder sections?","answer":"Yes. Reordering updates the order column."}
    ]
  }'::jsonb
);
```

## What a page render query looks like (SQL shape)

When `app/(site)/.../page.tsx` renders `/`, you typically need:
- page row
- its theme tokens
- ordered sections
- each section’s component key (for the frontend component registry)

```sql
select
  p.id as page_id,
  p.slug,
  p.title,
  p.status,
  t.key as theme_key,
  t.tokens as theme_tokens,
  s.id as section_id,
  s.instance_key,
  s.enabled,
  s."order",
  s.props,
  cd.key as component_key,
  cd.name as component_name
from pages p
join themes t on t.id = p.theme_id
join page_sections s on s.page_id = p.id
join component_definitions cd on cd.id = s.component_definition_id
where p.slug = '/'
order by s."order" asc;
```

In the app layer, you typically reshape that into:
- `{ page: { theme: { key, tokens }, sections: [{ componentKey, props, ... }] } }`

## Column-by-column description

### `themes`
- **`id`**: primary key UUID.
- **`key`**: stable theme identifier used in code/config (`modern`, `minimal`).
- **`name`**: human-readable name shown in admin.
- **`tokens`**: JSONB design tokens used by the renderer/components (colors/spacing/typography/etc.).
- **`allowed_components`** *(optional)*: JSON array of component keys allowed in this theme; MVP-simple allowlist.
- **`created_at`, `updated_at`**: timestamps.

### `component_definitions`
- **`id`**: primary key UUID.
- **`key`**: stable component identifier (`hero`, `faq`, `pricing`).
- **`name`**: label shown in admin component picker.
- **`schema`**: JSONB schema (usually JSON Schema) for form generation + server validation.
- **`created_at`, `updated_at`**: timestamps.

### `pages`
- **`id`**: primary key UUID.
- **`theme_id`**: FK to `themes.id` (page belongs to a theme).
- **`slug`**: URL path (`/`, `/about`, `/pricing`).
- **`title`**: page title for admin/SEO usage.
- **`status`**: `draft` or `published` (controls public visibility).
- **`published_at`**: when it went live (nullable).
- **`created_at`, `updated_at`**: timestamps.

### `page_sections`
- **`id`**: primary key UUID.
- **`page_id`**: FK to `pages.id` (section belongs to a page). `on delete cascade` removes sections when a page is deleted.
- **`component_definition_id`**: FK to `component_definitions.id` (which component to render).
- **`order`**: integer sort order for rendering and drag/drop.
- **`enabled`**: boolean toggle; disabled sections are not rendered publicly.
- **`instance_key`**: stable per-page unique string (`hero_main`, `faq_1`) used for identity and safe updates.
- **`props`**: JSONB props/config for that section instance, validated against the component schema.
- **`created_at`, `updated_at`**: timestamps.

### `assets` *(optional)*
- **`id`**: primary key UUID.
- **`provider`**: where the asset lives (`external`, `s3`, `cloudinary`, etc.).
- **`url`**: canonical URL to the asset.
- **`metadata`**: JSONB (width/height/mime/size/etc.).
- **`created_at`**: timestamp.

## Practical notes (MVP)
- **Theme reuse**: the same `component_definitions` row can be used by multiple themes. Theme restrictions (if needed) are handled by `themes.allowed_components` in MVP, or a `theme_components` join table later.\n+- **Validation**: enforce that `page_sections.props` matches `component_definitions.schema` on every create/update.\n+- **Caching**: for “edits reflect on deployed site”, keep public routes dynamic or use tag-based revalidation later.
