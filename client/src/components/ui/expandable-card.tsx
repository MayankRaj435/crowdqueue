"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";

export function ExpandableCard() {
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    if (active && typeof active === "object") {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prevOverflow;
      };
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4 sm:p-0">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-4 right-4 lg:hidden items-center justify-center bg-white/10 rounded-full h-8 w-8 text-white z-[110]"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-neutral-900 sm:rounded-3xl overflow-hidden border border-white/[0.1] shadow-2xl"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <img
                  width={500}
                  height={500}
                  src={active.src}
                  alt={active.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-80 lg:h-80 sm:rounded-t-3xl object-cover object-top"
                />
              </motion.div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start p-6">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-2xl text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-400 mt-1"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-6 py-3 text-sm rounded-full font-bold bg-white text-black hover:bg-neutral-200 transition-colors"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="relative px-6 pb-6 flex-1">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-400 text-sm md:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <motion.div
            layoutId={`card-${card.title}-${id}`}
            key={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-4 flex flex-col sm:flex-row justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-2xl cursor-pointer transition-colors"
          >
            <div className="flex gap-4 flex-col sm:flex-row items-center sm:items-start w-full">
              <motion.div layoutId={`image-${card.title}-${id}`}>
                <img
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-full sm:h-16 sm:w-16 rounded-xl object-cover object-top"
                />
              </motion.div>
              <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
                <motion.h3
                  layoutId={`title-${card.title}-${id}`}
                  className="font-semibold text-lg text-neutral-200"
                >
                  {card.title}
                </motion.h3>
                <motion.p
                  layoutId={`description-${card.description}-${id}`}
                  className="text-neutral-400 text-sm mt-1"
                >
                  {card.description}
                </motion.p>
              </div>
            </div>
            <motion.button
              layoutId={`button-${card.title}-${id}`}
              className="px-5 py-2 text-sm rounded-full font-bold bg-white/[0.1] hover:bg-white text-white hover:text-black mt-6 sm:mt-0 transition-colors whitespace-nowrap"
            >
              {card.ctaText}
            </motion.button>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

const cards = [
  {
    description: "Hospitals & Clinics",
    title: "Healthcare",
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2906&auto=format&fit=crop",
    ctaText: "View Demo",
    ctaLink: "#",
    content: () => {
      return (
        <p>
          Eliminate crowded waiting rooms. Patients can join the queue from home
          and arrive exactly when it's their turn. Our real-time updates ensure
          they always know their status, reducing anxiety and improving the overall
          patient experience.
        </p>
      );
    },
  },
  {
    description: "Conferences & Summits",
    title: "Tech Events",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2940&auto=format&fit=crop",
    ctaText: "View Demo",
    ctaLink: "#",
    content: () => {
      return (
        <p>
          Manage registration lines effortlessly. Attendees can scan a QR code
          to get a digital token and explore the venue instead of standing in line.
          When their turn approaches, they receive an SMS or push notification.
        </p>
      );
    },
  },
  {
    description: "Restaurants & Cafes",
    title: "Food Service",
    src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2874&auto=format&fit=crop",
    ctaText: "View Demo",
    ctaLink: "#",
    content: () => {
      return (
        <p>
          Turn walk-aways into loyal customers. Let diners join your waitlist
          digitally and track their position in real-time while they grab a drink
          nearby.
        </p>
      );
    },
  },
  {
    description: "Government Offices",
    title: "Public Services",
    src: "https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=2862&auto=format&fit=crop",
    ctaText: "View Demo",
    ctaLink: "#",
    content: () => {
      return (
        <p>
          Modernize public sector waiting experiences. Issue digital tickets and
          display a beautifully animated split-flap board on your waiting room TVs.
        </p>
      );
    },
  },
];
