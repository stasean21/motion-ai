"""Core compositing, text, geo and flag textures for the Halloween countryballs video."""
import json
import math
import os
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
W, H = 1080, 1920
FLOOR_Y = 1470

FONT_TITLE = os.path.join(ASSETS, "fonts", "luckiest-guy.woff")
FONT_SPOOKY = os.path.join(ASSETS, "fonts", "creepster.woff")


def rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)


PAL = {
    "orange": rgb("ff7a18"), "acid": rgb("8cff2e"), "purple": rgb("a83cff"),
    "red": rgb("ff2340"), "ice": rgb("8fe8ff"), "gold": rgb("ffc83a"),
    "green": rgb("2bd94f"), "white": rgb("ffffff"), "sand": rgb("e8c27a"),
}


# ---------------------------------------------------------------- compositing
def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def comp(canvas, spr, x, y, op=1.0):
    """Composite premultiplied RGBA sprite onto RGB canvas with top-left at (x, y)."""
    h, w = spr.shape[:2]
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, canvas.shape[1]), min(y + h, canvas.shape[0])
    if x0 >= x1 or y0 >= y1:
        return
    s = spr[y0 - y:y1 - y, x0 - x:x1 - x]
    d = canvas[y0:y1, x0:x1]
    d[:] = s[..., :3] * op + d * (1 - s[..., 3:4] * op)


def add(canvas, img, x=0, y=0, k=1.0):
    h, w = img.shape[:2]
    x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, canvas.shape[1]), min(y + h, canvas.shape[0])
    if x0 >= x1 or y0 >= y1:
        return
    canvas[y0:y1, x0:x1] += img[y0 - y:y1 - y, x0 - x:x1 - x, :3] * k


