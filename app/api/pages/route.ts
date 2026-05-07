import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const pages = await prisma.page.findMany({
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

  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "slug_already_exists", slug },
      { status: 409 },
    );
  }

  const page = await prisma.page.create({
    data: { slug, title },
    select: { id: true, slug: true, title: true, status: true },
  });

  return NextResponse.json({ page }, { status: 201 });
}
