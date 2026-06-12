"use client";

import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "w-5 h-5 border" : size === "lg" ? "w-10 h-10 border-2" : "w-8 h-8 border-2";

  return (
    <div className={cn("flex justify-center py-20", className)}>
      <div
        className={cn(
          sizeClass,
          "border-white/20 border-t-white rounded-full animate-spin"
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
