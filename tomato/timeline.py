"""Timeline for the 5-level tomato video: what happens at time t of each level.

Pure Python so both the Blender renderer and the compositor can import it.
"""
import math

# n cuts, intro / cutting / hold seconds, cube size, final piece count, counter label
LEVELS = {
    1: dict(n=10, intro=1.5, cut=6.0, hold=2.0, cube=None, pieces=11, label="SLICES"),
    2: dict(n=100, intro=1.5, cut=9.0, hold=2.0, cube=0.2, pieces=21_000, label="CUBES"),
    3: dict(n=250, intro=1.5, cut=11.0, hold=2.0, cube=0.11, pieces=312_000, label="CUBES"),
    4: dict(n=500, intro=1.5, cut=13.0, hold=2.5, cube=0.06, pieces=2_450_000, label="CUBES"),
    5: dict(n=1000, intro=1.5, cut=17.0, hold=4.0, cube=0.034, pieces=19_400_000, label="CUBES"),
}
SOLID_PHASE = 0.45  # share of cuts during which the tomato still holds its shape
CHOP = 0.6          # seconds per knife cycle on level 1
SLAB = 2.0 / 11     # slice thickness on level 1 (tomato radius 1)


def duration(lv):
    L = LEVELS[lv]
    return L["intro"] + L["cut"] + L["hold"]


def level_frames(lv, fps):
    n = int(round(duration(lv) * fps))
    return [(i, i / fps) for i in range(n)]


def _ease(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def _hash01(*xs):
    h = math.sin(sum((i + 1) * 12.9898 * x for i, x in enumerate(xs))) * 43758.5453
    return h - math.floor(h)


def chop_times(lv):
    L = LEVELS[lv]
    return [L["intro"] + (k + 0.5) * CHOP for k in range(L["n"])]


def cuts_at(lv, t):
    L = LEVELS[lv]
    if lv == 1:
        return sum(1 for tc in chop_times(lv) if tc <= t)
    u = (t - L["intro"]) / L["cut"]
    if u <= 0:
        return 0
    if u >= 1:
        return L["n"]
    return int(L["n"] * (0.25 * u + 0.75 * u * u))


def cut_times(lv):
    """Exact moment of every cut, for the sound track."""
    L = LEVELS[lv]
    if lv == 1:
        return chop_times(lv)
    out = []
    for k in range(1, L["n"] + 1):
        # invert n = N(0.25u + 0.75u^2)
        f = k / L["n"]
        u = (-0.25 + math.sqrt(0.0625 + 3 * f)) / 1.5
        out.append(L["intro"] + u * L["cut"])
    return out


def pieces_at(lv, t):
    L = LEVELS[lv]
    n = cuts_at(lv, t)
    if lv == 1:
        return n + 1
    frac = n / L["n"]
    if frac <= SOLID_PHASE:
        return 0
    v = (frac - SOLID_PHASE) / (1 - SOLID_PHASE)
    p = L["pieces"] * v ** 1.5
    step = 10 if p < 100_000 else 1000
    return int(round(p / step) * step)


def state_at(lv, t):
    L = LEVELS[lv]
    r4 = lambda x: round(x, 4)
    if lv == 1:
        cuts = cuts_at(lv, t)
        times = chop_times(lv)
        falls = [r4(_ease((t - times[k]) / 0.35)) for k in range(cuts)]
        st = dict(mode="slices", cuts_done=cuts, falls=falls)
        if t < L["intro"]:
            st.update(knife="solid", kplane=r4(-1 + SLAB), kheight=1.6)
        elif t < L["intro"] + L["cut"]:
            k = min(int((t - L["intro"]) / CHOP), L["n"] - 1)
            p = (t - L["intro"] - k * CHOP) / CHOP
            down, up = 1.6, -0.9
            h = down + (up - down) * (p / 0.5) ** 2 if p < 0.5 else up + (down - up) * _ease((p - 0.5) / 0.5)
            st.update(knife="solid", kplane=r4(-1 + (k + 1) * SLAB), kheight=r4(h))
        return st

    if t < L["intro"]:
        return dict(mode="pile", cut=0, pile=0, seams=0, cube=L["cube"],
                    knife="solid", kplane=0.0, kheight=1.15, ktilt=-22)
    if t >= L["intro"] + L["cut"]:
        return dict(mode="pile", cut=1, pile=1, seams=0, cube=L["cube"])
    frac = cuts_at(lv, t) / L["n"]
    seed = int(t * 1000) + lv * 100000
    st = dict(mode="pile", cube=L["cube"], knife="blur", kphase=r4(_hash01(t, lv)), seed=seed)
    if frac <= SOLID_PHASE:
        st.update(cut=0, pile=0, seams=r4(frac / SOLID_PHASE),
                  kplane=r4(-0.7 + 1.4 * _hash01(t * 3.1, lv)))
    else:
        v = (frac - SOLID_PHASE) / (1 - SOLID_PHASE)
        st.update(cut=r4(v), pile=r4(max(0.02, v)), seams=1, falling=True,
                  kplane=r4(-1 + 2 * v + 0.02))
    return st


if __name__ == "__main__":
    total = sum(duration(lv) for lv in LEVELS)
    print("total seconds:", total)
    for lv in LEVELS:
        print(lv, duration(lv), [cuts_at(lv, x) for x in (2, 5, 8)], pieces_at(lv, duration(lv) - 0.1))
