"""Static mockups (for approval) assembled from the generated layers. No animation here."""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compose import (H, W, Layer, bezier, claws, compose, contact_shadow, save, tint, trails)  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mockups")
K = W / 941
HZ = {"00_intro": 1049 * K, "01_brazil": 1103 * K, "02_usa": 1057 * K, "03_uk": 1003 * K, "04_japan": 1099 * K,
      "05_egypt": 1101 * K, "06_romania": 1103 * K, "07_guests": 888 * K, "08_earth": 1253 * K, "09_final": 1105 * K}
SIX = ["brazil", "usa", "uk", "japan", "egypt", "romania"]

PUMPKINS = [("orange", (362, 304), (1.0, 0.5, 0.1)), ("yellow", (752, 333), (1.0, 0.85, 0.2)),
            ("green", (195, 540), (0.5, 1.0, 0.2)), ("blue", (900, 540), (0.3, 0.8, 1.0)),
            ("purple", (270, 1050), (0.7, 0.3, 1.0)), ("red", (820, 1056), (1.0, 0.2, 0.15))]
STARTS = [(-200, -150), (1300, -120), (-260, 900), (1340, 860), (-200, 1700), (1300, 1750)]
P_SCALE = 0.24


def pumpkin(name, xy, op=1.0, scale=P_SCALE, rot=0.0):
    return Layer("00_intro__pumpkin_" + name, "sprite", xy[0], xy[1], scale, rot, anchor="content", glow=40,
                 op=op)


def intro_flight():
    t = 0.62
    paths, cols, lays = [], [], []
    for (n, xy, col), st in zip(PUMPKINS, STARTS):
        ctrl = ((st[0] + xy[0]) / 2 + (xy[1] - st[1]) * 0.35, (st[1] + xy[1]) / 2 - (xy[0] - st[0]) * 0.2)
        path = bezier(st, ctrl, xy)
        k = int(len(path) * t)
        paths.append(path[:k])
        cols.append(col)
        lays.append(pumpkin(n, path[k - 1], rot=(1 - t) * 40))
    title = Layer("00_intro__title", "key", W / 2, 820, 0.55, anchor="content", op=0.55, glow=20)
    return compose("00_intro__bg", [trails(paths, cols), title] + lays, HZ["00_intro"], (1, 0.6, 0.2))


def intro_title():
    paths, cols, lays = [], [], []
    for (n, xy, col), st in zip(PUMPKINS, STARTS):
        ctrl = ((st[0] + xy[0]) / 2 + (xy[1] - st[1]) * 0.35, (st[1] + xy[1]) / 2 - (xy[0] - st[0]) * 0.2)
        paths.append(bezier(st, ctrl, xy)[18:])
        cols.append(tuple(np.array(col) * 0.6))
        lays.append(pumpkin(n + ("_eye" if n == "purple" else ""), xy))
    title = Layer("00_intro__title", "key", W / 2, 820, 1.0, anchor="content", glow=24)
    return compose("00_intro__bg", [trails(paths, cols, 2, 30), title] + lays, HZ["00_intro"], (1, 0.6, 0.2))


def intro_dive():
    title = Layer("00_intro__title", "key", W / 2 + 500, 820 + 400, 2.4, anchor="content", op=0.6)
    lays = [title, pumpkin("green", (560, 900), scale=1.15, rot=-8), tint((0.45, 1.0, 0.25), 0.45)]
    return compose("00_intro__bg", lays, HZ["00_intro"], (0.5, 1, 0.2), refl_k=0.3)


# ---------------------------------------------------------------- Brazil
BR = dict(ball=0.57, x=560, map=(770, 420), moon=(300, 215))


