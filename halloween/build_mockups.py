"""Static mockups (for approval) assembled from the generated layers. No animation here."""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from compose import (H, W, Layer, bezier, claws, compose, contact_shadow, save, tint, trails)  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mockups")
K = W / 941
HZ = {"00_intro": 1049 * K, "01_brazil": 1103 * K, "02_usa": 1057 * K}

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
    for name, fn, tc, desc in FRAMES:
        save(fn(), os.path.join(OUT, name + ".jpg"))
        print(name, tc, desc, flush=True)
