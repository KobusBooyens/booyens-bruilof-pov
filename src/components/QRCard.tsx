"use client";

import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import { useRef } from "react";

type Props = {
  url: string;
  label: string;
  caption?: string;
  filename?: string;
};

/** A framed QR code with a one-tap PNG download. */
export function QRCard({ url, label, caption, filename = "qr-kode" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function download() {
    const canvas = wrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="card flex flex-col items-center p-6 text-center">
      <p className="eyebrow mb-4">{label}</p>
      <div
        ref={wrapRef}
        className="rounded-xl border border-line bg-white p-4 shadow-soft"
      >
        <QRCodeCanvas
          value={url}
          size={200}
          level="M"
          marginSize={2}
          fgColor="#4F5A41"
          bgColor="#ffffff"
        />
      </div>
      {caption && <p className="mt-4 max-w-[15rem] text-sm text-stone">{caption}</p>}
      <button onClick={download} className="btn-ghost mt-4 text-sm">
        <Download size={16} /> Laai QR-kode af
      </button>
    </div>
  );
}
