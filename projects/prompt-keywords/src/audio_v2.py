# Music underscore (seamless 63 s loop, 28 bars ≈107 BPM) + action SFX for "10 photo prompt keywords".
# usage: python3 -I audio.py meta.json out_dir
import json, sys, wave
import numpy as np

SR = 48000; DUR = 63.0; N = int(SR * DUR)
BEAT = DUR / 112; BAR = BEAT * 4              # 112 beats → ≈106.7 BPM, loop closes exactly at 63 s
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
CH = [[48, 52, 55, 59], [45, 48, 52, 55], [53, 57, 60, 64], [55, 59, 62, 65]]   # Cmaj7 Am7 Fmaj7 G7 (2 bars each)
def chord_at(b): return CH[(int(b) // 2) % 4]
def lvl(t, pts):                        # piecewise-linear automation over time
    xs, ys = zip(*pts); return float(np.interp(t, xs, ys))

def saw(f, n, harm):
    x = np.zeros(n)
    for k in range(1, harm + 1): x += sine(f * k, n) / k * (0.82 ** (k - 1))
    return x

pulse = np.zeros(N); bass = np.zeros(N); pluck = np.zeros(N); pad = np.zeros(N); kick = np.zeros(N); hat = np.zeros(N); rim = np.zeros(N)
for b in range(28):
    ch = chord_at(b)
    for e in range(8):                  # eighth-note pulse
        t0 = b * BAR + e * BEAT / 2
        under = 30 <= t0 < 35
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
PENT = [74, 77, 79, 81, 84, 86]
def add_plucks(t_from, t_to, density, seed):
    r = np.random.default_rng(seed)
    t = t_from
    while t < t_to:
        if r.random() < density:
            m = PENT[r.integers(len(PENT))]; n = int(SR * .7); f = midi(m)
            x = (sine(f, n) + .35 * sine(2 * f, n) + .12 * sine(3.01 * f, n)) * env(n, .002, .22)
            add_wrap(pluck, x, t, .9); add_wrap(pluck, x, t + BEAT * .75, .32)     # dotted-eighth echo
        t += BEAT / 2
add_plucks(10.0, 30.0, .18, 3); add_plucks(35.0, 55.0, .2, 4)

def norm_rms(x, db): return x / (np.sqrt(np.mean(x ** 2)) + 1e-12) * 10 ** (db / 20)
pulse = norm(pulse); bass = norm(bass); pluck = norm(pluck); pad = norm(pad); kick = norm(kick); hat = norm(hat); rim = norm(rim)
A = lambda pts: np.interp(t_all, *zip(*pts))
music = (pulse * A([(0, .30), (63, .30)])
         + bass * .6
         + pluck * A([(0, .14), (4.8, .14), (5.3, .22), (30.2, .22), (30.6, .12), (35.2, .12), (35.6, .24), (55.4, .24), (55.9, .14), (63, .14)])
         + pad * A([(0, 0), (63, 0)])
         + kick * A([(0, .40), (30.2, .40), (30.6, .24), (35.2, .24), (35.6, .44), (55.4, .46), (55.9, .40), (63, .40)])
         + hat * A([(0, .10), (4.8, .10), (5.3, .18), (30.2, .18), (30.6, .05), (35.2, .05), (35.6, .2), (55.4, .22), (55.9, .10), (63, .10)])
         + rim * A([(0, .06), (4.8, .06), (5.3, .14), (30.2, .14), (30.6, 0), (35.2, 0), (35.6, .15), (55.4, .16), (55.9, .06), (63, .06)]))
# gentle "underwater" darkening of the whole bed 27–37 s (single low-pass blend)
lp = np.fft.irfft(np.fft.rfft(music) * (1 / (1 + (np.fft.rfftfreq(N, 1 / SR) / 900) ** 2)), N)
w = A([(0, 0), (30.2, 0), (30.5, .35), (35.0, .35), (35.5, 0), (63, 0)])
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

def s_news():
    a, b = midi(84), midi(91); n = int(SR * .5); x = np.zeros(int(SR * .7))
    x[:n] += (sine(a, n) + .25 * sine(2 * a, n)) * env(n, .002, .09); o = int(SR * .1); x[o:o + n] += (sine(b, n) + .25 * sine(2 * b, n)) * env(n, .002, .16)
    return norm(x, .42)
def s_whip(d=.6):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 700 + 5000 * t ** 1.5, 1.6) * np.sin(np.pi * t) ** 3, .42)
def s_paper(d=1.4):
    n = int(SR * d); t = np.linspace(0, 1, n)
    g = (rng.random(n) < .08) * rng.standard_normal(n) + noise(n) * .25
    x = svf(g, 2600 + 1200 * np.sin(np.pi * t * 3), 1.2) * np.minimum(1, t * 12) * np.minimum(1, (1 - t) * 6)
    return norm(x, .38)
