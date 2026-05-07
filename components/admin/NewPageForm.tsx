"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewPageForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`);
        return;
      }
      setSlug("");
      setTitle("");
      router.refresh();
      router.push(`/admin/pages/${data.page.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown_error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid grid-cols-12 gap-3">
      <input
        className="col-span-5 rounded border px-3 py-2 text-sm"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        className="col-span-5 rounded border px-3 py-2 text-sm font-mono"
        placeholder="/slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={busy}
        className="col-span-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Creating..." : "Create"}
      </button>
      {error ? (
        <p className="col-span-12 text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
