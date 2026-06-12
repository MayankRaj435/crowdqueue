"use client";
import React, { useCallback, useRef, useState, memo } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";

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
  const [isMouseOver, setIsMouseOver] = useState(false);
  const rawX = useMotionValue(0);
  const clipRight = useTransform(rawX, (v) => 100 - v);
  const clipPath = useMotionTemplate`inset(0 ${clipRight}% 0 0)`;
  const lineX = useTransform(rawX, (v) => `${v}%`);
  const rotate = useTransform(rawX, [0, 100], [-5, 5]);

  const updateWidthFromClientX = useCallback((clientX: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const relativeX = clientX - rect.left;
    const next = (relativeX / rect.width) * 100;
    const clamped = Math.min(100, Math.max(0, next));
    rawX.set(clamped);
  }, [rawX]);

  function pointerMoveHandler(event: React.PointerEvent<HTMLDivElement>) {
    updateWidthFromClientX(event.clientX);
  }

  function pointerLeaveHandler() {
    setIsMouseOver(false);
  }

  function pointerUpHandler(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.pointerType !== "mouse") {
      pointerLeaveHandler();
    }
  }

  function pointerDownHandler(event: React.PointerEvent<HTMLDivElement>) {
    setIsMouseOver(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateWidthFromClientX(event.clientX);
  }

  function pointerEnterHandler(event: React.PointerEvent<HTMLDivElement>) {
    setIsMouseOver(true);
    updateWidthFromClientX(event.clientX);
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
        "bg-neutral-900/40 border border-white/[0.04] w-full max-w-[40rem] rounded-2xl p-8 relative overflow-hidden touch-pan-y",
        className
      )}
    >
      {children}

      <div className="relative flex items-center min-h-[12rem] sm:min-h-[14rem] overflow-hidden">
        <motion.div
          style={{
            width: "100%",
            clipPath,
            opacity: isMouseOver ? 1 : 0,
          }}
          className="absolute inset-0 bg-neutral-950 z-20 will-change-transform transition-opacity duration-200"
        >
          <p
            style={{
              textShadow: "4px 4px 15px rgba(0,0,0,0.5)",
            }}
            className="text-base sm:text-[3rem] leading-tight py-6 sm:py-8 font-bold text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300"
          >
            {revealText}
          </p>
        </motion.div>
        <motion.div
          style={{
            left: lineX,
            rotate,
            opacity: isMouseOver ? 1 : 0,
          }}
          className="h-full w-[4px] bg-gradient-to-b from-transparent via-emerald-500/80 to-transparent absolute z-50 will-change-transform transition-opacity duration-200"
        ></motion.div>

        <div className="relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]">
          <p className="text-base sm:text-[3rem] leading-tight py-6 sm:py-8 font-bold bg-clip-text text-transparent bg-neutral-800">
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
  const randomMove = () => Math.random() * 4 - 2;
  const randomOpacity = () => Math.random();
  const random = () => Math.random();
  return (
    <div className="absolute inset-0">
      {[...Array(80)].map((_, i) => (
        <motion.span
          key={`star-${i}`}
          animate={{
            top: `calc(${random() * 100}% + ${randomMove()}px)`,
            left: `calc(${random() * 100}% + ${randomMove()}px)`,
            opacity: randomOpacity(),
            scale: [1, 1.2, 0],
          }}
          transition={{
            duration: random() * 10 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: `${random() * 100}%`,
            left: `${random() * 100}%`,
            width: `2px`,
            height: `2px`,
            backgroundColor: "white",
            borderRadius: "50%",
            zIndex: 1,
          }}
          className="inline-block"
        ></motion.span>
      ))}
    </div>
  );
};

export const MemoizedStars = memo(Stars);
