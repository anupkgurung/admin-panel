import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";
import {
  DynamicRenderer,
  type RenderableSection,
} from "@/lib/renderer/DynamicRenderer";
import { ThemeProvider, type ThemeTokens } from "@/lib/theme/ThemeProvider";

export const dynamic = "force-dynamic";

function slugFromParams(slugParts?: string[]): string {
  if (!slugParts || slugParts.length === 0) return "/";
  return "/" + slugParts.join("/");
}

export default async function SitePage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = slugFromParams(params.slug);

  const settings = await prisma.siteSettings.findFirst({
    include: { activeTheme: true },
  });

  if (!settings) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: { slug, status: "published" },
    include: {
      sections: {
        where: { enabled: true },
        orderBy: { order: "asc" },
        include: { componentDefinition: true },
      },
    },
  });

  if (!page) {
    notFound();
  }

  const renderableSections: RenderableSection[] = page.sections.map((s) => ({
    id: s.id,
    componentKey: s.componentDefinition.key,
    props: (s.props ?? {}) as Record<string, unknown>,
  }));

  const tokens = (settings.activeTheme.tokens ?? {}) as ThemeTokens;

  return (
    <ThemeProvider themeKey={settings.activeTheme.key} tokens={tokens}>
      <DynamicRenderer
        themeKey={settings.activeTheme.key}
        sections={renderableSections}
      />
    </ThemeProvider>
  );
}
