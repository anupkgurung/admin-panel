"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { computeReorderTargetOrder } from "@/lib/admin/reorder";
import {
  findPageSectionsAllowlistViolations,
  findPageSectionsWithInvalidProps,
  findThemeSectionsViolatingAllowlist,
} from "@/lib/admin/publishGuards";
import {
  hasCatalogKey,
  resolveAllowedKeysForTheme,
  validateSectionProps,
} from "@/lib/sections/catalog";
import type {
  ActionResult,
  AllowlistViolation,
  PropsViolation,
} from "@/lib/types/admin";

async function ensureAdmin(): Promise<{ ok: true } | { ok: false; code: "unauthorized" }> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, code: "unauthorized" };
  return { ok: true };
}

function err<T = never>(
  code: string,
  message?: string,
  details?: unknown,
): ActionResult<T> {
  return { ok: false, code, message, details };
}

function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

function makeInstanceKey(componentKey: string): string {
  const suffix = randomBytes(3).toString("hex");
  return `${componentKey}_${suffix}`;
}

/* ---------------------- pages ---------------------- */

export async function createPage(input: {
  slug: string;
  title: string;
}): Promise<ActionResult<{ id: string; slug: string; title: string }>> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  const slug = (input.slug ?? "").trim();
  const title = (input.title ?? "").trim();
  if (!slug) return err("slug_required");
  if (!title) return err("title_required");

  const activeTheme = await getActiveTheme();

  const existing = await prisma.page.findUnique({
    where: { themeId_slug: { themeId: activeTheme.id, slug } },
    select: { id: true },
  });
  if (existing) return err("slug_already_exists", undefined, { slug });

  const page = await prisma.page.create({
    data: { slug, title, themeId: activeTheme.id },
    select: { id: true, slug: true, title: true },
  });

  revalidatePath("/admin/pages");
  return ok(page);
}

