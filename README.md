# Four Nations Atlas

An **unofficial, non-commercial fan project**: an interactive 3D map of the world of *Avatar: The Last Airbender* (the original 61-episode animated series, 2005–2008), drawn like an explorer's sketchbook.

> Unofficial fan project. Not affiliated with the rights holders. The map shapes, icons and text are original: no official artwork, maps, logos or characters are reproduced.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · three.js via @react-three/fiber + drei · GSAP · Motion · Zustand · rough.js

## Scripts

```bash
npm run dev            # start the dev server
npm run build          # static export to ./out (set PAGES_BASE_PATH to serve under a sub-path)
npm run preview        # serve ./out locally
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run validate:data  # validate /data (or: npm run validate:data -- <dir>)
```

## Deployment

`.github/workflows/nextjs.yml` deploys every push to `main` to **GitHub Pages**. The atlas runs entirely in the browser, so `next.config.ts` uses `output: "export"`, and the workflow passes the Pages base path (e.g. `/four-nations-atlas`) in as `PAGES_BASE_PATH`. It validates the lore data before it builds. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. After a clean `npm ci` it runs `lint`, `typecheck`, `validate:data` and `build`, the same scripts as above, so a PR that breaks the lore data fails CI as surely as one that breaks the code.

## Data

The data lives in `/data` as typed JSON. Its schemas are in `src/types/atlas.ts`.

| File | Contents |
| --- | --- |
| `episodes.json` | All 61 episodes in broadcast order: id (`"2-15"`), book, number, official title, source |
| `locations.json` | Places on the map, their nation, map position, an original summary, the episodes where they are **shown on screen** (flashbacks and dreams flagged), and a source |
| `events.json` | One- or two-sentence original summaries tied to an exact episode and location, with a source |
| `NEEDS_REVIEW.md` | Facts left out because they couldn't be confirmed |

Lore rules: canon is the original series only. Nothing is invented. Anything uncertain goes into `NEEDS_REVIEW.md` instead of the data. Every entry carries a `source` URL from the [Avatar Wiki](https://avatar.fandom.com).

## Shareable links

The current episode and selected place are kept in the URL, for example `/?episode=2-15&location=ba-sing-se`. A link to a place that hasn't aired yet at the given episode moves the timeline to its first appearance.

## Performance and accessibility

- **Quality tiers** (`src/lib/quality.ts`): phones and weaker touch devices get a lower pixel ratio, coarser terrain and ocean meshes, no shadows, fewer clouds and about 30% of the particles. A `PerformanceMonitor` also drops to a 1× pixel ratio if the frame rate falls.
- **Phones**: the details panel becomes a draggable bottom sheet (peek / expand / swipe down to close), the map shifts up above it, and the filter chips scroll in one row.
- **`prefers-reduced-motion`**: there are no camera fly-tos; the camera cuts to the place under a short paper fade. Particles are off. Clouds, the day/night cycle, the waves and the lava glow are frozen. Markers don't wiggle, the travel path appears without drawing itself, and panels and popups fade in instead of sliding or bouncing.
- Markers are buttons, the timeline is a keyboard-operable `role="slider"` (arrows, PageUp/PageDown, Home/End), search is a combobox, and Esc closes the current selection.
