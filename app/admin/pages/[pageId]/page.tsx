import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { PageBuilder } from "@/components/admin/PageBuilder";
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

  const allowedComponentDefs = await prisma.componentDefinition.findMany({
    where: { key: { in: activeTheme.allowedComponents } },
    select: { id: true, key: true, name: true, schema: true },
  });

  const allowedComponents: ComponentDef[] = allowedComponentDefs.map((c) => ({
    id: c.id,
    key: c.key,
    name: c.name,
    schema: c.schema as object,
  }));

  return (
    <PageBuilder
      page={toPageDTO(page)}
      activeTheme={activeTheme}
      allowedComponents={allowedComponents}
    />
  );
}
