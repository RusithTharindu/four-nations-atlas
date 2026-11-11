"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import gsap from "gsap";
import type { Line2 } from "three-stdlib";
import { episodeIndex, events, getLocation } from "@/lib/data";
import { markerPosition } from "@/lib/world/markers";
import { heightAt } from "@/lib/world/terrain";
import { prefersReducedMotion } from "@/lib/motion";
import { useAtlas } from "@/store/atlas";

const SAMPLES_PER_LEG = 56;

interface PathData {
  points: [number, number, number][];
  /** For each story stop: the episode it happens in and the point index where it ends. */
  stops: { episode: number; pointIndex: number }[];
}

/**
 * Builds one hand-wobbly arc per leg between consecutive event locations
 * (in broadcast order). Each arc lifts over the terrain and gets a small
 * sideways wobble so it reads like a pen line.
 */
function buildPath(): PathData {
  const points: [number, number, number][] = [];
  const stops: PathData["stops"] = [];
  let prev: [number, number, number] | null = null;
  let prevId: string | null = null;

  events.forEach((ev, legIndex) => {
    const loc = getLocation(ev.location);
    if (!loc) return;
    const ep = episodeIndex(ev.episode);
    const [x, y, z] = markerPosition(loc);
    const end: [number, number, number] = [x, y + 1.2, z];

    if (!prev) {
      points.push(end);
    } else if (prevId !== loc.id) {
      const [ax, ay, az] = prev;
      const dx = end[0] - ax;
      const dz = end[2] - az;
      const dist = Math.hypot(dx, dz);
      const nx = -dz / (dist || 1);
      const nz = dx / (dist || 1);
      const lift = 3 + dist * 0.1;
      // Alternate sides and vary the curve so repeat trips between two places stay distinguishable.
      const bend = (legIndex % 2 ? 1 : -1) * Math.min(dist * 0.12, 7) * (1 + (legIndex % 3) * 0.6);
      for (let i = 1; i <= SAMPLES_PER_LEG; i++) {
        const t = i / SAMPLES_PER_LEG;
        const arc = Math.sin(Math.PI * t);
        const wobble = Math.sin(t * Math.PI * 5 + legIndex) * 0.35 * arc;
        const px = ax + dx * t + nx * (bend * arc + wobble);
        const pz = az + dz * t + nz * (bend * arc + wobble);
        const py = Math.max(ay + (end[1] - ay) * t + arc * lift, heightAt(px, pz) + 1.2);
        points.push([px, py, pz]);
      }
    }
    stops.push({ episode: ep, pointIndex: points.length - 1 });
    prev = end;
    prevId = loc.id;
  });
  return { points, stops };
}

function segmentsAt(path: PathData, current: number): number {
  let n = 0;
  for (const s of path.stops) if (s.episode <= current) n = s.pointIndex;
  return n; // a line with k points has k - 1 segments; pointIndex is exactly that
}

/** Dashed ink line that "draws itself" forward (or rubs out backward) with the timeline. */
export function TravelPath() {
  const path = useMemo(() => buildPath(), []);
  const line = useRef<Line2>(null);
  const drawn = useRef({ value: segmentsAt(path, useAtlas.getState().episodeIndex) });

  useEffect(() => {
    let tween: gsap.core.Tween | null = null;
    let last = useAtlas.getState().episodeIndex;
    const unsubscribe = useAtlas.subscribe((s) => {
      if (s.episodeIndex === last) return;
      last = s.episodeIndex;
      const target = segmentsAt(path, s.episodeIndex);
      tween?.kill();
      if (prefersReducedMotion()) {
        drawn.current.value = target;
        return;
      }
      const delta = Math.abs(target - drawn.current.value);
      tween = gsap.to(drawn.current, {
        value: target,
        duration: Math.min(0.4 + delta / 120, 1.6),
        ease: "power2.inOut",
      });
    });
    return () => {
      unsubscribe();
      tween?.kill();
    };
  }, [path]);

  useFrame(() => {
    const geo = line.current?.geometry;
    if (geo) geo.instanceCount = Math.floor(drawn.current.value);
  });

  if (path.points.length < 2) return null;
  return (
    <Line
      ref={line}
      points={path.points}
      color="#2b2620"
      lineWidth={2.6}
      dashed
      dashSize={1.1}
      gapSize={0.8}
      transparent
      opacity={0.85}
      depthWrite={false}
      renderOrder={5}
    />
  );
}
