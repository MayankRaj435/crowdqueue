"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ShimmerButton({
  children,
  className,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full",
        "px-8 py-3 font-medium text-black bg-white",
        "transition-all duration-300",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      )}
    </motion.button>
  );
}

export function OutlineButton({
  children,
  className,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "px-8 py-3 font-medium text-white",
        "border border-white/20 hover:border-white/40",
        "bg-transparent hover:bg-white/5",
        "transition-all duration-300",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}
