# 05 · Espresso Martini — EN only · volumetric 3D + kinetic type

34 s · 120 BPM (beat 0.5 s) · 1080×1920 · 60 fps · AAC · Three.js, real-time camera in 3D space

## Idea

**Midnight is built from words.** In a dark velvet room after hours, every word is a solid object: extruded Art Deco letters with bevels, weight, soft studio light and shadow. The words land around a bar shaker and assemble the drink. The camera orbits the shaker as each new word arrives, so earlier words drift into the background as a lit skyline. That gives real perspective and parallax across foreground words, midground glassware and background floating coffee beans.

Type contrast, all in 3D:
- **Limelight**: heavy, deep extrusion, used for numbers and nouns.
- **Poiret One**: hairline rods, used for units and connectors.
- **Great Vibes**: script, used for the name.

Key word per phrase is in glossy **amber `#F0A848`** (crema). Everything else is cream `#F1E4CF`.

Series DNA: wine velvet backdrop (3D folded curtain), gold Art Deco frame as a 2D overlay, 18+.

## Recipe (5 : 3 : 2)

Vodka 50 ml · Espresso 30 ml (fresh, cooled) · Coffee liqueur 20 ml · Shake hard with ice · Double strain into a martini glass · 3 coffee beans

## Scenes: variants → choice

| # | Time | Variants | Chosen |
|---|---|---|---|
| 1 Hook | 0–4 | a) "COFFEE? COCKTAIL? BOTH." · b) bean rain spelling a word · c) "WAKE UP THE NIGHT" · d) a clock striking midnight | **a**: COFFEE? and COCKTAIL? rise through invisible masks at two depths; BOTH. (amber) drops from above with weight and bounce. The camera pushes in low; floating beans drift behind |
| 2 Title | 4–7.5 | a) hook words tip backward and sink, script swings in · b) words shatter into beans · c) camera flies through the O of COFFEE | **a**: hook words fall back like dominoes (angle change), the camera cranes up, and *Espresso* / *Martini* swing in on Y. "THE MIDNIGHT CLASSIC" in hairline |
| 3 List | 7.5–10.5 | a) slabs flip down like split-flap · b) rotating drum · c) words stack as a tower | **a**: four dark panels with gold edges flip in on beats and hold together. Amounts are heavy, names hairline, ESPRESSO in amber |
| 4–6 Build | 10.5–16.5 | a) words orbit the shaker as the camera circles · b) bottles pour · c) words melt into the glass | **a**: the camera orbits the shaker. For each ingredient: the number slams toward the camera with a scale and depth push, the name rises through its mask, a liquid ribbon falls into the glass shaker, and a layer rises. Earlier words stay behind as a skyline |
| 7 Shake | 16.5–19 | a) the world rattles · b) SHAKE spins · c) split-screen | **a**: ice drops in on beats, the steel tin caps on the downbeat, and SHAKE slams. Every letter rattles in 16ths and the camera gets a handheld jolt |
| 8 Strain | 19–21.5 | a) letters slide along the stream · b) a pour shot from below | **a**: the camera trucks to the martini glass. The shaker tilts and pours; DOUBLE (hairline) and STRAIN (amber) slide down letter by letter along the pour. The glass fills dark and crema rises |
| 9 Beans | 21.5–24 | a) macro on the crema with three beans landing on beats · b) beans orbiting | **a**: a macro with shallow depth of field. Three beans land on beats 1-2-3. THREE in amber, *health · wealth · happiness* in script |
| 10 Ratio | 24–28 | a) volumetric bar chart: numbers on pillars that rise · b) pie | **a**: the 5 / 3 / 2 pillars rise from the bar on beats, and the camera trucks along them |
| 11 Hero | 28–32 | a) slow orbit with the script name floating · b) a top-down shot | **a** |
| 12 End | 32–34 | Save this recipe + warning | |

## Sound

Midnight lounge at 120 BPM: minor-9 electric-piano chords, upright-style bass, brushed hats and finger snaps on 2 and 4.

SFX:
- **Word landings:** heavy, low wooden thuds.
- **Rises:** soft airy whooshes.
- **Pours:** three, with different timbres per liquid.
- **Shaker:** ice clinks, the tin clank and a 16th-note rattle.
- **Strain:** a pour.
- **Beans:** three soft ticks on the foam.
- **Chimes:** on the ratio, the hero and the end.

## Risks

1. **Render time:** swiftshader runs about 0.7 s per frame. Mitigation: 2 subframes for motion blur, depth of field only in the macro shot.
2. **3D text readability during orbit:** words face the camera at their hold time; checked on the beat contact sheet.
