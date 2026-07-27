import Link from "next/link";
import { Images, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { listAlbums } from "@/lib/drive";

export const metadata = { title: "Albums · Kobus & Simoné" };
// Always reflect the latest albums so a guest's fresh upload shows up straight away.
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let albums: Awaited<ReturnType<typeof listAlbums>> = [];
  let error = false;
  try {
    albums = await listAlbums();
  } catch {
    error = true;
  }

  const withPhotos = albums.filter((a) => a.count > 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Sien hoe ander die dag ervaar</p>
            <h1 className="mt-2 font-display text-4xl text-ink">Albums</h1>
          </div>
          <Link href="/upload" className="btn-clay text-sm">
            Laai jou eie op
          </Link>
        </header>

        {error && (
          <div className="card p-8 text-center text-stone">
            We couldn&apos;t load the albums. Please try again later.
          </div>
        )}

        {!error && withPhotos.length === 0 && (
          <div className="card flex flex-col items-center p-12 text-center">
            <Images className="text-sage" size={30} />
            <h2 className="mt-4 font-display text-2xl text-ink">Nog geen foto's nie</h2>
            <p className="mt-2 max-w-sm text-stone">
              Wees die eerste om 'n oomblik te deel — jou album verskyn sodra jy
              oplaai.
            </p>
            <Link href="/upload" className="btn-primary mt-6">
              Laai die eerste foto's op
            </Link>
          </div>
        )}

        {!error && withPhotos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {withPhotos.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group card overflow-hidden transition hover:-translate-y-0.5 hover:shadow-photo"
              >
                <div className="aspect-square overflow-hidden bg-sand">
                  {album.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.cover}
                      alt={album.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sage">
                      <Images size={26} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg text-ink">{album.name}</p>
                    <p className="text-xs text-stone">
                      {album.count} {album.count === 1 ? "foto" : "foto's"}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-stone transition group-hover:translate-x-0.5 group-hover:text-clay"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