def blur(img, sigma):
    if sigma <= 0.3:
        return img
    # blur at reduced resolution for large radii (fast, visually identical for glows)
    if sigma > 12:
        f = max(1, int(sigma / 6))
        h, w = img.shape[:2]
        small = cv2.resize(img, (max(1, w // f), max(1, h // f)), interpolation=cv2.INTER_AREA)
        small = cv2.GaussianBlur(small, (0, 0), sigma / f)
        return cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR)
    return cv2.GaussianBlur(img, (0, 0), sigma)


def glow(canvas, emis, x=0, y=0, sigmas=(6, 22, 60), ks=(0.9, 0.7, 0.5)):
    pad = int(sigmas[-1] * 2.5)
    e = cv2.copyMakeBorder(emis[..., :3], pad, pad, pad, pad, cv2.BORDER_CONSTANT, value=0)
    acc = np.zeros_like(e)
    for s, k in zip(sigmas, ks):
        acc += blur(e, s) * k
    add(canvas, acc, x - pad, y - pad)


def to_prem(img_rgba_u8):
    a = img_rgba_u8.astype(np.float32) / 255
    a[..., :3] *= a[..., 3:4]
    return a


def scale_sprite(spr, k):
    h, w = spr.shape[:2]
    return cv2.resize(spr, (max(1, int(w * k)), max(1, int(h * k))), interpolation=cv2.INTER_AREA)


def transform_sprite(spr, sx=1.0, sy=1.0, rot=0.0, anchor=None):
    """Scale/rotate a sprite around anchor (default: centre). Output keeps same size."""
    h, w = spr.shape[:2]
    ax, ay = anchor if anchor else (w / 2, h / 2)
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    m = np.array([[c * sx, -s * sy, 0], [s * sx, c * sy, 0]], np.float32)
    m[:, 2] = [ax - (m[0, 0] * ax + m[0, 1] * ay), ay - (m[1, 0] * ax + m[1, 1] * ay)]
    return cv2.warpAffine(spr, m, (w, h), flags=cv2.INTER_LINEAR, borderValue=0)


# ---------------------------------------------------------------------- text
@lru_cache(maxsize=64)
def _font(path, size):
    return ImageFont.truetype(path, int(size))


def text_sprite(txt, font, size, fill_top, fill_bot, stroke=(0.03, 0.0, 0.05), stroke_w=8,
                max_w=None, spacing=0.92, tracking=0):
    """Returns (premult RGBA sprite, fill mask) for multi-line centered text."""
    if max_w:
        while True:
            f = _font(font, size)
            widest = max(f.getbbox(l, stroke_width=stroke_w)[2] for l in txt.split("\n"))
            if widest <= max_w or size < 20:
                break
            size *= 0.95
    f = _font(font, size)
    lines = txt.split("\n")
    lh = int(size * spacing)
    widths = [f.getbbox(l, stroke_width=stroke_w)[2] for l in lines]
    tw, th = max(widths) + stroke_w * 4, lh * len(lines) + int(size * 0.35) + stroke_w * 4
    fill = Image.new("L", (tw, th), 0)
    strk = Image.new("L", (tw, th), 0)
    df, ds = ImageDraw.Draw(fill), ImageDraw.Draw(strk)
    for i, l in enumerate(lines):
        x = (tw - widths[i]) / 2 + stroke_w
        y = stroke_w * 2 + i * lh
        ds.text((x, y), l, font=f, fill=255, stroke_width=stroke_w, stroke_fill=255)
        df.text((x, y), l, font=f, fill=255)
    fm = np.asarray(fill, np.float32)[..., None] / 255
    sm = np.asarray(strk, np.float32)[..., None] / 255
    g = np.linspace(0, 1, th, dtype=np.float32)[:, None, None]
    col = fill_top * (1 - g) + fill_bot * g
    out = np.zeros((th, tw, 4), np.float32)
    out[..., :3] = col * fm + np.asarray(stroke, np.float32) * (sm - fm).clip(0)
    out[..., 3:4] = sm
    return out, fm


def draw_text(canvas, txt, cx, cy, font, size, top, bot, glow_col=None, glow_k=1.0, scale=1.0,
              max_w=980, op=1.0, stroke_w=8, rot=0.0):
    spr, fm = text_sprite(txt, font, size, top, bot, stroke_w=stroke_w, max_w=max_w)
    if scale != 1.0 or rot:
        spr = transform_sprite(scale_sprite(spr, 1), scale, scale, rot)
        fm = transform_sprite(fm, scale, scale, rot)[..., None] if fm.ndim == 3 else fm
    h, w = spr.shape[:2]
    x, y = cx - w / 2, cy - h / 2
    if glow_col is not None:
        e = np.zeros((h, w, 3), np.float32)
        e[:] = glow_col
        glow(canvas, e * fm.reshape(h, w, 1) * glow_k * op, x, y, sigmas=(8, 30, 80), ks=(0.6, 0.55, 0.45))
    comp(canvas, spr, x, y, op)


# ------------------------------------------------------------------- shapes
def chaikin(pts, n=3, closed=True):
    pts = np.asarray(pts, np.float32)
    for _ in range(n):
        p = np.roll(pts, -1, 0) if closed else pts[1:]
        q = pts if closed else pts[:-1]
        a, b = q * 0.75 + p * 0.25, q * 0.25 + p * 0.75
        pts = np.stack([a, b], 1).reshape(-1, 2)
        if not closed:
            pts = np.vstack([q[:1], pts, p[-1:]])
    return pts


class Canvas2x:
    """Local supersampled RGBA drawing surface in normalized character units."""

    def __init__(self, R, extent=1.9, ss=2):
        self.R, self.ss = R, ss
        self.size = int(2 * extent * R)
        self.c = self.size / 2
        self.img = Image.new("RGBA", (self.size * ss, self.size * ss), (0, 0, 0, 0))
        self.emis = Image.new("RGB", (self.size * ss, self.size * ss), (0, 0, 0))
        self.d = ImageDraw.Draw(self.img)
        self.de = ImageDraw.Draw(self.emis)

    def P(self, x, y):
        k = self.R * self.ss
        return (self.c * self.ss + x * k, self.c * self.ss + y * k)

    def pts(self, pts):
        return [self.P(x, y) for x, y in pts]

    def poly(self, pts, fill, outline=None, ow=0.03, smooth_n=0, emis=None, closed=True):
        if smooth_n:
            pts = chaikin(pts, smooth_n, closed)
        pp = self.pts(pts)
        if outline is not None:
            w = max(1, int(ow * self.R * self.ss))
            self.d.polygon(pp, fill=outline)
            self.d.line(pp + [pp[0]], fill=outline, width=w * 2, joint="curve")
        self.d.polygon(pp, fill=fill)
        if emis is not None:
            self.de.polygon(pp, fill=emis)

    def ellipse(self, cx, cy, rx, ry, fill, outline=None, ow=0.03, emis=None):
        x0, y0 = self.P(cx - rx, cy - ry)
        x1, y1 = self.P(cx + rx, cy + ry)
        if outline is not None:
            w = ow * self.R * self.ss
            self.d.ellipse((x0 - w, y0 - w, x1 + w, y1 + w), fill=outline)
        self.d.ellipse((x0, y0, x1, y1), fill=fill)
        if emis is not None:
            self.de.ellipse((x0, y0, x1, y1), fill=emis)

    def line(self, pts, fill, w=0.03, emis=None):
        pp = self.pts(pts)
        lw = max(1, int(w * self.R * self.ss))
        self.d.line(pp, fill=fill, width=lw, joint="curve")
        if emis is not None:
            self.de.line(pp, fill=emis, width=lw, joint="curve")

    def paste_np(self, prem):
        """Alpha-composite a premultiplied float array (size*ss square) onto the surface."""
        a = prem[..., 3:4]
        un = np.where(a > 1e-4, prem[..., :3] / np.maximum(a, 1e-4), 0)
        u8 = (np.concatenate([un, a], -1).clip(0, 1) * 255).astype(np.uint8)
        self.img = Image.alpha_composite(self.img, Image.fromarray(u8, "RGBA"))
        self.d = ImageDraw.Draw(self.img)

    def result(self):
        s = self.size
        img = cv2.resize(np.asarray(self.img), (s, s), interpolation=cv2.INTER_AREA)
        em = cv2.resize(np.asarray(self.emis), (s, s), interpolation=cv2.INTER_AREA)
        return to_prem(img), em.astype(np.float32) / 255


def col8(c, a=1.0):
    c = np.asarray(c, np.float32)
    return tuple(int(v * 255) for v in c.clip(0, 1)) + (int(a * 255),)


# ---------------------------------------------------------------------- geo
@lru_cache(maxsize=4)
def _topo(name):
    with open(os.path.join(ASSETS, "geo", name)) as fh:
        d = json.load(fh)
    sx, sy = d["transform"]["scale"]
    tx, ty = d["transform"]["translate"]
    arcs = []
    for arc in d["arcs"]:
        a = np.cumsum(np.asarray(arc, np.float64), 0)
        arcs.append(np.c_[a[:, 0] * sx + tx, a[:, 1] * sy + ty])
    return d, arcs


def _ring(arcs, idx):
    pts = []
    for i in idx:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.append(a if not pts else a[1:])
    return np.vstack(pts)


def _polys(geom, arcs):
    if geom["type"] == "Polygon":
        return [[_ring(arcs, r) for r in geom["arcs"]]]
    if geom["type"] == "MultiPolygon":
        return [[_ring(arcs, r) for r in p] for p in geom["arcs"]]
    return []


def _area(r):
    x, y = r[:, 0], r[:, 1]
    return abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1))) / 2


