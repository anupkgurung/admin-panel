import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { validateProps } from "@/lib/validation/validateProps";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { sectionId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { props, enabled, order, instanceKey } = (body ?? {}) as {
    props?: Record<string, unknown>;
    enabled?: boolean;
    order?: number;
    instanceKey?: string;
  };

  const data: {
    props?: object;
    enabled?: boolean;
    order?: number;
    instanceKey?: string;
  } = {};

  if (props && typeof props === "object") {
    const section = await prisma.pageSection.findUnique({
      where: { id: params.sectionId },
      include: {
        componentDefinition: { select: { schema: true } },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "section_not_found" }, { status: 404 });
    }

    const result = validateProps(
      section.componentDefinition.schema as object,
      props,
    );
    if (!result.valid) {
      return NextResponse.json(
        { error: "validation_failed", errors: result.errors },
        { status: 400 },
      );
    }
    data.props = result.data as object;
  }

  if (typeof enabled === "boolean") data.enabled = enabled;
  if (typeof order === "number" && Number.isFinite(order)) data.order = order;
  if (typeof instanceKey === "string" && instanceKey.length > 0)
    data.instanceKey = instanceKey;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "no_fields_to_update" }, { status: 400 });
  }

  try {
    const updated = await prisma.pageSection.update({
      where: { id: params.sectionId },
      data,
    });
    return NextResponse.json({ section: updated });
  } catch {
    return NextResponse.json({ error: "section_not_found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { sectionId: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    await prisma.pageSection.delete({ where: { id: params.sectionId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "section_not_found" }, { status: 404 });
  }
}
