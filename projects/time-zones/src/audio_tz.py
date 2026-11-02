# Time zones: 110 BPM documentary beat + event SFX + placed voice
# usage: python3 -I audio_tz.py meta.json outdir placement.json voice.mp3
import sys, wave, json
import numpy as np
SR = 48000; M = json.load(open(sys.argv[1])); EV = M['SFX']; P = json.load(open(sys.argv[3])); VO = P['blocks_video']; DUR = 70.0; N = int(round(DUR * SR)); out = sys.argv[2]
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

# ───────── music: neutral electronic documentary beat, 110 BPM
BEAT = 60 / 110; BAR = 4 * BEAT
def kick(g=1): n = int(SR * .25); t = np.arange(n) / SR; return norm(sine(48 + 60 * np.exp(-t * 30), n) * env(n, .003, .09)) * g
def snap(): n = int(SR * .12); return norm(hp(rng.standard_normal(n), 1500) * env(n, .001, .025))
def hat(d=.007): n = int(SR * .04); return norm(hp(rng.standard_normal(n), 7500) * env(n, .0003, d))
def pluck(m, d=.3, fc=2600): n = int(SR * d); f = midi(m); return lp((sine(f, n) * .7 + sine(2 * f, n) * .25 + np.sign(sine(f, n)) * .12) * env(n, .002, d * .3), fc)
def bell(m, d=1.2): n = int(SR * d); f = midi(m); return (sine(f, n) + .5 * sine(f * 2.76, n) * env(n, .001, .15) + .3 * sine(f * 5.4, n) * env(n, .001, .06)) * env(n, .002, d * .35)
def bass(m, d): n = int(SR * d); f = midi(m); return lp((sine(f, n) + .15 * np.sign(sine(f, n))) * env(n, .004, d * .6), 420)
def pad(ch, d, fc=1200): n = int(SR * d); t = np.arange(n) / SR; x = sum(sine(midi(c), n) + .5 * sine(midi(c) * 1.004, n) for c in ch) / len(ch); return lp(x * np.minimum(1, t / .6) * np.minimum(1, (d - t) / .6), fc)
CH = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]]; ROOT = [33, 29, 36, 31]          # Am F C G
CHS = [[53, 57, 60], [55, 59, 62], [60, 64, 67], [60, 64, 67]]; ROOTS = [29, 31, 36, 36]        # spring lift: F G C C
ARP = [0, 1, 2, 1, 2, 0, 1, 2]
L = {k: np.zeros(N) for k in ('drums', 'bass', 'arp', 'pad')}
def sec(t):
    for a, b, s in ((0, 2.0, 'intro'), (2.0, 8.0, 'build'), (8.0, 8.7, 'dip'), (8.7, 47.0, 'main'), (47.0, 47.8, 'dip'), (47.8, 58.2, 'main'), (58.2, 66.0, 'lift'), (66.0, 71, 'out')):
        if a <= t < b: return s
for bar in range(int(DUR / BAR) + 1):
    t0 = bar * BAR
    for b in range(4):
        tb = t0 + b * BEAT; s = sec(tb); i = int(round(tb * SR)); lift = s == 'lift'
        ch = (CHS if lift else CH)[bar % 4]; rt = (ROOTS if lift else ROOT)[bar % 4]
        if b == 0 and s != 'dip': put(L['pad'], pad(ch, BAR, 1600 if lift else 1100), i, .2 if s in ('intro', 'out') else .13)
        if s in ('main', 'lift'):
            if b in (0, 2): put(L['drums'], kick(.75), i)
            if b in (1, 3): put(L['drums'], snap(), i, .16)
        if s == 'build' and b == 0 and tb > 4.5: put(L['drums'], kick(.5), i)
        for h in (0, .5):
            j = int(round((tb + h * BEAT) * SR)); k = (b * 2 + int(h * 2)) % 8
            if s in ('main', 'lift', 'build'): put(L['arp'], pluck(ch[ARP[k]] + 12, .32, 2200 if s == 'build' else 2800), j, .12 if s == 'build' else .14)
            if s in ('main', 'lift'): put(L['drums'], hat(), j, .05 if h == 0 else .08)
            if s in ('main', 'lift'): put(L['bass'], bass(rt, BEAT * .45), j, .38)
        if s == 'out' and b == 0 and tb < 68.5: put(L['arp'], pluck(ch[0] + 24, .6, 2000), i, .12)
