# Synthesises the ambient drone + UI sound effects from meta.json (SFX list exported by index.html).
# usage: python3 -I audio.py meta.json out_dir
import json, sys, numpy as np, wave
SR = 48000; DUR = 37.0; N = int(SR * DUR)
meta = json.load(open(sys.argv[1])); out = sys.argv[2]
rng = np.random.default_rng(7)

def env(n, a, d):  # attack / exponential decay envelope
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)
    return e
def sine(f, n, ph=0):
    f = np.broadcast_to(np.asarray(f, float), (n,))
    return np.sin(2 * np.pi * np.cumsum(f) / SR + ph)
def svf(x, fc, q=.7, mode='bp'):  # Chamberlin state-variable filter, fc may be an array
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    f = 2 * np.sin(np.pi * np.clip(fc, 20, SR / 6) / SR); damp = 1 / q
    lp = bp = 0.0; y = np.empty_like(x)
    for i in range(len(x)):
        hp = x[i] - lp - damp * bp; bp += f[i] * hp; lp += f[i] * bp
        y[i] = bp if mode == 'bp' else (lp if mode == 'lp' else hp)
    return y
def noise(n): return rng.standard_normal(n)
def norm(x, p=1.0): m = np.max(np.abs(x)) or 1; return x / m * p

def s_whoosh(d=.5, up=0):
    n = int(SR * d); t = np.linspace(0, 1, n)
    shape = np.sin(np.pi * t) ** 1.6 if not up else np.sin(np.pi * np.minimum(1, t * 1.25)) ** 1.4
    fc = 400 + 4200 * (t if up else np.sin(np.pi * t))
    return norm(svf(noise(n), fc, 1.4) * shape, .55)
def s_swish(d=.32):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 1500 + 6000 * t, 2.2) * np.sin(np.pi * t) ** 2, .45)
def s_boom():
    n = int(SR * 1.1); t = np.arange(n) / SR
    body = sine(48 + 70 * np.exp(-t * 14), n) * env(n, .004, .38)
    hit = svf(noise(n), 900, 1, 'lp') * env(n, .001, .05)
    w = np.zeros(n); sw = s_whoosh(.5); w[:len(sw)] = sw * .7
    return norm(body * 1.0 + hit * .35, .9) + w * .5
def s_thud():
    n = int(SR * .5); t = np.arange(n) / SR
    return norm(sine(70 + 60 * np.exp(-t * 25), n) * env(n, .003, .12) + svf(noise(n), 600, 1, 'lp') * env(n, .001, .03) * .4, .7)
def s_hit(k=0):
    n = int(SR * .7); t = np.arange(n) / SR
    b = sine(60 + 90 * np.exp(-t * 30), n) * env(n, .002, .2)
    c = svf(noise(n), 2500 + 600 * k, 3) * env(n, .001, .04)
    tone = sine(220 * 2 ** (k * 4 / 12), n) * env(n, .003, .18) * .25
    return norm(b + c * .5 + tone, .85)
def s_click():
    n = int(SR * .09); t = np.arange(n) / SR
    return norm(svf(noise(n), 3500, 3) * env(n, .0005, .006) + sine(1900, n) * env(n, .0005, .012) * .6, .55)
def s_tick(hi=0, p=0):
    n = int(SR * .06); f = (3000 if hi else 2200) * (1 + p * .03)
    return norm(sine(f, n) * env(n, .0003, .008) + svf(noise(n), f, 4) * env(n, .0003, .004) * .5, .35)
def s_key(seed=0):
    r = np.random.default_rng(seed); n = int(SR * .05)
    return norm(svf(r.standard_normal(n), 2600 + r.random() * 1600, 2.5) * env(n, .0005, .007), .32)
def s_pop():
    n = int(SR * .16); t = np.arange(n) / SR
    return norm(sine(950 * np.exp(-t * 9) + 380, n) * env(n, .001, .045), .5)
def bell(freqs, d, amps=None):
    n = int(SR * (d + .1)); x = np.zeros(n)
    for i, f in enumerate(freqs):
        a = 1 if amps is None else amps[i]
        x += a * (sine(f, n) + .25 * sine(f * 2.01, n) + .08 * sine(f * 3.02, n)) * env(n, .002, d)
    return x
def s_ding():
    a = bell([1046.5], .35); b = bell([1568], .45); o = int(SR * .1); x = np.zeros(o + len(b)); x[:len(a)] += a; x[o:] += b
    return norm(x, .5)
def s_check(k=0):
    f = [1046.5, 1174.7, 1318.5, 1568][k % 4]; return norm(bell([f], .18) + svf(noise(int(SR * .28)), 5000, 3)[:int(SR * .28)] * 0, .42)
def s_chime(soft=0):
    fs = [1046.5, 1318.5, 1568, 2093]; n = int(SR * 1.2); x = np.zeros(n)
    for i, f in enumerate(fs):
        b = bell([f], .5 if not soft else .7); o = int(SR * .055 * i); x[o:o + len(b)] += b[:n - o] * (1 - .12 * i)
    return norm(x, .5 if not soft else .38)
def s_lock():
    n = int(SR * .5); t = np.arange(n) / SR
    clunk = sine(90 + 40 * np.exp(-t * 30), n) * env(n, .002, .09)
    m1 = svf(noise(n), 3200, 6) * env(n, .0005, .012); m2 = np.roll(svf(noise(n), 2400, 6) * env(n, .0005, .02), int(SR * .055))
    return norm(clunk + m1 * .6 + m2 * .5, .85)
def s_deny():
    a = bell([659], .12); b = bell([440], .2); o = int(SR * .11); x = np.zeros(o + len(b)); x[:len(a)] += a; x[o:] += b
    return norm(x, .4)
