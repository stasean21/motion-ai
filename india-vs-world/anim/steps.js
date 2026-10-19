// Шаг страны, базово 10 с (5 тактов при 120 BPM). Герой — текст:
// перелёт камеры → белый контур → крупные «#01 / NAME / 3.4M PEOPLE» → текст складывается в карточку справа →
// страна заливается бирюзовым → чип «+3.4M» летит в шкалу → шкала растёт, «Added» перещёлкивается.
// Особые моменты: комментарии, вспышки 25/50/75%, сравнение на Чили, 99.6% на США, лупа на Сингапуре, финал.
const S_T0=14,STEP=10,IPOP=1463.9;
// id ISO, флаг, название, млн, сумма (оценки 2025, UN WPP 2024; суммы по исходным значениям)
const DATA=[['858','uy','Uruguay',3.4,3.4],['578','no','Norway',5.6,9.0],['246','fi','Finland',5.6,14.6],['208','dk','Denmark',6.0,20.6],
  ['600','py','Paraguay',7.0,27.6],['752','se','Sweden',10.7,38.3],['068','bo','Bolivia',12.6,50.9],['218','ec','Ecuador',18.3,69.2],
  ['528','nl','Netherlands',18.3,87.5],['152','cl','Chile',19.9,107.4],['036','au','Australia',27.0,134.4],['604','pe','Peru',34.6,168.9],
  ['124','ca','Canada',40.1,209.1],['032','ar','Argentina',45.9,254.9],['724','es','Spain',47.9,302.8],['410','kr','South Korea',51.7,354.5],
  ['170','co','Colombia',53.4,407.9],['380','it','Italy',59.1,467.0],['250','fr','France',66.7,533.7],['826','gb','United Kingdom',69.6,603.2],
  ['276','de','Germany',84.1,687.3],['792','tr','Türkiye',87.7,775.0],['392','jp','Japan',123.1,898.1],['076','br','Brazil',212.8,1110.9],
  ['840','us','United States',347.3,1458.2],['702','sg','Singapore',5.9,1464.1]];
// дополнительное время после шага (с) — под особые моменты
const EXTRA={10:8,17:3,22:3,24:3,25:10,26:6};
// комментарии в паузе шага: *ключевое* слово цветом (бирюзовый; ^ — оранжевый)
const NOTE={5:['*FIVE* COUNTRIES.','And the bar has barely moved.'],13:['HUGE TERRITORY.','But the bar counts *people*, not land.'],
  15:['*FIFTEEN* COUNTRIES.','About a fifth of the way.'],17:['*25%* — A QUARTER.','Seventeen countries to get here.'],
  20:['*20* COUNTRIES.','Still not even half.'],22:['*HALFWAY.* AT LAST.','Twenty-two countries in.'],
  23:['STILL ^565.8M^ TO GO.','Even after Japan.'],24:['*1 BILLION.*','Three quarters done — 24 countries.'],
  26:['GOAL *REACHED.*','Over by about 200,000 people.']};
const MILE={17:25,22:50,24:75,26:100};
let _t=S_T0;
const STEPS=DATA.map((d,i)=>{const box=VIEWS[d[1]],len=STEP+(EXTRA[i+1]||0),s={i,id:d[0],fl:d[1],name:d[2].toUpperCase(),pop:d[3],sum:d[4],prev:i?DATA[i-1][4]:0,n:i+1,t0:_t,len,
  box,vbox:d[1]==='sg'?VIEWS.seAsia:box,bc:[(box[0]+box[2])/2,(box[1]+box[3])/2],p:PATHS.find(o=>o.id===d[0]).p};_t+=len;return s;});
