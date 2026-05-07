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
