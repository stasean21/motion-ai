// Margarita — 34 с, 120 BPM, только EN. Герой — текст: слова становятся напитком.
const W=1080,H=1920,cv=document.getElementById('c'),X=cv.getContext('2d');
const INK='#F1E4CF',SOFT='#C9AE8E',LIME='#C8F05A',BG='#2A0B12',BG2='#3D121C',GOLD='#D2AA62';
const DURATION=34;
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), lerp=(a,b,p)=>a+(b-a)*p, seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2, eoe=p=>p>=1?1:1-Math.pow(2,-10*p), eie=p=>p<=0?0:Math.pow(2,10*p-10);
const eoc=p=>1-Math.pow(1-p,3);
function spring(t,f=2,z=.7){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const mixC=(a,b,p)=>{const A=a.match(/\w\w/g).map(h=>parseInt(h,16)),B=b.match(/\w\w/g).map(h=>parseInt(h,16));return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],p))).map(v=>v.toString(16).padStart(2,'0')).join('');};
// ---------- сцена в мировых координатах ----------
const GX=540;                                  // купе
const RIMC=1230,RX=232,DEPTH=150,FOOT=1712;
const MX=1300,MBASE=1712;                      // смесительный стакан: низ в мире
const M_RIM=-620,M_IB=-34,M_RT=150,M_RB=122;   // локально от низа
const mhi=y=>lerp(M_RB,M_RT,(y-M_IB)/(M_RIM-M_IB))-8;
// ---------- камера: s, cx (тревел по миру), cy, bs/bx — бархат ----------
const CAM=[
 // t     s     cx   cy    bs    bx
 [0    , .95,  -60,   0, 1.12, -40],
 [3.8  , 1.00,   0,   0, 1.00,   0],
 [7    , 1.00,   0,   0, 1.00,   0],
 [10   , 1.04,   0,   0, 1.02,   0],
 [11.3 , 1.07,   0, -10, 1.03,   0],
 [12.4 , 1.00, 760,   0, 1.05,  40],
 [14   , 1.02, 760,   0, 1.06,  40],
 [16   , 1.04, 760,   0, 1.07,  40],
 [18   , 1.05, 760,   0, 1.08,  40],
 [19.7 , 1.08, 760,   0, 1.09,  40],
 [20.6 , 1.00, 380,   0, 1.10,  20],
 [21.6 , 1.00, 300,   0, 1.10,  14],
 [22.6 , 1.06,   0,   0, 1.12,   0],
 [24   , 1.08,   0,   0, 1.14,   0],
 [26.5 , 1.10,   0,   0, 1.42,   0],
 [28.5 , 1.12, -24,   0, 1.40, -14],
 [32   , 1.16,   0,   0, 1.30,   0],
 [34   , 1.02,   0,   0, 1.02,   0]];
function camera(t){const K=CAM,n=K.length;let i=0;while(i<n-2&&t>K[i+1][0])i++;
  const t0=K[i][0],h=K[i+1][0]-t0,u=cl((t-t0)/h);
  const tan=(j,c)=>j<=0||j>=n-1?0:(K[j+1][c]-K[j-1][c])/(K[j+1][0]-K[j-1][0]);
  const Hm=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return{s:Hm(1),cx:Hm(2),cy:Hm(3),bs:Hm(4),bx:Hm(5)};}
const PIV=[540,1250];
const toScreen=(C,wx,wy)=>[PIV[0]+(wx-PIV[0]-C.cx)*C.s,PIV[1]+(wy-PIV[1]-C.cy)*C.s];
// ---------- рецепт и тайминг ----------
const T={tqDrop:13.15,lqDrop:15.15,ljDrop:17.15,drop:.62,ice:17.85,cap:18.2,shake:[18.5,19.85],tinOff:19.9,tilt:[20.15,20.65],pour:[20.62,1.05],back:[21.7,.6],wheel:22.0};
const LAYERS=[{ml:50,col:'F4F6EE',a:.42,t:T.tqDrop+.45},{ml:25,col:'F7B548',a:.72,t:T.lqDrop+.45},{ml:25,col:'CFE77E',a:.8,t:T.ljDrop+.45}];
const PXML=2.4; // высота слоя в стакане на мл
// ---------- рисование: общее ----------
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
const FONT={H:'Heavy',T:'Deco',S:'Script'};
function setFont(c,f,size,ls=0){c.font=`${size}px ${FONT[f]}`;c.letterSpacing=ls+'px';}
function velvetBg(c){const g=c.createRadialGradient(GX,1100,60,GX,1100,1100);g.addColorStop(0,BG2);g.addColorStop(1,BG);c.fillStyle=g;c.fillRect(-900,-600,W+2400,H+1200);
  for(let i=-12;i<36;i++){const x=i*80+40,a=.05+.04*Math.sin(i*1.7);const v=c.createLinearGradient(x-40,0,x+40,0);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.5,`rgba(255,180,190,${a*.35})`);v.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=v;c.fillRect(x-40,-600,80,H+1200);}}
