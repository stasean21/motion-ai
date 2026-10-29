# Guess the Country Part 3 — same series score (120 BPM) + SFX, driven by the page's schedule (slow globe hops between countries).
# usage: python3 -I audio_gtc3.py meta.json outdir
import sys, wave
import numpy as np
import json
SR = 48000; FPS = 60; SPF = 800; S = json.load(open(sys.argv[1]))['SCN']; DUR = S['dur']; N = int(round(DUR * SR)); out = sys.argv[2]; rng = np.random.default_rng(5)
WS, HS, RS, FS, CS = S['warm'][0], S['hard'][0], S['result'][0], S['final'][0], S['cta'][0]; FT = S['think'][-1][0]
fr = lambda f: (f - 1) * SPF                      # brief frame (1-based) → sample
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-6)) * np.exp(-t / d)
def sine(f, n): f = np.full(n, f) if np.isscalar(f) else f; return np.sin(2 * np.pi * np.cumsum(f) / SR)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, x, i, g=1.):
    i = int(i)
    if 0 <= i < N: x = x[:N - i]; buf[i:i + len(x)] += x * g
# ───────── music
BEAT = .5; BAR = 2.0
def kick(g=1): n = int(SR * .25); t = np.arange(n) / SR; x = sine(50 + 70 * np.exp(-t * 35), n) * env(n, .002, .08); return x / np.abs(x).max() * g
def clap(): n = int(SR * .14); x = hp(rng.standard_normal(n), 900) * env(n, .001, .03); return x / np.abs(x).max()
def hat(d=.008): n = int(SR * .04); x = hp(rng.standard_normal(n), 7000) * env(n, .0003, d); return x / np.abs(x).max()
def rim(): n = int(SR * .05); return (sine(1700, n) * .6 + hp(rng.standard_normal(n), 3000) * .4) * env(n, .0005, .01)
def pluck(m, d=.22): n = int(SR * d); f = midi(m); return lp((np.sign(sine(f, n)) * .35 + sine(2 * f, n) * .4 + sine(f, n) * .6) * env(n, .002, d * .28), 3800)
def bass(m, d): n = int(SR * d); f = midi(m); return lp((sine(f, n) + .4 * np.sign(sine(f, n)) * .3) * env(n, .005, d * .5), 600)
def pad(ch, d): n = int(SR * d); t = np.arange(n) / SR; x = sum(sine(midi(c), n) for c in ch) / len(ch); return lp(x * np.minimum(1, t / .4) * np.minimum(1, (d - t) / .4), 1300)
CH = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]            # C G Am F — light, playful
CHH = [[57, 60, 64], [53, 57, 60], [57, 60, 64], [52, 55, 59]]           # HARD: Am F Am Em
ROOT = [36, 43, 45, 41]; ROOTH = [33, 29, 33, 28]
MEL = [72, 76, 79, 76, 74, 71, 74, 79, 72, 76, 81, 76, 77, 72, 77, 81]   # original 8th-note motif (2 bars)
L = {k: np.zeros(N) for k in ('kick', 'clap', 'hat', 'rim', 'bass', 'arp', 'pad')}
def sec(t):
    if t < WS: return 'easy'
    if t < WS + 2: return 'stop'
    if t < HS - .6: return 'medium'
    if t < HS: return 'riser'
    if t < RS: return 'hard'
    if t < FT: return 'sparse'
    if t < CS: return 'min'
    return 'out'
for bar in range(int(DUR / BAR) + 2):
    t0 = bar * BAR
    for b in range(4):
        tb = t0 + b * BEAT; s = sec(tb); i = int(round(tb * SR)); hard = s in ('hard',)
        ch = (CHH if hard or s in ('sparse', 'min') else CH)[bar % 4]; rt = (ROOTH if hard or s in ('sparse', 'min', 'out') else ROOT)[bar % 4]
        if s in ('easy', 'medium', 'riser', 'hard', 'out'):
            if b in (0, 2) or s in ('medium', 'hard'): put(L['kick'], kick(.7 if s == 'easy' else .85), i)
        if s in ('medium', 'riser') and b in (1, 3): put(L['clap'], clap(), i, .35)
        if s == 'hard' and b in (1, 3): put(L['rim'], rim(), i, .35)
        for h in (0, .5):
            if s in ('easy', 'medium', 'riser', 'out'): put(L['hat'], hat(), int(round((tb + h * BEAT) * SR)), .10 if s != 'medium' else .14)
            if s == 'hard': put(L['hat'], hat(.004), int(round((tb + h * BEAT) * SR)), .08)
        # bass: light in easy, fuller in medium, 8th-note low pulse in hard
        if s == 'easy' and b == 0: put(L['bass'], bass(rt, BAR * .9), i, .3)
        if s in ('medium', 'riser'): put(L['bass'], bass(rt, BEAT * .9), i, .5)
        if s in ('hard', 'out'):
            for h in (0, .5): put(L['bass'], bass(rt, BEAT * .42), int(round((tb + h * BEAT) * SR)), .45 if s == 'hard' else .3)
        if s in ('sparse', 'min') and b == 0: put(L['bass'], bass(rt, BAR * .95), i, .35 if s == 'sparse' else .18)
        # melody: full in easy/medium, sparse in hard, none in sparse/min, hint in out
        for h in (0, .5):
            e = (bar % 2) * 8 + b * 2 + int(h * 2); m = MEL[e]
            if s in ('easy', 'medium', 'riser'): put(L['arp'], pluck(m), int(round((tb + h * BEAT) * SR)), .2)
            if s == 'hard' and h == 0 and b == 0: put(L['arp'], pluck(m - 12, .3), i, .16)
            if s == 'out' and h == 0 and b in (0, 2): put(L['arp'], pluck(m - 12, .3), i, .12)
        if b == 0 and s in ('sparse', 'min', 'out', 'stop'): put(L['pad'], pad(ch, BAR), i, .16 if s != 'min' else .09)