put(L['pad'], pad([57, 60, 64, 69], 1.6, 1400), int(67.6 * SR), .16)
music = sum(L.values()); music[int(68.6 * SR):] *= np.linspace(1, .55, N - int(68.6 * SR))
d = np.ones(N)
for a, b in VO: d[int((a - .05) * SR):int((b + .1) * SR)] = .3
for a, b, g_ in ((8.0, 8.7, .45), (47.0, 47.8, .45)): d[int(a * SR):int(b * SR)] = np.minimum(d[int(a * SR):int(b * SR)], g_)
ka, kr = np.exp(-1 / (.1 * SR / 10)), np.exp(-1 / (.3 * SR / 10)); dd = d[::10].copy(); s_ = 1.
for i in range(len(dd)): k = ka if dd[i] < s_ else kr; s_ = k * s_ + (1 - k) * dd[i]; dd[i] = s_
music *= np.repeat(dd, 10)[:N]
# ───────── SFX (only on events)
def noise(n): return rng.standard_normal(n)
def swell(dur, f0, f1, shape): n = int(SR * dur); u = np.arange(n) / n; c = shape(u); return norm(lp(hp(noise(n), 150), f0 + (f1 - f0) * c) * c)
def clickf(f=2400, d=.03): n = int(SR * d); return norm(hp(noise(n), 2500) * env(n, .0003, .004) + sine(f, n) * env(n, .0003, .006) * .6)
S = {}
S['air'] = lambda: swell(2.4, 300, 3800, lambda u: np.sin(np.pi * np.minimum(1, u * 1.1)) ** 1.6) * .55
S['whoosh'] = lambda: swell(1.8, 250, 3800, lambda u: np.sin(np.pi * u) ** 2) * .8
S['tick'] = lambda: clickf(1900) * .5
S['pop'] = lambda: sine(500 + 450 * np.exp(-np.arange(int(SR * .09)) / SR * 40), int(SR * .09)) * env(int(SR * .09), .001, .025)
S['pin'] = lambda: sine(880 + 600 * np.exp(-np.arange(int(SR * .08)) / SR * 50), int(SR * .08)) * env(int(SR * .08), .001, .022)
S['clock'] = lambda: norm(np.concatenate([clickf(1500), np.zeros(int(SR * .09)), clickf(1200)]))
S['clockback'] = lambda: norm(np.concatenate([clickf(1300), np.zeros(int(SR * .12)), clickf(1150), np.zeros(int(SR * .12)), clickf(1000)])) * .9
S['lock'] = lambda: norm(np.concatenate([clickf(3000, .02), np.zeros(int(SR * .05)), sine(700, int(SR * .06)) * env(int(SR * .06), .001, .015)]))
S['swell'] = lambda: swell(1.6, 300, 2400, lambda u: np.sin(np.pi * u ** .8) ** 2) * .5
S['accent'] = lambda: norm(bell(81, .9)) * .8
S['chime'] = lambda: norm(bell(88, .9) + np.concatenate([np.zeros(int(SR * .08)), bell(93, .9)[:-int(SR * .08)]])) * .8
S['flip'] = lambda: norm(np.concatenate([hp(noise(int(SR * .03)), 3000) * env(int(SR * .03), .001, .008), np.zeros(int(SR * .04)), hp(noise(int(SR * .03)), 2500) * env(int(SR * .03), .001, .008)])) * .55
S['draw'] = lambda: swell(.6, 1500, 5000, lambda u: np.sin(np.pi * u) ** 1.2) * .3
S['hl'] = lambda: norm(bell(76, .6)) * .45
S['rise'] = lambda: norm(swell(1.0, 400, 4000, lambda u: u ** 1.6 * (u < .9) + (u >= .9) * (1 - u) * 9) * .6 + np.pad(bell(84, .7), (int(SR * .85), 0))[:int(SR * 1.55)].__mul__(1)[:int(SR * 1.0)] * 0)
def train():
    n = int(SR * 3.0); u = np.arange(n) / n; x = lp(noise(n), 180) * 2 * np.sin(np.pi * u) ** 1.2
    for k in range(int(3.0 / .3)): i = int(k * .3 * SR); c = hp(noise(int(SR * .025)), 1500) * env(int(SR * .025), .001, .005); x[i:i + len(c)] += c * .35 * np.sin(np.pi * k * .3 / 3.0)
    return norm(x) * .45
S['train'] = train
G = {'air': .6, 'whoosh': .55, 'tick': .35, 'pop': .5, 'pin': .5, 'clock': .55, 'clockback': .55, 'lock': .5, 'swell': .4, 'accent': .45, 'chime': .45, 'flip': .45, 'draw': .4, 'hl': .4, 'rise': .45, 'train': .5}
sfx = np.zeros(N)
for t, ty in EV: put(sfx, S[ty](), round(t * SR), G[ty])
def rms(x): return np.sqrt(np.mean(x ** 2))
music_n = music / rms(music) * 10 ** (-23 / 20)
import subprocess
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[4], '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
v = np.frombuffer(raw, np.float32).astype(float); voice = np.zeros(N)
for (a, b), (va, vb) in zip(P['blocks_voice'], P['blocks_video']):
    i0, i1 = max(0, int((a - .04) * SR)), min(len(v), int((b + .12) * SR)); seg_ = v[i0:i1].copy(); f = int(.01 * SR)
    seg_[:f] *= np.linspace(0, 1, f); seg_[-f:] *= np.linspace(1, 0, f); put(voice, seg_, int((va - .04) * SR))
sp = voice[np.abs(voice) > 1e-4]; voice *= 10 ** (-17 / 20) / np.sqrt(np.mean(sp ** 2))
bed = music_n + sfx * .5 + voice
fade = np.ones(N); fade[-int(SR * .15):] = np.linspace(1, 0, int(SR * .15)); bed *= fade
bed = np.tanh(bed * 1.15) / 1.15; bed *= min(1, 10 ** (-1 / 20) / np.abs(bed).max())
def wr(path, x):
    x = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/mix_voice_music_sfx.wav', bed); wr(out + '/stem_voice.wav', voice / max(1, np.abs(voice).max())); wr(out + '/stem_music.wav', music_n * fade * .9 / np.abs(music_n).max())
print('events', len(EV), 'bed rms dB', round(20 * np.log10(rms(bed)), 1))
