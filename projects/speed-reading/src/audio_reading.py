# Music + word ticks for "Чтение с ускорением", generated from the page's event table.
# Every attack sits on a video-frame boundary: sample = frame × 800 (48 kHz / 60 fps).
# usage: python3 -I audio_reading.py meta.json outdir
import json, sys, wave
import numpy as np

SR = 48000; FPS = 60; SPF = SR // FPS; NFR = 8122; N = NFR * SPF
meta = json.load(open(sys.argv[1])); out = sys.argv[2]
SFX, SCN = meta['SFX'], meta['SCN']
rng = np.random.default_rng(7)
fr = lambda t: int(np.floor(t * FPS + .5))

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-6)) * np.exp(-t / d)
def sine(f, n): return np.sin(2 * np.pi * np.cumsum(np.full(n, f) if np.isscalar(f) else f) / SR)
def lp(x, fc):  # one-pole low-pass
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def put(buf, x, f, g=1.):
    i = int(f) * SPF
    if i >= N: return
    x = x[:N - i]; buf[i:i + len(x)] += x * g
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ───────── sounds
n = int(SR * .018)                                   # word tick < 20 ms, soft, no click-pitch shriek
tick = (sine(1350, n) * .6 + lp(rng.standard_normal(n), 3500) * .9) * env(n, .0004, .004)
tick /= np.max(np.abs(tick))
def kick(level):
    n = int(SR * .35); t = np.arange(n) / SR
    x = sine(48 + 60 * np.exp(-t * 32), n) * env(n, .002, .11) + lp(rng.standard_normal(n), 300) * env(n, .001, .012) * .4
    return x / np.max(np.abs(x)) * level
def clap():
    n = int(SR * .16); x = np.zeros(n)
    for k, o in enumerate((0, .008, .016)):
        i = int(o * SR); m = n - i; x[i:] += lp(rng.standard_normal(m), 2600) * env(m, .0005, .03 if k == 2 else .006)
    return x / np.max(np.abs(x))
def hat():
    n = int(SR * .04); x = rng.standard_normal(n); x = x - lp(x, 6000); return x * env(n, .0003, .008) / np.max(np.abs(x))
def bass(m, dur):
    n = int(SR * dur); f = midi(m)
    x = (sine(f, n) + .35 * sine(2 * f, n) + .1 * sine(3 * f, n)) * env(n, .006, dur * .55)
    return lp(x, 900) / 1.4
def ping(m):
    n = int(SR * .5); f = midi(m)
    return (sine(f, n) + .3 * sine(2.01 * f, n)) * env(n, .003, .14) / 1.3

ticks = np.zeros(N); kicks = np.zeros(N); claps = np.zeros(N); hats = np.zeros(N); bas = np.zeros(N); pad = np.zeros(N); acc = np.zeros(N)
TICK_G = [.55, .5, .42, .33, .28]                    # levels 3–4 sit 3–6 dB under level 1
for e in SFX:
    if e['type'] == 'tick': put(ticks, tick, e['f'], TICK_G[e['sec']])
    if e['type'] == 'accent': put(acc, ping(76 + 2 * e['n']), e['f'], .5)
    if e['type'] == 'end': put(acc, ping(81), e['f'], .55)

ROOT = [45, 41, 48, 43]                              # A – F – C – G, one per bar
CHORD = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]]
secs = SCN[:5] + [SCN[5]]                            # intro, l1..l4, final
ends = [s['f0'] for s in SCN[1:]] + [NFR]
for si, s in enumerate(SCN):
    t0 = s['f0'] / FPS; bpm = s['bpm']; beat = 60 / bpm; endf = ends[si]
    nb = int(round((endf - s['f0']) / FPS / beat)) if si < 5 else 5
    for b in range(nb):
        f = fr(t0 + b * beat)
        if f >= endf: break
        bar, pos = divmod(b, 4)
        if si == 0 or si == 5:                       # intro / final: light low pulse on every beat
            put(kicks, kick(.35 if si == 0 else .3), f)
        else:
            if pos in (0, 2): put(kicks, kick([0, .45, .62, .7, .72][si]), f)
            if si >= 2 and (pos in (1, 3) if si < 4 else pos == 2): put(claps, clap(), f, .32)
            if si == 3:
                for h in (0, .5): put(hats, hat(), fr(t0 + (b + h) * beat), .18)
        put(bas, bass(ROOT[bar % 4], beat * .95), f, .55 if si else .35)
        if pos == 0:                                 # pad chord per bar (quiet, no rhythm of its own)
            dur = min(beat * 4, (endf - f) / FPS); m = int(SR * dur)
            if m > 0:
                tt = np.arange(m) / SR; x = sum(sine(midi(c), m) for c in CHORD[bar % 4]) / 3
                x *= np.minimum(1, tt / .25) * np.minimum(1, (dur - tt) / .25)
                put(pad, lp(x, 1600), f, .12)

music = kicks + claps * 1.0 + hats + bas + pad + acc
mix = music + ticks
def norm_rms(x, db): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12) * 10 ** (db / 20)
mix = norm_rms(mix, -17); music_n = music * (np.sqrt(np.mean(mix ** 2)) / (np.sqrt(np.mean((music + ticks) ** 2)) + 1e-12))
pk = np.max(np.abs(mix)); g = min(1, 10 ** (-1.2 / 20) / pk); mix *= g
def wr(path, x):
    x = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/mix.wav', mix)
wr(out + '/stem_ticks.wav', ticks / (np.max(np.abs(ticks)) or 1) * .7)
wr(out + '/stem_music.wav', music / (np.max(np.abs(music)) or 1) * .8)
print('samples', N, 'rms dB', round(20 * np.log10(np.sqrt(np.mean(mix ** 2))), 1), 'peak dB', round(20 * np.log10(np.max(np.abs(mix))), 1), 'ticks', sum(e['type'] == 'tick' for e in SFX))
