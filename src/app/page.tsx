import { MapShell } from "@/components/MapShell";

export default function Home() {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <MapShell />
      <header className="pointer-events-none absolute inset-x-0 top-0 p-4">
        <h1 className="font-hand text-4xl font-bold text-ink drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] sm:text-5xl">
          Four Nations Atlas
        </h1>
      </header>
      <footer className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-ink-soft">
        Unofficial fan project. Not affiliated with the rights holders.
      </footer>
    </main>
  );
}
