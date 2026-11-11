/** True when the user asked the OS for reduced motion. Safe to call on the server. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Stable pseudo-random number in [-1, 1] from a string (for per-card tilt etc.). */
export function hashTilt(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  return ((h >>> 0) % 2001) / 1000 - 1;
}
