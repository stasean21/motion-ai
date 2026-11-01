# Place the 12 recorded voice blocks on the 93 s timeline (video length unchanged) and export word timings in video time
import json
B = json.load(open('voice/rec/blocks.json')); W = json.load(open('voice/rec/blocks_words.json'))
START = [.10, 1.75, 3.12, 5.20, 8.10, 23.20, 40.60, 57.00, 58.30, 75.00, 78.30, 88.00]   # video time where each block begins
OFF = [START[i] - B[i][0] for i in range(12)]
WV = [[b, w, round(t0 + OFF[b], 3), round(t1 + OFF[b], 3)] for b, w, t0, t1 in W]
BV = [[round(B[i][0] + OFF[i], 3), round(B[i][1] + OFF[i], 3)] for i in range(12)]
for i in range(11): assert BV[i][1] <= BV[i + 1][0] + .01, (i, BV[i], BV[i + 1])
assert BV[-1][1] < 93
open('src/voice_place.js', 'w').write('const WV=' + json.dumps(WV) + ';const BV=' + json.dumps(BV) + ';\n')
json.dump({'blocks_voice': B, 'blocks_video': BV, 'offsets': OFF}, open('voice/rec/placement.json', 'w'), indent=1)
for i in range(12): print(i, BV[i])
