# NASA GIBS Landsat WELD true colour (public domain), Web-Mercator tiles → one mosaic per zoom + its georeference.
import math, os, subprocess, json, sys
from PIL import Image
L = 'Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual'; DATE = '2000-12-01'
def tile(lon, lat, z):
    n = 2 ** z; return (lon + 180) / 360 * n, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
def mosaic(name, box, z):
    x0, y0 = tile(box[0], box[3], z); x1, y1 = tile(box[2], box[1], z); X0, Y0, X1, Y1 = int(x0), int(y0), int(x1), int(y1)
    im = Image.new('RGB', ((X1 - X0 + 1) * 256, (Y1 - Y0 + 1) * 256))
    for X in range(X0, X1 + 1):
        for Y in range(Y0, Y1 + 1):
            f = f'sat/t_{z}_{X}_{Y}.jpg'
            if not os.path.exists(f):
                subprocess.run(['curl', '-sS', '-o', f, f'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{L}/default/{DATE}/GoogleMapsCompatible_Level12/{z}/{Y}/{X}.jpg'], check=True)
            im.paste(Image.open(f), ((X - X0) * 256, (Y - Y0) * 256))
    im.save(f'sat/{name}.jpg', quality=93)
    return {'z': z, 'X0': X0, 'Y0': Y0, 'w': im.width, 'h': im.height}
REF = {'local': mosaic('local', [-124.2, 48.25, -121.8, 49.75], 12), 'region': mosaic('region', [-129, 44.5, -116, 53], 9)}
open('sat/sat.js', 'w').write('const SAT=' + json.dumps(REF) + ';\n'); print(REF)
