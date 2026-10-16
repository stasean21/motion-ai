"""Вырезает стеклянный бокал с фото на шахматке (зашитая «прозрачность») или на белом фоне.
Выход: glass-dark.png (тёмные края — для светлого фона), glass-light.png (светлые края — для тёмного фона),
contour.json (левый и правый край по строкам — из него строится внутренний контур чаши).
Запуск: python3 -I extract_glass.py photo.png out_dir [--white]"""
import sys, json
from PIL import Image
src, out = sys.argv[1], sys.argv[2].rstrip('/') + '/'
white = '--white' in sys.argv
im = Image.open(src).convert('L'); W, H = im.size; px = im.load()
D = Image.new('L', (W, H)); dp = D.load()
for y in range(H):
    for x in range(W):
        B = 255 if white or ((x // 15) + (y // 15)) % 2 == 0 else 231
        d = 1 - px[x, y] / B
        dp[x, y] = int((0 if d < .035 else min(1, (d - .035) * 1.25)) * 255)
bbox = D.point(lambda v: 255 if v > 25 else 0).getbbox()
rows = {}
for y in range(bbox[1], bbox[3]):
    xs = [x for x in range(bbox[0], bbox[2]) if dp[x, y] > 40]
    if xs: rows[y - bbox[1]] = [xs[0] - bbox[0], xs[-1] - bbox[0]]
crop = D.crop(bbox)
for name, rgb in (('glass-dark', (25, 20, 18)), ('glass-light', (255, 255, 255))):
    layer = Image.new('RGBA', crop.size, rgb + (0,)); layer.putalpha(crop); layer.save(out + name + '.png')
json.dump({'bbox': bbox, 'rows': rows}, open(out + 'contour.json', 'w'))
print('bbox', bbox)
