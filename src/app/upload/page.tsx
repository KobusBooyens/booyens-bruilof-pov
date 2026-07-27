import { SiteHeader } from "@/components/SiteHeader";
import { UploadFlow } from "@/components/UploadFlow";

export const metadata = { title: "Upload photos & videos · Kobus & Simoné" };

export default function UploadPage() {
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
            Upload your photos &amp; videos
          </h1>
          <p
            className="animate-rise mx-auto mt-2 max-w-md text-stone"
            style={{ animationDelay: "0.28s" }}
          >
            Add as many photos and videos as you like. You can come back later
            and add more.
          </p>
        </header>
        <div className="animate-rise" style={{ animationDelay: "0.4s" }}>
          <UploadFlow />
        </div>
      </main>
    </>
  );
}
