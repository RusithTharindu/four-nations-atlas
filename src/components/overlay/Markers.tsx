"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { locations, NATION_META } from "@/lib/data";
import { isAired, passesFilters } from "@/lib/filters";
import { markerPosition } from "@/lib/world/markers";
import { ANCHOR_STYLE, useAnchor } from "@/lib/anchors";
import { useAtlas } from "@/store/atlas";
import { NationIcon } from "@/components/ui/NationIcon";
import type { AtlasLocation } from "@/types/atlas";

function Marker({ loc }: { loc: AtlasLocation }) {
  const selected = useAtlas((s) => s.selectedLocationId === loc.id);
  const hovered = useAtlas((s) => s.hoveredLocationId === loc.id);
  const selectLocation = useAtlas((s) => s.selectLocation);
  const hoverLocation = useAtlas((s) => s.hoverLocation);
  const reduce = useReducedMotion();
  const meta = NATION_META[loc.nation];
  const anchorRef = useAnchor(`marker:${loc.id}`, markerPosition(loc));
  const aired = useAtlas((s) => isAired(loc, s));
  const shown = useAtlas((s) => passesFilters(loc, s));

  return (
    <div ref={anchorRef} style={ANCHOR_STYLE} data-layer={hovered || selected ? 600 : 0}>
      <div className="absolute bottom-0 left-0 -translate-x-1/2">
        <AnimatePresence>
          {aired && (
            <motion.button
              key="pin"
              type="button"
              className={`marker relative flex flex-col items-center outline-none ${
                shown ? "pointer-events-auto" : "pointer-events-none grayscale"
              }`}
              tabIndex={shown ? 0 : -1}
              aria-hidden={!shown}
              aria-label={`${loc.name} (${meta.label})`}
              aria-pressed={selected}
              onClick={() => selectLocation(selected ? null : loc.id)}
              onPointerEnter={() => hoverLocation(loc.id)}
              onPointerLeave={() => hoverLocation(null)}
              onFocus={() => hoverLocation(loc.id)}
              onBlur={() => hoverLocation(null)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.6 }}
              animate={{ opacity: shown ? 1 : 0.18, y: 0, scale: selected ? 1.15 : shown ? 1 : 0.85 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
            >
              <svg
                viewBox="0 0 44 54"
                className="marker-pin h-[44px] w-[36px] sm:h-[54px] sm:w-[44px] drop-shadow-[0_2px_1px_rgba(0,0,0,0.3)]"
              >
                {/* Pin body: a slightly lopsided ink teardrop. */}
                <path
                  d="M22 51 C 17 41, 5.5 33, 5 21 C 4.6 10.5, 12.5 3.2, 22.4 3 C 32 3.3, 39.6 10.6, 39 21.2 C 38.4 32.6, 27 41.5, 22 51 Z"
                  fill={meta.tint}
                  stroke="var(--ink)"
                  strokeWidth={2.2}
                  strokeLinejoin="round"
                />
                {/* Second, offset pen stroke for the sketchy look. */}
                <path
                  d="M21.5 49 C 16 40, 6.5 32, 6.3 21.5 C 6.4 11.2, 13.8 4.5, 22 4.4"
                  fill="none"
                  stroke="var(--ink)"
                  strokeWidth={0.9}
                  strokeLinecap="round"
                  opacity={0.7}
                />
                {selected && (
                  <circle
                    cx="22"
                    cy="21"
                    r="19.5"
                    fill="none"
                    stroke={meta.ink}
                    strokeWidth={1.6}
                    strokeDasharray="3 3"
                  />
                )}
                <NationIcon nation={loc.nation} color={meta.ink} x={10} y={9} size={24} />
              </svg>
              <AnimatePresence>
                {(hovered || selected) && (
                  <motion.span
                    className="pointer-events-none absolute top-full mt-0.5 whitespace-nowrap rounded-sm bg-paper/90 px-1.5 font-hand text-lg leading-tight text-ink shadow-sm"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {loc.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function Markers() {
  return (
    <>
      {locations.map((loc) => (
        <Marker key={loc.id} loc={loc} />
      ))}
    </>
  );
}
