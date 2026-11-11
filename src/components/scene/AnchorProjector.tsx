"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anchors } from "@/lib/anchors";

const v = new THREE.Vector3();

/** Moves every registered DOM anchor to its projected screen position, each frame. */
export function AnchorProjector() {
  useFrame(({ camera, size }) => {
    for (const { el, position } of anchors.values()) {
      v.set(position[0], position[1], position[2]).project(camera);
      const behind = v.z > 1 || v.z < -1;
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = behind ? "hidden" : "visible";
      // Nearer anchors draw on top; popups add their own offset via data-layer.
      const layer = Number(el.dataset.layer ?? 0);
      el.style.zIndex = String(layer + Math.round((1 - v.z) * 500));
    }
  });
  return null;
}