def s_thud():
    n = int(SR * .6); t = np.arange(n) / SR
    return norm(sine(52 + 70 * np.exp(-t * 30), n) * env(n, .002, .16) + svf(noise(n), 500, .8, 'lp') * env(n, .001, .03) * .5, .75)
def s_drop():
    n = int(SR * .8); t = np.arange(n) / SR
    return norm((sine(880 * np.exp(-t * 2.2), n) + .3 * sine(1760 * np.exp(-t * 2.2), n)) * env(n, .005, .28), .4)
def s_engine(d=7.2):
    n = int(SR * d); t = np.arange(n) / SR; p = t / d
    f = 95 - 50 * np.clip((t - .6) / (d - 1.6), 0, 1) ** .9
    x = (sine(f, n) + .5 * sine(2 * f, n) + .25 * sine(3 * f, n)) * (1 + .3 * sine(f / 4, n))
    x += svf(noise(n), 400, .7, 'lp') * .4
    return norm(x * np.minimum(1, t / .4) * np.minimum(1, (d - t) / 1.0), .4)
def s_accent(k=0):
    f = midi(79 if k == 0 else 84); n = int(SR * .5); t = np.arange(n) / SR
    return norm((sine(f, n) + .4 * sine(2 * f, n)) * env(n, .002, .14) + sine(70 + 40 * np.exp(-t * 30), n) * env(n, .002, .1) * .8, .55)
def s_key(seed=0):
    r = np.random.default_rng(seed); n = int(SR * .05)
    return norm(svf(r.standard_normal(n), 2600 + r.random() * 1600, 2.5) * env(n, .0005, .007), .3)
def s_erase():
    n = int(SR * .3); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 3500 - 2500 * t, 2) * np.sin(np.pi * t) ** 2, .3)
def s_snap():
    n = int(SR * .12); return norm(svf(noise(n), 2200, 2) * env(n, .0005, .01) + sine(1200, n) * env(n, .001, .03) * .5, .4)
def s_shutter():
    n = int(SR * .25); x = svf(noise(n), 3000, 2) * env(n, .0005, .012); x2 = np.roll(svf(noise(n), 2200, 2) * env(n, .0005, .02), int(SR * .06))
    return norm(x + x2 * .8, .55)
def s_rise(d=1.4):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm((sine(440 * 2 ** (t * 7 / 12), n) + .3 * sine(880 * 2 ** (t * 7 / 12), n)) * np.sin(np.pi * t) ** 2, .3)
def s_bell():
    n = int(SR * .9); x = np.zeros(n)
    for f, g in ((1318.5, 1), (1975.5, .4)): x += g * (sine(f, n) + .25 * sine(f * 2.01, n)) * env(n, .002, .5)
    return norm(x, .35)
def s_focus():
    n = int(SR * .1); return norm(sine(2600, n) * env(n, .0005, .008) + sine(3900, n) * env(n, .0005, .006) * .5, .35)
def s_lowswish(d=1.2):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 900 - 600 * t, 1.2) * np.sin(np.pi * t) ** 2, .45)
def s_speed(d=1.3):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 400 + 6000 * t ** 1.5, 1.6) * np.sin(np.pi * np.minimum(1, t * 1.2)) ** 2, .5)
def s_fold(d=.8):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 4000 - 3000 * t, 1.4) * np.sin(np.pi * t) ** 2, .4)
SFXF = {'news': s_news, 'whip': lambda: s_whip(e.get('d', .6)), 'paper': lambda: s_paper(e.get('d', 1.4)), 'thud': s_thud, 'drop': s_drop,
        'engine': lambda: s_engine(e.get('d', 7.2)), 'accent': lambda: s_accent(e.get('n', 0)), 'erase': s_erase, 'key': lambda: s_key(e.get('s', 0)), 'snap': s_snap, 'shutter': s_shutter, 'rise': lambda: s_rise(e.get('d', 1.4)), 'bell': s_bell, 'swoosh': lambda: s_whoosh(e.get('d', 1.2), 1), 'focus': s_focus, 'lowswish': lambda: s_lowswish(e.get('d', 1.2)), 'speed': lambda: s_speed(e.get('d', 1.3)), 'fold': lambda: s_fold(e.get('d', .8))}
sl = np.zeros(N); sr = np.zeros(N)
for e in meta['SFX']:
    ty, g, pan = e['type'], e['g'], e['pan']
    x = SFXF[ty]() if ty in SFXF else {'click': lambda: s_click(e.get('soft', 0)), 'air': lambda: s_air(e.get('d', .8)), 'whoosh': lambda: s_whoosh(e.get('d', .7), e.get('up', 1), e.get('low', 0)),
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
