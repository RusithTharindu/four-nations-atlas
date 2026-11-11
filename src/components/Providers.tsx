"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Every Motion animation follows the OS "reduce motion" setting (transforms off, fades kept). */
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
