// Шаг страны: 10 с (у пяти последних — 20 с). Герой — текст:
// перелёт камеры → белый контур → крупные «#01 / NAME / 5.3M PEOPLE» → текст складывается в карточку справа →
// страна заливается бирюзовым → чип «+5.3M» летит в шкалу → шкала растёт, счётчик перещёлкивается.
// Особые моменты: комментарии, отметки 100M…1B, 25/50/75/100%, сравнения (Германия, Япония), «STILL SHORT» (Нигерия),
// перелёт за цель (Филиппины), финал.
const S_T0=30,STEP=10;
// id ISO, флаг, название, млн, сумма команды, доля Китая % (по точным значениям из брифа; UN WPP 2024, 2025)
const DATA=[['372','ie','Ireland',5.3,5.3,.4],['752','se','Sweden',10.7,16.0,1.1],['056','be','Belgium',11.8,27.7,2.0],['788','tn','Tunisia',12.3,40.1,2.8],
  ['716','zw','Zimbabwe',17.0,57.0,4.0],['116','kh','Cambodia',17.8,74.9,5.3],['528','nl','Netherlands',18.3,93.2,6.6],['642','ro','Romania',18.9,112.1,7.9],
  ['894','zm','Zambia',21.9,134.0,9.5],['144','lk','Sri Lanka',23.2,157.3,11.1],['288','gh','Ghana',35.1,192.3,13.6],['458','my','Malaysia',36.0,228.3,16.1],
  ['504','ma','Morocco',38.4,266.7,18.8],['012','dz','Algeria',47.4,314.2,22.2],['800','ug','Uganda',51.4,365.6,25.8],['410','kr','South Korea',51.7,417.2,29.5],
  ['710','za','South Africa',64.7,482.0,34.0],['250','fr','France',66.7,548.6,38.7],['826','gb','United Kingdom',69.6,618.2,43.7],['764','th','Thailand',71.6,689.8,48.7],
  ['276','de','Germany',84.1,773.9,54.6],['392','jp','Japan',123.1,897.0,63.3],['050','bd','Bangladesh',175.7,1072.7,75.7],['566','ng','Nigeria',237.5,1310.2,92.5],
  ['608','ph','Philippines',116.8,1427.0,100.8]];
const EXTRA={21:10,22:10,23:10,24:10,25:10};
// комментарии: [строка 1, строка 2, начало, конец] (с от начала шага; конец по умолчанию — до выхода)
const NOTE={5:[['*FIVE* COUNTRIES.','Only about 4% of the target.']],8:[['*100 MILLION* PASSED.','After eight countries.']],
  10:[['*TEN* COUNTRIES.','Still only 11%.']],15:[['*25%* — A QUARTER.','It took fifteen countries.']],
  18:[['*500 MILLION* PASSED.','But the target is much higher.']],20:[['ALMOST HALFWAY.','48.7% — not quite 50%.']],
  21:[['*HALFWAY* CROSSED.','Twenty-one countries in.',7.3,9.7]],
  23:[['*1 BILLION* PASSED.','And over the 75% mark.',7.3,13.2],['*23* COUNTRIES.','Can the last two close the gap?',13.6]],
  25:[['TARGET *CROSSED.*','About 11 million more than China.',7.3,13.2],['*25* COUNTRIES.','100.8% of China’s population.',13.6]]};
const MILE={15:25,21:50,23:75,25:100};
// всплывающие отметки суммы над шкалой
const POPS=[[2,14.16,'1%'],[8,100,'100M'],[12,200,'200M'],[14,300,'300M'],[16,400,'400M'],[18,500,'500M'],[19,600,'600M'],[23,1000,'1B']];
const RING={be:1,nl:1,lk:1}; // маленькие страны — белое кольцо-локатор
let _t=S_T0;
const STEPS=DATA.map((d,i)=>{const box=VIEWS[d[1]],len=STEP+(EXTRA[i+1]||0),s={i,id:d[0],fl:d[1],name:d[2].toUpperCase(),pop:d[3],sum:d[4],pct:d[5],
  prev:i?DATA[i-1][4]:0,ppct:i?DATA[i-1][5]:0,n:i+1,t0:_t,len,box,vbox:box,bc:[(box[0]+box[2])/2,(box[1]+box[3])/2],p:PATHS.find(o=>o.id===d[0]).p};
  const B=MAP[d[0]].b;s.R=Math.max(...[[B[0][0],B[0][1]],[B[1][0],B[0][1]],[B[0][0],B[1][1]],[B[1][0],B[1][1]]].map(([x,y])=>Math.hypot(x-s.bc[0],y-s.bc[1])));_t+=len;return s;});
