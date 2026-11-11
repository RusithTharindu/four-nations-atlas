# Needs review

Things deliberately **left out** of the data because the sources were unclear. Each one needs a human to rewatch or check it before it goes into `locations.json` / `events.json`.

Rule for appearances: a location gets an episode only when it is **shown on screen** in that episode. Being mentioned is not enough. Flashbacks are tagged `"flashback": true`; dreams and visions are tagged `"dream": true`.

## Open

- [ ] **Fire Nation Capital — 3-18 "Sozin's Comet, Part 1: The Phoenix King"**: the transcript's Locations list includes "Harbor City" and "Royal Plaza", which the wiki places in the capital. But in the stage directions, Katara and Suki search Harbor City while the gang searches Ember Island for Aang, and the synopsis only describes Ember Island. The data records 3-18 as a **flashback** appearance only (Zuko's war-meeting memory in the palace, confirmed). Check whether any present-day scene is set in the capital.
- [ ] **Map geography**: marker positions are approximate and drawn on an original, stylized map. They follow the relative directions on the wiki location pages: Ba Sing Se in the north-east of the Earth Kingdom, Omashu in the south-west, Kyoshi Island in the South Sea, Ember Island in the northern Fire Nation, and the Southern Air Temple in the Patola Mountains of the Southern Archipelago.

## Resolved (2026-11-11), from the wiki episode transcripts

Each episode's `Transcript:` page has a **Locations** section (`{{fo}}` = flashback only) and bracketed stage directions. Both were checked for all 61 episodes and compared with `locations.json`.

| Item | Result | Evidence in the transcript |
| --- | --- | --- |
| Omashu — 2-2 | **Added** | Ending: "Omashu has been captured … a close-up of the entrance draped with a Fire Nation flag" |
| Ba Sing Se — 2-7 | **Added (flashback)** | "Rubble surround a large gap in the wall of Ba Sing Se … a younger General Iroh writing at a desk" |
| Fire Nation Capital — 3-9 | **Added** | Locations: Fire Nation Capital, Fire Nation Royal Palace, Royal spa |
| Fire Nation Capital — 3-18 | **Added (flashback)** | Locations: Fire Nation Royal Palace `{{fo}}`; the war-meeting flashback. Present-day scenes are still open, see above |
| Fire Nation Capital — prison visits | **Added 3-4** | "Cut to a Fire Nation prison … lighting up the face of Iroh"; Locations: Capital City Prison |
| Southern Air Temple — later flashbacks | **Added 3-6 (flashback), 2-1 (dream)** | 3-6: Roku's memories in the Spirit World; 2-1: "Aang is caught in a dream … running about the Southern Air Temple" |
| Ember Island — 3-19 | **Not added** | Not in 3-19's Locations; the episode is set at the White Lotus camp and Ozai's airship base |

Other appearances found in the same pass and added:

- Southern Water Tribe — 3-8 (flashback): Hama's memory of the raids.
- Kyoshi Island — 2-5: "Switch to an overview of Kyoshi Island", where the team visits Kyoshi's shrine.
- Northern Water Tribe — 2-1 (dream) and 3-6 (flashback): Roku trains there.
- Ba Sing Se — 2-12: the Outer Wall comes into view at the end. 3-1 (flashback): Aang relives the battle under the city.
- Fire Nation Capital — 1-20: the closing scene in Ozai's chambers.
- Ember Island — 3-16: the gang are at the docks below Ozai's beach house after leaving the Western Air Temple.

Kept even though a transcript's Locations list leaves them out, because its stage directions show them on screen:

- Omashu 3-19 (flashback): "Flashback of Omashu while under control of the Fire Nation during the Day of Black Sun."
- Ba Sing Se 3-19: "approaching the destroyed Outer Wall of Ba Sing Se."
- Ba Sing Se 3-20: "The scene changes to Ba Sing Se as Fire Nation tanks roll toward the main gate."

## How the data was checked

- The episode titles and order came from the "Episode box" templates on the wiki pages *Book One: Water*, *Book Two: Earth* and *Book Three: Fire*, which list 20 + 20 + 21 = 61 episodes. All 61 resolve to wiki pages. "Jet" and "Lake Laogai" use the `(episode)` page.
- Location appearances: the synopsis of each episode page, plus the Locations section and stage directions of each `Transcript:` page.
