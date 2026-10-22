# 05 · Espresso Martini (2D) — EN only · kinetic type, the way Margarita was made

34 s · 120 BPM (beat = 0.5 s, bar = 2 s) · 1080×1920 · 60 fps · AAC.
This is a second version of episode 05: the same drink, rebuilt with the 04 Margarita engine (Canvas 2D, `word()` and `lettersWord()`, the same spline camera) instead of the 3D type.

## Idea

**The words become the drink.** Each ingredient appears first as a big word. Once it has been read, the word drops into the mixing glass and turns into a layer of liquid. Then:
- CHILL breaks into frost on the martini glass.
- SHAKE rattles like ice.
- STRAIN pours down letter by letter.
- Three coffee beans land on the crema, one for each word: *health · wealth · happiness*.

Series DNA:
- wine velvet, a gold Art Deco frame, a smooth spline camera;
- Limelight (heavy), Poiret One (hairline), Great Vibes (script).

One key word per phrase is in amber `#F0A848`, the colour of crema. Everything else is cream `#F1E4CF` or soft `#C9AE8E`.

Depth:
- **Far plane:** blurred coffee beans drift behind, slower than the camera.
- **Middle plane:** the martini glass at world x 540 and the mixing glass at x 1300.
- **Near plane:** amber bokeh moves faster than the camera.

## Recipe (5 : 3 : 2)

1. Chill the glass.
2. Vodka, 50 ml.
3. Espresso, 30 ml (fresh, cooled).
4. Coffee liqueur, 20 ml.
5. Shake hard with ice.
6. Double strain.
7. Add 3 coffee beans.

## Scenes

| # | Time | What happens |
|---|---|---|
| 1 Hook | 0–4 | Three slams stack up: COFFEE? · COCKTAIL? · **BOTH.** (amber) |
| 2 Title | 4–7 | The stack flies apart. Script *Espresso* and *Martini* (amber) wipe on; "THE MIDNIGHT CLASSIC" |
| 3 List | 7–10 | Rows enter skewed from alternating sides: 50 VODKA · **30 ESPRESSO** · 20 COFFEE LIQUEUR · + ICE · 3 COFFEE BEANS |
| 4 Chill | 10–12 | CHILL holds, then breaks into ice crystals that frost the martini glass. "THE GLASS" |
| 5–7 Build | 12–18 | The camera trucks to the mixing glass. Each amount slams in, then the word (VODKA mask · ESPRESSO tracking · COFFEE LIQUEUR flip) drops in and becomes a layer: clear, then black, then brown |
| 8 Shake | 18–20 | Ice, the tin caps on. SHAKE rattles letter by letter in 16ths. "HARD · FOR THE FOAM" |
| 9 Strain | 20–22 | The camera trucks back and the glass pours. STRAIN drips in letter by letter. "DOUBLE · INTO A MARTINI GLASS". The crema rises and the frost melts away |
| 10 Beans | 22–24 | Close-up on the glass. Three beans land on beats; each one brings a script word: health · wealth · happiness |
| 11 Ratio | 24–28 | 5 : **3** : 2 slams, with bars for vodka, espresso and liqueur |
| 12 Hero | 28–32 | *Espresso Martini* and "50 · 30 · 20 · SHAKE · DOUBLE STRAIN" |
| 13 End | 32–34 | *Save this recipe* (amber), "AND MAKE IT TONIGHT", "PLEASE DRINK RESPONSIBLY" |

## Sound

The music is the midnight lounge from the 3D version: minor-9 electric piano, a walking bass, brushes, and snaps on 2 and 4.

SFX follow the words:
- word thuds;
- crystal pings for the frost;
- three plops, each lower than the last;
- ice, the tin, the 16th-note rattle;
- a thick pour;
- three soft ticks for the beans;
- chimes at 24, 28 and 32 s.
