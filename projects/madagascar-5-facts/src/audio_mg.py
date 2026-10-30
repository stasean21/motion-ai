# Madagascar — 5 facts: 116 BPM warm organic-electronic score + SFX, driven by the page's event list (meta.json from render.cjs --stills ... meta)
# usage: python3 -I audio_mg.py meta.json outdir
import sys, wave, json
import numpy as np
SR = 48000; M = json.load(open(sys.argv[1])); EV = M['SFX']; VO = M['SCN']['vo']; DUR = M['SCN']['dur']; N = int(round(DUR * SR)); out = sys.argv[2]
rng = np.random.default_rng(11)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-6)) * np.exp(-t / d)
def sine(f, n): f = np.full(n, f) if np.isscalar(f) else f; return np.sin(2 * np.pi * np.cumsum(f) / SR)
def lp(x, fc):
    fc = np.full(len(x), fc) if np.isscalar(fc) else fc; y = np.empty_like(x); s = 0.
    a = np.exp(-2 * np.pi * fc / SR)
    for i in range(len(x)): s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, x, i, g=1.):
    i = int(i)
    if i < 0: x = x[-i:]; i = 0
    if i < N: x = x[:N - i]; buf[i:i + len(x)] += x * g
norm = lambda x: x / (np.abs(x).max() + 1e-9)
# ───────── music
BEAT = 60 / 116; BAR = 4 * BEAT
def kick(g=1): n = int(SR * .25); t = np.arange(n) / SR; return norm(sine(50 + 70 * np.exp(-t * 35), n) * env(n, .002, .08)) * g
def clap(): n = int(SR * .14); return norm(hp(rng.standard_normal(n), 900) * env(n, .001, .03))
def hat(d=.008): n = int(SR * .04); return norm(hp(rng.standard_normal(n), 7000) * env(n, .0003, d))
def pluck(m, d=.22, fc=3800): n = int(SR * d); f = midi(m); return lp((np.sign(sine(f, n)) * .3 + sine(2 * f, n) * .4 + sine(f, n) * .6) * env(n, .002, d * .28), fc)
def bell(m, d=1.2): n = int(SR * d); f = midi(m); return (sine(f, n) + .5 * sine(f * 2.76, n) * env(n, .001, .15) + .3 * sine(f * 5.4, n) * env(n, .001, .06)) * env(n, .002, d * .35)
def bass(m, d): n = int(SR * d); f = midi(m); return lp((sine(f, n) + .12 * np.sign(sine(f, n))) * env(n, .005, d * .5), 600)
def pad(ch, d, fc=1300): n = int(SR * d); t = np.arange(n) / SR; x = sum(sine(midi(c), n) + .5 * sine(midi(c) * 1.003, n) for c in ch) / len(ch); return lp(x * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5), fc)
CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]          # C Am F G — bright, curious
CHC = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [52, 55, 59]]         # cold section: Am F C Em
ROOT = [36, 45, 41, 43]; ROOTC = [45, 41, 36, 40]
MEL = [76, 79, 81, 79, 76, 74, 72, 74, 76, 72, 74, 76, 79, 76, 74, 72]
L = {k: np.zeros(N) for k in ('drums', 'bass', 'lead', 'pad', 'bells')}
def sec(t):
    for a, b, s in ((0, 3.2, 'intro'), (3.2, 21, 'light'), (21, 38, 'air'), (38, 55, 'night'), (55, 72, 'forest'), (72, 87, 'light'), (87, 99, 'out')):
        if a <= t < b: return s
