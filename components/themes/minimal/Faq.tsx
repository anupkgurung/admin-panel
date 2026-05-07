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
          className="text-xl font-light uppercase tracking-widest"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h2>
        <ul className="mt-6 divide-y" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
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
      </div>
    </section>
  );
}
