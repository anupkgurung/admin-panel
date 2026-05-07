import { prisma } from "@/lib/db";
import { getAllowedComponents } from "@/lib/registry";
import { validateProps } from "@/lib/validation/validateProps";

export type AllowlistViolation = {
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  sectionId: string;
  instanceKey: string;
  componentKey: string;
};

export type PropsViolation = {
  sectionId: string;
  instanceKey: string;
  componentKey: string;
  errors: { path: string; message: string }[];
};

/**
 * Returns sections of pages owned by `themeId` whose component key is not in
 * the theme's code-derived allowlist. Used as the theme-switch publish guard:
 * when activating a theme, only that theme's own pages are inspected, since
 * pages of other themes never render under the activated theme.
 */
export async function findThemeSectionsViolatingAllowlist(
  themeId: string,
): Promise<AllowlistViolation[]> {
  const theme = await prisma.theme.findUnique({
    where: { id: themeId },
    select: { key: true },
  });
  if (!theme) return [];

  const allowed = new Set(getAllowedComponents(theme.key));

  const sections = await prisma.pageSection.findMany({
    where: { page: { themeId } },
    select: {
      id: true,
      instanceKey: true,
      page: { select: { id: true, slug: true, title: true } },
      componentDefinition: { select: { key: true } },
    },
  });

  return sections
    .filter((s) => !allowed.has(s.componentDefinition.key))
    .map((s) => ({
      pageId: s.page.id,
      pageSlug: s.page.slug,
      pageTitle: s.page.title,
      sectionId: s.id,
      instanceKey: s.instanceKey,
      componentKey: s.componentDefinition.key,
    }));
}

/**
 * Returns sections on the given page whose component is not in the page's
 * theme's code-derived allowlist. The allowlist source-of-truth is the
 * page's theme (never the active theme).
 */
export async function findPageSectionsAllowlistViolations(
  pageId: string,
): Promise<{ themeKey: string | null; violations: AllowlistViolation[] }> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: {
      theme: { select: { key: true } },
    },
  });

  if (!page) {
    return { themeKey: null, violations: [] };
  }

  const allowed = new Set(getAllowedComponents(page.theme.key));

  const sections = await prisma.pageSection.findMany({
    where: { pageId },
    select: {
      id: true,
      instanceKey: true,
      page: { select: { id: true, slug: true, title: true } },
      componentDefinition: { select: { key: true } },
    },
  });

  const violations = sections
    .filter((s) => !allowed.has(s.componentDefinition.key))
    .map((s) => ({
      pageId: s.page.id,
      pageSlug: s.page.slug,
      pageTitle: s.page.title,
      sectionId: s.id,
      instanceKey: s.instanceKey,
      componentKey: s.componentDefinition.key,
    }));

  return { themeKey: page.theme.key, violations };
}

export async function findPageSectionsWithInvalidProps(
  pageId: string,
): Promise<PropsViolation[]> {
  const sections = await prisma.pageSection.findMany({
    where: { pageId },
    include: {
      componentDefinition: { select: { key: true, schema: true } },
    },
  });

  const violations: PropsViolation[] = [];
  for (const s of sections) {
    const result = validateProps(
      s.componentDefinition.schema as object,
      s.props,
    );
    if (!result.valid) {
      violations.push({
        sectionId: s.id,
        instanceKey: s.instanceKey,
        componentKey: s.componentDefinition.key,
        errors: result.errors,
      });
    }
  }
  return violations;
}
