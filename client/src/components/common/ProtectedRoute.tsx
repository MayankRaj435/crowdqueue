"use client";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { getLoginPath, getLoginRoleFromPathname, type PortalRole } from "@/lib/authRoles";
import { PageSkeleton } from "@/components/ui/skeleton";

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
      <div className="min-h-screen bg-black max-w-6xl mx-auto px-6 py-12">
        <PageSkeleton rows={4} />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (roles && user && !roles.includes(user.role)) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
