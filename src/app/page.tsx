import Link from "next/link";
import { Camera, Images } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Contours, Ridge } from "@/components/Contours";
import { listAlbums } from "@/lib/drive";

// Reflect the latest uploads so the running total is always current.
export const dynamic = "force-dynamic";

/** Total photos + number of albums that actually hold photos. */
async function getStats(): Promise<{ photos: number; albums: number }> {
  try {
    const albums = await listAlbums();
    const withPhotos = albums.filter((a) => a.count > 0);
    return {
      photos: withPhotos.reduce((sum, a) => sum + a.count, 0),
      albums: withPhotos.length,
    };
  } catch {
    return { photos: 0, albums: 0 };
  }
}

export default async function HomePage() {
  const { photos, albums } = await getStats();

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero — grows to fill the viewport so the footer sits at the bottom
            without scrolling on desktop. */}
        <section className="relative flex flex-1 flex-col overflow-hidden">
          {/* Background photo with a slow Ken Burns drift + a cream scrim so the
              earthy text stays readable. Tune the scrim (bg-linen/…) to make the
              photo more or less prominent. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-section.jpg"
              alt=""
              className="animate-kenburns h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linen/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-linen/70 via-transparent to-linen/85" />
          </div>

          <div className="grain absolute inset-0 opacity-70" aria-hidden />
          <Contours className="pointer-events-none absolute inset-x-0 bottom-0 h-52 w-full text-sage/35" />

          <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-12 text-center">
            <p
              className="eyebrow animate-rise justify-center"
              style={{ animationDelay: "0.05s" }}
            >
              16 Oktober 2026 · Intiem Weddings · Foto Album
            </p>
            <h1
              className="animate-rise mt-5 font-display text-5xl leading-[1.05] text-ink sm:text-6xl"
              style={{ animationDelay: "0.15s" }}
            >
              Deel jou oomblikke op
              <span className="mt-1 block italic text-sage-deep">ons groot dag</span>
            </h1>
            <p
              className="animate-rise mx-auto mt-5 max-w-xl text-lg text-stone"
              style={{ animationDelay: "0.28s" }}
            >
              Elke gas sien iets anders. Laai jou foto's en video's op, dan bou
              ons saam een groot album wat oorloop met herinneringe van Kobus &amp; Simoné se trou dag — van die
              begin tot die einde!
            </p>

            <div
              className="animate-rise mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "0.4s" }}
            >
              <Link href="/upload" className="btn-primary w-full sm:w-auto">
                <Camera size={18} /> Laai jou foto's op
              </Link>
              <Link href="/gallery" className="btn-ghost w-full sm:w-auto">
                <Images size={18} /> Albums
              </Link>
            </div>

            {photos > 0 && (
              <Link
                href="/gallery"
                style={{ animationDelay: "0.52s" }}
                className="animate-rise mt-8 inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/60 px-5 py-2 text-sm text-stone shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:text-clay"
              >
                <Images size={16} className="text-sage" />
                <span>
                  Kom kyk na{" "}
                  <strong className="font-display text-ink">{photos}</strong>{" "}
                  {photos === 1 ? "foto" : "foto's"} in{" "}
                  <strong className="font-display text-ink">{albums}</strong>{" "}
                  {albums === 1 ? "album" : "albums"} — voeg joune by.
                </span>
              </Link>
            )}
          </div>

          <Ridge className="h-8 w-full text-line" />
        </section>

        {/* How it works */}
        {/* <section className="mx-auto max-w-4xl px-5 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "Een",
                title: "Skep 'n album",
                body: "Wees kreatief, Ons skep 'n album net vir jou — geen aanmelding of app nodig nie.",
              },
              {
                step: "Twee",
                title: "Laai op",
                body: "Kies foto's en video's van die dag. Ons verklein foto's vinnig sodat oplaai blitsig is.",
              },
            ].map((item) => (
              <div key={item.step} className="card p-6">
                <p className="eyebrow">{item.step}</p>
                <h3 className="mt-3 font-display text-xl text-ink">{item.title}</h3>
                <p className="mt-2 text-stone">{item.body}</p>
              </div>
            ))}
          </div>
        </section> */}
      </main>

      <footer className="border-t border-line/70 py-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center text-sm text-stone">
        <p className="font-display text-base text-ink">Kobus &amp; Simoné</p>
        <p className="mt-1">Gemaak met liefde vir 16 Oktober 2026.</p>
      </footer>
    </div>
  );
}
