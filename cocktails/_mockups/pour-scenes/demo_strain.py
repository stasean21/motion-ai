# Демо 6 с: шейкер наливает маргариту в пустой бокал, уровень растёт до краёв, сверху падает лайм.
# K=1.1477 python3 -I demo_strain.py [кадр ...] → out/demo-strain-6s.mp4 (или отдельные кадры для проверки)
import subprocess
import sys

import lib
from lib import *

FPS, DUR = 30, 6.0
N = int(FPS * DUR)
ONLY = [int(a) for a in sys.argv[1:]]
ease = lambda k: (lambda k: k * k * (3 - 2 * k))(np.clip(k, 0, 1))
seg = lambda t, a, b: float(np.clip((t - a) / (b - a), 0, 1))

src, empty = load(SOURCE), load('glass-salt')
tin_rgb, tin_a = cutout('shaker-open', (276, 858, 592, 1396))
lime_rgb, lime_a = cutout('lime-wheel', (298, 632, 650, 1014))
LIP = (582, 872)
FRONT = np.clip(empty - blur(empty, 3), 0, 1) * (sm(812, 822, YY) * sm(2, -2, np.abs(XX - GX) - coupe_hw(YY)))[..., None] * .7

# уровень от объёма: поток постоянный, объём чаши ∫ hw² dy — внизу узко, уровень бежит быстро, у края медленно
ys = np.arange(1040, 811, -1, dtype=np.float64)
vol = np.concatenate([[0], np.cumsum(coupe_hw(ys[:-1]) ** 2)])
vol /= vol[-1]
T_POUR0, T_POUR1 = 0.9, 4.1


def level_at(t):
    return float(np.interp(seg(t, T_POUR0 + .25, T_POUR1), vol, ys))


def tin_pose(t):
    """Шейкер въезжает слева сверху, наклоняется, в конце выпрямляется и уходит вверх."""
    k_in, k_out = ease(seg(t, 0, .9)), ease(seg(t, 4.15, 4.9))
    ang = -40 - 78 * k_in + 50 * k_out
    to = (470 - 260 * (1 - k_in) - 260 * k_out, 600 - 230 * (1 - k_in) - 900 * k_out)  # уходит целиком за верх кадра
    return ang, to


def frame_at(i):
    t = i / FPS
    r = np.random.default_rng(1000 + i)
    lib.rng = np.random.default_rng(2000 + i)  # брызги и пузырьки меняются от кадра к кадру
    lv = level_at(t)
    img, liq = fill_coupe(empty, lv, src) if lv < 1036 else (empty.copy(), np.zeros((H, W), np.float32))
    ang, to = tin_pose(t)
    rgb, a = transform(tin_rgb, tin_a, LIP, ang, .82, to)
    lips = [tpt((x, 872)) for x in (282, 332, 432, 532, 582)]
    sx, sy = max(lips, key=lambda p: p[1])
    hit = (440, min(lv, 1030))
    pouring = T_POUR0 <= t <= T_POUR1 + .35
    if pouring:
        # передний конец падает от губы до поверхности за 0.25 с; в конце хвост отрывается и падает
        fall = lambda dt: sy + (hit[1] - sy) * min(1, (dt / .25) ** 1.6)
        head = fall(t - T_POUR0)
        tail = fall(t - T_POUR1) if t > T_POUR1 else None
        w0 = 14 * (.5 + .5 * ease(seg(t, T_POUR0, T_POUR0 + .3))) * (1 - .45 * ease(seg(t, T_POUR1 - .4, T_POUR1)))
        img = stream(img, (sx + 4, sy - 30), hit, w0=w0, kind='cloudy', bend=.65, t=t, head=head, tail=tail)
        if head >= hit[1] - 2 and (tail is None or tail < hit[1] - 4):
            hwl = max(float(coupe_hw(lv)), 6)
            surf = sm(1.0, .9, np.sqrt(((XX - GX) / hwl) ** 2 + ((YY - lv) / (.085 * hwl)) ** 2)) if lv < 1036 else None
            img = splash(img, *hit, 22 + 10 * r.random(), 'cloudy', n=10, height=(10 + 6 * r.random(), 26), spread=6, foam=surf)
            if lv < 1030:
                img = bubbles(img, hit[0], hit[1] + 4, depth=min(110, 1040 - lv), n=160, mask=liq)
    # передняя стенка бокала поверх струи
    img = img + FRONT
    img = over(img, rgb, a)
    # лайм падает с 4.5 до 5.2 с и садится на ободок с маленьким отскоком
    if t >= 4.4:
        k = seg(t, 4.4, 5.2)
        y = -150 + (790 + 150) * k * k
        bounce = 6 * np.sin(np.pi * seg(t, 5.2, 5.45)) if t > 5.2 else 0
        rot = 60 - 42 * ease(k)
        lr, la = transform(lime_rgb, lime_a, (474, 835), rot, .66, (690, y - bounce))
        vy = 2 * (790 + 150) * k / .8 / FPS if t < 5.2 else 0
        if vy > 1:
            lr, la = motion_blur(lr, la, 0, min(vy, 40))
        img = over(img, lr, la)
        if 5.2 <= t < 5.5:  # капли от удара о край
            for _ in range(5):
                img = drop(img, 690 + r.normal(0, 40), 760 - 60 * seg(t, 5.2, 5.5) + r.normal(0, 12), r.uniform(1, 1.8), 'cloudy', .8)
    # камера: медленный наезд к бокалу, рамка не двигается
    z = 1 + .06 * ease(t / DUR)
    cx, cy = W / 2, (900 / PH) * H
    M = np.float32([[z, 0, cx - z * cx], [0, z, cy - z * cy]])
    img = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return frame(img)


if ONLY:
    for i in ONLY:
        save(frame_at(i), f'out/demo-{i:03d}.jpg')
        print(i)
    sys.exit()

ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-vf', 'scale=1080:1920', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', 'out/tmp-demo.mp4'],
                      stdin=subprocess.PIPE)
for i in range(N):
    ff.stdin.write((np.clip(frame_at(i), 0, 1) * 255).astype(np.uint8).tobytes())
    if i % 15 == 0:
        print(i, '/', N, flush=True)
ff.stdin.close()
ff.wait()
