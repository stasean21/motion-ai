"""Animate the 10 key arts into a 30 s 9:16 60 fps edit synced to the reference track.

Characters are brought to life with localized warps (squash, hop, sway, tremble) that are mirrored into the
floor reflection; transitions are drawn from the props of each costume (claws, smoke, cloth, mask, bandage,
cape, bat, shadow).
"""
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hw.engine import blur, smooth  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1080, 1920, 60
BAR = 2.516667
BEAT = BAR / 4
T0 = 0.05                      # first beat
K = W / 941                    # key art -> output scale

CUTS = [0, 2.5667, 5.0833, 7.6, 10.1167, 12.6333, 15.15, 17.6667, 21.442, 27.7333, 30.25]
DUR = CUTS[-1]


def C(x, y):
    return x * K, y * K


# per scene: file, accent colour (RGB 0..1), floor y, characters [(cx, cy, r, phase)]
SCENES = [
    dict(f="00_intro", acc=(1.0, 0.55, 0.15), floor=1040,
         chars=[(315, 265, 110, 0.0), (655, 290, 100, 1.1), (170, 460, 100, 2.0), (800, 460, 100, 2.9),
                (240, 915, 110, 3.7), (715, 920, 110, 4.6)]),
    dict(f="01_brazil", acc=(0.6, 1.0, 0.2), floor=1105, chars=[(488, 860, 270, 0)]),
    dict(f="02_usa", acc=(1.0, 0.6, 0.12), floor=1120, chars=[(460, 880, 300, 0)]),
    dict(f="03_uk", acc=(0.5, 0.85, 1.0), floor=1185, chars=[(460, 850, 340, 0)]),
    dict(f="04_japan", acc=(1.0, 0.2, 0.25), floor=1100, chars=[(470, 875, 280, 0)]),
    dict(f="05_egypt", acc=(1.0, 0.8, 0.25), floor=1105, chars=[(440, 865, 280, 0)]),
    dict(f="06_romania", acc=(0.75, 0.25, 1.0), floor=1105, chars=[(480, 860, 300, 0)]),
    dict(f="07_guests", acc=(1.0, 0.12, 0.15), floor=1000,
         chars=[(150, 915, 120, 0.0), (275, 760, 120, 0.9), (390, 910, 125, 1.7), (625, 740, 120, 2.4),
                (645, 960, 120, 3.1), (800, 870, 115, 3.9)]),
    dict(f="08_earth", acc=(0.55, 1.0, 0.2), floor=1255,
         chars=[(470, 760, 380, 0), (110, 1180, 85, 0.5), (265, 1180, 85, 1.3), (410, 1180, 85, 2.1),
                (560, 1180, 85, 2.9), (705, 1180, 85, 3.6), (850, 1180, 85, 4.4)]),
    dict(f="09_final", acc=(0.7, 0.4, 1.0), floor=1105,
         chars=[(470, 490, 240, 0), (150, 520, 110, 0.6), (790, 520, 110, 1.4), (310, 760, 120, 2.2),
                (650, 760, 120, 3.0), (270, 980, 110, 3.8), (600, 1000, 110, 4.6)]),
]

_cache = {}


def art(i):
    if i not in _cache:
        img = cv2.imread(os.path.join(HERE, "assets", "keyframes", SCENES[i]["f"] + ".png"))
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_LANCZOS4)
        sharp = cv2.GaussianBlur(img, (0, 0), 1.2)
        img = cv2.addWeighted(img, 1.35, sharp, -0.35, 0)
        _cache[i] = img[..., ::-1].astype(np.float32) / 255
    return _cache[i]


# ------------------------------------------------------------------ timing
def beat_pulse(t, decay=0.11):
    """1 on every beat, decaying; downbeats stronger."""
    n = math.floor((t - T0) / BEAT)
    dt = t - T0 - n * BEAT
    k = 1.0 if n % 4 == 0 else 0.55
    return k * math.exp(-dt / decay) if n >= 0 else 0.0


def ease_out_back(x, s=2.2):
    x = min(max(x, 0), 1) - 1
    return 1 + x * x * ((s + 1) * x + s)


def ease_io(x):
    x = min(max(x, 0), 1)
    return x * x * (3 - 2 * x)


def damp(x, freq=3.0, decay=5.0):
    """Damped oscillation for squash/stretch after an impact (x = seconds since impact)."""
    return math.exp(-decay * x) * math.cos(2 * math.pi * freq * x) if x >= 0 else 0.0


