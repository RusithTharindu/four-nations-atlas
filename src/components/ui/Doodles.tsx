"use client";

import { motion, useReducedMotion } from "motion/react";

/** A wobbly hand-drawn underline that draws itself in. */
export function Underline({ color = "var(--ink)", className = "" }: { color?: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" className={`h-2.5 w-full ${className}`} aria-hidden>
      <motion.path
        d="M3 7 C 40 3, 70 10, 110 6 S 170 3, 197 6"
        fill="none"
        stroke={color}
        strokeWidth={2.4}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      />
    </svg>
  );
}

/** A curly hand-drawn arrow, pointing right by default. */
export function DoodleArrow({ className = "", color = "var(--ink)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22 C 14 4, 30 30, 52 12" />
      <path d="M44 9 L 53 11 L 50 20" />
    </svg>
  );
}
