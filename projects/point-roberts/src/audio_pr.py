# Music + SFX + voice for the Point Roberts video. Attacks on frame boundaries: sample = frame × 800.
# usage: python3 -I audio_baarle.py meta.json outdir
import json, sys, wave
import numpy as np
SR = 48000; FPS = 60; SPF = 800
meta = json.load(open(sys.argv[1])); out = sys.argv[2]; SFX = meta['SFX']
TL0 = json.load(open(sys.argv[3])); DUR = TL0['SC'][-1][1]; NFR = round(DUR * FPS); N = NFR * SPF
rng = np.random.default_rng(11)
BEAT = 60 / 100; BAR = 4 * BEAT; BARS = int(np.ceil(DUR / BAR))
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
SEC = [round(a / BAR) for a, b in TL0['SC']] + [BARS]               # first bar of each scene (9 scenes)
def scene(bar): return max(i for i in range(9) if SEC[i] <= bar)
mus = {k: np.zeros(N) for k in ('kick', 'hat', 'bass', 'arp', 'pad')}
for bar in range(BARS):
    s = scene(bar); t0 = bar * BAR; ch = CH[bar % 4]
    # pulse
    for b in range(4):
        tb = t0 + b * BEAT
        if s != 4 and (b == 0 or (s >= 1 and b == 2) or (s in (2, 6))): put(mus['kick'], kick([.5, .6, .75, .55, .4, .6, .78, .6, .55][s]), tb)
        if s in (2, 6, 7):
            for h in (0, .5): put(mus['hat'], hat(), tb + h * BEAT, g=.12 if s != 7 else .08)
    if s >= 1: put(mus['bass'], bass(ROOT[bar % 4], BEAT * 1.9), t0, g=.5); put(mus['bass'], bass(ROOT[bar % 4], BEAT * 1.9), t0 + 2 * BEAT, g=.4)
    # arpeggio: 8ths; density per scene (S3 restrained, S5 thinned, S6 lifted an octave)
    dens = [.5, 1, 1, .75, .5, .75, 1, .75, .5][s]
    for e in range(8):
        if dens == 0 or (dens == .5 and e % 2) or (dens == .75 and e % 4 == 3): continue
        m = ch[[0, 1, 2, 1, 0, 2, 1, 2][e]] + 12 + (12 if s == 6 and e % 2 == 0 else 0)
        put(mus['arp'], pluck(m, .35), t0 + e * BEAT / 2, g=.26 if s != 4 else .16)
    if s == 0: put(mus['arp'], pluck(ch[0] + 12, .9), t0, g=.2)
    if s in (4, 5, 8): put(mus['pad'], pad(ch, BAR, 1000 if s == 4 else 1500), t0, g=.17)
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
def beep():
    n = int(SR * .16); return (sine(1320, n) * .7 + sine(1980, n) * .3) * env(n, .002, .05)
def nav():
    return np.concatenate([tone(76, .18), tone(83, .35)])
def paper():
    n = int(SR * .7); x = rng.standard_normal(n); x = x - lp(x, 1500); t = np.arange(n) / n; return x * (np.sin(np.pi * t) ** 1.5) * (1 + .6 * np.sin(2 * np.pi * 7 * t)) / 4
def scratch():
    n = int(SR * 1.4); x = lp(rng.standard_normal(n), 3500) - lp(rng.standard_normal(n), 1200); t = np.arange(n) / n; return x * np.minimum(1, t * 8) * np.minimum(1, (1 - t) * 6) / 4
FX = {'beep': beep, 'nav': nav, 'paper': paper, 'scratch': scratch, 'mute': lambda: click() * .6, 'tone': lambda: tone(81, .8), 'accent2': lambda: tone(79, .7),
      'click': click, 'tick': tick, 'whoosh': whoosh, 'pop': pop, 'mclick': mclick, 'reveal': lambda: tone(76, .9) * .8,
      'accent': lambda: tone(81, .7), 'morph': morph, 'confirm': lambda: tone(84, .8) + tone(88, .8) * .6}
sfx = np.zeros(N)
for e in SFX: put(sfx, FX[e['type']](), f=e['f'], g=e['g'])
def rms(x): return np.sqrt(np.mean(x ** 2))
music_n = music / rms(music) * 10 ** (-21 / 20); sfx_n = sfx / (np.max(np.abs(sfx)) or 1) * .5
# voice: the ElevenLabs take cut per scene and placed on the new windows (timeline.json)
import subprocess
TL = TL0; raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[4], '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
vr = np.frombuffer(raw, '<i2') / 32768; voice = np.zeros(N)
for c in TL['clips']:
    a, b = int(c['src'][0] * SR), int(c['src'][1] * SR); seg_ = vr[a:b].copy(); fd = int(.01 * SR); seg_[:fd] *= np.linspace(0, 1, fd); seg_[-fd:] *= np.linspace(1, 0, fd)
    i = int(round(c['dst'] * SR)); voice[i:i + len(seg_)] += seg_[:N - i]
voice = voice / rms(voice[np.abs(voice) > 1e-3]) * 10 ** (-16 / 20)
# duck music ~7 dB under speech (smoothed envelope)
envv = np.convolve(np.abs(voice) > .01, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .55 * np.clip(envv * 3, 0, 1)
mix = music_n * duck + sfx_n * .8 + voice; mix *= min(1, 10 ** (-1 / 20) / np.max(np.abs(mix)))
bed = music_n + sfx_n; bed *= min(1, 10 ** (-1 / 20) / np.max(np.abs(bed)))
def wr(path, x):
    x = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(x.tobytes())
wr(out + '/stem_voice.wav', voice * min(1, .89 / np.max(np.abs(voice)))); wr(out + '/mix_full.wav', mix); wr(out + '/mix_music_sfx.wav', bed); wr(out + '/stem_music.wav', music_n * min(1, .89 / np.max(np.abs(music_n)))); wr(out + '/stem_sfx.wav', sfx_n)
print('rms dB', round(20 * np.log10(rms(mix)), 1), 'peak dB', round(20 * np.log10(np.max(np.abs(mix))), 1), 'sfx', len(SFX))
