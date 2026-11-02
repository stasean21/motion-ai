import json, sys
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union
from shapely.geometry.polygon import orient
def cw(g):
    from shapely.geometry import MultiPolygon, Polygon as Pg
    ps=[orient(p,-1.0) for p in getattr(g,"geoms",[g]) if isinstance(p,Pg)]
    return MultiPolygon(ps) if len(ps)>1 else ps[0]
S = sys.argv[1]; OUT = sys.argv[2]
raw = json.load(open(S + '/na_raw.geojson'))
land = unary_union([shape(f['geometry']).buffer(0) for f in json.load(open(S + '/land.geojson'))['features']])
# [summer Oct-2026, winter after Nov 1 2026]
R = {}
def put(o, *z):
    for t in z: R[t] = o
put((-9, -10), 'America/Adak'); put((-10, -10), 'Pacific/Honolulu')
put((-8, -9), 'America/Anchorage', 'America/Juneau', 'America/Sitka', 'America/Yakutat', 'America/Nome', 'America/Metlakatla')
put((-7, -8), 'America/Los_Angeles', 'America/Tijuana')
put((-7, -7), 'America/Vancouver', 'America/Creston', 'America/Dawson_Creek', 'America/Fort_Nelson', 'America/Whitehorse', 'America/Dawson', 'America/Phoenix', 'America/Hermosillo', 'America/Mazatlan')
put((-6, -7), 'America/Denver', 'America/Boise', 'America/Cambridge_Bay', 'America/Ciudad_Juarez')
put((-6, -6), 'America/Edmonton', 'America/Inuvik', 'America/Regina', 'America/Swift_Current', 'America/Chihuahua', 'America/Mexico_City', 'America/Monterrey', 'America/Merida', 'America/Bahia_Banderas')
put((-5, -6), 'America/Chicago', 'America/Indiana/Knox', 'America/Indiana/Tell_City', 'America/Menominee', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Rankin_Inlet', 'America/Resolute', 'America/Matamoros', 'America/Ojinaga', 'WINNIPEG_ON')
put((-5, -5), 'MANITOBA', 'America/Atikokan', 'America/Cancun')
put((-4, -5), 'America/New_York', 'America/Detroit', 'America/Toronto', 'America/Iqaluit', 'America/Indiana/Indianapolis', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello')
put((-3, -4), 'America/Halifax', 'America/Glace_Bay', 'America/Moncton', 'America/Goose_Bay')
put((-4, -4), 'America/Blanc-Sablon')
put((-2.5, -3.5), 'America/St_Johns')
NEW = {'America/Vancouver': 'BC', 'America/Edmonton': 'AB', 'America/Inuvik': 'NT', 'MANITOBA': 'MB'}   # new year-round in 2026
OLDYR = {'America/Regina': 'SK', 'America/Swift_Current': 'SK', 'America/Whitehorse': 'YT', 'America/Dawson': 'YT'}
# Manitoba / Ontario boundary: 95.153 W north to 52.83 N, then straight to Hudson Bay at 88.98 W 56.85 N
MB = Polygon([(-102.5, 48.9), (-95.153, 48.9), (-95.153, 52.83), (-88.98, 56.85), (-88.98, 61), (-102.5, 61)])
G = {}
for f in raw['features']:
    t = f['properties']['tzid']
    g = shape(f['geometry'])
    if not g.is_valid: g = g.buffer(0)
    G.setdefault(t, []).append(g)
feats = []
for t, gs in G.items():
    u = unary_union(gs)
    parts = [(t, u)]
    if t == 'America/Winnipeg': parts = [('MANITOBA', u.intersection(MB)), ('WINNIPEG_ON', u.difference(MB))]
    for name, geom in parts:
        if name not in R: continue
        geom = geom.intersection(land).simplify(0.006, preserve_topology=True)
        if geom.is_empty: continue
        geom = cw(geom)
        if geom.is_empty: continue
        o = R[name]
        feats.append({'type': 'Feature', 'properties': {'tz': name, 's': o[0], 'w': o[1], 'lock': NEW.get(name, OLDYR.get(name, '')), 'yr': 'new' if name in NEW else ('old' if name in OLDYR or o[0] == o[1] else '')},
                      'geometry': json.loads(json.dumps(mapping(geom)))})
def rnd(c):
    if isinstance(c[0], (float, int)): return [round(c[0], 3), round(c[1], 3)]
    return [rnd(x) for x in c]
for f in feats: f['geometry']['coordinates'] = rnd(f['geometry']['coordinates'])
js = 'const TZ=' + json.dumps({'type': 'FeatureCollection', 'features': feats}, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js)
print(len(feats), 'features', len(js) // 1024, 'KB', sorted(set(f['properties']['tz'] for f in feats if f['properties']['lock'])))
