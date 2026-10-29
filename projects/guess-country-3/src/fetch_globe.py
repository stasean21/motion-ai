# NASA GIBS Blue Marble shaded relief + bathymetry (public domain), equirectangular level 4: 20×10 tiles of 18° → 10240×5120 globe texture.
import os, subprocess
from PIL import Image
im = Image.new('RGB', (20 * 512, 10 * 512))
for y in range(10):
    for x in range(20):
        f = f'tex/tiles/g4_{x}_{y}.jpg'
        if not os.path.exists(f):
            subprocess.run(['curl', '-sS', '-o', f, f'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/BlueMarble_ShadedRelief_Bathymetry/default/default/500m/4/{y}/{x}.jpeg'], check=True)
        im.paste(Image.open(f), (x * 512, y * 512))
im.resize((8192, 4096), Image.LANCZOS).save('tex/globe_8k.jpg', quality=90)
print(im.size)
