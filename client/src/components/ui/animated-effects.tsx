"use client";
import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnimatedCounter({
  value,
  className,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 120,
    mass: 0.8,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(latest);
      }
    });
  }, [springValue, decimals]);

  return (
    <span className={cn("tabular-nums inline-flex items-baseline", className)}>
      {prefix && <span>{prefix}</span>}
      <span ref={ref}>
        {Intl.NumberFormat("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(0)}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

// Single shared keyframe — injected once, not once-per-meteor
let meteorStyleInjected = false;
function injectMeteorStyle() {
  if (meteorStyleInjected || typeof document === "undefined") return;
  meteorStyleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes meteor-fall {
      0%   { transform: rotate(215deg) translateX(0); opacity: 1; }
      70%  { opacity: 1; }
      100% { transform: rotate(215deg) translateX(-600px); opacity: 0; }
    }
    .meteor-streak::before {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 1px;
      background: linear-gradient(90deg, rgba(255,255,255,0.4), transparent);
    }
  `;
  document.head.appendChild(style);
}

export function Meteors({ number = 12 }: { number?: number }) {
  useEffect(() => {
    injectMeteorStyle();
  }, []);

  const meteors = new Array(number).fill(true);
  const getMeteorStyle = (idx: number) => {
    const seed = idx + 1;
    const left = ((seed * 37) % 100) + ((seed * 19) % 100) / 100;
    const delay = ((seed * 17) % 100) / 100;
    const duration = 2 + ((seed * 29) % 300) / 100;

    return {
      top: 0,
      left: `${left}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animation: `meteor-fall ${duration}s linear ${delay}s infinite`,
    };
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className="meteor-streak absolute h-0.5 w-0.5 rounded-full bg-white shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]"
          style={getMeteorStyle(idx)}
        />
      ))}
    </div>
  );
}