# ------------------------------------------------------------------- warps
GY, GX = np.mgrid[0:H, 0:W].astype(np.float32)


def warp_map(scene, cam, chars):
    """Build remap coordinates: camera (zoom/offset/rotation) then per-character local transforms.

    chars: list of (cx, cy, r, sx, sy, rot_deg, hop_px, dx_px) in output pixels; floor mirrors everything."""
    zoom, ox, oy, crot, (pcx, pcy) = cam
    # camera inverse
    x, y = GX - pcx, GY - pcy
    if crot:
        c, s = math.cos(math.radians(-crot)), math.sin(math.radians(-crot))
        x, y = x * c - y * s, x * s + y * c
    mx = pcx + x / zoom - ox
    my = pcy + y / zoom - oy
    floor = scene["floor"] * K
    below = my > floor
    for (cx, cy, r, sx, sy, rot, hop, dx) in chars:
        ccy = np.where(below, 2 * floor - cy, cy)
        d = np.sqrt((mx - cx) ** 2 + (my - ccy) ** 2) / r
        w = 1 - smooth(0.85, 1.55, d)
        if not w.any():
            continue
        ax, ay = cx, floor if cy + r * 0.6 > floor - r * 0.2 else cy + r   # anchor: floor contact
        if abs(floor - (cy + r)) > r * 0.6:
            ay = cy
        sgn = np.where(below, -1.0, 1.0)
        px, py = mx - ax - dx, my - ay + hop * sgn
        a = np.radians(-rot) * sgn
        ca, sa = np.cos(a), np.sin(a)
        qx = (px * ca - py * sa) / sx
        qy = (px * sa + py * ca) / sy
        mx = mx + w * (qx + ax - mx)
        my = my + w * (qy + ay - my)
    return mx.astype(np.float32), my.astype(np.float32)


