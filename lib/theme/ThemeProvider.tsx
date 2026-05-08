"use client";

import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

/** Optional per-section presentation hints driven by theme tokens (not duplicate React files). */
export type SectionUiTokens = {
  hero?: {
    headlinePreset?: "prominent" | "subtle" | "dramatic";
    container?: "wide" | "narrow";
    ctaVariant?: "filled" | "outline";
    sectionBorderBottom?: boolean;
    /** When `primary-band`, hero sits on a strong tinted strip (used by bold theme only). */
    surface?: "default" | "primary-band";
  };
  faq?: {
    presentation?: "cards" | "minimal-list" | "accent-strip";
    titlePreset?: "bold" | "minimal";
  };
  /**
   * Optional overrides for marketing sections; omit entirely so modern/minimal
   * keep their existing visuals (defaults branch inside components).
   */
  marketing?: {
    navBar?: "default" | "bold-strip";
    featureGrid?: "default" | "lifted";
    ctaBanner?: "default" | "inverse-band";
    testimonials?: "default" | "emphasis";
    pricing?: "default" | "striking";
    logosStrip?: "default" | "dark-band";
    footer?: "default" | "inverted-band";
  };
};

export type ThemeTokens = {
  colors?: {
    primary?: string;
    text?: string;
    bg?: string;
    mutedText?: string;
  };
  radius?: { sm?: number; md?: number };
  spacing?: { sectionY?: number };
  sectionUi?: SectionUiTokens;
};

export type SiteThemeContextValue = {
  themeKey: string;
  tokens: ThemeTokens;
};

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

export function useSiteTheme(): SiteThemeContextValue {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error("useSiteTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({
  themeKey,
  tokens,
  children,
}: {
  themeKey: string;
  tokens: ThemeTokens;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    ["--color-primary" as string]: tokens.colors?.primary ?? "#2F6BFF",
    ["--color-text" as string]: tokens.colors?.text ?? "#111827",
    ["--color-bg" as string]: tokens.colors?.bg ?? "#FFFFFF",
    ["--color-muted" as string]: tokens.colors?.mutedText ?? "#6B7280",
    ["--radius-sm" as string]: `${tokens.radius?.sm ?? 8}px`,
    ["--radius-md" as string]: `${tokens.radius?.md ?? 12}px`,
    ["--spacing-section-y" as string]: `${tokens.spacing?.sectionY ?? 64}px`,
    backgroundColor: "var(--color-bg)",
    color: "var(--color-text)",
    minHeight: "100vh",
  };

  const value = useMemo(
    () => ({ themeKey, tokens }),
    [themeKey, tokens],
  );

  return (
    <SiteThemeContext.Provider value={value}>
      <div data-theme={themeKey} style={style}>
        {children}
      </div>
    </SiteThemeContext.Provider>
  );
}
