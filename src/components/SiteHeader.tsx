import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-linen/85 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-linen/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-lg tracking-wide text-ink">
          Kobus <span className="text-clay">&amp;</span> Simoné
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/upload"
            className="rounded-full px-3 py-1.5 text-stone transition hover:bg-parchment hover:text-ink"
          >
            Upload
          </Link>
          <Link
            href="/gallery"
            className="rounded-full px-3 py-1.5 text-stone transition hover:bg-parchment hover:text-ink"
          >
            Gallery
          </Link>
        </nav>
      </div>
    </header>
  );
}
