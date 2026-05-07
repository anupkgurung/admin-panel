import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="text-sm font-semibold">
            Admin Panel
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/pages" className="hover:underline">
              Pages
            </Link>
            <Link href="/" className="hover:underline" target="_blank">
              View site
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
