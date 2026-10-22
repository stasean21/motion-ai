# 05 · Espresso Martini (2D, EN only)

This is the second version of episode 05. It uses the same approach, tools and prompts as [04 Margarita](../04-margarita/): Canvas 2D, kinetic type, and words that become the drink.

- **Format:** 34 s · 120 BPM · 1080×1920 · 60 fps.
- **Storyboard and scene choices:** [STORYBOARD.md](STORYBOARD.md).
- **Earlier 3D version:** [05-espresso-martini](../05-espresso-martini/).

Recipe, 5 : 3 : 2:
1. Chill the glass.
2. Vodka, 50 ml.
3. Fresh, cooled espresso, 30 ml.
4. Coffee liqueur, 20 ml.
5. Shake hard with ice.
6. Double strain into a martini glass.
7. Add 3 coffee beans.

Key word colour: amber `#F0A848`.

Files: `out/espresso-martini-2d.mp4`, `out/storyboard-en.jpg`, `out/keys.jpg`.

Build:
- Storyboard: `node beats.mjs 0.35 en`.
- Chosen frames: `node keys.mjs 1.8,12.9,23.8`.
- Video: `node render.mjs espresso-martini-2d en`.
