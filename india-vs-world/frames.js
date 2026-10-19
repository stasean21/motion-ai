// Макет кадров «Сколько стран нужно, чтобы сравняться с Индией». 16:9, тёмная карта, всё скруглено.
const W=1920,H=1080;
const COL={bg:'#0B1230',sea2:'#101A40',land:'#27315C',land2:'#323D6E',edge:'#0B1230',ind:'#FF8A1F',ind2:'#FFB25E',tq:'#2EE6C8',tq2:'#17B8A6',
  ui:'#151F4A',ui2:'#1D2A5E',txt:'#F4F7FF',mut:'#9AA6D6',hi:'#FFFFFF'};
const INDIA={id:'356',fl:'in',name:'Индия',pop:1463.9};
// порядок добавления: id ISO, флаг, название, млн, сумма (оценки 2025, UN WPP 2024)
const LIST=[['858','uy','Уругвай',3.4,3.4],['578','no','Норвегия',5.6,9.0],['246','fi','Финляндия',5.6,14.6],['208','dk','Дания',6.0,20.6],
  ['600','py','Парагвай',7.0,27.6],['752','se','Швеция',10.7,38.3],['068','bo','Боливия',12.6,50.9],['218','ec','Эквадор',18.3,69.2],
  ['528','nl','Нидерланды',18.3,87.5],['152','cl','Чили',19.9,107.4],['036','au','Австралия',27.0,134.4],['604','pe','Перу',34.6,168.9],
  ['124','ca','Канада',40.1,209.1],['032','ar','Аргентина',45.9,254.9],['724','es','Испания',47.9,302.8],['410','kr','Южная Корея',51.7,354.5],
  ['170','co','Колумбия',53.4,407.9],['380','it','Италия',59.1,467.0],['250','fr','Франция',66.7,533.7],['826','gb','Великобритания',69.6,603.2],
  ['276','de','Германия',84.1,687.3],['792','tr','Турция',87.7,775.0],['392','jp','Япония',123.1,898.1],['076','br','Бразилия',212.8,1110.9],
  ['840','us','США',347.3,1458.2],['702','sg','Сингапур',5.9,1464.1]];
