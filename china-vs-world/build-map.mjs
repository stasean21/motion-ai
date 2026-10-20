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
  ie:[-10.6,51.4,-5.9,55.4],se:[11,55.3,24.2,69.1],be:[2.5,49.5,6.4,51.5],tn:[7.5,30.2,11.6,37.4],zw:[25.2,-22.4,33.1,-15.6],kh:[102.3,10.4,107.7,14.7],
  nl:[3.3,50.7,7.3,53.6],ro:[20.2,43.6,29.7,48.3],zm:[21.9,-18.1,33.7,-8.2],lk:[79.6,5.9,81.9,9.9],gh:[-3.3,4.7,1.2,11.2],my:[99.6,0.8,119.3,7.4],
  ma:[-13.2,27.6,-1,35.9],dz:[-8.7,19,12,37.1],ug:[29.5,-1.5,35,4.2],kr:[126,34.3,129.6,38.6],za:[16.4,-34.9,32.9,-22.1],fr:[-4.8,42.3,8.2,51.1],
  gb:[-8.2,49.9,1.8,58.7],th:[97.3,5.6,105.7,20.5],de:[5.9,47.3,15,55.1],jp:[129.4,31,145.6,45.5],bd:[88,20.6,92.7,26.6],ng:[2.7,4.2,14.7,13.9],
  ph:[116.9,4.6,126.6,19.6],
  // две части Малайзии — для пунктирной связки
  myA:[101.9,3.9,102.1,4.1],myB:[113.9,2.9,114.1,3.1]};const VIEWS={};
for(const k in V){const [w,s,e,n]=V[k],a=proj([w,n]),b=proj([e,s]);VIEWS[k]=[a[0],a[1],b[0],b[1]].map(v=>+v.toFixed(1));}
fs.writeFileSync('map-data.js','const MAP='+JSON.stringify(C)+';\nconst VIEWS='+JSON.stringify(VIEWS)+';\n');
console.log(Object.keys(C).length,'стран',(fs.statSync('map-data.js').size/1024|0)+' КБ');