def brazil(state):
    hz = HZ["01_brazil"]
    acc = (0.7, 1.0, 0.2)
    lays = []
    if state != "land":
        rise = 1.0
        lays.append(Layer("01_brazil__moon", "screen", BR["moon"][0], BR["moon"][1] + 60 * (1 - rise), 0.34,
                          anchor="content", glow=30, op=0.85))
    lays.append(Layer("01_brazil__map", "screen", *BR["map"], 0.52, anchor="content",
                      op=1.0 if state == "land" else 0.8, glow=30 if state == "land" else 14))
    lays.append(Layer("01_brazil__title", "key", W / 2, 500, 0.9 * (1.12 if state == "land" else 1.0),
                      anchor="content", glow=26))
    char = {"land": "normal", "wolf": "wolf", "howl": "howl"}[state]
    sx, sy, rot = {"land": (1.16, 0.84, 0), "wolf": (1, 1, 0), "howl": (0.98, 1.04, -8)}[state]
    lays.append(contact_shadow(BR["x"], hz, 520))
    lays.append(Layer("01_brazil__char_" + char, "sprite", BR["x"], hz + 6, BR["ball"], rot, sx, sy,
                      bottom_anchor=True, glow=50))
    if state == "howl":
        lays.append(claws(0.75))
    return compose("01_brazil__bg", lays, hz, acc)


# ------------------------------------------------------------------ USA
US = dict(ball=0.56, x=540)


def usa(state):
    hz = HZ["02_usa"]
    acc = (1.0, 0.6, 0.15)
    lays = [Layer("02_usa__map", "screen", W / 2 + 20, 480, 0.84, anchor="content", glow=16, op=0.8),
            Layer("02_usa__title", "key", W / 2, 430, 0.82, anchor="content", crop_rows=566, glow=24)]
    char = {"enter": "blink", "lit": "normal", "wink": "pumpkin_wink"}[state]
    x, rot = (US["x"] - 60, 14) if state == "enter" else (US["x"], 0)
    lays.append(contact_shadow(x, hz, 560))
    lays.append(Layer("02_usa__char_" + char, "sprite", x, hz + 6, US["ball"], rot, bottom_anchor=True, glow=50))
    if state == "enter":
        lays.append(claws(1.0))
        lays.append(tint((0.75, 1.0, 0.35), 0.12))
    if state == "wink":
        lays.append(Layer("02_usa__smoke", "screen", 860, 1250, 0.8, anchor="content", op=0.85))
    return compose("02_usa__bg", lays, hz, acc)


# ------------------------------------------------------------------- UK
def uk(state):
    hz = HZ["03_uk"]
    acc = (0.5, 0.85, 1.0)
    lays = [Layer("03_uk__map", "screen", 800, 560, 0.5, anchor="content", glow=18, op=0.85),
            Layer("03_uk__title", "key", 470, 430, 0.82, anchor="content", glow=24)]
    if state == "sheet":
        lays += [contact_shadow(540, hz, 520),
                 Layer("03_uk__char_normal", "sprite", 540, hz + 6, 0.56, bottom_anchor=True, glow=50),
                 Layer("03_uk__sheet", "sprite", 600, 690, 0.5, rot=18, anchor="content")]
    elif state == "ghost":
        lays += [contact_shadow(540, hz, 330, 0.45),
                 Layer("03_uk__char_ghost", "sprite", 540, hz - 110, 0.6, bottom_anchor=True, glow=60)]
    else:
        lays += [Layer("03_uk__char_ghost_boo", "sprite", 540, hz + 240, 1.05, bottom_anchor=True, glow=60),
                 tint((0.92, 0.97, 1.0), 0.18)]
    return compose("03_uk__bg", lays, hz, acc)


# ----------------------------------------------------------------- Japan
FLAMES = [(170, 820, 0.2), (930, 760, 0.18), (130, 1130, 0.15), (960, 1100, 0.16)]


def japan(state):
    hz = HZ["04_japan"]
    acc = (1.0, 0.2, 0.25)
    lays = [Layer("04_japan__map", "screen", 790, 560, 0.62, anchor="content", glow=18, op=0.8),
            Layer("04_japan__title", "key", W / 2, 470, 0.88, anchor="content", glow=24)]
    if state != "halves":
        lays += [Layer("04_japan__flame", "screen", x, y, k, anchor="content", glow=20) for x, y, k in FLAMES]
    lays.append(contact_shadow(540, hz, 520))
    if state == "halves":
        lays += [Layer("04_japan__char_normal", "sprite", 540, hz + 6, 0.58, bottom_anchor=True, glow=50),
                 Layer("04_japan__mask_left", "sprite", 170, 1020, 0.3, rot=-28, anchor="content"),
                 Layer("04_japan__mask_right", "sprite", 910, 1020, 0.3, rot=28, anchor="content")]
    elif state == "glow":
        lays.append(Layer("04_japan__char_mask_glow", "sprite", 540, hz + 6, 0.58, bottom_anchor=True, glow=50))
    else:
        lays += [Layer("04_japan__char_mask_turn", "sprite", 560, hz + 330, 1.15, bottom_anchor=True, glow=50),
                 tint((0, 0, 0), 0.15)]
    return compose("04_japan__bg", lays, hz, acc)


