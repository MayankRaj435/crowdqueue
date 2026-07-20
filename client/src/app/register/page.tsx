"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FormInput } from "@/components/ui/form-input";
import { PageShell } from "@/components/ui/page-shell";
import { PageSkeleton } from "@/components/ui/skeleton";
import { fadeUp } from "@/lib/motion";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.phone, form.password, form.email || undefined);
      const callbackUrl = searchParams.get("callbackUrl");
      router.push(callbackUrl || "/discover");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Full Name", type: "text", placeholder: "Rahul Sharma" },
    { name: "phone", label: "Phone Number", type: "tel", placeholder: "9876543210", maxLength: 10 },
    { name: "email", label: "Email (optional)", type: "email", placeholder: "rahul@example.com" },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
  ] as const;

  return (
    <PageShell maxWidth="max-w-md" className="flex min-h-[calc(100vh-5rem)] items-center py-8">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="w-full"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-neutral-400 text-sm">Join CrowdQueue and stop waiting in lines</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {fields.map((field, i) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <FormInput
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                maxLength={"maxLength" in field ? field.maxLength : undefined}
                value={form[field.name as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                required={field.name !== "email"}
              />
            </motion.div>
          ))}

          <ShimmerButton type="submit" disabled={loading} className="w-full mt-6">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </ShimmerButton>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href={
              searchParams.get("callbackUrl")
                ? `/login?callbackUrl=${encodeURIComponent(searchParams.get("callbackUrl")!)}`
                : "/login"
            }
            className="text-white hover:underline transition-smooth"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </PageShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <PageShell maxWidth="max-w-md">
          <PageSkeleton rows={5} />
        </PageShell>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
