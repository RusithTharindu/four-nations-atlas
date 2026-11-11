"use client";

import { motion } from "motion/react";
import { BOOK_NAMES, NATION_META } from "@/lib/data";
import { useAtlas } from "@/store/atlas";
import { BOOKS, NATIONS, type Book, type Nation } from "@/types/atlas";
import { NationIcon } from "./NationIcon";
import { RoughBox } from "./RoughBox";

function Chip({
  active,
  onClick,
  label,
  title,
  ink,
  tint,
  seed,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  title: string;
  ink: string;
  tint: string;
  seed: number;
  children?: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className="pointer-events-auto shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
      whileHover={{ rotate: seed % 2 ? 2 : -2, y: -1 }}
      whileTap={{ scale: 0.94 }}
      animate={{ opacity: active ? 1 : 0.55 }}
    >
      <RoughBox
        seed={seed}
        roughness={1.3}
        strokeWidth={1.3}
        fill={active ? tint : "var(--paper)"}
        stroke={active ? ink : "var(--ink-soft)"}
        paper={false}
        className="px-3 py-1"
      >
        <span
          className={`flex items-center gap-1 font-hand text-lg leading-none ${active ? "" : "line-through decoration-1"}`}
          style={{ color: active ? ink : "var(--ink-soft)" }}
        >
          {children}
          {label}
        </span>
      </RoughBox>
    </motion.button>
  );
}

export function FilterChips() {
  const nations = useAtlas((s) => s.nations);
  const books = useAtlas((s) => s.books);
  const toggleNation = useAtlas((s) => s.toggleNation);
  const toggleBook = useAtlas((s) => s.toggleBook);

  return (
    <div
      className="pointer-events-auto -mx-4 flex flex-nowrap items-center gap-1.5 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      role="group"
      aria-label="Filters"
    >
      {NATIONS.map((n: Nation, i) => {
        const meta = NATION_META[n];
        return (
          <Chip
            key={n}
            active={nations[n]}
            onClick={() => toggleNation(n)}
            label={meta.label}
            title={`${nations[n] ? "Hide" : "Show"} ${meta.label} places`}
            ink={meta.ink}
            tint={meta.tint}
            seed={11 + i}
          >
            <NationIcon nation={n} className="h-4 w-4" />
          </Chip>
        );
      })}
      <span className="mx-1 h-5 w-px rotate-12 bg-ink-soft/60" aria-hidden />
      {BOOKS.map((b: Book) => (
        <Chip
          key={b}
          active={books[b]}
          onClick={() => toggleBook(b)}
          label={`Book ${b}`}
          title={`${books[b] ? "Hide" : "Show"} places seen in ${BOOK_NAMES[b]}`}
          ink="var(--ink)"
          tint="#efe3c2"
          seed={31 + b}
        />
      ))}
    </div>
  );
}
