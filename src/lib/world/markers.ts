import type { AtlasLocation } from "@/types/atlas";
import { heightAt } from "./terrain";

const cache = new Map<string, [number, number, number]>();

/** World position of a location's marker: on the terrain surface. */
export function markerPosition(loc: AtlasLocation): [number, number, number] {
  let p = cache.get(loc.id);
  if (!p) {
    const [x, z] = loc.position;
    p = [x, heightAt(x, z) + 0.3, z];
    cache.set(loc.id, p);
  }
  return p;
}
