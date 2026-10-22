# Episode 05: Where Is Roblox Most Popular on Google? (2026 Map)

- **Format:** 8:00, 1920×1080, 30 fps, EN.
- **Style:** same as episode 04. A dark map with our UI. The current location fills with its flag and gets cartoon eyes; the flag in the card is a character too.
- **Countdown:** 83 countries and regions, from the lowest index to the highest. After each step the location takes on its index colour, so the map fills up step by step.

## Data
The source is Google Trends: search term "Roblox", Worldwide, All categories, Web Search, 1 Jan – 30 Sep 2026, exported 22 Oct 2026.
- The 83 numeric results are copied from the brief into `anim/data.js`.
- Russia is excluded (editorial choice).
- Blank cells are never shown as zero.
- Ranks use competition ranking: equal indexes share a rank. `RANK` and `TIE` are calculated in `data.js` and match the brief.

## Map policy
- Natural Earth 1:50m (`world-atlas` 2.0.2), Natural Earth 1 projection, the same throughout the episode.
- Crimea is moved from Russia's geometry to Ukraine and merged without an internal border (UN GA resolution 68/262).
- Other disputed areas stay as in Natural Earth and are never highlighted.
- Russia is hatched as "not included"; locations with no numeric result are neutral.

## How each step works
**Every 5-second step:**
- **0–0.6 s:** the camera flies in and the outline pulses.
- **0.6–1.2 s:** the flag flips into the card, with rank and name.
- **1.2–2.0 s:** the index odometer and the 0–100 bar fill to the exact value.
- **Hold:** until 4.5 s.
- **4.5–5 s:** the value flies into the "Ranking so far" rail.

Five step patterns repeat in turn:
- **Locate:** a tighter zoom and the flag waves.
- **Compare:** the previous location appears in the card on the same scale.
- **Stack:** a big flag drops into the rail and the row's bar fills.
- **Reveal:** the name tracks in and the eyes look at the bar.
- **Map:** the camera pulls out to the region.

**Ties and reactions:**
- A TIED badge shows the shared rank, plus dots for the position inside the tie.
- Only untied locations get a short "surprised" reaction.

**Final five** (8 s each): the podium on the left fills in and Mongolia's score appears only in its own shot.

## Build
```
node build-map.mjs                       # map-data.js (incl. Crimea merge)
cd anim
DUR=480 node beats.mjs 1 2,21.5,412      # key frames → out/keys.jpg
node audio.mjs                           # out/sfx.wav
node music-chunks.mjs K 60  (K=0..7)     # music in chunks, then: python3 stitch.py → out/music.wav
for P in 0 1 2 3; do DUR=480 FPS=30 node render.mjs $P 4 & done; wait
DUR=480 node join.mjs                    # out/roblox-search.mp4
```
