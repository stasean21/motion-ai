# Cut Madagascarball frames from white-background sheets: background = near-white region touching the border; keep big components
import numpy as np, json
from PIL import Image
from scipy import ndimage as nd
def cut(name, minarea=20000):
    im = np.asarray(Image.open(f'../ref/mb_{name}.webp').convert('RGB')).astype(np.int16)
    white = im.min(axis=2) > 196
    lab, n = nd.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(border))
    fg = nd.binary_opening(fg, iterations=1)
    lab2, n2 = nd.label(fg)
    out = []
    for i in range(1, n2 + 1):
        m = lab2 == i; a = m.sum()
        if a < minarea: continue
        ys, xs = np.where(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        out.append((y0, y1, x0, x1, m))
    out.sort(key=lambda r: (round((r[0] + r[1]) / 2 / 330), (r[2] + r[3]) / 2))
    meta = []
    for j, (y0, y1, x0, x1, m) in enumerate(out):
        al = nd.gaussian_filter(m.astype(float), .8)[y0:y1, x0:x1]
        Image.fromarray(np.dstack([im[y0:y1, x0:x1].astype(np.uint8), (np.clip(al * 1.4, 0, 1) * 255).astype(np.uint8)]), 'RGBA').save(f'mb/{name}{j + 1:02d}.png')
        meta.append([j + 1, int(x0), int(y0), int(x1 - x0), int(y1 - y0)])
    print(name, meta)
for n in ('valiha', 'hat', 'squash', 'turn'): cut(n)
