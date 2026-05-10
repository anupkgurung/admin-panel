import Link from "next/link";

import { prisma } from "@/lib/db";
import { getActiveTheme } from "@/lib/admin/activeTheme";
import { resolveAllowedKeysForTheme } from "@/lib/sections/catalog";
import { NewPageForm } from "@/components/admin/NewPageForm";
import { ActiveThemeSwitcher } from "@/components/admin/ActiveThemeSwitcher";

export const dynamic = "force-dynamic";

export default async function AdminPagesIndex() {
  const activeTheme = await getActiveTheme();
  const [pages, themesRaw] = await Promise.all([
    prisma.page.findMany({
      where: { themeId: activeTheme.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
        _count: { select: { sections: true } },
      },
    }),
    prisma.theme.findMany({
      orderBy: { key: "asc" },
      select: { id: true, key: true, name: true, allowedComponents: true },
    }),
  ]);

  const themes = themesRaw.map((t) => ({
    id: t.id,
    key: t.key,
    name: t.name,
    allowedComponents: resolveAllowedKeysForTheme(
      t.key,
      t.allowedComponents,
    ),
  }));

  const current = themes.find((t) => t.key === activeTheme.key) ?? {
    id: activeTheme.id,
    key: activeTheme.key,
    name: activeTheme.name,
    allowedComponents: activeTheme.allowedComponents,
  };

  return (
    <div className="space-y-8">
      <ActiveThemeSwitcher current={current} themes={themes} />

      <section>
        <h1 className="text-xl font-semibold">Pages</h1>
        <p className="mt-1 text-sm text-gray-600">
          Active theme allows: {activeTheme.allowedComponents.join(", ") || "no components"}
        </p>
      </section>

      <section className="rounded border bg-white">
        <div className="grid grid-cols-12 border-b bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          <div className="col-span-4">Title</div>
          <div className="col-span-3">Slug</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Sections</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {pages.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500">No pages yet.</div>
        ) : (
          <ul className="divide-y">
            {pages.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-12 items-center px-4 py-3 text-sm"
              >
                <div className="col-span-4 font-medium">{p.title}</div>
                <div className="col-span-3">
                  <code className="font-mono text-xs">{p.slug}</code>
                </div>
                <div className="col-span-2">
                  <span
                    className={
                      p.status === "published"
                        ? "rounded bg-green-50 px-2 py-0.5 text-xs text-green-700"
                        : "rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
                    }
                  >
                    {p.status}
                  </span>
                </div>
                <div className="col-span-2 text-gray-700">
                  {p._count.sections}
                </div>
                <div className="col-span-1 text-right">
                  <Link
                    href={`/admin/pages/${p.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded border bg-white p-4">
        <h2 className="text-sm font-semibold">Create page</h2>
        <NewPageForm />
      </section>
    </div>
  );
}
