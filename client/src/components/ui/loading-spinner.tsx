"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "w-5 h-5" : size === "lg" ? "w-10 h-10" : "w-8 h-8";

  return (
    <div className={cn("flex justify-center py-20", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        className={cn(
          sizeClass,
          "rounded-full border-2 border-white/15 border-t-white/90 motion-reduce:animate-none"
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
