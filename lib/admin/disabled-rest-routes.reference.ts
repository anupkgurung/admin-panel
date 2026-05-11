/**
 * Archived duplicate REST route handlers (mirrored `lib/admin/actions.ts` and RSC reads).
 *
 * Removed from `app/api/**` — Next.js requires `route.ts` to export real handlers; a file that is
 * only comments is not a valid module and breaks `next build`.
 *
 * Use Server Actions in `lib/admin/actions.ts`, `getActiveTheme()`, and admin RSC + Prisma instead.
 */

export {};

/*
================================================================================
app/api/pages/route.ts
================================================================================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const activeTheme = await getActiveTheme();

  const pages = await prisma.page.findMany({
    where: { themeId: activeTheme.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      _count: { select: { sections: true } },
    },
  });

  return NextResponse.json({
    pages: pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      status: p.status,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
      sectionsCount: p._count.sections,
    })),
  });
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { slug, title } = (body ?? {}) as { slug?: string; title?: string };

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { error: "slug_required", field: "slug" },
      { status: 400 },
    );
  }

  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "title_required", field: "title" },
      { status: 400 },
    );
  }

  const activeTheme = await getActiveTheme();

  const existing = await prisma.page.findUnique({
    where: { themeId_slug: { themeId: activeTheme.id, slug } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "slug_already_exists", slug },
      { status: 409 },
    );
  }

  const page = await prisma.page.create({
    data: { slug, title, themeId: activeTheme.id },
    select: { id: true, slug: true, title: true, status: true },
  });

  return NextResponse.json({ page }, { status: 201 });
}

================================================================================
app/api/pages/[pageId]/route.ts
================================================================================
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const activeTheme = await getActiveTheme();

  const page = await prisma.page.findFirst({
    where: { id: params.pageId, themeId: activeTheme.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          componentDefinition: {
            select: { id: true, key: true, name: true, schema: true },
          },
        },
      },
    },
  });

  if (!page) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    page: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      status: page.status,
      publishedAt: page.publishedAt,
      sections: page.sections.map((s) => ({
        id: s.id,
        order: s.order,
        enabled: s.enabled,
        instanceKey: s.instanceKey,
        props: s.props,
        component: {
          id: s.componentDefinition.id,
          key: s.componentDefinition.key,
          name: s.componentDefinition.name,
          schema: s.componentDefinition.schema,
        },
      })),
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { slug, title } = (body ?? {}) as { slug?: string; title?: string };

  const data: { slug?: string; title?: string } = {};
  if (typeof slug === "string" && slug.length > 0) data.slug = slug;
  if (typeof title === "string" && title.length > 0) data.title = title;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no_fields_to_update" }, { status: 400 });
  }

  const activeTheme = await getActiveTheme();

  const page = await prisma.page.findFirst({
    where: { id: params.pageId, themeId: activeTheme.id },
    select: { id: true, themeId: true },
  });
  if (!page) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }

  if (data.slug) {
    const existing = await prisma.page.findFirst({
      where: {
        slug: data.slug,
        themeId: page.themeId,
        NOT: { id: params.pageId },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "slug_already_exists", slug: data.slug },
        { status: 409 },
      );
    }
  }

  const updated = await prisma.page.update({
    where: { id: params.pageId },
    data,
    select: { id: true, slug: true, title: true, status: true },
  });
  return NextResponse.json({ page: updated });
}

================================================================================
app/api/pages/[pageId]/sections/route.ts
================================================================================
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { getAllowedComponents } from "@/lib/registry";
import { validateProps } from "@/lib/validation/validateProps";

export const dynamic = "force-dynamic";

function makeInstanceKey(componentKey: string): string {
  const suffix = randomBytes(3).toString("hex");
  return `${componentKey}_${suffix}`;
}

export async function POST(
  req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { componentKey, props } = (body ?? {}) as {
    componentKey?: string;
    props?: Record<string, unknown>;
  };

  if (!componentKey || typeof componentKey !== "string") {
    return NextResponse.json(
      { error: "component_key_required" },
      { status: 400 },
    );
  }

  const activeTheme = await getActiveTheme();

  const page = await prisma.page.findFirst({
    where: { id: params.pageId, themeId: activeTheme.id },
    include: { theme: { select: { key: true } } },
  });
  if (!page) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }

  const allowed = getAllowedComponents(page.theme.key);
  if (!allowed.includes(componentKey)) {
    return NextResponse.json(
      {
        error: "component_not_allowed_by_theme",
        componentKey,
        themeKey: page.theme.key,
        allowedComponents: allowed,
      },
      { status: 400 },
    );
  }

  const component = await prisma.componentDefinition.findUnique({
    where: { key: componentKey },
  });
  if (!component) {
    return NextResponse.json(
      { error: "component_not_found", componentKey },
      { status: 404 },
    );
  }

  let propsToStore: object = {};
  if (props && typeof props === "object" && Object.keys(props).length > 0) {
    const result = validateProps(component.schema as object, props);
    if (!result.valid) {
      return NextResponse.json(
        { error: "validation_failed", errors: result.errors },
        { status: 400 },
      );
    }
    propsToStore = result.data as object;
  }

  const last = await prisma.pageSection.findFirst({
    where: { pageId: params.pageId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 10;

  let instanceKey = makeInstanceKey(componentKey);
  for (let attempt = 0; attempt < 3; attempt++) {
    const collision = await prisma.pageSection.findUnique({
      where: {
        pageId_instanceKey: { pageId: params.pageId, instanceKey },
      },
      select: { id: true },
    });
    if (!collision) break;
    instanceKey = makeInstanceKey(componentKey);
  }

  const created = await prisma.pageSection.create({
    data: {
      pageId: params.pageId,
      componentDefinitionId: component.id,
      order: nextOrder,
      enabled: true,
      instanceKey,
      props: propsToStore,
    },
  });

  return NextResponse.json({ section: created }, { status: 201 });
}

================================================================================
app/api/pages/[pageId]/sections/reorder/route.ts
================================================================================
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { computeReorderTargetOrder } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { sectionId, direction } = (body ?? {}) as {
    sectionId?: string;
    direction?: number;
  };

  if (!sectionId || typeof sectionId !== "string") {
    return NextResponse.json(
      { error: "section_id_required" },
      { status: 400 },
    );
  }

  if (direction !== -1 && direction !== 1) {
    return NextResponse.json(
      { error: "invalid_direction" },
      { status: 400 },
    );
  }

  const activeTheme = await getActiveTheme();

  const section = await prisma.pageSection.findFirst({
    where: {
      id: sectionId,
      pageId: params.pageId,
      page: { themeId: activeTheme.id },
    },
    select: { id: true, order: true },
  });
  if (!section) {
    return NextResponse.json(
      { error: "section_not_found_for_page" },
      { status: 404 },
    );
  }

  const target = await computeReorderTargetOrder({
    pageId: params.pageId,
    currentOrder: section.order,
    direction: direction as -1 | 1,
  });
  if (target === null) {
    return NextResponse.json({ ok: true, noop: true });
  }

  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { order: target },
  });

  return NextResponse.json({ ok: true, order: target });
}

================================================================================
app/api/pages/[pageId]/publish/route.ts
================================================================================
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import {
  findPageSectionsAllowlistViolations,
  findPageSectionsWithInvalidProps,
} from "@/lib/admin/publishGuards";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const activeTheme = await getActiveTheme();
  const page = await prisma.page.findFirst({
    where: { id: params.pageId, themeId: activeTheme.id },
    select: { id: true },
  });
  if (!page) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }

  const allowlistResult = await findPageSectionsAllowlistViolations(
    params.pageId,
  );

  const propViolations = await findPageSectionsWithInvalidProps(params.pageId);

  if (
    allowlistResult.violations.length > 0 ||
    propViolations.length > 0
  ) {
    return NextResponse.json(
      {
        error: "publish_blocked",
        themeKey: allowlistResult.themeKey,
        allowlistViolations: allowlistResult.violations,
        propViolations,
      },
      { status: 400 },
    );
  }

  const updated = await prisma.page.update({
    where: { id: params.pageId },
    data: { status: "published", publishedAt: new Date() },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
    },
  });

  return NextResponse.json({ page: updated });
}

================================================================================
app/api/pages/[pageId]/unpublish/route.ts
================================================================================
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const activeTheme = await getActiveTheme();
  const page = await prisma.page.findFirst({
    where: { id: params.pageId, themeId: activeTheme.id },
    select: { id: true },
  });
  if (!page) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }

  const updated = await prisma.page.update({
    where: { id: params.pageId },
    data: { status: "draft", publishedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
    },
  });
  return NextResponse.json({ page: updated });
}

================================================================================
app/api/sections/[sectionId]/route.ts
================================================================================
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { validateProps } from "@/lib/validation/validateProps";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { sectionId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { props, enabled, order, instanceKey } = (body ?? {}) as {
    props?: Record<string, unknown>;
    enabled?: boolean;
    order?: number;
    instanceKey?: string;
  };

  const activeTheme = await getActiveTheme();

  const section = await prisma.pageSection.findFirst({
    where: {
      id: params.sectionId,
      page: { themeId: activeTheme.id },
    },
    include: {
      componentDefinition: { select: { schema: true } },
    },
  });

  if (!section) {
    return NextResponse.json({ error: "section_not_found" }, { status: 404 });
  }

  const data: {
    props?: object;
    enabled?: boolean;
    order?: number;
    instanceKey?: string;
  } = {};

  if (props && typeof props === "object") {
    const result = validateProps(
      section.componentDefinition.schema as object,
      props,
    );
    if (!result.valid) {
      return NextResponse.json(
        { error: "validation_failed", errors: result.errors },
        { status: 400 },
      );
    }
    data.props = result.data as object;
  }

  if (typeof enabled === "boolean") data.enabled = enabled;
  if (typeof order === "number" && Number.isFinite(order)) data.order = order;
  if (typeof instanceKey === "string" && instanceKey.length > 0)
    data.instanceKey = instanceKey;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no_fields_to_update" }, { status: 400 });
  }

  const updated = await prisma.pageSection.update({
    where: { id: params.sectionId },
    data,
  });
  return NextResponse.json({ section: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { sectionId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const activeTheme = await getActiveTheme();

  const section = await prisma.pageSection.findFirst({
    where: {
      id: params.sectionId,
      page: { themeId: activeTheme.id },
    },
    select: { id: true },
  });

  if (!section) {
    return NextResponse.json({ error: "section_not_found" }, { status: 404 });
  }

  await prisma.pageSection.delete({ where: { id: params.sectionId } });
  return NextResponse.json({ ok: true });
}

================================================================================
app/api/site/active-theme/route.ts
================================================================================
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAllowedComponents } from "@/lib/registry";
import { findThemeSectionsViolatingAllowlist } from "@/lib/admin/publishGuards";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const settings = await prisma.siteSettings.findFirst({
    include: { activeTheme: true },
  });

  if (!settings) {
    return NextResponse.json(
      { error: "site_not_initialized" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    activeTheme: {
      id: settings.activeTheme.id,
      key: settings.activeTheme.key,
      name: settings.activeTheme.name,
      tokens: settings.activeTheme.tokens,
      allowedComponents: getAllowedComponents(settings.activeTheme.key),
    },
  });
}

export async function PATCH(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { themeKey } = (body ?? {}) as { themeKey?: string };
  if (!themeKey || typeof themeKey !== "string") {
    return NextResponse.json({ error: "theme_key_required" }, { status: 400 });
  }

  const theme = await prisma.theme.findUnique({ where: { key: themeKey } });
  if (!theme) {
    return NextResponse.json(
      { error: "theme_not_found", themeKey },
      { status: 404 },
    );
  }

  const violations = await findThemeSectionsViolatingAllowlist(theme.id);

  if (violations.length > 0) {
    return NextResponse.json(
      {
        error: "theme_switch_blocked",
        themeKey,
        violations,
      },
      { status: 400 },
    );
  }

  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    return NextResponse.json(
      { error: "site_not_initialized" },
      { status: 500 },
    );
  }

  await prisma.siteSettings.update({
    where: { id: settings.id },
    data: { activeThemeId: theme.id },
  });

  return NextResponse.json({
    activeTheme: {
      id: theme.id,
      key: theme.key,
      name: theme.name,
      tokens: theme.tokens,
      allowedComponents: getAllowedComponents(theme.key),
    },
  });
}

*/