const FIN=_t,FLEN=25;DURATION=FIN+FLEN;
const SG=STEPS[25],US=STEPS[24],CL=STEPS[9];
// ключевые моменты внутри шага (с от начала шага)
const K={arrive:1.7,hl:1.9,idx:2.0,name:2.25,num:2.75,unit:3.75,card:5.0,fill:5.5,chip:6.0,land:6.6,grow:.8,note:7.3};
const FLAGS={};for(const s of STEPS){const im=new Image();im.src=`../flags/${s.fl}.svg`;FLAGS[s.fl]=im;}
window.ready=window.ready.then(()=>Promise.all(Object.values(FLAGS).map(im=>im.complete?0:new Promise(r=>im.onload=im.onerror=r))));
// ---------- камера ----------
function view(box,reg,k,zmax=6){const z=Math.min(zmax,Math.min((reg[2]-reg[0])/(box[2]-box[0]),(reg[3]-reg[1])/(box[3]-box[1]))*k);
  return[(box[0]+box[2])/2-((reg[0]+reg[2])/2-W/2)/z,(box[1]+box[3])/2-((reg[1]+reg[3])/2-H/2)/z,z];}
const REG_L=[100,200,900,860],REG_C=[90,180,1430,860],WORLD=[0,140,4000,1880];
const key=(t,v,rot=0)=>CAM.push([t,v[0],v[1],v[2],rot,0]);
for(const s of STEPS){const pv=CAM[CAM.length-1],L=view(s.vbox,REG_L,.82),C=view(s.vbox,REG_C,.78);
  if(s.i)CAM.push([s.t0+.12,pv[1],pv[2],pv[3],pv[4],0]);
  // в середине перелёта обе точки помещаются в ~1400 px — дальний прыжок идёт через отъезд
  const dist=Math.hypot(L[0]-pv[1],L[1]-pv[2]),zm=Math.max(.36,Math.min(pv[3],L[2],1400/Math.max(dist,1)));
  CAM.push([s.t0+.95,lerp(pv[1],L[0],.5),lerp(pv[2],L[1],.5),zm,s.i%2?.012:-.012,0]);
  key(s.t0+K.arrive,L);key(s.t0+K.card,[L[0],L[1],L[2]*1.04],.004);key(s.t0+K.card+1,C);
  if(s===CL){key(s.t0+STEP-.2,[C[0],C[1],C[2]*1.03]);key(s.t0+STEP+1,view(VIEWS.southAm,[900,160,1440,880],.92));key(s.t0+s.len-.1,view(VIEWS.southAm,[900,160,1440,880],.97),.004);}
  else if(s===US){key(s.t0+STEP-.2,[C[0],C[1],C[2]*1.03]);key(s.t0+STEP+1.2,view(WORLD,[40,140,1450,700],1));key(s.t0+s.len-.1,view(WORLD,[40,140,1450,700],1.03));}
  else key(s.t0+s.len-.1,[C[0],C[1],C[2]*1.05],-.004);}
key(FIN+2.2,view(WORLD,[40,150,1880,860],1));key(FIN+FLEN,view(WORLD,[40,150,1880,860],1.08));
// ---------- карта: контур, бирюзовая заливка, волна финала ----------
window.mapSteps=(M,t,C)=>{for(const s of STEPS){const r=t-s.t0;if(r<K.hl)continue;
  const f=eoe(seg(r,K.fill,.6)),u=eio(seg(r,K.fill,.45)),R=Math.max(s.box[2]-s.box[0],s.box[3]-s.box[1])*.9;
  if(u>0){M.globalAlpha=u*.45;M.fillStyle=COL.tq;M.fill(s.p);M.globalAlpha=1;}
  if(f>0){M.save();M.beginPath();M.arc(s.bc[0],s.bc[1],f*R,0,7);M.clip();M.fillStyle=COL.tq;M.fill(s.p);M.restore();
    M.strokeStyle=COL.edge;M.lineWidth=1.3/C.z;M.stroke(s.p);}
  // волна в финале: страны вспыхивают по порядку добавления
  const w=t-(FIN+1.0+s.i*.1),wv=w>0&&w<.6?Math.sin(w/.6*Math.PI):0;
  const hl=Math.max(seg(r,K.hl,.3)*(1-seg(r,K.fill+.6,.8)),wv);
  if(hl>0){M.save();M.globalAlpha=hl*.12*(1-f)+wv*.25;M.fillStyle='#fff';M.fill(s.p);M.globalAlpha=hl;M.shadowColor='rgba(255,255,255,.9)';M.shadowBlur=18;
    M.strokeStyle='#fff';M.lineWidth=3/C.z;M.stroke(s.p);M.restore();}}};