music = L['kick'] + L['clap'] + L['hat'] + L['rim'] + L['bass'] + L['arp'] + L['pad']
# tape stop at 21 s: the last 0.22 s of music before the cut slows to a halt, then drums are gone until 24 s (pad stays)
a = int(WS * SR); n = int(SR * .22); src = music[a:a + int(SR * .6)].copy(); pos = np.cumsum(np.linspace(1, 0, n)); music[a:a + n] = np.interp(pos, np.arange(len(src)), src) * np.linspace(1, .2, n)
# gain plan: VO windows pre-ducked ~ -9 dB (attack 0.1 s, release 0.25 s); thinking windows +3 dB
VO = S['vo']
THINK = [t for t, k in S['think']]
g = np.ones(N)
for t0 in THINK: g[int(t0 * SR):int((t0 + 5) * SR)] *= 10 ** (3 / 20)
d = np.ones(N)
for a, b in VO: d[int(a * SR):int(b * SR)] = .35
k_att, k_rel = np.exp(-1 / (.1 * SR / 10)), np.exp(-1 / (.25 * SR / 10)); dd = d[::10].copy(); s = 1.
for i in range(len(dd)): s = (k_att if dd[i] < s else k_rel) * s + (1 - (k_att if dd[i] < s else k_rel)) * dd[i]; dd[i] = s
music *= g * np.repeat(dd, 10)[:N]
# ───────── SFX (exact frames from the brief)
def tick(low=False): n = int(SR * .055); f = 1500 if not low else 1150; return (sine(f, n) * .55 + lp(hp(rng.standard_normal(n), 1500), 6000) * .45) * env(n, .0005, .009)
def ding(): n = int(SR * .34); return (sine(midi(88), n) * env(n, .002, .09) + np.concatenate([np.zeros(int(SR * .07)), sine(midi(95), n - int(SR * .07)) * env(n - int(SR * .07), .002, .1)])) * .7
def whoosh(): n = int(SR * .16); x = hp(lp(rng.standard_normal(n), 3000), 400); t = np.arange(n) / n; return x * (1 - t) ** 1.5 * np.minimum(1, t * 25) / 2
def impact(): n = int(SR * .32); t = np.arange(n) / SR; x = sine(70 + 90 * np.exp(-t * 25), n) * env(n, .002, .1) + lp(rng.standard_normal(n), 900) * env(n, .001, .03) * .5 + sine(220, n) * env(n, .002, .05) * .3; return x / np.abs(x).max()
def riser(): n = int(SR * 1.0); t = np.arange(n) / n; x = hp(rng.standard_normal(n), 300); x = lp(x, 6000); return x * t ** 2.2 * .35 + sine(200 + 600 * t ** 2, n) * t ** 2 * .15
def pop(): n = int(SR * .09); t = np.arange(n) / SR; return sine(500 + 400 * np.exp(-t * 40), n) * env(n, .001, .025)
def hop(): n = int(SR * 2.0); t = np.arange(n) / n; x = hp(lp(rng.standard_normal(n), 2400), 250); sw = np.sin(np.pi * t) ** 2; return x * sw * .35 + sine(160 + 140 * np.sin(np.pi * t), n) * sw * .06
def tapestop(): n = int(SR * .22); t = np.arange(n) / SR; return sine(180 * (1 - t / t[-1]) + 30, n) * np.linspace(1, 0, n) * .5
sfx = {k: np.zeros(N) for k in ('ticks', 'answers', 'transitions', 'impacts')}
at = lambda t: int(round(t * SR))
for k, (t0, _) in enumerate(S['think']):
    for i in range(5): put(sfx['ticks'], tick(low=(k == 8 and i == 4)), at(t0 + i), .55)
for t0, d, n in S['reveal']: put(sfx['answers'], ding(), at(t0), .5)
for h in S['hops']: put(sfx['transitions'], hop(), at(h['t0']), .55)
put(sfx['transitions'], hop()[int(SR * .3):], at(.3), .45)
put(sfx['transitions'], tapestop(), at(WS), .6); put(sfx['transitions'], riser()[:int(SR * .6)] * np.linspace(.4, 1, int(SR * .6)), at(HS - .6), .45); put(sfx['transitions'], pop(), at(CS), .55)
put(sfx['impacts'], impact(), 0, .55); put(sfx['impacts'], impact(), at(HS), .6); put(sfx['impacts'], impact(), at(FS), .45)
SF = sum(sfx.values())
def rms(x): return np.sqrt(np.mean(x ** 2))
music_n = music / rms(music) * 10 ** (-24 / 20)
bed = music_n + SF * .55
fade = np.ones(N); fade[-int(SR * 5 / 60):] = np.linspace(1, 0, int(SR * 5 / 60))   # 5-frame technical fade (no click)
bed *= fade; music_n *= fade
peak = np.abs(bed).max(); bed *= min(1, 10 ** (-1 / 20) / peak)
def wr(path, x):
    x = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/mix_music_sfx.wav', bed); wr(out + '/stem_music.wav', music_n * .9 / np.abs(music_n).max())
for k, v in sfx.items(): wr(f'{out}/stem_{k}.wav', v * .55 * fade)
print('ticks', len(S['think']) * 5, 'dings', len(S['reveal']), 'hops', len(S['hops']), 'bed rms dB', round(20 * np.log10(rms(bed)), 1))