def s_stamp():
    n = int(SR * .6); t = np.arange(n) / SR
    return norm(sine(55 + 80 * np.exp(-t * 35), n) * env(n, .001, .15) + svf(noise(n), 700, .8, 'lp') * env(n, .001, .05) * .8 + svf(noise(n), 4000, 2) * env(n, .0005, .01) * .3, .9)
def s_paper():
    n = int(SR * .14); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 3000 + 2000 * t, 1.5) * np.sin(np.pi * t) ** 1.5, .3)
def s_glitch():
    n = int(SR * .12); x = svf(noise(n), 1800, 1); x = np.round(x * 4) / 4
    g = (np.arange(n) // 600) % 2
    return norm(x * g * env(n, .001, .05), .25)
def s_riser(d=.85):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 300 + 7000 * t ** 2, 2) * t ** 2 + sine(200 + 900 * t ** 2, n) * t ** 3 * .25, .55)
def s_flyby(d=.85):
    n = int(SR * d); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 500 + 3000 * np.sin(np.pi * t), 1.8) * np.sin(np.pi * t) ** 3, .6)
def s_split():
    n = int(SR * .5); t = np.linspace(0, 1, n)
    x = svf(noise(n), 2500 - 1500 * t, 2) * np.sin(np.pi * t) ** 2; b = bell([880], .15)[:n]; x[:len(b)] += b * .3
    return norm(x, .5)
def s_pulse():
    return norm(bell([660, 990], .22, [1, .3]), .32)
def s_send():
    n = int(SR * .3); t = np.linspace(0, 1, n)
    return norm(svf(noise(n), 800 + 5000 * t, 2) * np.sin(np.pi * t) ** 2 + sine(500 + 900 * t, n) * np.sin(np.pi * t) * .2, .45)

L = np.zeros(N); R = np.zeros(N)
def add(x, t, g, pan):
    i = int(t * SR); x = x[:max(0, N - i)]
    l = np.cos((pan + 1) * np.pi / 4) * 1.414; r = np.sin((pan + 1) * np.pi / 4) * 1.414
    L[i:i + len(x)] += x * g * l; R[i:i + len(x)] += x * g * r

for e in meta['SFX']:
    ty = e['type']; g = e['g']; pan = e['pan']
    if ty == 'whoosh': x = s_whoosh(e.get('d', .5), e.get('up', 0))
    elif ty == 'swish': x = s_swish(e.get('d', .32))
    elif ty == 'boom': x = s_boom()
    elif ty == 'thud': x = s_thud()
    elif ty == 'hit': x = s_hit(e.get('n', 0))
    elif ty == 'click': x = s_click()
    elif ty == 'tick': x = s_tick(e.get('hi', 0), e.get('p', 0))
    elif ty == 'key': x = s_key(e.get('s', 0))
    elif ty == 'pop': x = s_pop()
    elif ty == 'ding': x = s_ding()
    elif ty == 'check': x = s_check(e.get('n', 0))
    elif ty == 'chime': x = s_chime(e.get('soft', 0))
    elif ty == 'lock': x = s_lock()
    elif ty == 'deny': x = s_deny()
    elif ty == 'stamp': x = s_stamp()
    elif ty == 'paper': x = s_paper()
    elif ty == 'glitch': x = s_glitch()
    elif ty == 'riser': x = s_riser(e.get('d', .85))
    elif ty == 'flyby': x = s_flyby(e.get('d', .85))
    elif ty == 'split':
        x = s_split(); add(x, e['t'], g * .7, -.7); add(x, e['t'], g * .7, .7); continue
    elif ty == 'pulse': x = s_pulse()
    elif ty == 'send': x = s_send()
    else: raise SystemExit('unknown sfx ' + ty)
    add(x, e['t'], g, pan)

# light room: FFT convolution with a short decaying noise IR
def reverb(x, wet=.14):
    n = int(SR * .9); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t / .22); ir = np.convolve(ir, np.ones(24) / 24, 'same'); ir /= np.sqrt(np.sum(ir ** 2))
    m = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)]
    return x + y * wet
L = reverb(L); R = reverb(R)
sfx = np.stack([L, R], 1)

# drone: one steady low tone, slowly breathing, no melody
t = np.arange(N) / SR
lfo = 1 + .12 * np.sin(2 * np.pi * .07 * t)
dl = (sine(55, N) * .9 + sine(110.3, N) * .45 + sine(164.9, N) * .16 + sine(220.6, N) * .07) * lfo
dr = (sine(55.15, N, 1) * .9 + sine(109.8, N, .5) * .45 + sine(165.2, N, 2) * .16 + sine(219.7, N, 1.3) * .07) * lfo
air = svf(noise(N), 420 + 120 * np.sin(2 * np.pi * .05 * t), .9, 'lp')
air = air / np.max(np.abs(air)) * .25
drone = np.stack([dl + air, dr + np.roll(air, 900)], 1)
fade = np.minimum(1, t / .8) * np.minimum(1, (DUR - t) / 1.5)
drone *= fade[:, None]
drone = drone / np.sqrt(np.mean(drone ** 2)) * 10 ** (-28 / 20)   # quiet bed, ~ -28 dBFS RMS

sfx = sfx / (np.max(np.abs(sfx)) or 1) * 10 ** (-4 / 20)
mix = sfx + drone
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = mix / np.max(np.abs(mix)) * 10 ** (-1.5 / 20)

def wr(path, x):
    x = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/mix_sfx_drone.wav', mix); wr(out + '/stem_sfx.wav', sfx); wr(out + '/stem_drone.wav', drone)
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
print('events', len(meta['SFX']), 'mix rms', round(rms(mix), 1), 'drone rms', round(rms(drone), 1), 'peak', round(20 * np.log10(np.max(np.abs(mix))), 1))