const fmt=v=>{const [a,b]=v.toFixed(1).split('.');return a.replace(/\B(?=(\d{3})+$)/g,' ')+','+b;};
const pct=v=>(v/INDIA.pop*100).toFixed(1).replace('.',',');
const T=(x,y,s,txt,{w=900,col=COL.txt,a='start',f='Round',op=1,ls=0}={})=>`<text x="${x}" y="${y}" font-family="${f}" font-weight="${w}" font-size="${s}" fill="${col}" text-anchor="${a}" opacity="${op}" letter-spacing="${ls}">${txt}</text>`;
const R=(x,y,w,h,r,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
let _cid=0;
// флаг в скруглённой рамке (4:3)
function flag(code,x,y,w,r=w*.12){const h=w*.75,id='fc'+(_cid++);
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
  <image href="flags/${code}.svg" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" clip-path="url(#${id})"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>`;}
// ---------- карта ----------
// камера: рамку из базовых координат вписываем в область экрана
function fit(box,reg){const [x0,y0,x1,y1]=box,[rx0,ry0,rx1,ry1]=reg,s=Math.min((rx1-rx0)/(x1-x0),(ry1-ry0)/(y1-y0));
  return {s,tx:(rx0+rx1)/2-s*(x0+x1)/2,ty:(ry0+ry1)/2-s*(y0+y1)/2};}
function map(cam,{added=0,focus=null,dimOthers=false}={}){const on=new Set(LIST.slice(0,added).map(c=>c[0]));
  let base='',hot='';
  for(const id in MAP){const c=MAP[id];let fill=COL.land;
    if(id===INDIA.id)fill=COL.ind;else if(on.has(id))fill=COL.tq;
    const op=dimOthers&&id!==INDIA.id&&!on.has(id)?.55:1;
    base+=`<path d="${c.d}" fill="${fill}" opacity="${op}"/>`;}
  // фокусная страна: свечение + белая граница
  if(focus){const c=MAP[focus];const fill=focus===INDIA.id?COL.ind:COL.tq;
    hot=`<path d="${c.d}" fill="${fill}" filter="url(#glow)" opacity=".9"/><path d="${c.d}" fill="${fill}" stroke="#fff" stroke-width="3" vector-effect="non-scaling-stroke"/>`;}
  return `<g transform="translate(${cam.tx},${cam.ty}) scale(${cam.s})" stroke="${COL.edge}" stroke-width="1.4" stroke-linejoin="round" vector-effect="non-scaling-stroke">
    <g style="vector-effect:non-scaling-stroke">${base.replace(/<path /g,'<path vector-effect="non-scaling-stroke" ')}</g>${hot}</g>`;}
const defs=`<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
  <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
  <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="1.6" fill="#2A3770" opacity=".7"/></pattern></defs>`;
const bg=()=>R(0,0,W,H,0,COL.bg)+R(0,0,W,H,0,'url(#dots)');
const vig=()=>R(0,0,W,H,0,'url(#vig)');
// ---------- интерфейс ----------
const added=n=>R(40,36,390,92,46,COL.ui,'fill-opacity=".92"')+T(80,93,30,'Добавлено:',{w:700,f:'Body',col:COL.mut})+T(392,104,60,String(n).padStart(2,'0'),{col:COL.tq,a:'end'});
const target=()=>R(1270,36,610,92,46,COL.ui,'fill-opacity=".92"')+flag('in',1302,58,64,10)+T(1388,99,38,'Индия —',{w:700,f:'Body',col:COL.mut})+T(1846,101,44,fmt(INDIA.pop)+' млн',{col:COL.ind,a:'end'});
function card(i){const [id,fl,name,pop,sum]=LIST[i-1];const x=1478,y=168,w=402;
  return R(x+8,y+14,w,488,44,'#000','fill-opacity=".25"')+R(x,y,w,488,44,COL.ui)+R(x,y,w,488,44,'none',`stroke="${COL.tq}" stroke-opacity=".35" stroke-width="3"`)+
    flag(fl,x+36,y+36,330,26)+R(x+36,y+300,104,52,26,COL.tq)+T(x+88,y+337,30,'№ '+i,{col:COL.bg,a:'middle'})+
    T(x+36,y+404,name.length>11?44:58,name)+T(x+36,y+460,50,fmt(pop)+' млн',{col:COL.tq})+T(x+w-36,y+460,22,'2025',{w:700,f:'Body',col:COL.mut,a:'end'});}
// нижняя шкала: доля от населения Индии, отметки 25/50/75 и цель
function bar(sum,{flash=null,callout=false}={}){const x0=96,x1=1740,y=980,h=40,L=x1-x0,fx=x0+L*Math.min(sum/INDIA.pop,1.02);
  let s=R(40,898,1840,154,46,COL.ui,'fill-opacity=".94"')+R(x0,y,L,h,h/2,COL.ui2);
  for(const p of [25,50,75]){const mx=x0+L*p/100;s+=R(mx-3,y-12,6,h+24,3,p===flash?COL.hi:'#3A4884')+T(mx,y-22,24,p+'%',{w:700,f:'Body',col:p===flash?COL.hi:COL.mut,a:'middle'});}
  if(flash){const mx=x0+L*flash/100;s+=`<circle cx="${mx}" cy="${y+h/2}" r="60" fill="#fff" opacity=".25" filter="url(#glow)"/>`;}
  s+=R(x0,y,Math.max(fx-x0,h),h,h/2,COL.tq)+R(x0+10,y+7,Math.max(fx-x0-20,10),9,4.5,'#fff','fill-opacity=".35"');
  // цель
  s+=R(x1-4,y-20,8,h+40,4,COL.ind)+flag('in',x1+26,y-14,64,10)+T(x1+58,y+70,22,'ЦЕЛЬ',{w:700,f:'Body',col:COL.ind,a:'middle'});
  s+=T(x0,y-22,26,fmt(sum)+' млн · '+pct(sum)+'%',{col:COL.txt,a:'start'});
  return s;}
// ---------- кадры ----------
const F={};
// 1 · 0:06 — цель: Индия
F[1]=()=>{const cam=fit(VIEWS.india,[60,90,1080,1010]);
  return bg()+map(cam,{focus:INDIA.id,dimOthers:true})+vig()+
    `<ellipse cx="1420" cy="520" rx="460" ry="300" fill="${COL.ind}" opacity=".10" filter="url(#soft)"/>`+
    R(1086,286,690,92,46,COL.ui,'fill-opacity=".9"')+flag('in',1118,304,74,12)+T(1218,346,40,'Индия · 2025',{w:700,f:'Body',col:COL.mut})+
    T(1080,560,190,fmt(INDIA.pop),{col:COL.ind,ls:-4})+T(1088,650,72,'млн человек',{w:700,f:'Body'})+
    R(1088,712,560,8,4,COL.ind,'fill-opacity=".5"')+T(1088,780,34,'Сколько стран нужно, чтобы догнать?',{w:700,f:'Body',col:COL.mut});};
// 2 · ~1:50 — 10 стран: сравнение на одной шкале
F[2]=()=>{const cam=fit(VIEWS.southAm,[880,150,1440,880]);const sum=107.4,BW=740;
  const flags=LIST.slice(0,10).map((c,k)=>flag(c[1],92+k*72,522,58,9)).join('');
  return bg()+map(cam,{added:10,focus:'152'})+vig()+
    R(52,168,820,476,44,COL.ui,'fill-opacity=".94"')+T(92,252,64,'Уже <tspan fill="'+COL.tq+'">10</tspan> стран')+
    T(92,322,28,'Одна шкала для обеих полос',{w:700,f:'Body',col:COL.mut})+
    R(92,366,BW,40,20,COL.ind)+T(112,395,24,'ИНДИЯ · '+fmt(INDIA.pop)+' млн',{col:COL.bg})+
    R(92,446,BW*sum/INDIA.pop,40,20,COL.tq)+T(92+BW*sum/INDIA.pop+18,475,24,'10 СТРАН · '+fmt(sum)+' млн',{col:COL.tq})+
    flags+T(92,612,30,'…и это чуть больше <tspan fill="'+COL.tq+'" font-family="Round" font-weight="900">7%</tspan>',{w:700,f:'Body'})+
    added(10)+target()+card(10)+bar(sum);};
// 3 · ~4:25 — США: шкала встаёт у самой цели
F[3]=()=>{const cam=fit([0,140,4000,1880],[40,140,1450,700]);const sum=1458.2,L=1740-96,fx=96+L*sum/INDIA.pop;
  const cx=1560,cy=760,r=96;
  return bg()+map(cam,{added:25,focus:'840'})+vig()+
    R(52,716,1360,160,44,COL.ui,'fill-opacity=".94"')+T(84,846,140,'99,6<tspan font-size="90">%</tspan>',{col:COL.tq,ls:-3})+
    R(520,748,6,96,3,'#3A4884')+T(560,786,44,'И всё равно не хватает')+T(560,840,34,'Осталось около <tspan fill="'+COL.ind+'" font-family="Round" font-weight="900">5,7 млн</tspan>',{w:700,f:'Body'})+
    added(25)+target()+card(25)+bar(sum)+
    // лупа над концом шкалы: зазор между заливкой и целью
    `<path d="M${cx-30},${cy+r-4} Q${fx-6},${cy+r+40} ${fx-2},990" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 14" opacity=".8"/>`+
    `<clipPath id="lens"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><circle cx="${cx}" cy="${cy}" r="${r+10}" fill="#fff"/>`+
    `<g clip-path="url(#lens)">${R(cx-r,cy-r,2*r,2*r,0,COL.ui2)}${R(cx-r-40,cy-28,r+40-14,56,28,COL.tq)}${R(cx+14,cy-50,14,100,7,COL.ind)}
      ${T(cx-6,cy+70,24,'5,7 млн',{col:COL.ind,a:'middle'})}</g>`;};
const CAPS={
  1:{t:'0:06',name:'Цель — Индия',cam:'Медленный наезд на тёмную карту, Индия заливается оранжевым с мягким свечением, счётчик бежит от 0 до 1 463,9 млн.',vo:'«В Индии живёт почти полтора миллиарда человек. Сколько стран нужно сложить, чтобы её догнать?»'},
  2:{t:'1:50',name:'Десять стран — и только 7%',cam:'Камера на Южной Америке, Чили подсвечена белым контуром. Слева выезжает сравнение: две полосы на одной шкале и ряд из 10 флагов.',vo:'«Уже десять стран… а это чуть больше семи процентов.»'},
  3:{t:'4:25',name:'США — и всё равно 99,6%',cam:'Отъезд на всю карту: 25 бирюзовых стран. Шкала дотягивается почти до цели и встаёт; лупа показывает зазор в 5,7 млн.',vo:'«Двадцать пять стран, включая США. И всё равно не хватает — около пяти миллионов.»'}};
