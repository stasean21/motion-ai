# Звук к демо: тихая подложка, струя в бокал (тон растёт по мере наполнения), всплески, щелчок лайма.
# python3 -I demo_audio.py → out/demo-audio.wav
import wave

import numpy as np

SR, DUR = 48000, 6.0
n = int(SR * DUR)
t = np.arange(n) / SR
rng = np.random.default_rng(3)
out = np.zeros(n)


def env(a, b, att=.02, rel=.1):
    return np.clip((t - a) / att, 0, 1) * np.clip((b - t) / rel, 0, 1)


def bandpass(x, f, q):
    # резонансный двухполюсный фильтр с меняющейся частотой (f — массив)
    y = np.zeros_like(x)
    y1 = y2 = 0.0
    for i in range(len(x)):
        w = 2 * np.pi * f[i] / SR
        r = 1 - w / (2 * q)
        y0 = x[i] + 2 * r * np.cos(w) * y1 - r * r * y2
        y[i] = y0
        y2, y1 = y1, y0
    return y / (np.abs(y).max() + 1e-9)


# подложка: мягкий аккорд ля минор, медленно дышит
for f, v in ((110, .05), (164.8, .035), (220, .03), (261.6, .025), (329.6, .02)):
    out += v * np.sin(2 * np.pi * f * t) * (.75 + .25 * np.sin(2 * np.pi * .25 * t + f)) * env(0, DUR, .8, .8)

# струя: шум через резонанс, частота растёт, пока бокал наполняется
noise = rng.standard_normal(n)
P0, P1 = 0.9, 4.1
f = 500 + 900 * np.clip((t - P0) / (P1 - P0), 0, 1) ** .7
gurgle = 1 + .35 * np.sin(2 * np.pi * 9 * t + 3 * np.sin(2 * np.pi * 2.3 * t))
pour = bandpass(noise, f, 4.0) * .6 + np.convolve(noise, np.ones(6) / 6, 'same') * .25
out += .32 * pour * gurgle * env(P0 + .2, P1 + .3, .08, .25)
# первый удар струи о дно и капли в конце
for a, v in ((1.15, .3), (4.35, .2), (4.42, .12)):
    k = (t >= a) & (t < a + .12)
    out[k] += v * np.sin(2 * np.pi * (900 - 2500 * (t[k] - a)) * (t[k] - a)) * np.exp(-(t[k] - a) * 40)
# лайм: свист падения и тихий стеклянный щелчок о край
out += .05 * bandpass(noise, 1800 + 0 * t, 2.0) * env(4.5, 5.2, .3, .05)
for f0, v in ((2349, .16), (3136, .1), (4699, .05)):
    k = t >= 5.2
    out[k] += v * np.sin(2 * np.pi * f0 * (t[k] - 5.2)) * np.exp(-(t[k] - 5.2) * 9)
out *= np.clip((DUR - t) / .5, 0, 1)
out = out / np.abs(out).max() * .89
st = np.stack([out, out * .97 + .03 * np.roll(out, 240)], 1)
with wave.open('out/demo-audio.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
