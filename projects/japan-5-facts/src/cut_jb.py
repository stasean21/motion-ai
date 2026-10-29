# Cut Japanball sprites out of the white-background sheets: dark outline -> filled mask -> RGBA crops
import numpy as np
from PIL import Image
from scipy import ndimage as nd
def cut(src, cells, prefix):
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.int16)
    dark = im.max(axis=2) < 90
    lab, n = nd.label(dark)
    sizes = nd.sum(dark, lab, range(1, n + 1))
    k = 0
    for i in np.argsort(-sizes)[:cells]:
        ring = lab == i + 1
        filled = nd.binary_fill_holes(nd.binary_closing(ring, iterations=2))
        ys, xs = np.where(filled); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        a = nd.gaussian_filter(filled.astype(float), .8)
        rgba = np.dstack([im[y0:y1, x0:x1].astype(np.uint8), (np.clip(a[y0:y1, x0:x1] * 1.4, 0, 1) * 255).astype(np.uint8)])
        yield (y0 + y1) / 2, (x0 + x1) / 2, Image.fromarray(rgba, 'RGBA')
def save(src, cells, prefix, rows):
    items = sorted(cut(src, cells, prefix), key=lambda t: (round(t[0] / 300), t[1]))
    for j, (cy, cx, img) in enumerate(items):
        img.save(f'jb/{prefix}{j + 1}.png'); print(prefix, j + 1, img.size, int(cy), int(cx))
save('../assets/japanball_front.png', 9, 'f', 3)
save('../assets/japanball_34.png', 9, 's', 3)
save('../assets/japanball_mask.png', 2, 'm', 1)
