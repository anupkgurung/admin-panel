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
  const { headline, subheadline, cta } = props;

  return (
    <section
      className="border-b px-6"
      style={{
        paddingTop: "var(--spacing-section-y)",
        paddingBottom: "var(--spacing-section-y)",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <h1
          className="text-3xl font-light tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          {headline}
        </h1>
        {subheadline ? (
          <p
            className="mt-3 max-w-xl text-base"
            style={{ color: "var(--color-muted)" }}
          >
            {subheadline}
          </p>
        ) : null}
        <a
          href={cta.href}
          className="mt-6 inline-block border px-4 py-2 text-sm"
          style={{
            color: "var(--color-text)",
            borderColor: "var(--color-text)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {cta.label}
        </a>
      </div>
    </section>
  );
}
