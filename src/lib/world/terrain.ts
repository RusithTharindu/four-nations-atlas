/**
 * Procedural, ORIGINAL world geometry for the atlas.
 *
 * Landmasses are unions of noise-warped ellipses ("blobs"). They follow only the
 * relative geography of the series (Fire Nation islands to the west, the Water
 * Tribes at the poles, a large Earth Kingdom continent to the east, Air Nomad
 * peaks in a southern archipelago). They are not traced from any official map.
 *
 * Coordinates: x = east (+) / west (-), z = south (+) / north (-), y = up.
 * Sea level is y = 0.
 */
import type { Nation } from "@/types/atlas";
import { fbm, ridged } from "./noise";

type Relief = "hills" | "mountains" | "volcano" | "peaks" | "ice";

interface Blob {
  x: number;
  z: number;
  rx: number;
  rz: number;
  rot: number;
  height: number;
  nation: Nation;
  relief: Relief;
  /** Strength of the coastline wobble (0..1). */
  wobble?: number;
}

export const WORLD = {
  /** Terrain grid extent (x and z half-sizes). */
  halfX: 112,
  halfZ: 96,
  /** Size of the ocean plane. */
  oceanSize: 900,
  /** World-space extent covered by the coast mask texture (square, centered). */
  maskExtent: 320,
  seaFloor: -4,
};

// prettier-ignore
const BLOBS: Blob[] = [
  // ── Earth Kingdom: the big eastern continent ─────────────────────────
  { x: 30,  z: -4,  rx: 40, rz: 28, rot: 0.15,  height: 4,  nation: "earth", relief: "hills", wobble: 0.9 },
  { x: 4,   z: 12,  rx: 22, rz: 17, rot: -0.4,  height: 9,  nation: "earth", relief: "mountains" },
  { x: 62,  z: -12, rx: 22, rz: 26, rot: 0.3,   height: 3,  nation: "earth", relief: "hills" },
  { x: 46,  z: -36, rx: 24, rz: 11, rot: -0.3,  height: 9,  nation: "earth", relief: "mountains" },
  { x: 38,  z: 24,  rx: 14, rz: 15, rot: 0.6,   height: 3,  nation: "earth", relief: "hills" },
  { x: 22,  z: -16, rx: 22, rz: 6,  rot: 0.55,  height: 13, nation: "earth", relief: "mountains" },
  { x: 76,  z: 14,  rx: 12, rz: 9,  rot: -0.2,  height: 5,  nation: "earth", relief: "mountains" },
  { x: 24,  z: 40,  rx: 6.5,rz: 4.5,rot: 0.3,   height: 2.2,nation: "earth", relief: "hills" }, // Kyoshi Island
  { x: 56,  z: 36,  rx: 4,  rz: 3,  rot: 0,     height: 1.6,nation: "earth", relief: "hills" },

  // ── Fire Nation: volcanic island chain in the west ───────────────────
  { x: -62, z: 6,   rx: 12, rz: 7,  rot: 0.9,   height: 11, nation: "fire",  relief: "volcano" }, // capital isle
  { x: -71, z: 19,  rx: 7,  rz: 4,  rot: 0.4,   height: 6,  nation: "fire",  relief: "volcano" },
  { x: -52, z: 21,  rx: 5,  rz: 3,  rot: 0,     height: 4,  nation: "fire",  relief: "volcano" },
  { x: -56, z: -14, rx: 6,  rz: 3.6,rot: -0.3,  height: 4.5,nation: "fire",  relief: "volcano" }, // Ember Island
  { x: -67, z: -27, rx: 6.5,rz: 3.2,rot: 0.6,   height: 6,  nation: "fire",  relief: "volcano" },
  { x: -80, z: -6,  rx: 5,  rz: 3.6,rot: 0.2,   height: 7,  nation: "fire",  relief: "volcano" },
  { x: -46, z: 3,   rx: 3.5,rz: 2.5,rot: 0,     height: 3,  nation: "fire",  relief: "volcano" },
  { x: -84, z: 12,  rx: 3,  rz: 2.2,rot: 0,     height: 3,  nation: "fire",  relief: "volcano" },

  // ── Air Nomads: tall, thin peaks in a southern archipelago ───────────
  { x: -24, z: 44,  rx: 9,  rz: 7,  rot: 0.3,   height: 20, nation: "air",   relief: "peaks" },
  { x: -35, z: 53,  rx: 5,  rz: 3.5,rot: 0,     height: 13, nation: "air",   relief: "peaks" },
  { x: -13, z: 53,  rx: 4,  rz: 3,  rot: 0.5,   height: 11, nation: "air",   relief: "peaks" },

  // ── Water Tribes: polar ice ──────────────────────────────────────────
  { x: 10,  z: -76, rx: 78, rz: 12, rot: 0,     height: 1.6,nation: "water", relief: "ice", wobble: 0.6 },
  { x: 14,  z: -63, rx: 13, rz: 5,  rot: 0.05,  height: 3,  nation: "water", relief: "ice" },
  { x: 0,   z: 78,  rx: 78, rz: 12, rot: 0,     height: 1.6,nation: "water", relief: "ice", wobble: 0.6 },
  { x: 2,   z: 65,  rx: 12, rz: 6,  rot: -0.05, height: 2.4,nation: "water", relief: "ice" },
  { x: -40, z: -60, rx: 4,  rz: 2,  rot: 0.3,   height: 0.8,nation: "water", relief: "ice" },
  { x: 52,  z: 62,  rx: 5,  rz: 2.4,rot: -0.2,  height: 0.8,nation: "water", relief: "ice" },
];

