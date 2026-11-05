# A Day in Japan: original calm electronic loop, 96 BPM, 20 s = 8 bars; downbeats land on every clock change (1.5, 4, …, 16.5, 19 s).
# Everything is written into a circular buffer, so tails wrap to the start and the loop is seamless.
# usage: python3 -I audio_dj.py outdir
import sys, wave
import numpy as np
SR = 48000; DUR = 20.0; N = int(SR * DUR); out = sys.argv[1]
rng = np.random.default_rng(5)
BEAT = 60 / 96; BAR = 4 * BEAT; T0 = 1.5 - BAR          # bar lines at -1.0, 1.5, 4.0 … (period 2.5 s)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-6)) * np.exp(-t / d)
def sine(f, n): f = np.full(n, f) if np.isscalar(f) else f; return np.sin(2 * np.pi * np.cumsum(f) / SR)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
norm = lambda x: x / (np.abs(x).max() + 1e-9)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, x, t, g=1.):
    i = int(round(t * SR)) % N; idx = (np.arange(len(x)) + i) % N; np.add.at(buf, idx, x * g)
# ───────── instruments
def kick(g=1): n = int(SR * .3); t = np.arange(n) / SR; return norm(sine(46 + 55 * np.exp(-t * 28), n) * env(n, .004, .11)) * g
def snap(): n = int(SR * .16); return norm(lp(hp(rng.standard_normal(n), 1800), 7000) * env(n, .001, .03))
def hat(): n = int(SR * .05); return norm(hp(rng.standard_normal(n), 8000) * env(n, .0004, .007))
def ep(m, d=.9):   # soft electric-piano pluck
    n = int(SR * d); f = midi(m); return lp((sine(f, n) + .35 * sine(2 * f, n) * env(n, .001, .12) + .12 * sine(3 * f, n) * env(n, .001, .05)) * env(n, .004, d * .35), 3200)
def bass(m, d): n = int(SR * d); f = midi(m); return lp((sine(f, n) + .1 * sine(2 * f, n)) * env(n, .01, d * .7), 380)
def pad(ch, d, fc=1400):
    n = int(SR * d); t = np.arange(n) / SR; x = sum(sine(midi(c), n) + .6 * sine(midi(c) * 1.005, n) + .3 * sine(midi(c) * .996, n) for c in ch) / len(ch)
    return lp(x * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5), fc)
def bell(m, d=1.4): n = int(SR * d); f = midi(m); return (sine(f, n) + .45 * sine(f * 2.76, n) * env(n, .001, .2) + .2 * sine(f * 5.4, n) * env(n, .001, .07)) * env(n, .002, d * .32)
CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]   # Fmaj7 Em7 Dm7 Cmaj7
RT = [41, 40, 38, 36]
ARP = [0, 2, 3, 1, 2, 3, 2, 1]
# day density: night at both ends (0–1.5 and 14–20), full groove 4–14
def dens(t):
    t %= DUR
    if t < 1.5 or t >= 16.5: return 0
    if t < 4: return 1
    if t < 14: return 2
    return 1
L = {k: np.zeros(N) for k in ('drums', 'bass', 'keys', 'pad', 'fx')}
for b in range(8):
    tb = T0 + b * BAR + BAR; ch = CH[b % 4]; rt = RT[b % 4]           # bars start at 1.5, 4.0, …, 19.0 (19.0 wraps into -1.0)
    put(L['pad'], pad(ch, BAR + .4), tb - .2, .22)
    for k in range(4):
        t = tb + k * BEAT; d = dens(t)
        if d >= 1 and k in (0, 2): put(L['drums'], kick(.7 if d == 2 else .45), t)
        if d == 2 and k in (1, 3): put(L['drums'], snap(), t, .14)
        if d >= 1: put(L['bass'], bass(rt, BEAT * .9), t, .32 if d == 2 else .22)
        for h in (0, .5):
            th = t + h * BEAT; j = (k * 2 + int(h * 2)) % 8
            if d == 2: put(L['drums'], hat(), th, .035 if h == 0 else .06)
            if d >= 1: put(L['keys'], ep(ch[ARP[j]] + 12, .7), th, .11 if d == 2 else .09)
            elif h == 0 and k in (0, 2): put(L['keys'], ep(ch[ARP[j]] + 12, 1.4), th, .08)   # night: sparse notes, more air
music = sum(L.values())
# ───────── interface accents (quiet; no clock ticking)
def flip(): n = int(SR * .05); return norm(hp(rng.standard_normal(n), 3000) * env(n, .0008, .008) + sine(2600, n) * env(n, .0005, .006) * .4)
def swell(dur, f0, f1, shape): n = int(SR * dur); u = np.arange(n) / n; c = shape(u); return norm(lp_var(hp(rng.standard_normal(n), 150), f0 + (f1 - f0) * c) * c)
def lp_var(x, fc):
    y = np.empty_like(x); s = 0.
    for i in range(len(x)): a = np.exp(-2 * np.pi * fc[i] / SR); s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def hitf(): n = int(SR * 1.8); k = np.pad(kick(.6), (0, n))[:n]; return norm(bell(72, 1.8) + k) * .7
S = {'hit': hitf,
     'flip': flip, 'rise': lambda: swell(1.4, 300, 3000, lambda u: np.sin(np.pi * u ** .7) ** 2) * .5,
     'whoosh': lambda: swell(.8, 400, 4200, lambda u: np.sin(np.pi * u) ** 2) * .6,
     'pop': lambda: sine(520 + 420 * np.exp(-np.arange(int(SR * .09)) / SR * 40), int(SR * .09)) * env(int(SR * .09), .001, .025),
     'accent': lambda: norm(bell(84, 1.2)) * .6,
     'shimmer': lambda: norm(sum(np.pad(bell(m, 1.2), (int(SR * .06 * i), int(SR * .4)))[:int(SR * 1.5)] for i, m in enumerate((88, 91, 95, 100)))) * .55,
     'low': lambda: norm(bass(29, 1.6) + .3 * bell(60, 1.6)) * .7}
G = {'hit': .5, 'flip': .28, 'rise': .4, 'whoosh': .4, 'pop': .45, 'accent': .45, 'shimmer': .45, 'low': .55}
EV = [[0, 'hit'], [1.5, 'flip'], [1.67, 'flip'], [1.84, 'flip'], [1.6, 'rise'], [4, 'flip'], [4.15, 'whoosh'], [6.5, 'flip'], [6.6, 'pop'], [9, 'flip'], [9, 'accent'],
      [11.5, 'flip'], [12.05, 'shimmer'], [14, 'flip'], [14.1, 'low'], [16.5, 'accent']]
fx = np.zeros(N)
for t, k in EV: put(fx, S[k](), t, G[k])
rms = lambda x: np.sqrt(np.mean(x ** 2))
mix = music / rms(music) * 10 ** (-20 / 20) + fx * .6
mix = np.tanh(mix * 1.1) / 1.1; mix *= 10 ** (-1.5 / 20) / np.abs(mix).max()
x = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype('<i2')
with wave.open(out + '/mix.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
print('ok', round(20 * np.log10(rms(mix)), 1), 'dB rms')
