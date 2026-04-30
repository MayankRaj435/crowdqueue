"use client";
import { useEffect, useState } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export function TextGenerateEffect({
  words,
  className,
  delay = 0,
}: {
  words: string;
  className?: string;
  delay?: number;
}) {
  const [scope, animate] = useAnimate();
  const [started, setStarted] = useState(false);
  const wordsArray = words.split(" ");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStarted(true);
      animate(
        "span",
        { opacity: 1, filter: "blur(0px)" },
        { duration: 0.6, delay: stagger(0.08) }
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [animate, delay]);

  return (
    <div className={cn("font-bold", className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="opacity-0"
            style={{ filter: "blur(8px)" }}
          >
            {word}{" "}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
