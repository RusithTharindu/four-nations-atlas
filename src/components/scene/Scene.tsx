"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_DEFAULT, CameraRig } from "./CameraRig";
import { Ocean } from "./Ocean";
import { Terrain } from "./Terrain";
import { Landmarks } from "./Landmarks";
import { AnchorProjector } from "./AnchorProjector";
import { TravelPath } from "./TravelPath";
import { PanelViewOffset } from "./PanelViewOffset";
import { CameraFlyTo } from "./CameraFlyTo";
import { DayNight } from "./DayNight";
import { Clouds } from "./Clouds";
import { NationParticles } from "./Particles";
import { useAtlas } from "@/store/atlas";
import { useRef, useState } from "react";
import { PerformanceMonitor } from "@react-three/drei";
import { detectQuality } from "@/lib/quality";
import { useReducedMotion } from "motion/react";

export default function Scene() {
  const down = useRef<{ x: number; y: number } | null>(null);
  const reduce = useReducedMotion() ?? false;
  const [quality] = useState(detectQuality);
  const [dpr, setDpr] = useState<number | [number, number]>(quality.dpr);
  return (
    <Canvas
      onPointerDown={(e) => {
        down.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMissed={(e) => {
        // Only a real click on the map (not the end of a drag) clears the selection.
        const d = down.current;
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) useAtlas.getState().selectLocation(null);
      }}
      shadows={quality.shadows}
      dpr={dpr}
      camera={{ position: CAMERA_DEFAULT.position, fov: CAMERA_DEFAULT.fov, near: 1, far: 3000 }}
      gl={{
        antialias: quality.tier === "high",
        powerPreference: "high-performance",
        toneMapping: THREE.NeutralToneMapping,
      }}
      className="!absolute inset-0"
    >
      {/* Drop to 1x pixel ratio if the device can't keep up. */}
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(quality.dpr)} flipflops={3} />
      <DayNight animate={!reduce} shadows={quality.shadows} />

      <Ocean animate={!reduce} segments={quality.oceanSegments} maskSize={quality.maskSize} />
      <Terrain segments={quality.terrainSegments} shadows={quality.shadows} />
      <Landmarks animate={!reduce} />
      <Clouds
        animate={!reduce}
        shadows={quality.shadows}
        drift={quality.clouds.drift}
        orbit={quality.clouds.orbit}
      />
      {/* Particles are purely decorative motion: skipped entirely for reduced motion. */}
      {!reduce && <NationParticles density={quality.particleDensity} />}
      <TravelPath />
      <AnchorProjector />
      <CameraRig />
      <CameraFlyTo />
      <PanelViewOffset />
    </Canvas>
  );
}