@lru_cache(maxsize=16)
def country_rings(name, keep=1, min_rel=0.0, bbox=None):
    d, arcs = _topo("countries-50m.json")
    g = next(x for x in d["objects"]["countries"]["geometries"] if x["properties"]["name"] == name)
    outer = [p[0] for p in _polys(g, arcs)]
    if bbox:
        outer = [r for r in outer if bbox[0] <= r[:, 0].mean() <= bbox[2] and bbox[1] <= r[:, 1].mean() <= bbox[3]]
    outer.sort(key=_area, reverse=True)
    big = _area(outer[0])
    return tuple(r for r in outer[:keep] if _area(r) >= big * min_rel)


@lru_cache(maxsize=16)
def silhouette_mask(name, height, keep=1, min_rel=0.0, bbox=None):
    rings = country_rings(name, keep, min_rel, bbox)
    allp = np.vstack(rings)
    lat0 = math.radians(allp[:, 1].mean())
    proj = [np.c_[r[:, 0] * math.cos(lat0), -r[:, 1]] for r in rings]
    allq = np.vstack(proj)
    mn, mx = allq.min(0), allq.max(0)
    k = height / (mx[1] - mn[1])
    w = int((mx[0] - mn[0]) * k) + 8
    ss = 2
    img = Image.new("L", (w * ss, (int(height) + 8) * ss), 0)
    dr = ImageDraw.Draw(img)
    for q in proj:
        pp = [((x - mn[0]) * k * ss + 4 * ss, (y - mn[1]) * k * ss + 4 * ss) for x, y in q]
        dr.polygon(pp, fill=255)
    m = np.asarray(img.resize((w, int(height) + 8), Image.LANCZOS), np.float32) / 255
    return m


