"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ambient } from "@/lib/world/ambient";

/** Seconds for one full day. Long, so the change is gentle rather than distracting. */
const DAY_LENGTH = 150;
/** Start mid-morning. */
const START_PHASE = 0.08;

const C = (hex: string) => new THREE.Color(hex);
const PALETTE = {
  sky: { day: C("#bfe0ea"), dusk: C("#f1c6a2"), night: C("#5f7598") },
  sun: { day: C("#fff1d6"), dusk: C("#ffae73"), night: C("#c3d3ff") },
  ground: { day: C("#5d8aa0"), dusk: C("#8a6a72"), night: C("#2f3d5a") },
  tint: { day: C("#ffffff"), dusk: C("#ffe1c9"), night: C("#8ea2c8") },
};

const tmp = new THREE.Color();
function blend(
  p: { day: THREE.Color; dusk: THREE.Color; night: THREE.Color },
  night: number,
  dusk: number,
  out: THREE.Color,
) {
  out.copy(p.day).lerp(p.night, night);
  return out.lerp(p.dusk, dusk);
}

interface DayNightProps {
  shadows?: boolean;
  /** When false the lighting is frozen at the starting time of day. */
  animate?: boolean;
}

/** Sun, sky, fog and hemisphere light that drift slowly through a subtle day/night cycle. */
export function DayNight({ shadows = true, animate = true }: DayNightProps) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const backgroundRef = useRef(new THREE.Color(PALETTE.sky.day));
  const fogRef = useRef(new THREE.Fog(PALETTE.sky.day, 220, 520));
  const time = useRef(START_PHASE * DAY_LENGTH);

  // Dev-only helper for checking the lighting: window.__setDayPhase(0.6) jumps to night.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __setDayPhase?: (p: number) => void };
    w.__setDayPhase = (p) => {
      time.current = p * DAY_LENGTH;
    };
    return () => {
      delete w.__setDayPhase;
    };
  }, []);

  useFrame(({ scene }, delta) => {
    if (animate) time.current += Math.min(delta, 0.1);
    const phase = (time.current / DAY_LENGTH) % 1;
    // elevation: 1 at noon, -1 at midnight
    const elevation = Math.sin(phase * Math.PI * 2 + Math.PI / 6);
    const night = THREE.MathUtils.smoothstep(-elevation, -0.15, 0.75) * 0.85; // never fully dark
    const dusk = Math.max(0, 1 - Math.abs(elevation) / 0.35) * 0.65;

    const background = backgroundRef.current;
    const fog = fogRef.current;
    blend(PALETTE.sky, night, dusk, background);
    fog.color.copy(background);
    scene.background = background;
    scene.fog = fog;
    blend(PALETTE.tint, night, dusk, ambient.tint);
    ambient.night = night;

    const s = sun.current;
    if (s) {
      // The sun swings around the world; at night the same light plays the moon.
      const angle = phase * Math.PI * 2;
      const height = 60 + 70 * Math.abs(elevation);
      s.position.set(Math.cos(angle) * 110, height, Math.sin(angle) * 70 + 40);
      blend(PALETTE.sun, night, dusk, s.color);
      s.intensity = THREE.MathUtils.lerp(1.9, 0.7, night) * (1 - dusk * 0.25);
    }
    const h = hemi.current;
    if (h) {
      h.color.copy(blend(PALETTE.sky, night * 0.6, dusk * 0.5, tmp)).lerp(PALETTE.sun.day, 0.5);
      blend(PALETTE.ground, night, dusk, h.groundColor);
      h.intensity = THREE.MathUtils.lerp(1.0, 0.55, night);
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#fff6e5", "#5d8aa0", 1]} />
      <directionalLight
        ref={sun}
        position={[-80, 120, 60]}
        intensity={1.8}
        color="#fff1d6"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-130}
        shadow-camera-right={130}
        shadow-camera-top={110}
        shadow-camera-bottom={-110}
        shadow-camera-far={400}
        shadow-bias={-0.0004}
      />
    </>
  );
}
