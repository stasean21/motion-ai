# Россия + Крым, Донецкая, Луганская, Запорожская, Херсонская области — одной геометрией (без внутренней границы)
import json,sys
from shapely.geometry import shape,mapping
from shapely.ops import unary_union
from shapely.validation import make_valid
S,out=sys.argv[1],sys.argv[2]
o=json.load(open(out));g=json.load(open(S+'/ua-ru-50m.json'));RU=shape(g['ru'])
cut=unary_union([shape(q) for q in o['cut']])
polys=list(RU.geoms);near=[i for i,p in enumerate(polys) if make_valid(p).distance(cut)<0.05]
print('merge with',len(near),'polygons')
m=unary_union([make_valid(polys[i]) for i in near]+[cut])
mp=[q for q in (m.geoms if hasattr(m,'geoms') else [m]) if q.geom_type=='Polygon']
rest=[p for i,p in enumerate(polys) if i not in near]
o['643']={'type':'MultiPolygon','coordinates':[mapping(p)['coordinates'] for p in mp+rest]}
json.dump(o,open(out,'w'));print('ru polys',len(mp)+len(rest))
