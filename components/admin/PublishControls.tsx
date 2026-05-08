"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { publishPage, unpublishPage } from "@/lib/admin/actions";
import type {
  AllowlistViolation,
  PropsViolation,
  PublishError,
} from "@/lib/types/admin";

export function PublishControls({
  pageId,
  status,
}: {
  pageId: string;
  status: "draft" | "published";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<PublishError | null>(null);

  function handlePublish() {
    setErr(null);
    startTransition(async () => {
      const result = await publishPage(pageId);
      if (!result.ok) {
        const details = (result.details ?? {}) as {
          themeKey?: string;
          allowlistViolations?: AllowlistViolation[];
          propViolations?: PropsViolation[];
        };
        setErr({
          error: result.code,
          themeKey: details.themeKey,
          allowlistViolations: details.allowlistViolations,
          propViolations: details.propViolations,
        });
        return;
      }
      router.refresh();
    });
  }

  function handleUnpublish() {
    setErr(null);
    startTransition(async () => {
      const result = await unpublishPage(pageId);
      if (!result.ok) {
        setErr({ error: result.code });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {status === "published" ? (
          <button
            type="button"
            disabled={pending}
            onClick={handleUnpublish}
            className="rounded bg-amber-600 px-3 py-1 text-sm font-medium text-white disabled:opacity-50"
          >
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={handlePublish}
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
