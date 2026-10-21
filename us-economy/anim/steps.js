// Episode 04 — шаги стран. Стиль «смесь»: страна заливается своим флагом, у неё открываются глаза и смотрят на США.
// Шаг: перелёт камеры → белый контур → крупные «#01 / NAME / $20.4B» → текст складывается в карточку → флаг-заливка →
// чип «+$20.4B» летит в шкалу → шкала растёт, счётчик перещёлкивается.
// Длительности по брифу: 1–40 — 8 с, 41–47 — 12 с, Франция и Великобритания — 20 с, Германия — 16 с, финал — 15 с.
const S_T0=26;
// id ISO, флаг, название, ВВП $B, сумма команды $B, доля США % (World Bank WDI, 2025, текущие US$; суммы и доли — из брифа)
const DATA=[['498','md','Moldova',20.4,20.4,.1],['388','jm','Jamaica',22.7,43.1,.1],['470','mt','Malta',27.8,70.8,.2],['051','am','Armenia',29.2,100.1,.3],
  ['070','ba','Bosnia and Herzegovina',32.6,132.7,.4],['352','is','Iceland',38.6,171.3,.6],['196','cy','Cyprus',41.2,212.5,.7],['233','ee','Estonia',47.0,259.5,.8],
  ['428','lv','Latvia',48.6,308.1,1.0],['048','bh','Bahrain',49.0,357.1,1.2],['600','py','Paraguay',49.3,406.4,1.3],['400','jo','Jordan',61.6,468.0,1.5],
  ['068','bo','Bolivia',64.8,532.8,1.7],['705','si','Slovenia',79.6,612.4,2.0],['858','uy','Uruguay',85.3,697.7,2.3],['591','pa','Panama',90.5,788.2,2.6],
  ['440','lt','Lithuania',95.2,883.4,2.9],['688','rs','Serbia',100.0,983.4,3.2],['442','lu','Luxembourg',101.2,1084.5,3.5],['188','cr','Costa Rica',102.9,1187.4,3.9],
  ['191','hr','Croatia',105.1,1292.5,4.2],['512','om','Oman',109.6,1402.1,4.6],['320','gt','Guatemala',123.3,1525.4,5.0],['214','do','Dominican Republic',127.4,1652.8,5.4],
  ['404','ke','Kenya',135.9,1788.8,5.8],['414','kw','Kuwait',157.2,1946.0,6.3],['504','ma','Morocco',182.4,2128.3,6.9],['634','qa','Qatar',215.6,2343.9,7.6],
  ['554','nz','New Zealand',264.1,2608.0,8.5],['246','fi','Finland',317.0,2925.0,9.5],['604','pe','Peru',334.9,3259.9,10.6],['152','cl','Chile',357.4,3617.2,11.8],
  ['818','eg','Egypt',365.3,3982.5,12.9],['710','za','South Africa',427.2,4409.7,14.3],['458','my','Malaysia',472.2,4881.9,15.9],['608','ph','Philippines',487.1,5368.9,17.4],
  ['704','vn','Vietnam',514.7,5883.6,19.1],['764','th','Thailand',577.0,6460.6,21.0],['752','se','Sweden',669.0,7129.6,23.2],['032','ar','Argentina',683.1,7812.7,25.4],
  ['528','nl','Netherlands',1332.8,9145.5,29.7],['792','tr','Türkiye',1597.3,10742.8,34.9],['036','au','Australia',1798.5,12541.3,40.8],['410','kr','South Korea',1872.4,14413.7,46.8],
  ['724','es','Spain',1906.5,16320.2,53.0],['076','br','Brazil',2279.9,18600.1,60.4],['124','ca','Canada',2319.9,20920.0,68.0],['250','fr','France',3366.3,24286.3,78.9],
  ['826','gb','United Kingdom',4002.6,28288.9,91.9],['276','de','Germany',5050.9,33339.8,108.4]];
