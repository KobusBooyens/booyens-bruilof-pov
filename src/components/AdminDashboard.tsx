"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { QRCard } from "./QRCard";

/**
 * Admin view (rendered only once the admin cookie is valid). For now it holds
 * the single QR that guests scan to open the web app. Per-album QR codes are
 * deferred.
 */
export function AdminDashboard() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");

  useEffect(() => setOrigin(window.location.origin), []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="mb-6 flex items-center justify-between gap-4 text-left">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Guest access QR</h1>
        </div>
        <button onClick={logout} className="btn-ghost text-sm">
          <LogOut size={16} /> Log out
        </button>
      </div>

      <p className="mx-auto max-w-md text-stone">
        Print this QR and place it on the tables or at the entrance. Guests scan
        it to open the app, upload their photos &amp; videos, and see everyone
        else&apos;s.
      </p>

      <div className="mx-auto mt-8 max-w-xs">
        {origin ? (
          <QRCard
            url={origin}
            label="Kobus & Simoné · Foto's"
            caption={origin.replace(/^https?:\/\//, "")}
            filename="troue-fotos-qr"
          />
        ) : (
          <div className="card h-72 animate-pulse" />
        )}
      </div>
    </div>
  );
}
