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
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 text-sm text-stone transition hover:text-ink"
        >
          <ArrowLeft size={16} /> Back to gallery
        </Link>

        <header className="mb-8 mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Album</p>
            <h1 className="mt-2 font-display text-4xl text-ink">{album.name}</h1>
            <p className="mt-1 text-stone">
              {album.photos.length}{" "}
              {album.photos.length === 1 ? "photo" : "photos"}
            </p>
          </div>
          <Link
            href={`/upload?album=${params.folderId}&name=${encodeURIComponent(album.name)}`}
            className="btn-clay text-sm"
          >
            <Plus size={16} /> Add photos
          </Link>
        </header>

        {album.photos.length === 0 ? (
          <div className="card p-12 text-center text-stone">
            This album is empty.
          </div>
        ) : (
          <PhotoGrid photos={album.photos} />
        )}
      </main>
    </>
  );
}
