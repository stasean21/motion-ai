import json, sys, numpy as np
from mpl_toolkits.basemap import Basemap
from shapely.geometry import shape, LineString, Point, mapping
from shapely.ops import unary_union
from shapely.geometry.polygon import orient
def cw(g):
    from shapely.geometry import MultiPolygon, Polygon as Pg
    ps=[orient(p,-1.0) for p in getattr(g,"geoms",[g]) if isinstance(p,Pg)]
    return MultiPolygon(ps) if len(ps)>1 else ps[0]
S, OUT = sys.argv[1], sys.argv[2]
m = Basemap(projection='cyl', llcrnrlon=-170, llcrnrlat=20, urcrnrlon=-50, urcrnrlat=84, resolution='h')
st, _ = m._readboundarydata('states'); co, _ = m._readboundarydata('countries')
lines = [np.round(np.array(s), 4).tolist() for s in st]
cl = [np.round(np.array(s), 4).tolist() for s in co]
land = unary_union([shape(f['geometry']).buffer(0) for f in json.load(open(S + '/land.geojson'))['features'] if f['id'] in ('124', '840')])
cut = unary_union([LineString(l) for l in lines + cl if len(l) > 1]).buffer(0.012)
pieces = land.difference(cut)
P = {'BC': (-122.8, 49.15), 'BC2': (-115.77, 49.51), 'AB': (-114.07, 51.05), 'MB': (-97.14, 49.9), 'NT': (-114.37, 62.45), 'SK': (-104.6, 50.45), 'YT': (-135.05, 60.72),
     'WA': (-122.33, 47.6), 'MT': (-110.0, 47.0), 'ND': (-100.5, 47.5), 'MN': (-94.5, 46.5), 'ID': (-114.5, 44.5), 'FL': (-81.6, 28.5)}
geoms = list(getattr(pieces, 'geoms', [pieces]))
R = {}
for k, (x, y) in P.items():
    p = Point(x, y); g = [q for q in geoms if q.contains(p)]
    if g: R[k] = g[0].buffer(0.012).intersection(land)
    else: print('miss', k)
R['BC'] = unary_union([R['BC'], R.pop('BC2')]) if 'BC2' in R else R['BC']
def rnd(c):
    if isinstance(c[0], (float, int)): return [round(c[0], 3), round(c[1], 3)]
    return [rnd(x) for x in c]
feats = []
for k, g in R.items():
    g = g.simplify(0.006, preserve_topology=True); g = cw(g); gj = json.loads(json.dumps(mapping(g))); gj['coordinates'] = rnd(gj['coordinates'])
    feats.append({'type': 'Feature', 'properties': {'k': k}, 'geometry': gj}); print(k, round(g.area, 1))
segs = [l for l in lines if len(l) > 1]
open(OUT, 'w').write('const PROV=' + json.dumps({'type': 'FeatureCollection', 'features': feats}, separators=(',', ':')) + ';\nconst STL=' + json.dumps({'type': 'MultiLineString', 'coordinates': rnd(segs)}, separators=(',', ':')) + ';\n')
