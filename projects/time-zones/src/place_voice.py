# Place the 12 recorded voice blocks on the 93 s timeline (video length unchanged) and export word timings in video time
import json
B = json.load(open('voice/rec/blocks.json')); W = json.load(open('voice/rec/blocks_words.json'))
START = [.1, 5.5, 12.65, 21.55, 22.8, 30.95, 39.85, 41.0, 44.25, 51.75, 60.65, 69.55, 70.8, 79.95, 81.2, 89.35, 90.4]
OFF = [START[i] - B[i][0] for i in range(17)]
WV = [[b, w, round(t0 + OFF[b], 3), round(t1 + OFF[b], 3)] for b, w, t0, t1 in W]
BV = [[round(B[i][0] + OFF[i], 3), round(B[i][1] + OFF[i], 3)] for i in range(17)]
for i in range(16): assert BV[i][1] <= BV[i + 1][0] + .01, (i, BV[i], BV[i + 1])
assert BV[-1][1] < 97.5
open('src/voice_place.js', 'w').write('const WV=' + json.dumps(WV) + ';const BV=' + json.dumps(BV) + ';\n')
json.dump({'blocks_voice': B, 'blocks_video': BV, 'offsets': OFF}, open('voice/rec/placement.json', 'w'), indent=1)
for i in range(17): print(i, BV[i])
