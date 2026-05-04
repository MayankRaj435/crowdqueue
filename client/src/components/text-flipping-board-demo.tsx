"use client";
import React, { useState, useEffect, useCallback } from "react";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";

export default function TextFlippingBoardDemo() {
  const [msgIdx, setMsgIdx] = useState(0);

  const MESSAGES: string[] = [
    "NOW SERVING \nTOKEN A-42 \nCOUNTER 3",
    "PLEASE HAVE \nQR CODE READY",
    "ESTIMATED WAIT \n12 MINUTES",
    "SKIP THE LINE \nNOT THE SERVICE",
  ];

  const next = useCallback(
    () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
    []
  );

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 py-10">
      <TextFlippingBoard text={MESSAGES[msgIdx]} />
      <p className="text-neutral-500 text-sm mt-4 font-mono tracking-widest">LIVE QUEUE STATUS</p>
    </div>
  );
}
