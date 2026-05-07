import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    return NextResponse.json({
      status: "ok",
      db: result?.[0]?.ok === 1 ? "up" : "unknown",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        db: "down",
        error:
          error instanceof Error ? error.message : "unknown database error",
      },
      { status: 500 },
    );
  }
}
