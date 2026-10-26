"""Animation from the generated layers (scenes 00-02 for now), 1080x1920, 60 fps, synced to the track.

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
from build_mockups import BR, HZ, P_SCALE, PUMPKINS, STARTS, US  # noqa: E402
from compose import H, W, Layer, bezier, blur, compose, contact_shadow, save, tint, trails  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 60
BAR = 2.516667
BEAT = BAR / 4
T0 = 0.05
CUTS = [0.0, 2.5667, 5.0833, 7.6]


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
def pumpkin_layer(name, xy, scale, rot, op=1.0):
    return Layer("00_intro__pumpkin_" + name, "sprite", xy[0], xy[1], scale, rot, anchor="content", glow=40, op=op)


def intro(t):
    dur = CUTS[1]
    paths, cols, plays = [], [], []
    dive = clamp01((t - 2.1) / (dur - 2.1))
    green = None
    for k, ((n, xy, col), st) in enumerate(zip(PUMPKINS, STARTS)):
        s0 = 0.04 + 0.07 * k
        p = ease_out_cubic((t - s0) / 0.85)
        ctrl = ((st[0] + xy[0]) / 2 + (xy[1] - st[1]) * 0.35, (st[1] + xy[1]) / 2 - (xy[0] - st[0]) * 0.2)
        path = bezier(st, ctrl, xy, 80)
        i1 = max(2, int(p * 79) + 1)
        i0 = max(0, int((p - 0.45) * 79))
        land = s0 + 0.85
        fade = 1 - smooth01((t - land) / 0.7)
        if p > 0 and fade > 0:
            paths.append(path[i0:i1])
            cols.append(tuple(np.array(col) * fade))
        x, y = path[i1 - 1]
        spin = (1 - p) * 420 * (1 if k % 2 else -1)
        bob = 0.0
        if t > land:
            bob = 9 * math.sin((t - land) * 4.2 + k) * smooth01((t - land) / 0.3) - 16 * beat_pulse(t, 0.1)
        sc = P_SCALE * (0.45 + 0.55 * p) * (1 + 0.05 * beat_pulse(t, 0.1))
        rot = spin + 6 * math.sin(t * 2.6 + k)
        name = n
        if n == "purple" and 1.55 < t < 1.9:
            name = "purple_eye"
        if n == "green" and dive > 0:
            q = dive ** 2.1
            x, y = x + (540 - x) * ease_io(dive), y + (900 - y) * ease_io(dive)
            sc *= 1 + 9 * q
            rot = -10 * dive
            green = pumpkin_layer(name, (x, y + bob), sc, rot)
            continue
        if p > 0:
            plays.append(pumpkin_layer(name, (x, y + bob), sc, rot))
    ts = pop(t - 1.0, 0.36)
    lays = [trails(paths, cols, 3, 40)]
    if ts > 0:
        lays.append(Layer("00_intro__title", "key", W / 2, 820, max(ts, 0.01) * (1 + 0.025 * beat_pulse(t)),
                          anchor="content", op=clamp01((t - 1.0) / 0.08), glow=24))
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
    mr = ease_io((lt - 0.5) / 0.7)
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
    if lt < 1.26:
        state, since = "normal", lt
    elif lt < 1.89:
        state, since = "wolf", lt - 1.26
    else:
        state, since = "howl", lt - 1.89
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
    if state != "normal":
        sc *= 1 + damp(since, 3.5, 9) * 0.12
    if state == "howl":
        rot += -9 * ease_io(since / 0.18)
        sy *= 1 + 0.04 * ease_io(since / 0.18)
    shadow_w = 520 * (1 - 0.6 * clamp01((hz + 6 - y) / 800))
    lays.append(contact_shadow(BR["x"], hz, shadow_w))
    lays.append(Layer("01_brazil__char_" + state, "sprite", BR["x"], y, sc, rot, sx, sy, bottom_anchor=True, glow=50))
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
    if lt < 0.63:
        state, since = "blink", lt
    elif lt < 1.26:
        state, since = "pumpkin_off", lt - 0.63
    elif lt < 1.89:
        state, since = "normal", lt - 1.26
    else:
        state, since = "pumpkin_wink", lt - 1.89
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
    if state != "blink":
        sc *= 1 + damp(since, 3.5, 9) * 0.12
    lays.append(contact_shadow(x, hz, 560))
    lays.append(Layer("02_usa__char_" + state, "sprite", x, hz + 6, sc, rot, sx, sy, bottom_anchor=True, glow=50))
    lays.append(sparks(t, acc, 0.6))
    if lt < 0.3:
        lays.append(claws(1.0, fade=1 - lt / 0.3))
    if state == "normal" and since < 0.25:
        lays.append(flash((1 - since / 0.25) * 0.45, (1.0, 0.7, 0.2)))
    if state == "pumpkin_off" and since < 0.12:
        lays.append(flash((1 - since / 0.12) * 0.3))
    if lt > dur - 0.5:
        q = clamp01((lt - (dur - 0.5)) / 0.5)
        lays.append(Layer("02_usa__smoke", "screen", x + 30, hz - 330 - 260 * q, 0.35 + 1.6 * q ** 1.4,
                          anchor="content", op=clamp01(q * 2.5)))
        lays.append(flash(smooth01((q - 0.55) / 0.45) * 0.92, (1.0, 0.5, 0.12)))
    return compose("02_usa__bg", lays, hz, acc)


# ------------------------------------------------------------------ camera
def camera(img, t, i, lt, dur):
    bp = beat_pulse(t, 0.1)
    z = (1 + 0.035 * lt / dur) * (1 + 0.012 * bp)
    if i > 0:
        z *= 1 + 0.08 * (1 - ease_out_back(lt / 0.4))
    m = cv2.getRotationMatrix2D((W / 2, H * 0.52), 0, z)
    m[:, 2] += (5 * math.sin(t * 0.9), 6 * math.sin(t * 0.7))
    return cv2.warpAffine(img, m, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def frame(t):
    i = next(k for k in range(len(CUTS) - 1) if t < CUTS[k + 1] or k == len(CUTS) - 2)
    lt, dur = t - CUTS[i], CUTS[i + 1] - CUTS[i]
    img = [lambda: intro(t), lambda: brazil(lt, t), lambda: usa(lt, t)][i]()
    img = camera(img, t, i, lt, dur)
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
    out = args[0] if args else os.path.join(HERE, "out", "test_00-02.mp4")
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
