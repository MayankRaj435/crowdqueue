"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getLoginPath, getLoginRoleFromPathname, type PortalRole } from "@/lib/authRoles";

export function ProtectedRoute({
  children,
  roles,
  loginRole,
}: {
  children: React.ReactNode;
  roles?: string[];
  loginRole?: PortalRole;
}) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const resolvedLoginRole = loginRole ?? getLoginRoleFromPathname(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${getLoginPath(resolvedLoginRole)}?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    if (!isLoading && isAuthenticated && roles && user && !roles.includes(user.role)) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, roles, router, pathname, resolvedLoginRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (roles && user && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
