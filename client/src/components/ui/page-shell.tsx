"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function PageShell({
  children,
  className,
  maxWidth = "max-w-6xl",
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className="min-h-screen bg-black">
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className={cn("mx-auto px-6 py-12", maxWidth, className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
