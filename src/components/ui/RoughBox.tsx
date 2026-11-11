"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import rough from "roughjs";

const generator = rough.generator();

interface RoughBoxProps {
  children: ReactNode;
  className?: string;
  /** Same seed → same wobble, so a card keeps its look between renders. */
  seed?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  roughness?: number;
  /** Adds the paper-grain texture over the fill. */
  paper?: boolean;
}

/** A box whose border (and fill) is drawn by rough.js so it looks hand-sketched. */
export function RoughBox({
  children,
  className = "",
  seed = 1,
  stroke = "var(--ink)",
  fill = "var(--paper)",
  strokeWidth = 1.6,
  roughness = 1.6,
  paper = true,
}: RoughBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      // offsetWidth/Height include padding and ignore CSS transforms (e.g. the pop-in scale).
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      setSize((s) => (s && Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paths = useMemo(() => {
    if (!size) return [];
    const pad = 4;
    const shape = generator.rectangle(pad, pad, size.w - pad * 2, size.h - pad * 2, {
      seed,
      roughness,
      bowing: 1.2,
      stroke: "#000",
      strokeWidth,
      fill: "#fff",
      fillStyle: "solid",
      // Draw the outline twice like a quick pen sketch.
      disableMultiStroke: false,
    });
    return generator.toPaths(shape);
  }, [size, seed, roughness, strokeWidth]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.fill && p.fill !== "none" ? fill : "none"}
            stroke={p.stroke && p.stroke !== "none" ? stroke : "none"}
            strokeWidth={p.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {paper && <div className="paper-grain pointer-events-none absolute inset-[5px]" aria-hidden />}
      <div className="relative">{children}</div>
    </div>
  );
}