@lru_cache(maxsize=2)
def earth_texture(w=2048, h=1024):
    d, arcs = _topo("land-110m.json")
    img = Image.new("L", (w, h), 0)
    dr = ImageDraw.Draw(img)
    for g in d["objects"]["land"]["geometries"]:
        for poly in _polys(g, arcs):
            r = poly[0].copy()
            lon = np.unwrap(np.radians(r[:, 0]))
            lon = np.degrees(lon)
            if lon.max() - lon.min() > 340:
                continue
            for off in (-360, 0, 360):
                dr.polygon([((x + off + 180) / 360 * w, (90 - y) / 180 * h) for x, y in zip(lon, r[:, 1])], fill=255)
    land = np.asarray(img, np.float32) / 255
    land = cv2.GaussianBlur(land, (0, 0), 1.2)
    rng = np.random.default_rng(3)
    noise = cv2.GaussianBlur(rng.random((h // 8, w // 8)).astype(np.float32), (0, 0), 2)
    noise = cv2.resize(noise, (w, h))
    lat = np.linspace(90, -90, h, dtype=np.float32)[:, None]
    ocean = np.dstack([0.07 + 0 * noise, 0.36 + 0.08 * noise, 0.85 + 0.1 * noise])
    grn = np.dstack([0.22 + 0.15 * noise, 0.62 + 0.15 * noise, 0.22 + 0.05 * noise])
    desert = np.array([0.78, 0.66, 0.38], np.float32)
    dz = smooth(12, 22, np.abs(lat)) * (1 - smooth(32, 40, np.abs(lat))) * smooth(0.45, 0.6, noise)
    grn = grn * (1 - dz[..., None]) + desert * dz[..., None]
    tex = ocean * (1 - land[..., None]) + grn * land[..., None]
    ice = smooth(68, 78, np.abs(lat))[..., None]
    tex = tex * (1 - ice) + 0.95 * ice
    return tex.astype(np.float32)


# -------------------------------------------------------------------- flags
def _star(dr, cx, cy, r, fill, rot=-90):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.4
        a = math.radians(rot + i * 36)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    dr.polygon(pts, fill=fill)


@lru_cache(maxsize=16)
def flag(name, w=900, h=600):
    img = Image.new("RGB", (w, h), (255, 255, 255))
    d = ImageDraw.Draw(img)
    if name == "brazil":
        d.rectangle((0, 0, w, h), fill=(0, 156, 59))
        d.polygon([(w * 0.08, h / 2), (w / 2, h * 0.1), (w * 0.92, h / 2), (w / 2, h * 0.9)], fill=(255, 223, 0))
        r = h * 0.26
        d.ellipse((w / 2 - r, h / 2 - r, w / 2 + r, h / 2 + r), fill=(0, 39, 118))
        band = Image.new("L", (w, h), 0)
        bd = ImageDraw.Draw(band)
        bx, by, br = w / 2 - r * 0.4, h / 2 + r * 2.4, r * 2.55
        bd.ellipse((bx - br, by - br, bx + br, by + br), outline=255, width=int(h * 0.045))
        circ = Image.new("L", (w, h), 0)
        ImageDraw.Draw(circ).ellipse((w / 2 - r, h / 2 - r, w / 2 + r, h / 2 + r), fill=255)
        from PIL import ImageChops
        img.paste((255, 255, 255), mask=ImageChops.multiply(band, circ))
        rng = np.random.default_rng(7)
        for _ in range(14):
            a, rr = rng.random() * math.pi * 2, rng.random() * r * 0.8
            x, y = w / 2 + math.cos(a) * rr, h / 2 + abs(math.sin(a)) * rr * 0.9
            _star(d, x, y, h * 0.012, (255, 255, 255))
    elif name == "usa":
        for i in range(13):
            d.rectangle((0, i * h / 13, w, (i + 1) * h / 13), fill=(178, 34, 52) if i % 2 == 0 else (255, 255, 255))
        cw, ch = w * 0.42, h * 7 / 13
        d.rectangle((0, 0, cw, ch), fill=(60, 59, 110))
        for r in range(9):
            for c in range(11 if r % 2 == 0 else 10):
                x = cw * (c + (0.5 if r % 2 == 0 else 1.0)) / 11.2
                y = ch * (r + 0.6) / 9.4
                _star(d, x, y, h * 0.018, (255, 255, 255))
    elif name == "uk":
        d.rectangle((0, 0, w, h), fill=(1, 33, 105))
        t = h * 0.2
        d.line((0, 0, w, h), fill=(255, 255, 255), width=int(t))
        d.line((0, h, w, 0), fill=(255, 255, 255), width=int(t))
        tr = h * 0.067
        o = tr * 0.6
        d.line((0, -o, w / 2, h / 2 - o), fill=(200, 16, 46), width=int(tr))
        d.line((w / 2, h / 2 + o, w, h + o), fill=(200, 16, 46), width=int(tr))
        d.line((0, h + o, w / 2, h / 2 + o), fill=(200, 16, 46), width=int(tr))
        d.line((w / 2, h / 2 - o, w, -o), fill=(200, 16, 46), width=int(tr))
        d.rectangle((w / 2 - h / 6, 0, w / 2 + h / 6, h), fill=(255, 255, 255))
        d.rectangle((0, h / 2 - h / 6, w, h / 2 + h / 6), fill=(255, 255, 255))
        d.rectangle((w / 2 - h / 10, 0, w / 2 + h / 10, h), fill=(200, 16, 46))
        d.rectangle((0, h / 2 - h / 10, w, h / 2 + h / 10), fill=(200, 16, 46))
    elif name == "japan":
        r = h * 0.3
        d.ellipse((w / 2 - r, h / 2 - r, w / 2 + r, h / 2 + r), fill=(188, 0, 45))
    elif name == "egypt":
        d.rectangle((0, 0, w, h / 3), fill=(206, 17, 38))
        d.rectangle((0, h * 2 / 3, w, h), fill=(20, 20, 20))
        g = (192, 147, 0)
        cx, cy, s = w / 2, h / 2, h * 0.13
        d.polygon([(cx - s * 1.5, cy - s * 0.3), (cx - s * 0.3, cy - s * 0.1), (cx, cy - s * 0.9),
                   (cx + s * 0.3, cy - s * 0.1), (cx + s * 1.5, cy - s * 0.3), (cx + s * 0.6, cy + s * 0.9),
                   (cx, cy + s * 1.2), (cx - s * 0.6, cy + s * 0.9)], fill=g)
    elif name == "romania":
        d.rectangle((0, 0, w / 3, h), fill=(0, 43, 127))
        d.rectangle((w / 3, 0, w * 2 / 3, h), fill=(252, 209, 22))
        d.rectangle((w * 2 / 3, 0, w, h), fill=(206, 17, 38))
    return np.asarray(img, np.float32) / 255


# -------------------------------------------------------------- sphere shader
def sphere(R, tex_fn, light=(-0.45, -0.6, 0.66), rim=(1, 1, 1), rim_k=0.6, spec_k=0.55,
           outline=0.035, ss=2, extent=1.0):
    """Shade a sphere of radius R; tex_fn(nx, ny, nz) -> rgb array. Returns premult RGBA (2R*extent)."""
    n = int(2 * R * extent * ss)
    c = n / 2
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    nx, ny = (xx + 0.5 - c) / (R * ss), (yy + 0.5 - c) / (R * ss)
    d2 = nx * nx + ny * ny
    inside = d2 < 1
    nz = np.sqrt(np.clip(1 - d2, 0, 1))
    col = tex_fn(nx.clip(-1, 1), ny.clip(-1, 1), nz)
    L = np.asarray(light, np.float32)
    L = L / np.linalg.norm(L)
    diff = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    Hh = L + np.array([0, 0, 1], np.float32)
    Hh /= np.linalg.norm(Hh)
    spec = np.clip(nx * Hh[0] + ny * Hh[1] + nz * Hh[2], 0, 1) ** 60 * spec_k
    shade = 0.42 + 0.7 * diff
    ao = 1 - 0.35 * smooth(0.3, 1.0, ny) * smooth(0.0, 1.0, d2)
    out = col * (shade * ao)[..., None] + spec[..., None]
    out += np.asarray(rim, np.float32) * ((1 - nz) ** 3 * rim_k * smooth(-0.6, 0.6, ny * 0.3 + nx * -0.5 + 0.4))[..., None]
    r = np.sqrt(d2)
    ring = smooth(1 - outline - 0.008, 1 - outline, r)
    out = out * (1 - ring[..., None]) + 0.03 * ring[..., None]
    a = 1 - smooth(1 - 0.6 / (R * ss), 1 + 0.6 / (R * ss), r)
    rgba = np.dstack([out.clip(0, 1.5) * a[..., None], a]).astype(np.float32)
    return cv2.resize(rgba, (n // ss, n // ss), interpolation=cv2.INTER_AREA)


CROP_X = {"usa": 0.42, "brazil": 0.5, "uk": 0.5}


def flag_mapper(tex, spread=1.0, ribs=0, rib_k=0.0, tint=None, tint_k=0.0, cx=0.5, span=None, wrap=1.0):
    """Square crop of the flag (centre cx) mapped onto the front hemisphere."""
    th, tw = tex.shape[:2]
    span = th / tw if span is None else span

    def fn(nx, ny, nz):
        # wrap=1: true sphere wrap, wrap=0: flat decal (classic countryball look)
        ax, ay = np.arcsin(nx) / math.pi, np.arcsin(ny) / math.pi
        ax, ay = ax * wrap + nx * 0.5 * (1 - wrap), ay * wrap + ny * 0.5 * (1 - wrap)
        u = cx + ax * spread * span
        v = 0.5 + ay * spread
        mx = (u * (tw - 1)).astype(np.float32)
        my = (v * (th - 1)).astype(np.float32)
        col = cv2.remap(tex, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        if tint is not None:
            col = col * (1 - tint_k) + col * np.asarray(tint, np.float32) * tint_k * 1.25
        if ribs:
            lon = np.arcsin(nx)
            band = np.abs(np.cos(lon * ribs * 0.5)) ** 0.35
            col = col * (1 - rib_k + rib_k * band)[..., None]
        return col
    return fn


def earth_mapper(yaw=10.0, pitch=18.0):
    tex = earth_texture()
    th, tw = tex.shape[:2]
    cy, sy = math.cos(math.radians(yaw)), math.sin(math.radians(yaw))
    cp, sp = math.cos(math.radians(pitch)), math.sin(math.radians(pitch))

    def fn(nx, ny, nz):
        # rotate view normal into globe frame: pitch (around x) then yaw (around y)
        y1 = -ny * cp + nz * sp
        z1 = ny * sp + nz * cp
        x2 = nx * cy + z1 * sy
        z2 = -nx * sy + z1 * cy
        lat = np.arcsin(np.clip(y1, -1, 1))
        lon = np.arctan2(x2, z2)
        mx = ((lon / math.pi + 1) / 2 * (tw - 1)).astype(np.float32)
        my = ((0.5 - lat / math.pi) * (th - 1)).astype(np.float32)
        return cv2.remap(tex, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
    return fn
