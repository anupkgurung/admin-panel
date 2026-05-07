import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getActiveTheme } from "@/lib/admin/activeTheme";

export type ActivePageResult =
  | { ok: true; page: { id: string; themeId: string } }
  | { ok: false; response: NextResponse };

/**
 * Loads a page by id and verifies it belongs to the currently active theme.
 * Returns a NextResponse 404 if the page is missing OR belongs to a non-active
 * theme. The 404 is intentional (don't leak the existence of pages owned by
 * other themes).
 */
export async function loadActivePage(pageId: string): Promise<ActivePageResult> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true, themeId: true },
  });

  if (!page) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "page_not_found" },
        { status: 404 },
      ),
    };
  }

  const activeTheme = await getActiveTheme();
  if (page.themeId !== activeTheme.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "page_not_found" },
        { status: 404 },
      ),
    };
  }

  return { ok: true, page };
}