// шаблоны времени внутри шага (с от начала шага); lin — линейный рост шкалы (Германия пересекает цель на 49.1% сложения)
const K8={arrive:1.0,hl:1.1,idx:1.15,name:1.3,num:1.6,unit:2.5,card:3.3,fill:3.6,chip:3.9,land:4.4,grow:.7,note:5.2};
const K12={arrive:1.6,hl:1.8,idx:1.9,name:2.1,num:2.5,unit:3.5,card:4.6,fill:5.0,chip:5.4,land:6.0,grow:1.0,note:7.6};
const KFR={arrive:1.0,hl:1.1,idx:1.15,name:1.3,num:1.6,unit:2.5,card:3.0,fill:3.3,chip:3.6,land:4.0,grow:8.0,lin:true,note:12.2};
const KDE={arrive:.8,hl:.9,idx:.95,name:1.05,num:1.25,unit:2.0,card:2.2,fill:2.4,chip:2.6,land:3.0,grow:8.0,lin:true,note:11.3};
const LEN=n=>n<=40?8:n<=47?12:n<=49?20:16;
// комментарии: [строка 1, строка 2, начало, конец] (с от начала шага; по умолчанию — от K.note до выхода)
const NOTE={9:[['*1%* CROSSED.','Nine countries in.']],10:[['*TEN* COUNTRIES.','We’ve barely started — 1.2%.']],19:[['*$1 TRILLION* TEAM.','Still only 3.5% of the US.']],
  20:[['*TWENTY* COUNTRIES.','The US is still far ahead.']],24:[['*5%* CROSSED.','Twenty-four countries in.']],25:[['*25* COUNTRIES.','5.8% of the target.']],
  30:[['*THIRTY* COUNTRIES.','Still below 10%.']],31:[['*10%* CROSSED.','Thirty-one countries in.']],35:[['*35* COUNTRIES.','15.9% of the target.']],
  39:[['ALMOST A QUARTER…','23.2% — not yet.']],40:[['*25%* — A QUARTER.','It took forty countries.']],41:[['*$1.33T* IN ONE STEP.','The first trillion-dollar addition.']],
  42:[['*$10 TRILLION* TEAM.','34.9% of the US economy.']],43:[['BIG MAP, ^SMALLER^ SLICE.','Land area is not GDP.']],44:[['SO CLOSE TO *HALFWAY.*','46.8% — not yet.']],
  45:[['*HALFWAY* CROSSED.','Forty-five countries contributing.']],46:[['*60%* PASSED.','The team keeps climbing.']],47:[['*68%.*','Three countries left.']],
  48:[['*75%* PASSED.','Two countries remain.',12.2]],50:[['TARGET *CROSSED.*','And the team keeps going.',11.3]]};
// вспышки отметок шкалы (25/50/75/100) и всплывающие отметки (1/5/10%, $1T…)
const MILE=[[40,25],[45,50],[48,75],[50,100]];
const POPS=[[9,TPOP*.01,'1%'],[19,1000,'$1T'],[24,TPOP*.05,'5%'],[31,TPOP*.1,'10%'],[42,10000,'$10T'],[43,TPOP*.4,'40%'],[46,TPOP*.6,'60%'],[47,20000,'$20T'],[49,TPOP*.9,'90%']];
// обзоры команды сеткой флагов
const GRID={10:1,20:1,25:1,30:1,35:1,40:1};
let _t=S_T0;
const STEPS=DATA.map((d,i)=>{const n=i+1,len=LEN(n),K=n<=40?K8:n<=47?K12:n<=49?KFR:KDE,box=VIEWS[d[1]]||MAINBOX[d[0]];
  const bw=box[2]-box[0],bh=box[3]-box[1],tiny=Math.max(bw,bh)<16;
  // крошечная страна: камера на окрестность, сама страна — в лупе
  const vbox=tiny?[(box[0]+box[2])/2-45,(box[1]+box[3])/2-38,(box[0]+box[2])/2+45,(box[1]+box[3])/2+38]:box;
  const s={i,n,id:d[0],fl:d[1],name:d[2].toUpperCase(),pop:d[3],sum:d[4],pct:d[5],prev:i?DATA[i-1][4]:0,ppct:i?DATA[i-1][5]:0,t0:_t,len,K,box,vbox,tiny,
    bc:[(box[0]+box[2])/2,(box[1]+box[3])/2],p:PATHS.find(o=>o.id===d[0]).p};
  const B=MAP[d[0]].b;s.R=Math.max(...[[B[0][0],B[0][1]],[B[1][0],B[0][1]],[B[0][0],B[1][1]],[B[1][0],B[1][1]]].map(([x,y])=>Math.hypot(x-s.bc[0],y-s.bc[1])));_t+=len;return s;});
