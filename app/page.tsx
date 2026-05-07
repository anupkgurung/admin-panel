import Link from "next/link";

export default function HomePlaceholder() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Admin Panel CMS</h1>
      <p className="mt-3 text-gray-600">
        Phase 0/1 scaffold is up. Public site rendering will arrive in Phase 2.
      </p>

      <ul className="mt-8 space-y-2 text-sm">
        <li>
          <Link className="text-blue-600 underline" href="/api/health">
            GET /api/health
          </Link>{" "}
          - DB connectivity check
        </li>
        <li>
          <Link className="text-blue-600 underline" href="/preview/home">
            /preview/home
          </Link>{" "}
          - basic seeded data preview
        </li>
      </ul>
    </main>
  );
}
