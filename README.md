# Four Nations Atlas

An **unofficial, non-commercial fan project**: an interactive 3D map of the world of *Avatar: The Last Airbender* (the original 61-episode animated series, 2005–2008), drawn like an explorer's sketchbook.

> Unofficial fan project. Not affiliated with the rights holders. The map shapes, icons and text are original: no official artwork, maps, logos or characters are reproduced.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · three.js via @react-three/fiber + drei · GSAP · Motion · Zustand · rough.js

## Scripts

```bash
npm run dev            # start the dev server
npm run build          # production build
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run validate:data  # validate /data (or: npm run validate:data -- <dir>)
```

## Data

The data lives in `/data` as typed JSON. Its schemas are in `src/types/atlas.ts`.

| File | Contents |
| --- | --- |
| `episodes.json` | All 61 episodes in broadcast order: id (`"2-15"`), book, number, official title, source |
| `locations.json` | Places on the map, their nation, map position, an original summary, the episodes where they are **shown on screen** (flashbacks flagged), and a source |
| `events.json` | One- or two-sentence original summaries tied to an exact episode and location, with a source |
| `NEEDS_REVIEW.md` | Facts left out because they couldn't be confirmed |

Lore rules: canon is the original series only. Nothing is invented. Anything uncertain goes into `NEEDS_REVIEW.md` instead of the data. Every entry carries a `source` URL from the [Avatar Wiki](https://avatar.fandom.com).
