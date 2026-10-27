# NASA GIBS Blue Marble (public domain) mosaics covering each country's full 1080×1920 frame.
import json, math, os, subprocess, sys
from PIL import Image
LAYER = sys.argv[1] if len(sys.argv) > 1 else 'BlueMarble_ShadedRelief_Bathymetry'
V = json.load(open('views.json')); os.makedirs('sat/tiles', exist_ok=True)
my = lambda lat: math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))
def tile(lon, ym, z): n = 2 ** z; return (lon + 180) / 360 * n, (1 - math.radians(ym) / math.pi) / 2 * n
REF = {}
for k, v in V.items():
    w = v['w']; z = min(8, math.ceil(math.log2(1080 * 360 / (256 * w))) + 1)
    hx = w / 2 * 1.08; hy = w * 1920 / 1080 / 2 * 1.08; cyM = my(v['cy'])
    x0, y0 = tile(v['cx'] - hx, cyM + hy, z); x1, y1 = tile(v['cx'] + hx, cyM - hy, z)
    X0, Y0, X1, Y1 = int(x0), max(0, int(y0)), int(x1), min(2 ** z - 1, int(y1))
    im = Image.new('RGB', ((X1 - X0 + 1) * 256, (Y1 - Y0 + 1) * 256))
    for X in range(X0, X1 + 1):
        for Y in range(Y0, Y1 + 1):
            f = f'sat/tiles/{LAYER[:12]}_{z}_{X}_{Y}.jpg'
            if not os.path.exists(f):
                subprocess.run(['curl', '-sS', '-o', f, f'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{LAYER}/default/default/GoogleMapsCompatible_Level8/{z}/{Y}/{X}.jpg'], check=True)
            im.paste(Image.open(f), ((X - X0) * 256, (Y - Y0) * 256))
    im.save(f'sat/{k}.jpg', quality=92); REF[k] = {'z': z, 'X0': X0, 'Y0': Y0}
    print(k, z, im.size)
open('sat/sat.js', 'w').write('const SAT=' + json.dumps(REF) + ';\n')
