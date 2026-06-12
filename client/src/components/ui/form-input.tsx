"use client";

import { cn } from "@/lib/utils";

const inputClassName =
  "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-colors";

export function FormInput({
  className,
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-neutral-400">{label}</label>
      )}
      <input className={cn(inputClassName, error && "border-red-500/40", className)} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function FormTextarea({
  className,
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-neutral-400">{label}</label>
      )}
      <textarea
        className={cn(inputClassName, "resize-none", error && "border-red-500/40", className)}
        {...props}
      />
    </div>
  );
}

export { inputClassName };
