"""Animation from the generated layers (all scenes), 1080x1920, 60 fps, synced to the track.

Usage: python3 animate_layers.py [out.mp4] [--frames t1,t2,...]   (frames mode writes stills for review)
"""
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_mockups import (BATS, BR, FINAL_PUMPKINS, FLAMES, FLEE, HZ, P_SCALE, PUMPKINS, RING, SIX, STARTS,  # noqa: E402
                           US)
from compose import H, W, Layer, bezier, blur, compose, contact_shadow, save, tint, trails  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 60
BAR = 2.516667
BEAT = BAR / 4
T0 = 0.05
B = BEAT
# beats per scene: intro, 6 countries, guests, earth, final (cuts always land on a beat)
SCENE_BEATS = [5, 5, 5, 5, 5, 5, 5, 5, 8, 4]
END = 32.83                            # = length of build/soundtrack.wav
CUTS = [0.0] + [T0 + B * sum(SCENE_BEATS[:k + 1]) for k in range(len(SCENE_BEATS) - 1)] + [END]


# ----------------------------------------------------------------- easing
def clamp01(x):
    return min(max(x, 0.0), 1.0)


def ease_out_back(x, s=1.9):
    x = clamp01(x) - 1
    return 1 + x * x * ((s + 1) * x + s)


def ease_out_cubic(x):
    return 1 - (1 - clamp01(x)) ** 3


def ease_io(x):
    x = clamp01(x)
    return x * x * (3 - 2 * x)


def damp(x, freq=3.0, decay=6.0):
    return math.exp(-decay * x) * math.cos(2 * math.pi * freq * x) if x >= 0 else 0.0


def pop(x, dur=0.32):
    """0 before, overshoots to ~1.1 and settles to 1."""
    return ease_out_back(x / dur) if x > 0 else 0.0


def beat_pulse(t, decay=0.12):
    n = math.floor((t - T0) / BEAT)
    if n < 0:
        return 0.0
    dt = t - T0 - n * BEAT
    return (1.0 if n % 4 == 0 else 0.6) * math.exp(-dt / decay)


# ------------------------------------------------------------- overlays
_rng = np.random.default_rng(4)
SPARKS = np.c_[_rng.random(110) * W, _rng.random(110) * H, _rng.random(110), _rng.random(110)]