const FIN=_t,FLEN=20;DURATION=FIN+FLEN;
const DE=STEPS[20],JP=STEPS[21],BD=STEPS[22],NG=STEPS[23],PH=STEPS[24];
const K={arrive:1.7,hl:1.9,idx:2.0,name:2.25,num:2.75,unit:3.75,card:5.0,fill:5.5,chip:6.0,land:6.6,grow:.8,note:7.3};
const FLAGS={};for(const s of STEPS){const im=new Image();im.src=`../flags/${s.fl}.svg`;FLAGS[s.fl]=im;}
window.ready=window.ready.then(()=>Promise.all(Object.values(FLAGS).map(im=>im.complete?0:new Promise(r=>im.onload=im.onerror=r)))).then(buildMini);
// момент, когда растущая сумма шага пересекает порог (для вспышек и звука)
function crossT(s,thr){const p=cl((thr-s.prev)/(s.sum-s.prev),0,.999);return s.t0+K.land+K.grow*(-Math.log2(1-p)/10);}
const pctOf=v=>v/TPOP*100;
// ---------- камера ----------
const REG_L=[100,200,900,860],REG_C=[90,180,1430,860];
const key=(t,v,rot=0)=>CAM.push([t,v[0],v[1],v[2],rot,0]);
for(const s of STEPS){const pv=CAM[CAM.length-1],L=view(s.vbox,REG_L,.82),C=view(s.vbox,REG_C,.78);
  if(s.i)CAM.push([s.t0+.12,pv[1],pv[2],pv[3],pv[4],0]);
  const dist=Math.hypot(L[0]-pv[1],L[1]-pv[2]),zm=Math.max(.36,Math.min(pv[3],L[2],1400/Math.max(dist,1)));
  CAM.push([s.t0+.95,lerp(pv[1],L[0],.5),lerp(pv[2],L[1],.5),zm,s.i%2?.012:-.012,0]);
  key(s.t0+K.arrive,L);key(s.t0+K.card,[L[0],L[1],L[2]*1.04],.004);key(s.t0+K.card+1,C);
  if(s===DE||s===JP){const R=view(WORLD,[900,170,1880,880],1);key(s.t0+STEP-.2,[C[0],C[1],C[2]*1.03]);key(s.t0+STEP+1.2,R);key(s.t0+s.len-.1,[R[0],R[1],R[2]*1.03]);}
  else if(s===NG){const R=view(WORLD,[40,140,1450,700],1);key(s.t0+STEP-.2,[C[0],C[1],C[2]*1.03]);key(s.t0+STEP+1.2,R);key(s.t0+s.len-.1,[R[0],R[1],R[2]*1.03]);}
  else key(s.t0+s.len-.1,[C[0],C[1],C[2]*1.05],-.004);}
{const F=view(WORLD,[40,430,1880,1040],1);key(FIN+2.2,F);key(FIN+FLEN,[F[0],F[1],F[2]*1.04]);}
// ---------- карта: контур, кольцо, заливка, волна финала ----------
window.mapSteps=(M,t,C)=>{for(const s of STEPS){const r=t-s.t0;if(r<K.hl)continue;
  const f=eoe(seg(r,K.fill,.6)),u=eio(seg(r,K.fill,.45));
  if(u>0){M.globalAlpha=u*.45;M.fillStyle=COL.tq;M.fill(s.p);M.globalAlpha=1;}
  if(f>0){M.save();if(f<.999){M.beginPath();M.arc(s.bc[0],s.bc[1],f*s.R,0,7);M.clip();}M.fillStyle=COL.tq;M.fill(s.p);M.restore();
    M.strokeStyle=COL.edge;M.lineWidth=1.3/C.z;M.stroke(s.p);}
  const w=t-(FIN+1.0+s.i*.1),wv=w>0&&w<.6?Math.sin(w/.6*Math.PI):0;
  const hl=Math.max(seg(r,K.hl,.3)*(1-seg(r,K.fill+.6,.8)),wv);
  if(hl>0){M.save();M.globalAlpha=hl*.12*(1-f)+wv*.25;M.fillStyle='#fff';M.fill(s.p);M.globalAlpha=hl;M.shadowColor='rgba(255,255,255,.9)';M.shadowBlur=18;
    M.strokeStyle='#fff';M.lineWidth=3/C.z;M.stroke(s.p);M.restore();}}};
