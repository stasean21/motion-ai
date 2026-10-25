# Music + SFX for the 7 s map test. Attacks on frame boundaries: sample = round(t·60)·800.
import sys, wave, numpy as np
SR = 48000; N = 7 * SR; rng = np.random.default_rng(3); out = sys.argv[1]
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-6)) * np.exp(-t / d)
def sine(f, n): f = np.full(n, f) if np.isscalar(f) else f; return np.sin(2 * np.pi * np.cumsum(f) / SR)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, x, t, g=1.):
    i = int(round(t * 60)) * 800
    if i < N: x = x[:N - i]; buf[i:i + len(x)] += x * g
def pluck(m, d=.35):
    n = int(SR * d); f = midi(m); x = (sine(f, n) + .5 * sine(2 * f, n) + .2 * sine(3 * f, n)) * env(n, .002, d * .28); return lp(x, 3500)
mus = np.zeros(N); sfx = np.zeros(N)
bpm = 104; beat = 60 / bpm
prog = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [57, 60, 64]]          # Am F G Am — light, slightly cheeky
for b in range(int(7 / beat) + 1):
    t = b * beat; ch = prog[(b // 4) % 4]
    put(mus, pluck(ch[b % 3] + 12, .3), t, .35)                            # pizzicato melody on the beat
    put(mus, pluck(ch[(b + 1) % 3] + 12, .22), t + beat / 2, .2)
    if b % 2 == 0: put(mus, pluck(ch[0] - 12, .6), t, .5)                 # bass
    n = int(SR * .05); put(mus, lp(rng.standard_normal(n), 6000) * env(n, .001, .01), t + beat / 2, .08)   # shaker
# angry section: music drops to bass only 2.75–3.6 (handled by ducking)
duck = np.ones(N); a, b = int(2.75 * SR), int(3.6 * SR); duck[a:b] = .45; duck[b:b + 4800] = np.linspace(.45, 1, 4800)
mus *= duck
fade = np.ones(N); fade[-int(.5 * SR):] = np.linspace(1, 0, int(.5 * SR)); fade[:2400] = np.linspace(0, 1, 2400)
def pop(pitch):
    n = int(SR * .16); t = np.arange(n) / SR; return sine(pitch * np.exp(-t * 18) + 180, n) * env(n, .001, .045)
def whoosh(d=.7):
    n = int(SR * d); x = rng.standard_normal(n); x = lp(x, 1800) - lp(x, 300); t = np.arange(n) / n; return x * np.sin(np.pi * t) ** 2 / 3
def grr():
    n = int(SR * .85); t = np.arange(n) / SR; x = (sine(70 + 8 * np.sin(2 * np.pi * 15 * t), n) + .5 * lp(rng.standard_normal(n), 400)) * np.sin(np.pi * t / t[-1]); return x * .7
def slide():
    n = int(SR * 1.1); x = lp(rng.standard_normal(n), 2500) - lp(rng.standard_normal(n), 900); t = np.arange(n) / n
    return x * (np.sin(np.pi * t) ** .6) * (1 + .4 * np.sin(2 * np.pi * 9 * t)) / 3
SFXT = [(.55, whoosh(), .5), (1.25, pop(520), .8), (1.47, pop(600), .8), (2.0, pop(420), .9), (2.75, grr(), .55), (2.85, pluck(88, .25), .45),
        (4.45, slide(), .6), (5.6, pluck(81, .4), .5), (5.6, pop(700), .4)]
for t, x, g in SFXT: put(sfx, x, t, g)
mix = (mus * .55 + sfx) * fade
mix *= 10 ** (-1.5 / 20) / np.max(np.abs(mix))
x = (np.stack([mix, mix], 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
print('rms dB', round(20 * np.log10(np.sqrt(np.mean(mix ** 2))), 1))
