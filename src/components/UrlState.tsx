"use client";

import { useEffect } from "react";
import {
  episodeAt,
  episodeIndex,
  firstAppearanceIndex,
  getLocation,
  isEpisodeId,
  isLocationVisibleAt,
} from "@/lib/data";
import { useAtlas } from "@/store/atlas";

/**
 * Two-way sync between the store and the URL: ?episode=2-15&location=ba-sing-se.
 * Uses the native History API (Next.js integrates replaceState with its router),
 * so scrubbing the timeline never triggers a navigation.
 */
export function UrlState() {
  useEffect(() => {
    // 1. URL → store, once on load.
    const params = new URLSearchParams(window.location.search);
    const ep = params.get("episode");
    const loc = getLocation(params.get("location"));
    const s = useAtlas.getState();
    if (isEpisodeId(ep)) s.setEpisodeIndex(episodeIndex(ep));
    if (loc) {
      // A shared link to a place should show it even if the episode param is earlier.
      if (!isLocationVisibleAt(loc, useAtlas.getState().episodeIndex)) {
        s.setEpisodeIndex(firstAppearanceIndex(loc));
      }
      s.selectLocation(loc.id);
    }

    // 2. store → URL, on every relevant change.
    const write = (episodeIdx: number, locationId: string | null) => {
      const next = new URLSearchParams(window.location.search);
      next.set("episode", episodeAt(episodeIdx).id);
      if (locationId) next.set("location", locationId);
      else next.delete("location");
      const query = next.toString().replace(/%2C/g, ",");
      const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(window.history.state, "", url);
      }
    };
    return useAtlas.subscribe((state, prev) => {
      if (state.episodeIndex !== prev.episodeIndex || state.selectedLocationId !== prev.selectedLocationId) {
        write(state.episodeIndex, state.selectedLocationId);
      }
    });
  }, []);

  return null;
}
