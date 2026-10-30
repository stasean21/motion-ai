# NASA GIBS Blue Marble (public domain) detail mosaics for Madagascar
import json, math, os, subprocess, base64, io
from PIL import Image
LAYER = 'BlueMarble_ShadedRelief_Bathymetry'
my = lambda lat: math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
def tile(lon, lat, z): n = 2 ** z; return (lon + 180) / 360 * n, (1 - my(lat) / math.pi) / 2 * n
BOX = {'mad': (30, 58, -30, -6, 7), 'mclose': (42.5, 51.5, -26.5, -11.5, 8)}
REF = {}; out = 'const DET_SRC={};'
for k, (lo0, lo1, la0, la1, z) in BOX.items():
    x0, y0 = tile(lo0, la1, z); x1, y1 = tile(lo1, la0, z)
    X0, Y0, X1, Y1 = int(x0), int(y0), int(x1), int(y1)
    im = Image.new('RGB', ((X1 - X0 + 1) * 256, (Y1 - Y0 + 1) * 256))
    for X in range(X0, X1 + 1):
        for Y in range(Y0, Y1 + 1):
            f = f'sat/tiles/{z}_{X}_{Y}.jpg'
            if not os.path.exists(f):
                subprocess.run(['curl', '-sS', '-o', f, f'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{LAYER}/default/default/GoogleMapsCompatible_Level8/{z}/{Y}/{X}.jpg'], check=True)
            im.paste(Image.open(f), ((X - X0) * 256, (Y - Y0) * 256))
    REF[k] = {'z': z, 'X0': X0, 'Y0': Y0, 'W': im.size[0], 'H': im.size[1]}
    b = io.BytesIO(); im.save(b, 'JPEG', quality=90)
    open(f'sat/det_{k}.js', 'w').write(f'DET_SRC["{k}"]="data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode() + '";\n')
    print(k, z, im.size)
open('sat/det_ref.js', 'w').write('const DET_SRC={};const DET_REF=' + json.dumps(REF) + ';\n')