def sparks(t, col, k=1.0):
    def fn(c):
        lay = np.zeros((H // 2, W // 2, 3), np.float32)
        for x, y, s, ph in SPARKS:
            yy = (y - t * (70 + 160 * s)) % H
            xx = (x + 40 * math.sin(t * 0.9 + ph * 7)) % W
            a = (0.35 + 0.65 * math.sin(t * 5 + ph * 11) ** 2) * k
            cv2.circle(lay, (int(xx / 2), int(yy / 2)), max(1, int(1 + 2.4 * s)), tuple(float(v * a) for v in col),
                       -1, cv2.LINE_AA)
        lay = cv2.resize(lay, (W, H))
        return c + lay * 0.8 + blur(lay, 10) * 1.1
    return Layer(kind="raw", fn=fn)


def claws(prog, fade=1.0, col=(0.75, 1.0, 0.35)):
    def fn(c):
        lay = np.zeros((H, W, 3), np.float32)
        for i in range(3):
            a = np.array([560 + i * 230, -120 + i * 30.0])
            b = np.array([-140 + i * 230, H * 0.9 - i * 40.0])
            p = clamp01(prog * 1.25 - i * 0.12)          # slashes land one after another
            if p <= 0:
                continue
            pts = [a + (b - a) * s * p for s in np.linspace(0, 1, 32)]
            for j in range(31):
                th = int(3 + 58 * math.sin(math.pi * j / 31) ** 0.8)
                cv2.line(lay, tuple(int(v) for v in pts[j]), tuple(int(v) for v in pts[j + 1]), col, th, cv2.LINE_AA)
        lay *= fade
        m = lay.max(-1, keepdims=True)
        return c * (1 - m * 0.7) + np.clip(lay * 1.5, 0, 1) * m + blur(lay, 14) * 1.1 + blur(lay, 50) * 0.8
    return Layer(kind="raw", fn=fn)


def flash(k, col=(1, 1, 1)):
    return tint(col, clamp01(k))


# ------------------------------------------------------------------ scenes
def pumpkin_layer(name, xy, scale, rot, op=1.0, sx=1.0, sy=1.0, warp=None):
    return Layer("00_intro__pumpkin_" + name, "sprite", xy[0], xy[1], scale, rot, sx, sy, glow=40, op=op,
                 bottom_anchor=True, warp=warp)


def jelly(amp, phase, lean=0.0):
    """Elastic morph of a sprite: rows bulge/pinch in a travelling wave, top leans sideways."""
    if abs(amp) < 1e-3 and abs(lean) < 1e-3:
        return None

    def w(src):
        h, wd = src.shape[:2]
        yy, xx = np.mgrid[0:h, 0:wd].astype(np.float32)
        a = src[..., 3]
        ys = np.where(a.max(1) > 0.5)[0]
        top, bot = (ys.min(), ys.max()) if len(ys) else (0, h)
        v = np.clip((yy - top) / max(bot - top, 1), 0, 1)          # 0 top .. 1 bottom
        k = 1 + amp * np.sin(v * math.pi * 1.6 + phase)
        cx = wd / 2 + lean * (1 - v) * (bot - top) * 0.25
        mx = cx + (xx - cx) / k - lean * (1 - v) * (bot - top) * 0.25
        return cv2.remap(src, mx.astype(np.float32), yy, cv2.INTER_LINEAR, borderValue=0)
    return w


def hop_cycle(t, offset, period=2 * B, height=80.0):
    """Hop in place: stretched in the air, squashed on contact. Returns (lift_px, sx, sy, since_landing)."""
    u = ((t - T0) / period + offset) % 1.0
    air = 0.72
    if u < air:
        a = u / air
        lift = 4 * a * (1 - a) * height
        v = abs(1 - 2 * a)                       # speed: max at take-off and landing
        return lift, 1 - 0.14 * v, 1 + 0.24 * v, None
    c = (u - air) / (1 - air)
    sq = math.sin(math.pi * c) * 0.3
    return 0.0, 1 + sq * 0.9, 1 - sq, c * (1 - air) * period


def intro(t):
    dur = CUTS[1]
    paths, cols, plays = [], [], []
    dive = clamp01((t - (dur - 0.5)) / 0.5)
    green = None
    half_h = 115
    for k, ((n, xy, col), st) in enumerate(zip(PUMPKINS, STARTS)):
        s0 = 0.04 + 0.09 * k
        fly = 1.0
        p = ease_out_cubic((t - s0) / fly)
        ctrl = ((st[0] + xy[0]) / 2 + (xy[1] - st[1]) * 0.35, (st[1] + xy[1]) / 2 - (xy[0] - st[0]) * 0.2)
        path = bezier(st, ctrl, xy, 80)
        i1 = max(2, int(p * 79) + 1)
        i0 = max(0, int((p - 0.45) * 79))
        land = s0 + fly * 0.85
        fade = 1 - smooth01((t - land) / 0.8)
        if p > 0 and fade > 0:
            paths.append(path[i0:i1])
            cols.append(tuple(np.array(col) * fade))
        x, y = path[i1 - 1]
        spin = (1 - p) * 420 * (1 if k % 2 else -1)
        on = smooth01((t - land) / 0.25)
        lift, sx, sy, since = hop_cycle(t, k / 6)
        sx, sy = 1 + (sx - 1) * on, 1 + (sy - 1) * on
        wob = damp(since, 3.0, 6.0) * 0.16 * on if since is not None else 0.04 * on * math.sin(t * 9 + k)
        sc = P_SCALE * (0.45 + 0.55 * p)
        rot = spin + 7 * math.sin(t * 2.6 + k) * on
        name = n
        if n == "purple" and 2 * B + 0.05 < t < 2 * B + 0.4:
            name = "purple_eye"
        foot = y + half_h - lift * on
        warp = jelly(wob, t * 14 + k, lean=0.25 * math.sin(t * 3 + k) * on)
        if n == "green" and dive > 0:
            q = dive ** 2.1
            gx, gy = x + (540 - x) * ease_io(dive), foot + (1150 - foot) * ease_io(dive)
            green = pumpkin_layer(name, (gx, gy), sc * (1 + 9 * q), -10 * dive, sx=sx, sy=sy)
            continue
        if p > 0:
            plays.append(pumpkin_layer(name, (x, foot), sc, rot, sx=sx, sy=sy, warp=warp))
    ts = pop(t - 2 * B, 0.36)
    lays = [trails(paths, cols, 3, 40)]
    if ts > 0:
        lays.append(Layer("00_intro__title", "key", W / 2, 820, max(ts, 0.01) * (1 + 0.025 * beat_pulse(t)),
                          anchor="content", op=clamp01((t - 2 * B) / 0.08), glow=24))
    lays += plays
    if green is not None:
        lays.append(green)
    lays.append(sparks(t, (1.0, 0.6, 0.2), 0.7))
    if dive > 0:
        lays.append(flash(smooth01((dive - 0.45) / 0.55) * 0.95, (0.45, 1.0, 0.25)))
    return compose("00_intro__bg", lays, HZ["00_intro"], (1, 0.6, 0.2))


def smooth01(x):
    return ease_io(x)


def brazil(lt, t):
    dur = CUTS[2] - CUTS[1]
    hz = HZ["01_brazil"]
    acc = (0.7, 1.0, 0.2)
    land = 0.2
    lays = []
    # moon rises behind the title
    mr = ease_io((lt - 0.5) / 0.9)
    if mr > 0:
        lays.append(Layer("01_brazil__moon", "screen", BR["moon"][0], BR["moon"][1] + 260 * (1 - mr), 0.34,
                          anchor="content", glow=30, op=0.85 * mr))
    # map flashes on landing, then settles
    mk = clamp01((lt - land - 0.04) / 0.08)
    if mk > 0:
        e = math.exp(-max(lt - land, 0) / 0.22)
        lays.append(Layer("01_brazil__map", "screen", *BR["map"], 0.52 * (1 + 0.06 * e), anchor="content",
                          op=mk * (0.8 + 0.4 * e), glow=14 + 30 * e))
    ts = pop(lt - land, 0.32)
    if ts > 0:
        lays.append(Layer("01_brazil__title", "key", W / 2, 500, 0.9 * ts * (1 + 0.02 * beat_pulse(t)),
                          anchor="content", op=clamp01((lt - land) / 0.06), glow=26))
    # character: drop, squash, transform, howl
    if lt < 2 * B:
        state, since = "normal", lt
    elif lt < 4 * B:
        state, since = "wolf", lt - 2 * B
    else:
        state, since = "howl", lt - 4 * B
    y = hz + 6
    sx = sy = 1.0
    if lt < land:
        f = lt / land
        y -= (1 - f * f) * 1100
        sx, sy = 0.9, 1.12
    else:
        sq = damp(lt - land, 2.8, 5.5) * 0.24 + 0.03 * beat_pulse(t, 0.1) + 0.01 * math.sin(t * 4)
        sx, sy = 1 + sq, 1 - sq
    rot = 1.5 * math.sin(t * 2.3)
    sc = BR["ball"]
    if state != "normal":                       # elastic morph into the new form
        m = damp(since, 3.2, 7) * 0.22
        sx, sy = sx * (1 + m), sy * (1 - m)
    warp = jelly(damp(lt - land, 3.0, 5) * 0.08 + (damp(since, 3.2, 7) * 0.1 if state != "normal" else 0), t * 12)
    if state == "howl":
        rot += -9 * ease_io(since / 0.18)
        sy *= 1 + 0.04 * ease_io(since / 0.18)
    shadow_w = 520 * (1 - 0.6 * clamp01((hz + 6 - y) / 800))
    lays.append(contact_shadow(BR["x"], hz, shadow_w))
    lays.append(Layer("01_brazil__char_" + state, "sprite", BR["x"], y, sc, rot, sx, sy, bottom_anchor=True, glow=50,
                      warp=warp))
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.28:
        lays.append(flash((1 - lt / 0.28) ** 2 * 0.9, (0.45, 1.0, 0.25)))
    if state != "normal" and since < 0.15:
        lays.append(flash((1 - since / 0.15) * 0.35))
    if lt > dur - 0.3:
        lays.append(claws((lt - (dur - 0.3)) / 0.22))
    return compose("01_brazil__bg", lays, hz, acc)


def usa(lt, t):
    dur = CUTS[3] - CUTS[2]
    hz = HZ["02_usa"]
    acc = (1.0, 0.6, 0.15)
    lays = []
    e = math.exp(-max(lt - 0.05, 0) / 0.25)
    lays.append(Layer("02_usa__map", "screen", W / 2 + 20, 480, 0.84, anchor="content",
                      op=clamp01((lt - 0.05) / 0.08) * (0.8 + 0.3 * e), glow=16 + 20 * e))
    ts = pop(lt - 0.08, 0.32)
    if ts > 0:
        lays.append(Layer("02_usa__title", "key", W / 2, 430, 0.82 * ts * (1 + 0.02 * beat_pulse(t)),
                          anchor="content", crop_rows=566, op=clamp01((lt - 0.08) / 0.06), glow=24))
    if lt < 1 * B:
        state, since = "blink", lt
    elif lt < 2 * B:
        state, since = "pumpkin_off", lt - 1 * B
    elif lt < 3 * B:
        state, since = "normal", lt - 2 * B
    else:
        state, since = "pumpkin_wink", lt - 3 * B
    brake = 0.42
    radius = 300
    if lt < brake:
        x = -320 + (US["x"] + 320) * ease_out_cubic(lt / brake)
        rot = (x - US["x"]) / radius * 57.3
        sx = sy = 1.0
    else:
        x = US["x"]
        rot = damp(lt - brake, 2.2, 5) * 12 + 1.5 * math.sin(t * 2.4)
        sq = 0.03 * beat_pulse(t, 0.1) + 0.01 * math.sin(t * 4)
        sx, sy = 1 + sq, 1 - sq
    sc = US["ball"]
    warp = None
    if state != "blink":                        # elastic morph into the new form
        m = damp(since, 3.2, 7) * 0.22
        sx, sy = sx * (1 + m), sy * (1 - m)
        warp = jelly(damp(since, 3.2, 7) * 0.1, t * 12)
    lays.append(contact_shadow(x, hz, 560))
    lays.append(Layer("02_usa__char_" + state, "sprite", x, hz + 6, sc, rot, sx, sy, bottom_anchor=True, glow=50,
                      warp=warp))
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.3:
        lays.append(claws(1.0, fade=1 - lt / 0.3))
    if state == "normal" and since < 0.25:
        lays.append(flash((1 - since / 0.25) * 0.45, (1.0, 0.7, 0.2)))
    if state == "pumpkin_off" and since < 0.12:
        lays.append(flash((1 - since / 0.12) * 0.3))
    if lt > dur - 0.55:
        q = clamp01((lt - (dur - 0.55)) / 0.55)
        lays.append(Layer("02_usa__smoke", "screen", x + 30, hz - 330 - 260 * q, 0.35 + 1.6 * q ** 1.4,
                          anchor="content", op=clamp01(q * 2.5)))
        lays.append(flash(smooth01((q - 0.55) / 0.45) * 0.92, (1.0, 0.5, 0.12)))
    return compose("02_usa__bg", lays, hz, acc)


def titled(prefix, lt, t, title_xy, title_scale, map_xy=None, map_scale=0.6, map_op=0.8, at=0.08, crop=None):
    """Map flashes in, title pops with overshoot, both pulse on the beat."""
    lays = []
    if map_xy:
        e = math.exp(-max(lt - at, 0) / 0.25)
        lays.append(Layer(prefix + "__map", "screen", *map_xy, map_scale * (1 + 0.05 * e), anchor="content",
                          op=clamp01((lt - at) / 0.08) * (map_op + 0.4 * e), glow=16 + 24 * e))
    ts = pop(lt - at, 0.32)
    if ts > 0:
        lays.append(Layer(prefix + "__title", "key", *title_xy, title_scale * ts * (1 + 0.02 * beat_pulse(t)),
                          anchor="content", crop_rows=crop, op=clamp01((lt - at) / 0.06), glow=24))
    return lays


def morph_scale(since, sx, sy):
    """Elastic squash when a character switches form."""
    m = damp(since, 3.2, 7) * 0.22
    return sx * (1 + m), sy * (1 - m), jelly(damp(since, 3.2, 7) * 0.1, since * 12)


def breathe(t):
    sq = 0.03 * beat_pulse(t, 0.1) + 0.01 * math.sin(t * 4)
    return 1 + sq, 1 - sq


def state_at(lt, steps):
    """steps: [(beat, name), ...] ascending -> (name, seconds since it started)."""
    cur, since = steps[0][1], lt
    for b, name in steps:
        if lt >= b * B:
            cur, since = name, lt - b * B
    return cur, since


def uk(lt, t, dur):
    hz = HZ["03_uk"]
    acc = (0.5, 0.85, 1.0)
    lays = titled("03_uk", lt, t, (470, 430), 0.82, (800, 560), 0.5)
    state, since = state_at(lt, [(0, "normal"), (1.2, "ghost"), (3.5, "ghost_boo")])
    sx, sy = breathe(t)
    warp = None
    if state == "normal":
        lays.append(contact_shadow(540, hz, 520))
        lays.append(Layer("03_uk__char_normal", "sprite", 540, hz + 6, 0.56, 0, sx, sy, bottom_anchor=True, glow=50))
        q = ease_io(lt / (1.2 * B))                         # sheet twirls down onto the ball
        lays.append(Layer("03_uk__sheet", "sprite", 560 + 120 * math.sin(lt * 7) * (1 - q), -250 + (hz - 280 + 250) * q,
                          0.42 + 0.18 * q, rot=200 * (1 - q) + 15 * math.sin(lt * 9), anchor="content"))
    else:
        sx, sy, warp = morph_scale(since if state == "ghost" else lt - 1.2 * B, sx, sy)
        lift = 110 * ease_out_back((lt - 1.2 * B) / 0.5) + 22 * math.sin(t * 3.2)
        sc = 0.6
        y = hz - lift
        if state == "ghost_boo":                         # lunges at the camera
            k = ease_io(since / (dur - 3.5 * B))
            sc *= 1 + 0.9 * k ** 1.6
            y += 420 * k ** 1.6
        lays.append(contact_shadow(540, hz, 330, 0.45))
        lays.append(Layer("03_uk__char_" + state, "sprite", 540, y, sc, 3 * math.sin(t * 2), sx, sy,
                          bottom_anchor=True, glow=60, warp=warp))
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.35:                                        # out of the orange smoke
        lays.append(flash((1 - lt / 0.35) ** 1.5 * 0.85, (1.0, 0.5, 0.12)))
    if state == "ghost" and since < 0.15:
        lays.append(flash((1 - since / 0.15) * 0.4))
    if lt > dur - 0.35:                                  # white sheet fills the frame
        lays.append(flash(ease_io((lt - (dur - 0.35)) / 0.35) * 0.9, (0.93, 0.97, 1.0)))
    return compose("03_uk__bg", lays, hz, acc)


def japan(lt, t, dur):
    hz = HZ["04_japan"]
    acc = (1.0, 0.2, 0.25)
    lays = titled("04_japan", lt, t, (W / 2, 470), 0.88, (790, 560), 0.62)
    state, since = state_at(lt, [(0, "normal"), (1.5, "mask_dark"), (2.5, "mask_glow"), (3.8, "mask_turn")])
    if lt > 2.5 * B:                                     # blue spirit flames pop in
        for k, (x, y, sc) in enumerate(FLAMES):
            f = pop(lt - 2.5 * B - k * 0.06, 0.3)
            if f > 0:
                lays.append(Layer("04_japan__flame", "screen", x + 10 * math.sin(t * 3 + k), y - 14 * math.sin(t * 4 + k),
                                  sc * f * (1 + 0.08 * math.sin(t * 11 + k)), rot=6 * math.sin(t * 5 + k),
                                  anchor="content", glow=22))
    sx, sy = breathe(t)
    warp = None
    sc = 0.58
    y = hz + 6
    if state != "normal":
        sx, sy, warp = morph_scale(since, sx, sy)
    if state == "mask_turn":                             # dive into the mask's eye
        k = ease_io((lt - (dur - 0.5)) / 0.5) ** 2
        sc *= 1 + 2.6 * k
        y += 1100 * k
    lays.append(contact_shadow(540, hz, 520))
    lays.append(Layer("04_japan__char_" + state, "sprite", 540, y, sc, 2 * math.sin(t * 2.2), sx, sy,
                      bottom_anchor=True, glow=50, warp=warp))
    if state == "normal":                                # two halves of the mask fly in and click together
        q = ease_io(lt / (1.5 * B))
        for side, name in ((-1, "mask_left"), (1, "mask_right")):
            x = 540 + side * (700 * (1 - q) + 120)
            lays.append(Layer("04_japan__" + name, "sprite", x, hz - 300 + 200 * (1 - q) * math.sin(q * 3), 0.3,
                              rot=side * 360 * (1 - q), anchor="content"))
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.3:
        lays.append(flash((1 - lt / 0.3) ** 1.5 * 0.85, (0.93, 0.97, 1.0)))
    if state == "mask_dark" and since < 0.1:
        lays.append(flash((1 - since / 0.1) * 0.5))
    if state == "mask_glow" and since < 0.2:
        lays.append(flash((1 - since / 0.2) * 0.4, (1, 0.1, 0.1)))
    if lt > dur - 0.2:
        lays.append(flash(ease_io((lt - (dur - 0.2)) / 0.2), (0, 0, 0)))
    return compose("04_japan__bg", lays, hz, acc)


def egypt(lt, t, dur):
    hz = HZ["05_egypt"]
    acc = (1.0, 0.8, 0.25)
    lays = titled("05_egypt", lt, t, (W / 2, 470), 0.85, (790, 560), 0.62)
    state, since = state_at(lt, [(0, "normal"), (2, "half"), (3, "mummy")])
    roll = 0.45
    sx, sy = breathe(t)
    warp = None
    if lt < roll:                                        # rolls in from the right
        x = 1400 - (1400 - 540) * ease_out_cubic(lt / roll)
        rot = (x - 540) / 290 * 57.3
    else:
        x = 540
        spin = clamp01((lt - 1 * B) / (2 * B))           # spins on the spot while wrapping
        rot = 14 * math.sin(spin * math.pi * 6) * (1 - spin) + damp(lt - roll, 2.2, 5) * 10
    if state != "normal":
        sx, sy, warp = morph_scale(since, sx, sy)
    lays.append(contact_shadow(x, hz, 520))
    lays.append(Layer("05_egypt__char_" + state, "sprite", x, hz + 6, 0.58, rot, sx, sy, bottom_anchor=True, glow=50,
                      warp=warp))
    if 1 * B < lt < 3.1 * B:                             # bandage whirls around the ball
        a = (lt - 1 * B) * 9
        lays.append(Layer("05_egypt__bandage", "sprite", 540 + 260 * math.cos(a), hz - 280 + 90 * math.sin(a), 0.55,
                          rot=math.degrees(a) + 90, anchor="content", op=clamp01((lt - B) / 0.1)))
    if state == "mummy" and since < 0.25:
        lays.append(flash((1 - since / 0.25) * 0.45, (0.5, 1.0, 0.2)))
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.3:                                         # out of the dark eye socket
        lays.append(flash((1 - lt / 0.3), (0, 0, 0)))
    if lt > dur - 0.45:                                  # loose end whips across, turns into the cape lining
        q = ease_io((lt - (dur - 0.45)) / 0.45)
        lays.append(Layer("05_egypt__bandage", "sprite", 1300 - 1500 * q, 900 - 200 * q, 0.9 + 1.8 * q,
                          rot=-35 - 40 * q, anchor="content"))
        lays.append(flash(smooth01((q - 0.6) / 0.4) * 0.9, (0.55, 0.03, 0.1)))
    return compose("05_egypt__bg", lays, hz, acc)


def romania(lt, t, dur):
    hz = HZ["06_romania"]
    acc = (0.75, 0.25, 1.0)
    mr = ease_io(lt / (1.6 * B))
    lays = [Layer("06_romania__moon", "screen", 280, 420 - 120 * mr, 0.36, anchor="content", glow=30, op=0.85 * mr)]
    lays += titled("06_romania", lt, t, (W / 2, 420), 0.86, (790, 560), 0.62)
    state, since = state_at(lt, [(0, "cocoon"), (1.5, "vampire"), (3.5, "open")])
    sx, sy = breathe(t)
    warp = None
    lift = 0.0
    if state != "cocoon":
        sx, sy, warp = morph_scale(since, sx, sy)
        lift = 70 * ease_out_back((lt - 1.5 * B) / 0.5) + 16 * math.sin(t * 3)
    lays.append(contact_shadow(540, hz, 520 - lift))
    lays.append(Layer("06_romania__char_" + state, "sprite", 540, hz + 6 - lift, 0.56, 2 * math.sin(t * 2), sx, sy,
                      bottom_anchor=True, glow=50, warp=warp))
    if state != "cocoon":                                # bats burst out of the cape
        q = ease_out_cubic((lt - 1.5 * B) / 0.6)
        for k, (x, y, sc, b, r) in enumerate(BATS):
            bx = 540 + (x - 540) * q + 20 * math.sin(t * 3 + k)
            by = hz - 250 + (y - hz + 250) * q + 25 * math.sin(t * 4.5 + k)
            lays.append(Layer("06_romania__bat_" + b, "sprite", bx, by, sc * (0.4 + 0.6 * q), rot=r, sy=1 + 0.25 * math.sin(t * 22 + k),
                              anchor="content"))
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.35:                                        # the red lining opens up
        lays.append(flash((1 - lt / 0.35) * 0.85, (0.55, 0.03, 0.1)))
    if state == "vampire" and since < 0.2:
        lays.append(flash((1 - since / 0.2) * 0.35, (0.8, 0.3, 1.0)))
    if lt > dur - 0.45:                                  # last bat flies into the lens
        q = ease_io((lt - (dur - 0.45)) / 0.45)
        lays.append(Layer("06_romania__bat_2", "sprite", 700 - 160 * q, 1500 - 560 * q, 0.3 + 3.2 * q ** 2,
                          rot=-12, sy=1 + 0.3 * math.sin(t * 25), anchor="content"))
        lays.append(flash(smooth01((q - 0.75) / 0.25), (0.02, 0, 0.03)))
    return compose("06_romania__bg", lays, hz, acc)


def guests(lt, t, dur):
    hz = HZ["07_guests"]
    acc = (1.0, 0.15, 0.15)
    lays = []
    stop = 2 * B
    scared = lt > 2.5 * B
    if lt > 3 * B:
        lays.append(Layer("07_guests__title", "key", W / 2, 520, 0.85 * pop(lt - 3 * B, 0.4), anchor="content",
                          op=clamp01((lt - 3 * B) / 0.08), glow=26))
    if lt > stop:                                        # a huge round shadow crosses the floor
        q = ease_io((lt - stop) / (dur - stop))
        cx = 1500 - 1100 * q

        def shadow(c, cx=cx, q=q):
            m = np.zeros(c.shape[:2], np.float32)
            cv2.ellipse(m, (int(cx), 1500), (760, 300), 0, 0, 360, 1, -1)
            cv2.circle(m, (int(cx + 60), 760), 520, 0.5, -1)
            return c * (1 - cv2.GaussianBlur(m, (0, 0), 50)[..., None] * 0.75)
        lays.append(Layer(kind="raw", fn=shadow))
    for j in [2, 3, 1, 4, 0, 5]:
        x, y, k = RING[j]
        name = ("07_guests__scared_" if scared else "07_guests__happy_") + SIX[j]
        if lt < stop:
            lift, sx, sy, _ = hop_cycle(t, j / 6, period=B, height=55)
        else:
            lift, sx, sy = 0.0, 1.0, 1.0
            if scared:
                sx, sy, _ = morph_scale(lt - 2.5 * B, sx, sy)
        jit = 2.5 * math.sin(t * 70 + j * 3) if scared else 0
        lays.append(contact_shadow(x, y, 260 * k / 0.25, 0.6))
        lays.append(Layer(name, "sprite", x + jit, y - lift, k, jit, sx, sy, bottom_anchor=True, glow=30))
    lays.append(sparks(t, acc, 0.5))
    if lt < 0.3:
        lays.append(flash((1 - lt / 0.3), (0.02, 0, 0.03)))
    if lt > dur - 0.3:
        lays.append(flash(ease_io((lt - (dur - 0.3)) / 0.3), (0, 0, 0)))
    return compose("07_guests__bg", lays, hz, acc)


def earth(lt, t, dur):
    hz = HZ["08_earth"]
    acc = (0.55, 1.0, 0.2)
    lays = []
    state, since = state_at(lt, [(0, "friendly"), (3, "eyes"), (5, "grin")])
    if lt > 3 * B:
        lays.append(Layer("08_earth__title", "key", W / 2, 240, 0.9 * pop(lt - 3 * B, 0.35) * (1 + 0.02 * beat_pulse(t)),
                          anchor="content", op=clamp01((lt - 3 * B) / 0.06), glow=30))
    rise = ease_out_cubic(lt / (2.5 * B))
    y = hz + 600 - (600 + 170) * rise
    sx, sy = 1 + 0.01 * math.sin(t * 2), 1 + 0.01 * math.sin(t * 2)
    warp = None
    rot = 0.0
    sc = 0.74
    if state != "friendly":
        sx, sy, warp = morph_scale(since, sx, sy)
    if state == "grin":                                  # leans in, then a sharp pull back
        lean = ease_io(since / (1.5 * B))
        rot = 6 * lean
        sc *= 1 + 0.12 * lean
        y += 60 * lean
    lays.append(Layer("08_earth__char_" + state, "sprite", 540, y, sc, rot, sx, sy, bottom_anchor=True, glow=90,
                      warp=warp))
    if lt > 5.5 * B:
        lays.append(Layer("08_earth__subtitle", "key", 470, 430, 0.6 * pop(lt - 5.5 * B, 0.35), rot=-4,
                          anchor="content", op=clamp01((lt - 5.5 * B) / 0.06), glow=16))
    xs = [120, 285, 450, 615, 780, 945]
    shake = 2 + (6 if state != "friendly" else 0)
    for i, n in enumerate(SIX):
        name = ("07_guests__scared_" if state != "friendly" else "07_guests__happy_") + n
        jit = shake * math.sin(t * 75 + i * 2.3) if state != "friendly" else 0
        lays.append(contact_shadow(xs[i] + jit, hz + 20, 170, 0.6))
        lays.append(Layer(name, "sprite", xs[i] + jit, hz + 20, 0.155, jit, bottom_anchor=True, glow=24))
    lays.append(sparks(t, acc, 0.4))
    if state == "friendly":
        lays.append(tint((0, 0, 0), 0.55 * (1 - ease_io(lt / (3 * B)) * 0.4)))
    if state == "eyes" and since < 0.25:
        lays.append(flash((1 - since / 0.25) * 0.6, (0.45, 1.0, 0.2)))
    if state == "grin" and since < 0.2:
        lays.append(flash((1 - since / 0.2) * 0.45, (1.0, 0.15, 0.1)))
    return compose("08_earth__bg", lays, hz, acc)


def final(lt, t, dur):
    hz = HZ["09_final"]
    acc = (0.7, 0.4, 1.0)
    lays = []
    if lt > 1 * B:
        lays.append(Layer("09_final__title", "key", W / 2, 230, pop(lt - B, 0.35) * (1 + 0.02 * beat_pulse(t)),
                          anchor="content", op=clamp01((lt - B) / 0.06), glow=30))
    lays.append(Layer("08_earth__char_wink", "sprite", 540, 900, 0.5 * (1 + 0.03 * beat_pulse(t)), -6 + 3 * math.sin(t * 2),
                      bottom_anchor=True, glow=60))
    q = ease_out_cubic(lt / 1.1)
    cols = {"red": (1, 0.2, 0.15), "blue": (0.3, 0.8, 1), "green": (0.5, 1, 0.2), "yellow": (1, 0.85, 0.2),
            "purple": (0.7, 0.3, 1), "orange": (1, 0.5, 0.1)}
    paths, pcols, chars = [], [], []
    for k, ((fx, fy, sc), n, (pn, (px, py))) in enumerate(zip(FLEE, SIX, FINAL_PUMPKINS)):
        x, y = 540 + (fx - 540) * q, 1500 + (fy - 1500) * q
        lift, sx, sy, _ = hop_cycle(t, k / 6, period=B, height=30)
        chars.append(Layer("09_final__flee_" + n, "sprite", x, y - lift, sc, 5 * math.sin(t * 6 + k), sx, sy,
                           bottom_anchor=True, glow=30))
        path = bezier((fx, fy - 60), ((fx + px) / 2, min(fy, py) - 220), (px, py), 60)
        tq = ease_out_cubic((lt - 0.4) / 0.9)
        if tq > 0:                                       # their trails turn into the intro pumpkins
            paths.append(path[:max(2, int(tq * 59) + 1)])
            pcols.append(cols[pn])
            f = pop(lt - 0.4 - 0.9 + 0.1, 0.3)
            if f > 0:
                chars.append(pumpkin_layer(pn, (px, py + 70), 0.15 * f, 8 * math.sin(t * 3 + k)))
    lays.append(trails(paths, pcols, 3, 34))
    lays += chars
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.25:
        lays.append(flash((1 - lt / 0.25) ** 2 * 0.8, (1.0, 0.85, 0.6)))
    if lt > dur - 0.35:                                  # whoosh back to the opening (seamless loop)
        lays.append(flash(ease_io((lt - (dur - 0.35)) / 0.35) * 0.9, (0.04, 0.0, 0.06)))
    return compose("09_final__bg", lays, hz, acc)


# ------------------------------------------------------------------ camera
def camera(img, t, i, lt, dur):
    bp = beat_pulse(t, 0.1)
    z = (1 + 0.035 * lt / dur) * (1 + 0.012 * bp)
    if i > 0:
        z *= 1 + 0.08 * (1 - ease_out_back(lt / 0.4))
    if i == 8:                                   # earth: push in on the grin, then a short sharp pull back
        z *= 1 + 0.08 * ease_io((lt - 5 * B) / (1.5 * B)) - 0.14 * ease_io((lt - 7 * B) / 0.18)
        if 3 * B < lt < 3 * B + 0.35:            # shake when the eyes open
            m_shake = (lt - 3 * B) / 0.35
            return _shift(img, z, t, 18 * (1 - m_shake) * math.sin(lt * 90), 12 * (1 - m_shake) * math.cos(lt * 77))
    return _shift(img, z, t)


def _shift(img, z, t, dx=0.0, dy=0.0):
    m = cv2.getRotationMatrix2D((W / 2, H * 0.52), 0, z)
    m[:, 2] += (5 * math.sin(t * 0.9) + dx, 6 * math.sin(t * 0.7) + dy)
    return cv2.warpAffine(img, m, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


GY, GX = np.mgrid[0:H, 0:W].astype(np.float32)


def _noise(seed, scale):
    r = np.random.default_rng(seed).random((H // scale + 2, W // scale + 2)).astype(np.float32) - 0.5
    return cv2.resize(cv2.GaussianBlur(r, (0, 0), 1.0), (W, H), interpolation=cv2.INTER_CUBIC) * 2


NX, NY = _noise(51, 120), _noise(52, 120)
MORPH = 0.3          # seconds of liquid morph on each side of a country cut
MORPH_CENTRE = {1: (BR["x"], HZ["01_brazil"] - 260), 2: (US["x"], HZ["02_usa"] - 280),
                3: (540, HZ["03_uk"] - 330), 4: (540, HZ["04_japan"] - 280), 5: (540, HZ["05_egypt"] - 280),
                6: (540, HZ["06_romania"] - 300)}
MORPH_CUTS = {1, 2, 3, 4, 5}   # country -> country cuts (scene i -> i+1) that use the liquid morph


def liquid(img, s, cx, cy):
    """Liquid twirl morph: swirl around the character, bulge zoom and wobbling displacement."""
    if s <= 0:
        return img
    dx, dy = GX - cx, GY - cy
    r = np.sqrt(dx * dx + dy * dy)
    ang = s * 3.4 * np.clip(1 - r / 1250, 0, 1) ** 2
    zoom = 1 + 0.3 * s
    ca, sa = np.cos(ang), np.sin(ang)
    mx = cx + (dx * ca - dy * sa) / zoom + NX * 60 * s
    my = cy + (dx * sa + dy * ca) / zoom + NY * 60 * s
    out = cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_LINEAR,
                    borderMode=cv2.BORDER_REFLECT)
    # chromatic split grows with the morph
    shift = int(14 * s)
    if shift:
        out[..., 0] = np.roll(out[..., 0], shift, 1)
        out[..., 2] = np.roll(out[..., 2], -shift, 1)
    return out


def scene_img(i, t):
    lt, dur = t - CUTS[i], CUTS[i + 1] - CUTS[i]
    fns = [lambda: intro(t), lambda: brazil(lt, t), lambda: usa(lt, t), lambda: uk(lt, t, dur),
           lambda: japan(lt, t, dur), lambda: egypt(lt, t, dur), lambda: romania(lt, t, dur),
           lambda: guests(lt, t, dur), lambda: earth(lt, t, dur), lambda: final(lt, t, dur)]
    img = fns[i]()
    return camera(img, t, i, lt, dur)


def frame(t):
    i = next(k for k in range(len(CUTS) - 1) if t < CUTS[k + 1] or k == len(CUTS) - 2)
    img = scene_img(i, t)
    # country -> country cuts (not the intro dive): liquid morph across the cut
    nxt, prv = CUTS[i + 1] - t, t - CUTS[i]
    if i in MORPH_CUTS and nxt < MORPH:
        s = ease_io(1 - nxt / MORPH) ** 1.5
        img = liquid(img, s, *MORPH_CENTRE[i])
        if nxt < 0.07:                      # dissolve into the (equally twisted) next scene
            b = liquid(scene_img(i + 1, CUTS[i + 1] + 0.001), 1.0, *MORPH_CENTRE[i + 1])
            k = ease_io(1 - nxt / 0.07) * 0.5
            img = img * (1 - k) + b * k
    elif i - 1 in MORPH_CUTS and prv < MORPH:
        s = ease_io(1 - prv / MORPH) ** 1.5
        img = liquid(img, s, *MORPH_CENTRE[i])
        if prv < 0.07:
            a = liquid(scene_img(i - 1, CUTS[i] - 0.001), 1.0, *MORPH_CENTRE[i - 1])
            k = (1 - ease_io(prv / 0.07)) * 0.5
            img = img * (1 - k) + a * k
    g = (np.random.default_rng(int(t * FPS)).random((H // 3, W // 3)).astype(np.float32) - 0.5) * 0.025
    img = img + cv2.resize(g, (W, H))[..., None]
    return np.clip(img, 0, 1)


def render_frame(n):
    return (frame(n / FPS) * 255).astype(np.uint8).tobytes()


def main():
    args = sys.argv[1:]
    if args and args[0] == "--frames":
        out = os.path.join(HERE, "build", "frames")
        os.makedirs(out, exist_ok=True)
        for t in map(float, args[1].split(",")):
            save(frame(t), os.path.join(out, f"{t:05.2f}.jpg"))
        return
    out = args[0] if args else os.path.join(HERE, "out", "halloween_form_full.mp4")
    end = CUTS[-1]
    audio = os.path.join(HERE, "build", "soundtrack.wav")
    n = int(round(end * FPS))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-i", audio, "-t", str(end), "-af", f"afade=t=out:st={end - 0.15}:d=0.15",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p",
                           "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for k, buf in enumerate(pool.imap(render_frame, range(n), chunksize=2)):
            ff.stdin.write(buf)
            if k % 60 == 0:
                print(f"{k}/{n}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("done", out)


if __name__ == "__main__":
    main()
