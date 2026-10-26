"""Layer compositor for the Halloween edit: background plate + screen-blended titles/maps/props
(drawn on black) + transparent character sprites, with floor reflection, rim glow and bloom.

The same `compose()` call drives both the static mockups and (after approval) the animation.
"""
import math
import os
from functools import lru_cache

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
LAYERS = os.path.join(HERE, "assets", "layers")
W, H = 1080, 1920
SRC_H = 1672


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


@lru_cache(maxsize=128)
def load(name, crop_rows=None):
    """Load a layer as float RGB(A) at output scale (source frames are 9:16, scaled to 1080 wide)."""
    img = cv2.imread(os.path.join(LAYERS, name + ".png"), cv2.IMREAD_UNCHANGED)
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    if crop_rows:
        img = img.copy()
        y1 = crop_rows
        fade = np.clip((y1 - np.arange(img.shape[0])) / 12.0, 0, 1)[:, None, None]
        img = (img * fade).astype(img.dtype)
    k = W / img.shape[1]
    img = cv2.resize(img, (W, int(round(img.shape[0] * k))), interpolation=cv2.INTER_LANCZOS4)
    f = img.astype(np.float32) / 255
    if f.shape[2] == 4:
        f[..., :3] = f[..., 2::-1][..., :3] * f[..., 3:4]      # BGRA -> premultiplied RGBA
        f = np.dstack([f[..., :3], f[..., 3:4]])
    else:
        f = f[..., ::-1].copy()
    return f


def plate(name):
    img = load(name)
    if img.shape[0] < H:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_LINEAR)
    y0 = (img.shape[0] - H) // 2
    return img[y0:y0 + H].copy()


def place(src, cx, cy, scale=1.0, rot=0.0, sx=1.0, sy=1.0, anchor=None):
    """Affine-place a layer (any channels) on a W x H canvas. Layer centre (or `anchor` in layer px,
    defaults to its centre) lands on (cx, cy)."""
    h, w = src.shape[:2]
    ax, ay = anchor if anchor else (w / 2, h / 2)
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    m = np.array([[c * scale * sx, -s * scale * sy, 0], [s * scale * sx, c * scale * sy, 0]], np.float32)
    m[0, 2] = cx - (m[0, 0] * ax + m[0, 1] * ay)
    m[1, 2] = cy - (m[1, 0] * ax + m[1, 1] * ay)
    return cv2.warpAffine(src, m, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)


def screen(dst, layer, op=1.0):
    return 1 - (1 - dst) * (1 - np.clip(layer, 0, 1) * op)


def over(dst, prem, op=1.0):
    return prem[..., :3] * op + dst * (1 - prem[..., 3:4] * op)


