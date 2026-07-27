"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ArrowLeft, ArrowRight, User } from "lucide-react";

/**
 * The /admin entry flow: choose "Login as admin" (reveals a username/password
 * form) or "Continue as guest" (redirect to the root app). Admin content only
 * renders server-side once the login sets a valid cookie.
 */
export function AdminGate() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "login">("choose");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed.");
      // Re-run the server component; it now sees the cookie and shows the dashboard.
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (mode === "choose") {
    return (
      <div className="mx-auto max-w-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sage/10 text-sage-deep">
          <Lock size={24} />
        </div>
        <h1 className="font-display text-3xl text-ink">Admin</h1>
        <p className="mx-auto mt-2 max-w-xs text-stone">
          Log in to manage the QR code for guests, or continue as a guest to the
          photo app.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button onClick={() => setMode("login")} className="btn-primary w-full">
            <Lock size={18} /> Login as admin
          </button>
          <button onClick={() => router.push("/")} className="btn-ghost w-full">
            Continue as guest <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm text-left">
      <button
        type="button"
        onClick={() => {
          setMode("choose");
          setError("");
        }}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone transition hover:text-ink"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-center font-display text-3xl text-ink">Admin login</h1>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-user" className="eyebrow mb-2 block">
            Username
          </label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone"
            />
            <input
              id="admin-user"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-line bg-parchment py-3 pl-9 pr-4 text-ink
                         outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/30"
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-pass" className="eyebrow mb-2 block">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone"
            />
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-line bg-parchment py-3 pl-9 pr-4 text-ink
                         outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/30"
            />
          </div>
        </div>

        {error && <p className="text-sm text-clay-deep">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Logging in…
            </>
          ) : (
            <>Login</>
          )}
        </button>
      </div>
    </form>
  );
}
