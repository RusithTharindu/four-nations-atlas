"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import type { PerspectiveCamera } from "three";
import { prefersReducedMotion } from "@/lib/motion";
import { useAtlas } from "@/store/atlas";
import { SHEET_PEEK } from "@/lib/quality";

/** Width the side panel takes from the right edge (panel + gutter) on desktop. */
const PANEL_SPACE = 396;
const DESKTOP_MIN = 768;

/**
 * While the side panel is open on wide screens, shift the camera's view window
 * so the map's centre sits in the uncovered area, not behind the panel.
 */
export function PanelViewOffset() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const offset = useRef({ px: 0, py: 0 });
  const applied = useRef("");

  useEffect(() => {
    // Desktop: the panel covers the right edge → shift the view left.
    // Phone: the bottom sheet peeks up from below → shift the view up.
    const target = (open: boolean) => {
      if (!open) return { px: 0, py: 0 };
      return window.innerWidth >= DESKTOP_MIN
        ? { px: PANEL_SPACE / 2, py: 0 }
        : { px: 0, py: (window.innerHeight * SHEET_PEEK) / 2 };
    };
    let tween: gsap.core.Tween | null = null;
    const go = (open: boolean) => {
      tween?.kill();
      const to = target(open);
      if (prefersReducedMotion()) Object.assign(offset.current, to);
      else tween = gsap.to(offset.current, { ...to, duration: 0.6, ease: "power2.out" });
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
    const py = Math.round(offset.current.py * 10) / 10;
    const key = `${px}|${py}|${size.width}|${size.height}`;
    if (key === applied.current) return;
    applied.current = key;
    if (px === 0 && py === 0) camera.clearViewOffset();
    else camera.setViewOffset(size.width, size.height, px, py, size.width, size.height);
    camera.updateProjectionMatrix();
  });

  return null;
}
