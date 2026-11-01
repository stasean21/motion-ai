# Align a single voice take to the script without ASR: speech segments between detected pauses are matched to
# punctuation breaks (monotonic DP, cost = duration vs syllables at a fitted speaking rate). Outputs block times.
import re, subprocess, json, sys
import numpy as np
SRC = sys.argv[1]
BLOCKS = ['Nine flags. Four levels. How far can you get?', 'Name the country. One point each!', 'Switzerland!', 'Jamaica!', 'Medium unlocked. Look closely.', 'Denmark!', 'Bangladesh!',
 'Four down. Still perfect? Follow for more!', 'Hard unlocked. Ready?', 'Kazakhstan!', 'Tunisia!', 'Panama!', 'Expert unlocked. Two flags left. Know these?', 'Albania!',
 'Final boss. Can you name this country?', 'Know it?', 'What’s your rank? Comment your score and the final country. Follow for another round!']
def syl(w):
    w = w.lower(); w = re.sub(r'[^a-z]', '', w)
    if not w: return 0
    n = len(re.findall(r'[aeiouy]+', w)); n -= 1 if w.endswith('e') and n > 1 else 0
    return max(1, n)
# word list with break strength after each word: 2 = sentence end, 1 = comma/dash, 0 = none; block id per word
words = []
for bi, b in enumerate(BLOCKS):
    for w in b.replace('—', '— ').split():
        s = 2 if re.search(r'[.?!]$', w) else 1 if re.search(r'[,—:]$', w) else 0
        words.append([w, syl(w), s, bi])
    words[-1][2] = 3          # block end
out = subprocess.run(['ffmpeg', '-hide_banner', '-i', SRC, '-af', 'silencedetect=noise=-38dB:d=0.15', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).groups()[2]) + 60 * float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', out).groups()[1])
st = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', out)]
if st and st[0] < .05: st.pop(0); speech0 = en.pop(0)
else: speech0 = 0.
pauses = list(zip(st, en))
if pauses and pauses[-1][1] >= dur - .05: speechEnd = pauses.pop()[0]
else: speechEnd = dur
breaks = [i for i, w in enumerate(words) if i < len(words) - 1]   # any word end may carry a pause; punctuation gets a bonus
cum = np.concatenate([[0], np.cumsum([w[1] for w in words])])
def solve(rate):
    P = len(pauses); B = len(breaks); INF = 1e18
    # D[p][b]: best cost with pause p mapped to break b
    D = np.full((P, B), INF); BK = np.zeros((P, B), int)
    def seg_cost(t0, t1, w0, w1):
        e = (cum[w1] - cum[w0]) * rate; return (t1 - t0 - e) ** 2 / max(e, .3)
    for b in range(B):
        D[0][b] = seg_cost(speech0, pauses[0][0], 0, breaks[b] + 1) - .35 * words[breaks[b]][2] + (.6 if words[breaks[b]][2] == 0 else 0)
    for p in range(1, P):
        for b in range(p, B):
            best = INF; arg = 0
            for a in range(p - 1, b):
                c = D[p - 1][a] + seg_cost(pauses[p - 1][1], pauses[p][0], breaks[a] + 1, breaks[b] + 1)
                if c < best: best, arg = c, a
            D[p][b] = best - .35 * words[breaks[b]][2] + (.6 if words[breaks[b]][2] == 0 else 0); BK[p][b] = arg
    last = [D[P - 1][b] + seg_cost(pauses[P - 1][1], speechEnd, breaks[b] + 1, len(words)) for b in range(B)]
    b = int(np.argmin(last)); cost = last[b]; path = [b]
    for p in range(P - 1, 0, -1): b = BK[p][b]; path.append(b)
    return cost, path[::-1]
best = None
for rate in np.arange(.14, .30, .01):
    c, path = solve(rate)
    if best is None or c < best[0]: best = (c, path, rate)
c, path, rate = best
mapped = {breaks[b]: pauses[p] for p, b in enumerate(path)}
# block boundaries: a block ends at a mapped pause (start of silence) — if a block end was not mapped, interpolate by syllables
ends = []
for bi in range(len(BLOCKS)):
    wi = max(i for i, w in enumerate(words) if w[3] == bi)
    ends.append(wi)
res = []; t = speech0
for bi, wi in enumerate(ends):
    if bi == len(BLOCKS) - 1: e = speechEnd; nxt = None
    elif wi in mapped: e, nxt = mapped[wi]
    else:
        # interpolate inside the segment that contains this word
        ks = sorted(mapped); prev = max([k for k in ks if k < wi], default=-1); after = min([k for k in ks if k > wi], default=len(words) - 1)
        t0 = mapped[prev][1] if prev >= 0 else speech0; t1 = mapped[after][0] if after in mapped else speechEnd
        f = (cum[wi + 1] - cum[prev + 1]) / (cum[after + 1] - cum[prev + 1]); e = t0 + f * (t1 - t0); nxt = e
        print('interpolated end of block', bi + 1)
    res.append([round(t, 3), round(e, 3)]); t = nxt
print('rate', round(rate, 3), 's/syllable  cost', round(c, 2))
for i, (a, b) in enumerate(res): print(f'{i + 1:2d} {a:7.2f}–{b:6.2f}  {b - a:5.2f}s  {BLOCKS[i][:60]}')
json.dump(res, open(sys.argv[2], 'w'))
# per-word timings (voice time): inside each speech segment words share the time by syllables (+0.6 syl per word)
segs = []; prev_w = 0; t0 = speech0
for p, b in enumerate(path):
    wi = breaks[b]; segs.append((t0, pauses[p][0], prev_w, wi + 1)); t0 = pauses[p][1]; prev_w = wi + 1
segs.append((t0, speechEnd, prev_w, len(words)))
W = []
for a, b_, w0, w1 in segs:
    wt = [words[i][1] + .6 for i in range(w0, w1)]; T = sum(wt); t = a
    for k, i in enumerate(range(w0, w1)): d = (b_ - a) * wt[k] / T; W.append([words[i][3], words[i][0], round(t, 3), round(t + d, 3)]); t += d
json.dump(W, open(sys.argv[2].replace('.json', '_words.json'), 'w'))
