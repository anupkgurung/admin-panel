import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { PageBuilder } from "@/components/admin/PageBuilder";
import { getSectionCatalogEntry } from "@/lib/sections/catalog";
import type { ComponentDef } from "@/lib/types/admin";
import { toPageDTO } from "@/lib/types/admin";

export const dynamic = "force-dynamic";

export default async function AdminPageBuilder({
  params,
}: {
  params: { pageId: string };
}) {
  const activeTheme = await getActiveTheme();

  const page = await prisma.page.findFirst({
    where: { id: params.pageId, themeId: activeTheme.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { componentDefinition: true },
      },
    },
  });

  if (!page) {
    notFound();
  }

  const allowedRows = await prisma.componentDefinition.findMany({
    where: { key: { in: activeTheme.allowedComponents } },
    select: { id: true, key: true },
  });
  const idByKey = new Map(allowedRows.map((r) => [r.key, r.id]));

  const allowedComponents: ComponentDef[] = [];
  for (const key of activeTheme.allowedComponents) {
    const entry = getSectionCatalogEntry(key);
    const id = idByKey.get(key);
    if (entry && id) {
      allowedComponents.push({
        id,
        key,
        name: entry.name,
        schema: entry.schema as object,
      });
    }
  }

  return (
    <PageBuilder
      page={toPageDTO(page)}
      activeTheme={activeTheme}
      allowedComponents={allowedComponents}
    />
  );
}
