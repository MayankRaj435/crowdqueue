"use client";
import React from "react";
import {
  TextRevealCard,
  TextRevealCardDescription,
  TextRevealCardTitle,
} from "@/components/ui/text-reveal-card";

export default function TextRevealCardPreview() {
  return (
    <div className="flex items-center justify-center bg-transparent w-full py-4">
      <TextRevealCard
        text="Waiting blindly in a crowded lobby for 45 minutes."
        revealText="Getting a coffee while tracking your turn live. ☕"
      >
        <TextRevealCardTitle>
          The CrowdQueue Difference
        </TextRevealCardTitle>
        <TextRevealCardDescription>
          Start from the left edge and scrub right to reveal — drag back left to hide. Your progress stays until you begin again from the left.
        </TextRevealCardDescription>
      </TextRevealCard>
    </div>
  );
}
