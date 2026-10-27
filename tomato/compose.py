"""Assemble the 5-level video: upscale 3D frames, draw counters and titles, add sound.

Usage: python compose.py <frames_dir> <out.mp4> [fps3d]
"""
import sys, os, math, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from timeline import LEVELS, duration, cuts_at, pieces_at, cut_times

FPS = 30
W, H = 1080, 1920
SR = 48000
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
WHITE = (246, 242, 234)
ORANGE = (236, 160, 52)
_fonts = {}


def font(size):
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT, size)
    return _fonts[size]


def draw_texts(img, items):
    """items: (text, size, colour, centre_y, alpha 0..1)."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d, ds = ImageDraw.Draw(layer), ImageDraw.Draw(shadow)
    for text, size, colour, cy, a in items:
        if a <= 0:
            continue
        f = font(size)
        x0, y0, x1, y1 = d.textbbox((0, 0), text, font=f)
        pos = ((W - (x1 - x0)) / 2 - x0, cy - (y1 - y0) / 2 - y0)
        ds.text((pos[0], pos[1] + 4), text, font=f, fill=(0, 0, 0, int(150 * a)))
        d.text(pos, text, font=f, fill=(*colour, int(255 * a)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8))
    return Image.alpha_composite(Image.alpha_composite(img, shadow), layer)


def level_dots(img, lv):
    d = ImageDraw.Draw(img)
    w, gap, y = 64, 14, 92
    x = (W - (5 * w + 4 * gap)) / 2
    for i in range(1, 6):
        col = (*ORANGE, 255) if i <= lv else (255, 255, 255, 70)
        d.rounded_rectangle([x, y, x + w, y + 10], radius=5, fill=col)
        x += w + gap
    return img


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def overlay(img, lv, t):
    L = LEVELS[lv]
    img = level_dots(img, lv)
    if t < L["intro"]:
        a = min(1.0, t / 0.15) * min(1.0, (L["intro"] - t) / 0.2)
        pop = ease_out(t / 0.3)
        return draw_texts(img, [
            (f"LEVEL {lv}", int(70 + 10 * pop), ORANGE, 300, a),
            (f"{L['n']:,} CUTS", int(120 + 40 * pop), WHITE, 420, a),
        ])
    cuts = cuts_at(lv, t)
    pieces = pieces_at(lv, t)
    ptxt = f"{pieces:,}" if lv == 1 or pieces == 0 else f"≈ {pieces:,}"
    done = t >= L["intro"] + L["cut"]
    big = 190 if not done else int(190 + 20 * ease_out((t - L["intro"] - L["cut"]) / 0.25))
    return draw_texts(img, [
        (f"{cuts:,}", big, WHITE, 230, 1),
        ("CUTS", 74, ORANGE, 355, 1),
        (ptxt, 92, WHITE, 1560, 1),
        (L["label"], 50, ORANGE, 1638, 1),
    ])


# ---------------------------------------------------------------- sound
def band_noise(n, lo, hi, rng):
    spec = np.fft.rfft(rng.normal(0, 1, n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    x = np.fft.irfft(spec, n)
    return x / (np.abs(x).max() + 1e-9)


def chop_variants(rng, k=8):
    out = []
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    for _ in range(k):
        f = rng.uniform(150, 230)
        tock = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.022)
        click = band_noise(n, 3000, 12000, rng) * np.exp(-t / 0.004)
        squelch = band_noise(n, 700, 3200, rng) * np.exp(-t / 0.03)
        out.append(0.8 * tock + 0.35 * click + 0.35 * squelch)
    return out


def ding(n_sec=0.9):
    t = np.arange(int(n_sec * SR)) / SR
    env = np.exp(-t / 0.25)
    return (np.sin(2 * np.pi * 1046 * t) + 0.5 * np.sin(2 * np.pi * 1568 * t)) * env * 0.35


def whoosh(rng, n_sec=0.45):
    n = int(n_sec * SR)
    t = np.arange(n) / SR
    env = np.sin(np.pi * t / n_sec) ** 2
    return band_noise(n, 400, 5000, rng) * env * 0.3


def build_audio(total, starts):
    rng = np.random.default_rng(11)
    buf = np.zeros(int(total * SR) + SR)
    variants = chop_variants(rng)
    bed = band_noise(len(buf), 1500, 9000, rng)
    bed_env = np.zeros(len(buf))
    dg = ding()
    for lv, t0 in starts.items():
        L = LEVELS[lv]
        times = cut_times(lv)
        w = whoosh(rng)
        i = int(t0 * SR)
        buf[i:i + len(w)] += w
        for j, tc in enumerate(times):
            # local cut rate controls loudness so dense chopping turns into a hiss
            nxt = times[min(j + 1, len(times) - 1)] - tc if j + 1 < len(times) else 0.5
            rate = 1 / max(nxt, 1e-3)
            g = 1.0 if rate < 4 else min(1.0, 2.2 / math.sqrt(rate))
            v = variants[rng.integers(len(variants))]
            s = int((t0 + tc) * SR)
            buf[s:s + len(v)] += v * g * rng.uniform(0.8, 1.0)
        if lv > 1:
            # rustle of falling cubes while the tomato falls apart
            a = int((t0 + times[int(len(times) * 0.45)]) * SR)
            b = int((t0 + L["intro"] + L["cut"]) * SR)
            bed_env[a:b] = np.linspace(0.05, 0.22, b - a)
        e = int((t0 + L["intro"] + L["cut"]) * SR)
        buf[e:e + len(dg)] += dg
    # smooth the bed envelope (10 ms)
    k = int(0.01 * SR)
    bed_env = np.convolve(bed_env, np.ones(k) / k, mode="same")
    buf += bed * bed_env
    buf = buf[: int(total * SR)]
    buf *= 0.89 / (np.abs(buf).max() + 1e-9)
    return buf


def write_wav(path, mono):
    st = np.repeat((mono * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(st.tobytes())


def main():
    frames_dir, out = sys.argv[1], sys.argv[2]
    fps3d = int(sys.argv[3]) if len(sys.argv) > 3 else 15
    starts, t = {}, 0.0
    for lv in LEVELS:
        starts[lv] = t
        t += duration(lv)
    total = t
    wav = out.rsplit(".", 1)[0] + ".wav"
    write_wav(wav, build_audio(total, starts))

    ff = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
        "-i", wav,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", out,
    ], stdin=subprocess.PIPE)
    cache = {}
    for lv in LEVELS:
        n = int(round(duration(lv) * FPS))
        for i in range(n):
            tl = i / FPS
            fi = min(int(tl * fps3d), int(round(duration(lv) * fps3d)) - 1)
            path = f"{frames_dir}/L{lv}_{fi:04d}.png"
            if path not in cache:
                cache.clear()
                cache[path] = Image.open(path).convert("RGBA").resize((W, H), Image.LANCZOS)
            img = overlay(cache[path].copy(), lv, tl)
            # white flash on the first frames of every level after the first
            if lv > 1 and i < 6:
                img = Image.blend(img, Image.new("RGBA", (W, H), (255, 255, 255, 255)), 0.55 * (1 - i / 6))
            ff.stdin.write(img.convert("RGB").tobytes())
    ff.stdin.close()
    ff.wait()
    print("done", out, total)


if __name__ == "__main__":
    main()
