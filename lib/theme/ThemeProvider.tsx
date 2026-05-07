import type { CSSProperties, ReactNode } from "react";

export type ThemeTokens = {
  colors?: {
    primary?: string;
    text?: string;
    bg?: string;
    mutedText?: string;
  };
  radius?: { sm?: number; md?: number };
  spacing?: { sectionY?: number };
};

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

  return (
    <div data-theme={themeKey} style={style}>
      {children}
    </div>
  );
}