// ---------- шкала, счётчик, вспышки отметок, слой интерфейса ----------
window.sumAt=t=>{let v=0,glow=0;for(const s of STEPS){const r=t-s.t0;if(r<K.land)break;v=lerp(s.prev,s.sum,eoe(seg(r,K.land,K.grow)));glow=1-seg(r,K.land+.5,.8);}return{v,glow};};
window.addedAt=t=>{let a={from:0,to:0,p:1};for(const s of STEPS){const r=t-s.t0;if(r<K.land)break;a={from:s.n-1,to:s.n,p:seg(r,K.land,.35)};}return a;};
window.markFlash=(t,m)=>{for(const n in MILE)if(MILE[n]===m){const r=t-STEPS[n-1].t0-K.land-.35;if(r>0&&r<1.6)return Math.exp(-r*2.2)*(1+.25*Math.sin(r*18));}return 0;};
window.uiAlpha=t=>1-seg(t,FIN+10.6,.9);
// ---------- текст: одометр, подбор размера, строка с ключевым словом ----------
function odo(c,t,str,x,y,size,col,start,end){const nd=str.replace(/\D/g,'').length;font(c,9,size,-size*.02);c.textAlign='left';c.fillStyle=col;
  const dw=c.measureText('0').width;let px=x,k=0;
  for(const ch of str){if(!/\d/.test(ch)){c.fillText(ch,px,y);px+=c.measureText(ch).width;continue;}
    const lt=end-(nd-1-k)*.18,spins=2+k++,p=cl((t-start)/(lt-start)),pos=+ch+spins*10*(1-eoc(p));
    const fr=pos-Math.floor(pos),f=fr<.55?0:eio((fr-.55)/.45),d0=Math.floor(pos)%10,kick=t>lt?Math.exp(-(t-lt)*9)*Math.sin((t-lt)*40)*.06:0;
    c.save();c.beginPath();c.rect(px-6,y-size*.8,dw+12,size*.88);c.clip();c.fillText(String(d0),px,y-f*size*.98+kick*size);
    if(f>.001)c.fillText(String((d0+1)%10),px,y+(1-f)*size*.98+kick*size);c.restore();px+=dw;}
  return px-x;}
function fitSize(c,s,w,max,maxW,ls=0){font(c,w,100,ls);return Math.min(max,100*maxW/c.measureText(s).width);}
// «*ключ*» — бирюзовый, «^ключ^» — оранжевый; остальное цветом col
function rich(c,str,x,y,col){const parts=str.split(/([*^][^*^]+[*^])/).filter(Boolean);let px=x;c.textAlign='left';
  for(const p of parts){const k=p[0]==='*'?COL.tq:p[0]==='^'?COL.ind:null,txt=k?p.slice(1,-1):p;c.fillStyle=k||col;c.fillText(txt,px,y);px+=c.measureText(txt).width;}return px-x;}
const CD={x:1478,y:168,w:402,h:488};
window.stepsUI=(c,t,C)=>{for(const s of STEPS){const r=t-s.t0;if(r<1.7||r>s.len+.6)continue;drawStep(c,t,r,s,C);
    if(NOTE[s.n])note(c,t,r,s);if(s===CL)chileCompare(c,r);if(s===US)usaGap(c,r);if(s===SG)sgLens(c,t,r,C);}
  finale(c,t);};