const FIN=_t,FLEN=15;DURATION=FIN+FLEN;
const FR=STEPS[47],GB=STEPS[48],DE=STEPS[49];
const FLAGS={};for(const s of STEPS){const im=new Image();im.src=`../flags/${s.fl}.svg`;FLAGS[s.fl]=im;}
window.ready=window.ready.then(()=>Promise.all(Object.values(FLAGS).map(im=>im.complete?0:new Promise(r=>im.onload=im.onerror=r)))).then(buildMini);
// точка для глаз: самая «глубокая» точка внутри основной части страны
const pcx=document.createElement('canvas').getContext('2d');
function deepPoint(p,box){const N=28,pts=[];for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=box[0]+(box[2]-box[0])*i/N,y=box[1]+(box[3]-box[1])*j/N;pts.push([x,y,pcx.isPointInPath(p,x,y)]);}
  const out=pts.filter(q=>!q[2]);let best=null,bd=-1;for(const q of pts){if(!q[2])continue;let d=1e9;for(const o of out)d=Math.min(d,Math.hypot(q[0]-o[0],q[1]-o[1]));if(d>bd){bd=d;best=q;}}
  return best?[best[0],best[1]]:[(box[0]+box[2])/2,(box[1]+box[3])/2];}
for(const st of STEPS)st.eye=deepPoint(st.p,MAINBOX[st.id]||st.box);
// рост шкалы шага: доля сложения к моменту r
const growP=(s,r)=>{const p=seg(r,s.K.land,s.K.grow);return s.K.lin?p:eoe(p);};
// момент, когда растущая сумма шага пересекает порог
function crossT(s,thr){const p=cl((thr-s.prev)/(s.sum-s.prev),0,.999);return s.t0+s.K.land+s.K.grow*(s.K.lin?p:-Math.log2(1-p)/10);}
// ---------- камера ----------
const REG_L=[100,200,900,860],REG_C=[90,180,1430,860];
const key=(t,v,rot=0)=>CAM.push([t,v[0],v[1],v[2],rot,0]);
for(const s of STEPS){const K=s.K,pv=CAM[CAM.length-1],L=view(s.vbox,REG_L,.82),C=view(s.vbox,REG_C,.78);
  CAM.push([s.t0+.08,pv[1],pv[2],pv[3],pv[4],0]);
  const dist=Math.hypot(L[0]-pv[1],L[1]-pv[2]),zm=Math.max(.36,Math.min(pv[3],L[2],1400/Math.max(dist,1)));
  CAM.push([s.t0+K.arrive*.55,lerp(pv[1],L[0],.5),lerp(pv[2],L[1],.5),zm,s.i%2?.01:-.01,0]);
  key(s.t0+K.arrive,L);key(s.t0+K.card,[L[0],L[1],L[2]*1.03],.003);key(s.t0+K.card+.8,C);
  if(s===FR||s===GB){const R=view(WORLD,[40,140,1450,700],1);key(s.t0+15.6,[C[0],C[1],C[2]*1.03]);key(s.t0+16.8,R);key(s.t0+s.len-.1,[R[0],R[1],R[2]*1.02]);}
  else key(s.t0+s.len-.1,[C[0],C[1],C[2]*1.05],-.004);}
{const F=view(WORLD,[40,430,1880,1040],1);key(FIN+2.2,F);key(FIN+FLEN,[F[0],F[1],F[2]*1.03]);}
// ---------- карта: контур, заливка флагом, волна финала ----------
window.mapSteps=(M,t,C)=>{for(const s of STEPS){const r=t-s.t0,K=s.K;if(r<K.hl)continue;
  const f=eoe(seg(r,K.fill,.6)),u=eio(seg(r,K.fill,.45));
  if(u>0){M.globalAlpha=u*.45;M.fillStyle=COL.tq;M.fill(s.p);M.globalAlpha=1;}
  if(f>0){M.save();if(f<.999){M.beginPath();M.arc(s.bc[0],s.bc[1],f*s.R,0,7);M.clip();}M.clip(s.p);flagFill(M,FLAGS[s.fl],MAINBOX[s.id]||s.box);M.restore();
    M.save();M.strokeStyle=COL.tq;M.lineWidth=3.2/C.z;M.lineJoin='round';M.stroke(s.p);M.restore();}
  const w=t-(FIN+.8+s.i*.04),wv=w>0&&w<.6?Math.sin(w/.6*Math.PI):0;
  const hl=Math.max(seg(r,K.hl,.3)*(1-seg(r,K.fill+.6,.8)),wv);
  if(hl>0){M.save();M.globalAlpha=hl*.12*(1-f)+wv*.25;M.fillStyle='#fff';M.fill(s.p);M.globalAlpha=hl;M.shadowColor='rgba(255,255,255,.9)';M.shadowBlur=18;
    M.strokeStyle='#fff';M.lineWidth=3/C.z;M.stroke(s.p);M.restore();}}};
