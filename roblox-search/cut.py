import json,sys
from shapely.geometry import shape,mapping
from shapely.ops import unary_union
S=sys.argv[1]
adm=json.load(open(S+'/adm1.json'))
obl=[f for f in adm['features'] if f['properties'].get('iso_3166_2') in ('UA-14','UA-09','UA-65','UA-23')]
print([f['properties']['name'] for f in obl])
D=unary_union([shape(f['geometry']) for f in obl])
g=json.load(open(S+'/ua-ru-50m.json'));UA=shape(g['ua']);RU=shape(g['ru'])
diff=UA.difference(D)
polys=list(diff.geoms) if diff.geom_type=='MultiPolygon' else [diff]
big=max(p.area for p in polys);keep=[p for p in polys if p.area>big*0.002]
ua=unary_union(keep);cut=UA.difference(ua)
cutp=[q for q in (cut.geoms if cut.geom_type=='MultiPolygon' else [cut]) if q.area>1e-4]
print('ua polys',len(keep),'dropped',len(polys)-len(keep),'cut area',round(cut.area,3))
json.dump({'804':mapping(ua),'cut':[mapping(q) for q in cutp]},open(sys.argv[2],'w'))
