# Cut flag-ball sheets into single frames by alpha components (letters under the balls are dropped), write balls4/ + meta.js (BM4)
import sys, json, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage
SHEETS, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
N = {'de': 4, 'fr': 4, 'au': 4, 'kr': 4, 'za': 3, 'np': 3, 'mx': 3, 'az': 3, 'pt': 3, 'hr': 3, 'cl': 3, 'eg': 3}
BM = {}
for f in sorted(glob.glob(SHEETS + '/ep*_*.png')):
    code = os.path.basename(f)[4:-4]
    if code.endswith('_v1'): continue
    im = Image.open(f).convert('RGBA'); a = np.array(im)[:, :, 3]
    lab, n = ndimage.label(a > 128); sz = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    k = N.get(code, 2); keep = np.argsort(sz)[::-1][:k] + 1
    objs = ndimage.find_objects(lab)
    boxes = sorted([objs[i - 1] for i in keep], key=lambda s: s[1].start)
    for j, (ys, xs) in enumerate(boxes):
        p = 6; y0, y1, x0, x1 = max(0, ys.start - p), min(a.shape[0], ys.stop + p), max(0, xs.start - p), min(a.shape[1], xs.stop + p)
        crop = np.array(im)[y0:y1, x0:x1].copy()
        m = (lab[y0:y1, x0:x1] == lab[(ys.start + ys.stop) // 2, (xs.start + xs.stop) // 2]) | (lab[y0:y1, x0:x1] == 0)
        crop[:, :, 3] = np.where(ndimage.binary_dilation(lab[y0:y1, x0:x1] == keep[[objs[i - 1] for i in keep].index((ys, xs))] if False else True, iterations=1), crop[:, :, 3], 0)
        key = f'{code}_{"ABCD"[j]}'; Image.fromarray(crop).save(f'{OUT}/{key}.png', optimize=True); BM[key] = {'w': int(x1 - x0), 'h': int(y1 - y0)}
    print(code, k, [BM[f'{code}_{"ABCD"[j]}'] for j in range(k)])
open(OUT + '/meta.js', 'w').write('const BM4=' + json.dumps(BM) + ';\n')
