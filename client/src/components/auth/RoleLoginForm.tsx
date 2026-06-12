"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { FormInput } from "@/components/ui/form-input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { PageShell } from "@/components/ui/page-shell";
import { getDefaultRedirectForRole, type LoginRoleConfig } from "@/lib/authRoles";

type RoleLoginFormProps = {
  config: LoginRoleConfig;
};

export function RoleLoginForm({ config }: RoleLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.phone, form.password, config.role);
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl || getDefaultRedirectForRole(config.role));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell maxWidth="max-w-md" className="flex min-h-[calc(100vh-5rem)] items-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{config.subtitle}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">{config.title}</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-400">{config.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {config.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/[0.08] bg-black/30 px-3 py-1 text-[11px] uppercase tracking-wide text-neutral-400"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-neutral-400 text-sm">Sign in to access the tools for this portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="9876543210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            maxLength={10}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <ShimmerButton type="submit" disabled={loading} className="w-full mt-6">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              config.ctaLabel
            )}
          </ShimmerButton>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm text-neutral-500">
          <p>
            Need a different portal?{" "}
            <Link href="/login" className="text-white hover:underline">
              Choose another login
            </Link>
          </p>
          {config.role === "customer" && (
            <p>
              New here?{" "}
              <Link href="/register" className="text-white hover:underline">
                Create a customer account
              </Link>
            </p>
          )}
          {config.role === "admin" && (
            <p>
              Need to register an organization?{" "}
              <Link href="/org/register" className="text-white hover:underline">
                Start organization registration
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </PageShell>
  );
}
