"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CAMERA_CUT_EVENT } from "@/lib/motion";

/** A quick paper-coloured fade that hides instant camera cuts (used instead of fly-tos for reduced motion). */
export function CutFade() {
  const [cut, setCut] = useState(0);
  useEffect(() => {
    const on = () => setCut((n) => n + 1);
    window.addEventListener(CAMERA_CUT_EVENT, on);
    return () => window.removeEventListener(CAMERA_CUT_EVENT, on);
  }, []);
  return (
    <AnimatePresence>
      {cut > 0 && (
        <motion.div
          key={cut}
          className="pointer-events-none absolute inset-0 z-[5] bg-paper"
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          onAnimationComplete={() => setCut(0)}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}
