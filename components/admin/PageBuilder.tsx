"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SchemaForm, type JSONSchema } from "./SchemaForm";
import { PublishControls } from "./PublishControls";
import {
  addSection,
  deleteSection,
  reorderSection,
  updateSection,
} from "@/lib/admin/actions";
import type {
  ActiveThemeDTO,
  ComponentDef,
  PageDTO,
  SectionDTO,
} from "@/lib/types/admin";

export function PageBuilder({
  page,
  activeTheme,
  allowedComponents,
}: {
  page: PageDTO;
  activeTheme: ActiveThemeDTO;
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

  function handleAddSection(componentKey: string) {
    setError(null);
    startTransition(async () => {
      const result = await addSection(page.id, componentKey);
      if (!result.ok) {
        setError(formatActionError(result.code, result.details));
        return;
      }
      router.refresh();
    });
  }

  function handleDeleteSection(sectionId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteSection(sectionId);
      if (!result.ok) {
        setError(formatActionError(result.code, result.details));
        return;
      }
      router.refresh();
    });
  }

  function handleToggleSection(sectionId: string, enabled: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await updateSection(sectionId, { enabled });
      if (!result.ok) {
        setError(formatActionError(result.code, result.details));
        return;
      }
      router.refresh();
    });
  }

  function handleMoveSection(sectionId: string, direction: -1 | 1) {
    setError(null);
    startTransition(async () => {
      const result = await reorderSection(page.id, sectionId, direction);
      if (!result.ok) {
        setError(formatActionError(result.code, result.details));
        return;
      }
      router.refresh();
    });
  }

  function handleSaveProps(sectionId: string, props: unknown) {
    setError(null);
    startTransition(async () => {
      const result = await updateSection(sectionId, {
        props: props as Record<string, unknown>,
      });
      if (!result.ok) {
        setError(formatActionError(result.code, result.details));
        return;
      }
      router.refresh();
    });
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
                onClick={() => handleAddSection(c.key)}
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
              onMove={handleMoveSection}
              onDelete={handleDeleteSection}
              onToggle={handleToggleSection}
              onSaveProps={handleSaveProps}
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

function formatActionError(code: string, details: unknown): string {
  if (
    details &&
    typeof details === "object" &&
    "errors" in details &&
    Array.isArray((details as { errors?: unknown }).errors)
  ) {
    const errors = (details as { errors: { path: string; message: string }[] })
      .errors;
    const detail = errors
      .map((e) => `${e.path || "/"}: ${e.message}`)
      .join("; ");
    return `${code} - ${detail}`;
  }
  return code;
}
