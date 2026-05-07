import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { getAllowedComponents } from "@/lib/registry";
import { validateProps } from "@/lib/validation/validateProps";

export const dynamic = "force-dynamic";

function makeInstanceKey(componentKey: string): string {
  const suffix = randomBytes(3).toString("hex");
  return `${componentKey}_${suffix}`;
}

export async function POST(
  req: Request,
  { params }: { params: { pageId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { componentKey, props } = (body ?? {}) as {
    componentKey?: string;
    props?: Record<string, unknown>;
  };

  if (!componentKey || typeof componentKey !== "string") {
    return NextResponse.json(
      { error: "component_key_required" },
      { status: 400 },
    );
  }

  const activeTheme = await getActiveTheme();

  const page = await prisma.page.findFirst({
    where: { id: params.pageId, themeId: activeTheme.id },
    include: { theme: { select: { key: true } } },
  });
  if (!page) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
  }

  const allowed = getAllowedComponents(page.theme.key);
  if (!allowed.includes(componentKey)) {
    return NextResponse.json(
      {
        error: "component_not_allowed_by_theme",
        componentKey,
        themeKey: page.theme.key,
        allowedComponents: allowed,
      },
      { status: 400 },
    );
  }

  const component = await prisma.componentDefinition.findUnique({
    where: { key: componentKey },
  });
  if (!component) {
    return NextResponse.json(
      { error: "component_not_found", componentKey },
      { status: 404 },
    );
  }

  // Validate only if explicit props are sent. New sections created with
  // empty body or empty props start as "draft" sections (filled in by admin via PATCH).
  let propsToStore: object = {};
  if (props && typeof props === "object" && Object.keys(props).length > 0) {
    const result = validateProps(component.schema as object, props);
    if (!result.valid) {
      return NextResponse.json(
        { error: "validation_failed", errors: result.errors },
        { status: 400 },
      );
    }
    propsToStore = result.data as object;
  }

  const last = await prisma.pageSection.findFirst({
    where: { pageId: params.pageId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 10;

  let instanceKey = makeInstanceKey(componentKey);
  for (let attempt = 0; attempt < 3; attempt++) {
    const collision = await prisma.pageSection.findUnique({
      where: {
        pageId_instanceKey: { pageId: params.pageId, instanceKey },
      },
      select: { id: true },
    });
    if (!collision) break;
    instanceKey = makeInstanceKey(componentKey);
  }

  const created = await prisma.pageSection.create({
    data: {
      pageId: params.pageId,
      componentDefinitionId: component.id,
      order: nextOrder,
      enabled: true,
      instanceKey,
      props: propsToStore,
    },
  });

  return NextResponse.json({ section: created }, { status: 201 });
}
