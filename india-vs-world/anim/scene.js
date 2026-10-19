// India vs the World — вступление 0:00–0:14, EN, 120 BPM. Герой — текст: слово зажигает страну, число становится шкалой.
const W=1920,H=1080,cv=document.getElementById('c'),X=cv.getContext('2d');
let DURATION=14;
const COL={bg:'#0B1230',land:'#27315C',edge:'#0B1230',ind:'#FF8A1F',tq:'#2EE6C8',ui:'#151F4A',ui2:'#1D2A5E',txt:'#F4F7FF',mut:'#9AA6D6',dot:'#2A3770'};
const IND='356',IC=MAP[IND].c; // центр Индии в базовых координатах карты
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,p)=>a+(b-a)*p,seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,eoe=p=>p>=1?1:1-Math.pow(2,-10*p),eie=p=>p<=0?0:Math.pow(2,10*p-10),eoc=p=>1-Math.pow(1-p,3);
function spring(t,f=2,z=.6){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const fmt=v=>{const [a,b]=v.toFixed(1).split('.');return a.replace(/\B(?=(\d{3})+$)/g,',')+'.'+b;};
// ---------- камера карты: центр (базовые координаты), зум (лог-интерполяция), крен, расфокус ----------
const CAM=[
 // t     cx    cy     z     rot    blur
 [0   , 2350,  930, .56 , -.030, 0  ],
 [2.6 , 2560,  900, .70 , -.018, 0  ],
 [3.0 , 2650,  885, .80 , -.012, 0  ],
 [4.1 , 3049,  835, 1.92,  .000, 0  ],
 [6.9 , 3062,  830, 2.06,  .006, 0  ],
 [7.6 , 2560,  830, 1.70,  .028, 5  ],
 [10.3, 2525,  835, 1.58,  .034, 5  ],
 [11.7, 2590, 1060, .46 ,  .008, 0  ],
 [14  , 2605, 1095, .36 ,  0   , 0  ]];
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
const INDP=PATHS.find(o=>o.id===IND).p;
const mc=document.createElement('canvas');mc.width=W;mc.height=H;const MM=mc.getContext('2d');
// карта рисуется в любой холст: основной или лупу
function drawMap(t,C,M=MM){M.setTransform(1,0,0,1,0,0);M.clearRect(0,0,W,H);
  M.setTransform(1,0,0,1,W/2,H/2);M.rotate(C.rot);M.scale(C.z,C.z);M.translate(-C.cx,-C.cy);
  M.fillStyle=COL.land;for(const o of PATHS)if(o.id!==IND)M.fill(o.p);
  M.fill(INDP);
  M.lineJoin='round';M.strokeStyle=COL.edge;M.lineWidth=1.3/C.z;for(const o of PATHS)M.stroke(o.p);
  // заливка Индии кругом от центра (3,05–3,75), потом горит всегда
  const f=eoe(seg(t,3.05,.6)),u=eio(seg(t,3.05,.45));
  if(u>0){M.globalAlpha=u*.45;M.fillStyle=COL.ind;M.fill(INDP);M.globalAlpha=1;}
  if(f>0){M.save();M.beginPath();M.arc(IC[0],IC[1],f*260,0,7);M.clip();M.shadowColor='rgba(255,138,31,.85)';M.shadowBlur=40;M.fillStyle=COL.ind;M.fill(INDP);M.shadowBlur=0;M.restore();}
  // вспышка контура
  const hl=seg(t,3.0,.25)*(1-seg(t,4.6,.8));
  if(hl>0){M.globalAlpha=hl;M.strokeStyle='#fff';M.lineWidth=3/C.z;M.stroke(INDP);M.globalAlpha=1;}
  if(window.mapSteps)mapSteps(M,t,C);
  M.setTransform(1,0,0,1,0,0);}
// задний план: сетка точек с параллаксом 0,4
function dots(c,C){const k=.4,step=28,ox=-(C.cx*C.z*k)%step,oy=-(C.cy*C.z*k)%step;c.fillStyle=COL.dot;c.globalAlpha=.7;
  for(let x=ox-step;x<W+step;x+=step)for(let y=oy-step;y<H+step;y+=step){c.beginPath();c.arc(x,y,1.6,0,7);c.fill();}c.globalAlpha=1;}
// передний план: размытые пылинки с параллаксом 1,6
function dust(c,t,C){for(let i=0;i<26;i++){const f=1.6+hash(i+4)*.6,r=6+hash(i+1)*22;
  const x=((hash(i)*(W+400)-C.cx*C.z*f*.25+t*(8+hash(i+9)*14))%(W+400)+W+400)%(W+400)-200,y=((hash(i+20)*(H+300)-C.cy*C.z*f*.25-t*(6+hash(i+11)*10))%(H+300)+H+300)%(H+300)-150;
  const g=c.createRadialGradient(x,y,0,x,y,r);const col=i%4?'160,190,255':'255,170,90';g.addColorStop(0,`rgba(${col},${.08+hash(i+5)*.08})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}}
// ---------- текст ----------
const FAM={2:'N2',7:'N7',9:'N9'};
function font(c,w,size,ls=0){c.font=`${size}px ${FAM[w]}`;c.letterSpacing=ls+'px';}
// слово: вход a (slam | mask | track | skew | flip), выход ex (left | up | push | fly)
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
  if(clip){const wd=c.measureText(o.s).width,x0=o.al==='center'?o.x-wd/2:o.x;c.beginPath();c.rect(x0-80,o.y-size*1.02,wd+160,size*1.3);c.clip();}
  c.translate(o.x+dx,o.y+dy);c.rotate(rot);c.transform(1,0,skew,1,0,0);c.scale(sc,sc*sy);
  c.globalAlpha=al;if(blur>.3)c.filter=`blur(${blur.toFixed(1)}px)`;
  if(o.glow){c.shadowColor=o.glow;c.shadowBlur=40;}
  c.fillStyle=o.col||COL.txt;c.fillText(o.s,0,0);c.restore();}
// одометр: каждая цифра крутится колонкой и фиксируется в свой момент
const NUM='1,463.9',LOCK=[4.3,4.45,4.6,4.75,5.0];
function odometer(c,t,x,y,size,col,al=1){if(t<3.55||al<=0)return;font(c,9,size,-4);c.textAlign='left';
  const dw=c.measureText('0').width,lh=size*.98;let px=x,k=0;c.save();c.globalAlpha=al*seg(t,3.55,.2);c.fillStyle=col;
  for(const ch of NUM){if(!/\d/.test(ch)){c.fillText(ch,px,y);px+=c.measureText(ch).width;continue;}
    const tgt=+ch,lt=LOCK[k++],spins=3+k;const p=cl((t-3.55)/(lt-3.55));const pos=tgt+spins*10*(1-eoc(p));
    const kick=t>lt?Math.exp(-(t-lt)*9)*Math.sin((t-lt)*40)*.06:0;const fr=pos-Math.floor(pos),f=fr<.55?0:eio((fr-.55)/.45),d0=Math.floor(pos)%10; // цифра стоит и быстро перещёлкивается — без «двух рядов»
    c.save();c.beginPath();c.rect(px-6,y-size*.8,dw+12,size*.88);c.clip();
    c.fillText(String(d0),px,y-f*lh+kick*lh);if(f>.001)c.fillText(String((d0+1)%10),px,y+(1-f)*lh+kick*lh);c.restore();
    px+=dw;}
  c.restore();return px-x;}
// ---------- интерфейс ----------
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();}
const FLAG=new Image();FLAG.src='../flags/in.svg';
function flag(c,x,y,w){const h=w*.75;c.save();c.beginPath();c.roundRect(x,y,w,h,w*.14);c.clip();c.drawImage(FLAG,x,y,w,h);c.restore();}
// метка числа: большой счётчик (S2) → метка на Индии (S3) → плашка цели (S4)
function numberTag(c,t,C){const S2=[1080,560,200],[ix,iy]=toScreen(C,IC[0],IC[1]),TG=[ix,iy+12,50],PL=[1846,101,44];
  const toTag=eio(seg(t,6.8,.5)),toPill=eio(seg(t,10.7,.6));
  if(t<6.8){odometer(c,t,S2[0],S2[1],S2[2],COL.ind);return;}
  // ширина строки для разных размеров: моноширинные цифры
  font(c,9,100,-2);const wNum=c.measureText(NUM).width/100;font(c,9,100,0);const wM=c.measureText('M').width/100;
  let size,x,y;
  if(t<10.7){size=lerp(S2[2],TG[2],toTag);const tw=size*(wNum+wM*toTag);x=lerp(S2[0],TG[0]-tw/2,toTag);y=lerp(S2[1],TG[1],toTag);}
  else{size=lerp(TG[2],PL[2],toPill);const tw=size*(wNum+wM);x=lerp(TG[0]-TG[2]*(wNum+wM)/2,PL[0]-tw,toPill);y=lerp(TG[1],PL[1],toPill)-Math.sin(toPill*Math.PI)*60;}
  const tw=size*(wNum+wM*Math.max(toTag,t>=10.7?1:0));
  // подложка метки
  const pa=seg(t,7.05,.25);if(pa>0&&t<11.3){c.globalAlpha=pa*(1-seg(t,10.9,.35));rr(c,x-26,y-size*.95,tw+52,size*1.32,size*.66,COL.ui);c.globalAlpha=1;}
  font(c,9,size,-size*.02);c.textAlign='left';c.fillStyle=COL.ind;c.fillText(NUM,x,y);
  if(toTag>0){font(c,9,size,0);c.globalAlpha=toTag;c.fillText('M',x+size*wNum,y);c.globalAlpha=1;}}
// плашка «India — 1,463.9M»: растёт из прилетевшей метки
function targetPill(c,t){const p=eoe(seg(t,11.05,.5));if(p<=0)return;const x=lerp(1640,1370,p),w=lerp(240,510,p);
  c.save();c.globalAlpha=.92;rr(c,x,36,w,92,46,COL.ui);c.restore();
  const q=seg(t,11.25,.3);c.save();c.globalAlpha=q;c.beginPath();c.rect(x,36,w,92);c.clip();flag(c,1402+(1-q)*40,58,64);
  font(c,7,38);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('India —',1488+(1-q)*40,99);c.restore();}
function addedPill(c,t){const p=spring(t-11.5,1.7,.55);if(t<11.5)return;const dy=(1-p)*-140;c.save();c.translate(0,dy);
  c.globalAlpha=.92;rr(c,40,36,300,92,46,COL.ui);c.globalAlpha=1;font(c,7,30);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('Added:',80,93);
  // счётчик стран: старое число уезжает вверх, новое приходит снизу
  const A=window.addedAt?addedAt(t):{from:0,to:0,p:1},s0=String(A.from).padStart(2,'0'),s1=String(A.to).padStart(2,'0');
  font(c,9,60);c.textAlign='right';c.fillStyle=COL.tq;c.beginPath();c.rect(180,44,140,78);c.clip();
  if(A.p>=1)c.fillText(s1,300,104);else{const e=eio(A.p);c.fillText(s0,300,104-e*72);c.fillText(s1,300,104+(1-e)*72);}c.restore();}
function bar(c,t){if(t<11.0)return;const p=spring(t-11.0,1.5,.62),dy=(1-p)*260;const x0=96,x1=1740,y=980,h=40,L=x1-x0;
  c.save();c.translate(0,dy);c.globalAlpha=.94;rr(c,40,898,1840,154,46,COL.ui);c.globalAlpha=1;rr(c,x0,y,L,h,h/2,COL.ui2);
  // блик по пустой шкале
  const sh=seg(t,12.9,.9);if(sh>0&&sh<1){c.save();c.beginPath();c.roundRect(x0,y,L,h,h/2);c.clip();const sx=x0+sh*(L+400)-200;const g=c.createLinearGradient(sx-160,0,sx+160,0);
    g.addColorStop(0,'rgba(46,230,200,0)');g.addColorStop(.5,'rgba(46,230,200,.45)');g.addColorStop(1,'rgba(46,230,200,0)');c.fillStyle=g;c.fillRect(x0,y,L,h);c.restore();}
  // заливка суммы: обрезана скруглённой дорожкой; голова светится, пока растёт
  const S=window.sumAt?sumAt(t):{v:0,glow:0};if(S.v>0){const fx=x0+L*S.v/1463.9;c.save();c.beginPath();c.roundRect(x0,y,L,h,h/2);c.clip();
    c.fillStyle=COL.tq;c.fillRect(x0,y,fx-x0,h);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x0,y+7,fx-x0,9);c.restore();
    if(S.glow>0){const g=c.createRadialGradient(fx,y+h/2,0,fx,y+h/2,90);g.addColorStop(0,`rgba(46,230,200,${.7*S.glow})`);g.addColorStop(1,'rgba(46,230,200,0)');c.fillStyle=g;c.fillRect(fx-90,y-70,180,h+140);
      c.fillStyle=`rgba(255,255,255,${S.glow})`;c.beginPath();c.roundRect(fx-3,y-6,6,h+12,3);c.fill();}}
  [25,50,75].forEach((m,i)=>{const tm=11.25+i*.25;if(t<tm)return;const q=spring(t-tm,2.4,.5),mx=x0+L*m/100;
    const fl=window.markFlash?markFlash(t,m):0;
    if(fl>0){const g=c.createRadialGradient(mx,y+h/2,0,mx,y+h/2,120);g.addColorStop(0,`rgba(255,255,255,${.55*fl})`);g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(mx-120,y-100,240,h+200);}
    c.save();c.translate(mx,y+h/2);c.scale(1+fl*.6,cl(q,0,1.3)*(1+fl*.3));rr(c,-3,-h/2-12,6,h+24,3,fl>0?`rgba(255,255,255,${.4+.6*fl})`:'#3A4884');c.restore();
    c.save();c.globalAlpha=cl(q);c.translate(mx,y-22+(1-cl(q))*20);c.scale(1+fl*.25,1+fl*.25);font(c,fl>0?9:7,24);c.textAlign='center';c.fillStyle=fl>0?'#fff':COL.mut;c.fillText(m+'%',0,0);c.restore();});
  if(t>=12.0){const q=spring(t-12.0,2,.5),gf=window.markFlash?markFlash(t,100):0;
    if(gf>0){const g=c.createRadialGradient(x1,y+h/2,0,x1,y+h/2,160);g.addColorStop(0,`rgba(255,170,80,${.8*gf})`);g.addColorStop(1,'rgba(255,170,80,0)');c.fillStyle=g;c.fillRect(x1-160,y-140,320,h+280);}
    c.save();c.translate(0,(1-cl(q))*-80);rr(c,x1-4,y-20,8,h+40,4,COL.ind);flag(c,x1+26,y-14,64);c.restore();
    c.save();c.globalAlpha=seg(t,12.1,.25);font(c,7,22,1);c.textAlign='center';c.fillStyle=COL.ind;c.fillText('GOAL',x1+58,y+70);c.restore();}
  c.save();c.globalAlpha=seg(t,11.4,.3);font(c,9,26);c.textAlign='left';c.fillStyle=COL.txt;c.fillText(fmt(S.v)+'M · '+(S.v/1463.9*100).toFixed(1)+'%',x0,y-22);c.restore();
  c.restore();}
const uc=document.createElement('canvas');uc.width=W;uc.height=H;const U=uc.getContext('2d');
// ---------- кадр ----------
function frame(t){const C=camera(t);X.setTransform(1,0,0,1,0,0);X.fillStyle=COL.bg;X.fillRect(0,0,W,H);dots(X,C);
  drawMap(t,C);
  // DOF: карта в расфокусе, пока слова — герой
  if(C.blur>.3)X.filter=`blur(${C.blur.toFixed(1)}px)`;X.globalAlpha=1-C.blur*.05;X.drawImage(mc,0,0);X.filter='none';X.globalAlpha=1;
  // тёплый свет от Индии
  const lit=seg(t,3.1,.6);if(lit>0){const [ix,iy]=toScreen(C,IC[0],IC[1]),r=420*Math.sqrt(C.z);const g=X.createRadialGradient(ix,iy,0,ix,iy,r);
    g.addColorStop(0,`rgba(255,138,31,${.16*lit})`);g.addColorStop(1,'rgba(255,138,31,0)');X.fillStyle=g;X.fillRect(0,0,W,H);}
  // виньетка
  const v=X.createRadialGradient(W/2,H*.45,H*.35,W/2,H*.45,H*1.05);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');X.fillStyle=v;X.fillRect(0,0,W,H);
  // затемнение под словами вопроса
  const dim=seg(t,6.9,.5)*(1-seg(t,10.5,.6));if(dim>0){const g=X.createLinearGradient(0,0,W*.75,0);g.addColorStop(0,`rgba(8,12,34,${.72*dim})`);g.addColorStop(1,'rgba(8,12,34,0)');X.fillStyle=g;X.fillRect(0,0,W,H);}
  words(X,t,C);
  const ua=window.uiAlpha?uiAlpha(t):1;if(ua>0){U.setTransform(1,0,0,1,0,0);U.clearRect(0,0,W,H);bar(U,t);targetPill(U,t);addedPill(U,t);numberTag(U,t,C);
    X.globalAlpha=ua;X.drawImage(uc,0,0);X.globalAlpha=1;}
  if(window.stepsUI)stepsUI(X,t,C);
  dust(X,t,C);}
function words(c,t,C){
  // S1 · хук: «ONE» тонко, «COUNTRY» — оранжевый удар; затем «COUNTRY» улетает в Индию
  word(c,t,{s:'ONE',w:2,size:230,x:W/2,y:450,al:'center',in:.25,a:'track',ls0:160,ls:20,dur:.6,out:2.45,ex:'push',odur:.5});
  {const fly=eie(seg(t,2.5,.6));const [ix,iy]=toScreen(C,IC[0],IC[1]);
   if(fly<=0)word(c,t,{s:'COUNTRY',w:9,size:250,x:W/2,y:730,al:'center',in:.75,a:'mask',col:COL.ind});
   else if(fly<1){c.save();c.translate(lerp(W/2,ix,fly),lerp(640,iy,fly));c.scale(lerp(1,.06,fly),lerp(1,.06,fly));c.globalAlpha=1-seg(fly,.7,.3);
     font(c,9,250);c.textAlign='center';c.fillStyle=COL.ind;c.shadowColor=COL.ind;c.shadowBlur=30;c.fillText('COUNTRY',0,90);c.restore();}}
  // S2 · число: плашка страны, «MILLION» и «PEOPLE»
  if(t>3.5&&t<7.4){const p=eoe(seg(t,3.55,.45)),q=1-eie(seg(t,6.45,.3));c.save();c.globalAlpha=p*q;c.translate((1-p)*60,0);
    c.globalAlpha*=.9;rr(c,1086,286,450,84,42,COL.ui);c.globalAlpha=p*q;flag(c,1114,302,70);font(c,7,38);c.textAlign='left';c.fillStyle=COL.mut;c.fillText('INDIA · 2025',1206,342);c.restore();}
  word(c,t,{s:'MILLION',w:9,size:96,x:1088,y:690,in:5.0,a:'mask',out:6.45,ex:'up',odur:.3});
  word(c,t,{s:'PEOPLE',w:2,size:96,x:window.PEOPLE_X||1588,y:690,in:5.25,a:'track',ls0:70,ls:4,out:6.5,ex:'up',odur:.3});
  // S3 · вопрос: контраст начертаний, ключевое слово бирюзовое
  word(c,t,{s:'HOW MANY',w:2,size:120,x:110,y:330,in:7.0,a:'skew',out:10.45,ex:'left',odur:.45});
  word(c,t,{s:'COUNTRIES',w:9,size:210,x:104,y:545,in:7.5,a:'flip',col:COL.tq,glow:'rgba(46,230,200,.35)',out:10.52,ex:'left',odur:.45});
  word(c,t,{s:'DOES IT TAKE TO MATCH',w:7,size:62,x:112,y:665,in:8.5,a:'track',ls0:60,ls:6,out:10.58,ex:'left',odur:.45});
  word(c,t,{s:'INDIA?',w:9,size:200,x:104,y:870,in:9.0,a:'slam',from:1.6,out:10.64,ex:'left',odur:.45});
  // S4 · правила игры: «0 COUNTRIES» и сноска
  word(c,t,{s:'0',w:9,size:240,x:1480,y:470,in:12.25,a:'slam',from:1.7,col:COL.tq,out:14.0,ex:'up',odur:.35});
  word(c,t,{s:'COUNTRIES',w:9,size:60,x:1484,y:566,in:12.4,a:'mask',out:14.04,ex:'up',odur:.35});
  word(c,t,{s:'Population estimates for 2025',w:7,size:25,x:1486,y:640,in:12.75,a:'mask',col:COL.mut,out:14.08,ex:'up',odur:.35});
  word(c,t,{s:'Countries selected by the author',w:7,size:25,x:1486,y:676,in:12.85,a:'mask',col:COL.mut,out:14.12,ex:'up',odur:.35});}
window.ready=Promise.all([...['N2','N7','N9'].map(f=>document.fonts.load(`40px ${f}`)),new Promise(r=>{FLAG.complete?r():FLAG.onload=FLAG.onerror=r;})]).then(()=>{
  font(X,9,96);const w=X.measureText('MILLION ').width;window.PEOPLE_X=1088+w;});
window.seek=async t=>frame(t);
