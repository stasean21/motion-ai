// China electricity (Episode 03) — 5:50, EN, 120 BPM. Сцена: карта, камера, текст, интерфейс и вступление 0:00–0:30.
// Герой — текст: «25 COUNTRIES vs CHINA?», выработка Китая (TWh за 2024) становится целью на шкале.
const W=1920,H=1080,cv=document.getElementById('c'),X=cv.getContext('2d');
let DURATION=30;
const COL={bg:'#101B30',land:'#26324F',edge:'#101B30',ind:'#FF9A45',tq:'#27D6CB',ui:'#172440',ui2:'#21304F',txt:'#F5F2E9',mut:'#9AA7C2',dot:'#24314D'};
const TGT='156',IC=MAP[TGT].c,TPOP=10025.008,BMAX=1.15,UNIT=' TWh'; // Китай: цель в TWh; шкала линейна до 115% цели — перелёт до 110.8% без пересчёта масштаба
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,p)=>a+(b-a)*p,seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,eoe=p=>p>=1?1:1-Math.pow(2,-10*p),eie=p=>p<=0?0:Math.pow(2,10*p-10),eoc=p=>1-Math.pow(1-p,3);
function spring(t,f=2,z=.6){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const fmt=v=>{const [a,b]=v.toFixed(1).split('.');return a.replace(/\B(?=(\d{3})+$)/g,',')+'.'+b;};
// ---------- камера карты: центр (базовые координаты), зум (лог-интерполяция), крен, расфокус ----------
function view(box,reg,k,zmax=6){const z=Math.min(zmax,Math.min((reg[2]-reg[0])/(box[2]-box[0]),(reg[3]-reg[1])/(box[3]-box[1]))*k);
  return[(box[0]+box[2])/2-((reg[0]+reg[2])/2-W/2)/z,(box[1]+box[3])/2-((reg[1]+reg[3])/2-H/2)/z,z];}
const WORLD=[0,140,4000,1880],WV=view(WORLD,[40,150,1450,880],1),CHV=view(VIEWS.china,[100,200,1000,880],.85),CHQ=view(VIEWS.china,[60,180,1000,900],.6);
const CAM=[
 // t     cx       cy       z          rot    blur
 [0   , 2250,    930,     .5 ,       -.025, 0],
 [2.5 , 2480,    900,     .56,       -.015, 0],
 [8.6 , 2700,    880,     .66,        .010, 2.5],
 [10.4, CHV[0],  CHV[1],  CHV[2],     .000, 0],
 [14.6, CHV[0]+8,CHV[1],  CHV[2]*1.05,.006, 0],
 [16.8, WV[0],   WV[1],   WV[2],      .000, 0],
 [30  , WV[0]-20,WV[1],   WV[2]*1.04,-.004, 0]];
function camera(t){const K=CAM.map(k=>[k[0],k[1],k[2],Math.log(k[3]),k[4],k[5]]),n=K.length;let i=0;while(i<n-2&&t>K[i+1][0])i++;
  const t0=K[i][0],h=K[i+1][0]-t0,u=cl((t-t0)/h);
  // монотонные касательные (Фриче–Карлсон): камера не проскакивает ключи
  const sl=(j,c)=>(K[j+1][c]-K[j][c])/(K[j+1][0]-K[j][0]);
  const tan=(j,c)=>{if(j<=0||j>=n-1)return 0;const a=sl(j-1,c),b=sl(j,c);if(a*b<=0)return 0;return 2/(1/a+1/b);};
  const Hm=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return{cx:Hm(1),cy:Hm(2),z:Math.exp(Hm(3)),rot:Hm(4),blur:Math.max(0,Hm(5))};}
const toScreen=(C,x,y)=>{const dx=(x-C.cx)*C.z,dy=(y-C.cy)*C.z,c=Math.cos(C.rot),s=Math.sin(C.rot);return[W/2+dx*c-dy*s,H/2+dx*s+dy*c];};
// ---------- карта ----------
const PATHS=Object.entries(MAP).map(([id,m])=>({id,p:new Path2D(m.d)}));
const TP=PATHS.find(o=>o.id===TGT).p,LIT=.6;
const mc=document.createElement('canvas');mc.width=W;mc.height=H;const MM=mc.getContext('2d');
function drawMap(t,C,M=MM){M.setTransform(1,0,0,1,0,0);M.clearRect(0,0,W,H);
  M.setTransform(1,0,0,1,W/2,H/2);M.rotate(C.rot);M.scale(C.z,C.z);M.translate(-C.cx,-C.cy);
  M.fillStyle=COL.land;for(const o of PATHS)M.fill(o.p);
  M.lineJoin='round';M.strokeStyle=COL.edge;M.lineWidth=1.3/C.z;for(const o of PATHS)M.stroke(o.p);
  // Китай: заливка кругом от центра, потом горит всегда
  const f=eoe(seg(t,LIT,.6)),u=eio(seg(t,LIT,.45));
  if(u>0){M.globalAlpha=u*.45;M.fillStyle=COL.ind;M.fill(TP);M.globalAlpha=1;}
  if(f>0){M.save();if(f<.999){M.beginPath();M.arc(IC[0],IC[1],f*700,0,7);M.clip();}M.shadowColor='rgba(255,154,69,.85)';M.shadowBlur=40;M.fillStyle=COL.ind;M.fill(TP);M.shadowBlur=0;M.restore();
    M.strokeStyle=COL.edge;M.lineWidth=1.3/C.z;M.stroke(TP);}
  const hl=seg(t,LIT-.05,.25)*(1-seg(t,2.2,.8));
  if(hl>0){M.globalAlpha=hl;M.strokeStyle='#fff';M.lineWidth=3/C.z;M.stroke(TP);M.globalAlpha=1;}
  if(window.mapSteps)mapSteps(M,t,C);
  M.setTransform(1,0,0,1,0,0);}
function dots(c,C){const k=.4,step=28,ox=-(C.cx*C.z*k)%step,oy=-(C.cy*C.z*k)%step;c.fillStyle=COL.dot;c.globalAlpha=.7;
  for(let x=ox-step;x<W+step;x+=step)for(let y=oy-step;y<H+step;y+=step){c.beginPath();c.arc(x,y,1.6,0,7);c.fill();}c.globalAlpha=1;}
function dust(c,t,C){for(let i=0;i<26;i++){const f=1.6+hash(i+4)*.6,r=6+hash(i+1)*22;
  const x=((hash(i)*(W+400)-C.cx*C.z*f*.25+t*(8+hash(i+9)*14))%(W+400)+W+400)%(W+400)-200,y=((hash(i+20)*(H+300)-C.cy*C.z*f*.25-t*(6+hash(i+11)*10))%(H+300)+H+300)%(H+300)-150;
  const g=c.createRadialGradient(x,y,0,x,y,r);const col=i%4?'160,200,230':'255,175,110';g.addColorStop(0,`rgba(${col},${.08+hash(i+5)*.08})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}}
// ---------- текст ----------
const FAM={2:'N2',7:'N7',9:'N9'};
function font(c,w,size,ls=0){c.font=`${size}px ${FAM[w]}`;c.letterSpacing=ls+'px';}
// слово: вход a (slam | mask | track | skew | flip), выход ex (left | up | push | fade)
function word(c,t,o){const tin=o.in;if(t<tin||t>(o.out??1e9)+.6)return;
  const size=o.size;let ls=o.ls||0;const pin=seg(t,tin,o.dur||.45);let dx=0,dy=0,sc=1,rot=0,sy=1,skew=0,al=1,clip=null,blur=0;
  switch(o.a){
    case'slam':{const p=spring(t-tin,2.2,.55);sc=lerp(o.from||1.8,1,p);al=seg(t,tin,.08);blur=(1-cl(p))*8;break;}
    case'mask':{dy=(1-eoe(pin))*size*1.1;clip=true;break;}
    case'track':{const e=eoe(pin);ls=lerp(o.ls0??90,ls,e);al=seg(t,tin,.25);break;}
    case'skew':{const e=eoe(pin);dx=-(1-e)*320;skew=(1-e)*.55;al=seg(t,tin,.15);blur=(1-e)*10;break;}
    case'flip':{const p=spring(t-tin,1.8,.6);sy=Math.max(.02,cl(p,0,1.15));skew=(1-cl(p))*-.5;rot=(1-cl(p))*.08;al=seg(t,tin,.08);break;}}
  if(o.out!=null&&t>o.out){const po=seg(t,o.out,o.odur||.4),e=eie(po);
    if(o.ex==='left'){dx-=e*1500;skew-=e*.45;blur+=e*14;}
    else if(o.ex==='up'){dy-=eie(po)*size*1.1;clip=true;}
    else if(o.ex==='push'){sc*=1+eie(po)*2.2;al*=1-po;blur+=po*18;}
    else al*=1-po;}
  if(al<=0)return;
  c.save();font(c,o.w,size,ls);c.textBaseline='alphabetic';c.textAlign=o.al||'left';
  if(clip){const wd=c.measureText(o.s).width,x0=o.al==='center'?o.x-wd/2:o.al==='right'?o.x-wd:o.x;c.beginPath();c.rect(x0-80,o.y-size*1.02,wd+160,size*1.3);c.clip();}
  c.translate(o.x+dx,o.y+dy);c.rotate(rot);c.transform(1,0,skew,1,0,0);c.scale(sc,sc*sy);
  c.globalAlpha=al;if(blur>.3)c.filter=`blur(${blur.toFixed(1)}px)`;
  if(o.glow){c.shadowColor=o.glow;c.shadowBlur=40;}
  c.fillStyle=o.col||COL.txt;c.fillText(o.s,0,0);c.restore();}
// одометр: каждая цифра крутится колонкой и фиксируется в свой момент (справа налево к end)
function odo(c,t,str,x,y,size,col,start,end,gap=.18){const nd=str.replace(/\D/g,'').length;font(c,9,size,-size*.02);c.textAlign='left';c.fillStyle=col;
  const dw=c.measureText('0').width;let px=x,k=0;
  for(const ch of str){if(!/\d/.test(ch)){c.fillText(ch,px,y);px+=c.measureText(ch).width;continue;}
    const lt=end-(nd-1-k)*gap,spins=2+k++,p=cl((t-start)/(lt-start)),pos=+ch+spins*10*(1-eoc(p));
    const fr=pos-Math.floor(pos),f=fr<.55?0:eio((fr-.55)/.45),d0=Math.floor(pos)%10,kick=t>lt?Math.exp(-(t-lt)*9)*Math.sin((t-lt)*40)*.06:0;
    c.save();c.beginPath();c.rect(px-6,y-size*.8,dw+12,size*.88);c.clip();c.fillText(String(d0),px,y-f*size*.98+kick*size);
    if(f>.001)c.fillText(String((d0+1)%10),px,y+(1-f)*size*.98+kick*size);c.restore();px+=dw;}
  return px-x;}
// строка с ключевым словом: «*ключ*» — бирюзовый, «^ключ^» — оранжевый
function rich(c,str,x,y,col,al='left'){const parts=str.split(/([*^][^*^]+[*^])/).filter(Boolean);
  let w=0;for(const p of parts)w+=c.measureText(p[0]==='*'||p[0]==='^'?p.slice(1,-1):p).width;let px=al==='center'?x-w/2:al==='right'?x-w:x;c.textAlign='left';
  for(const p of parts){const k=p[0]==='*'?COL.tq:p[0]==='^'?COL.ind:null,txt=k?p.slice(1,-1):p;c.fillStyle=k||col;c.fillText(txt,px,y);px+=c.measureText(txt).width;}return w;}
// ---------- интерфейс ----------
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();}
const FLAG=new Image();FLAG.src='../flags/cn.svg';
function flag(c,x,y,w,im=FLAG){const h=w*.75;c.save();c.beginPath();c.roundRect(x,y,w,h,w*.14);c.clip();c.drawImage(im,x,y,w,h);c.restore();}
// число Китая: большой счётчик → метка на Китае → плашка цели
const NUM='10,025.0',T_ODO=[10.9,13.0],T_TAG=14.7,T_PILL=16.0;
function numberTag(c,t,C){const S2=[1060,560,160],[ix,iy]=toScreen(C,IC[0],IC[1]),TG=[ix,iy+12,50],PL=[1846,113,36];
  const toTag=eio(seg(t,T_TAG,.5)),toPill=eio(seg(t,T_PILL,.6));
  if(t<T_ODO[0])return;
  if(t<T_TAG){odo(c,t,NUM,S2[0],S2[1],S2[2],COL.ind,T_ODO[0],T_ODO[1],.16);return;}
  font(c,9,100,-2);const wNum=c.measureText(NUM).width/100;font(c,9,100,0);const wM=c.measureText(UNIT).width/100;
  let size,x,y;
  if(t<T_PILL){size=lerp(S2[2],TG[2],toTag);const tw=size*(wNum+wM*toTag);x=lerp(S2[0],TG[0]-tw/2,toTag);y=lerp(S2[1],TG[1],toTag);}
  else{size=lerp(TG[2],PL[2],toPill);const tw=size*(wNum+wM);x=lerp(TG[0]-TG[2]*(wNum+wM)/2,PL[0]-tw,toPill);y=lerp(TG[1],PL[1],toPill)-Math.sin(toPill*Math.PI)*60;}
  const tw=size*(wNum+wM*Math.max(toTag,t>=T_PILL?1:0));
  const pa=seg(t,T_TAG+.25,.25);if(pa>0&&t<T_PILL+.6){c.globalAlpha=pa*(1-seg(t,T_PILL+.2,.35));rr(c,x-26,y-size*.95,tw+52,size*1.32,size*.66,COL.ui);c.globalAlpha=1;}
  font(c,9,size,-size*.02);c.textAlign='left';c.fillStyle=COL.ind;c.fillText(NUM,x,y);
  if(toTag>0){font(c,9,size,0);c.globalAlpha=toTag;c.fillText(UNIT,x+size*wNum,y);c.globalAlpha=1;}}
// плашка цели «CHINA TARGET · 1,416.1M»: растёт из прилетевшей метки
function targetPill(c,t){const p=eoe(seg(t,T_PILL+.35,.5));if(p<=0)return;const x=lerp(1640,1370,p),w=lerp(240,510,p);
  c.save();c.globalAlpha=.94;rr(c,x,36,w,92,46,COL.ui);c.restore();
  const q=seg(t,T_PILL+.55,.3);c.save();c.globalAlpha=q;c.beginPath();c.rect(x,36,w,92);c.clip();flag(c,1402+(1-q)*40,58,64);
  font(c,7,20,2);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('CHINA TARGET',1488+(1-q)*40,74);c.restore();}
function addedPill(c,t){const t0=T_PILL+.8;if(t<t0)return;const p=spring(t-t0,1.7,.55),dy=(1-p)*-140;c.save();c.translate(0,dy);
  c.globalAlpha=.94;rr(c,40,36,300,92,46,COL.ui);c.globalAlpha=1;font(c,7,20,2);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('COUNTRIES ADDED',76,74);
  const A=window.addedAt?addedAt(t):{from:0,to:0,p:1},s0=String(A.from).padStart(2,'0'),s1=String(A.to).padStart(2,'0');
  font(c,9,52);c.textAlign='left';c.fillStyle=COL.tq;c.beginPath();c.rect(70,78,200,46);c.clip();
  if(A.p>=1)c.fillText(s1,76,118);else{const e=eio(A.p);c.fillText(s0,76,118-e*48);c.fillText(s1,76,118+(1-e)*48);}c.restore();}
// общая шкала: линейная до 115% цели (GX — отметка Китая), 25/50/75%; перелёт за цель — светлым сегментом
const BX0=96,BX1=1740,BY=980,BH=40,BL=BX1-BX0,bx=v=>BX0+BL*v/(TPOP*BMAX),GX=bx(TPOP);
function bar(c,t){const tb=T_PILL+.3;if(t<tb)return;const p=spring(t-tb,1.5,.62),dy=(1-p)*260;const x0=BX0,x1=BX1,y=BY,h=BH,L=BL;
  c.save();c.translate(0,dy);c.globalAlpha=.95;rr(c,40,898,1840,160,46,COL.ui);c.globalAlpha=1;rr(c,x0,y,L,h,h/2,COL.ui2);
  const sh=seg(t,tb+1.9,.9);if(sh>0&&sh<1){c.save();c.beginPath();c.roundRect(x0,y,L,h,h/2);c.clip();const sx=x0+sh*(L+400)-200;const g=c.createLinearGradient(sx-160,0,sx+160,0);
    g.addColorStop(0,'rgba(39,214,203,0)');g.addColorStop(.5,'rgba(39,214,203,.45)');g.addColorStop(1,'rgba(39,214,203,0)');c.fillStyle=g;c.fillRect(x0,y,L,h);c.restore();}
  const S=window.sumAt?sumAt(t):{v:0,glow:0,pct:0};
  if(S.v>0){const fx=bx(S.v);c.save();c.beginPath();c.roundRect(x0,y,L,h,h/2);c.clip();
    c.fillStyle=COL.tq;c.fillRect(x0,y,Math.min(fx,GX)-x0,h);if(fx>GX){c.fillStyle='#9DEFE9';c.fillRect(GX,y,fx-GX,h);}
    c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x0,y+7,fx-x0,9);c.restore();
    if(S.glow>0){const g=c.createRadialGradient(fx,y+h/2,0,fx,y+h/2,90);g.addColorStop(0,`rgba(39,214,203,${.7*S.glow})`);g.addColorStop(1,'rgba(39,214,203,0)');c.fillStyle=g;c.fillRect(fx-90,y-70,180,h+140);
      c.fillStyle=`rgba(255,255,255,${S.glow})`;c.beginPath();c.roundRect(fx-3,y-6,6,h+12,3);c.fill();}}
  [25,50,75].forEach((m,i)=>{const tm=tb+.25+i*.25;if(t<tm)return;const q=spring(t-tm,2.4,.5),mx=bx(TPOP*m/100);
    const fl=window.markFlash?markFlash(t,m):0;
    if(fl>0){const g=c.createRadialGradient(mx,y+h/2,0,mx,y+h/2,120);g.addColorStop(0,`rgba(255,255,255,${.55*fl})`);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(mx-120,y-100,240,h+200);}
    c.save();c.translate(mx,y+h/2);c.scale(1+fl*.6,cl(q,0,1.3)*(1+fl*.3));rr(c,-3,-h/2-12,6,h+24,3,fl>0?`rgba(255,255,255,${.4+.6*fl})`:'#3A4A6E');c.restore();
    c.save();c.globalAlpha=cl(q);c.translate(mx,y+h+30+(1-cl(q))*-10);c.scale(1+fl*.25,1+fl*.25);font(c,fl>0?9:7,22);c.textAlign='center';c.fillStyle=fl>0?'#fff':COL.mut;c.fillText(m+'%',0,0);c.restore();});
  // отметка Китая (100%) остаётся на месте и после перелёта
  if(t>=tb+1.0){const q=spring(t-tb-1.0,2,.5),gf=window.markFlash?markFlash(t,100):0;
    if(gf>0){const g=c.createRadialGradient(GX,y+h/2,0,GX,y+h/2,160);g.addColorStop(0,`rgba(255,180,110,${.8*gf})`);g.addColorStop(1,'rgba(255,180,110,0)');c.fillStyle=g;c.fillRect(GX-160,y-140,320,h+280);}
    c.save();c.translate(0,(1-cl(q))*-80);rr(c,GX-4,y-20,8,h+40,4,COL.ind);c.restore();
    c.save();c.globalAlpha=seg(t,tb+1.1,.25);font(c,9,20,2);c.textAlign='left';c.fillStyle=COL.ind;c.fillText('CHINA 100%',GX+14,y-20);c.restore();}
  c.save();c.globalAlpha=seg(t,tb+.4,.3);font(c,7,20,2);c.textAlign='left';c.fillStyle=COL.mut;c.fillText('TEAM TOTAL',x0,y-20);const lw=c.measureText('TEAM TOTAL  ').width;
  font(c,9,28);c.fillStyle=COL.txt;c.fillText(fmt(S.v)+UNIT,x0+lw,y-18);
  c.textAlign='right';const ps=S.pct.toFixed(1)+'%';
  font(c,7,20,2);const ow=c.measureText(' OF CHINA’S GENERATION').width;c.fillStyle=COL.mut;c.fillText(' OF CHINA’S GENERATION',GX-24,y-20);font(c,9,28);c.fillStyle=COL.tq;c.fillText(ps,GX-24-ow,y-18);
  font(c,7,13,1);c.textAlign='right';c.fillStyle=COL.mut;c.globalAlpha*=.8;c.fillText('2024 • Source: Ember • Rounded for display',1846,y+h+30);c.restore();
  if(window.countPops)for(const pp of countPops(t)){const px=bx(pp.v);c.save();c.globalAlpha=pp.a;c.translate(px,y-52+(1-pp.s)*16);font(c,9,22);const w=c.measureText(pp.label).width;
    rr(c,-w/2-14,-22,w+28,32,16,COL.tq);c.beginPath();c.moveTo(-7,10);c.lineTo(0,18);c.lineTo(7,10);c.fill();c.fillStyle=COL.bg;c.textAlign='center';c.fillText(pp.label,0,2);c.restore();}
  if(window.barExtra)barExtra(c,t,{x0,x1,y,h,L});
  c.restore();
  // заголовок метрики над картой
  const ha=seg(t,23.1,.4);if(ha>0){c.save();c.globalAlpha=ha*.95;font(c,7,18,3);const s='ANNUAL ELECTRICITY GENERATION · 2024 · TWh',w=c.measureText(s).width;rr(c,960-w/2-22,52,w+44,40,20,COL.ui);c.fillStyle=COL.mut;c.textAlign='center';c.fillText(s,960,79);c.restore();}}
const uc=document.createElement('canvas');uc.width=W;uc.height=H;const U=uc.getContext('2d');
// ---------- кадр ----------
function frame(t){const C=camera(t);X.setTransform(1,0,0,1,0,0);X.fillStyle=COL.bg;X.fillRect(0,0,W,H);dots(X,C);
  drawMap(t,C);
  if(C.blur>.3)X.filter=`blur(${C.blur.toFixed(1)}px)`;X.globalAlpha=1-C.blur*.05;X.drawImage(mc,0,0);X.filter='none';X.globalAlpha=1;
  // тёплый свет от Китая
  const lit=seg(t,LIT+.1,.6);if(lit>0){const [ix,iy]=toScreen(C,IC[0],IC[1]),r=520*Math.sqrt(C.z);const g=X.createRadialGradient(ix,iy,0,ix,iy,r);
    g.addColorStop(0,`rgba(255,154,69,${.14*lit})`);g.addColorStop(1,'rgba(255,154,69,0)');X.fillStyle=g;X.fillRect(0,0,W,H);}
  const v=X.createRadialGradient(W/2,H*.45,H*.35,W/2,H*.45,H*1.05);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');X.fillStyle=v;X.fillRect(0,0,W,H);
  // затемнение под вопросом
  const dim=seg(t,2.6,.6)*(1-seg(t,8.6,.6));if(dim>0){X.fillStyle=`rgba(8,12,26,${.5*dim})`;X.fillRect(0,0,W,H);}
  cards(X,t);words(X,t,C);
  if(window.miniMap)miniMap(X,t);
  const ua=window.uiAlpha?uiAlpha(t):1;if(ua>0){U.setTransform(1,0,0,1,0,0);U.clearRect(0,0,W,H);bar(U,t);targetPill(U,t);addedPill(U,t);numberTag(U,t,C);
    X.globalAlpha=ua;X.drawImage(uc,0,0);X.globalAlpha=1;}
  if(window.stepsUI)stepsUI(X,t,C);
  dust(X,t,C);}
// условный значок генератора: окружность с синусоидой (общий символ выработки, без вида топлива)
function genIcon(c,x,y,r,col=COL.txt,lw=4){c.save();c.strokeStyle=col;c.lineWidth=lw;c.lineCap='round';c.beginPath();c.arc(x,y,r,0,7);c.stroke();
  c.beginPath();for(let k=0;k<=24;k++){const u=k/24,px=x-r*.55+u*r*1.1,py=y-Math.sin(u*Math.PI*2)*r*.28;k?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();c.restore();}
// три значка генератора появляются вокруг карты и «собираются» в пустой счётчик команды
const GENS=[[420,300],[1500,260],[1380,780]];
function cards(c,t){GENS.forEach(([x,y],i)=>{const tin=1.5+i*.5;if(t<tin||t>T_PILL+1)return;const q=spring(t-tin,2,.55),fly=eio(seg(t,8.6+i*.08,1.0)),bob=Math.sin(t*1.6+i)*6;
  const px=lerp(x,BX0+30,fly),py=lerp(y+bob,BY+BH/2,fly)-Math.sin(fly*Math.PI)*120,sc=cl(q,0,1.15)*lerp(1,.35,fly);c.save();c.globalAlpha=1-seg(fly,.75,.25);c.translate(px,py);c.scale(sc,sc);
  rr(c,-70,-70,140,140,40,'rgba(33,48,79,.92)');c.strokeStyle='rgba(39,214,203,.6)';c.lineWidth=3;c.stroke();genIcon(c,0,0,40,COL.tq,5);c.restore();});}
function words(c,t,C){
  // вопрос: «25 COUNTRIES / vs / CHINA?» + «POPULATION CHALLENGE»
  word(c,t,{s:'25 COUNTRIES',w:9,size:170,x:W/2,y:430,al:'center',in:3.0,a:'slam',col:COL.tq,glow:'rgba(39,214,203,.3)',out:8.5,ex:'push',odur:.5});
  word(c,t,{s:'vs',w:2,size:110,x:W/2,y:560,al:'center',in:3.5,a:'track',ls0:80,ls:8,dur:.6,out:8.52,ex:'push',odur:.5});
  word(c,t,{s:'CHINA?',w:9,size:230,x:W/2,y:780,al:'center',in:4.0,a:'flip',col:COL.ind,glow:'rgba(255,154,69,.3)',out:8.55,ex:'push',odur:.5});
  word(c,t,{s:'ELECTRICITY CHALLENGE',w:7,size:44,x:W/2,y:880,al:'center',in:5.0,a:'track',ls0:60,ls:14,dur:.7,out:8.58,ex:'push',odur:.5});
  // число Китая: плашка страны, «MILLION» и «PEOPLE»
  if(t>T_ODO[0]-.4&&t<T_TAG+.6){const p=eoe(seg(t,T_ODO[0]-.35,.45)),q=1-eie(seg(t,T_TAG-.25,.3));c.save();c.globalAlpha=p*q;c.translate((1-p)*60,0);
    c.globalAlpha*=.92;rr(c,1086,286,450,84,42,COL.ui);c.globalAlpha=p*q;flag(c,1114,302,70);font(c,7,38);c.textAlign='left';c.fillStyle=COL.mut;c.fillText('CHINA · 2024',1206,342);c.restore();}
  word(c,t,{s:'TWh',w:9,size:96,x:1066,y:690,in:T_ODO[1],a:'mask',out:T_TAG-.25,ex:'up',odur:.3});
  word(c,t,{s:'GENERATED',w:2,size:96,x:window.PEOPLE_X||1300,y:690,in:T_ODO[1]+.25,a:'track',ls0:70,ls:4,out:T_TAG-.2,ex:'up',odur:.3});
  // правила: карточка единицы → маленькая подпись TWh; выборка; «генерация, не потребление»
  const R0=18.0,RO=29.5;
  {const a=seg(t,R0,.4),sh=eio(seg(t,22.6,.7));if(a>0&&sh<1){const x=lerp(1160,960,sh),y=lerp(330,72,sh),sc=lerp(1,.25,sh);c.save();c.globalAlpha=a*(1-seg(sh,.6,.4));c.translate(x,y);c.scale(sc,sc);
    rr(c,-300,-130,600,260,40,'rgba(23,36,64,.96)');c.strokeStyle='rgba(39,214,203,.5)';c.lineWidth=3;c.stroke();genIcon(c,-200,-30,46,COL.tq,6);
    font(c,9,96);c.textAlign='left';c.fillStyle=COL.tq;c.fillText('1 TWh',-120,0);font(c,7,34);c.fillStyle=COL.txt;c.fillText('= 1 billion kWh',-120,62);
    font(c,7,22,2);c.fillStyle=COL.mut;c.fillText('ENERGY GENERATED OVER A YEAR',-250,108);c.restore();}}
  word(c,t,{s:'TEAM TOTAL',w:7,size:24,x:1484,y:330,in:23.4,a:'mask',col:COL.mut,ls:3,out:RO,ex:'up',odur:.35});
  word(c,t,{s:'0',w:9,size:240,x:1476,y:540,in:23.55,a:'slam',from:1.7,col:COL.tq,out:RO+.04,ex:'up',odur:.35});
  word(c,t,{s:'Selected lineup',w:9,size:40,x:1484,y:620,in:24.0,a:'mask',out:RO+.08,ex:'up',odur:.35});
  word(c,t,{s:'Generation — not consumption',w:7,size:25,x:1486,y:666,in:24.2,a:'mask',col:COL.mut,out:RO+.12,ex:'up',odur:.35});
  word(c,t,{s:'or power-plant capacity',w:7,size:25,x:1486,y:700,in:24.3,a:'mask',col:COL.mut,out:RO+.16,ex:'up',odur:.35});}
window.ready=Promise.all([...['N2','N7','N9'].map(f=>document.fonts.load(`40px ${f}`)),new Promise(r=>{FLAG.complete?r():FLAG.onload=FLAG.onerror=r;})]).then(()=>{
  font(X,9,96);const w=X.measureText('TWh ').width;window.PEOPLE_X=1066+w;});
window.seek=async t=>frame(t);
