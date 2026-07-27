"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { QRCard } from "@/components/QRCard";

/**
 * Print-and-place page for the couple. Shows the QR that guests scan to reach
 * the site. Put it on table cards / signage. (Not linked in the guest nav.)
 */
export default function QRPage() {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-14 text-center">
        <p className="eyebrow justify-center">Vir die tafels</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Skandeer &amp; deel</h1>
        <p className="mx-auto mt-2 max-w-md text-stone">
          Druk hierdie QR-kode en plaas dit op die tafels of by die ingang. Gaste
          skandeer dit om hul foto's op te laai en almal s'n te sien.
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

        <p className="mt-8 text-sm text-stone">
          Wenk: elke gas kry ook hul eie QR-kode ná hul eerste oplaai, om hul
          persoonlike album weer oop te maak.
        </p>
      </main>
    </>
  );
}
