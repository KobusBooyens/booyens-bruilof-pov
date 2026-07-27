import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
        <p className="eyebrow">Oops</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Page not found</h1>
        <p className="mt-2 text-stone">
          This album or page doesn&apos;t exist (anymore). Let&apos;s get you back.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Back to home
        </Link>
      </main>
    </>
  );
}
