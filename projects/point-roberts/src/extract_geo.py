# High-resolution coastline (GSHHS via basemap-data-hires) + US–Canada border for the Point Roberts map.
import json, numpy as np
from mpl_toolkits.basemap import Basemap
def grab(box, res, simplify=0):
    m = Basemap(projection='cyl', llcrnrlon=box[0], llcrnrlat=box[1], urcrnrlon=box[2], urcrnrlat=box[3], resolution=res)
    polys = []
    for p, t in zip(m.coastpolygons, m.coastpolygontypes):
        if t != 1: continue                                 # land only (lakes dropped)
        pts = np.round(np.c_[p[0], p[1]], 5)
        if simplify: pts = pts[::simplify]
        if len(pts) < 4: continue
        c = pts.mean(0); lo, hi = pts[:, 1].min(), pts[:, 1].max()
        # mainland straddles 49°N → split in the page; islands take one country
        if lo < 49 < hi and pts[:, 0].max() >= box[2] - .02: cc = 'MIX'
        elif c[1] > 49.0 or (c[1] > 48.76 and c[0] < -123.0) or c[0] < -123.27: cc = 'CA'
        else: cc = 'US'
        polys.append({'cc': cc, 'pts': pts.tolist()})
    segs, _ = m._readboundarydata('countries')
    border = [np.round(np.array(s), 5).tolist() for s in segs]
    return {'box': box, 'land': polys, 'border': border}
G = {'local': grab([-124.4, 48.1, -121.6, 49.9], 'f'), 'region': grab([-128.5, 45.0, -116.5, 52.5], 'i')}
open('geo_pr.js', 'w').write('const GEO=' + json.dumps(G, separators=(',', ':')) + ';\n')
for k, v in G.items(): print(k, len(v['land']), 'polys', sum(len(p['pts']) for p in v['land']), 'pts', [p['cc'] for p in v['land']][:12], 'border segs', len(v['border']))
