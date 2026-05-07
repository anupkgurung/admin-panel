import type { ComponentType } from "react";

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
