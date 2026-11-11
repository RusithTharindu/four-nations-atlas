"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { anchors } from "@/lib/anchors";

const v = new THREE.Vector3();
/** Last styles written per element, so unchanged anchors cost no DOM writes. */
const written = new WeakMap<HTMLElement, string>();

/** Moves every registered DOM anchor to its projected screen position, each frame. */
export function AnchorProjector() {
  useFrame(({ camera, size }) => {
    for (const { el, position } of anchors.values()) {
      v.set(position[0], position[1], position[2]).project(camera);
      const behind = v.z > 1 || v.z < -1;
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      // Nearer anchors draw on top; popups add their own offset via data-layer.
      const layer = Number(el.dataset.layer ?? 0);
      const z = layer + Math.round((1 - v.z) * 500);
      const key = `${x.toFixed(1)}|${y.toFixed(1)}|${behind}|${z}`;
      if (written.get(el) === key) continue;
      written.set(el, key);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      el.style.visibility = behind ? "hidden" : "visible";
      el.style.zIndex = String(z);
    }
  });
  return null;
}