// ---------- шкала, счётчик, отметки, слой интерфейса ----------
window.sumAt=t=>{let v=0,glow=0,pct=0;for(const s of STEPS){const r=t-s.t0;if(r<K.land)break;const e=eoe(seg(r,K.land,K.grow));v=lerp(s.prev,s.sum,e);pct=lerp(s.ppct,s.pct,e);glow=1-seg(r,K.land+.5,.8);}return{v,glow,pct};};
window.addedAt=t=>{let a={from:0,to:0,p:1};for(const s of STEPS){const r=t-s.t0;if(r<K.land)break;a={from:s.n-1,to:s.n,p:seg(r,K.land,.35)};}return a;};
window.markFlash=(t,m)=>{for(const n in MILE)if(MILE[n]===m){const r=t-crossT(STEPS[n-1],TPOP*m/100);if(r>0&&r<1.6)return Math.exp(-r*2.2)*(1+.25*Math.sin(r*18));}return 0;};
window.countPops=t=>{const out=[];for(const [n,v,label] of POPS){const r=t-crossT(STEPS[n-1],v);if(r>0&&r<2.6)out.push({v,label,s:cl(spring(r,2.2,.5),0,1.1),a:seg(r,0,.1)*(1-seg(r,2.0,.6))});}return out;};
window.uiAlpha=t=>1-seg(t,FIN+2.0,.9);
// «+0.8%» над колпачком перелёта; «GAP» над недостающей частью у Нигерии
window.barExtra=(c,t,B)=>{
  // «GAP» под шкалой: пунктир от головы заливки до цели
  const g=seg(t,NG.t0+STEP+3.0,.5)*(1-seg(t,PH.t0+K.land,.4));if(g>0){const gx=B.x0+B.L*1310.2/TPOP,yb=B.y+B.h+8;c.save();c.globalAlpha=g;c.strokeStyle=COL.ind;c.lineWidth=3;c.setLineDash([4,8]);
    c.beginPath();c.moveTo(gx+6,B.y+B.h-2);c.lineTo(gx+6,yb);c.lineTo(B.x1-6,yb);c.lineTo(B.x1-6,B.y+B.h-2);c.stroke();c.setLineDash([]);
    font(c,9,20);const s='GAP 105.9M',w=c.measureText(s).width,cx=(gx+B.x1)/2;rr(c,cx-w/2-12,yb+2,w+24,28,14,COL.ind);c.fillStyle=COL.bg;c.textAlign='center';c.fillText(s,cx,yb+23);c.restore();}
  // «+0.8%» над колпачком перелёта
  const o=seg(t,PH.t0+K.land+1.0,.4);if(o>0){c.save();c.globalAlpha=o;font(c,9,20);const w=c.measureText('+0.8%').width;rr(c,B.x1+16-w/2-10,B.y-62,w+20,28,14,COL.tq);c.fillStyle=COL.bg;c.textAlign='center';c.fillText('+0.8%',B.x1+16,B.y-41);c.restore();}};
