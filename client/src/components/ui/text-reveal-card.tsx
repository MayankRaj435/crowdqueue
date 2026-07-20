"use client";
import React, { useCallback, useMemo, useRef, memo } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";

const STAR_COUNT = 12;
/** Must begin scrub within this % of the left edge when reveal is at 0 */
const LEFT_EDGE_THRESHOLD = 8;

function seededUnit(seed: number) {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const round = (n: number) => Math.round(n * 10000) / 10000;
const STAR_LAYOUT = Array.from({ length: STAR_COUNT }, (_, i) => ({
  top: round(seededUnit(i * 3 + 1) * 100),
  left: round(seededUnit(i * 7 + 2) * 100),
  opacity: round(0.15 + seededUnit(i * 11 + 3) * 0.55),
  duration: round(22 + seededUnit(i * 13 + 4) * 18),
  drift: round((seededUnit(i * 17 + 5) - 0.5) * 4),
}));

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
}: {
  text: string;
  revealText: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isTrackingRef = useRef(false);
  const rawX = useMotionValue(0);

  const clipRight = useTransform(rawX, (v) => 100 - v);
  const clipPath = useMotionTemplate`inset(0 ${clipRight}% 0 0)`;
  const lineX = useTransform(rawX, (v) => `${v}%`);
  const rotate = useTransform(rawX, [0, 100], [-3, 3]);
  // Smooth fade-in from [0, 3] % → [0, 1] instead of a hard binary jump
  const overlayOpacity = useTransform(rawX, [0, 3], [0, 1], { clamp: true });
  const lineOpacity = useTransform(rawX, [0, 2], [0, 1], { clamp: true });

  const clientXToPercent = useCallback((clientX: number) => {
    if (!cardRef.current) return null;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width) return null;
    const relativeX = clientX - rect.left;
    return Math.min(100, Math.max(0, (relativeX / rect.width) * 100));
  }, []);

  const setFromClientX = useCallback(
    (clientX: number) => {
      const pct = clientXToPercent(clientX);
      if (pct !== null) rawX.set(pct);
    },
    [clientXToPercent, rawX]
  );

  /** Fresh reveal (x≈0) only arms from the left edge; in-progress scrubs resume on drag */
  const tryStartTracking = useCallback(
    (clientX: number, { allowResume = false }: { allowResume?: boolean } = {}) => {
      const pct = clientXToPercent(clientX);
      if (pct === null) return false;

      const current = rawX.get();
      const isFresh = current < 0.5;

      if (isFresh && pct > LEFT_EDGE_THRESHOLD) {
        return false;
      }

      if (!isFresh && !allowResume) {
        return false;
      }

      isTrackingRef.current = true;
      rawX.set(pct);
      return true;
    },
    [clientXToPercent, rawX]
  );

  function pointerMoveHandler(event: React.PointerEvent<HTMLDivElement>) {
    if (!isTrackingRef.current) return;
    setFromClientX(event.clientX);
  }

  function pointerLeaveHandler() {
    isTrackingRef.current = false;
  }

  function pointerUpHandler(event: React.PointerEvent<HTMLDivElement>) {
    isTrackingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function pointerDownHandler(event: React.PointerEvent<HTMLDivElement>) {
    if (tryStartTracking(event.clientX, { allowResume: true })) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  }

  function pointerEnterHandler(event: React.PointerEvent<HTMLDivElement>) {
    if (rawX.get() < 0.5) {
      tryStartTracking(event.clientX);
    }
  }

  return (
    <div
      onPointerEnter={pointerEnterHandler}
      onPointerLeave={pointerLeaveHandler}
      onPointerMove={pointerMoveHandler}
      onPointerDown={pointerDownHandler}
      onPointerUp={pointerUpHandler}
      onPointerCancel={pointerLeaveHandler}
      ref={cardRef}
      className={cn(
        "bg-neutral-900/40 border border-white/[0.04] w-full max-w-[40rem] rounded-2xl p-8 relative overflow-hidden touch-none select-none cursor-ew-resize",
        className
      )}
    >
      {children}

      <div className="relative flex items-center min-h-[12rem] sm:min-h-[14rem] overflow-hidden">
        {/* Left-edge affordance — scrub starts here */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 z-[60] pointer-events-none bg-gradient-to-r from-emerald-500/15 to-transparent opacity-60"
          aria-hidden
        />

        <motion.div
          style={{
            width: "100%",
            clipPath,
            opacity: overlayOpacity,
          }}
          className="absolute inset-0 bg-neutral-950 z-20 pointer-events-none will-change-[clip-path,opacity] flex items-center"
        >
          <p
            style={{ textShadow: "4px 4px 15px rgba(0,0,0,0.5)" }}
            className="w-full text-base sm:text-[3rem] leading-tight py-6 sm:py-8 font-bold text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300"
          >
            {revealText}
          </p>
        </motion.div>

        <motion.div
          style={{
            left: lineX,
            rotate,
            opacity: lineOpacity,
            x: "-50%",
          }}
          className="top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-emerald-400 to-transparent absolute z-50 pointer-events-none will-change-transform shadow-[0_0_14px_rgba(52,211,153,0.5)]"
        />

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]">
          <p className="text-base sm:text-[3rem] leading-tight py-6 sm:py-8 font-bold text-neutral-600">
            {text}
          </p>
          <MemoizedStars />
        </div>
      </div>
    </div>
  );
};

export const TextRevealCardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2 className={twMerge("text-white text-lg mb-2", className)}>
      {children}
    </h2>
  );
};

export const TextRevealCardDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p className={twMerge("text-neutral-400 text-sm", className)}>{children}</p>
  );
};

const Stars = () => {
  const stars = useMemo(() => STAR_LAYOUT, []);

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {stars.map((star, i) => (
        <motion.span
          key={`star-${i}`}
          initial={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
          }}
          animate={{
            top: `calc(${star.top}% + ${star.drift}px)`,
            left: `calc(${star.left}% + ${-star.drift}px)`,
            opacity: [star.opacity, star.opacity * 1.3, star.opacity * 0.5],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: 2,
            height: 2,
            backgroundColor: "white",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>
  );
};

export const MemoizedStars = memo(Stars);
