type FaqItem = { question: string; answer: string };
type FaqProps = { title?: string; items: FaqItem[] };

export function Faq({ title = "FAQs", items }: FaqProps) {
  return (
    <section
      className="px-6"
      style={{
        paddingTop: "var(--spacing-section-y)",
        paddingBottom: "var(--spacing-section-y)",
      }}
    >
      <div className="mx-auto max-w-3xl">
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h2>
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
      </div>
    </section>
  );
}