function decoFrame(c){
  c.strokeStyle=GOLD;c.globalAlpha=.85;c.lineWidth=2;c.strokeRect(40,40,W-80,H-80);c.lineWidth=1;c.strokeRect(54,54,W-108,H-108);
  c.save();c.translate(GX,54);for(let r=30;r<=110;r+=20){c.beginPath();c.arc(0,0,r,0,Math.PI);c.stroke();}for(let k=0;k<=8;k++){const a=k/8*Math.PI;c.beginPath();c.moveTo(Math.cos(a)*30,Math.sin(a)*30);c.lineTo(Math.cos(a)*110,Math.sin(a)*110);c.stroke();}c.restore();
  [[54,54,1,1],[W-54,54,-1,1],[54,H-54,1,-1],[W-54,H-54,-1,-1]].forEach(([x,y,sx,sy])=>{c.save();c.translate(x,y);c.scale(sx,sy);c.beginPath();c.moveTo(0,70);c.lineTo(70,0);c.moveTo(0,40);c.lineTo(40,0);c.stroke();c.restore();});
  c.globalAlpha=1;}
// боке переднего плана: движется быстрее камеры — третий план глубины
function bokeh(c,t,C){for(let i=0;i<14;i++){const f=1.35+hash(i+7)*.5,r=26+hash(i+3)*60;
  const x=((hash(i)*(W+600)-C.cx*f*C.s)%(W+600)+W+600)%(W+600)-300,y=((hash(i+20)*(H+400)-t*(14+hash(i+9)*20))%(H+400)+H+400)%(H+400)-200;
  const g=c.createRadialGradient(x,y,0,x,y,r);const col=i%3?'200,240,90':'230,190,110';g.addColorStop(0,`rgba(${col},${.10+hash(i+5)*.08})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}}
// ---------- купе ----------
const hwC=y=>RX*Math.sqrt(cl(1-((y-RIMC)/DEPTH)**2));
const BOWL=(()=>{const p=new Path2D();p.ellipse(GX,RIMC,RX-6,DEPTH-6,0,0,Math.PI);p.closePath();return p;})();
const RIM_SALT=Array.from({length:340},(_,i)=>{const a=hash(i)*Math.PI*2;return{a,r:1.6+hash(i+400)*2.6,o:(hash(i+800)-.5)*9,k:hash(i+1200)};});
function coupeFill(t){return eio(seg(t,T.pour[0]+.08,T.pour[1]+.1));}
function coupeBack(c){c.save();c.fillStyle='rgba(255,255,255,.035)';c.fill(BOWL);c.strokeStyle='rgba(255,255,255,.42)';c.lineWidth=2.5;c.beginPath();c.ellipse(GX,RIMC,RX,RX*.15,0,Math.PI,2*Math.PI);c.stroke();c.restore();}
function saltGrains(c,t,front){const cov=seg(t,11.25,.75);if(cov<=0)return;c.fillStyle='rgba(250,248,240,.95)';
  for(const g of RIM_SALT){if(g.k>cov)continue;const sn=Math.sin(g.a);if(front!==(sn>0))continue;const x=GX+Math.cos(g.a)*(RX+g.o*.6),y=RIMC+sn*(RX*.15)+g.o*.5+3;c.beginPath();c.arc(x,y,g.r,0,7);c.fill();}}
function coupeLiquid(c,t){const f=coupeFill(t);if(f<=0)return;const lvl=RIMC+DEPTH-6-(DEPTH-24)*Math.pow(f,.62);const hw=hwC(lvl)-6;
  c.save();c.clip(BOWL);c.globalAlpha=.86;c.fillStyle='#D9E79A';c.fillRect(0,lvl,W*3,DEPTH+40);c.globalAlpha=1;
  const g=c.createLinearGradient(0,lvl,0,RIMC+DEPTH);g.addColorStop(0,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(60,90,10,.3)');c.fillStyle=g;c.fillRect(0,lvl,W*3,DEPTH+40);c.restore();
  c.fillStyle='#EEF5C8';c.beginPath();c.ellipse(GX,lvl,hw,hw*.15,0,0,7);c.fill();
  // пенка
  c.save();c.beginPath();c.ellipse(GX,lvl,hw,hw*.15,0,0,7);c.clip();for(let i=0;i<90;i++){c.fillStyle=`rgba(255,255,255,${.35+hash(i)*.4})`;c.beginPath();c.arc(GX+(hash(i+1)-.5)*hw*2,lvl+(hash(i+2)-.5)*hw*.3,1.5+hash(i+3)*3,0,7);c.fill();}c.restore();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;c.beginPath();c.ellipse(GX,lvl,hw,hw*.15,0,0,Math.PI);c.stroke();}
function coupeFront(c,t,drops){
  const g=c.createLinearGradient(0,RIMC,0,RIMC+DEPTH);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,.6)');
  c.strokeStyle=g;c.lineWidth=3.5;c.beginPath();c.ellipse(GX,RIMC,RX,DEPTH,0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=3;c.beginPath();c.ellipse(GX,RIMC,RX,RX*.15,0,0,Math.PI);c.stroke();
  c.save();c.clip(BOWL);const h=c.createLinearGradient(GX-RX+30,0,GX-RX+80,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.5,'rgba(255,255,255,.3)');h.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=h;c.fillRect(GX-RX+30,RIMC,50,DEPTH);
  if(drops>0)for(let i=0;i<50;i++){const y=RIMC+16+hash(i)*(DEPTH-30),x=GX+(hash(i+60)*2-1)*(hwC(y)-14);const a=cl(drops*3-hash(i+5)*2);if(a<=0)continue;c.fillStyle=`rgba(255,250,240,${.4*a})`;c.beginPath();c.ellipse(x,y,2.5+hash(i+7)*2.5,3.5+hash(i+8)*4,0,0,7);c.fill();}
  c.restore();
  // ножка и основание
  const sg=c.createLinearGradient(GX-9,0,GX+9,0);sg.addColorStop(0,'rgba(255,255,255,.35)');sg.addColorStop(.5,'rgba(255,255,255,.9)');sg.addColorStop(1,'rgba(255,255,255,.35)');
  c.fillStyle=sg;c.beginPath();c.moveTo(GX-18,RIMC+DEPTH-4);c.quadraticCurveTo(GX-6,RIMC+DEPTH+30,GX-6,RIMC+DEPTH+60);c.lineTo(GX-8,FOOT-22);c.quadraticCurveTo(GX-10,FOOT-6,GX-40,FOOT-4);c.lineTo(GX+40,FOOT-4);c.quadraticCurveTo(GX+10,FOOT-6,GX+8,FOOT-22);c.lineTo(GX+6,RIMC+DEPTH+60);c.quadraticCurveTo(GX+6,RIMC+DEPTH+30,GX+18,RIMC+DEPTH-4);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.ellipse(GX,FOOT,126,20,0,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=2.5;c.beginPath();c.ellipse(GX,FOOT,126,20,0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(GX,FOOT,126,20,0,Math.PI,2*Math.PI);c.stroke();}
function shadow(c,x,y,r){const sh=c.createRadialGradient(x,y,4,x,y,r);sh.addColorStop(0,'rgba(0,0,0,.5)');sh.addColorStop(1,'rgba(0,0,0,0)');c.save();c.translate(x,y);c.scale(1,.16);c.fillStyle=sh;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.restore();}
// ---------- смесительный стакан + шейкер ----------
function mixInner(c){c.beginPath();c.moveTo(-mhi(M_RIM),M_RIM);c.lineTo(-mhi(M_IB),M_IB);c.ellipse(0,M_IB,mhi(M_IB),mhi(M_IB)*.17,0,Math.PI,0,true);c.lineTo(mhi(M_RIM),M_RIM);c.ellipse(0,M_RIM,mhi(M_RIM),mhi(M_RIM)*.13,0,0,-Math.PI,true);c.closePath();}
function groupXf(t){// мировое положение низа стакана и наклон
  let x=MX,y=MBASE,a=0;const sh=seg(t,T.shake[0],.15)*(1-seg(t,T.shake[1]-.1,.15));
  if(sh>0){const w=t*Math.PI*2*7;x+=Math.sin(w)*18*sh;y+=-Math.abs(Math.cos(w))*22*sh;a+=Math.sin(w+1)*.06*sh;}
  const tl=eio(seg(t,T.tilt[0],T.tilt[1]-T.tilt[0]))*(1-eio(seg(t,T.back[0],T.back[1])));
  x=lerp(x,1230,tl);y=lerp(y,741,tl);a=lerp(a,-1.95,tl);return{x,y,a,tl};}
const mixedCol='#DCE8A8';
function mixContents(c,t){// в локальных координатах, стакан вертикально
  let top=M_IB;const shook=seg(t,T.shake[0],.6);
  if(shook<1)for(const L of LAYERS){const p=eoc(seg(t,L.t,.5));if(p<=0)continue;const h=L.ml*PXML*p;c.globalAlpha=L.a*(1-shook);c.fillStyle='#'+L.col;c.fillRect(-200,top-h,400,h+(top===M_IB?40:0));c.fillStyle='rgba(255,255,255,.08)';c.fillRect(-200,top-h,400,h);top-=h;c.globalAlpha=1;}
  else top=M_IB-100*PXML;
  if(shook>0){c.globalAlpha=.8*shook;c.fillStyle=mixedCol;c.fillRect(-200,top,400,M_IB-top+40);c.globalAlpha=1;}
  // поверхность
  const fill=LAYERS.reduce((m,L)=>m+L.ml*eoc(seg(t,L.t,.5)),0);if(fill<=0)return;const ly=M_IB-fill*PXML,hw=mhi(ly);
  c.fillStyle=shook>0?'rgba(240,248,210,.7)':'rgba(255,255,255,.18)';c.beginPath();c.ellipse(0,ly,hw,hw*.14,0,0,7);c.fill();
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.beginPath();c.ellipse(0,ly,hw,hw*.14,0,0,Math.PI);c.stroke();}
function iceCubes(c,t){for(let i=0;i<4;i++){const t0=T.ice+i*.09;if(t<t0)continue;const dt=t-t0;const ty=M_IB-60-i*58,tx=(i%2?36:-40)+(i===2?10:0);
  const y=dt<.25?lerp(-1100,ty,(dt/.25)**2):ty;const r=(hash(i)-.5)*.6+(dt<.25?(1-dt/.25):0);c.save();c.translate(tx,y);c.rotate(r);rr(c,-38,-38,76,76,12);
  c.fillStyle='rgba(255,255,255,.22)';c.fill();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=2.5;c.stroke();c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.ellipse(-14,-14,10,4,-.6,0,7);c.fill();c.restore();}}
function mixGlassShape(c){// контур стакана
  c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3.5;c.beginPath();c.moveTo(-M_RT,M_RIM);c.lineTo(-M_RB-4,-10);c.quadraticCurveTo(-M_RB,0,-M_RB+14,0);c.lineTo(M_RB-14,0);c.quadraticCurveTo(M_RB,0,M_RB+4,-10);c.lineTo(M_RT,M_RIM);c.stroke();
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=3;c.beginPath();c.ellipse(0,M_RIM,M_RT,M_RT*.13,0,0,Math.PI);c.stroke();c.strokeStyle='rgba(255,255,255,.4)';c.beginPath();c.ellipse(0,M_RIM,M_RT,M_RT*.13,0,Math.PI,2*Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.beginPath();c.ellipse(0,M_IB,mhi(M_IB),mhi(M_IB)*.17,0,0,Math.PI);c.stroke();
  const h=c.createLinearGradient(-M_RT+16,0,-M_RT+50,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.5,'rgba(255,255,255,.28)');h.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=h;c.fillRect(-M_RT+16,M_RIM+30,34,-M_RIM-60);
  c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(-M_RB-2,M_IB);c.lineTo(-M_RB+10,0);c.lineTo(M_RB-10,0);c.lineTo(M_RB+2,M_IB);c.ellipse(0,M_IB,mhi(M_IB)+8,mhi(M_IB)*.17,0,0,Math.PI,false);c.fill();}
function tin(c,t){// металлический стакан шейкера сверху, широким концом вниз
  const on=eoc(seg(t,T.cap,.3)),off=eie(seg(t,T.tinOff,.4));if(on<=0||off>=1)return;const dy=(1-on)*-900-off*1100;
  c.save();c.translate(0,M_RIM+70+dy);const L=330;
  c.beginPath();c.moveTo(-165,0);c.lineTo(-118,-L+30);c.quadraticCurveTo(-112,-L,-80,-L);c.lineTo(80,-L);c.quadraticCurveTo(112,-L,118,-L+30);c.lineTo(165,0);c.closePath();
  const g=c.createLinearGradient(-165,0,165,0);[[0,'#6E6A66'],[.18,'#F4F1EA'],[.32,'#A9A39B'],[.6,'#E2DDD3'],[.85,'#7D7770'],[1,'#5A5550']].forEach(([o,cc])=>g.addColorStop(o,cc));c.fillStyle=g;c.fill();
  c.strokeStyle=GOLD;c.lineWidth=3;[[-40,1],[-58,.6],[-L+70,1]].forEach(([y,w])=>{const hw=lerp(165,118,-y/L);c.globalAlpha=w;c.beginPath();c.moveTo(-hw+2,y);c.lineTo(hw-2,y);c.stroke();});c.globalAlpha=1;
  // ар-деко веер на металле
  c.save();c.translate(0,-150);c.strokeStyle='rgba(210,170,98,.85)';c.lineWidth=2;for(let k=0;k<=6;k++){const a=Math.PI+k/6*Math.PI;c.beginPath();c.moveTo(0,20);c.lineTo(Math.cos(a)*60,20+Math.sin(a)*60);c.stroke();}c.beginPath();c.arc(0,20,60,Math.PI,2*Math.PI);c.stroke();c.restore();
  c.restore();}
function mixGroup(c,t){const G=groupXf(t);c.save();c.translate(G.x,G.y);c.rotate(G.a);
  if(G.tl<.02){c.save();mixInner(c);c.clip();mixContents(c,t);iceCubes(c,t);c.restore();}
  else{// при наклоне жидкость держит горизонт: рисуем в мировых координатах внутри контура
    const rem=1-seg(t,T.pour[0],T.pour[1]);c.save();mixInner(c);c.clip();iceCubes(c,t);c.rotate(-G.a);c.translate(-G.x,-G.y);
    const lip=[G.x+(-M_RT*Math.cos(G.a)-M_RIM*Math.sin(G.a)),G.y+(-M_RT*Math.sin(G.a)+M_RIM*Math.cos(G.a))];
    const lw=lip[1]-20-rem*170*lerp(.3,1,1-G.tl+.0001);c.globalAlpha=.8;c.fillStyle=mixedCol;c.fillRect(0,lw,W*3,600);c.globalAlpha=1;c.restore();}
  mixGlassShape(c);tin(c,t);c.restore();}
function strainStream(c,t){const[a,d]=T.pour;if(t<a-.05||t>a+d+.35)return;const G=groupXf(t);
  const lip=[G.x+(-M_RT*Math.cos(G.a)-M_RIM*Math.sin(G.a)),G.y+(-M_RT*Math.sin(G.a)+M_RIM*Math.cos(G.a))];
  const f=coupeFill(t),lvl=RIMC+DEPTH-6-(DEPTH-24)*Math.pow(f,.62);const end=a+d;
  const head=t<a+.2?lerp(lip[1],lvl,eie(seg(t,a-.05,.25))):lvl,tail=t>end?lerp(lip[1],lvl,eie(seg(t,end,.3))):lip[1];if(head<=tail)return;
  c.save();c.beginPath();const N=24,x0=lip[0]-4;for(let i=0;i<=N;i++){const y=lerp(tail,head,i/N),u=(y-lip[1])/(lvl-lip[1]+1),x=x0-Math.sqrt(cl(u))*40,w=lerp(11,7,i/N)+Math.sin(y*.05+t*30);c[i?'lineTo':'moveTo'](x-w,y);}
  for(let i=N;i>=0;i--){const y=lerp(tail,head,i/N),u=(y-lip[1])/(lvl-lip[1]+1),x=x0-Math.sqrt(cl(u))*40,w=lerp(11,7,i/N)+Math.sin(y*.05+t*30+1);c.lineTo(x+w,y);}c.closePath();
  c.fillStyle='rgba(222,234,170,.92)';c.fill();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.5;c.stroke();c.restore();}
// ---------- долька лайма ----------
function limeWheelArt(c,R){c.beginPath();c.arc(0,0,R,0,7);c.fillStyle='#4F8A1E';c.fill();c.beginPath();c.arc(0,0,R-7,0,7);c.fillStyle='#F3F8D8';c.fill();
  for(let k=0;k<10;k++){const a0=k/10*Math.PI*2+.05,a1=(k+1)/10*Math.PI*2-.05;c.beginPath();c.moveTo(Math.cos((a0+a1)/2)*6,Math.sin((a0+a1)/2)*6);c.arc(0,0,R-13,a0,a1);c.closePath();c.fillStyle='#C9E36A';c.fill();}
  c.fillStyle='#F5FAE0';c.beginPath();c.arc(0,0,6,0,7);c.fill();}
const WR=72,WEND=[GX+RX-8,RIMC+8];
function wheelState(t){const a=T.wheel;if(t<a)return null;const roll=eoc(seg(t,a,.95));const land=t>a+.95?spring(t-a-.95,1.8,.55):0;
  const x=lerp(GX+760,WEND[0]+30,roll),y0=1000;const y=lerp(y0,WEND[1],cl(land,0,1.15));const rot=-(x-(GX+760))/WR+lerp(0,-.4,cl(land,0,1));return{x:lerp(x,WEND[0],cl(land,0,1)),y,rot};}
function wheel(c,t){const s=wheelState(t);if(!s)return;c.save();c.translate(s.x,s.y);c.rotate(s.rot);limeWheelArt(c,WR);c.restore();}
// ---------- текст ----------
const K_FIT=880;
function fit(c,f,size,s,ls=0,max=K_FIT){setFont(c,f,size,ls);const w=c.measureText(s).width;return w>max?size*max/w:size;}
function letters(c,s){const out=[];let x=0;for(const ch of s){const w=c.measureText(ch).width;out.push({ch,x,w});x+=w+parseFloat(c.letterSpacing||0);}return{out,w:x-parseFloat(c.letterSpacing||0)};}
// одно слово с анимацией входа/выхода. o: {s,f,size,ls,col,x,y,al,in,out,a,exit,drop}
function word(c,t,C,o){const tIn=o.in,tOut=o.out??99;if(t<tIn)return;let size=fit(c,o.f,o.size,o.s,o.ls||0,o.max||K_FIT);
  const pin=seg(t,tIn,o.dur||.5);let dx=0,dy=0,sc=1,rot=0,sx=1,sy=1,skew=0,alpha=1,ls=o.ls||0,clip=null;
  switch(o.a){
    case'slam':{const p=spring(t-tIn,2.1,.55);sc=lerp(1.9,1,cl(p,0,1.2));rot=lerp(-.07,0,cl(p,0,1));alpha=seg(t,tIn,.1);break;}
    case'mask':{dy=(1-eoe(pin))*size*1.05;clip=[size*1.02,size*.3];break;}
    case'skewL':case'skewR':{const d=o.a==='skewL'?-1:1,e=eoe(pin);dx=d*(1-e)*260;skew=d*(1-e)*-.5;alpha=seg(t,tIn,.18);break;}
    case'track':{const e=eoe(pin);ls=lerp(110,ls,e);alpha=seg(t,tIn,.2);size=fit(c,o.f,o.size,o.s,ls,o.max||K_FIT);break;}
    case'flip':{const e=eoe(pin);sy=Math.max(.02,e);rot=lerp(.35,0,e);skew=lerp(.6,0,e);alpha=seg(t,tIn,.1);break;}
    case'wipe':{clip='wipe';break;}
    case'fade':{alpha=eoc(pin);break;}}
  // выход
  let po=0;if(t>=tOut){po=seg(t,tOut,.38);if(po>=1)return;if((o.exit||'up')==='up'){dy-=eie(po)*size*1.1;clip=clip||[size*1.02,size*.3];}
    else if(o.exit==='left'||o.exit==='right'){const d=o.exit==='left'?-1:1;dx+=d*eie(po)*900;skew+=d*eie(po)*.4;}else alpha*=1-po;}
  // падение в стакан: слово уменьшается и уходит в горлышко
  let dropClipY=null;if(o.drop&&t>=o.drop){const q=seg(t,o.drop,T.drop),e=eie(q)*.85+q*.15;const G=groupXf(t);const[mx,my]=toScreen(C,G.x,G.y+M_RIM);
    dx+=(mx-o.x)*e;dy+=(my-o.y+size*.3)*e;sc*=lerp(1,.1,e);alpha*=q>.92?1-(q-.92)/.08:1;dropClipY=my+6;if(q>=1)return;}
  c.save();if(dropClipY!==null){c.beginPath();c.rect(-W,-H,W*3,dropClipY+H);c.clip();}
  if(clip&&clip!=='wipe'){c.beginPath();c.rect(0,o.y-clip[0],W,clip[0]+clip[1]);c.clip();}
  setFont(c,o.f,size,ls);c.textAlign=o.al||'center';c.textBaseline='alphabetic';
  if(clip==='wipe'){const w=c.measureText(o.s).width;const x0=o.al==='left'?o.x:o.x-w/2;c.beginPath();c.rect(x0-60,o.y-size*1.2,(w+120)*eio(pin),size*1.8);c.clip();}
  c.translate(o.x+dx,o.y+dy);c.rotate(rot);c.transform(1,0,skew,1,0,0);c.scale(sc*sx,sc*sy);c.globalAlpha=alpha;c.fillStyle=o.col||INK;
  c.fillText(o.s,(o.al||'center')==='center'?ls/2:0,0);c.restore();}
// слово по буквам: каскад сверху / дрожание / кольцо
function lettersWord(c,t,o,fx){let size=fit(c,o.f,o.size,o.s,o.ls||0);setFont(c,o.f,size,o.ls||0);const L=letters(c,o.s);const x0=o.al==='left'?o.x:o.x-L.w/2;
  L.out.forEach((l,i)=>{const r=fx(i,l,x0,size,L.out.length);if(!r)return;c.save();if(r.clip){c.beginPath();c.rect(0,o.y-size*1.05,W,size*1.4);c.clip();}
    c.translate(r.x,r.y);c.rotate(r.rot||0);c.scale(r.sc||1,r.sc||1);c.globalAlpha=r.alpha??1;setFont(c,o.f,size,0);c.textAlign='center';c.fillStyle=r.col||o.col||INK;c.fillText(l.ch,0,0);c.restore();});c.letterSpacing='0px';}
// соль: слово SALT рассыпается крупинками
let SALT=null;const SALT_O={s:'SALT',f:'H',size:270,x:540,y:720};
function buildSalt(){const oc=document.createElement('canvas');oc.width=W;oc.height=900;const c=oc.getContext('2d');const size=fit(c,'H',SALT_O.size,'SALT');setFont(c,'H',size,0);c.textAlign='center';c.fillStyle='#fff';c.fillText('SALT',SALT_O.x,SALT_O.y);
  const d=c.getImageData(0,0,W,900).data;const pts=[];let minx=1e9,maxx=0;for(let y=300;y<900;y+=7)for(let x=0;x<W;x+=7){if(d[(y*W+x)*4+3]>140){pts.push([x,y]);minx=Math.min(minx,x);maxx=Math.max(maxx,x);}}
  SALT={pts,minx,maxx};}
const CRUMBLE=[11.0,.55];
function saltWord(c,t,C){if(t<10.1)return;const front=lerp(SALT.minx-10,SALT.maxx+10,eio(seg(t,CRUMBLE[0],CRUMBLE[1])));
  // целая часть слова справа от фронта
  c.save();c.beginPath();c.rect(front,0,W,H);c.clip();word(c,t,C,{...SALT_O,in:10.05,a:'slam',col:INK});c.restore();
  // крупинки
  const span=SALT.maxx-SALT.minx;SALT.pts.forEach(([x,y],i)=>{const td=CRUMBLE[0]+(x-SALT.minx)/span*CRUMBLE[1]+hash(i)*.08;if(t<td)return;const q=seg(t,td,.6+hash(i+3)*.25);if(q>=1)return;
    const a=hash(i+9)*Math.PI*2;const[tx,ty]=toScreen(C,GX+Math.cos(a)*RX,RIMC+Math.sin(a)*RX*.15);const e=q*q;
    const px=lerp(x,tx,eoc(q))+Math.sin(i+q*6)*14*(1-q),py=lerp(y,ty,e)-Math.sin(q*Math.PI)*40*(1-hash(i+4));
    c.fillStyle=`rgba(250,248,240,${.95-.3*q})`;c.fillRect(px,py,2.6+hash(i+5)*2.4,2.6+hash(i+6)*2.4);});}
// ---------- кадр ----------
function frame(t){const c=X;c.setTransform(1,0,0,1,0,0);const C=camera(t);
  c.fillStyle=BG;c.fillRect(0,0,W,H);
  c.save();c.translate(1100*0+PIV[0]-C.cx*.35-C.bx,PIV[1]);c.scale(C.bs,C.bs);c.translate(-PIV[0],-PIV[1]);velvetBg(c);c.restore();
  c.save();c.translate(PIV[0],PIV[1]);c.scale(C.s,C.s);c.translate(-PIV[0]-C.cx,-PIV[1]-C.cy);
  shadow(c,GX,FOOT+4,200);shadow(c,MX,MBASE+4,220);
  coupeBack(c);saltGrains(c,t,false);coupeLiquid(c,t);strainStream(c,t);coupeFront(c,t,seg(t,24,2));saltGrains(c,t,true);
  mixGroup(c,t);wheel(c,t);
  c.restore();
  bokeh(c,t,C);decoFrame(c);type(c,t,C);}
// ---------- текстовая партитура ----------
function type(c,t,C){
  // 18+
  c.save();rr(c,76,84,110,56,4);c.strokeStyle=INK;c.lineWidth=2;c.stroke();setFont(c,'T',32);c.textAlign='center';c.fillStyle=INK;c.fillText('18+',131,123);c.restore();
  // 1 · хук: три удара, стопкой
  word(c,t,C,{s:'SALT.',f:'H',size:150,x:540,y:470,in:.5,a:'slam',out:3.45,exit:'left'});
  word(c,t,C,{s:'LIME.',f:'H',size:200,x:540,y:690,in:1.0,a:'slam',out:3.5,exit:'right'});
  word(c,t,C,{s:'TEQUILA.',f:'H',size:260,x:540,y:940,in:1.5,a:'slam',col:LIME,out:3.55,exit:'left'});
  // 2 · название проявляется в просвете
  word(c,t,C,{s:'COCKTAIL',f:'T',size:40,ls:16,col:SOFT,x:540,y:560,in:4.0,a:'mask',out:6.7});
  word(c,t,C,{s:'Margarita',f:'S',size:250,x:540,y:770,in:3.75,a:'wipe',dur:.9,out:6.75,max:900});
  word(c,t,C,{s:'THE MEXICAN CLASSIC',f:'T',size:40,ls:10,col:SOFT,x:540,y:900,in:4.6,a:'mask',out:6.8});
  // 3 · список
  word(c,t,C,{s:'YOU WILL NEED',f:'T',size:52,ls:12,x:540,y:300,in:7.0,a:'mask',out:9.55});
  [['50','TEQUILA',INK,'skewL'],['25','ORANGE LIQUEUR',INK,'skewR'],['25','LIME JUICE',LIME,'skewL'],['+','SALT · ICE · LIME WHEEL',SOFT,'skewR']].forEach(([n,name,col,a],i)=>{
    const tin=7.5+i*.5,y=470+i*130;
    word(c,t,C,{s:n,f:'H',size:i===3?80:110,x:330,y,al:'right',in:tin,a,col:i===2?LIME:INK,out:9.55+i*.04});
    if(i<3)word(c,t,C,{s:'ml',f:'T',size:40,x:338,y,al:'left',in:tin+.05,a,col:SOFT,out:9.57+i*.04});
    word(c,t,C,{s:name,f:'T',size:i===3?40:56,ls:i===3?3:4,x:400,y:y-8,al:'left',in:tin+.08,a,col,out:9.59+i*.04,max:620});});
  // 4 · соль на край
  saltWord(c,t,C);
  word(c,t,C,{s:'THE RIM',f:'T',size:64,ls:16,x:540,y:860,in:10.35,a:'mask',out:11.5});
  // 5–7 · слово → слой в стакане
  const ing=(t0,amt,big,small,anim,drop,keyBig=true)=>{
    word(c,t,C,{s:amt,f:'H',size:300,x:500,y:640,in:t0,a:'slam',out:drop+.2});
    word(c,t,C,{s:'ml',f:'T',size:90,x:700,y:640,al:'left',in:t0+.1,a:'mask',col:SOFT,out:drop+.22});
    word(c,t,C,{s:big,f:'H',size:200,x:540,y:860,in:t0+.25,a:anim,col:keyBig?LIME:INK,drop});
    if(small)word(c,t,C,{s:small,f:'T',size:70,ls:14,x:540,y:960,in:t0+.4,a:'mask',col:INK,drop:drop+.04});};
  ing(12.0,'50','TEQUILA',null,'mask',T.tqDrop);
  ing(14.0,'25','ORANGE','LIQUEUR','track',T.lqDrop);
  ing(16.0,'25','LIME','JUICE','flip',T.ljDrop);
  // 8 · шейк: буквы гремят как лёд
  word(c,t,C,{s:'+ ICE',f:'T',size:70,ls:10,x:540,y:420,in:17.8,a:'mask',col:SOFT,out:18.4});
  if(t>=18.45&&t<20.25){const o={s:'SHAKE',f:'H',size:250,x:540,y:560,col:LIME};const sh=seg(t,T.shake[0],.1)*(1-seg(t,T.shake[1]-.15,.2)),po=eie(seg(t,19.95,.3));
    lettersWord(c,t,o,(i,l,x0,size)=>{const p=spring(t-18.45-i*.03,2.2,.5);const w=t*Math.PI*2*8+i*1.7;
      return{x:x0+l.x+l.w/2+Math.sin(w)*12*sh,y:o.y+Math.cos(w*1.13)*14*sh-po*size*1.1+(1-cl(p,0,1.1))*-160,rot:Math.sin(w*.9+i)*.14*sh,sc:lerp(1.5,1,cl(p,0,1)),alpha:seg(t,18.45+i*.03,.08),clip:po>0};});}
  word(c,t,C,{s:'HARD  ·  15 SECONDS',f:'T',size:46,ls:8,x:540,y:670,in:18.75,a:'mask',col:INK,out:19.95});
  // 9 · процеживание: буквы стекают вниз по одной
  if(t>=20.2&&t<22.15){const o={s:'STRAIN',f:'H',size:220,x:540,y:420,col:INK};const po=seg(t,21.75,.35);
    lettersWord(c,t,o,(i,l,x0,size,n)=>{const td=20.25+i*.07;if(t<td)return null;const e=eoe(seg(t,td,.45));const out=eie(seg(t,21.75+i*.04,.35));
      return{x:x0+l.x+l.w/2,y:o.y-(1-e)*size*1.1+out*size*1.15,clip:true,col:i===0?LIME:INK};});}
  word(c,t,C,{s:'INTO THE GLASS',f:'T',size:50,ls:10,x:540,y:530,in:20.6,a:'mask',out:21.8});
  // 10 · долька: буквы кружат вокруг и выстраиваются в строку
  if(t>=T.wheel&&t<23.95){const s=wheelState(t);const[wx,wy]=toScreen(C,s.x,s.y);const txt='LIME WHEEL · ';const n=txt.length;const toLine=eio(seg(t,22.85,.45)),out=eie(seg(t,23.55,.35));
    setFont(c,'H',120,0);const line={out:letters(c,'LIME WHEEL').out.filter(l=>l.ch!==' ')};const lw=letters(c,'LIME WHEEL').w;const lx0=540-lw/2;let li=0;
    for(let i=0;i<n;i++){const ch=txt[i];const ang=i/n*Math.PI*2-t*2.2;const R=170*C.s;const rx=wx+Math.cos(ang)*R,ry=wy+Math.sin(ang)*R;
      let x=rx,y=ry,rot=ang+Math.PI/2,alpha=seg(t,T.wheel+i*.02,.15);
      if(ch!==' '&&ch!=='·'){const L=line.out[li];if(L){x=lerp(rx,lx0+L.x+L.w/2,toLine);y=lerp(ry,740,toLine);rot=lerp(rot,0,toLine);}li++;}else alpha*=1-toLine;
      y-=out*140;c.save();c.beginPath();c.rect(0,0,W,lerp(H,740+40,out>0?1:0));c.clip();c.translate(x,y);c.rotate(rot);c.globalAlpha=alpha*(1-out);setFont(c,'H',lerp(64,120,toLine),0);c.textAlign='center';c.fillStyle=li<=4&&ch!==' '&&ch!=='·'?LIME:INK;c.fillText(ch,0,lerp(22,0,toLine));c.restore();}}
  // 11 · пропорция
  word(c,t,C,{s:'REMEMBER THE RATIO',f:'T',size:42,ls:10,col:SOFT,x:540,y:280,in:24.0,a:'mask',out:27.7});
  [['2',300,LIME,24.5],['1',540,INK,25.0],['1',780,INK,25.5]].forEach(([n,x,col,tin],i)=>{word(c,t,C,{s:n,f:'H',size:300,x,y:560,in:tin,a:'slam',col,out:27.72+i*.03});
    if(i)word(c,t,C,{s:':',f:'T',size:260,x:x-120,y:545,in:tin-.1,a:'fade',col:SOFT,out:27.7});});
  const bars=[['tequila',2,LIME],['liqueur',1,'#F2C779'],['lime',1,'#C9DE7A']];let bx=540-380;
  bars.forEach(([n,v,col],i)=>{const p=eoe(seg(t,26.0+i*.25,.5)),q=eie(seg(t,27.7,.3));const w=v*190*p*(1-q);if(w<1){bx+=v*190;return;}
    c.save();rr(c,bx,640,Math.max(0,w-14),12,6);c.fillStyle=col;c.fill();if(p>.8&&q<.5){setFont(c,'T',36,2);c.textAlign='center';c.fillStyle=INK;c.fillText(n,bx+(v*190-14)/2,700);}c.restore();bx+=v*190;});
  // 12 · герой
  word(c,t,C,{s:'Margarita',f:'S',size:190,x:540,y:520,in:28.0,a:'wipe',dur:.9,out:31.7});
  word(c,t,C,{s:'SALT · 50 · 25 · 25 · SHAKE · STRAIN',f:'T',size:32,ls:5,col:SOFT,x:540,y:640,in:28.5,a:'mask',out:31.72,max:900});
  // 13 · финал
  word(c,t,C,{s:'Save this recipe',f:'S',size:140,x:540,y:520,in:32.0,a:'wipe',dur:.7,col:LIME});
  word(c,t,C,{s:'AND MAKE IT THIS WEEKEND',f:'T',size:36,ls:6,x:540,y:630,in:32.3,a:'mask'});
  word(c,t,C,{s:'PLEASE DRINK RESPONSIBLY',f:'T',size:26,ls:2,x:540,y:1860,in:32.4,a:'fade'});}
window.seek=async t=>frame(t);
window.ready=Promise.all(['Heavy','Deco','Script'].map(f=>document.fonts.load(`40px ${f}`))).then(buildSalt);
