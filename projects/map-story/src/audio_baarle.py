# Music (96 BPM, 4/4, 32 bars = 80 s) + SFX for the Baarle video. Attacks on frame boundaries: sample = frame × 800.
# usage: python3 -I audio_baarle.py meta.json outdir
import json, sys, wave
import numpy as np
SR = 48000; FPS = 60; SPF = 800; NFR = 4800; N = NFR * SPF
meta = json.load(open(sys.argv[1])); out = sys.argv[2]; SFX = meta['SFX']
rng = np.random.default_rng(11)
BEAT = 60 / 96; BAR = 4 * BEAT
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-6)) * np.exp(-t / d)
def sine(f, n): f = np.full(n, f) if np.isscalar(f) else f; return np.sin(2 * np.pi * np.cumsum(f) / SR)
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, x, t=None, f=None, g=1.):
    i = (int(f) if f is not None else int(np.floor(t * FPS + .5))) * SPF
    if 0 <= i < N: x = x[:N - i]; buf[i:i + len(x)] += x * g
def pluck(m, d=.4, b=3200):
    n = int(SR * d); f = midi(m); x = (sine(f, n) + .45 * sine(2 * f, n) + .15 * sine(3.01 * f, n)) * env(n, .003, d * .3); return lp(x, b)
def kick(g):
    n = int(SR * .3); t = np.arange(n) / SR; x = sine(46 + 50 * np.exp(-t * 30), n) * env(n, .002, .1); return x / np.max(np.abs(x)) * g
def hat():
    n = int(SR * .035); x = rng.standard_normal(n); x = x - lp(x, 7000); return x * env(n, .0004, .007) / np.max(np.abs(x))
def bass(m, d):
    n = int(SR * d); f = midi(m); return lp((sine(f, n) + .3 * sine(2 * f, n)) * env(n, .008, d * .6), 700)
def pad(ch, d, bright=1400):
    n = int(SR * d); t = np.arange(n) / SR; x = sum(sine(midi(c), n) * (1 + .003 * np.sin(2 * np.pi * (.3 + .1 * k) * t)) for k, c in enumerate(ch)) / len(ch)
    return lp(x * np.minimum(1, t / .5) * np.minimum(1, (d - t) / .5), bright)
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]          # Am F C G
ROOT = [45, 41, 48, 43]
SEC = [0, 3, 7, 11, 16, 20, 24, 27, 32]                               # first bar of each scene
def scene(bar): return max(i for i in range(8) if SEC[i] <= bar)
mus = {k: np.zeros(N) for k in ('kick', 'hat', 'bass', 'arp', 'pad')}
for bar in range(32):
    s = scene(bar); t0 = bar * BAR; ch = CH[bar % 4]
    if s == 6: ch = [[48, 52, 55], [53, 57, 60], [48, 52, 55], [55, 59, 62]][bar % 4]        # S7 settles on C
    # pulse
    for b in range(4):
        tb = t0 + b * BEAT
        if b == 0 or (s >= 1 and b == 2): put(mus['kick'], kick([.45, .6, .5, .7, .45, .75, .6, .55][s]), tb)
        if s in (3, 5) or (s == 7 and bar < 31):
            for h in (0, .5): put(mus['hat'], hat(), tb + h * BEAT, g=.12 if s != 7 else .07)
    if s >= 1: put(mus['bass'], bass(ROOT[bar % 4] if s != 6 else [36, 41, 36, 43][bar % 4], BEAT * 1.9), t0, g=.5); put(mus['bass'], bass(ROOT[bar % 4] if s != 6 else [36, 41, 36, 43][bar % 4], BEAT * 1.9), t0 + 2 * BEAT, g=.4)
    # arpeggio: 8ths; density per scene (S3 restrained, S5 thinned, S6 lifted an octave)
    dens = [0, 1, .5, 1, .5, 1, .75, .75][s]
    for e in range(8):
        if dens == 0 or (dens == .5 and e % 2) or (dens == .75 and e % 4 == 3): continue
        m = ch[[0, 1, 2, 1, 0, 2, 1, 2][e]] + 12 + (12 if s == 5 and e % 2 == 0 else 0)
        put(mus['arp'], pluck(m, .35), t0 + e * BEAT / 2, g=.26 if s != 2 else .17)
    if s == 0: put(mus['arp'], pluck(ch[0] + 12, .9), t0, g=.2)
    if s >= 4: put(mus['pad'], pad(ch, BAR, 1800 if s == 5 else 1200), t0, g=.16)
music = sum(mus.values())
# S5: give the reveal some air — music thins before "solution"
# SFX
def whoosh(d=.6):
    n = int(SR * d); x = rng.standard_normal(n); x = lp(x, 2200) - lp(x, 250); t = np.arange(n) / n; return x * np.sin(np.pi * t) ** 2 / 2.5
def click():
    n = int(SR * .03); return (sine(2400, n) * .5 + lp(rng.standard_normal(n), 5000)) * env(n, .0005, .004)
def tick():
    n = int(SR * .02); return sine(1600, n) * env(n, .0005, .004)
def pop(p=520):
    n = int(SR * .15); t = np.arange(n) / SR; return sine(p * np.exp(-t * 16) + 200, n) * env(n, .001, .04)
def mclick():
    n = int(SR * .08); return click()[:n].tolist() and np.concatenate([click(), np.zeros(int(SR * .04)), click() * .7])
def tone(m, d=.6):
    n = int(SR * d); f = midi(m); return (sine(f, n) + .3 * sine(2 * f, n)) * env(n, .004, d * .35)
def morph():
    n = int(SR * .5); t = np.arange(n) / SR; return lp(rng.standard_normal(n), 1600) * env(n, .02, .12) * .6 + sine(180 + 260 * t / t[-1], n) * env(n, .01, .15) * .5
FX = {'click': click, 'tick': tick, 'whoosh': whoosh, 'pop': pop, 'mclick': mclick, 'reveal': lambda: tone(76, .9) * .8,
      'accent': lambda: tone(81, .7), 'morph': morph, 'confirm': lambda: tone(84, .8) + tone(88, .8) * .6}
sfx = np.zeros(N)
for e in SFX: put(sfx, FX[e['type']](), f=e['f'], g=e['g'])
def rms(x): return np.sqrt(np.mean(x ** 2))
music_n = music / rms(music) * 10 ** (-21 / 20); sfx_n = sfx / (np.max(np.abs(sfx)) or 1) * .5
mix = music_n + sfx_n; mix *= min(1, 10 ** (-1 / 20) / np.max(np.abs(mix)))
def wr(path, x):
    x = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/mix_music_sfx.wav', mix); wr(out + '/stem_music.wav', music_n * min(1, .89 / np.max(np.abs(music_n)))); wr(out + '/stem_sfx.wav', sfx_n)
print('rms dB', round(20 * np.log10(rms(mix)), 1), 'peak dB', round(20 * np.log10(np.max(np.abs(mix))), 1), 'sfx', len(SFX))
