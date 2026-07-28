import { SiteHeader } from "@/components/SiteHeader";
import { UploadFlow } from "@/components/UploadFlow";

export const metadata = { title: "Upload photos & videos · Kobus & Simoné" };

export default function UploadPage({
  searchParams,
}: {
  searchParams: { album?: string; name?: string };
}) {
  const albumId =
    typeof searchParams.album === "string" && searchParams.album
      ? searchParams.album
      : undefined;
  const albumName =
    typeof searchParams.name === "string" && searchParams.name
      ? searchParams.name
      : undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pt-12 pb-[calc(3rem+env(safe-area-inset-bottom))]">
        <header className="mb-8 text-center">
          <p
            className="eyebrow animate-rise justify-center"
            style={{ animationDelay: "0.05s" }}
          >
            Share your moments
          </p>
          <h1
            className="animate-rise mt-3 font-display text-4xl text-ink"
            style={{ animationDelay: "0.15s" }}
          >
            {albumId ? (
              <>
                Add to <span className="italic text-sage-deep">{albumName ?? "this album"}</span>
              </>
            ) : (
              <>Upload your photos &amp; videos</>
            )}
          </h1>
          <p
            className="animate-rise mx-auto mt-2 max-w-md text-stone"
            style={{ animationDelay: "0.28s" }}
          >
            {albumId
              ? "Your photos and videos will be added to this album for everyone to see."
              : "Add as many photos and videos as you like. You can come back later and add more."}
          </p>
        </header>
        <div className="animate-rise" style={{ animationDelay: "0.4s" }}>
          <UploadFlow targetAlbumId={albumId} targetAlbumName={albumName} />
        </div>
      </main>
    </>
  );
}