for bar in range(int(DUR / BAR) + 1):
    t0 = bar * BAR
    for b in range(4):
        tb = t0 + b * BEAT; s = sec(tb); i = int(round(tb * SR)); s = {'night': 'water', 'forest': 'cold'}.get(s, s); cold = s == 'cold'
        ch = (CHC if cold else CH)[bar % 4]; rt = (ROOTC if cold else ROOT)[bar % 4]
        if tb < 3.2 and s != 'intro': continue
        if s in ('light', 'warm', 'out') and (b in (0, 2) or s == 'warm'): put(L['drums'], kick(.8), i)
        if s == 'air' and b == 0: put(L['drums'], kick(.55), i)
        if s == 'water' and b == 0: put(L['drums'], lp(kick(.7), 300), i)
        if s in ('warm', 'out') and b in (1, 3): put(L['drums'], clap(), i, .3)
        for h in (0, .5):
            j = int(round((tb + h * BEAT) * SR))
            if s in ('light', 'warm', 'out', 'air'): put(L['drums'], hat(), j, .08 if s != 'warm' else .12)
            if s == 'cold' and h == .5: put(L['drums'], hat(.004), j, .05)
            e = (bar % 2) * 8 + b * 2 + int(h * 2); m = MEL[e]
            if s in ('light', 'warm', 'out', 'intro'): put(L['lead'], pluck(m), j, .2 if s != 'intro' else .14)
            if s == 'air' and h == 0: put(L['lead'], pluck(m, .4, 2500), j, .14)
            if s == 'water': put(L['lead'], pluck(m - 12, .3, 900), j, .16)
            if s == 'cold' and h == 0 and b in (0, 2): put(L['bells'], bell(m + 12, 1.4), j, .1)
        if s in ('light', 'warm', 'out') : put(L['bass'], bass(rt, BEAT * .9), i, .45 if s == 'warm' else .35)
        if s in ('air', 'water', 'cold') and b == 0: put(L['bass'], bass(rt, BAR * .95), i, .3)
        if b == 0 and s in ('intro', 'air', 'cold', 'water'): put(L['pad'], pad(ch, BAR, 900 if s == 'water' else 1500), i, .16)
# a resolved ending: last bar holds a C chord, no drums after 92
put(L['pad'], pad([60, 64, 67, 72], 1.4), int(91.4 * SR), .2); put(L['lead'], pluck(84, .6), int(91.6 * SR), .2)
for a_ in (0, .82, 1.67): put(L['lead'], pluck(79, .4), int(a_ * SR), .25)
music = sum(L.values()); music[int(92.2 * SR):] *= np.linspace(1, .4, N - int(92.2 * SR))
# VO windows pre-ducked ~ -7 dB (attack 0.1 s, release 0.25 s) so a recorded voice sits on top later
d = np.ones(N)
for a, b in VO: d[int(a * SR):int(b * SR)] = .45
for a, b, g_ in M['SCN'].get('duck', []): d[int(a * SR):int(b * SR)] = np.minimum(d[int(a * SR):int(b * SR)], g_)
ka, kr = np.exp(-1 / (.1 * SR / 10)), np.exp(-1 / (.25 * SR / 10)); dd = d[::10].copy(); s_ = 1.
for i in range(len(dd)): k = ka if dd[i] < s_ else kr; s_ = k * s_ + (1 - k) * dd[i]; dd[i] = s_
music *= np.repeat(dd, 10)[:N]
# ───────── SFX
def noise(n): return rng.standard_normal(n)
def swell(dur, f0, f1, shape):    # filtered noise whose brightness/level follow a curve
    n = int(SR * dur); u = np.arange(n) / n; c = shape(u); return norm(lp(hp(noise(n), 150), f0 + (f1 - f0) * c) * c)
