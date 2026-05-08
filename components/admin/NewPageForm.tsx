"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createPage } from "@/lib/admin/actions";

export function NewPageForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createPage({ slug, title });
      if (!result.ok) {
        setError(result.code);
        return;
      }
      setSlug("");
      setTitle("");
      router.push(`/admin/pages/${result.data.id}`);
    });
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
        disabled={pending}
        className="col-span-2 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create"}
      </button>
      {error ? (
        <p className="col-span-12 text-sm text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