def render_art(i, cam, chars):
    mx, my = warp_map(SCENES[i], cam, chars)
    return cv2.remap(art(i), mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


# ---------------------------------------------------------------- overlays
_rng = np.random.default_rng(9)
SPARKS = np.c_[_rng.random(120) * W, _rng.random(120) * H, _rng.random(120), _rng.random(120)]


def sparks(img, t, col, k=1.0):
    lay = np.zeros((H // 2, W // 2, 3), np.float32)
    for x, y, s, ph in SPARKS:
        yy = (y - t * (60 + 140 * s)) % H
        xx = (x + 40 * math.sin(t * 0.9 + ph * 7)) % W
        a = (0.4 + 0.6 * math.sin(t * 5 + ph * 11) ** 2) * k
        cv2.circle(lay, (int(xx / 2), int(yy / 2)), max(1, int(1 + 2.5 * s)), tuple(float(v * a) for v in col), -1,
                   cv2.LINE_AA)
    lay = cv2.resize(lay, (W, H))
    img += lay * 0.8 + blur(lay, 10) * 1.2


def bloom(img, k):
    if k <= 0:
        return img
    small = cv2.resize(img, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
    b = np.clip(small - 0.6, 0, None)
    b = cv2.GaussianBlur(b, (0, 0), 6) * 0.9 + cv2.GaussianBlur(b, (0, 0), 20) * 0.8
    return img + cv2.resize(b, (W, H)) * k


def noise_tex(seed, scale):
    r = np.random.default_rng(seed).random((H // scale + 2, W // scale + 2)).astype(np.float32)
    return cv2.resize(cv2.GaussianBlur(r, (0, 0), 1.2), (W, H), interpolation=cv2.INTER_CUBIC)


SMOKE = [noise_tex(31, 60), noise_tex(32, 28)]
CLOTH = noise_tex(33, 90)


def tr_claws(img, p, col=(0.75, 1.0, 0.35)):
    """Three glowing claw slashes; p 0..1 draws them, >1 fades."""
    lay = np.zeros((H, W, 3), np.float32)
    grow = min(p, 1)
    fade = 1 - smooth(1.0, 1.6, p)
    for i in range(3):
        a = np.array([520 + i * 250, -120 + i * 30.0])
        b = np.array([-120 + i * 250, H * 0.92 - i * 40.0])
        pts = [a + (b - a) * s * grow for s in np.linspace(0, 1, 32)]
        for j in range(len(pts) - 1):
            s = j / 31
            th = int(3 + 60 * math.sin(math.pi * s) ** 0.8)
            cv2.line(lay, tuple(int(v) for v in pts[j]), tuple(int(v) for v in pts[j + 1]), col, th, cv2.LINE_AA)
    g = blur(lay, 14) * 1.2 + blur(lay, 50) * 0.9
    m = lay.max(-1, keepdims=True)
    return (img * (1 - m * 0.7) + np.clip(lay * 1.5, 0, 1) * m + g) * fade + img * (1 - fade)


def tr_smoke(img, p, t, col=(1.0, 0.5, 0.12)):
    """Orange smoke billowing up to cover the frame (p 0..1 cover, 1..2 clear)."""
    cover = ease_io(p) if p <= 1 else 1 - ease_io(p - 1)
    n = SMOKE[0] * 0.65 + np.roll(SMOKE[1], int(t * 300) % H, 0) * 0.35
    yy = GY / H
    front = 1.15 - cover * 1.6
    m = smooth(-0.12, 0.18, (1 - yy) - front + (n - 0.5) * 0.7)[..., None] * (0.25 + 0.75 * cover)
    m = np.clip(m * 1.3, 0, 1)
    smoke = np.asarray(col, np.float32) * (0.45 + 0.75 * n[..., None])
    return img * (1 - m) + smoke * m


def tr_cloth(img, p, t):
    """White sheet flying into camera: grows from the ghost and covers screen with soft folds."""
    cover = ease_io(p) if p <= 1 else 1 - ease_io(p - 1)
    cx, cy = W / 2, H * 0.45
    d = np.sqrt(((GX - cx) / W) ** 2 + ((GY - cy) / H) ** 2 * 0.6)
    edge = cover * 1.1 + (CLOTH - 0.5) * 0.25
    m = (1 - smooth(edge - 0.08, edge, d))[..., None]
    folds = 0.82 + 0.18 * np.sin(GX / 55 + CLOTH * 6 + t * 4)[..., None]
    sheet = np.array([0.93, 0.97, 1.0], np.float32) * folds
    return img * (1 - m) + sheet * m


def tr_iris(img, p, cx, cy, col=(0, 0, 0)):
    """Zoomed through the mask's eye socket: dark closes from the edges around (cx, cy)."""
    rad = (1 - ease_io(min(p, 1))) * 1.6 * H + 1
    d = np.sqrt((GX - cx) ** 2 + (GY - cy) ** 2)
    m = smooth(rad * 0.9, rad, d)[..., None]
    rim = np.exp(-((d - rad * 0.95) / 40) ** 2)[..., None] * np.array([1, 0.15, 0.1], np.float32) * 1.5
    return img * (1 - m) + np.asarray(col, np.float32) * m + rim * (1 - m) * (p < 1)


def tr_band(img, p, col, angle=-24, width=520):
    """A bandage / cape strip whipping across the screen (p 0..1 in, 1..2 out)."""
    a = math.radians(angle)
    u = (GX - W / 2) * math.cos(a) + (GY - H / 2) * math.sin(a)
    v = -(GX - W / 2) * math.sin(a) + (GY - H / 2) * math.cos(a)
    if p <= 1:
        head = -1400 + ease_io(p) * 2800
        m = smooth(-30, 0, head - u) * (1 - smooth(width * 0.5 - 20, width * 0.5, np.abs(v + 30 * np.sin(u / 160))))
        m = np.maximum(m, smooth(0.7, 1.0, p) * np.ones_like(m))
    else:
        m = 1 - smooth(0, 1, (p - 1) * 1.6) * np.ones_like(u)
    m = m[..., None]
    tex = np.asarray(col, np.float32) * (0.85 + 0.15 * np.sin(v / 18)[..., None])
    return img * (1 - m) + tex * m


def tr_cape(img, p):
    """Cape opening from the centre (p 0..1: open)."""
    o = ease_io(p)
    half = (1 - o) * W / 2
    wav = 40 * np.sin(GY / 90)
    m = (np.abs(GX - W / 2) > (W / 2 - half) + wav).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 3)[..., None]
    lining = np.array([0.55, 0.03, 0.1], np.float32)
    edge = np.exp(-((np.abs(GX - W / 2) - (W / 2 - half) - wav) / 18) ** 2)[..., None]
    return img * (1 - m) + (lining * (0.5 + 0.5 * (GY / H))[..., None]) * m + edge * np.array([1, 0.2, 0.3]) * 0.6


def bat_shape(scale, flap):
    s = scale
    f = math.sin(flap) * 0.45
    pts = [(0, -0.15), (0.12, -0.3), (0.15, -0.08), (0.5, -0.32 - f), (1.0, -0.12 - f * 1.4), (0.85, 0.05 - f * 0.6),
           (0.7, 0.0 - f * 0.3), (0.55, 0.16 - f * 0.2), (0.35, 0.05), (0.15, 0.22), (0, 0.32)]
    full = pts + [(-x, y) for x, y in pts[::-1]][1:]
    return np.array([(x * s, y * s) for x, y in full], np.float32)


def tr_bat(img, p, t):
    """Big bat flies across the lens; at its widest it covers the frame."""
    x = W * (1.4 - 1.8 * p)
    y = H * (0.75 - 0.35 * p)
    sc = 300 + 1700 * math.sin(math.pi * min(p, 1)) ** 2
    pts = bat_shape(sc, t * 30) + (x, y)
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [pts.astype(np.int32)], 1.0, cv2.LINE_AA)
    m = cv2.GaussianBlur(m, (0, 0), 2 + 10 * math.sin(math.pi * min(p, 1)))[..., None]
    return img * (1 - m) + np.array([0.04, 0.0, 0.06], np.float32) * m


def fly_bats(img, t, n=5):
    m = np.zeros((H, W), np.float32)
    for i in range(n):
        ph = i * 1.7
        x = (W * 0.5 + 520 * math.sin(t * 1.3 + ph)) % W
        y = H * (0.2 + 0.08 * i) + 60 * math.sin(t * 2.1 + ph)
        pts = bat_shape(50 + 10 * i, t * 22 + ph) + (x, y)
        cv2.fillPoly(m, [pts.astype(np.int32)], 1.0, cv2.LINE_AA)
    m = m[..., None]
    return img * (1 - m * 0.92)


def flash(img, k, col=(1, 1, 1)):
    if k <= 0:
        return img
    return img * (1 - 0.35 * k) + np.asarray(col, np.float32) * k


def vignette():
    v = ((GX / W - 0.5) ** 2 * 1.4 + (GY / H - 0.5) ** 2 * 1.1)
    return (1 - smooth(0.15, 0.65, v) * 0.45)[..., None]


VIG = vignette()


# ------------------------------------------------------------------ scenes
def scene_at(t):
    for i in range(len(CUTS) - 1):
        if t < CUTS[i + 1]:
            return i, t - CUTS[i], CUTS[i + 1] - CUTS[i]
    return len(CUTS) - 2, t - CUTS[-2], CUTS[-1] - CUTS[-2]


def char_list(i, lt, dur, t):
    sc = SCENES[i]
    out = []
    bp = beat_pulse(t, 0.16)
    for j, (cx, cy, r, ph) in enumerate(sc["chars"]):
        cx, cy = C(cx, cy)
        r = r * K
        sx = sy = 1.0
        rot = hop = dx = 0.0
        if i == 0:                      # pumpkins bob + bounce on beats
            hop = 14 * math.sin(t * 3.2 + ph) + 16 * beat_pulse(t + ph * 0.02, 0.12)
            rot = 5 * math.sin(t * 2.3 + ph)
            sq = 0.06 * bp
            sx, sy = 1 + sq, 1 - sq
        elif i in (1, 2, 4, 5):         # landing squash, then breathing + beat squash
            land = damp(lt - 0.06, 3.2, 5.5) * 0.16
            sq = land + 0.035 * bp + 0.012 * math.sin(t * 4)
            sx, sy = 1 + sq, 1 - sq
            rot = 2.0 * math.sin(t * 2.2)
            if i == 1:                  # howl: lean back near the end
                rot += -7 * smooth(1.3, 1.8, lt) * (1 - smooth(2.2, 2.5, lt))
                sy *= 1 + 0.05 * smooth(1.3, 1.8, lt)
            if i == 4:                  # head turn
                rot += 6 * smooth(0.9, 1.4, lt)
                dx = 10 * smooth(0.9, 1.4, lt)
            if i == 5:                  # wrap spin wobble
                rot += 12 * math.sin(lt * 18) * math.exp(-lt * 2.2)
        elif i in (3, 6):               # floating ghost / vampire
            hop = 24 * math.sin(t * 3.0) + 30 * (1 - ease_out_back(lt / 0.5))
            rot = 3 * math.sin(t * 2.0)
            sq = 0.03 * bp
            sx, sy = 1 - sq, 1 + sq
        elif i == 7:                    # guests: bounce on first beats, then freeze & tremble
            alive = 1 - smooth(0.7, 1.0, lt)
            hop = alive * 18 * abs(math.sin(t * 9 + ph))
            sq = alive * 0.05 * bp
            sx, sy = 1 + sq, 1 - sq
            dx = (1 - alive) * 2.2 * math.sin(t * 70 + ph * 3)
        elif i == 8:
            if j == 0:                  # Earth: slow breathe, lean in later
                lean = smooth(3.4, 4.6, lt)
                sx = sy = 1 + 0.02 * math.sin(t * 2) + 0.05 * lean
                rot = 4 * lean
            else:                       # small guests tremble harder after eyes open
                k = 1.5 + 4 * smooth(1.6, 2.0, lt)
                dx = k * math.sin(t * 80 + ph * 5)
                hop = k * 0.6 * math.sin(t * 63 + ph * 2)
        elif i == 9:
            if j == 0:
                sx = sy = 1 + 0.03 * bp
            else:
                hop = 16 * math.sin(t * 6 + ph) + 10 * bp
                dx = 10 * math.sin(t * 4 + ph)
                rot = 6 * math.sin(t * 5 + ph)
        out.append((cx, cy, r, sx, sy, rot, hop, dx))
    return out


def camera(i, lt, dur, t):
    bp = beat_pulse(t, 0.1)
    pop = 1 + 0.12 * (1 - ease_out_back(lt / 0.42))       # text-pop overshoot on entry
    push = 1 + 0.06 * (lt / dur)
    zoom = pop * push * (1 + 0.012 * bp)
    ox = 6 * math.sin(t * 0.9)
    oy = 8 * math.sin(t * 0.7)
    rot = 0.0
    piv = (W / 2, H * 0.5)
    if i == 0:
        zoom = (1 + 0.07 * (lt / dur)) * (1 + 0.015 * bp) * (1 + 0.1 * (1 - ease_out_back(lt / 0.5)))
        fly = smooth(dur - 0.42, dur, lt)               # dive into the green pumpkin
        zoom *= 1 + 4.5 * fly ** 2
        piv = C(170, 460)
    if i == 4:                                           # dive into the mask eye at the end
        e = smooth(dur - 0.45, dur, lt)
        zoom *= 1 + 3.0 * e ** 2
        piv = C(395, 935)
    if i == 7:
        zoom = 1.0 + 0.05 * (lt / dur)
    if i == 8:
        rise = 1 - ease_io(lt / 1.4)
        oy = 260 * rise
        zoom = 1.0 + 0.10 * smooth(1.6, 4.4, lt) - 0.12 * smooth(4.5, 4.8, lt) * (1 - smooth(5.6, 6.2, lt))
        zoom += 0.04 * (1 - ease_out_back((lt - 1.6) / 0.3)) if lt > 1.6 else 0
        if 1.6 < lt < 2.1:
            ox += 14 * math.sin(lt * 90) * (2.1 - lt) * 2
            oy += 10 * math.cos(lt * 77) * (2.1 - lt) * 2
        piv = (W / 2, H * 0.42)
    if i == 9:
        zoom = (1 + 0.1 * (1 - ease_out_back(lt / 0.4))) * (1 + 0.04 * lt / dur) * (1 + 0.012 * bp)
    return zoom, ox, oy, rot, piv


def frame(t):
    i, lt, dur = scene_at(t)
    sc = SCENES[i]
    acc = np.asarray(sc["acc"], np.float32)
    img = render_art(i, camera(i, lt, dur, t), char_list(i, lt, dur, t))
    bp = beat_pulse(t, 0.14)

    # scene grading
    if i == 7:   # red tension light flicker + huge round shadow crossing the floor
        img *= 0.85 + 0.15 * (0.5 + 0.5 * math.sin(t * 23) * math.sin(t * 7))
        sx = W * (1.5 - 2.2 * ease_io(lt / dur))
        d = np.sqrt(((GX - sx) / 700) ** 2 + ((GY - H * 0.72) / 360) ** 2)
        img *= (1 - (1 - smooth(0.6, 1.0, d)) * 0.7)[..., None]
    if i == 8:   # dark silhouette, then the eyes "open" with a green flash
        reveal = smooth(1.55, 1.75, lt)
        dark = 0.12 + 0.88 * reveal
        grey = img.mean(-1, keepdims=True)
        img = (img * reveal + grey * (1 - reveal) * np.array([0.6, 0.8, 1.0], np.float32)) * dark
        img = flash(img, 0.9 * math.exp(-max(lt - 1.6, 0) / 0.12) * (lt > 1.6), (0.6, 1.0, 0.3))
        img = flash(img, 0.5 * math.exp(-max(lt - 3.2, 0) / 0.1) * (lt > 3.2), (1.0, 0.2, 0.15))

    img = bloom(img, 0.35 + 0.55 * bp)
    sparks(img, t, acc, 0.6 if i != 8 else 0.3)
    if i == 6:
        img = fly_bats(img, t)

    # entry flash on every cut (reference style)
    if i > 0 and lt < 0.25 and i not in (5, 6, 8):
        img = flash(img, 0.55 * (1 - lt / 0.25) ** 2)

    # costume-made transitions around the cuts
    if i == 0 and lt > dur - 0.4:
        g = smooth(dur - 0.4, dur, lt)
        img = flash(img, g ** 1.5 * 0.95, (0.45, 1.0, 0.25))
    if i == 1 and lt < 0.3:
        img = flash(img, (1 - lt / 0.3) * 0.8, (0.45, 1.0, 0.25))
    if i == 1 and lt > dur - 0.32:
        img = tr_claws(img, (lt - (dur - 0.32)) / 0.22)
    if i == 2 and lt < 0.2:
        img = tr_claws(img, 1 + lt / 0.2 * 0.6)
    if i == 2 and lt > dur - 0.4:
        img = tr_smoke(img, (lt - (dur - 0.4)) / 0.4, t)
    if i == 3 and lt < 0.4:
        img = tr_smoke(img, 1 + lt / 0.4, t)
    if i == 3 and lt > dur - 0.35:
        img = tr_cloth(img, (lt - (dur - 0.35)) / 0.35, t)
    if i == 4 and lt < 0.35:
        img = tr_cloth(img, 1 + lt / 0.35, t)
    if i == 4 and lt > dur - 0.4:
        img = tr_iris(img, (lt - (dur - 0.4)) / 0.4, W / 2, H / 2)
    if i == 5 and lt < 0.3:                            # rolls out of the dark eye socket
        img = img * ease_io(lt / 0.3)
    if i == 5 and lt > dur - 0.4:
        p = (lt - (dur - 0.4)) / 0.4
        img = tr_band(img, p, (0.87, 0.8, 0.62) if p < 0.75 else (0.6, 0.05, 0.12))
    if i == 6 and lt < 0.45:
        img = tr_cape(img, lt / 0.45)
    if i == 6 and lt > dur - 0.4:
        img = tr_bat(img, (lt - (dur - 0.4)) / 0.4 * 0.55, t)
    if i == 7 and lt < 0.35:
        img = tr_bat(img, 0.55 + lt / 0.35 * 0.45, t)
    if i == 7 and lt > dur - 0.3:
        img *= 1 - smooth(dur - 0.3, dur, lt)
    if i == 9 and lt < 0.25:
        img = flash(img, (1 - lt / 0.25) ** 2 * 0.8, (1.0, 0.85, 0.6))
    if i == 9 and lt > dur - 0.45:                     # loop: whoosh back into the intro
        k = smooth(dur - 0.45, dur, lt)
        intro = render_art(0, (1 + 0.35 * (1 - k), 0, 0, 0, (W / 2, H / 2)), char_list(0, 0, CUTS[1], 0))
        img = img * (1 - k) + intro * k

    img *= VIG
    g = (np.random.default_rng(int(t * FPS)).random((H // 3, W // 3)).astype(np.float32) - 0.5) * 0.03
    img += cv2.resize(g, (W, H))[..., None]
    return (np.clip(img, 0, 1) * 255).astype(np.uint8)


def render_frame(n):
    return frame(n / FPS).tobytes()


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "build", "halloween_form_30s.mp4")
    audio = os.path.join(HERE, "build", "soundtrack.wav")
    n = int(round(DUR * FPS))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-i", audio, "-c:v", "libx264", "-preset", "medium", "-crf", "17",
                           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart",
                           out], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for k, buf in enumerate(pool.imap(render_frame, range(n), chunksize=4)):
            ff.stdin.write(buf)
            if k % 120 == 0:
                print(f"{k}/{n}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("done", out)


if __name__ == "__main__":
    main()