S = {}
S['impact'] = lambda d: norm(sine(70 + 90 * np.exp(-np.arange(int(SR * .32)) / SR * 25), int(SR * .32)) * env(int(SR * .32), .002, .1) + lp(noise(int(SR * .32)), 900) * env(int(SR * .32), .001, .03) * .5)
S['air'] = lambda d: swell(d, 300, 5000, lambda u: np.sin(np.pi * np.minimum(1, u * 1.15)) ** 1.5) * .7
S['land'] = lambda d: norm(sine(90 + 80 * np.exp(-np.arange(int(SR * .16)) / SR * 30), int(SR * .16)) * env(int(SR * .16), .002, .05))
S['tick'] = lambda d: (sine(1800, int(SR * .05)) * .6 + hp(noise(int(SR * .05)), 3000) * .3) * env(int(SR * .05), .0005, .008)
S['chime'] = lambda d: norm(bell(88, .9) + np.concatenate([np.zeros(int(SR * .08)), bell(95, .9)[:-int(SR * .08)]]))
S['pop'] = lambda d: sine(520 + 500 * np.exp(-np.arange(int(SR * .09)) / SR * 40), int(SR * .09)) * env(int(SR * .09), .001, .025)
S['flip'] = lambda d: norm(hp(noise(int(SR * .12)), 2500) * env(int(SR * .12), .002, .03)) * .6
S['whoosh'] = lambda d: swell(d, 250, 4200, lambda u: np.sin(np.pi * u) ** 2)
S['rwhoosh'] = lambda d: swell(.8, 300, 4000, lambda u: (u ** 2.2) * (u < .92) + (u >= .92) * (1 - u) / .08)
S['unfold'] = lambda d: norm(swell(.5, 600, 6000, lambda u: np.sin(np.pi * u ** .6)) + np.concatenate([np.zeros(int(SR * .36)), pluck(84, .3) * 2])[:int(SR * .5)])
S['fold'] = lambda d: swell(.4, 400, 3000, lambda u: np.sin(np.pi * (1 - u) ** .7))
S['accent'] = lambda d: norm(bell(81, .8))
S['cap'] = lambda d: norm(S['pop'](0) * 1.2 + np.concatenate([np.zeros(int(SR * .04)), sine(140, int(SR * .1)) * env(int(SR * .1), .002, .03)]).__getitem__(slice(0, int(SR * .09))))
def meow():
    n = int(SR * .7); u = np.arange(n) / n; f = 480 + 380 * np.sin(np.pi * u ** .8) - 120 * u
    x = sum(sine(f * k, n) / k ** 1.3 for k in range(1, 7)); fm = 900 + 1400 * np.sin(np.pi * u)    # "mi-aa-ow" formant sweep
    return norm(lp(x, fm) * np.sin(np.pi * u) ** .6)
S['meow'] = lambda d: meow()
def train(d):
    n = int(SR * d); u = np.arange(n) / n; x = lp(noise(n), 160) * 3 * np.sin(np.pi * u) ** 1.2
    for k in range(int(d / .35)): put_local = int(k * .35 * SR); c = hp(noise(int(SR * .03)), 1500) * env(int(SR * .03), .001, .006); x[put_local:put_local + len(c)] += c * .4 * np.sin(np.pi * k * .35 / d)
    return norm(x)
S['train'] = train
S['wind'] = lambda d: norm(lp(noise(int(SR * d)), 500 + 300 * np.sin(np.arange(int(SR * d)) / SR * 1.3)) * np.minimum(1, np.minimum(np.arange(int(SR * d)) / SR, (d - np.arange(int(SR * d)) / SR)) / 1.2))
def ice(d):
    n = int(SR * d); x = np.zeros(n)
    for k in range(70): i = int(rng.uniform(0, n - 2000)); c = hp(noise(400), 4000) * env(400, .0002, .002) * rng.uniform(.3, 1); x[i:i + 400] += c
    return norm(x)
S['ice'] = ice
S['snow'] = lambda d: swell(d, 800, 2500, lambda u: np.sin(np.pi * u) ** 2) * .6
def bubbles(d):
    n = int(SR * d); x = np.zeros(n)
    for k in range(int(d * 7)): i = int(rng.uniform(0, n - 4000)); m = int(SR * .06); f0 = rng.uniform(400, 900); c = sine(f0 * (1 + 2.5 * np.arange(m) / m), m) * env(m, .002, .015); x[i:i + m] += c * rng.uniform(.4, 1)
    return norm(x)
S['bubbles'] = bubbles
S['water'] = lambda d: norm(swell(1.0, 4000, 300, lambda u: np.exp(-u * 4) * np.minimum(1, u * 30)) + bubbles(1.0) * .4)
S['stamp'] = lambda d: norm(S['land'](0) * 1.3 + np.pad(hp(noise(int(SR * .03)), 2000) * env(int(SR * .03), .0005, .005), (0, int(SR * .13))))
S['boing'] = lambda d: sine(220 * (1 + 1.6 * np.arange(int(SR * .2)) / (SR * .2)), int(SR * .2)) * env(int(SR * .2), .003, .06)
def sparkle():
    n = int(SR * .4); x = np.zeros(n); m = int(SR * .25)
    for j, mm in enumerate((96, 100, 103)): i = int(SR * .045 * j); x[i:i + m] += sine(midi(mm), m) * env(m, .001, .05)
    return norm(x)
