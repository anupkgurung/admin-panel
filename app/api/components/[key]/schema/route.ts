import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { key: string } },
) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const component = await prisma.componentDefinition.findUnique({
    where: { key: params.key },
    select: { id: true, key: true, name: true, schema: true },
  });

  if (!component) {
    return NextResponse.json(
      { error: "component_not_found", key: params.key },
      { status: 404 },
    );
  }

  return NextResponse.json(component);
}
