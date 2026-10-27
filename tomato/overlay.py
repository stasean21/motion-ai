"""Draw the CUTS / CUBES counters on a rendered 9:16 frame.

Usage: python overlay.py <in.png> <out.jpg> <cuts> <cubes>
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

src, dst, cuts, cubes = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
WHITE = (246, 242, 234)
ORANGE = (236, 160, 52)

img = Image.open(src).convert("RGB")
W, H = img.size
k = W / 1080


def text_layer(items):
    """items: (text, size, colour, centre_y); returns layer with soft shadow."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d, ds = ImageDraw.Draw(layer), ImageDraw.Draw(shadow)
    for text, size, colour, cy in items:
        f = ImageFont.truetype(FONT, int(size * k))
        x0, y0, x1, y1 = d.textbbox((0, 0), text, font=f)
        pos = ((W - (x1 - x0)) / 2 - x0, cy * k - (y1 - y0) / 2 - y0)
        ds.text((pos[0], pos[1] + 4 * k), text, font=f, fill=(0, 0, 0, 150))
        d.text(pos, text, font=f, fill=(*colour, 255))
    shadow = shadow.filter(ImageFilter.GaussianBlur(8 * k))
    return Image.alpha_composite(shadow, layer)


cubes_txt = "0" if cubes == 0 else f"≈ {cubes:,}"
over = text_layer([
    (f"{cuts:,}", 190, WHITE, 205),
    ("CUTS", 74, ORANGE, 330),
    (cubes_txt, 92, WHITE, 1560),
    ("CUBES", 50, ORANGE, 1638),
])
out = Image.alpha_composite(img.convert("RGBA"), over).convert("RGB")
out.save(dst, quality=93)