// ---------- мини-карта: Китай-ориентир во время наездов ----------
const MW=300,MH=150,MX=40,MY=148,mini=document.createElement('canvas');mini.width=MW;mini.height=MH;
let miniBase;
function miniXf(c){c.setTransform(1,0,0,1,0,0);c.translate(MW/2,MH/2);const s=Math.min(MW/(WORLD[2]-WORLD[0]),MH/(WORLD[3]-WORLD[1]));c.scale(s,s);c.translate(-(WORLD[0]+WORLD[2])/2,-(WORLD[1]+WORLD[3])/2);return s;}
function buildMini(){miniBase=document.createElement('canvas');miniBase.width=MW;miniBase.height=MH;const c=miniBase.getContext('2d');miniXf(c);
  c.fillStyle='#34415F';for(const o of PATHS)if(o.id!==TGT)c.fill(o.p);c.fillStyle=COL.ind;c.fill(TP);}
window.miniMap=(c,t)=>{let a=seg(t,S_T0+.3,.6)*(1-seg(t,FIN,.6));for(const s of [DE,JP]){const r=t-s.t0;a*=1-seg(r,STEP,.4)*(1-seg(r,s.len-.4,.4));}
  if(a<=0||!miniBase)return;const m=mini.getContext('2d');m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,MW,MH);m.drawImage(miniBase,0,0);const s=miniXf(m);
  let cur=null;for(const st of STEPS){const r=t-st.t0;if(r<0)break;if(r>=K.fill){m.fillStyle=COL.tq;m.fill(st.p);}cur=st;}
  c.save();c.globalAlpha=a*.95;rr(c,MX-8,MY-8,MW+16,MH+16,22,'rgba(23,36,64,.92)');c.drawImage(mini,MX,MY);
  if(cur){const sc=Math.min(MW/(WORLD[2]-WORLD[0]),MH/(WORLD[3]-WORLD[1])),px=MX+MW/2+(cur.bc[0]-(WORLD[0]+WORLD[2])/2)*sc,py=MY+MH/2+(cur.bc[1]-(WORLD[1]+WORLD[3])/2)*sc,ph=((t-cur.t0)*1.4)%1;
    c.strokeStyle='#fff';c.lineWidth=2;c.globalAlpha=a*(1-ph);c.beginPath();c.arc(px,py,4+ph*14,0,7);c.stroke();c.globalAlpha=a;c.fillStyle='#fff';c.beginPath();c.arc(px,py,3,0,7);c.fill();}
  c.restore();};
// ---------- текст и карточка ----------
function fitSize(c,s,w,max,maxW,ls=0){font(c,w,100,ls);return Math.min(max,100*maxW/c.measureText(s).width);}
const CD={x:1478,y:168,w:402,h:488};
window.stepsUI=(c,t,C)=>{if(t>24&&t<S_T0+.2)note(c,t,t-22,{n:0,len:S_T0+.2-22},['LET’S START *SMALL.*','One country at a time.',4.0]);
  for(const s of STEPS){const r=t-s.t0;if(r<1.7||r>s.len+.6)continue;drawStep(c,t,r,s,C);
    if(NOTE[s.n])for(const ph of NOTE[s.n])note(c,t,r,s,ph);
    if(s===DE)compare(c,t,r,s,{title:'*21* countries vs China',line:'Past halfway — with plenty of bar left.',flags:21});
    if(s===JP)compare(c,t,r,s,{title:'Still ^519.1M^ short',line:'Even after Japan — more than half a billion.',flags:22,gap:true});
    if(s===NG)stillShort(c,t,r);
    if(s.fl==='my')myLink(c,t,r,C);
    if(RING[s.fl])ring(c,t,r,s,C);}
  finale(c,t);};
