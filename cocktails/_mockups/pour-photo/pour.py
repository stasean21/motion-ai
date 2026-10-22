# Фотомакет: в бокал с фото льётся струя. Всё считается на фото без рамки, рамка с исходника кладётся сверху.
# python3 -I pour.py  (из этой папки) → pour.jpg (1080×1920) и pour-detail.jpg (крупно место падения)
import cv2
import numpy as np
from PIL import Image

K = 2  # считаем в 2× от исходника, потом уменьшаем до 1080×1920
SRC = '../../06-margarita-photo/assets/source.png'
PLATE = '../../06-margarita-photo/assets/plate.png'
src0, plate0 = Image.open(SRC).convert('RGB'), Image.open(PLATE).convert('RGB')
W0, H0 = src0.size
W, H = W0 * K, H0 * K
up = lambda im: np.asarray(im.resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
src, plate = up(src0), up(plate0)
frame_mask = (np.abs(src - plate).max(2) > 0.06).astype(np.float32)
frame_mask = cv2.GaussianBlur(frame_mask, (0, 0), 1.2)
img = plate.copy()
rng = np.random.default_rng(4)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / K  # координаты в пикселях исходника
sm = lambda a, b, v: np.clip((v - a) / (b - a), 0, 1) ** 2 * (3 - 2 * np.clip((v - a) / (b - a), 0, 1))


def blur(a, r):
    return cv2.GaussianBlur(a.astype(np.float32), (0, 0), r * K) if r > 0 else a.copy()


def sample(a, x, y):  # билинейная выборка по координатам исходника
    x, y = np.clip(x * K, 0, W - 1.001), np.clip(y * K, 0, H - 1.001)
    x0, y0 = x.astype(int), y.astype(int)
    fx, fy = (x - x0)[..., None], (y - y0)[..., None]
    return (a[y0, x0] * (1 - fx) * (1 - fy) + a[y0, x0 + 1] * fx * (1 - fy)
            + a[y0 + 1, x0] * (1 - fx) * fy + a[y0 + 1, x0 + 1] * fx * fy)


# ---------- точка падения и поверхность ----------
IX, IY = 428.0, 812.0  # куда бьёт струя (поверхность напитка внутри ободка)
SURF = dict(cx=462.0, cy=812.0, rx=236.0, ry=20.0)
surf = np.clip(1 - (((xx - SURF['cx']) / SURF['rx']) ** 2 + ((yy - SURF['cy']) / SURF['ry']) ** 2), 0, 1)
surf = sm(0, .08, surf)
r_imp = np.sqrt(((xx - IX) / 1.0) ** 2 + ((yy - IY) / .16) ** 2)  # расстояние в плоскости поверхности (эллипс)

# круги на поверхности: светлые и тёмные кольца от удара
rings = np.sin(r_imp * .30 - 1.2) * np.exp(-r_imp / 70) * sm(10, 22, r_imp)
img += (surf * rings * .10)[..., None] * np.array([1, 1, .9])
# взбитая пена вокруг удара
foam_n = blur(rng.random((H, W)).astype(np.float32), .9)
foam_n = (foam_n - foam_n.mean()) / foam_n.std()
foam = np.exp(-(r_imp / 26) ** 2) * surf * np.clip(.65 + .35 * foam_n, 0, 1)
img = img * (1 - foam[..., None] * .75) + foam[..., None] * np.array([.97, .98, .90]) * .75

# облако пузырьков под поверхностью, видно через стекло
k = np.clip((yy - 818) / 120, 0, 1)
plume = np.exp(-((xx - IX - 6 * k * 120 / 120) / (10 + 34 * k)) ** 2) * sm(808, 826, yy) * (1 - sm(900, 960, yy))
milk = plume * .32
img = img * (1 - milk[..., None]) + milk[..., None] * np.array([.93, .96, .78])
bub = np.zeros((H, W), np.float32)
for _ in range(260):
    t = rng.random() ** 1.6
    by = 820 + t * 125
    bx = IX + rng.normal(0, 8 + 30 * t)
    br = rng.uniform(.6, 2.2) * (1.2 - .5 * t)
    d = np.hypot(xx - bx, yy - by)
    m = d < br + 2
    ring = np.exp(-((d[m] - br) / .45) ** 2)
    bub[m] = np.maximum(bub[m], ring * (1 - .7 * t))
img = img * (1 - bub[..., None] * .55) + bub[..., None] * np.array([1, 1, .95]) * .55

# ---------- струя ----------
# падает по параболе: x = X0 + A·√(y − Y0); толщина сужается с ростом скорости (∝ (y − Y0)^−¼)
X0, Y0 = 300.0, -200.0
A = (IX - X0) / np.sqrt(IY - Y0)
yc = np.clip(yy, 0, IY + 6)
xc = X0 + A * np.sqrt(yc - Y0)
slope = A / (2 * np.sqrt(yc - Y0))
cos = 1 / np.sqrt(1 + slope ** 2)
s = np.clip(yc / IY, 0, 1)  # 0 сверху, 1 у поверхности
hw = 21.0 * ((0 - Y0) / (yc - Y0)) ** .25
hw = hw * (1 + .07 * s * np.sin(yc * .085 + 1.3) + .035 * s * np.sin(yc * .21))  # варикозная рябь ниже по струе
hw = hw * (1 + .25 * sm(IY - 26, IY, yc))  # у поверхности струя слегка расширяется
u = (xx - xc) * cos / hw
inside = (np.abs(u) < 1.15) & (yy < IY + 4)
aa = sm(1.0, .9, np.abs(u)) * (1 - sm(IY - 4, IY + 4, yy))  # мягкий край и уход в напиток

bg = blur(img, .6)
# цилиндрическая линза: фон за струёй перевёрнут и сжат, плюс вертикальный смаз от движения
th = np.sqrt(np.clip(1 - u ** 2, 0, 1))
refr = np.zeros_like(img)
for dy in (-6, -3, 0, 3, 6):
    refr += sample(bg, xc - u * hw * 3.2, yy + dy - 10 * th) / 5
# маргарита мутная: тело струи — рассеянный лаймовый цвет, сквозь него чуть видно перевёрнутый фон
LIQ = np.array([.90, .91, .62])
# продольные струйки: шум, сильно растянутый по вертикали
streak = cv2.GaussianBlur(rng.standard_normal((H, W)).astype(np.float32), (0, 0), sigmaX=.7 * K, sigmaY=14 * K)
streak /= streak.std()
lam = np.clip(.62 - .38 * u + .25 * th, .25, 1.15)  # свет слева (лампа) и объём цилиндра
body = LIQ * (lam * (1 + .10 * streak))[..., None] * (.55 + .45 * th[..., None])
col = body * .72 + refr * np.array([1.0, .95, .7]) * .34
col *= (1 + .18 * sm(.55, 1, s) * th)[..., None]  # к поверхности струя светится ярче, свет из бокала
# френель: у края отражается тёмная штора, тонкая тёмная кромка
fres = np.clip(np.abs(u), 0, 1) ** 3
col = col * (1 - fres[..., None] * .6) + fres[..., None] * np.array([.30, .12, .08]) * .6
col *= (1 - .45 * sm(.88, 1.0, np.abs(u)))[..., None]
# блики: основной тёплый слева (лампа), рваный рябью; вторичный справа; мягкий отсвет по центру
mod = np.clip(.55 + .45 * np.sin(yc * .085 + 1.9) + .25 * np.sin(yc * .21 + 2), 0, 1.3)
spec1 = np.exp(-((u + .55 + .04 * streak) / .07) ** 2) * mod * (.6 + .4 * s) * np.clip(1 + .35 * streak, .3, 1.6)
spec2 = np.exp(-((u - .66) / .06) ** 2) * (.3 + .3 * mod)
core = np.exp(-((u + .1) / .3) ** 2) * .08 * mod
col += spec1[..., None] * np.array([1.0, .95, .82])
col += spec2[..., None] * np.array([1.0, .85, .72]) * .45
col += core[..., None] * np.array([1, 1, .85])
a = (aa * inside)[..., None]
img = img * (1 - a) + np.clip(col, 0, 1.2) * a

# ---------- брызги: корона и капли ----------
def drop(cx, cy, r, alpha=1.0, stretch=1.0):
    global img
    d = np.sqrt(((xx - cx) / r) ** 2 + ((yy - cy) / (r * stretch)) ** 2)
    m = d < 1.6
    if not m.any():
        return
    t = np.sqrt(np.clip(1 - d[m] ** 2, 0, 1))
    al = sm(1.05, .85, d[m]) * alpha
    rx = sample(bg, cx - (xx[m] - cx) * 2.4, cy - (yy[m] - cy) * 2.4)
    lam_ = np.clip(.7 - .4 * (xx[m] - cx) / r + .3 * t, .3, 1.2)
    c = LIQ * lam_[:, None] * .8 + rx * .25
    c *= (1 - .6 * sm(.7, 1, d[m]))[:, None]
    hl = np.exp(-(((xx[m] - cx) / r + .35) ** 2 + ((yy[m] - cy) / (r * stretch) + .4) ** 2) / .03)
    c += hl[:, None] * np.array([1, .96, .85]) * 1.1
    c += (sm(.75, 1, d[m]) * (t > 0))[:, None] * np.array([.25, .2, .12]) * .4
    img[m] = img[m] * (1 - al[:, None]) + np.clip(c, 0, 1.3) * al[:, None]


# корона: тонкая полупрозрачная стенка вокруг удара
ang = np.arctan2((yy - IY) / .3, xx - IX)
crown_r = np.sqrt(((xx - IX) / 34) ** 2 + ((yy - IY + 2) / 8) ** 2)
crown_h = (yy < IY + 1) & (yy > IY - 18 - 8 * np.cos(ang * 7) ** 2)
front = sm(-.2, .6, np.sin(ang))  # передняя часть короны ярче, задняя за струёй
wall = np.exp(-((crown_r - 1) / .16) ** 2) * crown_h * sm(IY - 30, IY - 6, yy) * (.55 + .4 * front)
img = img * (1 - wall[..., None]) + wall[..., None] * LIQ * 1.15
crest = np.exp(-((crown_r - 1) / .12) ** 2) * crown_h * np.exp(-((yy - (IY - 17 - 7 * np.cos(ang * 7) ** 2)) / 2.2) ** 2)
img += crest[..., None] * np.array([1, .97, .88]) * .7
for i in range(13):
    th_ = i / 13 * 2 * np.pi + rng.normal(0, .15)
    px, py = IX + 35 * np.cos(th_), IY - 2 + 8 * np.sin(th_)
    h = rng.uniform(20, 34) * (.6 + .4 * abs(np.cos(th_)))
    drop(px + 4 * np.cos(th_), py - h, rng.uniform(1.8, 3.0), .95, 1.15)
# капли, отлетающие в стороны, и пара мелких рядом со струёй
for _ in range(9):
    th_ = rng.uniform(-np.pi, 0)
    r_ = rng.uniform(40, 85)
    drop(IX + r_ * np.cos(th_) * 1.2, IY - 18 + r_ * np.sin(th_) * .55, rng.uniform(1.2, 2.2), .9)
for y_ in (690, 742, 770):
    x_ = X0 + A * np.sqrt(y_ - Y0)
    drop(x_ + rng.uniform(22, 28) * rng.choice([-1, 1]), y_, rng.uniform(1.4, 2.0), .85, 1.3)

# рамка с исходника поверх
img = img * (1 - frame_mask[..., None]) + src * frame_mask[..., None]
out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
out.resize((1080, 1920), Image.LANCZOS).save('pour.jpg', quality=93)
out.crop((260 * K, 560 * K, 640 * K, 980 * K)).save('pour-detail.jpg', quality=93)
