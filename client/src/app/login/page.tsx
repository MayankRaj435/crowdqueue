import { PageShell } from "@/components/ui/page-shell";
import { LoginPortalGrid } from "@/components/login/LoginPortalGrid";

export default function LoginPage() {
  return (
    <PageShell maxWidth="max-w-6xl" className="py-12">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">Sign in</p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold text-white">
          Choose your portal
        </h1>
        <p className="mt-4 text-neutral-400 leading-7">
          CrowdQueue has separate login entry points for customers, staff, and organization admins.
          Pick the one that matches what you need to do.
        </p>
      </div>

      <LoginPortalGrid />

      <div className="mt-10 text-center text-sm text-neutral-500">
        Customers can also create an account from the customer register page.
      </div>
    </PageShell>
  );
}