// выход карточки: в конце шага; у сравнений — когда начинается панель
const cardOut=s=>(s===DE||s===JP)?STEP:s.len;
function drawStep(c,t,r,s,C){
  const dim=seg(r,1.8,.4)*(1-seg(r,K.card,.6));if(dim>0){const g=c.createLinearGradient(760,0,1500,0);g.addColorStop(0,'rgba(8,12,26,0)');g.addColorStop(1,`rgba(8,12,26,${.75*dim})`);c.fillStyle=g;c.fillRect(760,140,W-760,750);}
  const idx='#'+String(s.n).padStart(2,'0'),num=fmt(s.pop),nameH=fitSize(c,s.name,9,170,860),nameC=fitSize(c,s.name,9,58,330);
  font(c,9,100,-2);const NS=Math.min(210,100*560/c.measureText(num+'M').width);
  const ex=eie(seg(r,cardOut(s),.45));if(ex>=1)return chip(c,r,s,C,num);c.save();if(ex>0){c.translate(ex*560,0);c.globalAlpha=1-ex;c.filter=`blur(${(ex*10).toFixed(1)}px)`;}
  const arc=p=>-Math.sin(Math.PI*p)*34;
  if(r>=K.card+.08){const q=spring(r-K.card-.08,1.8,.62),sc=lerp(.94,1,cl(q,0,1.05));c.save();c.globalAlpha*=cl(q*1.6);
    c.translate(CD.x+CD.w/2,CD.y+CD.h/2);c.scale(sc,sc);c.translate(-CD.x-CD.w/2,-CD.y-CD.h/2);
    rr(c,CD.x+8,CD.y+14,CD.w,CD.h,44,'rgba(0,0,0,.25)');rr(c,CD.x,CD.y,CD.w,CD.h,44,COL.ui);c.strokeStyle='rgba(39,214,203,.35)';c.lineWidth=3;c.stroke();c.restore();
    const f=spring(r-K.card-.25,2,.55);if(r>K.card+.25){c.save();c.globalAlpha*=cl(f*2);const fy=CD.y+36+(1-cl(f,0,1.1))*-50;
      c.beginPath();c.roundRect(CD.x+36,fy,330,247.5,26);c.clip();c.drawImage(FLAGS[s.fl],CD.x+36,fy,330,247.5);c.restore();}
    c.save();c.globalAlpha*=seg(r,K.card+.5,.3);font(c,7,22);c.textAlign='right';c.fillStyle=COL.mut;c.fillText('2025',CD.x+CD.w-36,CD.y+460);c.restore();}
  {const p=eio(seg(r,K.card,.6));if(r>=K.idx){const al=seg(r,K.idx,.3),ls=lerp(60,6,eoe(seg(r,K.idx,.5)));
    if(p>.55){const q=seg(p,.55,.3);c.save();c.globalAlpha*=q;rr(c,CD.x+36,CD.y+300,104,52,26,COL.tq);c.restore();}
    const size=lerp(64,30,p),w=p>.5?9:2;font(c,w,size,lerp(ls,0,p));const bw=c.measureText(idx).width;
    const x=lerp(1000,CD.x+88-bw/2,p),y=lerp(330,CD.y+337,p)+arc(p);c.save();c.globalAlpha*=al;c.fillStyle=p>.55?COL.bg:COL.mut;c.textAlign='left';c.fillText(idx,x,y);c.restore();}}
  {const p=eio(seg(r,K.card+.05,.6));
    if(p<=0)word(c,t,{s:s.name,w:9,size:nameH,x:1000,y:500,in:s.t0+K.name,a:s.i%2?'flip':'mask'});
    else{font(c,9,lerp(nameH,nameC,p));c.textAlign='left';c.fillStyle=COL.txt;c.fillText(s.name,lerp(1000,CD.x+36,p),lerp(500,CD.y+404,p)+arc(p));}}
  {const p=eio(seg(r,K.card+.1,.6));
    if(r>=K.num){let nw;
      if(p<=0){c.save();c.globalAlpha*=seg(r,K.num,.15);nw=odo(c,t,num,1000,730,NS,COL.tq,s.t0+K.num,s.t0+K.unit);c.restore();}
      else{font(c,9,lerp(NS,50,p),-lerp(NS,50,p)*.02);c.textAlign='left';c.fillStyle=COL.tq;nw=c.measureText(num).width;c.fillText(num,lerp(1000,CD.x+36,p),lerp(730,CD.y+460,p)+arc(p));}
      const sz=lerp(NS,50,p),x=lerp(1000,CD.x+36,p)+nw,y=lerp(730,CD.y+460,p)+arc(p);
      if(r>=K.unit){const u=eoe(seg(r,K.unit,.35));c.save();c.beginPath();c.rect(x-10,y-sz*.9,sz,sz*1.05);c.clip();font(c,9,sz);c.fillStyle=COL.tq;c.fillText('M',x,y+(1-u)*sz);c.restore();
        font(c,9,sz);const mw=c.measureText('M ').width;c.save();c.globalAlpha*=seg(r,K.unit+.2,.3)*(1-seg(p,0,.4));font(c,2,64,lerp(40,4,eoe(seg(r,K.unit+.2,.5))));c.fillStyle=COL.txt;c.fillText('PEOPLE',x+mw,y);c.restore();}}}
  c.restore();chip(c,r,s,C,num);}
