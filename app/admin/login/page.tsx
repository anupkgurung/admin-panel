"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Invalid credentials");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const callback = params.get("callbackUrl") ?? "/admin/pages";
      window.location.assign(callback);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="text-xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sign in with the credentials configured in <code>.env</code> (
        <code>ADMIN_EMAIL</code> + <code>ADMIN_PASSWORD</code>).
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
            Email
          </span>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-600">
            Password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
