# Фотомакеты ключевых сцен Margarita на присланных кадрах. python3 -I scenes.py [номер ...] → out/NN-*.jpg и out/sheet.jpg
import sys

from lib import *

ONLY = set(sys.argv[1:])
BOTTLES = {  # кадр, прямоугольник для GrabCut, горлышко (добавка к маске), центр горлышка сверху
    'tequila': ('tequila-full', (295, 505, 642, 1250), (406, 515, 530, 760), (468, 515), 'clear'),
    'liqueur': ('liqueur-full', (266, 655, 664, 1260), (408, 668, 523, 800), (465, 668), 'amber'),
    'lime': ('lime-juice-full', (340, 772, 602, 1260), (398, 782, 542, 870), (470, 782), 'lime'),
}


def glass_mask():
    """Силуэт бокала на кадре glass-salt: чаша по профилю, ножка, основание."""
    bowl = sm(2, -2, np.abs(XX - GX) - (coupe_hw(YY) + 5)) * sm(764, 772, YY) * (YY < 1046)
    stem = sm(2, -2, np.abs(XX - 453) - (22 + 30 * sm(1080, 1040, YY) + 40 * sm(1330, 1385, YY))) * (YY >= 1040) * (YY < 1390)
    foot = sm(1.05, .95, np.sqrt(((XX - 453) / 174) ** 2 + ((YY - 1397) / 38) ** 2))
    return np.clip(np.maximum(np.maximum(bowl, stem), foot), 0, 1)


def s01():  # бокал въезжает справа
    img = load('scene-empty')
    g = load('glass-salt')
    rgb, a = transform(g, glass_mask(), (453, 1100), 0, 1, (453 + 150, 1100))
    rgb, a = motion_blur(rgb, a, 55, 0)
    img = over(img, rgb, a)
    # отражение на стойке тянется за бокалом
    refl = blur(np.clip(g - load('scene-empty'), 0, 1) * (YY > 1420)[..., None] * sm(1.4, .6, np.abs(XX - 453) / 170)[..., None], 1)
    rr, ra = transform(refl, np.ones((H, W), np.float32), (453, 1100), 0, 1, (453 + 150, 1100))
    rr, _ = motion_blur(rr, ra, 55, 0)
    return img + rr * .6


def pour_bottle(key, n):
    name, rect, neck, mouth, kind = BOTTLES[key]
    img = load('shaker-open')
    rgb, a, _ = bottle_cutout(name, rect, neck)
    to = (478, 600)
    if kind == 'clear':
        # прозрачная бутылка: переносим только её вклад (стекло, блики, этикетку), штора сквозь неё — новая
        delta = rgb - load('scene-empty')
        d2, a2 = transform(delta + 1, a, mouth, 132, 1.0, to)
        layer = ('delta', d2 - 1, a2)
    else:
        layer = ('over',) + transform(rgb, a, mouth, 132, 1.0, to)
    # жидкость стекает с нижней губы горлышка: из краёв горлышка берём тот, что оказался ниже
    lips = [tpt((mouth[0] + dx, mouth[1] + 6)) for dx in (-50, -30, 0, 30, 50)]
    sx, sy = max(lips, key=lambda p: p[1])
    spout, hit = (sx, sy - 18), (430, 872)  # начало прячется под горлышком
    img = stream(img, spout, hit, w0=9, kind=kind, bend=.7)
    if layer[0] == 'delta':
        img = np.clip(img + layer[1] * layer[2][..., None], 0, 1)
    else:
        img = over(img, layer[1], layer[2])
    # шейкер спереди закрывает конец струи: возвращаем переднюю стенку ниже края
    tin = load('shaker-open')
    front = sm(2, -2, np.abs(XX - 432) - 150) * sm(876, 882, YY) * (YY < 1400)
    img = over(img, tin, front)
    for _ in range(7):
        an = rng.uniform(-np.pi, 0)
        rr = rng.uniform(14, 40)
        img = drop(img, 430 + rr * np.cos(an) * 1.3, 862 + rr * np.sin(an) * .7, rng.uniform(1.1, 2.0), kind, .9)
    return img


