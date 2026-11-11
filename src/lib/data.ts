import episodesJson from "@data/episodes.json";
import locationsJson from "@data/locations.json";
import eventsJson from "@data/events.json";
import type {
  AtlasEvent,
  AtlasLocation,
  Book,
  Episode,
  EpisodeId,
  Nation,
} from "@/types/atlas";

// The JSON is checked by `npm run validate:data`; here we just give it its types.
export const episodes = episodesJson as Episode[];
export const locations = locationsJson as unknown as AtlasLocation[];

export const EPISODE_COUNT = episodes.length;

const episodeOrdinal = new Map<EpisodeId, number>(episodes.map((e, i) => [e.id, i]));
const locationMap = new Map<string, AtlasLocation>(locations.map((l) => [l.id, l]));

/** 0-based position of an episode in broadcast order (1-1 → 0, 3-21 → 60). */
export function episodeIndex(id: EpisodeId): number {
  const index = episodeOrdinal.get(id);
  if (index === undefined) throw new Error(`Unknown episode id: ${id}`);
  return index;
}

export function isEpisodeId(id: string | null | undefined): id is EpisodeId {
  return !!id && episodeOrdinal.has(id);
}

export function episodeAt(index: number): Episode {
  return episodes[Math.min(Math.max(index, 0), EPISODE_COUNT - 1)];
}

export function getLocation(id: string | null | undefined): AtlasLocation | undefined {
  return id ? locationMap.get(id) : undefined;
}

/** Events sorted in broadcast order. */
export const events = (eventsJson as AtlasEvent[])
  .slice()
  .sort((a, b) => episodeIndex(a.episode) - episodeIndex(b.episode));

/** Index of the first episode that shows a location. */
export function firstAppearanceIndex(location: AtlasLocation): number {
  return Math.min(...location.appearances.map((a) => episodeIndex(a.episode)));
}

export function eventsAtLocation(locationId: string): AtlasEvent[] {
  return events.filter((e) => e.location === locationId);
}

export function booksOfLocation(location: AtlasLocation): Book[] {
  const set = new Set<Book>(
    location.appearances.map((a) => Number(a.episode.split("-")[0]) as Book),
  );
  return [...set].sort();
}

export const BOOK_NAMES: Record<Book, string> = {
  1: "Book One: Water",
  2: "Book Two: Earth",
  3: "Book Three: Fire",
};

export const NATION_META: Record<Nation, { label: string; ink: string; tint: string }> = {
  water: { label: "Water Tribes", ink: "#2f6f9f", tint: "#cfe6f5" },
  earth: { label: "Earth Kingdom", ink: "#4f7a2f", tint: "#dcebc8" },
  fire: { label: "Fire Nation", ink: "#b5361f", tint: "#f6d3c7" },
  air: { label: "Air Nomads", ink: "#c98a12", tint: "#f8e8bf" },
};

export function formatEpisode(e: Episode): string {
  return `Book ${e.book} · Ep. ${e.number}`;
}

/** A location is on the map once its first on-screen appearance has aired. */
export function isLocationVisibleAt(location: AtlasLocation, index: number): boolean {
  return firstAppearanceIndex(location) <= index;
}

/** Appearances that have aired by episode `index` (spoiler-safe). */
export function appearancesUpTo(location: AtlasLocation, index: number) {
  return location.appearances.filter((a) => episodeIndex(a.episode) <= index);
}

export function eventsUpTo(index: number): AtlasEvent[] {
  return events.filter((e) => episodeIndex(e.episode) <= index);
}

export const BOOK_RANGES: { book: Book; start: number; end: number }[] = ([1, 2, 3] as Book[]).map((book) => {
  const idx = episodes.flatMap((e, i) => (e.book === book ? [i] : []));
  return { book, start: idx[0], end: idx[idx.length - 1] };
});
