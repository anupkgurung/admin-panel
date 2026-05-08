"use client";

import { useState } from "react";

import { useSiteTheme } from "@/lib/theme/ThemeProvider";

/** hero — shared section (definitions in themes/_definitions/marketing.ts). */
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

/** faq — shared section (definitions in themes/_definitions/marketing.ts). */
type FaqItem = { question: string; answer: string };
type FaqProps = { title?: string; items: FaqItem[] };

export function Faq({ title = "FAQs", items }: FaqProps) {
  const { tokens } = useSiteTheme();
  const faqUi = tokens.sectionUi?.faq ?? {};
  const presentation = faqUi.presentation ?? "cards";
  const titlePreset = faqUi.titlePreset ?? "bold";

  const titleClass =
    titlePreset === "minimal"
      ? "text-xl font-light uppercase tracking-widest"
      : "text-2xl font-semibold tracking-tight";

  const accentBorderLeft =
    presentation === "accent-strip"
      ? {
          borderLeftWidth: 4,
          borderLeftStyle: "solid" as const,
          borderLeftColor: "var(--color-primary)",
        }
      : {};

  return (
    <section
      className="px-6"
      style={{
        paddingTop: "var(--spacing-section-y)",
        paddingBottom: "var(--spacing-section-y)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className={titleClass} style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        {presentation === "minimal-list" ? (
          <ul
            className="mt-6 divide-y"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}
          >
            {items.map((item, idx) => (
              <li key={idx} className="py-4">
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.question}
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  {item.answer}
                </p>
              </li>
            ))}
          </ul>
        ) : presentation === "accent-strip" ? (
          <dl className="mt-6 space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="border p-4 shadow-md"
                style={{
                  ...accentBorderLeft,
                  borderRadius: "var(--radius-md)",
                  borderColor: "rgba(0,0,0,0.06)",
                }}
              >
                <dt
                  className="text-base font-bold"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <dl className="mt-6 space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="border p-4"
                style={{
                  borderRadius: "var(--radius-sm)",
                  borderColor: "rgba(0,0,0,0.08)",
                }}
              >
                <dt
                  className="font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.question}
                </dt>
                <dd className="mt-1" style={{ color: "var(--color-muted)" }}>
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

const sectionY = {
  paddingTop: "var(--spacing-section-y)",
  paddingBottom: "var(--spacing-section-y)",
};

const subtleBorder = "rgba(0,0,0,0.08)";

/** nav_header */
export function NavHeader(props: Record<string, unknown>) {
  const { tokens } = useSiteTheme();
  const navBar = tokens.sectionUi?.marketing?.navBar ?? "default";
  const boldStrip = navBar === "bold-strip";

  const variant =
    (props.variant as string | undefined) ?? "simple";
  const logo = props.logo as { text: string; href: string };
  const links = (props.links ?? []) as Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  const cta = props.cta as
    | { label: string; href: string; style?: string }
    | undefined;
  const sticky = Boolean(props.sticky);
  const showMobileMenu = props.showMobileMenu !== false;
  const [open, setOpen] = useState(false);

  const linkNodes = links.map((link, i) => (
    <a
      key={`${link.href}-${i}`}
      href={link.href}
      className="text-sm hover:opacity-80"
      style={{ color: "var(--color-text)" }}
      {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {link.label}
    </a>
  ));

  const ctaNode =
    cta != null ? (
      <a
        href={cta.href}
        className="rounded px-4 py-2 text-sm font-medium"
        style={{
          backgroundColor:
            cta.style === "ghost" || cta.style === "secondary"
              ? "transparent"
              : "var(--color-primary)",
          color:
            cta.style === "ghost" || cta.style === "secondary"
              ? "var(--color-text)"
              : "#fff",
          border:
            cta.style === "ghost"
              ? `1px solid ${subtleBorder}`
              : undefined,
          borderRadius: "var(--radius-sm)",
        }}
      >
        {cta.label}
      </a>
    ) : null;

  const logoNode = (
    <a href={logo.href} className="font-semibold shrink-0" style={{ color: "var(--color-text)" }}>
      {logo.text}
    </a>
  );

  return (
    <header
      className={`${boldStrip ? "border-b-[4px]" : "border-b"} ${sticky ? "sticky top-0 z-40 backdrop-blur-sm" : ""}`}
      style={{
        borderColor: boldStrip ? "var(--color-primary)" : subtleBorder,
        backgroundColor: boldStrip
          ? "color-mix(in srgb, var(--color-primary) 16%, var(--color-bg))"
          : sticky
            ? "color-mix(in srgb, var(--color-bg) 92%, transparent)"
            : "var(--color-bg)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between md:hidden">
          {logoNode}
          {showMobileMenu ? (
            <button
              type="button"
              className="text-sm font-medium"
              style={{ color: "var(--color-text)" }}
              aria-expanded={open}
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Menu"}
            </button>
          ) : null}
        </div>

        {showMobileMenu && open ? (
          <nav
            className="mt-4 flex flex-col gap-3 border-t pt-4 md:hidden"
            style={{ borderColor: subtleBorder }}
          >
            {linkNodes}
            {ctaNode ? <div>{ctaNode}</div> : null}
          </nav>
        ) : null}

        <div className="hidden md:block">
          {variant === "centered" ? (
            <div className="flex flex-col items-center gap-4">
              {logoNode}
              <nav className="flex flex-wrap items-center justify-center gap-6">{linkNodes}</nav>
              {ctaNode}
            </div>
          ) : null}
          {variant === "simple" ? (
            <div className="flex items-center justify-between gap-6">
              {logoNode}
              <nav className="flex flex-wrap items-center justify-end gap-6">{linkNodes}</nav>
              {ctaNode}
            </div>
          ) : null}
          {variant === "split" ? (
            <div className="flex items-center gap-6">
              {logoNode}
              <nav className="flex flex-1 flex-wrap items-center justify-center gap-8">{linkNodes}</nav>
              <div className="shrink-0">{ctaNode}</div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

/** feature_grid */
export function FeatureGrid(props: Record<string, unknown>) {
  const { tokens } = useSiteTheme();
  const gridVariant = tokens.sectionUi?.marketing?.featureGrid ?? "default";
  const lifted = gridVariant === "lifted";

  const title = (props.title as string | undefined) ?? "Features";
  const subtitle = props.subtitle as string | undefined;
  const columns = typeof props.columns === "number" ? props.columns : 3;
  const items = (props.items ?? []) as Array<{
    title: string;
    description: string;
    icon?: string;
  }>;

  const colClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : columns === 4
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="px-6" style={sectionY}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-base" style={{ color: "var(--color-muted)" }}>
            {subtitle}
          </p>
        ) : null}
        <div className={`mt-10 grid gap-8 ${colClass}`}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-5 ${lifted ? "shadow-xl" : ""}`}
              style={{
                borderColor: lifted
                  ? "color-mix(in srgb, var(--color-primary) 45%, transparent)"
                  : subtleBorder,
                borderRadius: "var(--radius-md)",
                borderWidth: lifted ? 2 : 1,
                boxShadow: lifted
                  ? "0 18px 40px color-mix(in srgb, var(--color-text) 12%, transparent)"
                  : undefined,
              }}
            >
              {item.icon ? (
                <div className="mb-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                  {item.icon}
                </div>
              ) : null}
              <h3 className="font-semibold" style={{ color: "var(--color-text)" }}>
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** cta_banner */
export function CtaBanner(props: Record<string, unknown>) {
  const { tokens } = useSiteTheme();
  const ctaMode = tokens.sectionUi?.marketing?.ctaBanner ?? "default";
  const inverseBand = ctaMode === "inverse-band";

  const headline = props.headline as string;
  const subheadline = props.subheadline as string | undefined;
  const align = (props.align as string | undefined) ?? "center";
  const primaryCta = props.primaryCta as { label: string; href: string };
  const secondaryCta = props.secondaryCta as
    | { label: string; href: string }
    | undefined;

  const alignClass = align === "left" ? "text-left" : "text-center mx-auto";

  const headingColor = inverseBand ? "#ffffff" : "var(--color-text)";
  const mutedColor = inverseBand ? "rgba(255,255,255,0.82)" : "var(--color-muted)";

  return (
    <section
      className="px-6"
      style={{
        ...sectionY,
        ...(inverseBand
          ? {
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
            }
          : {}),
      }}
    >
      <div className={`mx-auto max-w-4xl ${alignClass}`}>
        <h2 className="text-3xl font-semibold tracking-tight" style={{ color: headingColor }}>
          {headline}
        </h2>
        {subheadline ? (
          <p className="mt-3 text-lg" style={{ color: mutedColor }}>
            {subheadline}
          </p>
        ) : null}
        <div className={`mt-8 flex flex-wrap gap-4 ${align === "center" ? "justify-center" : ""}`}>
          <a
            href={primaryCta.href}
            className="inline-block px-6 py-3 text-sm font-semibold"
            style={
              inverseBand
                ? {
                    backgroundColor: "#ffffff",
                    color: "var(--color-primary)",
                    borderRadius: "var(--radius-md)",
                  }
                : {
                    backgroundColor: "var(--color-primary)",
                    color: "#ffffff",
                    borderRadius: "var(--radius-md)",
                  }
            }
          >
            {primaryCta.label}
          </a>
          {secondaryCta ? (
            <a
              href={secondaryCta.href}
              className="inline-block border px-6 py-3 text-sm font-medium"
              style={
                inverseBand
                  ? {
                      borderColor: "rgba(255,255,255,0.65)",
                      color: "#ffffff",
                      borderRadius: "var(--radius-sm)",
                    }
                  : {
                      borderColor: "var(--color-text)",
                      color: "var(--color-text)",
                      borderRadius: "var(--radius-sm)",
                    }
              }
            >
              {secondaryCta.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** testimonials — layout "carousel" rendered as horizontal scroll strip */
export function Testimonials(props: Record<string, unknown>) {
  const { tokens } = useSiteTheme();
  const testimonialUi = tokens.sectionUi?.marketing?.testimonials ?? "default";
  const emphasis = testimonialUi === "emphasis";

  const title = (props.title as string | undefined) ?? "What customers say";
  const layout = (props.layout as string | undefined) ?? "cards";
  const items = (props.items ?? []) as Array<{
    quote: string;
    name: string;
    role?: string;
    company?: string;
    avatarUrl?: string;
  }>;

  if (layout === "carousel") {
    return (
      <section className="px-6" style={sectionY}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
          <div className="mt-8 flex gap-4 overflow-x-auto pb-2">
            {items.map((item, idx) => (
              <blockquote
                key={idx}
                className={`min-w-[280px] shrink-0 rounded-lg border p-5 ${emphasis ? "shadow-lg" : ""}`}
                style={{
                  borderColor: emphasis
                    ? "color-mix(in srgb, var(--color-primary) 55%, transparent)"
                    : subtleBorder,
                  borderRadius: "var(--radius-md)",
                  borderWidth: emphasis ? 2 : 1,
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                  “{item.quote}”
                </p>
                <footer className="mt-4 text-xs" style={{ color: "var(--color-muted)" }}>
                  — {item.name}
                  {item.role ? `, ${item.role}` : ""}
                  {item.company ? ` · ${item.company}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6" style={sectionY}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <blockquote
              key={idx}
              className={`rounded-lg border p-5 ${emphasis ? "shadow-lg" : ""}`}
              style={{
                borderColor: emphasis
                  ? "color-mix(in srgb, var(--color-primary) 55%, transparent)"
                  : subtleBorder,
                borderRadius: "var(--radius-md)",
                borderWidth: emphasis ? 2 : 1,
              }}
            >
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                “{item.quote}”
              </p>
              <footer className="mt-4 text-xs" style={{ color: "var(--color-muted)" }}>
                — {item.name}
                {item.role ? `, ${item.role}` : ""}
                {item.company ? ` · ${item.company}` : ""}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/** pricing_table */
export function PricingTable(props: Record<string, unknown>) {
  const { tokens } = useSiteTheme();
  const pricingUi = tokens.sectionUi?.marketing?.pricing ?? "default";
  const striking = pricingUi === "striking";

  const title = (props.title as string | undefined) ?? "Pricing";
  const subtitle = props.subtitle as string | undefined;
  const billingNote = props.billingNote as string | undefined;
  const plans = (props.plans ?? []) as Array<{
    name: string;
    price: string;
    period?: string;
    highlighted?: boolean;
    features: string[];
    cta: { label: string; href: string };
  }>;

  return (
    <section className="px-6" style={sectionY}>
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-2 max-w-2xl text-center text-base" style={{ color: "var(--color-muted)" }}>
            {subtitle}
          </p>
        ) : null}
        {billingNote ? (
          <p className="mt-2 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            {billingNote}
          </p>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`flex flex-col rounded-lg border p-6 transition-transform ${striking && plan.highlighted ? "shadow-2xl md:scale-[1.02]" : ""}`}
              style={{
                borderColor: plan.highlighted ? "var(--color-primary)" : subtleBorder,
                borderRadius: "var(--radius-md)",
                borderWidth: plan.highlighted ? (striking ? 3 : 2) : 1,
                ...(striking && plan.highlighted
                  ? {
                      boxShadow:
                        "0 22px 45px color-mix(in srgb, var(--color-primary) 28%, transparent)",
                    }
                  : {}),
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                {plan.name}
              </h3>
              <p className="mt-2">
                <span className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {plan.period ?? "/mo"}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm" style={{ color: "var(--color-muted)" }}>
                {plan.features.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
              <a
                href={plan.cta.href}
                className="mt-8 block text-center px-4 py-2 text-sm font-semibold text-white"
                style={{
                  backgroundColor: "var(--color-primary)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {plan.cta.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** logos_strip */
export function LogosStrip(props: Record<string, unknown>) {
  const { tokens } = useSiteTheme();
  const logosUi = tokens.sectionUi?.marketing?.logosStrip ?? "default";
  const darkBand = logosUi === "dark-band";

  const title = (props.title as string | undefined) ?? "Trusted by";
  const grayscale = props.grayscale !== false;
  const logos = (props.logos ?? []) as Array<{ name: string; src: string; href?: string }>;

  const img = (logo: { name: string; src: string }) => (
    // Logos come from arbitrary URLs in CMS props — skip next/image domain config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt={logo.name}
      className={`h-8 max-w-[120px] object-contain ${darkBand ? "" : grayscale ? "grayscale opacity-70" : ""}`}
      style={
        darkBand
          ? { filter: grayscale ? "grayscale(1) brightness(0) invert(1)" : "brightness(0) invert(1)", opacity: 0.92 }
          : undefined
      }
    />
  );

  return (
    <section
      className={`border-y px-6 py-10`}
      style={{
        borderColor: darkBand ? "transparent" : subtleBorder,
        backgroundColor: darkBand ? "var(--color-primary)" : undefined,
      }}
    >
      <div className="mx-auto max-w-6xl">
        <p
          className="text-center text-sm font-medium uppercase tracking-wide"
          style={{ color: darkBand ? "rgba(255,255,255,0.82)" : "var(--color-muted)" }}
        >
          {title}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-10">
          {logos.map((logo, idx) =>
            logo.href ? (
              <a key={idx} href={logo.href} className="inline-flex items-center">
                {img(logo)}
              </a>
            ) : (
              <span key={idx} className="inline-flex items-center">
                {img(logo)}
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/** footer */
export function Footer(props: Record<string, unknown>) {
  const { tokens } = useSiteTheme();
  const footerUi = tokens.sectionUi?.marketing?.footer ?? "default";
  const invertedBand = footerUi === "inverted-band";

  const brand = props.brand as { name: string; description?: string };
  const linkGroups = (props.linkGroups ?? []) as Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  const socialLinks = (props.socialLinks ?? []) as Array<{ platform: string; href: string }>;
  const copyrightText = props.copyrightText as string | undefined;

  const labelMuted = invertedBand ? "rgba(255,255,255,0.75)" : "var(--color-muted)";
  const labelStrong = invertedBand ? "#ffffff" : "var(--color-text)";

  return (
    <footer
      className="border-t px-6 py-12"
      style={{
        borderColor: invertedBand ? "transparent" : subtleBorder,
        backgroundColor: invertedBand ? "color-mix(in srgb, var(--color-primary) 92%, black)" : undefined,
        color: invertedBand ? "#ffffff" : undefined,
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-semibold" style={{ color: labelStrong }}>
            {brand.name}
          </p>
          {brand.description ? (
            <p className="mt-2 text-sm leading-relaxed" style={{ color: labelMuted }}>
              {brand.description}
            </p>
          ) : null}
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3">
          {linkGroups.map((group, i) => (
            <div key={i}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: labelMuted }}>
                {group.title}
              </p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href} className="text-sm hover:underline" style={{ color: labelStrong }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {socialLinks.length > 0 ? (
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap gap-4">
          {socialLinks.map((s, i) => (
            <a key={i} href={s.href} className="text-sm" style={{ color: labelMuted }}>
              {s.platform}
            </a>
          ))}
        </div>
      ) : null}
      {copyrightText ? (
        <p className="mx-auto mt-8 max-w-6xl text-center text-xs" style={{ color: labelMuted }}>
          {copyrightText}
        </p>
      ) : null}
    </footer>
  );
}
