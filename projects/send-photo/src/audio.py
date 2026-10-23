# Music underscore (seamless 55 s loop, 24 bars) + action SFX for "What happens when you send a photo".
# usage: python3 -I audio.py meta.json out_dir
import json, sys, wave
import numpy as np

SR = 48000; DUR = 55.0; N = int(SR * DUR)
BEAT = DUR / 96; BAR = BEAT * 4               # 96 beats → ≈104.7 BPM, loop closes exactly at 55 s
meta = json.load(open(sys.argv[1])); out = sys.argv[2]
rng = np.random.default_rng(11)
t_all = np.arange(N) / SR

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
def sine(f, n, ph=0):
    f = np.broadcast_to(np.asarray(f, float), (n,))
    return np.sin(2 * np.pi * np.cumsum(f) / SR + ph)
def svf(x, fc, q=.7, mode='bp'):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR); damp = 1 / q
    lp = bp = 0.0; y = np.empty_like(x)
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp; bp += f[i] * hp; lp += f[i] * bp
        y[i] = bp if mode == 'bp' else (lp if mode == 'lp' else hp)
    return y
def noise(n): return rng.standard_normal(n)
def norm(x, p=1.0): m = np.max(np.abs(x)) or 1; return x / m * p
def midi(m): return 440 * 2 ** ((m - 69) / 12)

def add_wrap(buf, x, t, g=1.0):           # place a sound, wrapping past the end (seamless loop)
    i = int(round(t * SR)) % N
    x = x * g; n = len(x); end = i + n
    if end <= N: buf[i:end] += x
    else: buf[i:] += x[:N - i]; buf[:end - N] += x[N - i:]

