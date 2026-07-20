"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { LOGIN_ROLE_CONFIG, LOGIN_ROLE_ORDER, getLoginPath } from "@/lib/authRoles";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function LoginPortalGrid() {
  const reduceMotion = useReducedMotion();

  const containerProps = reduceMotion
    ? {}
    : { variants: staggerContainer, initial: "hidden" as const, animate: "show" as const };

  const itemProps = reduceMotion ? {} : { variants: fadeUp };

  return (
    <motion.div {...containerProps} className="mt-12 grid gap-6 md:grid-cols-3">
      {LOGIN_ROLE_ORDER.map((role) => {
        const config = LOGIN_ROLE_CONFIG[role];

        return (
          <motion.div
            key={role}
            {...itemProps}
            whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.25 } }}
            className="group rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.25)] transition-colors duration-300 hover:border-white/[0.14] hover:bg-white/[0.05]"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
              {config.subtitle}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{config.title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">{config.description}</p>

            <div className="mt-5 space-y-2">
              {config.capabilities.slice(0, 3).map((item) => (
                <div key={item} className="flex gap-2 text-sm text-neutral-300">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/70" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {config.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-white/[0.08] px-3 py-1 text-[11px] uppercase tracking-wide text-neutral-400"
                >
                  {badge}
                </span>
              ))}
            </div>

            <Link
              href={getLoginPath(role)}
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:bg-neutral-100 active:scale-[0.98]"
            >
              {config.ctaLabel}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
