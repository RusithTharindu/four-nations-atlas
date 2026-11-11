"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import type { PerspectiveCamera } from "three";
import { prefersReducedMotion } from "@/lib/motion";
import { useAtlas } from "@/store/atlas";

/** Width the side panel takes from the right edge (panel + gutter), desktop only. */
const PANEL_SPACE = 396;
const DESKTOP_MIN = 768;

/**
 * While the side panel is open on wide screens, shift the camera's view window
 * so the map's centre sits in the uncovered area, not behind the panel.
 */
export function PanelViewOffset() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const offset = useRef({ px: 0 });
  const applied = useRef(-1);

  useEffect(() => {
    const target = (open: boolean) => (open && window.innerWidth >= DESKTOP_MIN ? PANEL_SPACE / 2 : 0);
    let tween: gsap.core.Tween | null = null;
    const go = (open: boolean) => {
      tween?.kill();
      const px = target(open);
      if (prefersReducedMotion()) offset.current.px = px;
      else tween = gsap.to(offset.current, { px, duration: 0.6, ease: "power2.out" });
    };
    go(!!useAtlas.getState().selectedLocationId);
    const unsub = useAtlas.subscribe((s, p) => {
      if (!!s.selectedLocationId !== !!p.selectedLocationId) go(!!s.selectedLocationId);
    });
    return () => {
      unsub();
      tween?.kill();
    };
  }, []);

  useFrame(() => {
    const px = Math.round(offset.current.px * 10) / 10;
    const key = px + size.width * 1e-4 + size.height * 1e-8;
    if (key === applied.current) return;
    applied.current = key;
    if (px === 0) camera.clearViewOffset();
    else camera.setViewOffset(size.width, size.height, px, 0, size.width, size.height);
    camera.updateProjectionMatrix();
  });

  return null;
}
