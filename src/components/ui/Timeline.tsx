"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import rough from "roughjs";
import { BOOK_NAMES, BOOK_RANGES, EPISODE_COUNT, episodeAt, episodeIndex, events } from "@/lib/data";
import { useAtlas } from "@/store/atlas";

const PLAY_INTERVAL_MS = 1800;
const generator = rough.generator();

const pct = (i: number) => (i / (EPISODE_COUNT - 1)) * 100;
const eventEpisodes = new Set(events.map((e) => episodeIndex(e.episode)));

/** Advances the timeline while playing; stops at the finale. */
function usePlayback() {
  const isPlaying = useAtlas((s) => s.isPlaying);
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const { episodeIndex: i, stepEpisode, setPlaying } = useAtlas.getState();
      if (i >= EPISODE_COUNT - 1) setPlaying(false);
      else stepEpisode(1);
    }, PLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPlaying]);
}

/** A sketchy pencil stroke the width of the track. */
function PencilLine({ width }: { width: number }) {
  const paths = useMemo(() => {
    if (width < 10) return [];
    const opts = { seed: 7, roughness: 1.1, bowing: 0.6, stroke: "#000", strokeWidth: 1.6 };
    return [
      ...generator.toPaths(generator.line(2, 12, width - 2, 12, opts)),
      ...generator.toPaths(generator.line(4, 13, width - 4, 12.5, { ...opts, seed: 11, strokeWidth: 0.8 })),
    ];
  }, [width]);
  return (
    <svg className="pointer-events-none absolute inset-x-0 top-0 h-6 w-full overflow-visible" aria-hidden>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill="none" stroke="var(--ink-soft)" strokeWidth={p.strokeWidth} strokeLinecap="round" />
      ))}
    </svg>
  );
}

