import { EPISODE_COUNT, locations } from "@/lib/data";

export default function Home() {
  return (
    <main className="relative flex h-full flex-col items-center justify-center gap-2 bg-paper">
      <h1 className="font-hand text-6xl">Four Nations Atlas</h1>
      <p className="text-ink-soft">
        {EPISODE_COUNT} episodes · {locations.length} locations — the map arrives in step 2.
      </p>
      <footer className="absolute bottom-2 text-xs text-ink-soft">
        Unofficial fan project. Not affiliated with the rights holders.
      </footer>
    </main>
  );
}
