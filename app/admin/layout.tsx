import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/admin" className="text-sm font-semibold">
            Admin Panel
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin/pages" className="hover:underline">
              Pages
            </Link>
            <Link href="/" className="hover:underline" target="_blank">
              View site
            </Link>
            {session.user?.email ? (
              <span className="text-xs text-gray-500">
                {session.user.email}
              </span>
            ) : null}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