interface BlobSample {
  /** Approximate signed distance to this blob's coast (world units, + = inland). */
  sd: number;
  /** Normalized interior coordinate: 0 at coast, 1 at blob center. */
  inner: number;
  height: number;
}

function sampleBlob(b: Blob, x: number, z: number, withHeight = true): BlobSample {
  const dx = x - b.x;
  const dz = z - b.z;
  const c = Math.cos(b.rot);
  const s = Math.sin(b.rot);
  const lx = (dx * c + dz * s) / b.rx;
  const lz = (-dx * s + dz * c) / b.rz;
  const wobble = b.wobble ?? 0.45;
  const d0 = Math.sqrt(lx * lx + lz * lz);
  // Far from the blob the coastline wobble no longer matters; skip the noise.
  const d = d0 > 1.8 ? d0 : d0 + wobble * 0.35 * fbm(x * 0.07, z * 0.07, 4, 3);
  const minR = Math.min(b.rx, b.rz);
  const sd = (1 - d) * minR;
  const inner = Math.min(Math.max(1 - d, 0), 1);
  if (!withHeight || sd < -4) return { sd, inner, height: WORLD.seaFloor };

  // Coastal shelf: sea floor → just above sea level over ~2.5 units.
  const shore = smoothstep(-3, 2.5, sd);
  let height = WORLD.seaFloor + (0.5 - WORLD.seaFloor) * shore;

  if (sd > 0) {
    const n = fbm(x * 0.12, z * 0.12, 3, 11);
    switch (b.relief) {
      case "hills":
        height += b.height * Math.pow(inner, 1.2) * (0.55 + 0.45 * n);
        break;
      case "mountains":
        height += b.height * Math.pow(inner, 1.1) * (0.35 + 0.9 * ridged(x * 0.09, z * 0.09));
        break;
      case "volcano": {
        const cone = Math.pow(inner, 1.4);
        const crater = smoothstep(0.82, 0.97, inner) * 0.3;
        height += b.height * (cone - crater) * (0.9 + 0.1 * n);
        break;
      }
      case "peaks": {
        // A plateau for the temple in the middle, needle-like spires around it.
        const r = ridged(x * 0.32, z * 0.32, 3, 21);
        const spires = Math.pow(r, 6) * b.height;
        const plateau = smoothstep(0.62, 0.75, inner) * b.height * 0.42;
        height += Math.max(b.height * 0.18 * inner + spires * smoothstep(0.05, 0.5, inner), plateau);
        break;
      }
      case "ice":
        height += b.height * smoothstep(0, 0.4, inner) * (0.8 + 0.2 * n);
        break;
    }
  }
  return { sd, inner, height };
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

export interface TerrainSample {
  height: number;
  /** Signed distance to the nearest coast (world units, + = land). */
  coast: number;
  nation: Nation | null;
  relief: Relief | null;
  inner: number;
}

export function sampleTerrain(x: number, z: number, withHeight = true): TerrainSample {
  let height = WORLD.seaFloor;
  let coast = -Infinity;
  let nation: Nation | null = null;
  let relief: Relief | null = null;
  let inner = 0;
  for (const b of BLOBS) {
    const s = sampleBlob(b, x, z, withHeight);
    if (s.height > height) height = s.height;
    if (s.sd > coast) {
      coast = s.sd;
      nation = b.nation;
      relief = b.relief;
      inner = s.inner;
    }
  }
  return { height, coast, nation: coast > -3 ? nation : null, relief, inner };
}

export function heightAt(x: number, z: number): number {
  return Math.max(sampleTerrain(x, z).height, 0);
}

// ── Colours ────────────────────────────────────────────────────────────

type RGB = [number, number, number];
/** sRGB hex → linear RGB (three.js vertex colours are linear). */
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [toLinear(((n >> 16) & 255) / 255), toLinear(((n >> 8) & 255) / 255), toLinear((n & 255) / 255)];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const C = {
  sand: hex("#e3d29c"),
  darkSand: hex("#5e4a42"),
  grass: hex("#7fb05a"),
  grassDeep: hex("#5f9445"),
  earthMid: hex("#9c8550"),
  earthHigh: hex("#7a5a3c"),
  rock: hex("#a39484"),
  snow: hex("#f4f6f8"),
  fireLow: hex("#7a3d32"),
  fireRock: hex("#3b2e2c"),
  lava: hex("#e8582c"),
  airLow: hex("#a8bf96"),
  airStone: hex("#d9cfbf"),
  ice: hex("#e4f1fb"),
  iceBlue: hex("#9fcbe6"),
  seabed: hex("#6aa7b8"),
};

/** Faceted per-triangle colour from position, height and nation. */
export function terrainColor(x: number, z: number, h: number, sample: TerrainSample): RGB {
  if (h < 0.05) return C.seabed;
  const jitter = fbm(x * 0.5, z * 0.5, 2, 5) * 0.035;
  const beach = h < 0.75;
  let col: RGB;
  switch (sample.nation) {
    case "water":
      col = mix(C.iceBlue, C.ice, smoothstep(0.6, 2.6, h));
      break;
    case "fire":
      if (beach) col = C.darkSand;
      else if (sample.relief === "volcano" && sample.inner > 0.72)
        col = mix(C.fireRock, C.lava, smoothstep(0.72, 0.9, sample.inner));
      else col = mix(C.fireLow, C.fireRock, smoothstep(1.5, 6, h));
      break;
    case "air":
      col = beach ? C.sand : mix(C.airLow, C.airStone, smoothstep(3, 9, h));
      if (h > 14) col = mix(col, C.snow, smoothstep(14, 18, h));
      break;
    case "earth":
    default:
      if (beach) col = C.sand;
      else if (h < 3) col = mix(C.grass, C.grassDeep, smoothstep(1, 3, h));
      else if (h < 7) col = mix(C.earthMid, C.earthHigh, smoothstep(3, 7, h));
      else col = mix(C.earthHigh, h > 10 ? C.snow : C.rock, smoothstep(7, 11, h));
      break;
  }
  return [
    Math.min(1, Math.max(0, col[0] + jitter)),
    Math.min(1, Math.max(0, col[1] + jitter)),
    Math.min(1, Math.max(0, col[2] + jitter)),
  ];
}

/**
 * Coast mask for the ocean shader: R channel = signed coast distance mapped from
 * [-12, +4] world units to [0, 255]. Covers WORLD.maskExtent around the origin.
 */
export function buildCoastMask(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  const ext = WORLD.maskExtent;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = (i / (size - 1) - 0.5) * ext;
      const z = (j / (size - 1) - 0.5) * ext;
      const { coast } = sampleTerrain(x, z, false);
      const v = Math.min(Math.max((coast + 12) / 16, 0), 1);
      const k = (j * size + i) * 4;
      data[k] = Math.round(v * 255);
      data[k + 1] = 0;
      data[k + 2] = 0;
      data[k + 3] = 255;
    }
  }
  return data;
}

/** Crater centres of the larger volcanoes, used for the lava glow. */
export function volcanoCraters(minHeight = 4.5): { x: number; z: number; r: number }[] {
  return BLOBS.filter((b) => b.relief === "volcano" && b.height >= minHeight).map((b) => ({
    x: b.x,
    z: b.z,
    r: Math.min(b.rx, b.rz) * 0.16,
  }));
}
