import { MapShell } from "@/components/MapShell";
import { Timeline } from "@/components/ui/Timeline";
import { SearchBox } from "@/components/ui/SearchBox";
import { FilterChips } from "@/components/ui/FilterChips";
import { SidePanel } from "@/components/ui/SidePanel";

export default function Home() {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <MapShell />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-start gap-x-6 gap-y-2 bg-gradient-to-b from-paper/80 via-paper/40 to-transparent px-4 pb-6 pt-3 sm:px-6">
        <h1 className="font-hand text-4xl font-bold leading-none text-ink drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] sm:text-5xl">
          Four Nations Atlas
        </h1>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          <SearchBox />
          <FilterChips />
        </div>
      </header>

      <SidePanel />

      <section
        aria-label="Episode timeline"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-paper/90 via-paper/60 to-transparent px-4 pb-1 sm:px-10"
      >
        <Timeline />
        <p className="pb-1 text-center text-[11px] text-ink-soft">
          Unofficial fan project. Not affiliated with the rights holders.
        </p>
      </section>
    </main>
  );
}