# ----------------------------------------------------------------- Egypt
def egypt(state):
    hz = HZ["05_egypt"]
    acc = (1.0, 0.8, 0.25)
    lays = [Layer("05_egypt__map", "screen", 790, 560, 0.62, anchor="content", glow=16, op=0.8),
            Layer("05_egypt__title", "key", W / 2, 470, 0.85, anchor="content", glow=24),
            contact_shadow(540, hz, 520)]
    char = {"wrap": "normal", "half": "half", "mummy": "mummy"}[state]
    lays.append(Layer("05_egypt__char_" + char, "sprite", 540, hz + 6, 0.58, rot=-10 if state == "wrap" else 0,
                      bottom_anchor=True, glow=50))
    if state == "wrap":
        lays.append(Layer("05_egypt__bandage", "sprite", 560, 1000, 0.7, rot=70, anchor="content"))
    if state == "mummy":
        lays.append(Layer("05_egypt__bandage", "sprite", 930, 1000, 0.6, rot=-35, anchor="content"))
    return compose("05_egypt__bg", lays, hz, acc)


# --------------------------------------------------------------- Romania
BATS = [(170, 880, 0.17, "1", -10), (900, 820, 0.15, "2", 12), (230, 1150, 0.12, "3", 6), (860, 1120, 0.13, "1", -6)]


def romania(state):
    hz = HZ["06_romania"]
    acc = (0.75, 0.25, 1.0)
    lays = [Layer("06_romania__moon", "screen", 280, 300 if state != "cocoon" else 420, 0.36, anchor="content",
                  glow=30, op=0.85),
            Layer("06_romania__map", "screen", 790, 560, 0.62, anchor="content", glow=16, op=0.8),
            Layer("06_romania__title", "key", W / 2, 420, 0.86, anchor="content", glow=24),
            contact_shadow(540, hz, 520)]
    char = {"cocoon": "cocoon", "vampire": "vampire", "open": "open"}[state]
    lift = 0 if state == "cocoon" else 70
    lays.append(Layer("06_romania__char_" + char, "sprite", 540, hz + 6 - lift, 0.56, bottom_anchor=True, glow=50))
    if state != "cocoon":
        lays += [Layer("06_romania__bat_" + b, "sprite", x, y, k, rot=r, anchor="content") for x, y, k, b, r in BATS]
    if state == "open":
        lays.append(Layer("06_romania__bat_2", "sprite", 700, 1500, 0.95, rot=-12, anchor="content"))
    return compose("06_romania__bg", lays, hz, acc)


# ---------------------------------------------------------------- Guests
RING = [(150, 1400, 0.3), (330, 1270, 0.27), (470, 1170, 0.25), (630, 1170, 0.25), (780, 1270, 0.27),
        (950, 1400, 0.3)]


def guests(state):
    hz = HZ["07_guests"]
    acc = (1.0, 0.15, 0.15)
    lays = []
    if state == "scared":
        lays.append(Layer("07_guests__title", "key", W / 2, 520, 0.85, anchor="content", glow=26))
    order = [2, 3, 1, 4, 0, 5]
    for j in order:
        x, y, k = RING[j]
        name = ("07_guests__scared_" if state == "scared" else "07_guests__happy_") + SIX[j]
        hop = 0 if state == "scared" else (40 if j % 2 else 0)
        lays.append(contact_shadow(x, y, 260 * k / 0.25, 0.6))
        lays.append(Layer(name, "sprite", x, y - hop, k, bottom_anchor=True, glow=30))
    if state == "scared":
        def shadow(c):
            m = np.zeros(c.shape[:2], np.float32)
            import cv2
            cv2.ellipse(m, (560, 1500), (760, 300), 0, 0, 360, 1, -1)
            cv2.circle(m, (620, 760), 520, 0.5, -1)
            return c * (1 - cv2.GaussianBlur(m, (0, 0), 50)[..., None] * 0.7)
        lays.insert(0, Layer(kind="raw", fn=shadow))
    return compose("07_guests__bg", lays, hz, acc)


