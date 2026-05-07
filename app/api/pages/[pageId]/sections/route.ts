import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/db";
import { getActiveTheme } from "@/lib/admin/activeTheme";

export const dynamic = "force-dynamic";

function makeInstanceKey(componentKey: string): string {
  const suffix = randomBytes(3).toString("hex");
  return `${componentKey}_${suffix}`;
}

export async function POST(
  req: Request,
  { params }: { params: { pageId: string } },
) {
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

  const page = await prisma.page.findUnique({ where: { id: params.pageId } });
  if (!page) {
    return NextResponse.json({ error: "page_not_found" }, { status: 404 });
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

  const activeTheme = await getActiveTheme();
  if (!activeTheme.allowedComponents.includes(componentKey)) {
    return NextResponse.json(
      {
        error: "component_not_allowed_by_theme",
        componentKey,
        themeKey: activeTheme.key,
        allowedComponents: activeTheme.allowedComponents,
      },
      { status: 400 },
    );
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
      props: (props ?? {}) as object,
    },
  });

  return NextResponse.json({ section: created }, { status: 201 });
}
