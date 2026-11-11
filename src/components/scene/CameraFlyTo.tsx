"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getLocation } from "@/lib/data";
import { markerPosition } from "@/lib/world/markers";
import { prefersReducedMotion } from "@/lib/motion";
import { useAtlas } from "@/store/atlas";

const FRAME_DISTANCE = 72;
const FRAME_POLAR = 0.88; // radians from straight down; keeps the isometric feel

/**
 * Watches the selected location and flies the camera to frame it with a GSAP
 * tween: the target glides over, the camera follows along an arc that lifts
 * slightly mid-flight. Any user drag/zoom cancels the flight.
 */
export function CameraFlyTo() {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const camera = useThree((s) => s.camera);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      tween.current?.kill();
      tween.current = null;
    };
    controls.addEventListener("start", cancel);

    const flyTo = (id: string | null) => {
      const loc = getLocation(id);
      if (!loc) return;
      const [x, y, z] = markerPosition(loc);
      // Aim a little north of the marker so it sits low on screen, leaving room for the popup.
      const endTarget = new THREE.Vector3(x, y * 0.5, z - 9);

      // Keep the current viewing direction (azimuth), but settle at a fixed tilt and distance.
      const offset = camera.position.clone().sub(controls.target);
      const azimuth = Math.atan2(offset.x, offset.z);
      const endPos = endTarget
        .clone()
        .add(
          new THREE.Vector3(
            Math.sin(azimuth) * Math.sin(FRAME_POLAR),
            Math.cos(FRAME_POLAR),
            Math.cos(azimuth) * Math.sin(FRAME_POLAR),
          ).multiplyScalar(FRAME_DISTANCE),
        );

      cancel();
      if (prefersReducedMotion()) {
        controls.target.copy(endTarget);
        camera.position.copy(endPos);
        controls.update();
        return;
      }

      const startTarget = controls.target.clone();
      const startPos = camera.position.clone();
      const travel = startTarget.distanceTo(endTarget);
      const lift = Math.min(travel * 0.35, 45);
      const p = { t: 0 };
      tween.current = gsap.to(p, {
        t: 1,
        duration: THREE.MathUtils.clamp(0.9 + travel / 90, 1, 2.2),
        ease: "power3.inOut",
        onUpdate: () => {
          controls.target.lerpVectors(startTarget, endTarget, p.t);
          camera.position.lerpVectors(startPos, endPos, p.t);
          camera.position.y += Math.sin(Math.PI * p.t) * lift;
          controls.update();
        },
        onComplete: () => {
          tween.current = null;
        },
      });
    };

    let last = useAtlas.getState().selectedLocationId;
    if (last) flyTo(last);
    const unsubscribe = useAtlas.subscribe((s) => {
      if (s.selectedLocationId !== last) {
        last = s.selectedLocationId;
        flyTo(last);
      }
    });

    return () => {
      unsubscribe();
      controls.removeEventListener("start", cancel);
      cancel();
    };
  }, [controls, camera]);

  return null;
}
