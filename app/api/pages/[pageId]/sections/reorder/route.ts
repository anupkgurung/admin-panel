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
    // Already at edge in that direction; no-op.
    return NextResponse.json({ ok: true, noop: true });
  }

  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { order: target },
  });

  return NextResponse.json({ ok: true, order: target });
}
