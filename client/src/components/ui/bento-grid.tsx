"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BentoGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {children}
    </div>
  );
}

export function BentoGridItem({
  title,
  description,
  icon,
  className,
  index = 0,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6",
        "hover:border-white/[0.15] transition-colors duration-300",
        className
      )}
    >
      <div className="relative z-10">
        {icon && (
          <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.05] text-white/60 group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
