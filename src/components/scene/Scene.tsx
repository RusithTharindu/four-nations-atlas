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
import { useAtlas } from "@/store/atlas";
import { useRef } from "react";

const SKY = "#bfe0ea";

export default function Scene() {
  const down = useRef<{ x: number; y: number } | null>(null);
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
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 220, 520]} />

      <hemisphereLight args={["#fff6e5", "#5d8aa0", 0.9]} />
      <directionalLight
        position={[-80, 120, 60]}
        intensity={1.8}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-130}
        shadow-camera-right={130}
        shadow-camera-top={110}
        shadow-camera-bottom={-110}
        shadow-camera-far={400}
        shadow-bias={-0.0004}
      />

      <Ocean />
      <Terrain />
      <Landmarks />
      <TravelPath />
      <AnchorProjector />
      <CameraRig />
      <CameraFlyTo />
      <PanelViewOffset />
    </Canvas>
  );
}
