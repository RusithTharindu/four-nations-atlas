"use client";

import { Markers } from "./Markers";
import { LocationPopup } from "./LocationPopup";
import { CutFade } from "./CutFade";

/** DOM overlay: markers and popups pinned to 3D points by <AnchorProjector/>. */
export default function MapOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 isolate overflow-hidden">
      <Markers />
      <LocationPopup />
      <CutFade />
    </div>
  );
}
