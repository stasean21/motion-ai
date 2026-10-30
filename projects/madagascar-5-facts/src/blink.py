# Build closed-eye (blink) frames: find eye whites, inpaint them from nearby flag colour (never from outline/highlight), draw a closed-eye curve
import numpy as np, sys
from PIL import Image, ImageDraw
from scipy import ndimage as nd
for name in sys.argv[1:]:
    im = Image.open(f'mbs/{name}.png').convert('RGBA'); a = np.asarray(im).astype(np.int16)
    H, W = a.shape[:2]; rgb = a[..., :3]; al = a[..., 3] > 128
    white = (rgb.min(axis=2) > 200) & al
    lab, n = nd.label(white); cy, cx = H / 2, W / 2; R = min(H, W) / 2
    YY, XX = np.mgrid[0:H, 0:W]; bigall = np.zeros((H, W), bool); eyes = []
    for i in range(1, n + 1):
        m = lab == i; area = m.sum()
        if area < 300 or area > .08 * H * W: continue
        ys, xs = np.where(m)
        if np.hypot(ys.mean() - cy, xs.mean() - cx) > .8 * R: continue
        pad = W * .04 + 3; ex, ey = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2; rx, ry = (xs.max() - xs.min()) / 2 + pad, (ys.max() - ys.min()) / 2 + pad
        bigall |= ((XX - ex) / rx) ** 2 + ((YY - ey) / ry) ** 2 <= 1; eyes.append((ex, ey, rx - pad, ry - pad))
    inner = nd.binary_erosion(al, iterations=int(W * .06))
    sat = (rgb.max(axis=2) - rgb.min(axis=2) > 60) | ((rgb.min(axis=2) > 170) & (rgb.max(axis=2) < 250))
    valid = inner & ~nd.binary_dilation(bigall, iterations=2) & sat
    _, (iy, ix) = nd.distance_transform_edt(~valid, return_indices=True)
    out = a.copy(); hole = bigall & al; out[hole, :3] = rgb[iy[hole], ix[hole]]
    sm = np.stack([nd.gaussian_filter(out[..., k].astype(float), 2) for k in range(3)], -1); out[hole, :3] = sm[hole]
    img = Image.fromarray(out.astype(np.uint8), 'RGBA'); d = ImageDraw.Draw(img)
    for ex, ey, rx, ry in eyes:
        d.arc([ex - rx * .9, ey - ry * .45, ex + rx * .9, ey + ry * .55], 15, 165, fill=(12, 12, 12, 255), width=max(5, int(W * .022)))
    img.save(f'mbs/{name}b.png'); print(name, len(eyes), 'eyes')
