"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  appearancesUpTo,
  episodeAt,
  episodeIndex,
  eventsAtLocation,
  firstAppearanceIndex,
  getLocation,
  NATION_META,
} from "@/lib/data";
import { hashTilt } from "@/lib/motion";
import { useAtlas } from "@/store/atlas";
import { RoughBox } from "@/components/ui/RoughBox";
import { DoodleArrow, Underline } from "@/components/ui/Doodles";
import { NationIcon } from "@/components/ui/NationIcon";
import type { AtlasLocation } from "@/types/atlas";
import { markerPosition } from "@/lib/world/markers";
import { ANCHOR_STYLE, useAnchor } from "@/lib/anchors";

/** Doodled sticky-note card anchored above the selected marker. */
export function LocationPopup() {
  const selectedId = useAtlas((s) => s.selectedLocationId);
  // Keep the last anchor so the card can play its exit animation in place.
  const [anchorId, setAnchorId] = useState<string | null>(selectedId);
  if (selectedId && selectedId !== anchorId) setAnchorId(selectedId);

  const anchor = getLocation(anchorId);
  if (!anchor) return null;
  return <PopupAnchor loc={anchor} open={selectedId === anchor.id} />;
}

function PopupAnchor({ loc, open }: { loc: AtlasLocation; open: boolean }) {
  const anchorRef = useAnchor("popup", markerPosition(loc));
  return (
    <div ref={anchorRef} style={ANCHOR_STYLE} data-layer={2000}>
      <AnimatePresence>{open && <PopupCard key={loc.id} loc={loc} />}</AnimatePresence>
    </div>
  );
}

function PopupCard({ loc }: { loc: AtlasLocation }) {
  const selectLocation = useAtlas((s) => s.selectLocation);
  const reduce = useReducedMotion();
  const meta = NATION_META[loc.nation];
  const tilt = hashTilt(loc.id) * 2.5;
  const first = episodeAt(firstAppearanceIndex(loc));
  const firstIsFlashback = loc.appearances.find((a) => a.episode === first.id)?.flashback;
  // Spoiler-safe: only what has aired by the timeline's current episode.
  const current = useAtlas((s) => s.episodeIndex);
  const events = eventsAtLocation(loc.id).filter((e) => episodeIndex(e.episode) <= current);
  const shown = appearancesUpTo(loc, current).length;
  const latest = events.length ? events[events.length - 1] : null;
  const latestEpisode = latest ? episodeAt(episodeIndex(latest.episode)) : null;

  return (
    <motion.div
      className="pointer-events-auto absolute bottom-[74px] left-0 w-[min(270px,80vw)] origin-bottom"
      style={{ x: "-50%" }}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.55, rotate: tilt - 9, y: 18 }}
      animate={{ opacity: 1, scale: 1, rotate: tilt, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, rotate: tilt + 6, y: 10 }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 420, damping: 15, mass: 0.8 }}
      role="dialog"
      aria-label={loc.name}
    >
      {/* A strip of "tape" holding the note down. */}
      <div className="absolute -top-2 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rotate-[-4deg] bg-amber-100/80 shadow-sm" />
      <RoughBox seed={loc.id.length * 7 + 3} className="px-5 pb-4 pt-4">
        <button
          type="button"
          onClick={() => selectLocation(null)}
          className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center font-hand text-2xl leading-none text-ink-soft hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
        <div
          className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide"
          style={{ color: meta.ink }}
        >
          <NationIcon nation={loc.nation} className="h-4 w-4" />
          {meta.label}
        </div>
        <h2 className="mt-0.5 font-hand text-3xl font-bold leading-none text-ink">{loc.name}</h2>
        <Underline color={meta.ink} className="-mt-0.5 mb-2 w-4/5" />
        {/* The quick note: full details live in the side panel. */}
        <p className="text-xs text-ink-soft">
          <span className="font-semibold text-ink">First seen: </span>
          {first.book}×{first.number} <span className="italic">{first.title}</span>
          {firstIsFlashback && " (flashback)"} · {shown} episode{shown === 1 ? "" : "s"} so far
        </p>
        {!latest && <p className="mt-2 text-sm leading-snug text-ink">{loc.summary}</p>}
        {latest && latestEpisode && (
          <p className="mt-2 border-t border-dashed border-ink/30 pt-2 font-hand text-lg leading-tight text-ink">
            <span style={{ color: meta.ink }}>
              {latestEpisode.book}×{latestEpisode.number}:
            </span>{" "}
            {latest.summary}
          </p>
        )}
      </RoughBox>
      <DoodleArrow className="absolute -bottom-11 left-1/2 h-10 w-12 -translate-x-1/2 rotate-[100deg]" />
    </motion.div>
  );
}
