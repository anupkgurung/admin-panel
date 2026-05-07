"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AllowlistViolation = {
  sectionId: string;
  instanceKey: string;
  componentKey: string;
};

type PropsViolation = {
  sectionId: string;
  instanceKey: string;
  componentKey: string;
  errors: { path: string; message: string }[];
};

type PublishError = {
  error: string;
  themeKey?: string;
  allowlistViolations?: AllowlistViolation[];
  propViolations?: PropsViolation[];
};

export function PublishControls({
  pageId,
  status,
}: {
  pageId: string;
  status: "draft" | "published";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<PublishError | null>(null);

  async function publish() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data as PublishError);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function unpublish() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/pages/${pageId}/unpublish`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data as PublishError);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {status === "published" ? (
          <button
            type="button"
            disabled={busy}
            onClick={unpublish}
            className="rounded bg-amber-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={publish}
            className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
          >
            Publish
          </button>
        )}
      </div>

      {err ? (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">{err.error}</p>
          {err.allowlistViolations && err.allowlistViolations.length > 0 ? (
            <div className="mt-2">
              <p className="text-xs font-medium">
                Sections using components not allowed by the active theme
                {err.themeKey ? ` (${err.themeKey})` : ""}:
              </p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {err.allowlistViolations.map((v) => (
                  <li key={v.sectionId}>
                    {v.componentKey} ({v.instanceKey})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {err.propViolations && err.propViolations.length > 0 ? (
            <div className="mt-2">
              <p className="text-xs font-medium">Sections with invalid props:</p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {err.propViolations.map((v) => (
                  <li key={v.sectionId}>
                    {v.componentKey} ({v.instanceKey}):{" "}
                    {v.errors
                      .map((e) => `${e.path || "/"} - ${e.message}`)
                      .join("; ")}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
