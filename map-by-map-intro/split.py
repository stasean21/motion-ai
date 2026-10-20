# Разбор обложки на анимируемые части: материки/острова по отдельности, ободки, разделитель, Антарктида.
# Альфа по проекции цвета на ось «фон → цвет слоя» — сглаженные края сохраняются.
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

im = np.asarray(Image.open('cover.jpg').convert('RGB')).astype(np.float32)
H, W, _ = im.shape
BG = np.array([16, 28, 50], np.float32)
COLS = {'tq': [46, 217, 211], 'or': [250, 141, 50], 'wh': [247, 240, 232]}
d = im - BG
alpha = {}
for k, c in COLS.items():
    v = np.array(c, np.float32) - BG
    a = (d @ v) / (v @ v)
    # отсекаем пиксели, чей цвет уходит от оси слоя (чтобы оранжевый не попал в белый и наоборот)
    resid = np.linalg.norm(d - a[..., None] * v, axis=2)
    alpha[k] = np.clip(a, 0, 1) * (resid < 70)
stack = np.stack([alpha[k] for k in COLS])
win = stack.argmax(0)
keys = list(COLS)
A = {k: np.where(win == i, stack[i], 0) for i, k in enumerate(keys)}

CX, CY, R = 896, 494, 407
yy, xx = np.mgrid[0:H, 0:W]
rad = np.hypot(xx - CX, yy - CY)

# разделитель: уточняем прямую по оранжевым пикселям рядом с грубой линией
def seg_dist(x0, y0, x1, y1):
    vx, vy = x1 - x0, y1 - y0
    t = np.clip(((xx - x0) * vx + (yy - y0) * vy) / (vx * vx + vy * vy), 0, 1)
    return np.hypot(xx - (x0 + t * vx), yy - (y0 + t * vy)), t
dd, _ = seg_dist(1045, 120, 815, 545)
cand = (A['or'] > .5) & (dd < 22) & (rad < .95 * R)
py, px = np.nonzero(cand)
m = np.array([px.mean(), py.mean()])
u, s, vt = np.linalg.svd(np.stack([px - m[0], py - m[1]], 1), full_matrices=False)
dirv = vt[0] if vt[0][1] > 0 else -vt[0]
proj = (px - m[0]) * dirv[0] + (py - m[1]) * dirv[1]
p0 = m + dirv * proj.min(); p1 = m + dirv * proj.max()
dd, tt = seg_dist(*p0, *p1)
barm = (A['or'] > .02) & (dd < 11) & (rad < .985 * R)
A_bar = np.where(barm, A['or'], 0)
A['or'] = np.where(barm, 0, A['or'])
print('bar', p0.round(1), p1.round(1), int(barm.sum()))

# ободок: от внешнего края шара внутрь — первая полоса цвета, не толще RIMW (там, где ободок сросся с материком)
th = np.arctan2(yy - CY, xx - CX)
NB = 1440
tb = ((th + np.pi) / (2 * np.pi) * NB).astype(int) % NB
RIMW = 30
rimm = {}
for k in ('tq', 'or'):
    m = A[k] > .35
    rin = np.full(NB, np.inf)
    for b in range(NB):
        ang = (b + .5) / NB * 2 * np.pi - np.pi
        rs = np.arange(int(R * 1.03), int(R * .6), -1)
        xs_ = (CX + np.cos(ang) * rs).round().astype(int); ys_ = (CY + np.sin(ang) * rs).round().astype(int)
        ok = (xs_ >= 0) & (xs_ < W) & (ys_ >= 0) & (ys_ < H)
        hit = np.zeros(len(rs), bool); hit[ok] = m[ys_[ok], xs_[ok]]
        if not hit.any(): continue
        j0 = np.argmax(hit)
        if rs[j0] < .95 * R: continue  # цвет начинается не у края — ободка нет
        j1 = j0
        while j1 + 1 < len(rs) and hit[j1 + 1]: j1 += 1
        run = rs[j0] - rs[j1]
        # полоса, которая заканчивается океаном, — ободок целиком; сросшаяся с сушей — только внешние RIMW px
        rin[b] = rs[j1] - 1.5 if run <= 80 else rs[j0] - RIMW - 1.5
    rimm[k] = (A[k] > .02) & (rad >= rin[tb])
    print(k, 'rim px', int(rimm[k].sum()))
os.makedirs('parts', exist_ok=True)
for f in os.listdir('parts'): os.remove('parts/' + f)
comps = []
def save(name, a, col, kind):
    ys, xs = np.nonzero(a > .02)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = a[y0:y1, x0:x1]
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    rgba[..., :3] = col; rgba[..., 3] = (crop * 255).round().astype(np.uint8)
    Image.fromarray(rgba).save(f'parts/{name}.png', optimize=True)
    w = crop.sum()
    cy, cx = (ys * a[ys, xs]).sum() / a[ys, xs].sum(), (xs * a[ys, xs]).sum() / a[ys, xs].sum()
    comps.append(dict(f=name, kind=kind, x=int(x0), y=int(y0), w=int(x1 - x0), h=int(y1 - y0), cx=round(float(cx), 1), cy=round(float(cy), 1), area=int(w)))

save('bar', A_bar, COLS['or'], 'bar')
for k in ('tq', 'or'):
    save(f'rim{k}', np.where(rimm[k], A[k], 0), COLS[k], 'rim'); comps[-1]['layer'] = k
    A[k] = np.where(rimm[k], 0, A[k])
for k in ('tq', 'or', 'wh'):
    a = A[k]
    lab, n = nd.label(a > .35, structure=np.ones((3, 3)))
    # мягкие края — к ближайшей метке
    for _ in range(3):
        grown = nd.grey_dilation(lab, size=3)
        lab = np.where((lab == 0) & (a > .02), grown, lab)
    for i in range(1, n + 1):
        part = np.where(lab == i, a, 0)
        if part.sum() < 4: continue
        ys, xs = np.nonzero(part > .35)
        r = np.hypot(xs - CX, ys - CY)
        # ободок: тонкое кольцо у края шара
        kind = 'ice' if k == 'wh' else 'land'
        save(f'{k}{i}', part, COLS[k], kind)
        comps[-1]['layer'] = k
comps[0]['layer'] = 'or'
json.dump(dict(W=W, H=H, CX=CX, CY=CY, R=R, bar=[p0.round(1).tolist(), p1.round(1).tolist()], parts=comps), open('parts.json', 'w'))
from collections import Counter
print(len(comps), Counter((c['layer'], c['kind']) for c in comps))
print('rims', [(c['f'], c['area']) for c in comps if c['kind'] == 'rim'])
# проверка: собранные части против исходника
recon = np.zeros_like(im)
for c in comps:
    p = np.asarray(Image.open(f"parts/{c['f']}.png")).astype(np.float32)
    a = p[..., 3:] / 255
    sl = recon[c['y']:c['y'] + c['h'], c['x']:c['x'] + c['w']]
    sl[:] = sl * (1 - a) + p[..., :3] * a
full = np.where(recon.sum(2, keepdims=True) > 0, recon, BG)
bgfill = BG * (1 - np.clip(sum(A.values()) + A_bar, 0, 1)[..., None])
print('mean abs diff vs cover', float(np.abs((recon + bgfill) - im).mean()))
