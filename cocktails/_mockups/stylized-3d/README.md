# Stylized 3D mockup: the reference story in premium pastel 3D

This takes the same story as `../flat-cartoon` (reference breakdown: `../flat-cartoon/STYLE-ANALYSIS.md`) and re-stages it in **premium stylized 3D**:
- simplified rounded volumes;
- glossy (clearcoat) and matte materials;
- soft studio light with real soft contact shadows;
- a pastel palette (lavender, mint, peach, butter, coral);
- depth of field on the hero.

It is graphics, not photoreal. Built in Three.js and rendered as stills.

| Frame | Scene | Reference beat it re-stages |
|---|---|---|
| `frame-1.png` | Bar wide: bartender behind the mint counter, the glowing highball, toucan and flamingo-bird framing the foreground with glowing eyes. 3D title TEQUILA SUNRISE | Scientist with the glowing dish, two bird mascots |
| `frame-4.png` | The same set from an orbit angle: low, left, DOF on the glass, foreground bird soft | Shows the orbiting camera |
| `frame-2.png` | Inside the glass: tiny bartender on a matte peach floor, a giant glossy grenadine sun with lavender bands, floating rounded ice cubes. 15 ml GRENADINE | Tiny human vs giant virus (scale reveal after the iris) |
| `frame-3.png` | Hero: a mint glove raises the finished drink against pastel rays, 3D sparkles, birds flying happy | Glove + test tube + rays + birds |

Everything is built from primitives:
- **Characters:** spheres and capsules, torus glasses, cone beaks, tube legs.
- **Props:** rounded boxes, lathe bottles, extruded Fredoka text.

Render: start `python3 -m http.server 8766` in `cocktails/`, then run `node shot.mjs 1,2,3,4`. This is a mockup only: no animation and no sound.
