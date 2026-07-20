"use client";

import { cn } from "@/lib/utils";

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
    <div className={cn("min-h-screen bg-black", maxWidth, "mx-auto px-6 py-12", className)}>
      {children}
    </div>
  );
}