# ───────────────────────── music
CH = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [46, 50, 53, 57]]   # Fmaj7 Am7 Dm7 Bbmaj7 (2 bars each)
def chord_at(b): return CH[(int(b) // 2) % 4]
def lvl(t, pts):                        # piecewise-linear automation over time
    xs, ys = zip(*pts); return float(np.interp(t, xs, ys))

def saw(f, n, harm):
    x = np.zeros(n)
    for k in range(1, harm + 1): x += sine(f * k, n) / k * (0.82 ** (k - 1))
    return x

pulse = np.zeros(N); bass = np.zeros(N); pluck = np.zeros(N); pad = np.zeros(N); kick = np.zeros(N); hat = np.zeros(N); rim = np.zeros(N)
for b in range(24):
    ch = chord_at(b)
    for e in range(8):                  # eighth-note pulse
        t0 = b * BAR + e * BEAT / 2
        under = 27 <= t0 < 37
        n = int(SR * .26); note = [ch[0], ch[2], ch[0] + 12, ch[2]][e % 4]
        acc = 1.0 if e % 2 == 0 else .72
        x = saw(midi(note), n, 3 if under else 6) * env(n, .004, .11 if not under else .16)
        add_wrap(pulse, x, t0, acc)
    for beat, vel in ((0, 1), (2, .8)):  # rounded bass on 1 and 3
        t0 = b * BAR + beat * BEAT; n = int(SR * BEAT * 1.9)
        f = midi(ch[0] - 12)
        x = (sine(f, n) + .22 * sine(2 * f, n) + .06 * sine(3 * f, n)) * env(n, .012, .42)
        add_wrap(bass, x, t0, vel)
    if b % 2 == 0:                       # warm sustained pad (used under the ocean)
        n = int(SR * BAR * 2.4); x = np.zeros(n)
        for m in ch:
            for det in (-.11, .11): x += sine(midi(m) * 2 ** (det / 12), n, rng.random() * 6) + .18 * sine(2 * midi(m) * 2 ** (det / 12), n)
        a = np.minimum(1, np.arange(n) / (SR * .9)); r = np.minimum(1, (n - np.arange(n)) / (SR * .9))
        add_wrap(pad, x * a * r, b * BAR)
    t0 = b * BAR
    for beat in range(4):                 # percussion grid
        tb = t0 + beat * BEAT
        if beat in (0, 2):
            n = int(SR * .32); tt = np.arange(n) / SR
            add_wrap(kick, sine(48 + 70 * np.exp(-tt * 28), n) * env(n, .002, .14), tb)
        if beat in (1, 3):
            n = int(SR * .09); add_wrap(rim, svf(noise(n), 1900, 4) * env(n, .0005, .018), tb)
        for half in (0, 1):
            n = int(SR * .05); hn = noise(n); hn = hn - np.convolve(hn, np.ones(6) / 6, 'same')
            add_wrap(hat, hn * env(n, .0003, .012), tb + half * BEAT / 2, .55 if half else .35)

# sparse bright plucks (F major pentatonic, upper register)
PENT = [77, 79, 81, 84, 86, 89]
def add_plucks(t_from, t_to, density, seed):
    r = np.random.default_rng(seed)
    t = t_from
    while t < t_to:
        if r.random() < density:
            m = PENT[r.integers(len(PENT))]; n = int(SR * .7); f = midi(m)
            x = (sine(f, n) + .35 * sine(2 * f, n) + .12 * sine(3.01 * f, n)) * env(n, .002, .22)
            add_wrap(pluck, x, t, .9); add_wrap(pluck, x, t + BEAT * .75, .32)     # dotted-eighth echo
        t += BEAT / 2
add_plucks(5.0, 15.0, .2, 3); add_plucks(37.2, 45.8, .18, 5)

def norm_rms(x, db): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12) * 10 ** (db / 20)
pulse = norm(pulse); bass = norm(bass); pluck = norm(pluck); pad = norm(pad); kick = norm(kick); hat = norm(hat); rim = norm(rim)
A = lambda pts: np.interp(t_all, *zip(*pts))
music = (pulse * A([(0, .30), (26.5, .30), (27.5, .20), (36.5, .20), (37.5, .30), (55, .30)])
         + bass * .55
         + pluck * A([(0, 0), (4.8, 0), (5.2, .30), (15, .26), (16, 0), (37, 0), (37.4, .30), (45.6, .26), (46.4, 0), (55, 0)])
         + pad * A([(0, 0), (26.6, 0), (28.2, .30), (36, .30), (37.6, 0), (55, 0)])
         + kick * A([(0, 0), (14.6, 0), (15.2, .42), (26.6, .42), (27.4, .22), (36.6, .22), (37.4, .38), (45.6, .38), (46.4, 0), (55, 0)])
         + hat * A([(0, 0), (14.8, 0), (15.6, .20), (26.6, .20), (27.2, 0), (37.2, 0), (37.8, .16), (45.6, .16), (46.2, 0), (55, 0)])
         + rim * A([(0, 0), (15.0, 0), (15.6, .18), (26.6, .18), (27.2, 0), (37.4, 0), (38, .14), (45.6, .14), (46.2, 0), (55, 0)]))
# gentle "underwater" darkening of the whole bed 27–37 s (single low-pass blend)
lp = np.fft.irfft(np.fft.rfft(music) * (1 / (1 + (np.fft.rfftfreq(N, 1 / SR) / 900) ** 2)), N)
w = A([(0, 0), (26.8, 0), (28, .7), (36, .7), (37.4, 0), (55, 0)])
music = music * (1 - w) + lp * w

# ───────────────────────── SFX
def s_click(soft=0):
    n = int(SR * .08)
    return norm(svf(noise(n), 3200 if not soft else 2400, 3) * env(n, .0005, .005) + sine(1700 if not soft else 1300, n) * env(n, .0005, .012) * .6, .5 if not soft else .35)
def s_air(d=.8):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 900 + 2600 * np.sin(np.pi * t), .9) * np.sin(np.pi * t) ** 2, .35)
def s_whoosh(d=.7, up=1, low=0):
    n = int(SR * d); t = np.linspace(0, 1, n)
    fc = (250 + 900 * t) if low else (500 + 4200 * (t if up else np.sin(np.pi * t)))
    return norm(svf(noise(n), fc, 1.3) * np.sin(np.pi * np.minimum(1, t * 1.15)) ** 1.6, .45)
def s_swish(d=.5):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 1500 + 5500 * t, 2.2) * np.sin(np.pi * t) ** 2, .42)
def s_shimmer():
    n = int(SR * .9); x = np.zeros(n)
    for i, m in enumerate([84, 88, 91, 96, 100]):
        o = int(SR * .045 * i); k = n - o; f = midi(m); x[o:] += (sine(f, k) + .3 * sine(2 * f, k)) * env(k, .002, .12) * (.9 - .1 * i)
    x += svf(noise(n), 6000, 2) * env(n, .01, .2) * .25
    return norm(x, .4)
def s_ping():
    n = int(SR * .9); f = midi(93)
    return norm((sine(f, n) + .25 * sine(2.003 * f, n)) * env(n, .002, .28), .42)