// чип «+5.3M» летит из страны в голову шкалы
function chip(c,r,s,C,num){if(r<K.chip||r>=K.land+.15)return;const p=eio(seg(r,K.chip,K.land-K.chip)),[sx,sy]=toScreen(C,s.bc[0],s.bc[1]),ex2=BX0+BL*Math.min(s.prev,TPOP)/TPOP,ey=BY+BH/2;
  const x=lerp(sx,ex2,p),y=lerp(sy,ey,p)-Math.sin(Math.PI*p)*170,sc=lerp(1,.7,p),txt='+'+num+'M';
  c.save();c.globalAlpha=1-seg(r,K.land,.15);c.translate(x,y);c.scale(sc,sc);font(c,9,34);const w=c.measureText(txt).width;
  c.shadowColor='rgba(39,214,203,.6)';c.shadowBlur=24;rr(c,-w/2-20,-28,w+40,56,28,COL.tq);c.shadowBlur=0;c.fillStyle=COL.bg;c.textAlign='center';c.fillText(txt,0,12);c.restore();}
// кольцо-локатор вокруг маленькой страны
function ring(c,t,r,s,C){const a=seg(r,K.hl,.3)*(1-seg(r,K.fill+1.2,.6));if(a<=0)return;const [x,y]=toScreen(C,s.bc[0],s.bc[1]),rad=Math.max(60,(s.box[2]-s.box[0])*C.z*.7),ph=(r*1.2)%1;
  c.save();c.strokeStyle='#fff';c.lineWidth=3;c.globalAlpha=a*.9;c.beginPath();c.arc(x,y,rad,0,7);c.stroke();c.globalAlpha=a*(1-ph)*.6;c.beginPath();c.arc(x,y,rad*(1+ph*.4),0,7);c.stroke();c.restore();}
// Малайзия: пунктирная связка двух частей (не суша)
function myLink(c,t,r,C){const a=seg(r,K.hl+.3,.4)*(1-seg(r,STEP-.6,.5));if(a<=0)return;const A=VIEWS.myA,B=VIEWS.myB,[x0,y0]=toScreen(C,(A[0]+A[2])/2,(A[1]+A[3])/2),[x1,y1]=toScreen(C,(B[0]+B[2])/2,(B[1]+B[3])/2),p=eio(seg(r,K.hl+.3,.6));
  c.save();c.globalAlpha=a;c.strokeStyle='#fff';c.lineWidth=3;c.lineCap='round';c.setLineDash([2,12]);c.beginPath();c.moveTo(x0,y0);c.lineTo(lerp(x0,x1,p),lerp(y0,y1,p));c.stroke();
  c.setLineDash([]);c.fillStyle='#fff';for(const [x,y] of [[x0,y0],[x1,y1]]){c.beginPath();c.arc(x,y,5,0,7);c.fill();}c.restore();}