export async function updatePage(
  pageId: string,
  patch: { slug?: string; title?: string },
): Promise<ActionResult<{ id: string; slug: string; title: string }>> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  const data: { slug?: string; title?: string } = {};
  if (typeof patch.slug === "string" && patch.slug.length > 0) data.slug = patch.slug;
  if (typeof patch.title === "string" && patch.title.length > 0) data.title = patch.title;
  if (Object.keys(data).length === 0) return err("no_fields_to_update");

  const activeTheme = await getActiveTheme();
  const existing = await prisma.page.findFirst({
    where: { id: pageId, themeId: activeTheme.id },
    select: { id: true, themeId: true },
  });
  if (!existing) return err("page_not_found");

  if (data.slug) {
    const clash = await prisma.page.findFirst({
      where: { slug: data.slug, themeId: existing.themeId, NOT: { id: pageId } },
      select: { id: true },
    });
    if (clash) return err("slug_already_exists", undefined, { slug: data.slug });
  }

  const updated = await prisma.page.update({
    where: { id: pageId },
    data,
    select: { id: true, slug: true, title: true },
  });

  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${pageId}`);
  return ok(updated);
}

/* ---------------------- sections ---------------------- */

export async function addSection(
  pageId: string,
  componentKey: string,
): Promise<ActionResult<{ sectionId: string }>> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  if (!componentKey) return err("component_key_required");

  const activeTheme = await getActiveTheme();

  const page = await prisma.page.findFirst({
    where: { id: pageId, themeId: activeTheme.id },
    include: { theme: { select: { key: true, allowedComponents: true } } },
  });
  if (!page) return err("page_not_found");

  const allowed = resolveAllowedKeysForTheme(
    page.theme.key,
    page.theme.allowedComponents,
  );
  if (!allowed.includes(componentKey)) {
    return err("component_not_allowed_by_theme", undefined, {
      componentKey,
      themeKey: page.theme.key,
      allowedComponents: allowed,
    });
  }

  if (!hasCatalogKey(componentKey)) {
    return err("component_not_found", undefined, { componentKey });
  }

  const component = await prisma.componentDefinition.findUnique({
    where: { key: componentKey },
  });
  if (!component) return err("component_not_found", undefined, { componentKey });

  const last = await prisma.pageSection.findFirst({
    where: { pageId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 10;

  let instanceKey = makeInstanceKey(componentKey);
  for (let attempt = 0; attempt < 3; attempt++) {
    const collision = await prisma.pageSection.findUnique({
      where: { pageId_instanceKey: { pageId, instanceKey } },
      select: { id: true },
    });
    if (!collision) break;
    instanceKey = makeInstanceKey(componentKey);
  }

  const created = await prisma.pageSection.create({
    data: {
      pageId,
      componentDefinitionId: component.id,
      order: nextOrder,
      enabled: true,
      instanceKey,
      props: {},
    },
    select: { id: true },
  });

  revalidatePath(`/admin/pages/${pageId}`);
  return ok({ sectionId: created.id });
}

export async function updateSection(
  sectionId: string,
  patch: {
    props?: Record<string, unknown>;
    enabled?: boolean;
    order?: number;
    instanceKey?: string;
  },
): Promise<
  ActionResult<{ id: string; pageId: string }> 
> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  const activeTheme = await getActiveTheme();

  const section = await prisma.pageSection.findFirst({
    where: { id: sectionId, page: { themeId: activeTheme.id } },
    include: {
      componentDefinition: { select: { key: true } },
    },
  });
  if (!section) return err("section_not_found");

  const data: {
    props?: object;
    enabled?: boolean;
    order?: number;
    instanceKey?: string;
  } = {};

  if (patch.props && typeof patch.props === "object") {
    const result = validateSectionProps(
      section.componentDefinition.key,
      patch.props,
    );
    if (!result.valid) {
      return err("validation_failed", undefined, { errors: result.errors });
    }
    data.props = result.data as object;
  }

  if (typeof patch.enabled === "boolean") data.enabled = patch.enabled;
  if (typeof patch.order === "number" && Number.isFinite(patch.order))
    data.order = patch.order;
  if (typeof patch.instanceKey === "string" && patch.instanceKey.length > 0)
    data.instanceKey = patch.instanceKey;

  if (Object.keys(data).length === 0) return err("no_fields_to_update");

  const updated = await prisma.pageSection.update({
    where: { id: sectionId },
    data,
    select: { id: true, pageId: true },
  });

  revalidatePath(`/admin/pages/${updated.pageId}`);
  return ok(updated);
}

export async function deleteSection(
  sectionId: string,
): Promise<ActionResult<{ id: string; pageId: string }>> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  const activeTheme = await getActiveTheme();

  const section = await prisma.pageSection.findFirst({
    where: { id: sectionId, page: { themeId: activeTheme.id } },
    select: { id: true, pageId: true },
  });
  if (!section) return err("section_not_found");

  await prisma.pageSection.delete({ where: { id: sectionId } });

  revalidatePath(`/admin/pages/${section.pageId}`);
  return ok(section);
}

export async function reorderSection(
  pageId: string,
  sectionId: string,
  direction: -1 | 1,
): Promise<ActionResult<{ noop?: true; order?: number }>> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  if (direction !== -1 && direction !== 1) return err("invalid_direction");

  const activeTheme = await getActiveTheme();

  const section = await prisma.pageSection.findFirst({
    where: {
      id: sectionId,
      pageId,
      page: { themeId: activeTheme.id },
    },
    select: { id: true, order: true },
  });
  if (!section) return err("section_not_found_for_page");

  const target = await computeReorderTargetOrder({
    pageId,
    currentOrder: section.order,
    direction,
  });
  if (target === null) {
    return ok({ noop: true });
  }

  await prisma.pageSection.update({
    where: { id: sectionId },
    data: { order: target },
  });

  revalidatePath(`/admin/pages/${pageId}`);
  return ok({ order: target });
}

/* ---------------------- publish ---------------------- */

export async function publishPage(
  pageId: string,
): Promise<
  ActionResult<{
    id: string;
    slug: string;
    title: string;
    status: "draft" | "published";
    publishedAt: Date | null;
  }>
> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  const activeTheme = await getActiveTheme();
  const page = await prisma.page.findFirst({
    where: { id: pageId, themeId: activeTheme.id },
    select: { id: true },
  });
  if (!page) return err("page_not_found");

  const allowlistResult = await findPageSectionsAllowlistViolations(pageId);
  const propViolations = await findPageSectionsWithInvalidProps(pageId);

  if (allowlistResult.violations.length > 0 || propViolations.length > 0) {
    return err<never>("publish_blocked", undefined, {
      themeKey: allowlistResult.themeKey,
      allowlistViolations: allowlistResult.violations as AllowlistViolation[],
      propViolations: propViolations as PropsViolation[],
    });
  }

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: { status: "published", publishedAt: new Date() },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
    },
  });

  revalidatePath(`/admin/pages/${pageId}`);
  revalidatePath("/admin/pages");
  return ok(updated);
}

export async function unpublishPage(
  pageId: string,
): Promise<
  ActionResult<{
    id: string;
    slug: string;
    title: string;
    status: "draft" | "published";
    publishedAt: Date | null;
  }>
> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  const activeTheme = await getActiveTheme();
  const page = await prisma.page.findFirst({
    where: { id: pageId, themeId: activeTheme.id },
    select: { id: true },
  });
  if (!page) return err("page_not_found");

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: { status: "draft", publishedAt: null },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      publishedAt: true,
    },
  });

  revalidatePath(`/admin/pages/${pageId}`);
  revalidatePath("/admin/pages");
  return ok(updated);
}

/* ---------------------- active theme ---------------------- */

export async function setActiveTheme(
  themeKey: string,
): Promise<
  ActionResult<{ id: string; key: string; name: string }>
> {
  const auth = await ensureAdmin();
  if (!auth.ok) return err(auth.code);

  if (!themeKey) return err("theme_key_required");

  const theme = await prisma.theme.findUnique({ where: { key: themeKey } });
  if (!theme) return err("theme_not_found", undefined, { themeKey });

  const violations = await findThemeSectionsViolatingAllowlist(theme.id);
  if (violations.length > 0) {
    return err("theme_switch_blocked", undefined, { themeKey, violations });
  }

  const settings = await prisma.siteSettings.findFirst();
  if (!settings) return err("site_not_initialized");

  await prisma.siteSettings.update({
    where: { id: settings.id },
    data: { activeThemeId: theme.id },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  return ok({ id: theme.id, key: theme.key, name: theme.name });
}
