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
