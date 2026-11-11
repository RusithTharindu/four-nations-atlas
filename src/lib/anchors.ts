/**
 * Screen-space anchors: DOM elements that follow a 3D point.
 *
 * Elements register here with a world position; <AnchorProjector/> (inside the
 * Canvas) projects every anchor each frame and writes its transform directly,
 * so following the camera never causes React re-renders.
 */
import { useCallback } from "react";

export interface Anchor {
  el: HTMLElement;
  position: readonly [number, number, number];
}

export const anchors = new Map<string, Anchor>();

/** Initial style for anchored elements: hidden until the first projection. */
export const ANCHOR_STYLE = { position: "absolute", left: 0, top: 0, visibility: "hidden" } as const;

/** Ref callback that keeps an element registered as an anchor at `position`. */
export function useAnchor(key: string, position: readonly [number, number, number]) {
  const [x, y, z] = position;
  return useCallback(
    (el: HTMLElement | null) => {
      if (el) anchors.set(key, { el, position: [x, y, z] });
      else anchors.delete(key);
    },
    [key, x, y, z],
  );
}
