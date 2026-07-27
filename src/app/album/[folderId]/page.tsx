import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getAlbum } from "@/lib/drive";

// Always show the freshest photos for an album (guests expect their upload to
// appear immediately).
export const dynamic = "force-dynamic";

export default async function AlbumPage({
  params,
}: {
  params: { folderId: string };
}) {
  const album = await getAlbum(params.folderId);
  if (!album) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        <Link
          href="/gallery"
          className="animate-rise inline-flex items-center gap-1.5 text-sm text-stone transition hover:text-ink"
          style={{ animationDelay: "0.05s" }}
        >
          <ArrowLeft size={16} /> Terug na galery
        </Link>

        <header className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow animate-rise" style={{ animationDelay: "0.12s" }}>
              Album
            </p>
            <h1
              className="animate-rise mt-2 font-display text-4xl text-ink"
              style={{ animationDelay: "0.2s" }}
            >
              {album.name}
            </h1>
            <p className="animate-rise mt-1 text-stone" style={{ animationDelay: "0.3s" }}>
              {album.photos.length}{" "}
              {album.photos.length === 1 ? "foto" : "foto's"}
            </p>
          </div>
          <Link
            href="/upload"
            className="btn-clay animate-rise text-sm"
            style={{ animationDelay: "0.38s" }}
          >
            <Plus size={16} /> Voeg foto's by
          </Link>
        </header>

        {album.photos.length === 0 ? (
          <div className="card p-12 text-center text-stone">
            Hierdie album is nog leeg.
          </div>
        ) : (
          <PhotoGrid photos={album.photos} />
        )}
      </main>
    </>
  );
}
