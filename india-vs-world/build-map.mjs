// Карта мира → map-data.js: SVG-пути стран в базовой проекции (Natural Earth 1, 4000×2000), центры и рамки
import fs from 'node:fs';import {feature} from 'topojson-client';import {geoNaturalEarth1,geoPath} from 'd3-geo';
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const fc=feature(topo,topo.objects.countries);fc.features=fc.features.filter(f=>f.id!=='010');
const proj=geoNaturalEarth1().fitExtent([[0,0],[4000,2000]],fc);const path=geoPath(proj);
const rnd=d=>d.replace(/-?\d+\.\d+/g,n=>(+n).toFixed(1).replace(/\.0$/,''));
const C={};for(const f of fc.features){const d=path(f);if(!d)continue;const b=path.bounds(f),c=path.centroid(f);
  const e={d:rnd(d),b:b.map(p=>p.map(v=>+v.toFixed(1))),c:c.map(v=>+v.toFixed(1))},o=C[f.id];
  // у нескольких территорий общий код (Австралия и о-ва Ашмор и Картье — 036): склеиваем, центр берём у большей
  if(o){const big=path.area(f)>o.a;C[f.id]={d:o.d+e.d,b:[[Math.min(o.b[0][0],e.b[0][0]),Math.min(o.b[0][1],e.b[0][1])],[Math.max(o.b[1][0],e.b[1][0]),Math.max(o.b[1][1],e.b[1][1])]],c:big?e.c:o.c,a:Math.max(o.a,path.area(f))};}
  else C[f.id]={...e,a:path.area(f)};}
for(const k in C)delete C[k].a;
// кадровые рамки камеры: [запад, юг, восток, север] в градусах → базовые координаты
const V={india:[66,5,99,37],southAm:[-84,-56,-33,14],seAsia:[95,-8,112,8]};const VIEWS={};
for(const k in V){const [w,s,e,n]=V[k],a=proj([w,n]),b=proj([e,s]);VIEWS[k]=[a[0],a[1],b[0],b[1]].map(v=>+v.toFixed(1));}
fs.writeFileSync('map-data.js','const MAP='+JSON.stringify(C)+';\nconst VIEWS='+JSON.stringify(VIEWS)+';\n');
console.log(Object.keys(C).length,'стран',(fs.statSync('map-data.js').size/1024|0)+' КБ');
