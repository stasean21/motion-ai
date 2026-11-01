# Place the 12 recorded voice blocks on the 93 s timeline (video length unchanged) and export word timings in video time
import json
B = json.load(open('voice/rec/blocks.json')); W = json.load(open('voice/rec/blocks_words.json'))
START = [.05, 2.45, 4.55, 6.95, 10.4, 13.4, 27.9, 42.8, 57.8, 72.7, 77.5, 87.4, 89.4]
OFF = [START[i] - B[i][0] for i in range(13)]
WV = [[b, w, round(t0 + OFF[b], 3), round(t1 + OFF[b], 3)] for b, w, t0, t1 in W]
BV = [[round(B[i][0] + OFF[i], 3), round(B[i][1] + OFF[i], 3)] for i in range(13)]
for i in range(12): assert BV[i][1] <= BV[i + 1][0] + .01, (i, BV[i], BV[i + 1])
assert BV[-1][1] < 95
open('src/voice_place.js', 'w').write('const WV=' + json.dumps(WV) + ';const BV=' + json.dumps(BV) + ';\n')
json.dump({'blocks_voice': B, 'blocks_video': BV, 'offsets': OFF}, open('voice/rec/placement.json', 'w'), indent=1)
for i in range(13): print(i, BV[i])
