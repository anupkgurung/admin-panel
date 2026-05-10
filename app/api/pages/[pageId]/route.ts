import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { getSectionCatalogEntry } from "@/lib/sections/catalog";

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
      sections: page.sections.map((s) => {
        const catalog = getSectionCatalogEntry(s.componentDefinition.key);
        return {
          id: s.id,
          order: s.order,
          enabled: s.enabled,
          instanceKey: s.instanceKey,
          props: s.props,
          component: {
            id: s.componentDefinition.id,
            key: s.componentDefinition.key,
            name: catalog?.name ?? s.componentDefinition.name,
            schema: catalog?.schema ?? s.componentDefinition.schema,
          },
        };
      }),
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