# ----------------------------------------------------------------- Earth
def earth(state):
    hz = HZ["08_earth"]
    acc = (0.55, 1.0, 0.2)
    lays = []
    if state != "rise":
        lays.append(Layer("08_earth__title", "key", W / 2, 240, 0.9, anchor="content", glow=30))
    char = {"rise": "friendly", "eyes": "eyes", "grin": "grin"}[state]
    y = {"rise": hz + 60, "eyes": hz - 170, "grin": hz - 150}[state]
    lays.append(Layer("08_earth__char_" + char, "sprite", 540, y, 0.74, rot=6 if state == "grin" else 0,
                      bottom_anchor=True, glow=90))
    if state == "grin":
        lays.append(Layer("08_earth__subtitle", "key", 470, 430, 0.6, rot=-4, anchor="content", glow=16))
    xs = [120, 285, 450, 615, 780, 945]
    for i, n in enumerate(SIX):
        name = ("07_guests__scared_" if state != "rise" else "07_guests__happy_") + n
        jit = (6 if i % 2 else -6) if state == "grin" else 0
        lays.append(contact_shadow(xs[i] + jit, hz + 20, 170, 0.6))
        lays.append(Layer(name, "sprite", xs[i] + jit, hz + 20, 0.155, rot=jit, bottom_anchor=True, glow=24))
    if state == "rise":
        lays.append(tint((0, 0, 0), 0.45))
    if state == "eyes":
        lays.append(tint((0.45, 1.0, 0.2), 0.08))
    return compose("08_earth__bg", lays, hz, acc)


# ----------------------------------------------------------------- Final
FLEE = [(220, 820, 0.36), (860, 820, 0.34), (190, 1060, 0.34), (890, 1060, 0.34), (330, 1250, 0.3),
        (750, 1250, 0.3)]
FINAL_PUMPKINS = [("red", (110, 420)), ("blue", (970, 420)), ("green", (80, 900)), ("yellow", (1000, 900)),
                  ("purple", (110, 1300)), ("orange", (970, 1300))]


def final():
    hz = HZ["09_final"]
    acc = (0.7, 0.4, 1.0)
    lays = [Layer("09_final__title", "key", W / 2, 230, 1.0, anchor="content", glow=30),
            Layer("08_earth__char_wink", "sprite", 540, 900, 0.5, rot=-6, bottom_anchor=True, glow=60)]
    for (x, y, k), n in zip(FLEE, SIX):
        lays.append(Layer("09_final__flee_" + n, "sprite", x, y, k, bottom_anchor=True, glow=30))
    cols = {"red": (1, 0.2, 0.15), "blue": (0.3, 0.8, 1), "green": (0.5, 1, 0.2), "yellow": (1, 0.85, 0.2),
            "purple": (0.7, 0.3, 1), "orange": (1, 0.5, 0.1)}
    tr = []
    for (n, (px, py)), (fx, fy, _) in zip(FINAL_PUMPKINS, FLEE):
        tr.append((bezier((fx, fy - 60), ((fx + px) / 2, min(fy, py) - 220), (px, py)), cols[n]))
    lays.insert(1, trails([t[0] for t in tr], [t[1] for t in tr], 3, 34))
    lays += [pumpkin(n, xy, scale=0.15) for n, xy in FINAL_PUMPKINS]
    return compose("09_final__bg", lays, hz, acc)


