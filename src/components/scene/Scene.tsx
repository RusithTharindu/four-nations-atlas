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
import { useRef } from "react";
import { useReducedMotion } from "motion/react";

export default function Scene() {
  const down = useRef<{ x: number; y: number } | null>(null);
  const reduce = useReducedMotion() ?? false;
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
      shadows
      dpr={[1, 2]}
      camera={{ position: CAMERA_DEFAULT.position, fov: CAMERA_DEFAULT.fov, near: 1, far: 900 }}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping }}
      className="!absolute inset-0"
    >
      <DayNight animate={!reduce} />

      <Ocean animate={!reduce} />
      <Terrain />
      <Landmarks animate={!reduce} />
      <Clouds animate={!reduce} />
      {/* Particles are purely decorative motion: skipped entirely for reduced motion. */}
      {!reduce && <NationParticles />}
      <TravelPath />
      <AnchorProjector />
      <CameraRig />
      <CameraFlyTo />
      <PanelViewOffset />
    </Canvas>
  );
}
