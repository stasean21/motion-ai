import sys; sys.path.insert(0, 'py')
import numpy as np, potrace
from PIL import Image
S = 6
im = Image.open('crop.png').convert('RGB')
im = im.resize((im.width*S, im.height*S), Image.LANCZOS)
a = np.asarray(im).astype(float); r,g,b = a[...,0],a[...,1],a[...,2]
# distance to the two brand colours vs white
def d(c): return np.sqrt(((a-np.array(c))**2).sum(-1))
navy, gold, white = d((22,58,99)), d((196,161,95)), d((255,255,255))
lum = .299*r+.587*g+.114*b
warm = (r-b) > 30
mg = warm & ((r-b) > 50)
mn = (~warm) & (lum < 153)
Image.fromarray((mn*255).astype('uint8')).save('mn.png')
Image.fromarray((mg*255).astype('uint8')).save('mg.png')
def path(mask):
    bm = potrace.Bitmap(~mask)
    pl = bm.trace(turdsize=200, alphamax=1.0, opticurve=True, opttolerance=0.4)
    out = []
    f = lambda p: f"{p.x/S:.2f} {p.y/S:.2f}"
    for c in pl:
        out.append("M" + f(c.start_point))
        for s in c.segments:
            if s.is_corner: out.append("L" + f(s.c) + "L" + f(s.end_point))
            else: out.append("C" + f(s.c1) + " " + f(s.c2) + " " + f(s.end_point))
        out.append("Z")
    return "".join(out)
open('navy.d','w').write(path(mn)); open('gold.d','w').write(path(mg))
ys,xs = np.nonzero(mn|mg); print(xs.min()/S, xs.max()/S, ys.min()/S, ys.max()/S)
ys,xs = np.nonzero(mg); print('star', xs.min()/S, xs.max()/S, ys.min()/S, ys.max()/S)
