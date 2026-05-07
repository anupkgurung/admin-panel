import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { pageId: string } },
) {
  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
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

  if (data.slug) {
    const existing = await prisma.page.findFirst({
      where: { slug: data.slug, NOT: { id: params.pageId } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "slug_already_exists", slug: data.slug },
        { status: 409 },
      );
    }
  }

  try {
    const updated = await prisma.page.update({
      where: { id: params.pageId },
      data,
      select: { id: true, slug: true, title: true, status: true },
    });
    return NextResponse.json({ page: updated });
  } catch (e) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }
}