function drawStep(c,t,r,s,C){
  // затемнение справа под крупным текстом
  const dim=seg(r,1.8,.4)*(1-seg(r,K.card,.6));if(dim>0){const g=c.createLinearGradient(760,0,1500,0);g.addColorStop(0,'rgba(8,12,34,0)');g.addColorStop(1,`rgba(8,12,34,${.75*dim})`);c.fillStyle=g;c.fillRect(760,140,W-760,760);}
  const idx='#'+String(s.n).padStart(2,'0'),num=fmt(s.pop),nameH=fitSize(c,s.name,9,170,860),nameC=fitSize(c,s.name,9,58,330);
  // размер числа: «347.3M PEOPLE» помещается в 860 px
  font(c,9,100,-2);const NS=Math.min(210,100*560/c.measureText(num+'M').width);
  // выход карточки в конце шага
  const ex=eie(seg(r,s.len,.45));c.save();if(ex>0){c.translate(ex*560,0);c.globalAlpha=1-ex;c.filter=`blur(${(ex*10).toFixed(1)}px)`;}
  const arc=p=>-Math.sin(Math.PI*p)*34;
  // карточка: подложка, флаг, год
  if(r>=K.card+.08){const q=spring(r-K.card-.08,1.8,.62),sc=lerp(.94,1,cl(q,0,1.05));c.save();c.globalAlpha*=cl(q*1.6);
    c.translate(CD.x+CD.w/2,CD.y+CD.h/2);c.scale(sc,sc);c.translate(-CD.x-CD.w/2,-CD.y-CD.h/2);
    rr(c,CD.x+8,CD.y+14,CD.w,CD.h,44,'rgba(0,0,0,.25)');rr(c,CD.x,CD.y,CD.w,CD.h,44,COL.ui);c.strokeStyle='rgba(46,230,200,.35)';c.lineWidth=3;c.stroke();c.restore();
    const f=spring(r-K.card-.25,2,.55);if(r>K.card+.25){c.save();c.globalAlpha*=cl(f*2);const fy=CD.y+36+(1-cl(f,0,1.1))*-50;
      c.beginPath();c.roundRect(CD.x+36,fy,330,247.5,26);c.clip();c.drawImage(FLAGS[s.fl],CD.x+36,fy,330,247.5);c.restore();}
    c.save();c.globalAlpha*=seg(r,K.card+.5,.3);font(c,7,22);c.textAlign='right';c.fillStyle=COL.mut;c.fillText('2025',CD.x+CD.w-36,CD.y+460);c.restore();}
  // «#01»: тонкий крупный → бирюзовый бейдж
  {const p=eio(seg(r,K.card,.6));if(r>=K.idx){const al=seg(r,K.idx,.3),ls=lerp(60,6,eoe(seg(r,K.idx,.5)));
    if(p>.55){const q=seg(p,.55,.3);c.save();c.globalAlpha*=q;rr(c,CD.x+36,CD.y+300,104,52,26,COL.tq);c.restore();}
    const size=lerp(64,30,p),w=p>.5?9:2;font(c,w,size,lerp(ls,0,p));const bw=c.measureText(idx).width;
    const x=lerp(1000,CD.x+88-bw/2,p),y=lerp(330,CD.y+337,p)+arc(p);c.save();c.globalAlpha*=al;c.fillStyle=p>.55?COL.bg:COL.mut;c.textAlign='left';c.fillText(idx,x,y);c.restore();}}
  // название: маска снизу (у чётных шагов — переворот ракурса) → строка карточки
  {const p=eio(seg(r,K.card+.05,.6));
    if(p<=0)word(c,t,{s:s.name,w:9,size:nameH,x:1000,y:500,in:s.t0+K.name,a:s.i%2?'flip':'mask'});
    else{font(c,9,lerp(nameH,nameC,p));c.textAlign='left';c.fillStyle=COL.txt;c.fillText(s.name,lerp(1000,CD.x+36,p),lerp(500,CD.y+404,p)+arc(p));}}
  // население: одометр → строка карточки; «PEOPLE» тонким
  {const p=eio(seg(r,K.card+.1,.6));
    if(r>=K.num){let nw;
      if(p<=0){c.save();c.globalAlpha*=seg(r,K.num,.15);nw=odo(c,t,num,1000,730,NS,COL.tq,s.t0+K.num,s.t0+K.unit);c.restore();}
      else{font(c,9,lerp(NS,50,p),-lerp(NS,50,p)*.02);c.textAlign='left';c.fillStyle=COL.tq;nw=c.measureText(num).width;c.fillText(num,lerp(1000,CD.x+36,p),lerp(730,CD.y+460,p)+arc(p));}
      const sz=lerp(NS,50,p),x=lerp(1000,CD.x+36,p)+nw,y=lerp(730,CD.y+460,p)+arc(p);
      if(r>=K.unit){const u=eoe(seg(r,K.unit,.35));c.save();c.beginPath();c.rect(x-10,y-sz*.9,sz,sz*1.05);c.clip();font(c,9,sz);c.fillStyle=COL.tq;c.fillText('M',x,y+(1-u)*sz);c.restore();
        font(c,9,sz);const mw=c.measureText('M ').width;c.save();c.globalAlpha*=seg(r,K.unit+.2,.3)*(1-seg(p,0,.4));font(c,2,64,lerp(40,4,eoe(seg(r,K.unit+.2,.5))));c.fillStyle=COL.txt;c.fillText('PEOPLE',x+mw,y);c.restore();}}}
  c.restore();
  // чип «+3.4M» летит из страны в голову шкалы
  if(r>=K.chip&&r<K.land+.15){const p=eio(seg(r,K.chip,K.land-K.chip)),[sx,sy]=toScreen(C,s.bc[0],s.bc[1]),ex2=96+1644*s.prev/IPOP,ey=1000;
    const x=lerp(sx,ex2,p),y=lerp(sy,ey,p)-Math.sin(Math.PI*p)*170,sc=lerp(1,.7,p),txt='+'+num+'M';
    c.save();c.globalAlpha=1-seg(r,K.land,.15);c.translate(x,y);c.scale(sc,sc);font(c,9,34);const w=c.measureText(txt).width;
    c.shadowColor='rgba(46,230,200,.6)';c.shadowBlur=24;rr(c,-w/2-20,-28,w+40,56,28,COL.tq);c.shadowBlur=0;c.fillStyle=COL.bg;c.textAlign='center';c.fillText(txt,0,12);c.restore();}}
