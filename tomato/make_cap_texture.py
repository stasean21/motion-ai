"""Texture for the tomato cut face (longitudinal section)."""
import sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

N = 1024
out = sys.argv[1]
random.seed(4)
img = Image.new("RGBA", (N, N), (150, 18, 14, 255))
d = ImageDraw.Draw(img)
c = N / 2
R = N * 0.49
# skin + pericarp
d.ellipse([c - R, c - R, c + R, c + R], fill=(150, 18, 14, 255))
r1 = R * 0.975
d.ellipse([c - r1, c - r1, c + r1, c + r1], fill=(212, 40, 28, 255))
# locules: 2 per side, gel with seeds
gel = Image.new("RGBA", (N, N), (0, 0, 0, 0))
g = ImageDraw.Draw(gel)
loc = []
for sx in (-1, 1):
    for sy in (-1, 1):
        cx = c + sx * R * 0.42
        cy = c + sy * R * 0.33
        w, h = R * 0.33, R * 0.27
        loc.append((cx, cy, w, h))
        g.ellipse([cx - w, cy - h, cx + w, cy + h], fill=(226, 92, 44, 255))
gel = gel.filter(ImageFilter.GaussianBlur(6))
img.alpha_composite(gel)
d = ImageDraw.Draw(img)
# inner gel glow
for cx, cy, w, h in loc:
    d.ellipse([cx - w * 0.7, cy - h * 0.7, cx + w * 0.7, cy + h * 0.7], fill=(236, 128, 62, 255))
img = img.filter(ImageFilter.GaussianBlur(5))
d = ImageDraw.Draw(img)
# seeds
for cx, cy, w, h in loc:
    for _ in range(14):
        a = random.uniform(0, 2 * math.pi); rr = random.uniform(0.2, 0.85)
        x = cx + math.cos(a) * w * rr; y = cy + math.sin(a) * h * rr
        s = R * 0.028
        d.ellipse([x - s, y - s * 0.65, x + s, y + s * 0.65], fill=(246, 222, 150, 255), outline=(200, 150, 70, 255))
# central core column + septa
d.ellipse([c - R * 0.11, c - R * 0.7, c + R * 0.11, c + R * 0.7], fill=(228, 72, 52, 255))
img = img.filter(ImageFilter.GaussianBlur(1.5))
# subtle flesh noise
a = np.asarray(img).astype(np.float32)
noise = np.random.default_rng(1).normal(0, 6, (N, N, 1))
a[..., :3] = np.clip(a[..., :3] + noise, 0, 255)
Image.fromarray(a.astype(np.uint8)).convert("RGB").save(out)
