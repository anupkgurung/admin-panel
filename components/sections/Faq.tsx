"use client";

import { useSiteTheme } from "@/lib/theme/ThemeProvider";

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
