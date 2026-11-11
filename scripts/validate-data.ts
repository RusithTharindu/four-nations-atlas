/**
 * Validates /data (or the directory passed as the first argument).
 *
 *   npm run validate:data
 *   npm run validate:data -- path/to/other/data
 *
 * Checks:
 *  - every file matches its schema, and every entry has an https `source`
 *  - episode numbering per Book has no gaps or duplicates (20 / 20 / 21)
 *  - ids are unique
 *  - every event points to a real episode and location
 *  - every location appearance points to a real episode (and is not tagged both flashback and dream)
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { z } from "zod";
import { EpisodeSchema, EventSchema, LocationSchema } from "../src/types/atlas";

const EXPECTED_EPISODES_PER_BOOK: Record<number, number> = { 1: 20, 2: 20, 3: 21 };

const dir = resolve(process.argv[2] ?? join(__dirname, "..", "data"));
const errors: string[] = [];

function load<T extends z.ZodType>(file: string, schema: T): z.infer<T>[] {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(dir, file), "utf8"));
  } catch (err) {
    errors.push(`${file}: cannot read/parse (${(err as Error).message})`);
    return [];
  }
  if (!Array.isArray(raw)) {
    errors.push(`${file}: top level must be an array`);
    return [];
  }
  const ok: z.infer<T>[] = [];
  raw.forEach((entry, i) => {
    const label = `${file}[${i}]${entry && typeof entry === "object" && "id" in entry ? ` (${String(entry.id)})` : ""}`;
    if (!entry || typeof entry !== "object" || !("source" in entry) || !entry.source) {
      errors.push(`${label}: missing "source"`);
    }
    const parsed = schema.safeParse(entry);
    if (parsed.success) ok.push(parsed.data);
    else for (const issue of parsed.error.issues) errors.push(`${label}.${issue.path.join(".")}: ${issue.message}`);
  });
  return ok;
}

function checkUniqueIds(file: string, items: { id: string }[]) {
  const seen = new Set<string>();
  for (const { id } of items) {
    if (seen.has(id)) errors.push(`${file}: duplicate id "${id}"`);
    seen.add(id);
  }
}

const episodes = load("episodes.json", EpisodeSchema);
const locations = load("locations.json", LocationSchema);
const events = load("events.json", EventSchema);

checkUniqueIds("episodes.json", episodes);
checkUniqueIds("locations.json", locations);
checkUniqueIds("events.json", events);

// Episode numbering: ids agree with book/number, no gaps, no duplicates, correct counts, in order.
for (const e of episodes) {
  if (e.id !== `${e.book}-${e.number}`) errors.push(`episodes.json (${e.id}): id does not match book ${e.book} / number ${e.number}`);
}
for (const [bookStr, expected] of Object.entries(EXPECTED_EPISODES_PER_BOOK)) {
  const book = Number(bookStr);
  const numbers = episodes.filter((e) => e.book === book).map((e) => e.number);
  const counts = new Map<number, number>();
  numbers.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1));
  for (const [n, c] of counts) if (c > 1) errors.push(`episodes.json: Book ${book} episode ${n} appears ${c} times`);
  for (let n = 1; n <= expected; n++) if (!counts.has(n)) errors.push(`episodes.json: Book ${book} is missing episode ${n}`);
  for (const n of counts.keys()) if (n > expected) errors.push(`episodes.json: Book ${book} has unexpected episode ${n} (expected ${expected})`);
}
for (let i = 1; i < episodes.length; i++) {
  const a = episodes[i - 1];
  const b = episodes[i];
  if (b.book < a.book || (b.book === a.book && b.number <= a.number)) {
    errors.push(`episodes.json: ${b.id} is out of broadcast order (comes after ${a.id})`);
  }
}

// Cross references.
const episodeIds = new Set(episodes.map((e) => e.id));
const locationIds = new Set(locations.map((l) => l.id));

for (const ev of events) {
  if (!episodeIds.has(ev.episode)) errors.push(`events.json (${ev.id}): unknown episode "${ev.episode}"`);
  if (!locationIds.has(ev.location)) errors.push(`events.json (${ev.id}): unknown location "${ev.location}"`);
  const loc = locations.find((l) => l.id === ev.location);
  if (loc && !loc.appearances.some((a) => a.episode === ev.episode)) {
    errors.push(`events.json (${ev.id}): location "${ev.location}" does not list episode ${ev.episode} in its appearances`);
  }
}
for (const loc of locations) {
  const seen = new Set<string>();
  for (const a of loc.appearances) {
    if (!episodeIds.has(a.episode)) errors.push(`locations.json (${loc.id}): unknown episode "${a.episode}" in appearances`);
    if (seen.has(a.episode)) errors.push(`locations.json (${loc.id}): episode ${a.episode} listed twice`);
    if (a.flashback && a.dream) errors.push(`locations.json (${loc.id}): ${a.episode} can't be both a flashback and a dream`);
    seen.add(a.episode);
  }
}

if (errors.length) {
  console.error(`✗ Data validation failed for ${dir} (${errors.length} problem${errors.length === 1 ? "" : "s"}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `✓ Data OK: ${episodes.length} episodes, ${locations.length} locations, ${events.length} events (${dir})`,
);
