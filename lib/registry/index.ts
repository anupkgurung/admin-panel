import type { ComponentType } from "react";
import { componentDefinitionKeys } from "@/components/themes/_definitions";

import { Hero as SharedHero } from "@/components/sections/Hero";
import { Faq as SharedFaq } from "@/components/sections/Faq";
import {
  CtaBanner,
  FeatureGrid,
  Footer,
  LogosStrip,
  NavHeader,
  PricingTable,
  Testimonials,
} from "@/components/sections/marketing";

export type SectionComponent = ComponentType<Record<string, unknown>>;

/** Default renderers keyed by `component_definitions.key` — shared across themes. */
export const sharedRegistry: Record<string, SectionComponent> = {
  hero: SharedHero as unknown as SectionComponent,
  faq: SharedFaq as unknown as SectionComponent,
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

/** Themes we resolve sections for (matches DB `themes.key`). */
export const registeredThemeKeys = ["modern", "minimal"] as const;

export type RegisteredThemeKey = (typeof registeredThemeKeys)[number];

export function resolveComponent(
  themeKey: string,
  componentKey: string,
): SectionComponent | undefined {
  const override = themeOverrides[themeKey]?.[componentKey];
  if (override) return override;
  return sharedRegistry[componentKey];
}

/**
 * Allowed component keys for admin/theme guards — aligned with DB catalog.
 */
export function getAllowedComponents(themeKey: string): string[] {
  if (!registeredThemeKeys.includes(themeKey as RegisteredThemeKey)) {
    return [];
  }
  return componentDefinitionKeys;
}

export function getAllThemeKeys(): string[] {
  return [...registeredThemeKeys];
}