// ---------- комментарий: крупная строка + тонкая ----------
function note(c,t,r,s,ph){const [l1,l2,tin0,tout]=ph,t1=tin0??(K.note+(MILE[s.n]?.1:0)),end=(tout??s.len)-.45;if(r<t1||r>end+.5)return;const big=MILE[s.n]?104:84;
  const a=seg(r,t1,.4)*(1-seg(r,end,.4));const g=c.createLinearGradient(0,0,1350,0);g.addColorStop(0,`rgba(8,12,26,${.8*a})`);g.addColorStop(1,'rgba(8,12,26,0)');c.fillStyle=g;c.fillRect(0,700,1350,190);
  for(const [txt,w,size,y,tin] of [[l1,9,big,804,t1],[l2,2,46,862,t1+.35]]){if(r<tin)continue;const pin=eoe(seg(r,tin,.45)),pout=eie(seg(r,end,.4));
    c.save();c.beginPath();c.rect(60,y-size*1.05,1400,size*1.3);c.clip();font(c,w,size,w===2?lerp(30,2,pin):0);
    c.translate(0,(1-pin)*size*1.1-pout*size*1.1);rich(c,txt,110,y,COL.txt);c.restore();}}
// ---------- сравнение команды и Китая на одной шкале (Германия, Япония) ----------
function compare(c,t,r,s,o){const a=r-STEP;if(a<0||a>s.len-STEP+.5)return;const pin=eoe(seg(a,.3,.6)),pout=eie(seg(a,s.len-STEP-.5,.45)),dx=-(1-pin)*900-pout*900,BW=740,x0=92;
  c.save();c.translate(dx,0);c.globalAlpha=.96;rr(c,52,150,820,560,44,COL.ui);c.globalAlpha=1;
  font(c,9,60);rich(c,o.title,x0,232,COL.txt);font(c,7,26);c.fillStyle=COL.mut;c.fillText('Both bars on the same scale',x0,282);
  const cb=eio(seg(a,.8,.8)),tb=eio(seg(a,1.8,.9)),tw=BW*s.pct/100*tb;
  rr(c,x0,320,Math.max(40,BW*cb),44,22,COL.ind);c.save();c.globalAlpha=seg(a,1.2,.3);font(c,9,24);c.fillStyle=COL.bg;c.fillText('CHINA · 1,416.1M',x0+20,350);c.restore();
  if(tb>0){rr(c,x0,392,Math.max(44,tw),44,22,COL.tq);c.save();c.globalAlpha=seg(a,2.4,.3);font(c,9,24);c.fillStyle=COL.bg;c.fillText('TEAM · '+fmt(s.sum)+'M',x0+20,422);c.restore();}
  if(o.gap){const g=seg(a,3.0,.5);if(g>0){c.save();c.globalAlpha=g;c.strokeStyle=COL.ind;c.lineWidth=3;c.setLineDash([4,8]);const gx=x0+BW*s.pct/100;
    c.beginPath();c.moveTo(gx+8,392);c.lineTo(gx+8,452);c.lineTo(x0+BW,452);c.lineTo(x0+BW,392);c.stroke();c.setLineDash([]);font(c,9,26);c.fillStyle=COL.ind;c.textAlign='center';c.fillText('GAP 519.1M',(gx+x0+BW)/2,488);c.restore();}}
  else{const g=seg(a,3.0,.4);if(g>0){c.save();c.globalAlpha=g;const mx=x0+BW*.5;c.strokeStyle='#fff';c.lineWidth=3;c.setLineDash([4,6]);c.beginPath();c.moveTo(mx,306);c.lineTo(mx,452);c.stroke();c.setLineDash([]);
    font(c,9,22);c.fillStyle='#fff';c.textAlign='center';c.fillText('50%',mx,476);c.restore();}}
  for(let k=0;k<o.flags;k++){const tk=3.4+k*.06;if(a<tk)continue;const q=spring(a-tk,2.6,.5),fx=x0+k*35,fy=530;c.save();c.translate(fx+16,fy+12);c.scale(cl(q,0,1.2),cl(q,0,1.2));
    c.beginPath();c.roundRect(-16,-12,32,24,5);c.clip();c.drawImage(FLAGS[STEPS[k].fl],-16,-12,32,24);c.restore();}
  if(a>=5.0){const p=eoe(seg(a,5.0,.45));c.save();c.beginPath();c.rect(80,590,780,80);c.clip();c.translate(0,(1-p)*50);font(c,7,30);rich(c,o.line,x0,640,COL.txt);c.restore();}
  c.restore();}
