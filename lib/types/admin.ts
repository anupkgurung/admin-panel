import type { Prisma, PageStatus } from "@prisma/client";

import { getSectionCatalogEntry } from "@/lib/sections/catalog";

/**
 * Single source of truth for admin/page DTOs shared between server actions,
 * API route handlers, RSC entry points, and admin client components.
 */

export type PageWithSections = Prisma.PageGetPayload<{
  include: {
    sections: {
      include: {
        componentDefinition: true;
      };
    };
  };
}>;

export type ComponentDef = {
  id: string;
  key: string;
  name: string;
  schema: object;
};

export type SectionDTO = {
  id: string;
  order: number;
  enabled: boolean;
  instanceKey: string;
  props: Record<string, unknown>;
  component: ComponentDef;
};

export type PageDTO = {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  publishedAt: Date | null;
  sections: SectionDTO[];
};

export type ActiveThemeDTO = {
  id: string;
  key: string;
  name: string;
  allowedComponents: string[];
};

export type ThemeDTO = {
  id: string;
  key: string;
  name: string;
  allowedComponents: string[];
};

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

export type PublishError = {
  error: string;
  themeKey?: string;
  allowlistViolations?: AllowlistViolation[];
  propViolations?: PropsViolation[];
};

/** Mapper from a Prisma page payload to the UI/server-action DTO shape. */
export function toPageDTO(page: PageWithSections): PageDTO {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    status: page.status,
    publishedAt: page.publishedAt,
    sections: [...page.sections]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        order: s.order,
        enabled: s.enabled,
        instanceKey: s.instanceKey,
        props: (s.props ?? {}) as Record<string, unknown>,
        component: (() => {
          const catalog = getSectionCatalogEntry(s.componentDefinition.key);
          return {
            id: s.componentDefinition.id,
            key: s.componentDefinition.key,
            name: catalog?.name ?? s.componentDefinition.name,
            schema: (catalog?.schema ?? s.componentDefinition.schema) as object,
          };
        })(),
      })),
  };
}

/** Result envelope returned by all admin server actions. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      message?: string;
      details?: unknown;
    };
