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
  const { variant = "centered", headline, subheadline, cta } = props;
  const isSplit = variant === "split";

  return (
    <section
      className="px-6"
      style={{
        paddingTop: "var(--spacing-section-y)",
        paddingBottom: "var(--spacing-section-y)",
      }}
    >
      <div
        className={`mx-auto max-w-5xl ${
          isSplit
            ? "grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center"
            : "text-center"
        }`}
      >
        <div>
          <h1
            className="text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: "var(--color-text)" }}
          >
            {headline}
          </h1>
          {subheadline ? (
            <p
              className="mt-4 text-lg"
              style={{ color: "var(--color-muted)" }}
            >
              {subheadline}
            </p>
          ) : null}
          <a
            href={cta.href}
            className="mt-8 inline-block px-6 py-3 text-sm font-semibold text-white"
            style={{
              backgroundColor: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
            }}
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
