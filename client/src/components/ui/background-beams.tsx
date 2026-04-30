"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const paths = svgRef.current?.querySelectorAll("path");
    paths?.forEach((path, i) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.animation = `dash 3s ease-in-out ${i * 0.4}s forwards, pulse 4s ease-in-out ${i * 0.4 + 3}s infinite alternate`;
    });
  }, []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[
          "M0 400 Q300 200 600 400 T1200 400",
          "M0 300 Q400 100 800 350 T1200 300",
          "M0 500 Q200 300 500 500 T1200 450",
          "M0 200 Q350 400 700 200 T1200 250",
          "M0 600 Q300 400 600 550 T1200 600",
          "M0 350 Q250 150 550 350 T1200 350",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke={`rgba(255,255,255,${0.03 + i * 0.01})`}
            strokeWidth={1 + i * 0.3}
            fill="none"
          />
        ))}
      </svg>
      <style jsx>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
