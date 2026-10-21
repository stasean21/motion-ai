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
const V={china:[73,18,135,53.6],world:[-170,-58,180,80],usm:[-125,24.4,-66.9,49.4],
  // кадры стран для шага «наезд на страну» (материковая часть)
  gr:[19.4,34.8,28.3,41.8],fi:[20,59.6,31.6,70.1],pt:[-9.6,36.9,-6.1,42.2],no:[4,57.5,31,71.3],se:[11,55.3,24.2,69.1],be:[2.5,49.5,6.4,51.5],
  pl:[14.1,49,24.2,54.9],ch:[5.9,45.8,10.5,47.8],sa:[34.5,16.3,55.7,32.2],nl:[3.3,50.7,7.3,53.6],tr:[26,35.8,44.8,42.1],id:[95,-11,141,6],
  es:[-9.4,36,3.3,43.8],au:[113,-39.2,154,-10.6],kr:[126,34.3,129.6,38.6],mx:[-117.2,14.5,-86.7,32.7],br:[-74,-33.8,-34.8,5.3],ca:[-141,41.7,-52.6,83.1],
  it:[6.6,36.6,18.5,47.1],fr:[-4.8,42.3,8.2,51.1],gb:[-8.2,49.9,1.8,58.7],in:[68,6,97.5,35.6],jp:[129.4,31,145.6,45.5],de:[5.9,47.3,15,55.1],cn:[73,18,135,53.6]};const VIEWS={};
for(const k in V){const [w,s,e,n]=V[k],a=proj([w,n]),b=proj([e,s]);VIEWS[k]=[a[0],a[1],b[0],b[1]].map(v=>+v.toFixed(1));}
fs.writeFileSync('map-data.js','const MAP='+JSON.stringify(C)+';\nconst VIEWS='+JSON.stringify(VIEWS)+';\n');
console.log(Object.keys(C).length,'стран',(fs.statSync('map-data.js').size/1024|0)+' КБ');
