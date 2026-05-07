import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { loadActivePage } from "@/lib/admin/loadActivePage";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const guard = await loadActivePage(params.pageId);
  if (!guard.ok) return guard.response;

  try {
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
  } catch {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }
}
