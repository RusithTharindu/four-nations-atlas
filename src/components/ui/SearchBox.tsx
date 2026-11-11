"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { episodes, firstAppearanceIndex, isLocationVisibleAt, locations, NATION_META } from "@/lib/data";
import { useAtlas } from "@/store/atlas";
import { NationIcon } from "./NationIcon";
import { RoughBox } from "./RoughBox";
import type { AtlasLocation, Book, Episode } from "@/types/atlas";
import { matchesBooks } from "@/lib/filters";

type Result = { kind: "location"; loc: AtlasLocation } | { kind: "episode"; ep: Episode; index: number };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s]/g, "");

function search(query: string): Result[] {
  const q = norm(query.trim());
  if (!q) return [];
  const locs: Result[] = locations
    .filter((l) => norm(l.name).includes(q))
    .map((loc) => ({ kind: "location", loc }));
  const eps: Result[] = episodes
    .map((ep, index) => ({ ep, index }))
    .filter(({ ep }) => norm(ep.title).includes(q) || `${ep.book}x${ep.number}` === q.replace(/\s/g, ""))
    .map(({ ep, index }) => ({ kind: "episode", ep, index }));
  return [...locs, ...eps].slice(0, 7);
}

/** Search places and episode titles. Picking a place flies to it; picking an episode moves the timeline. */
export function SearchBox() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const results = useMemo(() => search(query), [query]);
  const listId = useId();

  const choose = (r: Result) => {
    const s = useAtlas.getState();
    if (r.kind === "location") {
      // If the place hasn't aired yet, jump the timeline to its first appearance first.
      if (!isLocationVisibleAt(r.loc, s.episodeIndex)) s.setEpisodeIndex(firstAppearanceIndex(r.loc));
      if (!s.nations[r.loc.nation]) s.toggleNation(r.loc.nation);
      const now = useAtlas.getState();
      if (!matchesBooks(r.loc, now)) {
        const book = Number(r.loc.appearances[0].episode.split("-")[0]) as Book;
        if (!now.books[book]) now.toggleBook(book);
      }
      s.selectLocation(r.loc.id);
    } else {
      s.setPlaying(false);
      s.setEpisodeIndex(r.index);
    }
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="pointer-events-auto relative w-full sm:max-w-[280px]">
      <label className="relative flex items-center gap-2 px-1">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-ink-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M10.5 4.2 C 14.4 4, 17 6.8, 16.8 10.6 C 16.6 14.2, 13.8 16.8, 10.2 16.6 C 6.6 16.4, 4 13.6, 4.3 10 C 4.5 6.8, 7 4.4, 11.4 4.6" />
          <path d="M15.4 15.6 L 20 20.3" />
        </svg>
        <span className="sr-only">Search places and episodes</span>
        <input
          type="search"
          value={query}
          placeholder="Search places or episodes…"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              choose(results[active]);
            } else if (e.key === "Escape") {
              e.stopPropagation();
              setQuery("");
              setOpen(false);
            }
          }}
          className="w-full bg-transparent py-1 font-hand text-xl text-ink placeholder:text-ink-soft/70 focus:outline-none"
        />
        {/* Hand-drawn underline instead of an input border */}
        <svg
          viewBox="0 0 200 8"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-2 w-full"
          aria-hidden
        >
          <path
            d="M2 5 C 50 2, 90 7, 140 4 S 190 3, 198 5"
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </svg>
      </label>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            className="absolute left-0 right-0 top-full z-30 mt-2"
            initial={{ opacity: 0, y: -6, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -0.5 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <RoughBox seed={5} className="p-1.5">
              <ul id={listId} role="listbox" className="max-h-72 overflow-auto">
                {results.map((r, i) => (
                  <li
                    key={r.kind === "location" ? r.loc.id : r.ep.id}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(r)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm ${i === active ? "bg-ink/10" : ""}`}
                  >
                    {r.kind === "location" ? (
                      <>
                        <NationIcon
                          nation={r.loc.nation}
                          className="h-4 w-4 shrink-0"
                          color={NATION_META[r.loc.nation].ink}
                        />
                        <span className="font-hand text-lg leading-tight">{r.loc.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-9 shrink-0 text-[11px] font-semibold text-ink-soft">
                          {r.ep.book}×{r.ep.number}
                        </span>
                        <span className="truncate">{r.ep.title}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </RoughBox>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