// ---------- Нигерия: 92.5% и «STILL SHORT» ----------
function stillShort(c,t,r){const a=r-STEP;if(a<0||a>NG.len-STEP+.5)return;const out=1-seg(a,NG.len-STEP-.45,.4);c.save();c.globalAlpha=out;
  const pin=eoe(seg(a,.9,.5));c.save();c.globalAlpha*=pin;rr(c,52,716+(1-pin)*40,1360,160,44,'rgba(23,36,64,.95)');c.restore();
  if(a>=1.3){const q=spring(a-1.3,2,.5);c.save();c.translate(84,846);c.scale(lerp(1.5,1,cl(q)),lerp(1.5,1,cl(q)));c.globalAlpha*=cl(q*3);font(c,9,140,-3);c.fillStyle=COL.tq;c.fillText('92.5',0,0);
    const w=c.measureText('92.5').width;font(c,9,90);c.fillText('%',w,0);c.restore();}
  if(a>=1.0){c.save();c.globalAlpha*=seg(a,1.0,.3);rr(c,520,748,6,96,3,'#3A4A6E');c.restore();
    for(const [txt,w,size,y,tin] of [['STILL SHORT.',9,48,790,1.0],['Gap: ^105.9M^ · one country left',7,34,842,1.9]]){if(a<tin)continue;const p=eoe(seg(a,tin,.45));
      c.save();c.beginPath();c.rect(540,y-size,880,size*1.3);c.clip();c.translate(0,(1-p)*size);font(c,w,size);rich(c,txt,560,y,COL.txt);c.restore();}}
  c.restore();}
// ---------- финал: 25 стран против Китая, место под конечную заставку ----------
function finale(c,t){const a=t-FIN;if(a<0)return;
  const dim=seg(a,2.6,.6)*.35;if(dim>0){c.fillStyle=`rgba(8,12,26,${dim})`;c.fillRect(0,0,W,H);}
  if(a>=2.6){const pin=eoe(seg(a,2.6,.6)),BW=1080,x0=420;c.save();c.globalAlpha=pin;c.translate(0,(1-pin)*-40);
    rr(c,300,40,1320,400,48,'rgba(23,36,64,.96)');
    const tt=eio(seg(a,3.2,.9)),tc=eio(seg(a,4.4,.9));
    font(c,7,26,2);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('25 SELECTED COUNTRIES',x0,118);rr(c,x0,134,Math.max(52,BW*tt),52,26,COL.tq);
    c.fillStyle=COL.mut;c.fillText('CHINA',x0,240);rr(c,x0,256,Math.max(52,BW*1416.1/1427.0*tc),52,26,COL.ind);
    c.save();c.globalAlpha*=seg(a,5.4,.4);font(c,9,40);c.textAlign='right';c.fillStyle=COL.tq;c.fillText('1,427.0M',x0+BW,118);c.fillStyle=COL.ind;c.fillText('1,416.1M',x0+BW,240);c.restore();
    if(a>=6.4){const q=spring(a-6.4,2,.55);c.save();c.translate(960,382);c.scale(lerp(1.4,1,cl(q)),lerp(1.4,1,cl(q)));c.globalAlpha*=cl(q*3);font(c,9,46);c.textAlign='center';rich(c,'DIFFERENCE: *+10.9M*',0,0,COL.txt,'center');c.restore();}
    c.save();c.globalAlpha*=seg(a,7.4,.5);font(c,7,20);c.textAlign='center';c.fillStyle=COL.mut;c.fillText('Calculated from unrounded values. Numbers rounded for display.',960,424);c.restore();
    c.restore();}}
