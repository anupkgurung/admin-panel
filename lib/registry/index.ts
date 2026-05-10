import type { ComponentType } from "react";
import { resolveAllowedKeysForTheme } from "@/lib/sections/catalog";

import {
  CtaBanner,
  Faq,
  FeatureGrid,
  Footer,
  Hero,
  LogosStrip,
  NavHeader,
  PricingTable,
  Testimonials,
} from "@/components/sections/marketing";

import { registeredThemeKeys } from "./registeredThemes";

export type SectionComponent = ComponentType<Record<string, unknown>>;

export {
  registeredThemeKeys,
  type RegisteredThemeKey,
} from "./registeredThemes";

/** Default renderers keyed by `component_definitions.key` — shared across themes. */
export const sharedRegistry: Record<string, SectionComponent> = {
  hero: Hero as unknown as SectionComponent,
  faq: Faq as unknown as SectionComponent,
  nav_header: NavHeader as unknown as SectionComponent,
  feature_grid: FeatureGrid as unknown as SectionComponent,
  cta_banner: CtaBanner as unknown as SectionComponent,
  testimonials: Testimonials as unknown as SectionComponent,
  pricing_table: PricingTable as unknown as SectionComponent,
  logos_strip: LogosStrip as unknown as SectionComponent,
  footer: Footer as unknown as SectionComponent,
};

/**
 * Optional per-theme overrides when a section truly needs different React
 * behavior (not just tokens). Prefer `ThemeTokens.sectionUi` first.
 */
export const themeOverrides: Record<
  string,
  Partial<Record<string, SectionComponent>>
> = {};

export function resolveComponent(
  themeKey: string,
  componentKey: string,
): SectionComponent | undefined {
  const override = themeOverrides[themeKey]?.[componentKey];
  if (override) return override;
  return sharedRegistry[componentKey];
}

/**
 * Allowed component keys when `themes.allowed_components` is omitted.
 * Prefer `resolveAllowedKeysForTheme(themeKey, theme.allowedComponents)` for
 * DB-backed lists.
 */
export function getAllowedComponents(themeKey: string): string[] {
  return resolveAllowedKeysForTheme(themeKey, undefined);
}

export function getAllThemeKeys(): string[] {
  return [...registeredThemeKeys];
}
