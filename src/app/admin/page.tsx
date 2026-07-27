import { SiteHeader } from "@/components/SiteHeader";
import { AdminGate } from "@/components/AdminGate";
import { AdminDashboard } from "@/components/AdminDashboard";
import { isAdmin } from "@/lib/admin";

export const metadata = {
  title: "Admin · Kobus & Simoné",
  robots: { index: false, follow: false },
};

// Reads the admin cookie, so it must render per-request.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  const authed = isAdmin();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] text-center">
        {authed ? <AdminDashboard /> : <AdminGate />}
      </main>
    </>
  );
}
