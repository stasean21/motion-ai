# Flat cartoon v2: the reference's 2D drawing language, done properly

v1 (`../flat-cartoon`) was a quick sketch from primitives. v2 redraws the hero frame with the reference's actual shape language, authored as SVG:

- **Organic silhouettes.** Each bird is one smooth body path (head → neck → chest → tail), not a circle with a beak glued on. Crests and tails are clusters of rounded lobes.
- **Flat form shading.** A darker same-hue shape is overlaid for shadow (belly, wing back) and a lighter blob for highlight. No gradients on characters; gradients only in the background and glow.
- **Selective white rim.** Only the glass gets a thick white rounded outline, as the reference's test tube does. Everything else has no outlines.
- **Cloud glove.** Overlapping bumps in three tones with highlight ovals. The palm is behind the glass and the fingers wrap in front. A big dark sleeve comes in from the bottom with a soft lavender shadow on the floor.
- **Sparkles.** 4-point stars with concave sides; some sit inside translucent bubbles.
- **Legs.** Thick round-capped strokes with a knee and two toes; happy eyes are white circles "eaten" from below into a ^ shape.
- **Background.** Lime → mint → cyan gradient, alternating light rays and a warm glow behind the hero.

Every part is a named SVG group (`#toucan`, `#flamingo`, `#glass`, `#arm`, `#fingers`), ready to rig and animate in our pipeline: bob, wing flap, leg paddle, squash and stretch, rotating rays, popping sparkles.

Render: `node shot.mjs hero` → `hero.png`.
