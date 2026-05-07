import type { ComponentType } from "react";
import { componentDefinitionKeys } from "@/components/themes/_definitions";

import { Hero as ModernHero } from "@/components/themes/modern/Hero";
import { Faq as ModernFaq } from "@/components/themes/modern/Faq";
import { Hero as MinimalHero } from "@/components/themes/minimal/Hero";
import { Faq as MinimalFaq } from "@/components/themes/minimal/Faq";

export type SectionComponent = ComponentType<Record<string, unknown>>;

export type ComponentRegistry = Record<
  string,
  Record<string, SectionComponent>
>;

export const registry: ComponentRegistry = {
  modern: {
    hero: ModernHero as unknown as SectionComponent,
    faq: ModernFaq as unknown as SectionComponent,
  },
  minimal: {
    hero: MinimalHero as unknown as SectionComponent,
    faq: MinimalFaq as unknown as SectionComponent,
  },
};

export function resolveComponent(
  themeKey: string,
  componentKey: string,
): SectionComponent | undefined {
  return registry[themeKey]?.[componentKey];
}

/**
 * Returns the component keys a theme is allowed to use, derived from the
 * in-code registry. This is the single source of truth for the theme
 * allowlist; the DB column `themes.allowed_components` is unused.
 */
export function getAllowedComponents(themeKey: string): string[] {
  // Theme-specific render registry may be ahead/behind the DB component catalog.
  // For now every theme shares the same definition catalog and implementations
  // can be added incrementally without blocking DB insertion.
  if (!registry[themeKey]) {
    return [];
  }
  return componentDefinitionKeys;
}

export function getAllThemeKeys(): string[] {
  return Object.keys(registry);
}