// ---------- шкала, счётчик, отметки, слой интерфейса ----------
window.sumAt=t=>{// пробное сложение во вступлении: +$1T и сброс
  if(t>19.2&&t<S_T0){const e=eoe(seg(t,19.3,.6))*(1-eio(seg(t,21.8,.5)));return{v:1000*e,glow:seg(t,19.3,.1)*(1-seg(t,20.4,.6)),pct:1000/TPOP*100*e};}
  let v=0,glow=0,pct=0;for(const s of STEPS){const r=t-s.t0;if(r<s.K.land)break;const e=growP(s,r);v=lerp(s.prev,s.sum,e);pct=lerp(s.ppct,s.pct,e);glow=1-seg(r,s.K.land+s.K.grow-.3,.8);}return{v,glow,pct};};
window.addedAt=t=>{let a={from:0,to:0,p:1};for(const s of STEPS){const r=t-s.t0;if(r<s.K.land)break;a={from:s.n-1,to:s.n,p:seg(r,s.K.land,.35)};}return a;};
window.markFlash=(t,m)=>{for(const [n,mm] of MILE)if(mm===m){const r=t-crossT(STEPS[n-1],TPOP*m/100);if(r>0&&r<1.6)return Math.exp(-r*2.2)*(1+.25*Math.sin(r*18));}return 0;};
window.countPops=t=>{const out=[];for(const [n,v,label] of POPS){const r=t-crossT(STEPS[n-1],v);if(r>0&&r<2.4)out.push({v,label,s:cl(spring(r,2.2,.5),0,1.1),a:seg(r,0,.1)*(1-seg(r,1.8,.6))});}return out;};
window.uiAlpha=t=>1-seg(t,FIN+4.4,.8);
// «GAP $2.48T» под шкалой после Великобритании; «+8.4%» внутри светлого сегмента перелёта
window.barExtra=(c,t,B)=>{
  const g=seg(t,GB.t0+12.6,.5)*(1-seg(t,DE.t0+DE.K.land,.4));if(g>0){const gx=bx(GB.sum),yb=B.y+B.h+8;c.save();c.globalAlpha=g;c.strokeStyle=COL.ind;c.lineWidth=3;c.setLineDash([4,8]);
    c.beginPath();c.moveTo(gx+6,B.y+B.h-2);c.lineTo(gx+6,yb);c.lineTo(GX-6,yb);c.lineTo(GX-6,B.y+B.h-2);c.stroke();c.setLineDash([]);
    font(c,9,20);const s='GAP $2.48T',w=c.measureText(s).width,cx=(gx+GX)/2;rr(c,cx-w/2-12,yb+2,w+24,28,14,COL.ind);c.fillStyle=COL.bg;c.textAlign='center';c.fillText(s,cx,yb+23);c.restore();}
  const o=seg(t,DE.t0+DE.K.land+DE.K.grow+.1,.4);if(o>0){const x=(GX+bx(DE.sum))/2;c.save();c.globalAlpha=o;font(c,9,20);c.fillStyle=COL.bg;c.textAlign='center';c.fillText('+8.4%',x,B.y+B.h/2+7);c.restore();}};
// ---------- мини-карта: США-ориентир во время наездов ----------
const MW=300,MH=150,MX=40,MY=148,mini=document.createElement('canvas');mini.width=MW;mini.height=MH;
let miniBase;
function miniXf(c){c.setTransform(1,0,0,1,0,0);c.translate(MW/2,MH/2);const s=Math.min(MW/(WORLD[2]-WORLD[0]),MH/(WORLD[3]-WORLD[1]));c.scale(s,s);c.translate(-(WORLD[0]+WORLD[2])/2,-(WORLD[1]+WORLD[3])/2);return s;}
function buildMini(){miniBase=document.createElement('canvas');miniBase.width=MW;miniBase.height=MH;const c=miniBase.getContext('2d');miniXf(c);
  c.fillStyle='#34415F';for(const o of PATHS)if(o.id!==TGT)c.fill(o.p);c.fillStyle=COL.ind;c.fill(TP);}
