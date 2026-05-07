"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SchemaForm, type JSONSchema } from "./SchemaForm";
import { PublishControls } from "./PublishControls";

type ComponentDef = {
  id: string;
  key: string;
  name: string;
  schema: object;
};

type SectionDTO = {
  id: string;
  order: number;
  enabled: boolean;
  instanceKey: string;
  props: Record<string, unknown>;
  component: ComponentDef;
};

type PageDTO = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  sections: SectionDTO[];
};

type ActiveTheme = {
  id: string;
  key: string;
  name: string;
  allowedComponents: string[];
};

export function PageBuilder({
  page,
  activeTheme,
  allowedComponents,
}: {
  page: PageDTO;
  activeTheme: ActiveTheme;
  allowedComponents: ComponentDef[];
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    page.sections[0]?.id ?? null,
  );

  const sortedSections = useMemo(
    () => [...page.sections].sort((a, b) => a.order - b.order),
    [page.sections],
  );

  function call(
    url: string,
    init?: RequestInit,
  ): Promise<{ ok: boolean; status: number; data: unknown }> {
    return fetch(url, init).then(async (res) => ({
      ok: res.ok,
      status: res.status,
      data: await res.json().catch(() => null),
    }));
  }

  async function refresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function addSection(componentKey: string) {
    setError(null);
    const res = await call(`/api/pages/${page.id}/sections`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ componentKey }),
    });
    if (!res.ok) {
      setError(formatError(res.data, res.status));
      return;
    }
    refresh();
  }

  async function deleteSection(sectionId: string) {
    setError(null);
    const res = await call(`/api/sections/${sectionId}`, { method: "DELETE" });
    if (!res.ok) {
      setError(formatError(res.data, res.status));
      return;
    }
    refresh();
  }

  async function toggleSection(sectionId: string, enabled: boolean) {
    setError(null);
    const res = await call(`/api/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      setError(formatError(res.data, res.status));
      return;
    }
    refresh();
  }

  async function moveSection(sectionId: string, direction: -1 | 1) {
    setError(null);
    const idx = sortedSections.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;
    const swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= sortedSections.length) return;

    const a = sortedSections[idx];
    const b = sortedSections[swapWith];
    const ordering = [
      { id: a.id, order: b.order },
      { id: b.id, order: a.order },
    ];

    const res = await call(`/api/pages/${page.id}/sections/reorder`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ordering }),
    });
    if (!res.ok) {
      setError(formatError(res.data, res.status));
      return;
    }
    refresh();
  }

  async function saveProps(sectionId: string, props: unknown) {
    setError(null);
    const res = await call(`/api/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ props }),
    });
    if (!res.ok) {
      setError(formatError(res.data, res.status));
      return;
    }
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-semibold">{page.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            <code className="font-mono text-xs">{page.slug}</code> · status:{" "}
            <span
              className={
                page.status === "published"
                  ? "rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                  : "rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
              }
            >
              {page.status}
            </span>
            {" "}· theme:{" "}
            <span className="font-medium">{activeTheme.name}</span>
          </p>
          <div className="mt-3">
            <PublishControls pageId={page.id} status={page.status} />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/admin/pages"
            className="text-gray-600 hover:underline"
          >
            ← All pages
          </Link>
          <Link
            href={page.slug}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            View page
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded border bg-white p-4">
        <h2 className="text-sm font-semibold">Add section</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {allowedComponents.length === 0 ? (
            <p className="text-sm text-gray-500">
              The active theme allows no components.
            </p>
          ) : (
            allowedComponents.map((c) => (
              <button
                key={c.key}
                disabled={busy}
                onClick={() => addSection(c.key)}
                className="rounded border bg-gray-50 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                + {c.name} ({c.key})
              </button>
            ))
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Sections</h2>
        {sortedSections.length === 0 ? (
          <p className="rounded border bg-white px-4 py-6 text-sm text-gray-500">
            No sections yet. Add one above.
          </p>
        ) : (
          sortedSections.map((s, idx) => (
            <SectionEditor
              key={s.id}
              section={s}
              index={idx}
              total={sortedSections.length}
              isOpen={openSectionId === s.id}
              onToggleOpen={() =>
                setOpenSectionId(openSectionId === s.id ? null : s.id)
              }
              onMove={moveSection}
              onDelete={deleteSection}
              onToggle={toggleSection}
              onSaveProps={saveProps}
              busy={busy}
            />
          ))
        )}
      </section>
    </div>
  );
}

function SectionEditor({
  section,
  index,
  total,
  isOpen,
  onToggleOpen,
  onMove,
  onDelete,
  onToggle,
  onSaveProps,
  busy,
}: {
  section: SectionDTO;
  index: number;
  total: number;
  isOpen: boolean;
  onToggleOpen: () => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onSaveProps: (id: string, props: unknown) => void;
  busy: boolean;
}) {
  const [draftProps, setDraftProps] = useState<unknown>(section.props);
  const dirty = JSON.stringify(draftProps) !== JSON.stringify(section.props);

  return (
    <article className="rounded border bg-white">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono">
            #{section.order}
          </span>
          <button
            type="button"
            onClick={onToggleOpen}
            className="font-medium hover:underline"
          >
            {section.component.name}{" "}
            <span className="text-xs text-gray-500">
              ({section.component.key} · {section.instanceKey})
            </span>
          </button>
          {!section.enabled ? (
            <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
              disabled
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            disabled={busy || index === 0}
            onClick={() => onMove(section.id, -1)}
            className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={busy || index === total - 1}
            onClick={() => onMove(section.id, 1)}
            className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggle(section.id, !section.enabled)}
            className="rounded border px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
          >
            {section.enabled ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (confirm(`Delete ${section.component.name}?`)) {
                onDelete(section.id);
              }
            }}
            className="rounded border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50 disabled:opacity-30"
          >
            Delete
          </button>
        </div>
      </header>
      {isOpen ? (
        <div className="space-y-3 px-4 py-4">
          <SchemaForm
            schema={section.component.schema as JSONSchema}
            value={draftProps}
            onChange={setDraftProps}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={!dirty || busy}
              onClick={() => setDraftProps(section.props)}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              disabled={!dirty || busy}
              onClick={() => onSaveProps(section.id, draftProps)}
              className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              Save props
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function formatError(data: unknown, status: number): string {
  if (data && typeof data === "object" && "error" in data) {
    const obj = data as {
      error: string;
      errors?: { path: string; message: string }[];
    };
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const detail = obj.errors
        .map((e) => `${e.path || "/"}: ${e.message}`)
        .join("; ");
      return `${obj.error} (HTTP ${status}) - ${detail}`;
    }
    return `${obj.error} (HTTP ${status})`;
  }
  return `Request failed (HTTP ${status})`;
}
