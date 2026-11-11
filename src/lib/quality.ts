/** Render settings picked once per load from screen size and device hints. */
export interface Quality {
  tier: "high" | "low";
  dpr: [number, number];
  terrainSegments: number;
  oceanSegments: number;
  maskSize: number;
  shadows: boolean;
  particleDensity: number;
  clouds: { drift: number; orbit: number };
}

export const MOBILE_QUERY = "(max-width: 767px)";

const HIGH: Quality = {
  tier: "high",
  dpr: [1, 2],
  terrainSegments: 220,
  oceanSegments: 160,
  maskSize: 256,
  shadows: true,
  particleDensity: 1,
  clouds: { drift: 14, orbit: 7 },
};

const LOW: Quality = {
  tier: "low",
  dpr: [1, 1.5],
  terrainSegments: 140,
  oceanSegments: 72,
  maskSize: 160,
  shadows: false,
  particleDensity: 0.3,
  clouds: { drift: 8, orbit: 4 },
};

export function detectQuality(): Quality {
  if (typeof window === "undefined") return HIGH;
  const small = window.matchMedia(MOBILE_QUERY).matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4;
  return small || (coarse && (fewCores || lowMemory)) ? LOW : HIGH;
}

/** Share of the viewport the phone bottom sheet covers while peeking. */
export const SHEET_PEEK = 0.42;
