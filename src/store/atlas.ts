import { create } from "zustand";
import { NATIONS, BOOKS, type Book, type Nation } from "@/types/atlas";
import { EPISODE_COUNT, getLocation, isLocationVisibleAt } from "@/lib/data";

export interface AtlasState {
  /** 0-based index into the broadcast-ordered episode list. */
  episodeIndex: number;
  selectedLocationId: string | null;
  hoveredLocationId: string | null;
  nations: Record<Nation, boolean>;
  books: Record<Book, boolean>;
  search: string;
  isPlaying: boolean;

  setEpisodeIndex: (index: number) => void;
  stepEpisode: (delta: number) => void;
  selectLocation: (id: string | null) => void;
  hoverLocation: (id: string | null) => void;
  toggleNation: (nation: Nation) => void;
  toggleBook: (book: Book) => void;
  setSearch: (search: string) => void;
  setPlaying: (playing: boolean) => void;
}

/** Moving the timeline also drops a selection that hasn't "aired" yet. */
function withEpisode(s: AtlasState, episodeIndex: number): Partial<AtlasState> {
  const selected = getLocation(s.selectedLocationId);
  const keep = selected && isLocationVisibleAt(selected, episodeIndex);
  return { episodeIndex, selectedLocationId: keep ? s.selectedLocationId : null };
}

const clampEpisode = (i: number) => Math.min(Math.max(Math.round(i), 0), EPISODE_COUNT - 1);

export const useAtlas = create<AtlasState>()((set) => ({
  // Start at the finale so the whole map is visible until the user scrubs.
  episodeIndex: EPISODE_COUNT - 1,
  selectedLocationId: null,
  hoveredLocationId: null,
  nations: Object.fromEntries(NATIONS.map((n) => [n, true])) as Record<Nation, boolean>,
  books: Object.fromEntries(BOOKS.map((b) => [b, true])) as Record<Book, boolean>,
  search: "",
  isPlaying: false,

  setEpisodeIndex: (index) => set((s) => withEpisode(s, clampEpisode(index))),
  stepEpisode: (delta) => set((s) => withEpisode(s, clampEpisode(s.episodeIndex + delta))),
  selectLocation: (id) => set({ selectedLocationId: id }),
  hoverLocation: (id) => set({ hoveredLocationId: id }),
  toggleNation: (nation) => set((s) => ({ nations: { ...s.nations, [nation]: !s.nations[nation] } })),
  toggleBook: (book) => set((s) => ({ books: { ...s.books, [book]: !s.books[book] } })),
  setSearch: (search) => set({ search }),
  setPlaying: (isPlaying) => set({ isPlaying }),
}));
