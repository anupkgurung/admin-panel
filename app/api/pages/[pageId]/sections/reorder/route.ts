import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

type ReorderItem = { id: string; order: number };

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

  const ordering = (body as { ordering?: ReorderItem[] } | null)?.ordering;

  if (!Array.isArray(ordering) || ordering.length === 0) {
    return NextResponse.json(
      { error: "ordering_required" },
      { status: 400 },
    );
  }

  const validItems = ordering.filter(
    (i): i is ReorderItem =>
      i &&
      typeof i.id === "string" &&
      typeof i.order === "number" &&
      Number.isFinite(i.order),
  );

  if (validItems.length !== ordering.length) {
    return NextResponse.json(
      { error: "invalid_ordering_items" },
      { status: 400 },
    );
  }

  const sectionIds = validItems.map((i) => i.id);
  const matched = await prisma.pageSection.findMany({
    where: { id: { in: sectionIds }, pageId: params.pageId },
    select: { id: true },
  });

  if (matched.length !== sectionIds.length) {
    return NextResponse.json(
      { error: "section_not_found_for_page" },
      { status: 400 },
    );
  }

  await prisma.$transaction(
    validItems.map((item) =>
      prisma.pageSection.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );

  return NextResponse.json({ ok: true, count: validItems.length });
}
