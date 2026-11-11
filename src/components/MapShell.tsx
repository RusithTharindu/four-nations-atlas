"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./scene/Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <p className="font-hand text-3xl text-ink-soft animate-pulse">sketching the world…</p>
    </div>
  ),
});

export function MapShell() {
  return (
    <div className="absolute inset-0">
      <Scene />
    </div>
  );
}
