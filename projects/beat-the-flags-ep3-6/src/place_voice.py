# Place the 17 recorded voice blocks on the 97.5 s timeline and export word timings in video time
# usage: python3 -I place_voice.py blocks.json blocks_words.json out_voice_place.js out_placement.json
import json, sys
B = json.load(open(sys.argv[1])); W = json.load(open(sys.argv[2]))
START = json.loads(sys.argv[5]) if len(sys.argv) > 5 else [.2, 5.25, 12.65, 21.55, 22.7, 30.95, 39.85, 40.9, 44.2, 51.75, 60.65, 69.55, 70.7, 79.95, 81.0, 89.35, 90.3]
OFF = [START[i] - B[i][0] for i in range(17)]
WV = [[b, w, round(t0 + OFF[b], 3), round(t1 + OFF[b], 3)] for b, w, t0, t1 in W]
BV = [[round(B[i][0] + OFF[i], 3), round(B[i][1] + OFF[i], 3)] for i in range(17)]
for i in range(16): assert BV[i][1] <= BV[i + 1][0] + .01, (i, BV[i], BV[i + 1])
assert BV[-1][1] < 97.5, BV[-1]
open(sys.argv[3], 'w').write('const WV=' + json.dumps(WV) + ';const BV=' + json.dumps(BV) + ';\n')
json.dump({'blocks_voice': B, 'blocks_video': BV, 'offsets': OFF}, open(sys.argv[4], 'w'), indent=1)
for i in range(17): print(i, BV[i], round(BV[i][1] - BV[i][0], 2))
