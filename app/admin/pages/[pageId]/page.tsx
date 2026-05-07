import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { PageBuilder } from "@/components/admin/PageBuilder";

export const dynamic = "force-dynamic";

export default async function AdminPageBuilder({
  params,
}: {
  params: { pageId: string };
}) {
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
    notFound();
  }

  const activeTheme = await getActiveTheme();

  const allowedComponents = await prisma.componentDefinition.findMany({
    where: { key: { in: activeTheme.allowedComponents } },
    select: { id: true, key: true, name: true, schema: true },
  });

  return (
    <PageBuilder
      page={{
        id: page.id,
        slug: page.slug,
        title: page.title,
        status: page.status,
        sections: page.sections.map((s) => ({
          id: s.id,
          order: s.order,
          enabled: s.enabled,
          instanceKey: s.instanceKey,
          props: (s.props ?? {}) as Record<string, unknown>,
          component: {
            id: s.componentDefinition.id,
            key: s.componentDefinition.key,
            name: s.componentDefinition.name,
            schema: s.componentDefinition.schema as object,
          },
        })),
      }}
      activeTheme={activeTheme}
      allowedComponents={allowedComponents.map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        schema: c.schema as object,
      }))}
    />
  );
}
