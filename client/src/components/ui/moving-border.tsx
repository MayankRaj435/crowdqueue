"use client";
import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({
  children,
  className,
  containerClassName,
  duration = 3000,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  duration?: number;
}) {
  const angle = useMotionValue(0);

  useEffect(() => {
    animate(angle, 360, {
      duration: duration / 1000,
      repeat: Infinity,
      ease: "linear",
    });
  }, [angle, duration]);

  const background = useMotionTemplate`conic-gradient(from ${angle}deg, transparent 60%, rgba(255,255,255,0.4) 80%, transparent 100%)`;

  return (
    <div className={cn("relative p-[1px] rounded-2xl group", containerClassName)}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{ background }}
        animate={{ opacity: 1 }}
        onUpdate={(latest) => {
          // Fallback if needed, but we can animate the motion value directly
        }}
      />
      {/* We animate the motion value using useEffect */}
      <div className={cn("relative rounded-2xl bg-[#0A0A0A]", className)}>
        {children}
      </div>
    </div>
  );
}
