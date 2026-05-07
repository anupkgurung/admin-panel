import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
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
