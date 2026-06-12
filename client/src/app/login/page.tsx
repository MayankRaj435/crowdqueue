import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { LOGIN_ROLE_CONFIG, LOGIN_ROLE_ORDER, getLoginPath } from "@/lib/authRoles";

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

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {LOGIN_ROLE_ORDER.map((role) => {
          const config = LOGIN_ROLE_CONFIG[role];

          return (
            <div
              key={role}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)]"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
                {config.subtitle}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{config.title}</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">{config.description}</p>

              <div className="mt-5 space-y-2">
                {config.capabilities.slice(0, 3).map((item) => (
                  <div key={item} className="flex gap-2 text-sm text-neutral-300">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/70" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {config.badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/[0.08] px-3 py-1 text-[11px] uppercase tracking-wide text-neutral-400"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <Link
                href={getLoginPath(role)}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
              >
                {config.ctaLabel}
              </Link>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center text-sm text-neutral-500">
        Customers can also create an account from the customer register page.
      </div>
    </PageShell>
  );
}
