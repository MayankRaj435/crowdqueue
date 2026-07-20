"use client";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

// Inject CSS animation once — no framer-motion JS overhead for a simple rotation
let movingBorderStyleInjected = false;
function injectMovingBorderStyle() {
  if (movingBorderStyleInjected || typeof document === "undefined") return;
  movingBorderStyleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes moving-border-spin {
      from { --moving-border-angle: 0deg; }
      to   { --moving-border-angle: 360deg; }
    }
    @property --moving-border-angle {
      syntax: "<angle>";
      inherits: false;
      initial-value: 0deg;
    }
  `;
  document.head.appendChild(style);
}

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
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectMovingBorderStyle();
  }, []);

  const durationS = (duration / 1000).toFixed(1);

  return (
    <div className={cn("relative p-[1px] rounded-2xl group", containerClassName)}>
      <div
        ref={borderRef}
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `conic-gradient(from var(--moving-border-angle, 0deg), transparent 60%, rgba(255,255,255,0.4) 80%, transparent 100%)`,
          animation: `moving-border-spin ${durationS}s linear infinite`,
        }}
      />
      <div className={cn("relative rounded-2xl bg-[#0A0A0A]", className)}>
        {children}
      </div>
    </div>
  );
}