S['sparkle'] = lambda d: sparkle()
S['pin'] = lambda d: sine(900 + 600 * np.exp(-np.arange(int(SR * .07)) / SR * 50), int(SR * .07)) * env(int(SR * .07), .001, .02)
def knock(): n = int(SR * .09); t_ = np.arange(n) / SR; return norm(sine(380 + 200 * np.exp(-t_ * 60), n) * env(n, .0005, .02) + lp(hp(noise(n), 400), 2500) * env(n, .0003, .006) * .6)
S['knock'] = lambda d: knock()
S['ping'] = lambda d: norm(sine(1400, int(SR * .5)) * env(int(SR * .5), .003, .12) + sine(2100, int(SR * .5)) * env(int(SR * .5), .003, .06) * .4)
def gnaw(d):
    n = int(SR * d); x = np.zeros(n)
    for k in range(int(d * 9)): i = int(k / 9 * SR) + int(rng.uniform(0, 1500)); m = int(SR * .04); x[i:i + m] += hp(noise(m), 1800) * env(m, .001, .01) * rng.uniform(.4, 1)
    return norm(x)
S['gnaw'] = gnaw
def chirps(n, rate, f0, f1):
    x = np.zeros(n)
    for k in range(int(n / SR * rate)):
        i = int(rng.uniform(0, n - SR * .2)); m = int(SR * rng.uniform(.06, .14)); f = rng.uniform(f0, f1); u = np.arange(m) / m
        x[i:i + m] += sine(f * (1 + .25 * np.sin(u * 18)), m) * np.sin(np.pi * u) * rng.uniform(.2, 1)
    return x
def night(d):
    n = int(SR * d); t_ = np.arange(n) / SR; cr = sine(4300, n) * (np.sin(2 * np.pi * 28 * t_) > .3) * (np.sin(2 * np.pi * .7 * t_) > -.2) * .25
    return norm(cr + lp(noise(n), 400) * .5) * np.minimum(1, np.minimum(t_, d - t_) / .8)
S['night'] = night
def forest(d):
    n = int(SR * d); t_ = np.arange(n) / SR
    return norm(lp(noise(n), 900) * .6 + chirps(n, 1.6, 2200, 4200)) * np.minimum(1, np.minimum(t_, d - t_) / .8)
S['forest'] = forest
VAL = [62, 66, 69, 74, 69, 66, 71, 74, 76, 74, 71, 69, 66, 69, 74]
def valiha(i):   # plucked bamboo-zither notes (Karplus–Strong), a short pentatonic phrase
    i = int(i); f = midi(VAL[i % len(VAL)] + 12); n = int(SR * .9); p = int(SR / f); buf = rng.uniform(-1, 1, p); y = np.zeros(n)
    for k in range(n): y[k] = buf[k % p]; buf[k % p] = .5 * (buf[k % p] + buf[(k + 1) % p]) * .996
    return norm(y) * env(n, .001, .35)
S['valiha'] = valiha
sfx = np.zeros(N)
for e in EV: put(sfx, S[e['type']](e['d']), round(e['t'] * SR), e['g'])
def rms(x): return np.sqrt(np.mean(x ** 2))
music_n = music / rms(music) * 10 ** (-23 / 20)
bed = music_n + sfx * .5
fade = np.ones(N); fade[-int(SR * 6 / 60):] = np.linspace(1, 0, int(SR * 6 / 60))
bed *= fade
bed *= min(1, 10 ** (-1 / 20) / np.abs(bed).max())
def wr(path, x):
    x = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/mix_music_sfx.wav', bed); wr(out + '/stem_music.wav', music_n * fade * .9 / np.abs(music_n).max()); wr(out + '/stem_sfx.wav', sfx * .5 * fade / max(1, np.abs(sfx * .5).max()))
print('mg events', len(EV), 'bed rms dB', round(20 * np.log10(rms(bed)), 1))
