"use client";

import { useSiteTheme } from "@/lib/theme/ThemeProvider";

type HeroProps = {
  variant?: "centered" | "split";
  headline: string;
  subheadline?: string;
  cta: {
    label: string;
    href: string;
    style?: "primary" | "secondary";
  };
};

export function Hero(props: HeroProps) {
  const { tokens } = useSiteTheme();
  const heroUi = tokens.sectionUi?.hero ?? {};
  const headlinePreset = heroUi.headlinePreset ?? "prominent";
  const container = heroUi.container ?? "wide";
  const ctaVariant = heroUi.ctaVariant ?? "filled";
  const sectionBorderBottom = heroUi.sectionBorderBottom ?? false;
  const surface = heroUi.surface ?? "default";

  const { variant = "centered", headline, subheadline, cta } = props;
  const isSplit = variant === "split";

  const maxWidthClass =
    container === "narrow" ? "max-w-3xl" : "max-w-5xl";

  const headingClass =
    headlinePreset === "subtle"
      ? "text-3xl font-light tracking-tight"
      : headlinePreset === "dramatic"
        ? "text-4xl font-black uppercase tracking-tight md:text-6xl md:leading-tight"
        : "text-4xl font-bold tracking-tight md:text-5xl";

  const subheadClass =
    headlinePreset === "subtle"
      ? "mt-3 max-w-xl text-base"
      : headlinePreset === "dramatic"
        ? "mt-5 max-w-2xl text-lg md:text-xl"
        : "mt-4 text-lg";

  const ctaBase =
    headlinePreset === "subtle"
      ? "mt-6 inline-block text-sm"
      : headlinePreset === "dramatic"
        ? "mt-10 inline-block text-base md:text-lg font-bold uppercase tracking-wide"
        : "mt-8 inline-block text-sm";

  const ctaFilled =
    "px-6 py-3 font-semibold text-white";
  const ctaOutline =
    "border px-4 py-2";

  const useFilled = ctaVariant === "filled";

  const bandBg =
    surface === "primary-band"
      ? "color-mix(in srgb, var(--color-primary) 22%, var(--color-bg))"
      : undefined;

  return (
    <section
      className={`px-6 ${sectionBorderBottom ? "border-b" : ""}`}
      style={{
        paddingTop: "var(--spacing-section-y)",
        paddingBottom: "var(--spacing-section-y)",
        ...(bandBg ? { backgroundColor: bandBg } : {}),
        ...(sectionBorderBottom
          ? { borderColor: "rgba(0,0,0,0.08)" }
          : {}),
      }}
    >
      <div
        className={`mx-auto ${maxWidthClass} ${
          isSplit
            ? "grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center"
            : "text-center"
        }`}
      >
        <div>
          <h1
            className={headingClass}
            style={{ color: "var(--color-text)" }}
          >
            {headline}
          </h1>
          {subheadline ? (
            <p
              className={subheadClass}
              style={{ color: "var(--color-muted)" }}
            >
              {subheadline}
            </p>
          ) : null}
          <a
            href={cta.href}
            className={`${ctaBase} ${useFilled ? `${ctaFilled}` : `${ctaOutline}`}`}
            style={
              useFilled
                ? {
                    backgroundColor: "var(--color-primary)",
                    borderRadius: "var(--radius-md)",
                  }
                : {
                    color: "var(--color-text)",
                    borderColor: "var(--color-text)",
                    borderRadius: "var(--radius-sm)",
                  }
            }
          >
            {cta.label}
          </a>
        </div>
        {isSplit ? (
          <div
            className="aspect-[4/3] w-full"
            style={{
              backgroundColor: "var(--color-primary)",
              opacity: 0.1,
              borderRadius: "var(--radius-md)",
            }}
            aria-hidden
          />
        ) : null}
      </div>
    </section>
  );
}
