"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/ui/page-shell";
import { RoleLoginForm } from "@/components/auth/RoleLoginForm";
import { LOGIN_ROLE_CONFIG, type PortalRole } from "@/lib/authRoles";

function LoginRolePage() {
  const params = useParams<{ role: string }>();
  const role = params?.role as PortalRole;

  if (!role || !(role in LOGIN_ROLE_CONFIG)) {
    return (
      <PageShell maxWidth="max-w-2xl" className="min-h-[calc(100vh-5rem)] py-12 flex items-center">
        <div className="w-full rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Invalid portal</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white">Unknown login route</h1>
          <p className="mt-3 text-neutral-400">
            The login portal you opened does not exist. Go back to the portal selector.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Choose a login portal
          </Link>
        </div>
      </PageShell>
    );
  }

  return <RoleLoginForm config={LOGIN_ROLE_CONFIG[role]} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <LoginRolePage />
    </Suspense>
  );
}
