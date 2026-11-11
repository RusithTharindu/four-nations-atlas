# Needs review

Things deliberately **left out** of the data because the wiki pages I checked didn't confirm them clearly. Each one needs a human to rewatch or check before it goes into `locations.json` / `events.json`.

Rule for appearances: a location gets an episode only when the location is **shown on screen** in that episode (flashbacks count and are tagged `"flashback": true`). Being mentioned is not enough.

## Location appearances

- [ ] **Omashu — 2-2 "The Cave of Two Lovers"**: the episode is about getting to Omashu, and the synopsis only mentions the city in dialogue and the legend. Is the city itself shown at the end?
- [ ] **Ba Sing Se — 2-7 "Zuko Alone"**: the Ba Sing Se wiki infobox gives this episode as the Outer Wall's first appearance, but the synopsis only describes a letter Iroh sends from the siege. Check whether the wall is actually shown.
- [ ] **Fire Nation Capital — 3-9 "Nightmares and Daydreams"**: Zuko's scenes with Mai and Azula are almost certainly in the palace, but the synopsis never names the setting.
- [ ] **Fire Nation Capital — 3-18 "Sozin's Comet, Part 1: The Phoenix King"**: Zuko's flashback to the war meeting. The synopsis doesn't say where the meeting is held.
- [ ] **Fire Nation Capital — other Book Three episodes**: Zuko's other visits to Iroh in the Capital City Prison (only 3-2 is confirmed in the data).
- [ ] **Southern Air Temple — later flashbacks**: Aang's memories of the temple in episodes other than 1-12 have not been listed.
- [ ] **Ember Island — 3-19 "Sozin's Comet, Part 2: The Old Masters"**: check whether any scenes are still set on the island.

## Map geography

- [ ] Marker positions are approximate and drawn on an original, stylized map. They follow the relative directions on the wiki location pages: Ba Sing Se in the north-east of the Earth Kingdom, Omashu in the south-west, Kyoshi Island in the South Sea, Ember Island in the northern Fire Nation, and the Southern Air Temple in the Southern Archipelago.

## How the data was checked (2026-11-11)

- The episode titles and order came from the "Episode box" templates on the wiki pages *Book One: Water*, *Book Two: Earth* and *Book Three: Fire*, which list 20 + 20 + 21 = 61 episodes. All 61 resolve to wiki pages. "Jet" and "Lake Laogai" use the `(episode)` page.
- Location appearances were cross-checked against the synopsis section of each episode's wiki page plus the "appearance" field in each location's infobox.
