/**
 * In-code section catalog: keys, display names, and JSON Schemas for validation.
 * Source of truth lives in `components/themes/_definitions`; the database
 * `component_definitions` rows exist for FK integrity and optional sync — runtime
 * validation and admin UI metadata should use this module, not Prisma schemas.
 */
import {
  componentDefinitionKeys,
  componentDefinitions,
  type ComponentDefinitionInput,
} from "@/components/themes/_definitions";
import { validateProps, type PropValidationResult } from "@/lib/validation/validateProps";
import {
  registeredThemeKeys,
  type RegisteredThemeKey,
} from "@/lib/registry/registeredThemes";

const byKey = new Map<string, ComponentDefinitionInput>(
  componentDefinitions.map((d) => [d.key, d]),
);

export type SectionCatalogEntry = ComponentDefinitionInput;

export function getSectionCatalogEntry(
  key: string,
): SectionCatalogEntry | undefined {
  return byKey.get(key);
}

export function hasCatalogKey(key: string): boolean {
  return byKey.has(key);
}

export function listCatalogKeys(): string[] {
  return [...componentDefinitionKeys];
}

/**
 * Validates section props using the in-code JSON Schema for `componentKey`.
 */
export function validateSectionProps(
  componentKey: string,
  data: unknown,
): PropValidationResult {
  const entry = getSectionCatalogEntry(componentKey);
  if (!entry) {
    return {
      valid: false,
      errors: [{ path: "/", message: `unknown component key: ${componentKey}` }],
    };
  }
  return validateProps(entry.schema as object, data);
}

/**
 * Normalizes `themes.allowed_components` JSON: keeps only non-empty strings that
 * exist in the catalog. Unknown keys are dropped.
 */
export function normalizeThemeAllowedComponentsJson(
  raw: unknown,
): string[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set(componentDefinitionKeys);
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || item.length === 0) continue;
    if (allowed.has(item) && !out.includes(item)) out.push(item);
  }
  return out;
}

/**
 * Effective allowlist for a theme: registered theme key + intersection of DB JSON
 * with catalog keys. Unregistered theme keys yield [].
 */
export function resolveAllowedKeysForTheme(
  themeKey: string,
  themeAllowedComponentsFromDb?: unknown,
): string[] {
  if (!registeredThemeKeys.includes(themeKey as RegisteredThemeKey)) {
    return [];
  }
  if (themeAllowedComponentsFromDb === undefined) {
    return [...componentDefinitionKeys];
  }
  const normalized = normalizeThemeAllowedComponentsJson(
    themeAllowedComponentsFromDb,
  );
  if (normalized.length > 0) return normalized;
  // Default `[]` in DB: fall back to full catalog (legacy behaviour).
  return [...componentDefinitionKeys];
}
