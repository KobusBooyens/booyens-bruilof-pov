import { SiteHeader } from "@/components/SiteHeader";
import { UploadFlow } from "@/components/UploadFlow";

export const metadata = { title: "Laai foto's & video's op · Kobus & Simoné" };

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
            Deel jou oomblikke
          </p>
          <h1
            className="animate-rise mt-3 font-display text-4xl text-ink"
            style={{ animationDelay: "0.15s" }}
          >
            Laai jou foto's &amp; video's op
          </h1>
          <p
            className="animate-rise mx-auto mt-2 max-w-md text-stone"
            style={{ animationDelay: "0.28s" }}
          >
            Voeg soveel foto's en video's by soos jy wil. Jy kan later terugkom
            en meer byvoeg.
          </p>
        </header>
        <div className="animate-rise" style={{ animationDelay: "0.4s" }}>
          <UploadFlow />
        </div>
      </main>
    </>
  );
}
