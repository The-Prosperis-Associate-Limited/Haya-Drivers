"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";

// useTransform scrubbing is unreliable on motion v12 scroll timelines, hence discrete state + animate().
export const usePinnedSteps = function (count: number, span = 0.85) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setRevealed(
      Math.max(0, Math.min(count, Math.ceil((value / span) * count))),
    );
  });

  return { trackRef, revealed };
};
