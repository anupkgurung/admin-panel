import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const components = await prisma.componentDefinition.findMany({
    orderBy: { key: "asc" },
    select: {
      id: true,
      key: true,
      name: true,
    },
  });

  return NextResponse.json({ components });
}
