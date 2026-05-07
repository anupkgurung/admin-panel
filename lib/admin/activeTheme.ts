import { prisma } from "@/lib/db";

export type ActiveTheme = {
  id: string;
  key: string;
  name: string;
  allowedComponents: string[];
};

export async function getActiveTheme(): Promise<ActiveTheme> {
  const settings = await prisma.siteSettings.findFirst({
    include: { activeTheme: true },
  });

  if (!settings) {
    throw new Error("Site settings not initialized");
  }

  const allowedRaw = settings.activeTheme.allowedComponents;
  const allowedComponents = Array.isArray(allowedRaw)
    ? (allowedRaw as unknown[]).filter((v): v is string => typeof v === "string")
    : [];

  return {
    id: settings.activeTheme.id,
    key: settings.activeTheme.key,
    name: settings.activeTheme.name,
    allowedComponents,
  };
}
