# Place the 14 recorded voice sentences on the 70 s timeline (scene windows from the storyboard) and export word timings in video time
import json
B = json.load(open('voice/rec/blocks.json')); W = json.load(open('voice/rec/blocks_words.json'))
START = [.2, 8.1, 15.8, 18.0, 20.6, 26.7, 28.8, 34.3, 36.7, 40.0, 43.0, 47.6, 58.2, 66.0]
OFF = [START[i] - B[i][0] for i in range(14)]
WV = [[b, w, round(t0 + OFF[b], 3), round(t1 + OFF[b], 3)] for b, w, t0, t1 in W]
BV = [[round(B[i][0] + OFF[i], 3), round(B[i][1] + OFF[i], 3)] for i in range(14)]
for i in range(13): assert BV[i][1] <= BV[i + 1][0] + .01, (i, BV[i], BV[i + 1])
assert BV[-1][1] < 69.6
open('src/voice_place.js', 'w').write('const WV=' + json.dumps(WV) + ';const BV=' + json.dumps(BV) + ';\n')
json.dump({'blocks_voice': B, 'blocks_video': BV, 'offsets': OFF}, open('voice/rec/placement.json', 'w'), indent=1)
for i in range(14): print(i, BV[i])