// ---------- комментарий в паузе шага: крупная строка + тонкая ----------
function note(c,t,r,s){const [l1,l2]=NOTE[s.n],t1=K.note+(MILE[s.n]?.1:0),end=s.len-.45;if(r<t1||r>end+.5)return;const big=MILE[s.n]?104:84;
  const a=seg(r,t1,.4)*(1-seg(r,end,.4));const g=c.createLinearGradient(0,0,1350,0);g.addColorStop(0,`rgba(8,12,34,${.8*a})`);g.addColorStop(1,'rgba(8,12,34,0)');c.fillStyle=g;c.fillRect(0,700,1350,190);
  const lines=[[l1,9,big,804,t1,0],[l2,2,46,862,t1+.35,0]];
  for(const [txt,w,size,y,tin] of lines){if(r<tin)continue;const pin=eoe(seg(r,tin,.45)),pout=eie(seg(r,end,.4));
    c.save();c.beginPath();c.rect(60,y-size*1.05,1400,size*1.3);c.clip();font(c,w,size,w===2?lerp(30,2,pin):0);
    c.translate(0,(1-pin)*size*1.1-pout*size*1.1);rich(c,txt,110,y,COL.txt);c.restore();}}
// ---------- Чили: 10 стран против Индии на одной шкале ----------
function chileCompare(c,r){const a=r-STEP;if(a<0||a>CL.len-STEP+.5)return;const pin=eoe(seg(a,.2,.6)),pout=eie(seg(a,CL.len-STEP-.5,.45)),dx=-(1-pin)*900-pout*900,BW=740;
  c.save();c.translate(dx,0);c.globalAlpha=.95;rr(c,52,168,820,476,44,COL.ui);c.globalAlpha=1;
  font(c,9,64);rich(c,'*10* countries in',92,252,COL.txt);font(c,7,28);c.fillStyle=COL.mut;c.fillText('Both bars on the same scale',92,322);
  const ib=eio(seg(a,.7,.8)),tb=eio(seg(a,1.7,.5));rr(c,92,366,Math.max(40,BW*ib),40,20,COL.ind);c.save();c.globalAlpha=seg(a,1.2,.3);font(c,9,24);c.fillStyle=COL.bg;c.fillText('INDIA · 1,463.9M',112,395);c.restore();
  if(tb>0){rr(c,92,446,Math.max(8,BW*107.4/IPOP*tb),40,20,COL.tq);c.save();c.globalAlpha=seg(a,2.1,.3);font(c,9,24);c.fillStyle=COL.tq;c.fillText('10 COUNTRIES · 107.4M',92+BW*107.4/IPOP+18,475);c.restore();}
  for(let k=0;k<10;k++){const tk=2.5+k*.1;if(a<tk)continue;const q=spring(a-tk,2.4,.5),fx=92+k*72,fy=522;c.save();c.translate(fx+29,fy+22);c.scale(cl(q,0,1.2),cl(q,0,1.2));
    c.beginPath();c.roundRect(-29,-22,58,43.5,9);c.clip();c.drawImage(FLAGS[STEPS[k].fl],-29,-22,58,43.5);c.restore();}
  if(a>=3.8){const p=eoe(seg(a,3.8,.45));c.save();c.beginPath();c.rect(80,560,780,80);c.clip();c.translate(0,(1-p)*50);font(c,7,30);c.fillStyle=COL.txt;
    const w=c.measureText('…and that’s just over ').width;c.fillText('…and that’s just over ',92,612);font(c,9,30);c.fillStyle=COL.tq;c.fillText('7%',92+w,612);c.restore();}
  c.restore();}
