"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAtlas } from "@/store/atlas";
import { UrlState } from "./UrlState";

const Scene = dynamic(() => import("./scene/Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <p className="font-hand text-3xl text-ink-soft motion-safe:animate-pulse">sketching the world…</p>
    </div>
  ),
});

// Client-only: it depends on the viewer's motion preference and the live camera.
const MapOverlay = dynamic(() => import("./overlay/MapOverlay"), { ssr: false });

export function MapShell() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useAtlas.getState().selectLocation(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="absolute inset-0">
      <Scene />
      <MapOverlay />
      <UrlState />
    </div>
  );
}
