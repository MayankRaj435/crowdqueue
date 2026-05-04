"use client";
import React from "react";
import {
  TextRevealCard,
  TextRevealCardDescription,
  TextRevealCardTitle,
} from "@/components/ui/text-reveal-card";

export default function TextRevealCardPreview() {
  return (
    <div className="flex items-center justify-center bg-transparent h-[40rem] rounded-2xl w-full">
      <TextRevealCard
        text="Waiting blindly in a crowded lobby for 45 minutes."
        revealText="Getting a coffee while tracking your turn live. ☕"
      >
        <TextRevealCardTitle>
          The CrowdQueue Difference
        </TextRevealCardTitle>
        <TextRevealCardDescription>
          Hover or scrub over the card to reveal the modern way of waiting.
        </TextRevealCardDescription>
      </TextRevealCard>
    </div>
  );
}