// ---------- США: 99.6% и лупа на зазоре у цели ----------
function usaGap(c,r){const a=r-STEP;if(a<0||a>US.len-STEP+.5)return;const out=1-seg(a,US.len-STEP-.45,.4);c.save();c.globalAlpha=out;
  const pin=eoe(seg(a,.9,.5));c.save();c.globalAlpha*=pin;rr(c,52,716+(1-pin)*40,1360,160,44,'rgba(21,31,74,.94)');c.restore();
  if(a>=1.3){const q=spring(a-1.3,2,.5);c.save();c.translate(84,846);c.scale(lerp(1.5,1,cl(q)),lerp(1.5,1,cl(q)));c.globalAlpha*=cl(q*3);font(c,9,140,-3);c.fillStyle=COL.tq;c.fillText('99.6',0,0);
    const w=c.measureText('99.6').width;font(c,9,90);c.fillText('%',w,0);c.restore();}
  if(a>=1.0){c.save();c.globalAlpha*=seg(a,1.0,.3);rr(c,520,748,6,96,3,'#3A4884');c.restore();
    for(const [txt,w,size,y,tin] of [['Still not enough',9,44,786,1.0],['About ^5.7M^ to go',7,34,840,1.9]]){if(a<tin)continue;const p=eoe(seg(a,tin,.45));
      c.save();c.beginPath();c.rect(540,y-size,880,size*1.3);c.clip();c.translate(0,(1-p)*size);font(c,w,size);rich(c,txt,560,y,COL.txt);c.restore();}}
  // лупа: над концом шкалы, тот же масштаб ×14
  if(a>=2.6){const q=spring(a-2.6,1.8,.55),R=96,cx=1560,cy=760,fx=96+1644*1458.2/IPOP;c.save();c.translate(cx,cy);c.scale(cl(q,0,1.15),cl(q,0,1.15));
    c.fillStyle='#fff';c.beginPath();c.arc(0,0,R+10,0,7);c.fill();c.beginPath();c.arc(0,0,R,0,7);c.clip();c.fillStyle=COL.ui2;c.fillRect(-R,-R,2*R,2*R);
    rr(c,-R-40,-28,R+40-14,56,28,COL.tq);rr(c,14,-50,14,100,7,COL.ind);font(c,9,24);c.textAlign='center';c.fillStyle=COL.ind;c.fillText('5.7M',-6,70);c.restore();
    c.save();c.globalAlpha*=seg(a,2.9,.4);c.strokeStyle='#fff';c.lineWidth=4;c.lineCap='round';c.setLineDash([2,14]);c.beginPath();c.moveTo(cx-30,cy+R-4);c.quadraticCurveTo(fx-6,cy+R+40,fx-2,990);c.stroke();c.restore();}
  c.restore();}