window.miniMap=(c,t)=>{let a=seg(t,S_T0+.3,.6)*(1-seg(t,FIN,.6));for(const s of STEPS)if(GRID[s.n]){const r=t-s.t0;a*=1-seg(r,s.K.note-.2,.3)*(1-seg(r,s.len-.6,.3));}
  if(a<=0||!miniBase)return;const m=mini.getContext('2d');m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,MW,MH);m.drawImage(miniBase,0,0);miniXf(m);
  let cur=null;for(const st of STEPS){const r=t-st.t0;if(r<0)break;if(r>=st.K.fill){m.fillStyle=COL.tq;m.fill(st.p);}cur=st;}
  c.save();c.globalAlpha=a*.95;rr(c,MX-8,MY-8,MW+16,MH+16,22,'rgba(23,36,64,.92)');c.drawImage(mini,MX,MY);
  if(cur){const sc=Math.min(MW/(WORLD[2]-WORLD[0]),MH/(WORLD[3]-WORLD[1])),px=MX+MW/2+(cur.bc[0]-(WORLD[0]+WORLD[2])/2)*sc,py=MY+MH/2+(cur.bc[1]-(WORLD[1]+WORLD[3])/2)*sc,ph=((t-cur.t0)*1.4)%1;
    c.strokeStyle='#fff';c.lineWidth=2;c.globalAlpha=a*(1-ph);c.beginPath();c.arc(px,py,4+ph*14,0,7);c.stroke();c.globalAlpha=a;c.fillStyle='#fff';c.beginPath();c.arc(px,py,3,0,7);c.fill();}
  c.restore();};
// ---------- глаза: США следят за текущей страной; страны команды смотрят на США ----------
function blinkAt(t,seed){const ph=(t+hash(seed)*5)%4.3;return ph<.14?Math.sin(ph/.14*Math.PI):0;}
function usMood(t){const cr=crossT(DE,TPOP);if(t>=cr&&t<cr+4)return'shock';if(t>=FR.t0+FR.K.land)return'wide';return'angry';}
function drawEyes(c,t,C){const [ux,uy]=toScreen(C,IC[0],IC[1]),uw=(UB[2]-UB[0])*C.z;let cur=null;for(const st of STEPS){if(t-st.t0>=0)cur=st;}
  const cr=crossT(DE,TPOP),joy=t>=cr&&t<cr+3.5;
  for(const st of STEPS){const r=t-st.t0;if(r<st.K.fill+.35)continue;const box=MAINBOX[st.id]||st.box,bw=(box[2]-box[0])*C.z,sz=cl(bw*.11,0,40),[x,y]=toScreen(C,st.eye[0],st.eye[1]);
    if(x<-60||x>W+60||y<-60||y>H+60)continue;const q=cl(spring(r-st.K.fill-.35,2.4,.5),0,1.2);eyes(c,x,y,sz*q,ux-x,uy-y,joy?'joy':'happy',blinkAt(t,st.i),seg(r,st.K.fill+.35,.15));}
  const a=seg(t,LIT+.6,.4);if(a>0&&ux>-100&&ux<W+100&&uy>-100&&uy<H+100){let lx=0,ly=1;if(cur){const [cx,cy]=toScreen(C,cur.bc[0],cur.bc[1]);lx=cx-ux;ly=cy-uy;}
    eyes(c,ux,uy,cl(uw*.14,22,84),lx,ly,usMood(t),blinkAt(t,99),a);}}
// ---------- текст и карточка ----------
function fitSize(c,s,w,max,maxW,ls=0){font(c,w,100,ls);return Math.min(max,100*maxW/c.measureText(s).width);}
const CD={x:1478,y:168,w:402,h:488};
const ANIMS=['mask','flip','skew','slam','track'];
window.stepsUI=(c,t,C)=>{drawEyes(c,t,C);
  for(const s of STEPS){const r=t-s.t0;if(r<s.K.arrive-.2||r>s.len+.6)continue;if(s.tiny)lens(c,t,r,s,C);drawStep(c,t,r,s,C);
    if(NOTE[s.n])for(const ph of NOTE[s.n])note(c,t,r,s,ph);
    if(GRID[s.n])teamGrid(c,t,s.n,seg(r,s.K.note-.2,.3)*(1-seg(r,s.len-.6,.3)),`*${s.n}* / 50 COUNTRIES`,`Team total ${fmt(s.sum)} · ${s.pct.toFixed(1)}% of the US`,s.t0+s.K.note-.2);
    if(s===FR)teamGrid(c,t,48,seg(r,15.4,.3)*(1-seg(r,19.4,.3)),'*48* / 50 · two flags left',`Team total ${fmt(s.sum)} · 78.9% of the US`,s.t0+15.4);
    if(s===GB)stillShort(c,t,r);}
  finale(c,t);};
