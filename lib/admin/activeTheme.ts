import { prisma } from "@/lib/db";
import { resolveAllowedKeysForTheme } from "@/lib/sections/catalog";

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

  return {
    id: settings.activeTheme.id,
    key: settings.activeTheme.key,
    name: settings.activeTheme.name,
    allowedComponents: resolveAllowedKeysForTheme(
      settings.activeTheme.key,
      settings.activeTheme.allowedComponents,
    ),
  };
}