// ---------- Сингапур: точка на карте + лупа ----------
const lc=document.createElement('canvas');lc.width=W;lc.height=H;const LM=lc.getContext('2d');
function sgLens(c,t,r,C){if(r<1.0||r>SG.len+.6)return;const [sx,sy]=toScreen(C,SG.bc[0],SG.bc[1]),q=spring(r-1.0,1.6,.6),out=1-seg(r,SG.len,.45),R=150,lx=sx-260,ly=cl(sy+190,300,735);
  // точка с пульсом
  const ph=(r*1.6)%1;c.save();c.globalAlpha=out;c.strokeStyle=COL.tq;c.lineWidth=3;c.globalAlpha*=1-ph;c.beginPath();c.arc(sx,sy,10+ph*40,0,7);c.stroke();c.restore();
  c.save();c.globalAlpha=out;c.fillStyle=r>K.fill?COL.tq:'#fff';c.beginPath();c.arc(sx,sy,7,0,7);c.fill();
  // выноска и окно лупы: карта ×10
  c.globalAlpha*=seg(r,1.2,.4);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.setLineDash([2,12]);c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.lineTo(lx+R*.7,ly+R*.7);c.stroke();c.setLineDash([]);
  const Z={cx:SG.bc[0],cy:SG.bc[1],z:C.z*10,rot:0};drawMap(t,Z,LM);
  c.translate(lx,ly);c.scale(cl(q,0,1.1),cl(q,0,1.1));c.fillStyle='#fff';c.beginPath();c.arc(0,0,R+8,0,7);c.fill();c.beginPath();c.arc(0,0,R,0,7);c.clip();
  c.fillStyle=COL.bg;c.fillRect(-R,-R,2*R,2*R);c.drawImage(lc,W/2-R,H/2-R,2*R,2*R,-R,-R,2*R,2*R);
  font(c,9,22,2);c.textAlign='center';c.fillStyle='#fff';c.fillText('×10',0,R-22);c.restore();}
// ---------- финал: 26 стран ≈ Индия ----------
function finale(c,t){const a=t-FIN;if(a<0)return;
  const dim=seg(a,2.6,.6)*.55;if(dim>0){c.fillStyle=`rgba(8,12,34,${dim})`;c.fillRect(0,0,W,H);}
  // две полосы на одной шкале
  if(a>=3&&a<11.6){const pin=eoe(seg(a,3,.6)),pout=eie(seg(a,10.6,.5)),BW=1080,x0=420;c.save();c.globalAlpha=pin*(1-pout);c.translate(0,(1-pin)*60-pout*60);
    rr(c,300,250,1320,470,48,'rgba(21,31,74,.96)');
    const ti=eio(seg(a,3.5,.9)),tt=eio(seg(a,4.7,.9));
    font(c,7,30);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('26 SELECTED COUNTRIES',x0,350);rr(c,x0,370,Math.max(56,BW*tt),56,28,COL.tq);
    font(c,7,30);c.fillStyle=COL.mut;c.fillText('INDIA',x0,500);rr(c,x0,520,Math.max(56,BW*1463.9/1464.1*ti),56,28,COL.ind);
    c.save();c.globalAlpha*=seg(a,5.6,.4);font(c,9,44);c.textAlign='right';c.fillStyle=COL.tq;c.fillText('1,464.1M',x0+BW,350);c.fillStyle=COL.ind;c.fillText('1,463.9M',x0+BW,500);c.restore();
    c.save();c.globalAlpha*=seg(a,6.6,.5);font(c,7,24);c.textAlign='center';c.fillStyle=COL.mut;c.fillText('Calculated from unrounded values. On-screen numbers are rounded.',960,660);c.restore();
    c.restore();}
  // титр: «IT TAKES / 26 COUNTRIES / TO MATCH / INDIA.»
  word(c,t,{s:'IT TAKES',w:2,size:120,x:W/2,y:330,al:'center',in:FIN+12.0,a:'track',ls0:120,ls:12,dur:.6});
  word(c,t,{s:'26 COUNTRIES',w:9,size:200,x:W/2,y:545,al:'center',in:FIN+12.5,a:'flip',col:COL.tq,glow:'rgba(46,230,200,.35)'});
  word(c,t,{s:'TO MATCH',w:7,size:66,x:W/2,y:655,al:'center',in:FIN+13.4,a:'track',ls0:60,ls:10});
  word(c,t,{s:'INDIA.',w:9,size:200,x:W/2,y:860,al:'center',in:FIN+13.9,a:'slam',from:1.6,col:COL.ind,glow:'rgba(255,138,31,.35)'});
  const fb=seg(a,FLEN-1.4,1.2);if(fb>0){c.fillStyle=`rgba(0,0,0,${fb})`;c.fillRect(0,0,W,H);}}
