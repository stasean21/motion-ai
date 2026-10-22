// Карта мира → map-data.js: SVG-пути стран в базовой проекции (Natural Earth 1, 4000×2000), центры и рамки
import fs from 'node:fs';import {feature,merge} from 'topojson-client';import {geoNaturalEarth1,geoPath} from 'd3-geo';
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
// Политика границ (одна на весь выпуск): Natural Earth 1:50m как есть, кроме Крыма — он показан в составе Украины
// (резолюция ГА ООН 68/262). Полигон Крыма переносится из геометрии России и сливается с Украиной без внутренней границы.
const UA_CUT=!!process.env.UA_CUT;
if(!UA_CUT){const G=topo.objects.countries.geometries,ru=G.find(g=>g.id==='643'),ua=G.find(g=>g.id==='804');
  const isCrimea=arcs=>{const f=feature(topo,{type:'Polygon',arcs});let sx=0,sy=0,n=0;for(const [x,y] of f.geometry.coordinates[0]){sx+=x;sy+=y;n++;}const x=sx/n,y=sy/n;return x>32&&x<37&&y>44&&y<46.3;};
  const k=ru.arcs.findIndex(isCrimea);if(k<0)throw new Error('Crimea polygon not found');const cr=ru.arcs.splice(k,1)[0];
  const m=merge(topo,[ua,{type:'Polygon',arcs:cr}]);ua.type='MultiPolygon';ua.__merged=m;}
const fc=feature(topo,topo.objects.countries);fc.features=fc.features.filter(f=>f.id!=='010');
if(!UA_CUT){for(const f of fc.features)if(f.id==='804'){const g=topo.objects.countries.geometries.find(g=>g.id==='804').__merged;f.geometry={type:g.type,coordinates:g.coordinates};}}
// вариант по просьбе автора (UA_CUT=1 → map-data-ua.js): Украина без Крыма, Донецкой и Луганской областей (границы областей — Natural Earth 10m admin-1);
// эти территории штрихуются вместе с Россией как «не включено». Геометрия — ua-override.json (shapely, см. README)
if(UA_CUT){const o=JSON.parse(fs.readFileSync('ua-override.json'));for(const f of fc.features){if(f.id==='804')f.geometry=o['804'];
  if(f.id==='643'){const g=f.geometry,cs=g.type==='MultiPolygon'?g.coordinates:[g.coordinates];f.geometry={type:'MultiPolygon',coordinates:[...cs,...o.cut.map(q=>q.coordinates)]};}}}
const proj=geoNaturalEarth1().fitExtent([[0,0],[4000,2000]],fc);const path=geoPath(proj);
const rnd=d=>d.replace(/-?\d+\.\d+/g,n=>(+n).toFixed(1).replace(/\.0$/,''));
const C={};for(const f of fc.features){const d=path(f);if(!d)continue;const b=path.bounds(f),c=path.centroid(f);
  const e={d:rnd(d),b:b.map(p=>p.map(v=>+v.toFixed(1))),c:c.map(v=>+v.toFixed(1))},o=C[f.id];
  // у нескольких территорий общий код (Австралия и о-ва Ашмор и Картье — 036): склеиваем, центр берём у большей
  if(o){const big=path.area(f)>o.a;C[f.id]={d:o.d+e.d,b:[[Math.min(o.b[0][0],e.b[0][0]),Math.min(o.b[0][1],e.b[0][1])],[Math.max(o.b[1][0],e.b[1][0]),Math.max(o.b[1][1],e.b[1][1])]],c:big?e.c:o.c,a:Math.max(o.a,path.area(f))};}
  else C[f.id]={...e,a:path.area(f)};}
for(const k in C)delete C[k].a;
// кадровые рамки камеры: [запад, юг, восток, север] в градусах → базовые координаты
const V={world:[-170,-58,180,80],us:[-125,24.4,-66.9,49.4],my:[99.6,0.8,119.3,7.4],nz:[166,-47.5,178.6,-34.3],ca:[-141,41.7,-52.6,70],no:[4.5,57.8,31,71.2],
  // регионы для шага «Map» (отъезд к региону)
  EUR:[-11,35,42,66],MENA:[-17,12,62,42],SAS:[60,5,98,37],EAS:[95,18,147,50],SEA:[92,-11,141,24],AFR:[-18,-35,52,37],NAM:[-128,8,-55,58],LAM:[-93,-56,-33,23],OCE:[110,-48,180,-8],CAS:[45,35,90,56],
  // кадры стран для шага «наезд на страну» (материковая часть)
  fr:[-4.8,42.3,8.2,51.1],nl:[3.3,50.7,7.3,53.6],dk:[8,54.5,12.7,57.8],es:[-9.4,36,3.3,43.8],pt:[-9.6,36.9,-6.1,42.2],cl:[-75.8,-55.9,-66.4,-17.5],ec:[-81.1,-5,-75.2,1.5],
  id:[95,-11,141,6],au:[113,-39.2,154,-10.6],jp:[129.4,31,145.6,45.5],gr:[19.4,34.8,28.3,41.8]};const VIEWS={};
for(const k in V){const [w,s,e,n]=V[k],a=proj([w,n]),b=proj([e,s]);VIEWS[k]=[a[0],a[1],b[0],b[1]].map(v=>+v.toFixed(1));}
// кадр «основной части» страны: самый большой полигон + полигоны рядом с ним (без далёких территорий)
const MB={};for(const f of fc.features){const g=f.geometry;if(!g)continue;const polys=g.type==='MultiPolygon'?g.coordinates:[g.coordinates];
  const P=polys.map(c=>{const pf={type:'Feature',geometry:{type:'Polygon',coordinates:c}};const b=path.bounds(pf);return{b,a:path.area(pf)};}).filter(p=>isFinite(p.b[0][0]));if(!P.length)continue;
  const m=P.reduce((x,y)=>y.a>x.a?y:x),mc=[(m.b[0][0]+m.b[1][0])/2,(m.b[0][1]+m.b[1][1])/2],R=Math.max(m.b[1][0]-m.b[0][0],m.b[1][1]-m.b[0][1],8)*.75+10;
  let x0=m.b[0][0],y0=m.b[0][1],x1=m.b[1][0],y1=m.b[1][1];
  for(const p of P){const pc=[(p.b[0][0]+p.b[1][0])/2,(p.b[0][1]+p.b[1][1])/2];if(Math.hypot(pc[0]-mc[0],pc[1]-mc[1])<R){x0=Math.min(x0,p.b[0][0]);y0=Math.min(y0,p.b[0][1]);x1=Math.max(x1,p.b[1][0]);y1=Math.max(y1,p.b[1][1]);}}
  const o=MB[f.id];if(!o||m.a>o.a)MB[f.id]={b:[x0,y0,x1,y1].map(v=>+v.toFixed(1)),a:m.a};}
for(const k in MB)MB[k]=MB[k].b;
fs.writeFileSync(UA_CUT?'map-data-ua.js':'map-data.js','const MAP='+JSON.stringify(C)+';\nconst VIEWS='+JSON.stringify(VIEWS)+';\nconst MAINBOX='+JSON.stringify(MB)+';\n');
console.log(Object.keys(C).length,'стран',(fs.statSync('map-data.js').size/1024|0)+' КБ');
