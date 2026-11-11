import type { AtlasLocation, Book, Nation } from "@/types/atlas";
import { appearancesUpTo, isLocationVisibleAt } from "./data";

export interface FilterState {
  episodeIndex: number;
  nations: Record<Nation, boolean>;
  books: Record<Book, boolean>;
}

/** Book filter: the location has (so far) appeared in at least one selected Book. */
export function matchesBooks(loc: AtlasLocation, s: FilterState): boolean {
  return appearancesUpTo(loc, s.episodeIndex).some((a) => s.books[Number(a.episode.split("-")[0]) as Book]);
}

/** Aired by the current episode — markers that fail this are removed from the map. */
export const isAired = (loc: AtlasLocation, s: FilterState) => isLocationVisibleAt(loc, s.episodeIndex);

/** Passes the nation and Book chips — markers that fail this fade out but stay in place. */
export const passesFilters = (loc: AtlasLocation, s: FilterState) =>
  s.nations[loc.nation] && matchesBooks(loc, s);
