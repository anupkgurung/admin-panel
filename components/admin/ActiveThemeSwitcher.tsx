"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { setActiveTheme } from "@/lib/admin/actions";
import type { AllowlistViolation, ThemeDTO } from "@/lib/types/admin";

export function ActiveThemeSwitcher({
  current,
  themes,
}: {
  current: ThemeDTO;
  themes: ThemeDTO[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [violations, setViolations] = useState<AllowlistViolation[]>([]);

  function switchTo(themeKey: string) {
    if (themeKey === current.key) return;
    setError(null);
    setViolations([]);
    startTransition(async () => {
      const result = await setActiveTheme(themeKey);
      if (!result.ok) {
        setError(result.code);
        const details = (result.details ?? {}) as {
          violations?: AllowlistViolation[];
        };
        if (Array.isArray(details.violations)) {
          setViolations(details.violations);
        }
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded border bg-white p-4">
      <h3 className="text-sm font-semibold">Active site theme</h3>
      <p className="mt-1 text-sm text-gray-600">
        Currently:{" "}
        <span className="font-medium">{current.name}</span> (
        <code className="font-mono text-xs">{current.key}</code>) - allows{" "}
        {current.allowedComponents.join(", ") || "no components"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {themes.map((t) => (
          <button
            key={t.key}
            disabled={pending || t.key === current.key}
            onClick={() => switchTo(t.key)}
            className={
              t.key === current.key
                ? "rounded border bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                : "rounded border bg-gray-50 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            }
            title={`allows: ${t.allowedComponents.join(", ") || "none"}`}
          >
            {t.name}
            {t.key === current.key ? " · active" : ""}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">{error}</p>
          {violations.length > 0 ? (
            <>
              <p className="mt-2 text-xs">
                The following sections use components not allowed by the new
                theme. Remove or replace them, then try again.
              </p>
              <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
                {violations.map((v) => (
                  <li key={v.sectionId}>
                    Page <code className="font-mono">{v.pageSlug}</code> (
                    {v.pageTitle}) - component{" "}
                    <code className="font-mono">{v.componentKey}</code> ({v.instanceKey})
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
