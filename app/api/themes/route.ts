import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const themes = await prisma.theme.findMany({
    orderBy: { key: "asc" },
    select: {
      id: true,
      key: true,
      name: true,
      tokens: true,
      allowedComponents: true,
    },
  });

  return NextResponse.json({ themes });
}
