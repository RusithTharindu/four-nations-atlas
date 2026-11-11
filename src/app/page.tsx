import { MapShell } from "@/components/MapShell";
import { Timeline } from "@/components/ui/Timeline";
import { SearchBox } from "@/components/ui/SearchBox";
import { FilterChips } from "@/components/ui/FilterChips";
import { SidePanel } from "@/components/ui/SidePanel";

export default function Home() {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <MapShell />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-1.5 bg-gradient-to-b from-paper/85 via-paper/50 to-transparent px-4 pb-6 pt-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-6 sm:gap-y-2 sm:px-6">
        <h1 className="font-hand text-3xl font-bold leading-none text-ink drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] sm:text-5xl">
          Four Nations Atlas
        </h1>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 sm:pt-1">
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