def s03():  # шейк: шейкер в воздухе, наклонён, смазан, на металле конденсат
    img = load('scene-empty')
    rgb, a = cutout('shaker-closed', (300, 640, 632, 1436))
    # конденсат: мелкие светлые капли и лёгкая изморозь
    n = blur(rng.random((H, W)).astype(np.float32), .5)
    n = (n - n.mean()) / n.std()
    dots = sm(2.2, 2.8, n) * a
    frost = sm(-.5, 1.5, blur(rng.standard_normal((H, W)).astype(np.float32), 6) * 8) * a * .10
    rgb = over(rgb, np.array([.92, .93, .95]), np.clip(dots * .55 + frost, 0, 1))
    rgb, a = transform(rgb, a, (467, 1040), 24, 1.0, (500, 880))
    rgb, a = motion_blur(rgb, a, 22, -12)
    img = over(img, rgb, a)
    for _ in range(16):  # капли слетают со шва крышки
        an = rng.uniform(-2.6, -.3)
        rr = rng.uniform(30, 150)
        img = drop(img, 380 + rr * np.cos(an), 640 + rr * np.sin(an) * .8, rng.uniform(1.2, 2.6), 'clear', .9, 1.2)
    return img


def s04():  # процеживание: шейкер льёт в бокал, бокал наполовину
    empty = load('glass-salt')
    img, liq = fill_coupe(empty, 905)
    rgb, a = cutout('shaker-open', (276, 858, 592, 1396))
    lip = (582, 872)  # правый край горлышка шейкера до поворота
    to = (470, 600)
    rgb, a = transform(rgb, a, lip, -118, .82, to)
    lips = [tpt((x, 872)) for x in (282, 332, 432, 532, 582)]
    sx, sy = max(lips, key=lambda p: p[1])
    hit = (440, 905)
    img = stream(img, (sx + 4, sy - 30), hit, w0=14, kind='cloudy', bend=.65)
    hwl = coupe_hw(905)
    surf = sm(1.0, .9, np.sqrt(((XX - GX) / hwl) ** 2 + ((YY - 905) / (.085 * hwl)) ** 2))
    img = splash(img, *hit, 30, 'cloudy', n=12, height=(16, 30), foam=surf)
    img = bubbles(img, hit[0], hit[1] + 4, depth=110, mask=liq)
    # передняя стенка бокала поверх струи: блики стекла и соль
    hp = np.clip(empty - blur(empty, 3), 0, 1)
    front = sm(812, 822, YY) * sm(2, -2, np.abs(XX - GX) - coupe_hw(YY))
    img = img + hp * front[..., None] * .7
    return over(img, rgb, a)


def s05():  # лайм падает на ободок полного бокала
    img, _ = fill_coupe(load('glass-salt'), 812)
    rgb, a = cutout('lime-wheel', (298, 632, 650, 1014))
    rgb, a = transform(rgb, a, (474, 835), 18, .66, (676, 676))
    rgb, a = motion_blur(rgb, a, -4, 22)
    img = over(img, rgb, a)
    for x, y, r in ((640, 740, 1.8), (712, 752, 1.5), (744, 700, 1.3), (610, 700, 1.2)):
        img = drop(img, x, y, r, 'cloudy', .9, 1.4)
    return img


SCENES = [('01-glass-in', s01), ('02-tequila', lambda: pour_bottle('tequila', 2)),
          ('02b-liqueur', lambda: pour_bottle('liqueur', 2)), ('02c-lime-juice', lambda: pour_bottle('lime', 2)),
          ('03-shake', s03), ('04-strain', s04), ('05-lime-wheel', s05)]
for name, fn in SCENES:
    if ONLY and name.split('-')[0] not in ONLY:
        continue
    save(frame(fn()), f'out/{name}.jpg')
    print(name)
ims = [Image.open(f'out/{n}.jpg').resize((270, 480)) for n, _ in SCENES]
sheet = Image.new('RGB', (len(ims) * 276 + 6, 492), 'white')
for i, im in enumerate(ims):
    sheet.paste(im, (6 + i * 276, 6))
sheet.save('out/sheet.jpg', quality=90)