export function Timeline() {
  usePlayback();
  const reduce = useReducedMotion();
  const index = useAtlas((s) => s.episodeIndex);
  const isPlaying = useAtlas((s) => s.isPlaying);
  const setEpisodeIndex = useAtlas((s) => s.setEpisodeIndex);
  const stepEpisode = useAtlas((s) => s.stepEpisode);
  const setPlaying = useAtlas((s) => s.setPlaying);
  const episode = episodeAt(index);

  const track = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const indexFromPointer = (e: PointerEvent) => {
    const rect = track.current!.getBoundingClientRect();
    const t = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    return Math.round(t * (EPISODE_COUNT - 1));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setPlaying(false);
    setEpisodeIndex(indexFromPointer(e));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) setEpisodeIndex(indexFromPointer(e));
  };
  const onPointerUp = () => setDragging(false);

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => stepEpisode(1),
      ArrowUp: () => stepEpisode(1),
      ArrowLeft: () => stepEpisode(-1),
      ArrowDown: () => stepEpisode(-1),
      PageUp: () => stepEpisode(5),
      PageDown: () => stepEpisode(-5),
      Home: () => setEpisodeIndex(0),
      End: () => setEpisodeIndex(EPISODE_COUNT - 1),
    };
    const action = keys[e.key];
    if (action) {
      e.preventDefault();
      setPlaying(false);
      action();
    }
  };

  const togglePlay = () => {
    if (!isPlaying && index >= EPISODE_COUNT - 1) setEpisodeIndex(0);
    setPlaying(!isPlaying);
  };

  return (
    <div className="pointer-events-auto flex items-end gap-3 sm:gap-5">
      <button
        type="button"
        onClick={togglePlay}
        className="group relative mb-5 grid h-11 w-11 shrink-0 place-items-center text-ink"
        aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
      >
        <svg viewBox="0 0 44 44" className="absolute inset-0 transition-transform group-hover:rotate-6" aria-hidden>
          <path
            d="M22 3.5 C 33 3, 40.5 11, 40.4 22.3 C 40 33, 32 40.6, 21.5 40.4 C 10.6 40.2, 3.5 32.4, 3.6 21.6 C 3.8 11.2, 11.4 4, 23.5 4.6"
            fill="var(--paper)"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
        <svg viewBox="0 0 24 24" className="relative h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {isPlaying ? (
            <>
              <path d="M8.5 5.5 L 8.2 18.6" />
              <path d="M15.6 5.4 L 15.9 18.5" />
            </>
          ) : (
            <path d="M8 4.8 L 18.6 12.2 L 7.6 19.3 Z" fill="currentColor" fillOpacity={0.15} />
          )}
        </svg>
      </button>

      <div className="relative min-w-0 flex-1 pb-6 pt-14">
        {/* Track (also the drag surface) */}
        <div
          ref={track}
          className="relative h-6 cursor-pointer touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <PencilLine width={width} />

          {/* Episode ticks; taller ones mark episodes with a story event. */}
          {Array.from({ length: EPISODE_COUNT }, (_, i) => (
            <span
              key={i}
              className={`absolute top-[12px] w-px -translate-x-1/2 bg-ink-soft ${eventEpisodes.has(i) ? "h-2.5 opacity-90" : "h-1.5 opacity-50"} ${i <= index ? "" : "opacity-25"}`}
              style={{ left: `${pct(i)}%` }}
              aria-hidden
            />
          ))}

          {/* Book separators */}
          {BOOK_RANGES.slice(1).map((r) => (
            <span
              key={r.book}
              className="absolute top-[3px] h-[19px] w-[2px] -translate-x-1/2 rotate-[8deg] rounded bg-ink"
              style={{ left: `${(pct(r.start) + pct(r.start - 1)) / 2}%` }}
              aria-hidden
            />
          ))}

          {/* Handle with its floating episode label */}
          <motion.div
            className="absolute top-0 -translate-x-1/2"
            initial={false}
            animate={{ left: `${pct(index)}%` }}
            transition={dragging || reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Near the ends the label hugs the handle's inner side so it stays on screen. */}
            <div
              className={`pointer-events-none absolute bottom-full mb-2 ${
                pct(index) < 12 ? "-left-2" : pct(index) > 88 ? "-right-2" : "left-1/2 -translate-x-1/2"
              }`}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={episode.id}
                  className="whitespace-nowrap rounded-sm bg-paper/95 px-2 py-0.5 text-center shadow-[1px_2px_0_rgba(43,38,32,0.25)]"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, rotate: -2 }}
                  animate={{ opacity: 1, y: 0, rotate: -1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
                    Book {episode.book} · Ep. {episode.number}
                  </span>
                  <span className="block max-w-[60vw] truncate font-hand text-xl leading-tight text-ink">
                    {episode.title}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div
              role="slider"
              tabIndex={0}
              aria-label="Episode"
              aria-valuemin={1}
              aria-valuemax={EPISODE_COUNT}
              aria-valuenow={index + 1}
              aria-valuetext={`Book ${episode.book}, episode ${episode.number}: ${episode.title}`}
              onKeyDown={onKeyDown}
              className="relative grid h-6 w-6 cursor-grab place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ink/50 active:cursor-grabbing"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]" aria-hidden>
                <path
                  d="M12 2.6 C 18 2.4, 21.6 6.6, 21.4 12.2 C 21.2 18, 17 21.5, 11.6 21.4 C 6 21.2, 2.5 17.2, 2.7 11.8 C 2.9 6.6, 6.8 2.9, 13.2 3.3"
                  fill="var(--paper)"
                  stroke="var(--ink)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <path d="M8 12.4 C 10 9.8, 13.4 14.4, 16 11.4" fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Book labels under each section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5" aria-hidden>
          {BOOK_RANGES.map((r) => (
            <span
              key={r.book}
              className={`absolute -translate-x-1/2 whitespace-nowrap font-hand text-base leading-none transition-opacity ${
                episode.book === r.book ? "text-ink opacity-100" : "text-ink-soft opacity-60"
              }`}
              style={{ left: `${(pct(r.start) + pct(r.end)) / 2}%` }}
            >
              <span className="hidden sm:inline">{BOOK_NAMES[r.book]}</span>
              <span className="sm:hidden">Book {r.book}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
