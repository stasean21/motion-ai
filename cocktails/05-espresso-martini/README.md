# 05 · Espresso Martini (EN only)

34 s · 120 BPM · 1080×1920 · 60 fps · volumetric 3D type (Three.js). The direction, scene variants and choices are in [STORYBOARD.md](STORYBOARD.md).

Recipe, 5 : 3 : 2:
1. Vodka 50 ml.
2. Espresso 30 ml (fresh, cooled).
3. Coffee liqueur 20 ml.
4. Shake hard with ice.
5. Double strain into a martini glass.
6. Garnish with 3 coffee beans.

Every word is a solid object: extruded Limelight (heavy), Poiret One (hairline rods) and Great Vibes (script) with bevels and soft studio light. The words land around a Boston shaker while the camera orbits it, so earlier words drift away as a skyline. Coffee beans float in the far plane.

Also in the scene:
- SHAKE rattles letter by letter.
- STRAIN slides down with the pour.
- A macro with shallow depth of field shows three beans landing on the crema.
- The 5 / 3 / 2 pillars rise beside the glass.

Key word colour: amber `#F0A848`. Backdrop: 3D wine-velvet curtain; gold Art Deco frame as a 2D overlay.

Build (needs `npm i` in `cocktails/`; a local http server is started automatically for ES modules):
- `node beats.mjs 0.35`: storyboard, one frame per beat.
- `node beats.mjs 0 12,18.5,30`: chosen frames → `out/keys.jpg`.
- `node render.mjs espresso-martini 0 2` & `node render.mjs espresso-martini 1 2`, then `node join.mjs espresso-martini 2`: render in two parallel parts and mux the audio.

Rendering uses swiftshader WebGL at ~0.75 s per frame per process, with 2 subframes per output frame for motion blur.
