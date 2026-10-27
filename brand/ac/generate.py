import os, sys
out = sys.argv[1] if len(sys.argv) > 1 else "."
NAVY = "#163A63"
SW = 34
A_PATH = "M44 334 L210 44 Q222 24 234 44 L352 334"
BAR = "M112 228 L246 228"
C_PATH = "M563 92 A148 148 0 1 0 563 278"
SX, SY = 300, 186
STAR = "M0 -48 Q7 -7 44 0 Q7 7 0 48 Q-7 7 -44 0 Q-7 -7 0 -48Z"
VB = "16 4 584 362"

def defs(p, letter, gold):
    # p = id prefix
    g = f'''<linearGradient id="{p}g" x1="0" y1="-48" x2="0" y2="48" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F7DC8C"/><stop offset=".5" stop-color="#D4A845"/><stop offset="1" stop-color="#9E7322"/></linearGradient>''' if gold == "grad" else ""
    return f'''{g}
    <mask id="{p}ma" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="380">
      <rect x="0" y="0" width="640" height="380" fill="#fff"/>
      <path d="{C_PATH}" fill="none" stroke="#000" stroke-width="{SW+18}"/>
      <path d="{STAR}" transform="translate({SX} {SY}) scale(1.55)" fill="#000"/>
    </mask>
    <mask id="{p}mc" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="380">
      <rect x="0" y="0" width="640" height="380" fill="#fff"/>
      <path d="{STAR}" transform="translate({SX} {SY}) scale(1.55)" fill="#000"/>
    </mask>'''

def body(p, letter, star):
    fill = f"url(#{p}g)" if star == "grad" else star
    return f'''<g fill="none" stroke="{letter}" stroke-width="{SW}" stroke-linecap="round" stroke-linejoin="round">
    <g mask="url(#{p}ma)"><path d="{A_PATH}"/><path d="{BAR}"/></g>
    <path d="{C_PATH}" mask="url(#{p}mc)"/>
  </g>
  <path d="{STAR}" transform="translate({SX} {SY})" fill="{fill}"/>
  <path d="M0 -9 Q1.4 -1.4 8 0 Q1.4 1.4 0 9 Q-1.4 1.4 -8 0 Q-1.4 -1.4 0 -9Z" transform="translate({SX} {SY})" fill="#FFF6DC" opacity=".9"/>'''

def logo(name, letter, star):
    s = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{VB}" width="584" height="362">
  <title>AC</title>
  <defs>{defs("l", letter, star)}</defs>
  {body("l", letter, star)}
</svg>
'''
    open(os.path.join(out, name), "w").write(s)

logo("ac-logo.svg", NAVY, "grad")
logo("ac-logo-flat.svg", NAVY, "#C9A35A")
logo("ac-logo-white.svg", "#FFFFFF", "#E2C27A")

# pattern: staggered grid like ref 3
LB = "#C8DCF6"; GOLD = "#C4A15F"
W, H = 584, 362
sc = 170 / W           # logo width ~170px
DX, DY = 360, 137      # column step, row step; odd rows shift by DX/2
cols, rows = 2, 4      # tile = 720 x 548, seamless
TW, TH = DX*cols, DY*rows
# star colours vary like on the reference: gold or light-blue
pat = [[1,0],[1,0],[0,1],[1,1]]
def sym(p, star):
    return f'''<symbol id="{p}" viewBox="{VB}"><defs>{defs(p, LB, star)}</defs>{body(p, LB, star)}</symbol>'''
syms = sym("sg", GOLD) + sym("sb", LB).replace('fill="#FFF6DC" opacity=".9"', 'fill="#FFFFFF" opacity="0"')

# seamless tile: logos that overflow on the right are repeated at x-TW
def seamless():
    u = []
    for r in range(rows):
        for c in range(cols):
            x = c*DX + (DX/2 if r % 2 else 0); y = r*DY
            ref = "#sg" if pat[r][c] else "#sb"
            for xx in (x, x-TW):
                if xx + W*sc > 0 and xx < TW:
                    u.append(f'<use href="{ref}" x="{xx:.1f}" y="{y:.1f}" width="{W*sc:.1f}" height="{H*sc:.1f}"/>')
    return u
open(os.path.join(out, "ac-pattern-tile.svg"), "w").write(
f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {TW} {TH}" width="{TW}" height="{TH}">
  <title>AC pattern tile</title>
  <defs>{syms}</defs>
  {"".join(seamless())}
</svg>
''')

S = 1250
open(os.path.join(out, "ac-pattern.svg"), "w").write(
f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">
  <title>AC pattern</title>
  <defs>{syms}
    <pattern id="p" patternUnits="userSpaceOnUse" x="0" y="30" width="{TW}" height="{TH}">
      {"".join(seamless())}
    </pattern>
  </defs>
  <rect width="{S}" height="{S}" fill="url(#p)"/>
</svg>
''')
