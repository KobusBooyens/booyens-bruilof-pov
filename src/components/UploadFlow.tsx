"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ImagePlus,
  Loader2,
  Check,
  AlertCircle,
  Camera,
  Film,
  RotateCcw,
} from "lucide-react";
import { QRCard } from "./QRCard";
import { cleanName, cx } from "@/lib/utils";
import type { MediaKind } from "@/lib/drive";

type Status = "wag" | "verklein" | "oplaai" | "klaar" | "fout";

type Item = {
  id: string;
  file: File;
  preview: string;
  kind: MediaKind;
  status: Status;
  error?: string;
};

const NAME_KEY = "bb-guest-name";

const STATUS_LABEL: Record<Status, string> = {
  wag: "In tou",
  verklein: "Verklein…",
  oplaai: "Laai op…",
  klaar: "Gelaai",
  fout: "Error",
};

export function UploadFlow() {
  const [name, setName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? "");
    setOrigin(window.location.origin);
  }, []);

  const doneCount = items.filter((i) => i.status === "klaar").length;
  const allDone = items.length > 0 && doneCount === items.length && !busy;

  const albumUrl = useMemo(
    () => (folderId && origin ? `${origin}/album/${folderId}` : ""),
    [folderId, origin]
  );

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const next: Item[] = Array.from(fileList)
      .filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"))
      .map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        preview: URL.createObjectURL(f),
        kind: f.type.startsWith("video/") ? "video" : "image",
        status: "wag" as Status,
      }));
    setItems((prev) => [...prev, ...next]);
  }

  async function startUpload() {
    const guest = cleanName(name);
    if (!guest) {
      inputRef.current?.focus();
      return;
    }
    localStorage.setItem(NAME_KEY, guest);
    setBusy(true);

    const pending = items.filter((i) => i.status !== "klaar");

    // Compress images in the browser (smaller = faster + stays well under
    // Vercel's request limit). Videos are uploaded as-is. Lazy-loaded so it
    // only ships when there's actually an image to shrink.
    const imageCompression = pending.some((i) => i.kind === "image")
      ? (await import("browser-image-compression")).default
      : null;

    let currentFolder = folderId;

    for (const item of pending) {
      try {
        let upload: Blob = item.file;
        let filename = item.file.name;

        if (item.kind === "image" && imageCompression) {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: "verklein", error: undefined } : i))
          );
          upload = await imageCompression(item.file, {
            maxSizeMB: 3,
            maxWidthOrHeight: 2560,
            useWebWorker: true,
            fileType: "image/jpeg",
          });
          filename = item.file.name.replace(/\.[^.]+$/, "") + ".jpg";
        }

        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "oplaai", error: undefined } : i))
        );

        const form = new FormData();
        form.append("name", guest);
        form.append("file", upload, filename);
        if (currentFolder) form.append("folderId", currentFolder);

        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Upload failed.");

        currentFolder = data.folderId;
        setFolderId(data.folderId);
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "klaar" } : i))
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "fout", error: (err as Error).message }
              : i
          )
        );
      }
    }

    setBusy(false);
  }

  const hasQueued = items.some((i) => i.status !== "klaar");
  const failedCount = items.filter((i) => i.status === "fout").length;

  return (
    <div className="space-y-8">
      {/* Name */}
      <div>
        <label htmlFor="guest" className="eyebrow mb-2 block">
          Skep 'n album
        </label>
        <input
          id="guest"
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Lawn Games!"
          className="w-full rounded-xl border border-line bg-parchment px-4 py-3 text-ink
                     outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/30"
        />
        <p className="mt-2 text-sm text-stone">
          Skep 'n album waar jy jou en jou gesin en vriende se foto's en video's kan oplaai en met almal kan deel.
        </p>
      </div>

      {/* Picker */}
      <div>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          id="photo-input"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            htmlFor="photo-input"
            className="flex cursor-pointer flex-col items-center justify-center gap-2
                       rounded-card border border-dashed border-sage/50 bg-parchment/60 px-6 py-8
                       text-center transition hover:border-sage hover:bg-parchment"
          >
            <ImagePlus className="text-sage-deep" size={26} />
            <span className="font-display text-lg text-ink">Kies foto's &amp; video's</span>
            <span className="text-sm text-stone">Kies uit jou albums</span>
          </label>

          <label
            htmlFor="photo-input"
            className="flex cursor-pointer flex-col items-center justify-center gap-2
                       rounded-card border border-dashed border-clay/40 bg-parchment/60 px-6 py-8
                       text-center transition hover:border-clay hover:bg-parchment sm:hidden"
          >
            <Camera className="text-clay" size={26} />
            <span className="font-display text-lg text-ink">Neem 'n foto of video</span>
            <span className="text-sm text-stone">Gebruik jou kamera</span>
          </label>
        </div>
      </div>

      {/* Queue */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-stone">
            <span>
              {items.length} {items.length === 1 ? "lêer" : "lêers"} gekies
            </span>
            {busy && (
              <span className="inline-flex items-center gap-1.5 text-sage-deep">
                <Loader2 className="animate-spin" size={14} /> {doneCount}/{items.length}
              </span>
            )}
          </div>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-sand"
              >
                {item.kind === "video" ? (
                  <video
                    src={item.preview}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}

                {item.kind === "video" && item.status !== "fout" && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/60 p-1 text-white">
                    <Film size={12} />
                  </span>
                )}

                <div
                  className={cx(
                    "absolute inset-0 flex items-end justify-center bg-gradient-to-t p-2 text-[0.7rem] font-medium text-white",
                    item.status === "klaar"
                      ? "from-sage-deep/80 to-transparent"
                      : item.status === "fout"
                        ? "from-clay-deep/85 to-transparent"
                        : "from-ink/70 to-transparent"
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {item.status === "klaar" && <Check size={12} />}
                    {item.status === "fout" && <AlertCircle size={12} />}
                    {(item.status === "verklein" || item.status === "oplaai") && (
                      <Loader2 size={12} className="animate-spin" />
                    )}
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {failedCount > 0 && !busy && (
            <p className="text-sm text-clay-deep">
              {failedCount} {failedCount === 1 ? "file" : "files"} failed.
              {items.find((i) => i.status === "fout")?.error
                ? ` ${items.find((i) => i.status === "fout")!.error}`
                : ""}{" "}
              Please try again.
            </p>
          )}
        </div>
      )}

      {/* Action */}
      {items.length > 0 && hasQueued && (
        <button onClick={startUpload} disabled={busy} className="btn-primary w-full">
          {busy ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Besig om op te laai…
            </>
          ) : failedCount > 0 ? (
            <>
              <RotateCcw size={18} /> Probeer weer
            </>
          ) : (
            <>Deel foto's</>
          )}
        </button>
      )}

      {/* Success + personal QR */}
      {allDone && albumUrl && (
        <div className="space-y-6 rounded-card border border-sage/30 bg-sage/5 p-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage-deep text-linen">
              <Check size={22} />
            </div>
            <h3 className="font-display text-2xl text-ink">Dankie, {cleanName(name)}!</h3>
            <p className="mx-auto mt-1 max-w-md text-stone">
              Jou foto's is deel van ons dag. Hier is jou persoonlike QR-kode —
              stoor of deel dit om jou album enige tyd oop te maak.
            </p>
          </div>

          <QRCard
            url={albumUrl}
            label="My album"
            caption="Skandeer om jou eie foto's te sien of nog by te voeg."
            filename={`album-${cleanName(name).replace(/\s+/g, "-").toLowerCase()}`}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/album/${folderId}`} className="btn-clay flex-1">
              Bekyk my album
            </Link>
            <Link href="/gallery" className="btn-ghost flex-1">
              Sien almal se foto's
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
