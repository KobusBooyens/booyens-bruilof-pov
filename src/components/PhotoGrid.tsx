"use client";

import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Photo } from "@/lib/drive";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (active === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setActive(i)}
            className="group relative block w-full overflow-hidden rounded-xl border border-line bg-sand shadow-photo
                       transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-sage"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumb}
              alt={photo.name}
              loading="lazy"
              // Google's image CDN returns an HTML error (blocked by ORB) when a
              // referrer is sent — no-referrer makes it serve the actual image.
              referrerPolicy="no-referrer"
              className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            {photo.kind === "video" && (
              <span
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/55 text-white backdrop-blur-sm transition group-hover:bg-clay">
                  <Play size={20} className="translate-x-0.5 fill-current" />
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={close}
            aria-label="Maak toe"
          >
            <X size={22} />
          </button>

          <button
            className="absolute left-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Vorige"
          >
            <ChevronLeft size={26} />
          </button>

          {photos[active].kind === "video" ? (
            <iframe
              src={photos[active].embed}
              title={photos[active].name}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="aspect-video max-h-[85vh] w-full max-w-4xl rounded-lg bg-black shadow-photo"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photos[active].full}
              alt={photos[active].name}
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-photo"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          <button
            className="absolute right-3 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Volgende"
          >
            <ChevronRight size={26} />
          </button>

          <span className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] text-sm text-white/70">
            {active + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}
