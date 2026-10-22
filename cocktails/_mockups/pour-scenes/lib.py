# Инструменты фотомакетов: вырезка предметов, наполнение бокала жидкостью с фото, струя, брызги, смаз движения.
# Все координаты — в пикселях исходных кадров 941×1672; внутри считаем в K раз крупнее.
import cv2
import numpy as np
from PIL import Image

import os

K = float(os.environ.get('K', 2))  # для видео K=1080/941: считаем сразу в 1080×1920
PW, PH = 941, 1672
W, H = round(PW * K), round(PH * K)
SHOTS = '../../06-margarita-photo/assets/shots/'
SOURCE = '../../06-margarita-photo/assets/source.png'
rng = np.random.default_rng(5)


def load(name):
    path = name if '/' in name else SHOTS + name + '.jpg'
    im = Image.open(path).convert('RGB').resize((W, H), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255


def save(img, path):
    out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    out.resize((1080, 1920), Image.LANCZOS).save(path, quality=93)
    return out


def grid():
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / K
    return xx, yy


XX, YY = grid()


def sm(a, b, v):
    t = np.clip((v - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def blur(a, r):
    return cv2.GaussianBlur(a.astype(np.float32), (0, 0), r * K) if r > 0 else a.copy()


def sample(a, x, y):
    return cv2.remap(a, (x * K).astype(np.float32), (y * K).astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def over(img, col, a):
    a = a[..., None] if a.ndim == 2 else a
    return img * (1 - a) + col * a


# ---------- вырезка предметов ----------
def cutout(name, rect, iters=6, feather=1.2, fill_rows=False, add=()):
    """GrabCut по прямоугольнику (в пикселях исходника). Возвращает RGB и альфу в K×."""
    im = (load(name) * 255).astype(np.uint8)
    small = cv2.resize(im, (PW, PH), interpolation=cv2.INTER_AREA)
    mask = np.zeros((PH, PW), np.uint8)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    x0, y0, x1, y1 = rect
    cv2.grabCut(cv2.cvtColor(small, cv2.COLOR_RGB2BGR), mask, (x0, y0, x1 - x0, y1 - y0), bgd, fgd, iters, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == 1) | (mask == 3), 1, 0).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)  # оставляем самый крупный кусок
    if n > 1:
        m = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    for ax0, ay0, ax1, ay1 in add:  # куски, которые GrabCut теряет (тонкое горлышко)
        m[ay0:ay1, ax0:ax1] = 1
    if fill_rows:  # бутылка выпуклая: заливаем каждую строку между крайними точками
        for y in range(PH):
            xs = np.nonzero(m[y])[0]
            if len(xs):
                m[y, xs.min():xs.max() + 1] = 1
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    a = cv2.resize(m.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR)
    a = blur(a, feather * .5)
    return im.astype(np.float32) / 255, np.clip(a, 0, 1)


def transform(rgb, a, pivot, angle=0.0, scale=1.0, to=None):
    """Поворот (градусы, против часовой) и масштаб вокруг pivot, перенос pivot в to."""
    to = to or pivot
    M = cv2.getRotationMatrix2D((pivot[0] * K, pivot[1] * K), angle, scale)
    M[:, 2] += [(to[0] - pivot[0]) * K, (to[1] - pivot[1]) * K]
    global LAST_M
    LAST_M = M
    rgba = np.dstack([rgb * a[..., None], a])
    out = cv2.warpAffine(rgba, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(0, 0, 0, 0))
    a2 = out[..., 3]
    return out[..., :3] / np.maximum(a2[..., None], 1e-4), a2


def tpt(pt, M=None):
    """Куда попала точка (в пикселях исходника) после последнего transform."""
    M = LAST_M if M is None else M
    x, y = M @ np.array([pt[0] * K, pt[1] * K, 1.0])
    return (x / K, y / K)


def motion_blur(rgb, a, dx, dy):
    """Смаз движения по вектору (в пикселях исходника), премультиплицированный."""
    L = int(max(abs(dx), abs(dy)) * K) | 1
    k = np.zeros((L, L), np.float32)
    c, ex, ey = L // 2, dx * K / 2, dy * K / 2
    cv2.line(k, (int(round(c - ex)), int(round(c - ey))), (int(round(c + ex)), int(round(c + ey))), 1.0, 1, cv2.LINE_AA)
    k /= k.sum()
    pm = cv2.filter2D(np.dstack([rgb * a[..., None], a]), -1, k)
    a2 = pm[..., 3]
    return pm[..., :3] / np.maximum(a2[..., None], 1e-4), a2


# ---------- бокал coupe на кадре glass-salt ----------
# полуширина чаши по высоте (внутренняя), центр x=453; замерено по кадру
_PROF = np.array([[786, 248], [810, 250], [840, 250], [870, 247], [900, 241], [930, 220],
                  [960, 192], [990, 148], [1020, 72], [1040, 8]], np.float32)
GX = 453.0


def coupe_hw(y):
    return np.interp(y, _PROF[:, 0], _PROF[:, 1], left=0, right=0)


def _sample_no_lime(src, xs, ys):
    # на исходнике справа к чаше прилегает лайм: правее x≈550 плавно переходим на зеркальную точку слева
    k = sm(550, 598, xs)[..., None]
    return sample(src, xs, ys) * (1 - k) + sample(src, 2 * 462 - xs, ys) * k


def fill_coupe(empty, level, src=None):
    """Наливает в пустой бокал (кадр glass-salt) мутную маргариту с исходного фото.
    level: y поверхности в пикселях исходника (812 — полный бокал, 1040 — пусто)."""
    src = load(SOURCE) if src is None else src
    hw = coupe_hw(YY)
    # профиль чаши на исходном фото (центр 462, полуширина та же форма, чуть шире)
    hw_o = np.interp(YY, _PROF[:, 0] + 2, _PROF[:, 1] * 1.03, left=0, right=0) + 4
    inside = sm(2, -2, np.abs(XX - GX) - hw) * (YY < 1042)
    hwl = max(float(coupe_hw(level)), 1)
    ry = .085 * hwl
    u = np.clip((XX - GX) / hwl, -1, 1)
    top = level - ry * np.sqrt(1 - u ** 2)
    bot = level + ry * np.sqrt(1 - u ** 2)
    liq = inside * sm(top - .8, top + .8, YY)
    # тело: от поверхности до дна берём полосу исходника 840..1046 (без ободка и соли), x по ширине чаши
    ys = np.clip(840 + (YY - level) * (1046 - 840) / max(1040 - level, 1), 836, 1046)
    xs = 462 + (XX - GX) * np.interp(ys, _PROF[:, 0] + 2, _PROF[:, 1] * 1.03 + 4) / np.maximum(hw, 1)
    body = _sample_no_lime(src, xs, ys)
    # поверхность: пена из полосы под ободком исходника, без соли; мениск у задней стенки
    v = np.clip((YY - top) / np.maximum(bot - top, 1e-3), 0, 1)
    surf_src = _sample_no_lime(src, 462 + u * 200, 838 + v * 14) * 1.04
    in_surf = (YY < bot)[..., None]
    col = np.where(in_surf, surf_src, body)
    men = (np.exp(-((YY - top) / 1.6) ** 2) + .6 * np.exp(-((YY - bot) / 1.2) ** 2)) * inside
    col = col + men[..., None] * np.array([.25, .24, .18])
    # стекло перед жидкостью: возвращаем блики и соль с пустого бокала
    hp = np.clip(empty - blur(empty, 3), 0, 1)
    lum = empty.mean(2)
    sat = empty.max(2) - empty.min(2)
    salt = sm(.62, .8, lum) * sm(.25, .1, sat) * sm(760, 772, YY) * sm(860, 845, YY)
    out = over(empty, col, liq)
    out = out + hp * liq[..., None] * .8
    out = over(out, empty, salt)
    return out, liq


# ---------- струя ----------
LIQUIDS = {
    # тело (рассеяние), доля прозрачности, поглощение по каналам, оттенок бликов
    'cloudy': dict(body=np.array([.90, .91, .62]), refr=.34, opaq=.72, sigma=np.array([.10, .05, .55])),
    'lime': dict(body=np.array([1.0, .94, .50]), refr=.3, opaq=.75, sigma=np.array([.08, .06, .7])),
    'clear': dict(body=np.array([.95, .92, .82]), refr=1.0, opaq=.0, sigma=np.array([.02, .04, .12])),
    'amber': dict(body=np.array([1.0, .52, .12]), refr=.85, opaq=.18, sigma=np.array([.05, .9, 2.4])),
}


_STREAK = None


def _streak():
    global _STREAK
    if _STREAK is None:
        n = cv2.GaussianBlur(np.random.default_rng(1).standard_normal((H, W)).astype(np.float32), (0, 0), sigmaX=.7 * K, sigmaY=14 * K)
        _STREAK = n / n.std()
    return _STREAK


def stream(img, spout, hit, w0=12.0, kind='cloudy', bend=.55, light=-1, t=0.0, head=None, tail=None):
    """Струя от spout до hit (x, y). Форма x(y) = xs + (xt − xs)·k^bend, сужается книзу.
    light=-1: основной блик слева."""
    P = LIQUIDS[kind]
    xs, ys = spout
    xt, yt = hit
    yc = np.clip(YY, ys, yt + 6)
    k = np.clip((yc - ys) / (yt - ys), 1e-4, 1)
    xc = xs + (xt - xs) * k ** bend
    slope = (xt - xs) * bend * k ** (bend - 1) / (yt - ys)
    cos = 1 / np.sqrt(1 + slope ** 2)
    # t — время в секундах: рябь и струйки бегут вниз; head/tail — где сейчас передний и задний конец струи
    hw = w0 * (1 + 3 * k) ** -.25 * (1 + .07 * k * np.sin(yc * .085 + 1.3 - t * 14) + .035 * k * np.sin(yc * .21 - t * 30))
    hw = hw * (1 + .22 * sm(yt - 20, yt, yc)) * (1 + .25 * sm(ys + 14, ys, yc))
    u = (XX - xc) * cos / hw
    aa = sm(1.0, .88, np.abs(u)) * sm(ys - 1, ys + 3, YY) * (1 - sm(yt - 3, yt + 3, YY))
    if head is not None:
        aa = aa * (1 - sm(head - 3, head + 3, YY))
    if tail is not None:
        aa = aa * sm(tail - 3, tail + 3, YY)
    th = np.sqrt(np.clip(1 - u ** 2, 0, 1))
    bg = blur(img, .6)
    refr = sum(sample(bg, xc - u * hw * 3.0, YY + dy - 10 * th) for dy in (-6, -3, 0, 3, 6)) / 5
    streak = np.roll(_streak(), int(t * 220 * K), axis=0)
    lam = np.clip(.62 + .38 * light * u + .25 * th, .25, 1.15)
    body = P['body'] * (lam * (1 + .10 * streak))[..., None] * (.55 + .45 * th[..., None])
    trans = refr * np.exp(-P['sigma'] * (th * 2.2)[..., None])
    if kind in ('cloudy', 'lime'):
        body = body * 1.12 + .03
        col = body * .84 + refr * np.array([1.0, .95, .7]) * .2
        edge = np.array([.30, .12, .08]) * .5
    elif kind == 'amber':  # светится на просвет от лампы: оранжевое ядро, тёмно-янтарный край
        glow = np.array([1.0, .50, .10]) * (.35 + .65 * th[..., None]) * (lam * (1 + .08 * streak))[..., None] * .85
        col = glow + trans * .35
        edge = np.array([.35, .12, .02]) * .6
    else:  # прозрачная: перевёрнутый фон чуть светлее, яркие края от света вокруг
        col = trans * (1.15 + .25 * th[..., None]) + .03
        edge = np.array([.80, .66, .48]) * .9
    fres = np.clip(np.abs(u), 0, 1) ** 3
    col = col * (1 - fres[..., None] * .6) + fres[..., None] * edge
    if kind != 'clear':
        col *= (1 - .45 * sm(.88, 1.0, np.abs(u)))[..., None]
    mod = np.clip(.55 + .45 * np.sin(yc * .085 + 1.9 - t * 14) + .25 * np.sin(yc * .21 + 2 - t * 30), 0, 1.3)
    s1 = np.exp(-((u - .55 * light + .04 * streak) / .07) ** 2) * mod * np.clip(1 + .35 * streak, .3, 1.6)
    s2 = np.exp(-((u + .66 * light) / .06) ** 2) * (.3 + .3 * mod)
    col += s1[..., None] * np.array([1.0, .95, .82]) * (1.1 if kind == 'clear' else 1)
    col += s2[..., None] * np.array([1.0, .85, .72]) * .45
    return over(img, np.clip(col, 0, 1.25), aa)


def drop(img, cx, cy, r, kind='cloudy', alpha=1.0, stretch=1.0):
    P = LIQUIDS[kind]
    x0, x1 = int((cx - 3 * r) * K), int((cx + 3 * r) * K) + 1
    y0, y1 = int((cy - 3 * r * stretch) * K), int((cy + 3 * r * stretch) * K) + 1
    sl = (slice(max(y0, 0), min(y1, H)), slice(max(x0, 0), min(x1, W)))
    xx, yy = XX[sl], YY[sl]
    d = np.sqrt(((xx - cx) / r) ** 2 + ((yy - cy) / (r * stretch)) ** 2)
    al = sm(1.05, .85, d) * alpha
    t = np.sqrt(np.clip(1 - d ** 2, 0, 1))
    bg = img[sl]
    lam = np.clip(.7 - .4 * (xx - cx) / r + .3 * t, .3, 1.2)
    c = P['body'] * lam[..., None] * P['opaq'] + bg[::-1, ::-1] * (1 - P['opaq'] * .7) * np.exp(-P['sigma'] * t[..., None])
    c *= (1 - .6 * sm(.7, 1, d))[..., None]
    hl = np.exp(-(((xx - cx) / r + .35) ** 2 + ((yy - cy) / (r * stretch) + .4) ** 2) / .03)
    c += hl[..., None] * np.array([1, .96, .85]) * 1.1
    img[sl] = over(bg, np.clip(c, 0, 1.3), al)
    return img


def splash(img, x, y, rx, kind='cloudy', n=12, height=(16, 30), spread=9, foam=None):
    """Место падения: пена, корона и капли. foam — маска поверхности (где можно рисовать пену)."""
    P = LIQUIDS[kind]
    r = np.sqrt(((XX - x)) ** 2 + ((YY - y) / .2) ** 2)
    if foam is not None:
        fn = blur(rng.random((H, W)).astype(np.float32), .9)
        fn = (fn - fn.mean()) / fn.std()
        fm = np.exp(-(r / (rx * .8)) ** 2) * foam * np.clip(.65 + .35 * fn, 0, 1)
        img = over(img, np.array([.97, .98, .90]) if kind in ('cloudy', 'lime') else P['body'] * .9 + .1, fm * .75)
        rings = np.sin(r * .30 - 1.2) * np.exp(-r / (rx * 2.2)) * sm(rx * .3, rx * .7, r) * foam
        img = img + (rings * .10)[..., None]
    ang = np.arctan2((YY - y) / .3, XX - x)
    cr = np.sqrt(((XX - x) / rx) ** 2 + ((YY - y + 2) / (rx * .24)) ** 2)
    hmax = height[0] + (height[1] - height[0]) * np.cos(ang * 7) ** 2 * .6
    ch = (YY < y + 1) & (YY > y - hmax)
    wall = np.exp(-((cr - 1) / .16) ** 2) * ch * sm(y - hmax - 6, y - 4, YY) * .75
    img = over(img, P['body'] * 1.1 if kind != 'clear' else np.array([.9, .88, .82]), wall * (.6 if kind == 'clear' else 1))
    for i in range(n):
        a = i / n * 2 * np.pi + rng.normal(0, .15)
        px, py = x + rx * np.cos(a), y - 2 + rx * .24 * np.sin(a)
        h = rng.uniform(*height) * (.6 + .4 * abs(np.cos(a)))
        img = drop(img, px + 4 * np.cos(a), py - h, rng.uniform(1.6, 2.8), kind, .95, 1.15)
    for _ in range(spread):
        a = rng.uniform(-np.pi, 0)
        rr = rng.uniform(rx * 1.2, rx * 2.6)
        img = drop(img, x + rr * np.cos(a) * 1.2, y - 16 + rr * np.sin(a) * .55, rng.uniform(1.1, 2.1), kind, .9)
    return img


def bubbles(img, x, y, depth=125, n=240, spread=(8, 30), mask=None, milk=.3):
    """Облако пузырьков под местом падения, видно через стекло."""
    k = np.clip((YY - y) / depth, 0, 1)
    plume = np.exp(-((XX - x) / (spread[0] + spread[1] * k)) ** 2) * sm(y - 4, y + 14, YY) * (1 - sm(y + depth * .7, y + depth * 1.1, YY))
    if mask is not None:
        plume *= mask
    img = over(img, np.array([.93, .96, .78]), plume * milk)
    bub = np.zeros((H, W), np.float32)
    for _ in range(n):
        t = rng.random() ** 1.6
        by, bx = y + 8 + t * depth, x + rng.normal(0, spread[0] + spread[1] * t)
        br = rng.uniform(.6, 2.2) * (1.2 - .5 * t)
        x0, x1, y0, y1 = int((bx - 4) * K), int((bx + 4) * K), int((by - 4) * K), int((by + 4) * K)
        if x0 < 0 or y0 < 0 or x1 >= W or y1 >= H:
            continue
        d = np.hypot(XX[y0:y1, x0:x1] - bx, YY[y0:y1, x0:x1] - by)
        bub[y0:y1, x0:x1] = np.maximum(bub[y0:y1, x0:x1], np.exp(-((d - br) / .45) ** 2) * (1 - .7 * t))
    if mask is not None:
        bub *= mask
    return over(img, np.array([1, 1, .95]), bub * .55)


_FRAME = None


def frame(img):
    """Золотая рамка с веером с исходного фото поверх кадра."""
    global _FRAME
    if _FRAME is None:
        _FRAME = _frame_layer()
    return over(img, *_FRAME)


def _frame_layer():
    src = load(SOURCE)
    plate = load('../../06-margarita-photo/assets/plate.png')
    gold = (src[..., 0] - src[..., 2] > .15) & (src[..., 0] > .35)
    corner = ((XX < 62) | (XX > PW - 62)) & ((YY < 100) | (YY > PH - 100))
    zone = (np.abs(XX - 22) < 7) | (np.abs(XX - 918) < 7) | (YY < 92) | (np.abs(YY - 1631) < 7) | corner
    m = ((np.abs(src - plate).max(2) > .06) & gold & zone).astype(np.float32)
    m = cv2.GaussianBlur(m, (0, 0), 1.2)
    return src, m


def bottle_cutout(name, rect, neck, feather=.6):
    """Бутылка симметрична: из маски GrabCut берём полуширину по строкам относительно оси,
    сглаживаем профиль, от горлышка к плечам он не сужается. Край — по субпиксельной полуширине."""
    im = (load(name) * 255).astype(np.uint8)
    small = cv2.resize(im, (PW, PH), interpolation=cv2.INTER_AREA)
    mask = np.zeros((PH, PW), np.uint8)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    x0, y0, x1, y1 = rect
    cv2.grabCut(cv2.cvtColor(small, cv2.COLOR_RGB2BGR), mask, (x0, y0, x1 - x0, y1 - y0), bgd, fgd, 6, cv2.GC_INIT_WITH_RECT)
    m = (mask == 1) | (mask == 3)
    nx0, ny0, nx1, ny1 = neck
    m[ny0:ny1, nx0:nx1] = True
    rows = range(y0, y1)
    lo = np.array([np.nonzero(m[y])[0].min() if m[y].any() else -1 for y in rows], float)
    hi = np.array([np.nonzero(m[y])[0].max() if m[y].any() else -1 for y in rows], float)
    ok = lo >= 0
    axis = float(np.median(((lo + hi) / 2)[ok]))
    hw = np.where(ok, np.maximum(axis - lo, hi - axis), 0)
    body = np.percentile(hw[ok][len(hw[ok]) // 3:], 60)  # полуширина корпуса; всё шире — кусок стойки или шторы
    hw = np.minimum(hw, body + 2)
    hw[-4:] = hw[-5]
    hw = np.median(np.lib.stride_tricks.sliding_window_view(np.pad(hw, 5, mode='edge'), 11), axis=1)
    top = int(np.argmax(hw > 0))
    peak = top + int(np.argmax(hw[top:]))
    hw[top:peak] = np.maximum.accumulate(hw[top:peak])  # от горлышка до самого широкого места не сужается
    hw = cv2.GaussianBlur(hw.reshape(-1, 1).astype(np.float32), (1, 0), sigmaX=0, sigmaY=1.5).ravel()
    hw[:top] = 0
    hwK = np.zeros(H, np.float32)
    ys = np.arange(H) / K
    hwK[:] = np.interp(ys, np.arange(y0, y1), hw, left=0, right=0)
    a = np.clip((hwK[:, None] - np.abs(XX - axis)) * K / (1 + feather * K) + .5, 0, 1)
    a *= sm(top + y0 - 1, top + y0 + 1, YY) * (hwK[:, None] > 0)
    return im.astype(np.float32) / 255, a.astype(np.float32), axis