def s_tick(hi=1):
    n = int(SR * .05); f = 2800 if hi else 2000
    return norm(sine(f, n) * env(n, .0003, .007) + svf(noise(n), f, 4) * env(n, .0003, .004) * .5, .3)
def s_hum(d=1.2):
    n = int(SR * d); t = np.arange(n) / SR
    x = (sine(55, n) + .5 * sine(110, n) + .2 * sine(165.2, n)) * np.minimum(1, t / .15) * np.exp(-np.maximum(0, t - .3) / .35)
    return norm(x, .55)
def s_dive(d=1.6):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 900 - 650 * t, .8, 'lp') * np.sin(np.pi * t) ** 1.5 + sine(80 - 30 * t, n) * np.sin(np.pi * t) * .4, .5)
def s_rustle(d=3.3):
    n = int(SR * d); t = np.linspace(0, 1, n)
    grain = (rng.random(n) < .02) * rng.standard_normal(n)
    x = svf(grain + noise(n) * .15, 3000 + 3500 * t ** 2, 3) * np.minimum(1, t * 6) * np.minimum(1, (1 - t) * 8)
    tone = sine(600 + 700 * t ** 2, n) * .05 * np.minimum(1, t * 4) * np.minimum(1, (1 - t) * 8)
    return norm(x, .3) + tone
def s_pop():
    n = int(SR * .16); t = np.arange(n) / SR
    return norm(sine(900 * np.exp(-t * 10) + 360, n) * env(n, .001, .045), .5)
def s_msg():  # original two-note message signal
    a, b = midi(88), midi(93); n = int(SR * .55); x = np.zeros(int(SR * .7))
    x[:n] += (sine(a, n) + .3 * sine(2 * a, n)) * env(n, .002, .12); o = int(SR * .12); x[o:o + n] += (sine(b, n) + .3 * sine(2 * b, n)) * env(n, .002, .2)
    return norm(x, .45)

sl = np.zeros(N); sr = np.zeros(N)
for e in meta['SFX']:
    ty, g, pan = e['type'], e['g'], e['pan']
    x = {'click': lambda: s_click(e.get('soft', 0)), 'air': lambda: s_air(e.get('d', .8)), 'whoosh': lambda: s_whoosh(e.get('d', .7), e.get('up', 1), e.get('low', 0)),
         'swish': lambda: s_swish(e.get('d', .5)), 'shimmer': s_shimmer, 'ping': s_ping, 'tick': lambda: s_tick(e.get('hi', 1)), 'hum': lambda: s_hum(e.get('d', 1.2)),
         'dive': lambda: s_dive(e.get('d', 1.6)), 'rustle': lambda: s_rustle(e.get('d', 3.3)), 'pop': s_pop, 'msg': s_msg}[ty]()
    l = np.cos((pan + 1) * np.pi / 4) * 1.414; r = np.sin((pan + 1) * np.pi / 4) * 1.414
    i = int(e['t'] * SR); x = x[:N - i]
    sl[i:i + len(x)] += x * g * l; sr[i:i + len(x)] += x * g * r

def reverb_circ(x, wet, decay=.35):     # circular convolution keeps the loop seamless
    n = int(SR * 1.6); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t / decay); ir = np.convolve(ir, np.ones(30) / 30, 'same'); ir /= np.sqrt(np.sum(ir ** 2))
    irN = np.zeros(N); irN[:n] = ir
    return x + np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(irN), N) * wet

mL = reverb_circ(music, .22); mR = reverb_circ(np.roll(music, 240), .22)   # slight stereo width
music_st = np.stack([mL, mR], 1); music_st = norm_rms(music_st, -24)
sfx = np.stack([reverb_circ(sl, .12, .2), reverb_circ(sr, .12, .2)], 1)
sfx = sfx / (np.max(np.abs(sfx)) or 1) * 10 ** (-9 / 20)
mix = music_st + sfx
pk = np.max(np.abs(mix)); mix = mix / pk * 10 ** (-3 / 20) if pk > 10 ** (-3 / 20) else mix

def wr(path, x):
    x = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/mix_music_sfx.wav', mix); wr(out + '/stem_music.wav', music_st); wr(out + '/stem_sfx.wav', sfx)
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
seam = np.abs(mix[-1] - mix[0]).max()
print('events', len(meta['SFX']), 'music rms', round(rms(music_st), 1), 'mix rms', round(rms(mix), 1), 'peak', round(20 * np.log10(np.max(np.abs(mix))), 1), 'loop seam jump', round(float(seam), 4))