// лупа для крошечных стран: окно ×8 рядом с точкой
const lc=document.createElement('canvas');lc.width=W;lc.height=H;const LM=lc.getContext('2d');
function lens(c,t,r,s,C){const K=s.K;if(r<K.hl-.3)return;const [sx,sy]=toScreen(C,s.bc[0],s.bc[1]),q=spring(r-K.hl+.3,1.7,.6),out=1-seg(r,s.len-.4,.35),RR=140,lx=sx-240,ly=Math.max(sy-210,300);
  const ph=(r*1.6)%1;c.save();c.globalAlpha=out*(1-ph);c.strokeStyle=COL.tq;c.lineWidth=3;c.beginPath();c.arc(sx,sy,10+ph*36,0,7);c.stroke();c.restore();
  c.save();c.globalAlpha=out;c.fillStyle=r>K.fill?COL.tq:'#fff';c.beginPath();c.arc(sx,sy,6,0,7);c.fill();
  c.globalAlpha*=seg(r,K.hl,.3);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.setLineDash([2,12]);c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.lineTo(lx+RR*.7,ly+RR*.7);c.stroke();c.setLineDash([]);
  const z=Math.min(C.z*8,1.2*RR/Math.max(s.box[2]-s.box[0],s.box[3]-s.box[1]));drawMap(t,{cx:s.bc[0],cy:s.bc[1],z,rot:0},LM);
  c.translate(lx,ly);c.scale(cl(q,0,1.1),cl(q,0,1.1));c.fillStyle='#fff';c.beginPath();c.arc(0,0,RR+8,0,7);c.fill();c.beginPath();c.arc(0,0,RR,0,7);c.clip();
  c.fillStyle=COL.bg;c.fillRect(-RR,-RR,2*RR,2*RR);c.drawImage(lc,W/2-RR,H/2-RR,2*RR,2*RR,-RR,-RR,2*RR,2*RR);
  font(c,9,20,2);c.textAlign='center';c.fillStyle='#fff';c.fillText('INSET',0,RR-18);c.restore();}
