# Builds the AC logo variants and the pattern from the traced paths in source/.
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1] if len(sys.argv) > 1 else here
LETTERS = open(os.path.join(here, "source/letters.d")).read().strip()
STAR = open(os.path.join(here, "source/star.d")).read().strip()
NAVY = "#163A63"
VB, W, H = "20 13 578 354", 578, 354

def gold_grad(p):
    return f'''<linearGradient id="{p}g" x1="0" y1="153" x2="0" y2="244" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F3D88E"/><stop offset=".5" stop-color="#D2A64A"/><stop offset="1" stop-color="#9B7024"/></linearGradient>'''

def body(letter, star):
    return (f'<path d="{LETTERS}" fill="{letter}" fill-rule="evenodd"/>'
            f'<path d="{STAR}" fill="{star}" fill-rule="evenodd"/>')

def logo(name, letter, star, grad=False):
    defs = f"<defs>{gold_grad('l')}</defs>" if grad else ""
    fill = "url(#lg)" if grad else star
    open(os.path.join(out, name), "w").write(
f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}" width="{W}" height="{H}">
  <title>AC</title>
  {defs}{body(letter, fill)}
</svg>
''')

logo("ac-logo.svg", NAVY, None, grad=True)
logo("ac-logo-flat.svg", NAVY, "#C4A15F")
logo("ac-logo-white.svg", "#FFFFFF", "#E2C27A")

# Pattern like the reference: staggered rows, light-blue letters, some stars gold.
LB, GOLD = "#C8DCF6", "#C4A15F"
sc = 170 / W
DX, DY = 360, 137          # column step, row step; odd rows shift by DX/2
cols, rows = 2, 4          # tile 720 x 548, seamless
TW, TH = DX * cols, DY * rows
gold_star = [[1, 0], [1, 0], [0, 1], [1, 1]]
syms = (f'<symbol id="sg" viewBox="{VB}">{body(LB, GOLD)}</symbol>'
        f'<symbol id="sb" viewBox="{VB}">{body(LB, LB)}</symbol>')

def uses():
    u = []
    for r in range(rows):
        for c in range(cols):
            x, y = c * DX + (DX / 2 if r % 2 else 0), r * DY
            ref = "#sg" if gold_star[r][c] else "#sb"
            u.append(f'<use href="{ref}" x="{x:.1f}" y="{y:.1f}" width="{W*sc:.1f}" height="{H*sc:.1f}"/>')
    return "".join(u)

open(os.path.join(out, "ac-pattern-tile.svg"), "w").write(
f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {TW} {TH}" width="{TW}" height="{TH}">
  <title>AC pattern tile</title>
  <defs>{syms}</defs>
  {uses()}
</svg>
''')

S = 1250
open(os.path.join(out, "ac-pattern.svg"), "w").write(
f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">
  <title>AC pattern</title>
  <defs>{syms}
    <pattern id="p" patternUnits="userSpaceOnUse" x="0" y="30" width="{TW}" height="{TH}">{uses()}</pattern>
  </defs>
  <rect width="{S}" height="{S}" fill="url(#p)"/>
</svg>
''')
