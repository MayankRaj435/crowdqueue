"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const navLinks = isAuthenticated
    ? [
        { href: "/discover", label: "Discover" },
        { href: "/my-tokens", label: "My Tokens" },
        ...(user?.role === "org_admin"
          ? [{ href: "/org/dashboard", label: "Dashboard" }]
          : []),
      ]
    : [];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed z-50 transition-all duration-300 ease-out",
        isScrolled
          ? "top-4 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-2xl border border-white/[0.1] bg-black/50 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "top-0 left-0 right-0 w-full border-b border-white/[0.04] bg-black/20 backdrop-blur-sm"
      )}
    >
      <div className={cn("mx-auto max-w-7xl px-6 flex items-center justify-between transition-all duration-300", isScrolled ? "h-14" : "h-20")}>
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-black font-black text-sm">Q</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight group-hover:opacity-80 transition-opacity">
            CrowdQueue
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                pathname === link.href
                  ? "text-white bg-white/10"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-400">{user?.name}</span>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-neutral-400 hover:text-white rounded-full hover:bg-white/[0.05] transition-all"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-neutral-200 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.06] bg-black/95 backdrop-blur-xl"
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    pathname === link.href
                      ? "text-white bg-white/10"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-2 space-y-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-neutral-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-medium text-black bg-white rounded-xl text-center">
                    Get Started
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-sm text-neutral-400 hover:text-white rounded-xl hover:bg-white/[0.05]">
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
