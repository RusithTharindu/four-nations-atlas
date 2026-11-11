"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { MOBILE_QUERY, SHEET_PEEK } from "@/lib/quality";
import { BOOK_NAMES, episodeAt, episodeIndex, eventsAtLocation, getLocation, NATION_META } from "@/lib/data";
import { useAtlas } from "@/store/atlas";
import type { AtlasLocation, Book } from "@/types/atlas";
import { Underline } from "./Doodles";
import { NationIcon } from "./NationIcon";
import { RoughBox } from "./RoughBox";

/**
 * Full details of the selected location: a sketchbook page sliding in from the
 * right on wide screens, a draggable bottom sheet on phones.
 */
export function SidePanel() {
  const selected = getLocation(useAtlas((s) => s.selectedLocationId));
  const mobile = useMediaQuery(MOBILE_QUERY);
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {selected &&
        (mobile ? (
          <BottomSheet key="sheet" loc={selected} />
        ) : (
          <motion.aside
            key="panel"
            aria-label={`${selected.name} details`}
            className="pointer-events-auto absolute bottom-[132px] right-4 top-28 z-20 w-[380px] max-w-[calc(100vw-2rem)]"
            initial={reduce ? { opacity: 0 } : { x: "110%", rotate: 3 }}
            animate={reduce ? { opacity: 1 } : { x: 0, rotate: 0.6 }}
            exit={reduce ? { opacity: 0 } : { x: "110%", rotate: 3 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 28 }}
          >
            <PanelPage loc={selected} />
          </motion.aside>
        ))}
    </AnimatePresence>
  );
}

/** Share of the viewport the sheet covers when expanded (peek size lives in quality.ts). */
const SHEET_FULL = 0.86;

function BottomSheet({ loc }: { loc: AtlasLocation }) {
  const reduce = useReducedMotion();
  const selectLocation = useAtlas((s) => s.selectLocation);
  const controls = useDragControls();
  const [expanded, setExpanded] = useState(false);
  const [vh, setVh] = useState(() => (typeof window === "undefined" ? 800 : window.innerHeight));
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const height = vh * SHEET_FULL;
  const peekY = height - vh * SHEET_PEEK; // translateY that leaves only the peek visible

  return (
    <motion.aside
      aria-label={`${loc.name} details`}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 px-2"
      style={{ height }}
      initial={reduce ? { opacity: 0, y: peekY } : { y: height }}
      animate={{ opacity: 1, y: expanded ? 0 : peekY }}
      exit={reduce ? { opacity: 0 } : { y: height }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 300, damping: 32 }}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ top: 0, bottom: height }}
      dragElastic={0.08}
      onDragEnd={(_, info) => {
        const y = (expanded ? 0 : peekY) + info.offset.y;
        if (y > peekY + 90 || info.velocity.y > 700) selectLocation(null);
        else setExpanded(y < peekY / 2 || info.velocity.y < -500);
      }}
    >
      <div
        className="absolute inset-x-0 top-0 z-10 flex h-9 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        onPointerDown={(e) => controls.start(e)}
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        aria-label={expanded ? "Collapse details" : "Expand details"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        {/* A doodled grab handle */}
        <svg viewBox="0 0 60 8" className="h-2 w-14" aria-hidden>
          <path
            d="M3 4.5 C 15 2.5, 30 6, 57 3.5"
            fill="none"
            stroke="var(--ink-soft)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <PanelPage loc={loc} variant="sheet" scrollable={expanded} />
    </motion.aside>
  );
}

