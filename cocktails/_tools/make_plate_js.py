# Из assets/plate.png делает assets/plate.js (фото в base64 для WebGL с file://)
# и assets/sparkles.js (кристаллы соли на ободке и на стойке — точки для искр).
# Запуск из папки ролика: python3 ../_tools/make_plate_js.py
import base64
import io
import json

import cv2
import numpy as np
from PIL import Image

buf = io.BytesIO()
Image.open('assets/plate.png').convert('RGB').save(buf, 'JPEG', quality=95, subsampling=0)
with open('assets/plate.js', 'w') as f:
    f.write('window.PLATE="data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode() + '";\n')

g = cv2.cvtColor(cv2.imread('assets/plate.png'), cv2.COLOR_BGR2GRAY).astype(int)


def blobs(y0, y1, x0, x1, thr, mn, mx):
    m = (g[y0:y1, x0:x1] > thr).astype(np.uint8)
    n, _, st, c = cv2.connectedComponentsWithStats(m)
    return [[round(float(c[i][0]) + x0, 1), round(float(c[i][1]) + y0, 1), int(st[i][4])]
            for i in range(1, n) if mn <= st[i][4] <= mx]


salt = [p for p in blobs(1380, 1520, 40, 900, 185, 6, 200) if not (280 < p[0] < 650 and p[1] < 1470)]  # без бликов на основании бокала
rim = blobs(765, 840, 205, 600, 215, 4, 120)
with open('assets/sparkles.js', 'w') as f:
    f.write('window.SPARKLES=' + json.dumps({'salt': salt, 'rim': rim}) + ';\n')
