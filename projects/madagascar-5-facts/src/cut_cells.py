# Cut each sheet by grid cells, keeping the artist's own registration (hat flying above the ball etc.).
# Anchor of a frame = bottom-centre of its largest blob (the ball), so frames stand on one ground line.
import numpy as np, json
from PIL import Image
from scipy import ndimage as nd
GRID = {'valiha': (4, 3), 'hat': (4, 2), 'squash': (4, 3), 'turn': (3, 2)}
META = {}
for name, (cols, rows) in GRID.items():
    im = np.asarray(Image.open(f'../ref/mb_{name}.webp').convert('RGB')).astype(np.int16); H, W = im.shape[:2]
    white = im.min(axis=2) > 196
    lab, n = nd.label(white); border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = nd.binary_opening(~np.isin(lab, list(border)), iterations=1)
    lab2, n2 = nd.label(fg); sizes = nd.sum(fg, lab2, range(1, n2 + 1)); coms = nd.center_of_mass(fg, lab2, range(1, n2 + 1))
    cw, chh = W / cols, H / rows
    for r in range(rows):
        for c in range(cols):
            ids = [i + 1 for i in range(n2) if sizes[i] > 6000 and int(coms[i][1] // cw) == c and int(coms[i][0] // chh) == r]
            if not ids: continue
            m = np.isin(lab2, ids); ys, xs = np.where(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            main = max(ids, key=lambda i: sizes[i - 1]); my, mx = np.where(lab2 == main)
            # ball width = widest row of the main blob near its vertical middle (hands/valiha excluded as well as possible)
            al = nd.gaussian_filter(m.astype(float), .8)[y0:y1, x0:x1]
            k = f'{name[0]}{r * cols + c + 1:02d}'
            Image.fromarray(np.dstack([im[y0:y1, x0:x1].astype(np.uint8), (np.clip(al * 1.4, 0, 1) * 255).astype(np.uint8)]), 'RGBA').save(f'mbc/{k}.png')
            META[k] = {'w': int(x1 - x0), 'h': int(y1 - y0), 'ax': float(np.median(mx) - x0), 'ay': float(my.max() + 1 - y0), 'bw': int(mx.max() - mx.min())}
json.dump(META, open('mbc/meta.json', 'w'))
print(sorted(META))
