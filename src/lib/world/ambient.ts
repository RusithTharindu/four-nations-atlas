import * as THREE from "three";

/**
 * Mutable lighting state written by <DayNight/> every frame and read by
 * materials that aren't lit by three.js lights (the ocean shader, particles).
 */
export const ambient = {
  /** Multiplier for unlit materials: white at noon, cooler and darker at night. */
  tint: new THREE.Color(1, 1, 1),
  /** 0 = full day, 1 = deepest night. */
  night: 0,
};

/** Small seeded PRNG so procedural decorations look the same on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
