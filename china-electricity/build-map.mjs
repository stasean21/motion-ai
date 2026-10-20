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
const V={china:[73,18,135,53.6],world:[-170,-58,180,80],
  // кадры стран для шага «наезд на страну» (материковая часть)
  ie:[-10.6,51.4,-5.9,55.4],dk:[8,54.5,13,57.8],nz:[166,-47.5,178.6,-34.3],pt:[-9.6,36.9,-6.1,42.2],be:[2.5,49.5,6.4,51.5],ch:[5.9,45.8,10.5,47.8],
  fi:[20,59.6,31.6,70.1],nl:[3.3,50.7,7.3,53.6],no:[4,57.5,31,71.3],pl:[14.1,49,24.2,54.9],se:[11,55.3,24.2,69.1],th:[97.3,5.6,105.7,20.5],
  za:[16.4,-34.9,32.9,-22.1],it:[6.6,36.6,18.5,47.1],es:[-9.4,36,3.3,43.8],au:[113,-39.2,154,-10.6],gb:[-8.2,49.9,1.8,58.7],vn:[102.1,8.4,109.5,23.4],
  tr:[26,35.8,44.8,42.1],de:[5.9,47.3,15,55.1],fr:[-4.8,42.3,8.2,51.1],ca:[-141,41.7,-52.6,83.1],br:[-74,-33.8,-34.8,5.3],jp:[129.4,31,145.6,45.5],
  us:[-125,24.4,-66.9,49.4]};const VIEWS={};
for(const k in V){const [w,s,e,n]=V[k],a=proj([w,n]),b=proj([e,s]);VIEWS[k]=[a[0],a[1],b[0],b[1]].map(v=>+v.toFixed(1));}
fs.writeFileSync('map-data.js','const MAP='+JSON.stringify(C)+';\nconst VIEWS='+JSON.stringify(VIEWS)+';\n');
console.log(Object.keys(C).length,'стран',(fs.statSync('map-data.js').size/1024|0)+' КБ');
