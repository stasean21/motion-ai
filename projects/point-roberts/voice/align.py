# Pause-anchored alignment of the known script to the ElevenLabs take (no ASR available offline).
import json, re, wave, numpy as np
VO = json.load(open('words_script.json'))            # words in script order (txt, si)
w = wave.open('voice16k.wav'); x = np.frombuffer(w.readframes(w.getnframes()), '<i2') / 32768; SR = 16000
hop = 160; e = np.array([np.sqrt(np.mean(x[i:i + 400] ** 2)) for i in range(0, len(x) - 400, hop)]); db = 20 * np.log10(e + 1e-9)
thr = -40; sil = db < thr
# silences ≥ 0.16 s
S = []; i = 0
while i < len(sil):
    if sil[i]:
        j = i
        while j < len(sil) and sil[j]: j += 1
        if (j - i) * hop / SR >= .16: S.append((i * hop / SR, j * hop / SR))
        i = j
    else: i += 1
t_end = len(x) / SR
speech_start = next(k for k in range(len(db)) if db[k] > thr) * hop / SR
speech_end = (len(db) - next(k for k in range(len(db)) if db[::-1][k] > thr)) * hop / SR
S = [s for s in S if s[0] > speech_start + .05 and s[1] < speech_end - .05]
def syl(t):
    t = t.lower().replace('1846', 'eighteen forty six'); n = len(re.findall(r'[aeiouy]+', t)); return max(1, n - (1 if t.endswith('e') and n > 1 else 0))
wt = np.array([syl(v['txt']) + .35 for v in VO]); n = len(VO)
punct = [bool(re.search(r'[.?!,:…]$', v['txt'])) for v in VO]
# DP: choose for each silence the word boundary it follows (strictly increasing); segments' rates should match
cw = np.concatenate([[0], np.cumsum(wt)])
seg_bounds = [speech_start] + [v for s in S for v in s] + [speech_end]
speech = [(seg_bounds[2 * k], seg_bounds[2 * k + 1]) for k in range(len(S) + 1)]
r0 = sum(b - a for a, b in speech) / cw[-1]
m = len(S); INF = 1e9
# cost[k][b]: best cost with silence k placed after word b (b = index of last word before silence)
cost = np.full((m + 1, n + 1), INF); back = np.zeros((m + 1, n + 1), int)
cost[0][0] = 0     # virtual: before word 0
for k in range(1, m + 1):
    D = speech[k - 1][1] - speech[k - 1][0]
    for b in range(1, n):
        pen = 0 if punct[b - 1] else .6
        best = INF; arg = 0
        for pb in range(0 if k == 1 else 1, b):
            if cost[k - 1][pb] >= INF: continue
            W = cw[b] - cw[pb]; c = cost[k - 1][pb] + np.log((D / W) / r0) ** 2 + pen
            if c < best: best, arg = c, pb
        cost[k][b], back[k][b] = best, arg
# final segment
D = speech[m][1] - speech[m][0]; fin = [(cost[m][b] + np.log((D / (cw[n] - cw[b])) / r0) ** 2 if cost[m][b] < INF else INF, b) for b in range(1, n)]
_, b = min(fin); bs = [b]
for k in range(m, 1, -1): b = back[k][b]; bs.append(b)
bs = [0] + bs[::-1] + [n]
out = []
for k in range(len(speech)):
    a, z = speech[k]; i0, i1 = bs[k], bs[k + 1]; W = cw[i1] - cw[i0]; t = a
    for i in range(i0, i1):
        d = (z - a) * wt[i] / W; out.append({**VO[i], 't': round(t, 3), 'end': round(t + d, 3)}); t += d
json.dump(out, open('words_voice.json', 'w'), indent=0)
print('speech', round(speech_start, 2), '–', round(speech_end, 2), 'silences', m, 'rate', round(r0, 3))
for k in range(len(speech)): print(f"{speech[k][0]:6.2f}-{speech[k][1]:6.2f}  " + ' '.join(v['txt'] for v in VO[bs[k]:bs[k + 1]]))