function drawStep(c,t,r,s,C){const K=s.K;
  const dim=seg(r,K.arrive,.4)*(1-seg(r,K.card,.6));if(dim>0){const g=c.createLinearGradient(760,0,1500,0);g.addColorStop(0,'rgba(8,12,26,0)');g.addColorStop(1,`rgba(8,12,26,${.75*dim})`);c.fillStyle=g;c.fillRect(760,140,W-760,750);}
  const idx='#'+String(s.n).padStart(2,'0'),num=fmt(s.pop),nameH=fitSize(c,s.name,9,170,860),nameC=fitSize(c,s.name,9,58,330),numC=fitSize(c,num,9,50,330);
  font(c,9,100,-2);const NS=Math.min(200,100*600/c.measureText(num).width);
  const ex=eie(seg(r,s.len,.45));if(ex>=1)return chip(c,r,s,C,num);c.save();if(ex>0){c.translate(ex*560,0);c.globalAlpha=1-ex;c.filter=`blur(${(ex*10).toFixed(1)}px)`;}
  const arc=p=>-Math.sin(Math.PI*p)*34,cd=K===K8?.5:.6;
  if(r>=K.card+.08){const q=spring(r-K.card-.08,1.8,.62),sc=lerp(.94,1,cl(q,0,1.05));c.save();c.globalAlpha*=cl(q*1.6);
    c.translate(CD.x+CD.w/2,CD.y+CD.h/2);c.scale(sc,sc);c.translate(-CD.x-CD.w/2,-CD.y-CD.h/2);
    rr(c,CD.x+8,CD.y+14,CD.w,CD.h,44,'rgba(0,0,0,.25)');rr(c,CD.x,CD.y,CD.w,CD.h,44,COL.ui);c.strokeStyle='rgba(39,214,203,.35)';c.lineWidth=3;c.stroke();c.restore();
    const f=spring(r-K.card-.25,2,.55);if(r>K.card+.25){c.save();c.globalAlpha*=cl(f*2);const fy=CD.y+36+(1-cl(f,0,1.1))*-50;
      c.beginPath();c.roundRect(CD.x+36,fy,330,247.5,26);c.clip();c.drawImage(FLAGS[s.fl],CD.x+36,fy,330,247.5);c.restore();
      // глаза у флага в карточке — «персонаж»
      eyes(c,CD.x+201,fy+150,30*cl(f,0,1.1),0,1,'happy',blinkAt(t,s.i+50),1);}
    c.save();c.strokeStyle=COL.tq;c.lineWidth=4;c.beginPath();c.arc(CD.x+CD.w-62,CD.y+326,24,0,7);c.stroke();font(c,9,28);c.textAlign='center';c.fillStyle=COL.tq;c.fillText('$',CD.x+CD.w-62,CD.y+336);c.restore();}
  {const p=eio(seg(r,K.card,cd));if(r>=K.idx){const al=seg(r,K.idx,.3),ls=lerp(60,6,eoe(seg(r,K.idx,.5)));
    if(p>.55){const q=seg(p,.55,.3);c.save();c.globalAlpha*=q;rr(c,CD.x+36,CD.y+300,104,52,26,COL.tq);c.restore();}
    const size=lerp(64,30,p),w=p>.5?9:2;font(c,w,size,lerp(ls,0,p));const bw=c.measureText(idx).width;
    const x=lerp(1000,CD.x+88-bw/2,p),y=lerp(330,CD.y+337,p)+arc(p);c.save();c.globalAlpha*=al;c.fillStyle=p>.55?COL.bg:COL.mut;c.textAlign='left';c.fillText(idx,x,y);c.restore();}}
  {const p=eio(seg(r,K.card+.05,cd));
    if(p<=0)word(c,t,{s:s.name,w:9,size:nameH,x:1000,y:500,in:s.t0+K.name,a:ANIMS[s.i%5],from:1.4,ls0:50,dur:.4});
    else{font(c,9,lerp(nameH,nameC,p));c.textAlign='left';c.fillStyle=COL.txt;c.fillText(s.name,lerp(1000,CD.x+36,p),lerp(500,CD.y+404,p)+arc(p));}}
  {const p=eio(seg(r,K.card+.1,cd));
    if(r>=K.num){if(p<=0){c.save();c.globalAlpha*=seg(r,K.num,.15);odo(c,t,num,1000,730,NS,COL.tq,s.t0+K.num,s.t0+K.unit,K===K8?.12:.16);c.restore();}
      else{const sz=lerp(NS,numC,p);font(c,9,sz,-sz*.02);c.textAlign='left';c.fillStyle=COL.tq;c.fillText(num,lerp(1000,CD.x+36,p),lerp(730,CD.y+460,p)+arc(p));}
      if(r>=K.unit&&p<1){c.save();c.globalAlpha*=seg(r,K.unit,.3)*(1-seg(p,0,.4));font(c,2,44,lerp(30,4,eoe(seg(r,K.unit,.5))));c.fillStyle=COL.txt;c.textAlign='left';c.fillText('GDP 2025',1004,800);c.restore();}}}
  c.restore();chip(c,r,s,C,num);}
// чип «+$20.4B» летит из страны в голову шкалы
function chip(c,r,s,C,num){const K=s.K;if(r<K.chip||r>=K.land+.15)return;const p=eio(seg(r,K.chip,K.land-K.chip)),[sx,sy]=toScreen(C,s.bc[0],s.bc[1]),ex2=bx(s.prev),ey=BY+BH/2;
  const x=lerp(sx,ex2,p),y=lerp(sy,ey,p)-Math.sin(Math.PI*p)*170,sc=lerp(1,.7,p),txt='+'+num;
  c.save();c.globalAlpha=1-seg(r,K.land,.15);c.translate(x,y);c.scale(sc,sc);font(c,9,34);const w=c.measureText(txt).width;
  c.shadowColor='rgba(39,214,203,.6)';c.shadowBlur=24;rr(c,-w/2-20,-28,w+40,56,28,COL.tq);c.shadowBlur=0;c.fillStyle=COL.bg;c.textAlign='center';c.fillText(txt,0,12);c.restore();}
