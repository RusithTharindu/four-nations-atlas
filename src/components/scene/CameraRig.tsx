"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { WORLD } from "@/lib/world/terrain";

export const CAMERA_DEFAULT = {
  position: [18, 128, 150] as [number, number, number],
  target: [4, 0, 14] as [number, number, number],
  fov: 38,
};

const LIMIT_X = WORLD.halfX * 0.85;
const LIMIT_Z = WORLD.halfZ * 0.85;

/**
 * Orbit controls with limits: the camera can never dip to the horizon or below
 * the ocean, zoom is clamped, and panning is kept over the map.
 */
/** Narrow screens see less of the map horizontally, so pull the camera back to fit it. */
export function fitDistanceFactor(aspect: number): number {
  return aspect >= 1.3 ? 1 : Math.min(2.6, 1.3 / aspect);
}

export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);

  // Initial framing only: once the user moves the camera we leave it alone.
  useLayoutEffect(() => {
    const k = fitDistanceFactor(aspect);
    const [tx, ty, tz] = CAMERA_DEFAULT.target;
    const [px, py, pz] = CAMERA_DEFAULT.position;
    camera.position.set(tx + (px - tx) * k, ty + (py - ty) * k, tz + (pz - tz) * k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  return (
    <OrbitControls
      makeDefault
      target={CAMERA_DEFAULT.target}
      enableDamping
      dampingFactor={0.08}
      zoomSpeed={0.7}
      rotateSpeed={0.5}
      panSpeed={0.8}
      screenSpacePanning={false}
      minDistance={22}
      maxDistance={420}
      minPolarAngle={0.12}
      maxPolarAngle={1.18}
      onChange={(e) => {
        const controls = e?.target as OrbitControlsImpl | undefined;
        if (!controls) return;
        const t = controls.target;
        const cx = Math.min(Math.max(t.x, -LIMIT_X), LIMIT_X);
        const cz = Math.min(Math.max(t.z, -LIMIT_Z), LIMIT_Z);
        if (cx !== t.x || cz !== t.z || t.y !== 0) {
          const dx = cx - t.x;
          const dz = cz - t.z;
          const dy = -t.y;
          t.set(cx, 0, cz);
          controls.object.position.x += dx;
          controls.object.position.y += dy;
          controls.object.position.z += dz;
        }
        // Belt and braces: never let the camera sink below the waves.
        if (controls.object.position.y < 6) controls.object.position.y = 6;
      }}
    />
  );
}