function PanelPage({
  loc,
  variant = "page",
  scrollable = true,
}: {
  loc: AtlasLocation;
  variant?: "page" | "sheet";
  scrollable?: boolean;
}) {
  const current = useAtlas((s) => s.episodeIndex);
  const selectLocation = useAtlas((s) => s.selectLocation);
  const setEpisodeIndex = useAtlas((s) => s.setEpisodeIndex);
  const setPlaying = useAtlas((s) => s.setPlaying);
  const meta = NATION_META[loc.nation];

  const aired = loc.appearances.filter((a) => episodeIndex(a.episode) <= current);
  const upcoming = loc.appearances.length - aired.length;
  const byBook = new Map<Book, typeof aired>();
  for (const a of aired) {
    const book = Number(a.episode.split("-")[0]) as Book;
    byBook.set(book, [...(byBook.get(book) ?? []), a]);
  }
  const events = eventsAtLocation(loc.id).filter((e) => episodeIndex(e.episode) <= current);

  const jumpTo = (episodeId: string) => {
    setPlaying(false);
    setEpisodeIndex(episodeIndex(episodeId));
  };

  return (
    <RoughBox seed={loc.id.length * 13} className="h-full" contentClassName="h-full" roughness={1.2}>
      {/* Spiral binding down the left edge */}
      <div
        hidden={variant === "sheet"}
        className="pointer-events-none absolute -left-2 top-6 bottom-6 flex flex-col justify-between"
        aria-hidden
      >
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="block h-3 w-4 rounded-full border-2 border-ink-soft bg-paper-deep" />
        ))}
      </div>

      <div
        className={`flex h-full max-h-full min-h-0 flex-col overflow-hidden pr-4 ${
          variant === "sheet" ? "pb-4 pl-4 pt-7" : "py-4 pl-7"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide"
              style={{ color: meta.ink }}
            >
              <NationIcon nation={loc.nation} className="h-4 w-4" />
              {meta.label}
            </div>
            <h2 className="font-hand text-4xl font-bold leading-none text-ink">{loc.name}</h2>
            <Underline color={meta.ink} className="mt-0.5 w-3/4" />
          </div>
          <button
            type="button"
            onClick={() => selectLocation(null)}
            className="-mr-1 grid h-8 w-8 shrink-0 place-items-center font-hand text-3xl leading-none text-ink-soft hover:text-ink"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        <div
          className={`mt-3 min-h-0 flex-1 space-y-5 pr-1 [scrollbar-width:thin] ${
            scrollable ? "overflow-y-auto" : "overflow-hidden"
          }`}
        >
          <p className="text-sm leading-relaxed text-ink">{loc.summary}</p>

          <section>
            <h3 className="font-hand text-2xl text-ink">Episode appearances</h3>
            {[...byBook.entries()].map(([book, list]) => (
              <div key={book} className="mt-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
                  {BOOK_NAMES[book]}
                </p>
                <ul className="mt-0.5 space-y-0.5">
                  {list.map((a) => {
                    const ep = episodeAt(episodeIndex(a.episode));
                    const isNow = episodeIndex(a.episode) === current;
                    return (
                      <li key={a.episode}>
                        <button
                          type="button"
                          onClick={() => jumpTo(a.episode)}
                          className={`group flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left text-sm hover:bg-ink/5 ${isNow ? "bg-ink/10" : ""}`}
                        >
                          <span className="w-8 shrink-0 text-xs font-semibold text-ink-soft">
                            {ep.book}×{ep.number}
                          </span>
                          <span className="text-ink group-hover:underline group-hover:decoration-wavy">
                            {ep.title}
                          </span>
                          {(a.flashback || a.dream) && (
                            <span className="text-[11px] italic text-ink-soft">
                              {a.flashback ? "flashback" : "dream"}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {upcoming > 0 && (
              <p className="mt-2 font-hand text-lg text-ink-soft">
                …and {upcoming} more later on. Keep watching!
              </p>
            )}
          </section>

          {events.length > 0 && (
            <section>
              <h3 className="font-hand text-2xl text-ink">What happened here</h3>
              <ul className="mt-1 space-y-2">
                {events.map((ev) => {
                  const ep = episodeAt(episodeIndex(ev.episode));
                  return (
                    <li
                      key={ev.id}
                      className="border-l-2 border-dashed pl-2 text-sm"
                      style={{ borderColor: meta.ink }}
                    >
                      <span className="text-xs font-semibold text-ink-soft">
                        {ep.book}×{ep.number} · {ep.title}
                      </span>
                      <p className="leading-snug text-ink">{ev.summary}</p>
                      <a
                        href={ev.source}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-ink-soft underline decoration-dotted hover:text-ink"
                      >
                        source
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <p className="text-[11px] text-ink-soft">
            Place info:{" "}
            <a
              href={loc.source}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-dotted hover:text-ink"
            >
              Avatar Wiki
            </a>
          </p>
        </div>
      </div>
    </RoughBox>
  );
}
