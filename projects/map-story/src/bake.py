# Bakes Mercator map plates from the Blue Marble textures (equirectangular) for the HTML scenes.
# usage: python3 -I bake.py  → ../plates/<name>_{sat|hist|fog}.png + plates.js (projection params per plate)
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__)); TEX = HERE + '/tex'; OUT = HERE + '/plates'; os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
SS = 2                                                 # bake at 2× and downsample: crisper coasts
col = np.asarray(Image.open(TEX + '/earth_color_4096x2048.jpg').convert('RGB'), np.float32) / 255
sea = np.asarray(Image.open(TEX + '/earth_landocean_4050x2025.png').convert('L').resize((4096, 2048), Image.BILINEAR), np.float32) / 255
topo = np.asarray(Image.open(TEX + '/topography_2048x1024.png').convert('L').resize((4096, 2048), Image.BICUBIC), np.float32) / 255
cld = np.asarray(Image.open(TEX + '/earth_clouds_4096x2048.jpg').convert('L'), np.float32) / 255
TW, TH = 4096, 2048

def grid(lon0, lat0, width_deg):
    """Mercator with centre (lon0, lat0), `width_deg` across the 1080 px frame. Same maths as d3.geoMercator."""
    k = W / np.radians(width_deg)
    ty = H / 2 + k * np.log(np.tan(np.pi / 4 + np.radians(lat0) / 2)); tx = W / 2 - k * np.radians(lon0)
    xs = (np.arange(W * SS) + .5) / SS; ys = (np.arange(H * SS) + .5) / SS
    lon = np.degrees((xs - tx) / k); lat = np.degrees(2 * np.arctan(np.exp((ty - ys) / k)) - np.pi / 2)
    LON, LAT = np.meshgrid(lon, lat)
    c = ((LON + 180) % 360) / 360 * TW - .5; r = (90 - LAT) / 180 * TH - .5
    return dict(k=float(k), tx=float(tx), ty=float(ty)), (r, c)

def samp(img, rc, order=1):
    if img.ndim == 2: return nd.map_coordinates(img, rc, order=order, mode='nearest')
    return np.stack([nd.map_coordinates(img[..., i], rc, order=order, mode='nearest') for i in range(img.shape[2])], -1)

def hillshade(z, px_deg, strength=6.):
    gy, gx = np.gradient(z * strength / px_deg * 40)
    lx, ly, lz = -.6, -.6, .55; n = np.sqrt(gx ** 2 + gy ** 2 + 1)
    return np.clip((-gx * lx - gy * ly + lz) / n / np.sqrt(lx ** 2 + ly ** 2 + lz ** 2), 0, 1)

def noise(shape, scale, seed):
    g = np.random.default_rng(seed).standard_normal((shape[0] // scale + 2, shape[1] // scale + 2)).astype(np.float32)
    return nd.zoom(g, scale, order=3)[:shape[0], :shape[1]]

def mix(a, b, t): t = t[..., None] if np.ndim(t) == 2 else t; return a * (1 - t) + b * t
def hexc(h): return np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], np.float32)
def save(a, name):
    im = Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)); im = im.resize((W, H), Image.LANCZOS); im.save(f'{OUT}/{name}.png')

def bake(name, lon0, lat0, width, styles):
    P, rc = grid(lon0, lat0, width)
    s = samp(sea, rc); land = 1 - np.clip((s - .35) / .3, 0, 1)            # 1 = land
    z = samp(topo, rc, 3); px_deg = W * SS / width
    sh = hillshade(z, px_deg); sh = np.where(land > .5, sh, .7)
    lab, n = nd.label(land > .5); sz = nd.sum(np.ones_like(land), lab, range(1, n + 1))
    big = np.isin(lab, 1 + np.flatnonzero(sz > (1.2 * px_deg) ** 2))         # specks and tiny islands get no halo
    dist = nd.distance_transform_edt(~big) / px_deg                        # degrees from the coast (ocean only)
    if 'sat' in styles:
        c = samp(col, rc); c = np.clip(c * 1.18, 0, 1) ** .82
        lum = c.mean(-1, keepdims=True); c = np.clip(lum + (c - lum) * 1.12, 0, 1)
        c *= (.78 + .42 * sh)[..., None]
        d = np.clip(dist / 5, 0, 1) ** .7
        oc = mix(hexc('#2d6f9c'), hexc('#0c2c52'), d) * (1 + .035 * noise(d.shape, 90, 1))[..., None]
        shelf = np.exp(-dist / .12)[..., None] * .16                          # bright shallow shelf right at the coast
        oc = np.clip(oc + shelf * hexc('#9fe0ea'), 0, 1)
        save(mix(oc, c, land), name + '_sat')
    if 'hist' in styles:
        c = samp(col, rc); lum = c.mean(-1)
        e = np.clip(z * 2.2, 0, 1)
        base = mix(hexc('#e2d2ac'), hexc('#bfa274'), e) * (.9 + .25 * (lum - lum.mean()))[..., None]
        base *= (.7 + .45 * sh)[..., None]
        coast = np.exp(-nd.distance_transform_edt(land > .5) / px_deg / .08)[..., None]   # inked coastline
        base = mix(base, hexc('#6d5a3e'), coast[..., 0] * .55)
        d = np.clip(dist / 6, 0, 1)
        oc = mix(hexc('#86aeac'), hexc('#4d7c84'), d)
        halo = np.exp(-dist / .1)[..., None] * .12; oc = np.clip(oc + halo, 0, 1)
        img = mix(oc, base, land)
        paper = 1 + .045 * noise(land.shape, 160, 3) + .03 * noise(land.shape, 24, 4) + .02 * np.random.default_rng(5).standard_normal(land.shape)
        save(np.clip(img * paper[..., None], 0, 1), name + '_hist')
    if 'fog' in styles:                                                     # storm-grey clouds for reveals (RGBA)
        cl = samp(cld, rc); n = noise(cl.shape, 220, 7) * .5 + noise(cl.shape, 60, 8) * .25
        a = np.clip(.62 + cl * .5 + n * .35, 0, 1)
        rgb = mix(hexc('#3c4654'), hexc('#a7afb9'), np.clip(cl * 1.2 + n * .5 + .2, 0, 1))
        im = np.concatenate([rgb, a[..., None]], -1); save(im, name + '_fog')
    return P

import sys
ONLY = sys.argv[1:]
PL = json.loads(open(OUT + '/plates.js').read()[13:-2]) if os.path.exists(OUT + '/plates.js') else {}
if not ONLY or 'intro' in ONLY: PL['intro'] = bake('intro', -55, -16, 68, ['sat'])
if not ONLY or 'voyage' in ONLY: PL['voyage'] = bake('voyage', 22, 4, 118, ['hist', 'fog'])
if not ONLY or 'treaty' in ONLY: PL['treaty'] = bake('treaty', -24, 14, 104, ['hist'])
if not ONLY or 'iberia' in ONLY: PL['iberia'] = bake('iberia', -4.5, 40, 17, ['hist'])
if 'europe' in ONLY: PL['europe'] = bake('europe', 5.5, 50.5, 34, ['sat'])
if 'benelux' in ONLY: PL['benelux'] = bake('benelux', 4.6, 51.0, 13, ['sat'])
open(OUT + '/plates.js', 'w').write('const PLATES=' + json.dumps(PL) + ';\n')
print(json.dumps(PL))