def blur(img, s):
    if s > 12:
        f = int(s / 6)
        small = cv2.resize(img, (W // f, H // f), interpolation=cv2.INTER_AREA)
        return cv2.resize(cv2.GaussianBlur(small, (0, 0), s / f), (W, H))
    return cv2.GaussianBlur(img, (0, 0), s)


class Layer:
    """kind: 'screen' (image on black) or 'sprite' (transparent PNG) or 'raw' (callable(canvas) -> canvas)."""

    def __init__(self, name=None, kind="screen", cx=W / 2, cy=H / 2, scale=1.0, rot=0.0, sx=1.0, sy=1.0, op=1.0,
                 anchor=None, crop_rows=None, reflect=True, glow=None, fn=None, bottom_anchor=False, warp=None):
        self.__dict__.update(locals())
        del self.__dict__["self"]


@lru_cache(maxsize=128)
def content_center(name, crop_rows=None):
    img = load(name, crop_rows)
    m = img[..., 3] if img.shape[2] == 4 else img.max(-1)
    ys, xs = np.where(m > 0.15)
    return (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2


def sprite_bottom_anchor(img):
    a = img[..., 3]
    ys, xs = np.where(a > 0.5)
    return (xs.min() + xs.max()) / 2, ys.max()


@lru_cache(maxsize=1)
def _vignette():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    v = (xx / W - 0.5) ** 2 * 1.4 + (yy / H - 0.5) ** 2 * 1.1
    return (1 - smooth(0.15, 0.65, v) * 0.4)[..., None]


def compose(bg, layers, horizon, accent=(1, 1, 1), refl_k=0.5, bloom_k=0.45, vignette=True, post=None):
    """horizon: floor line in output px. Returns float RGB canvas."""
    acc = np.asarray(accent, np.float32)
    c = plate(bg)
    fg = np.zeros((H, W, 3), np.float32)      # everything above the floor, for the reflection
    fa = np.zeros((H, W, 1), np.float32)
    for L in layers:
        if L.kind == "raw":
            c = L.fn(c)
            continue
        src = load(L.name, L.crop_rows)
        if L.warp is not None:
            src = L.warp(src)
        anchor = L.anchor
        if L.bottom_anchor and L.kind == "sprite":
            anchor = sprite_bottom_anchor(src)
        elif anchor == "content":
            anchor = content_center(L.name, L.crop_rows)
        img = place(src, L.cx, L.cy, L.scale, L.rot, L.sx, L.sy, anchor)
        if L.kind == "key":
            # luminance-keyed text on black: solid letters over everything behind, glow added around
            m = smooth(0.06, 0.32, img.max(-1, keepdims=True))
            col = np.clip(img / np.maximum(img.max(-1, keepdims=True), 1e-3) * np.maximum(img.max(-1, keepdims=True), 0.85), 0, 1)
            shadow = blur(m, 10)[..., None] * 0.75
            c = c * (1 - shadow * L.op)
            if L.glow:
                c = c + blur(img, L.glow) * 0.45 * L.op
            c = c * (1 - m * L.op) + col * m * L.op
            if L.reflect:
                fg = fg * (1 - m * L.op) + col * m * L.op
                fa = np.maximum(fa, m * L.op)
            continue
        if L.kind == "screen":
            if L.glow:
                c = c + blur(img, L.glow) * 0.5 * L.op
            c = screen(c, img, L.op)
            if L.reflect:
                fg = screen(fg, img, L.op)
                fa = np.maximum(fa, img.max(-1, keepdims=True) * L.op)
        else:
            a = img[..., 3:4]
            # rim light in scene accent + soft outer glow
            edge = np.clip(a - cv2.erode(a, np.ones((9, 9), np.uint8))[..., None], 0, 1)
            if L.glow:
                c = c + blur(a * acc, L.glow) * 0.55 * L.op
            c = over(c, img, L.op)
            c = c + edge * acc * 0.35 * L.op
            if L.reflect:
                fg = over(fg, img, L.op)
                fa = a * L.op + fa * (1 - a * L.op)
    # floor reflection of the foreground (title, map, props, characters)
    if refl_k > 0:
        hr = H - int(horizon)
        src_rgb = fg[int(horizon) - hr:int(horizon)][::-1]
        src_a = fa[int(horizon) - hr:int(horizon)][::-1]
        d = np.linspace(0, 1, hr, dtype=np.float32)[:, None, None]
        k = refl_k * np.exp(-d * 2.4)
        src_rgb = cv2.GaussianBlur(src_rgb, (0, 0), 1.5)
        src_a = cv2.GaussianBlur(src_a, (0, 0), 1.5)[..., None]
        seg = c[int(horizon):]
        c[int(horizon):] = seg * (1 - src_a * k * 0.8) + src_rgb * k
    if post:
        c = post(c)
    if bloom_k:
        small = cv2.resize(c, (W // 4, H // 4), interpolation=cv2.INTER_AREA)
        b = np.clip(small - 0.65, 0, None)
        b = cv2.GaussianBlur(b, (0, 0), 5) + cv2.GaussianBlur(b, (0, 0), 18) * 0.8
        c = c + cv2.resize(b, (W, H)) * bloom_k
    if vignette:
        c = c * _vignette()
    return np.clip(c, 0, 1)


def contact_shadow(cx, horizon, width, k=0.7):
    def fn(c):
        m = np.zeros((H, W), np.float32)
        cv2.ellipse(m, (int(cx), int(horizon)), (int(width / 2), int(width * 0.06)), 0, 0, 360, 1, -1)
        m = cv2.GaussianBlur(m, (0, 0), width * 0.04)
        return c * (1 - m[..., None] * k)
    return Layer(kind="raw", fn=fn)


def trails(paths, cols, w0=3, w1=40):
    """Glowing tapered trails (list of point arrays) drawn additively."""
    def fn(c):
        lay = np.zeros((H, W, 3), np.float32)
        for pts, col in zip(paths, cols):
            n = len(pts)
            for i in range(n - 1):
                k = i / (n - 1)
                cv2.line(lay, tuple(int(v) for v in pts[i]), tuple(int(v) for v in pts[i + 1]),
                         tuple(float(v) * (0.1 + 0.9 * k) for v in col), int(w0 + (w1 - w0) * k), cv2.LINE_AA)
        return c + lay * 0.7 + blur(lay, 10) * 0.9 + blur(lay, 40) * 0.7
    return Layer(kind="raw", fn=fn)


def bezier(p0, p1, p2, n=48):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2 = map(np.asarray, (p0, p1, p2))
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2


def claws(prog=1.0, col=(0.75, 1.0, 0.35)):
    def fn(c):
        lay = np.zeros((H, W, 3), np.float32)
        for i in range(3):
            a = np.array([560 + i * 230, -120 + i * 30.0])
            b = np.array([-140 + i * 230, H * 0.9 - i * 40.0])
            pts = [a + (b - a) * s * prog for s in np.linspace(0, 1, 32)]
            for j in range(31):
                th = int(3 + 58 * math.sin(math.pi * j / 31) ** 0.8)
                cv2.line(lay, tuple(int(v) for v in pts[j]), tuple(int(v) for v in pts[j + 1]), col, th, cv2.LINE_AA)
        m = lay.max(-1, keepdims=True)
        return c * (1 - m * 0.7) + np.clip(lay * 1.5, 0, 1) * m + blur(lay, 14) * 1.1 + blur(lay, 50) * 0.8
    return Layer(kind="raw", fn=fn)


def tint(col, k):
    def fn(c):
        return c * (1 - k) + np.asarray(col, np.float32) * k
    return Layer(kind="raw", fn=fn)


def save(img, path):
    cv2.imwrite(path, (img[..., ::-1] * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 94])