// ---------- комментарий: крупная строка + тонкая ----------
function note(c,t,r,s,ph){const [l1,l2,tin0,tout]=ph,t1=tin0??s.K.note,end=(tout??s.len)-.45;if(r<t1||r>end+.5)return;const big=MILE.some(m=>m[0]===s.n)?100:80;
  const a=seg(r,t1,.4)*(1-seg(r,end,.4));const g=c.createLinearGradient(0,0,1350,0);g.addColorStop(0,`rgba(8,12,26,${.8*a})`);g.addColorStop(1,'rgba(8,12,26,0)');c.fillStyle=g;c.fillRect(0,700,1350,190);
  for(const [txt,w,size,y,tin] of [[l1,9,big,804,t1],[l2,2,44,862,t1+.3]]){if(r<tin)continue;const pin=eoe(seg(r,tin,.4)),pout=eie(seg(r,end,.4));
    c.save();c.beginPath();c.rect(60,y-size*1.05,1400,size*1.3);c.clip();font(c,w,size,w===2?lerp(30,2,pin):0);
    c.translate(0,(1-pin)*size*1.1-pout*size*1.1);rich(c,txt,110,y,COL.txt);c.restore();}}
// ---------- Великобритания: 91.9% и «STILL SHORT» ----------
function stillShort(c,t,r){const a=r-12.4;if(a<0||a>GB.len-12.4+.5)return;const out=1-seg(a,GB.len-12.4-.45,.4);c.save();c.globalAlpha=out;
  const pin=eoe(seg(a,0,.5));c.save();c.globalAlpha*=pin;rr(c,52,716+(1-pin)*40,1360,160,44,'rgba(23,36,64,.95)');c.restore();
  if(a>=.4){const q=spring(a-.4,2,.5);c.save();c.translate(84,846);c.scale(lerp(1.5,1,cl(q)),lerp(1.5,1,cl(q)));c.globalAlpha*=cl(q*3);font(c,9,140,-3);c.fillStyle=COL.tq;c.fillText('91.9',0,0);
    const w=c.measureText('91.9').width;font(c,9,90);c.fillText('%',w,0);c.restore();}
  if(a>=.2){c.save();c.globalAlpha*=seg(a,.2,.3);rr(c,520,748,6,96,3,'#3A4A6E');c.restore();
    for(const [txt,w,size,y,tin] of [['STILL SHORT.',9,48,790,.2],['Gap: ^$2.48T^ · one flag slot left',7,34,842,1.0]]){if(a<tin)continue;const p=eoe(seg(a,tin,.45));
      c.save();c.beginPath();c.rect(540,y-size,880,size*1.3);c.clip();c.translate(0,(1-p)*size);font(c,w,size);rich(c,txt,560,y,COL.txt);c.restore();}}
  c.restore();}
// ---------- финал: 50 стран против США, место под конечную заставку ----------
function finale(c,t){const a=t-FIN;if(a<0)return;
  const dim=seg(a,4.6,.6)*.3;if(dim>0){c.fillStyle=`rgba(8,12,26,${dim})`;c.fillRect(0,0,W,H);}
  if(a>=4.8){const pin=eoe(seg(a,4.8,.6)),BW=1080,x0=420;c.save();c.globalAlpha=pin;c.translate(0,(1-pin)*-40);
    rr(c,300,40,1320,400,48,'rgba(23,36,64,.96)');
    const tt=eio(seg(a,5.2,1.0)),tc=eio(seg(a,6.0,1.0));
    font(c,7,26,2);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('50 SELECTED COUNTRIES',x0,118);rr(c,x0,134,Math.max(52,BW*tt),52,26,COL.tq);
    c.fillStyle=COL.mut;c.fillText('UNITED STATES',x0,240);rr(c,x0,256,Math.max(52,BW*TPOP/DE.sum*tc),52,26,COL.ind);
    c.save();c.globalAlpha*=seg(a,7.0,.4);font(c,9,40);c.textAlign='right';c.fillStyle=COL.tq;c.fillText('$33.34T',x0+BW,118);c.fillStyle=COL.ind;c.fillText('$30.77T',x0+BW,240);c.restore();
    if(a>=7.6){const q=spring(a-7.6,2,.55);c.save();c.translate(960,382);c.scale(lerp(1.4,1,cl(q)),lerp(1.4,1,cl(q)));c.globalAlpha*=cl(q*3);font(c,9,46);c.textAlign='center';rich(c,'TEAM: *108.4%* OF THE US',0,0,COL.txt,'center');c.restore();}
    c.save();c.globalAlpha*=seg(a,8.4,.5);font(c,7,20);c.textAlign='center';c.fillStyle=COL.mut;c.fillText('2025 nominal GDP, current US$ • World Bank WDI • Calculated from unrounded values',960,424);c.restore();
    c.restore();}}
