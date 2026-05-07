import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { findThemeSectionsViolatingAllowlist } from "@/lib/admin/publishGuards";

export const dynamic = "force-dynamic";

function asAllowlist(raw: unknown): string[] {
  return Array.isArray(raw)
    ? (raw as unknown[]).filter((v): v is string => typeof v === "string")
    : [];
}

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const settings = await prisma.siteSettings.findFirst({
    include: { activeTheme: true },
  });

  if (!settings) {
    return NextResponse.json(
      { error: "site_not_initialized" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    activeTheme: {
      id: settings.activeTheme.id,
      key: settings.activeTheme.key,
      name: settings.activeTheme.name,
      tokens: settings.activeTheme.tokens,
      allowedComponents: asAllowlist(settings.activeTheme.allowedComponents),
    },
  });
}

export async function PATCH(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { themeKey } = (body ?? {}) as { themeKey?: string };
  if (!themeKey || typeof themeKey !== "string") {
    return NextResponse.json({ error: "theme_key_required" }, { status: 400 });
  }

  const theme = await prisma.theme.findUnique({ where: { key: themeKey } });
  if (!theme) {
    return NextResponse.json(
      { error: "theme_not_found", themeKey },
      { status: 404 },
    );
  }

  const newAllowed = asAllowlist(theme.allowedComponents);
  const violations = await findThemeSectionsViolatingAllowlist(theme.id);

  if (violations.length > 0) {
    return NextResponse.json(
      {
        error: "theme_switch_blocked",
        themeKey,
        violations,
      },
      { status: 400 },
    );
  }

  const settings = await prisma.siteSettings.findFirst();
  if (!settings) {
    return NextResponse.json(
      { error: "site_not_initialized" },
      { status: 500 },
    );
  }

  await prisma.siteSettings.update({
    where: { id: settings.id },
    data: { activeThemeId: theme.id },
  });

  return NextResponse.json({
    activeTheme: {
      id: theme.id,
      key: theme.key,
      name: theme.name,
      tokens: theme.tokens,
      allowedComponents: newAllowed,
    },
  });
}