# approximate timecodes on the 5-beat grid (guests/earth/final lengths to be confirmed)
TC2 = ["00:09.6", "00:10.8", "00:12.4", "00:12.7", "00:13.9", "00:15.4", "00:15.9", "00:17.1", "00:18.6",
       "00:19.0", "00:20.2", "00:21.7", "00:22.2", "00:24.0", "00:25.6", "00:27.0", "00:28.6", "00:30.5"]
FRAMES2 = [
    ("03a_uk_sheet", lambda: uk("sheet"), "Белая ткань кружится и падает на британский шар"),
    ("03b_uk_ghost", lambda: uk("ghost"), "Призрак с Union Jack парит над полом, отражение внизу"),
    ("03c_uk_boo", lambda: uk("boo"), "Огромные глаза, бросок в камеру, ткань закрывает кадр"),
    ("04a_japan_halves", lambda: japan("halves"), "Половинки маски летят слева и справа"),
    ("04b_japan_glow", lambda: japan("glow"), "Маска собрана, красные глаза, голубое пламя вокруг"),
    ("04c_japan_turn", lambda: japan("turn"), "Поворот головы, маска летит в камеру, переход через глазницу"),
    ("05a_egypt_wrap", lambda: egypt("wrap"), "Египет выкатывается, бинт закручивается вокруг"),
    ("05b_egypt_half", lambda: egypt("half"), "Наполовину обмотан, крутится на месте"),
    ("05c_egypt_mummy", lambda: egypt("mummy"), "Мумия, зелёные глаза, конец бинта хлещет по экрану"),
    ("06a_romania_cocoon", lambda: romania("cocoon"), "Закрытый плащ, луна поднимается"),
    ("06b_romania_vampire", lambda: romania("vampire"), "Плащ раскрыт, клыки, ухмылка, летучие мыши"),
    ("06c_romania_open", lambda: romania("open"), "Плащ как крылья, последняя мышь летит в камеру"),
    ("07a_guests_party", lambda: guests("party"), "Шестеро веселятся полукругом и подпрыгивают"),
    ("07b_guests_shadow", lambda: guests("scared"), "Огромная тень, все смотрят вверх, ONE MORE GUEST..."),
    ("08a_earth_rise", lambda: earth("rise"), "Из темноты поднимается дружелюбная Земля"),
    ("08b_earth_eyes", lambda: earth("eyes"), "Глаза открываются и светятся зелёным, EARTH"),
    ("08c_earth_grin", lambda: earth("grin"), "Зубастая улыбка, NO COSTUME, гости дрожат"),
    ("09a_final", final, "Земля подмигивает, все разбегаются, WHICH ONE ARE YOU?"),
]

FRAMES = [
    ("00a_intro_flight", intro_flight, "00:00.8", "Тыквы влетают с цветными следами, заголовок начинает проявляться"),
    ("00b_intro_title", intro_title, "00:01.6", "Заголовок собран, у фиолетовой тыквы мелькает глаз"),
    ("00c_intro_dive", intro_dive, "00:02.4", "Зелёная тыква летит в камеру, экран заливает зелёным"),
    ("01a_brazil_land", lambda: brazil("land"), "00:02.7", "Бразилия падает и сплющивается, вспыхивают BRAZIL и карта"),
    ("01b_brazil_wolf", lambda: brazil("wolf"), "00:03.9", "Поднимается луна, уши, клыки, злые глаза"),
    ("01c_brazil_howl", lambda: brazil("howl"), "00:04.9", "Вой; три следа когтей режут экран"),
    ("02a_usa_enter", lambda: usa("enter"), "00:05.2", "США выкатывается из-за следов когтей"),
    ("02b_usa_lit", lambda: usa("lit"), "00:06.2", "Тыквенные рёбра, лицо загорается изнутри"),
    ("02c_usa_wink", lambda: usa("wink"), "00:07.2", "Подмигивание, оранжевый дым закрывает кадр"),
]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    if sys.argv[1:] == ["2"]:
        for name, fn, desc in FRAMES2:
            save(fn(), os.path.join(OUT, name + ".jpg"))
            print(name, desc, flush=True)
        sys.exit()
    for name, fn, tc, desc in FRAMES:
        save(fn(), os.path.join(OUT, name + ".jpg"))
        print(name, tc, desc, flush=True)
