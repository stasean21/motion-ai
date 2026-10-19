// Мохито — 34 с, 120 BPM. Всё считается от времени в seek(t).
const W=1080,H=1920,cv=document.getElementById('c'),X=cv.getContext('2d');
const INK='#F1E4CF',SOFT='#C9AE8E',GREEN='#8DD67E',LIME='#A8CF45',BG='#2A0B12',BG2='#3D121C',GOLD='#D2AA62';
const BAR=2; const INTRO=4; const bar=n=>n<=1?0:n===2?INTRO:(n-1)*BAR+INTRO; // такты 1–2 по 4 с (название и состав), дальше по 2 с
const DURATION=34;
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), lerp=(a,b,p)=>a+(b-a)*p, seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2, eoe=p=>p>=1?1:1-Math.pow(2,-10*p), eie=p=>p<=0?0:Math.pow(2,10*p-10);
function spring(t,f=2,z=.7){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const mixC=(a,b,p)=>{const A=a.match(/\w\w/g).map(h=>parseInt(h,16)),B=b.match(/\w\w/g).map(h=>parseInt(h,16));return A.map((v,i)=>Math.round(lerp(v,B[i],p))).map(v=>v.toString(16).padStart(2,'0')).join('');};
// ---------- язык: index.html?lang=en ----------
const LANG=new URLSearchParams(location.search).get('lang')||'ru';
const TX={
 ru:{ml:'мл',mint:'Мята и лайм',mintSub:'10 листиков · ½ лайма',syr:'Сахарный сироп',mud:'Размять',mudSub:'мадлером, бережно',ice:'Лёд',iceSub:'дроблёный, доверху',
  rum:'Белый ром',soda:'Содовая',gar:'Украсить',garSub:'веточка мяты и лайм',labels:{syr:'СИРОП',rum:'РОМ',soda:'СОДОВАЯ'},
  t1:'Мохито',t2:'Гавана',sub:'КУБИНСКАЯ КЛАССИКА',need:'ПОНАДОБИТСЯ',mintList:'Мята, ½ лайма',iceList:'Дроблёный лёд',step:(n)=>`ШАГ ${n} ИЗ 7`,
  ratioT:'ЗАПОМНИ ФОРМУЛУ',ratio:['ром','сироп','содовая'],
  name:'Мохито',short:'МЯТА · ЛАЙМ · 20 · ЛЁД · 50 · 100',save:'Сохрани рецепт',saveSub:'И ПРИГОТОВЬ НА ВЫХОДНЫХ',age:'18+',warn:'ЧРЕЗМЕРНОЕ УПОТРЕБЛЕНИЕ АЛКОГОЛЯ ВРЕДИТ ВАШЕМУ ЗДОРОВЬЮ'},
 en:{ml:'ml',mint:'Mint & lime',mintSub:'10 leaves · ½ lime',syr:'Sugar syrup',mud:'Muddle',mudSub:'gently, don’t shred',ice:'Ice',iceSub:'crushed, to the top',
  rum:'White rum',soda:'Soda',gar:'Garnish',garSub:'mint sprig & lime',labels:{syr:'SYRUP',rum:'RUM',soda:'SODA'},
  t1:'Mojito',t2:'Havana',sub:'THE CUBAN CLASSIC',need:'YOU WILL NEED',mintList:'Mint, ½ lime',iceList:'Crushed ice',step:(n)=>`STEP ${n} OF 7`,
  ratioT:'REMEMBER THE FORMULA',ratio:['rum','syrup','soda'],
  name:'Mojito',short:'MINT · LIME · 20 · ICE · 50 · 100',save:'Save this recipe',saveSub:'AND MAKE IT THIS WEEKEND',age:'18+',warn:'PLEASE DRINK RESPONSIBLY'}}[LANG];
const ML=n=>`${n} ${TX.ml}`;
// ---------- бокал хайбол: высокий, прямой ----------
const GX=W/2,RIM=880,IB=1592,BOT=1652,RXO=182,BXO=170,WALL=9;
const ho=y=>lerp(RXO,BXO,(y-RIM)/(BOT-RIM)), hi=y=>ho(y)-WALL, halfAt=hi;
const ryOf=(y,rx)=>rx*lerp(.13,.19,(y-RIM)/(BOT-RIM));
const INNER=(()=>{const p=new Path2D();p.moveTo(GX-hi(RIM),RIM);p.lineTo(GX-hi(IB),IB);p.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,Math.PI,0,true);
  p.lineTo(GX+hi(RIM),RIM);p.ellipse(GX,RIM,hi(RIM),ryOf(RIM,hi(RIM)),0,0,-Math.PI,true);p.closePath();return p;})();
// ---------- рецепт и тайминг ----------
const STEPS=[
 {key:'mint',bar:3,amt:TX.mint,name:TX.mintSub},
 {key:'syr',bar:4,amt:ML(20),name:TX.syr,ml:20,d:1.0},
 {key:'mud',bar:5,amt:TX.mud,name:TX.mudSub},
 {key:'ice',bar:6,amt:TX.ice,name:TX.iceSub},
 {key:'rum',bar:7,amt:ML(50),name:TX.rum,ml:50,d:1.2},
 {key:'soda',bar:8,amt:ML(100),name:TX.soda,ml:100,d:1.4},
 {key:'gar',bar:9,amt:TX.gar,name:TX.garSub}];
const POUR=s=>[bar(s.bar)+.25,s.d];
const SK=k=>STEPS.find(s=>s.key===k);
function poured(t){let ml=0;for(const s of STEPS){if(!s.ml)continue;const[a,d]=POUR(s);ml+=s.ml*eio(seg(t,a,d));}return ml;}
const liquidMl=poured;
// дроблёный лёд: кусочки по рядам снизу вверх, сыплются за 1,3 с
const ICE_TOP=RIM+34;
const ICE=(()=>{const a=[];let r=0;for(let y=IB-14;y>ICE_TOP;y-=34,r++){const h=hi(y)-22,n=Math.floor(h*2/40);for(let k=0;k<=n;k++){const i=a.length;
  a.push({x:GX-h+k*(h*2/n)+(hash(i)-.5)*16+(r%2)*10,y:y+(hash(i+300)-.5)*12,s:30+hash(i+600)*20,r:hash(i+900)*6,row:r});}}
  const rows=r;a.forEach(p=>p.t0=bar(6)+.15+p.row/rows*1.15+hash(p.x)*.08);return a;})();
const iceFill=t=>eio(seg(t,bar(6)+.15,1.4));
// объём → уровень; в зоне льда жидкости остаётся 55 % сечения
const VOL0=[],VOLI=[];{let a=0,b=0;for(let y=IB;y>=RIM;y--){const s=Math.PI*hi(y)**2;a+=s;b+=s*(y>ICE_TOP?.55:1);VOL0[y]=a;VOLI[y]=b;}}
const FULL_ML=170,K=VOLI[RIM+62]/FULL_ML;
const lvlOf=(V,ml)=>{if(ml<=0)return IB;const tg=ml*K;let y=IB;while(y>RIM&&V[y]<tg)y--;return y;};
const levelY=(t,ml)=>lerp(lvlOf(VOL0,ml),lvlOf(VOLI,ml),iceFill(t));
// цвет: сироп → сок лайма и мяты → ром → содовая
function liquid(t){const m=eio(seg(t,bar(5)+.4,1.4)),s=eio(seg(t,POUR(SK('soda'))[0],1.6));
  let c=mixC('F3EAC8','B8E86E',m);c=mixC(c,'C2EC80',s);return{col:'#'+c,a:lerp(.32,.42,m)};}
// ---------- рисование ----------
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function txt(c,s,x,y,font,col,al='center'){let ls=0;const m=font.match(/^ls(\d+) /);if(m){ls=+m[1];font=font.slice(m[0].length);}c.font=font;c.letterSpacing=ls+'px';c.fillStyle=col;c.textAlign=al;c.fillText(s,x+(al==='center'?ls/2:0),y);c.letterSpacing='0px';}
function rise(c,s,x,y,font,col,tIn,tOut,t,al='center',h=120){const pi=eoe(seg(t,tIn,.45)),po=eie(seg(t,tOut,.35));if(pi<=0||po>=1)return;
  c.save();c.beginPath();c.rect(0,y-h,W,h*1.28);c.clip();txt(c,s,x,y+(1-pi)*h-po*h,font,col,al);c.restore();}
function velvetBg(c,t){const g=c.createRadialGradient(GX,1100,60,GX,1100,1100);g.addColorStop(0,BG2);g.addColorStop(1,BG);c.fillStyle=g;c.fillRect(-600,-600,W+1200,H+1200);
  for(let i=-8;i<22;i++){const x=i*80+40,a=.05+.04*Math.sin(i*1.7);const v=c.createLinearGradient(x-40,0,x+40,0);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.5,`rgba(255,180,190,${a*.35})`);v.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=v;c.fillRect(x-40,-600,80,H+1200);}}
function glassShadow(c){const sh=c.createRadialGradient(GX,BOT+6,5,GX,BOT+6,240);sh.addColorStop(0,'rgba(0,0,0,.5)');sh.addColorStop(1,'rgba(0,0,0,0)');c.save();c.translate(GX,BOT+6);c.scale(1,.18);c.fillStyle=sh;c.beginPath();c.arc(0,0,240,0,7);c.fill();c.restore();}
function decoFrame(c){
  c.strokeStyle=GOLD;c.globalAlpha=.85;c.lineWidth=2;c.strokeRect(40,40,W-80,H-80);c.lineWidth=1;c.strokeRect(54,54,W-108,H-108);
  c.save();c.translate(GX,54);for(let r=30;r<=110;r+=20){c.beginPath();c.arc(0,0,r,0,Math.PI);c.stroke();}for(let k=0;k<=8;k++){const a=k/8*Math.PI;c.beginPath();c.moveTo(Math.cos(a)*30,Math.sin(a)*30);c.lineTo(Math.cos(a)*110,Math.sin(a)*110);c.stroke();}c.restore();
  [[54,54,1,1],[W-54,54,-1,1],[54,H-54,1,-1],[W-54,H-54,-1,-1]].forEach(([x,y,sx,sy])=>{c.save();c.translate(x,y);c.scale(sx,sy);c.beginPath();c.moveTo(0,70);c.lineTo(70,0);c.moveTo(0,40);c.lineTo(40,0);c.stroke();c.restore();});
  c.globalAlpha=1;}
function glassBack(c){c.save();c.fillStyle='rgba(255,255,255,.035)';c.fill(INNER);
  c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2.5;c.beginPath();c.ellipse(GX,RIM,RXO,ryOf(RIM,RXO),0,Math.PI,2*Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=1.5;c.beginPath();c.ellipse(GX,RIM,hi(RIM),ryOf(RIM,hi(RIM)),0,Math.PI,2*Math.PI);c.stroke();
  c.beginPath();c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,Math.PI,2*Math.PI);c.stroke();c.restore();}
function basePath(c){c.beginPath();c.moveTo(GX-ho(IB),IB);c.lineTo(GX-BXO,BOT);c.ellipse(GX,BOT,BXO,ryOf(BOT,BXO),0,Math.PI,0,true);c.lineTo(GX+ho(IB),IB);c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,0,Math.PI,false);c.closePath();}
function glassFront(c,t,drops,L,lvl){
  basePath(c);const bg=c.createLinearGradient(0,IB,0,BOT+40);bg.addColorStop(0,'rgba(255,255,255,.10)');bg.addColorStop(1,'rgba(255,255,255,.24)');c.fillStyle=bg;c.fill();
  if(lvl<IB-2){c.save();c.globalAlpha=.4*L.a;c.fillStyle=L.col;c.fill();c.restore();}
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=3;c.beginPath();c.ellipse(GX,BOT,BXO,ryOf(BOT,BXO),0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;c.beginPath();c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,0,Math.PI);c.stroke();
  for(const sd of[-1,1]){c.fillStyle='rgba(255,255,255,.10)';c.beginPath();c.moveTo(GX+sd*RXO,RIM);c.lineTo(GX+sd*BXO,BOT);c.lineTo(GX+sd*hi(IB),IB);c.lineTo(GX+sd*hi(RIM),RIM);c.closePath();c.fill();
    const g=c.createLinearGradient(0,RIM,0,BOT);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.6,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,.85)');
    c.strokeStyle=g;c.lineWidth=3.5;c.beginPath();c.moveTo(GX+sd*RXO,RIM);c.lineTo(GX+sd*BXO,BOT);c.stroke();
    c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=1.5;c.beginPath();c.moveTo(GX+sd*hi(RIM),RIM);c.lineTo(GX+sd*hi(IB),IB);c.stroke();}
  const hl=(x0,w,a,y0,y1)=>{const h=c.createLinearGradient(x0,0,x0+w,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.5,`rgba(255,255,255,${a})`);h.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=h;c.fillRect(x0,y0,w,y1-y0);};
  hl(GX-RXO+20,34,.26,RIM+34,BOT-20);hl(GX-RXO+62,12,.14,RIM+60,IB-30);hl(GX+RXO-44,18,.16,RIM+40,BOT-30);
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=3;c.beginPath();c.ellipse(GX,RIM,RXO,ryOf(RIM,RXO),0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=1.5;c.beginPath();c.ellipse(GX,RIM,hi(RIM),ryOf(RIM,hi(RIM)),0,0,Math.PI);c.stroke();
  if(drops>0){for(let i=0;i<80;i++){const y=RIM+40+hash(i)*(BOT-RIM-70),side=hash(i+90)*2-1,x=GX+side*(ho(y)-12)*.96;const a=cl(drops*3-hash(i+5)*2);if(a<=0)continue;
    const rx=2.5+hash(i+7)*3,ry=3.5+hash(i+8)*5;c.fillStyle=`rgba(40,0,8,${.1*a})`;c.beginPath();c.ellipse(x+.8,y+1.5,rx,ry,0,0,7);c.fill();
    c.fillStyle=`rgba(255,240,235,${.32*a})`;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.fillStyle=`rgba(255,255,255,${.9*a})`;c.beginPath();c.arc(x-rx*.35,y-ry*.4,1.2,0,7);c.fill();}}}
// мята: листья слетают на дно, после содовой поднимаются между льдом
function leafPath(c,L,w){c.beginPath();c.moveTo(-L/2,0);c.bezierCurveTo(-L/4,-w,L/4,-w,L/2,0);c.bezierCurveTo(L/4,w*.9,-L/4,w*.9,-L/2,0);c.closePath();}
function leaf(c,x,y,r,s,bruise){c.save();c.translate(x,y);c.rotate(r);c.scale(s,s);const L=54,w=22;leafPath(c,L,w);
  const g=c.createLinearGradient(0,-w,0,w);g.addColorStop(0,mixC('86D46E','4E8A3A',bruise).replace(/^/,'#'));g.addColorStop(1,mixC('3A8A3E','23562A',bruise).replace(/^/,'#'));c.fillStyle=g;c.fill();
  c.strokeStyle='rgba(220,255,200,.55)';c.lineWidth=1.5;c.beginPath();c.moveTo(-L/2+4,0);c.quadraticCurveTo(0,-3,L/2-4,0);c.stroke();
  for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(k*12,-2);c.lineTo(k*12+8,-w*.55);c.moveTo(k*12,-1);c.lineTo(k*12+8,w*.45);c.stroke();}c.restore();}
const LEAVES=Array.from({length:10},(_,i)=>({x:GX+(hash(i+40)-.5)*220,y:IB-16-hash(i+50)*70,r:(hash(i+60)-.5)*2.6,
  ux:GX+(hash(i+70)-.5)*230,uy:lerp(IB-90,RIM+150,hash(i+80)),t0:bar(3)+.1+i*.07}));
function drawLeaves(c,t){const br=eio(seg(t,bar(5)+.4,1.2)),up=eio(seg(t,POUR(SK('soda'))[0]+.3,2.2));
  for(const[i,l]of LEAVES.entries()){if(t<l.t0)continue;const dt=t-l.t0,f=eoe(seg(dt,0,.75));
    let x=lerp(GX+(hash(i)-.5)*300,l.x,f)+Math.sin(dt*9+i)*30*(1-f),y=lerp(620,l.y,f),r=l.r+Math.sin(dt*7+i)*.8*(1-f);
    x=lerp(x,l.ux,up);y=lerp(y,l.uy,up);r+=up*.6*Math.sin(t*1.3+i);
    c.save();if(y>RIM-10)c.clip(INNER);else{c.beginPath();c.rect(0,600,W,H);c.clip();}leaf(c,x,y,r,1.3-.12*br,br*.6);c.restore();}}
// дольки лайма: падают на дно, при размятии сплющиваются
function limeWedge(c,x,y,r,sq){c.save();c.translate(x,y);c.rotate(r);c.scale(1,1-sq*.25);const R=50;
  c.beginPath();c.moveTo(0,0);c.arc(0,0,R,Math.PI*1.05,Math.PI*1.95);c.closePath();c.fillStyle='#4F8A1E';c.fill();
  c.beginPath();c.moveTo(0,-4);c.arc(0,-4,R-8,Math.PI*1.08,Math.PI*1.92);c.closePath();c.fillStyle='#E4F2A6';c.fill();
  c.strokeStyle='rgba(160,200,70,.7)';c.lineWidth=2;for(let k=1;k<4;k++){const a=Math.PI*(1.08+k*.21);c.beginPath();c.moveTo(0,-6);c.lineTo(Math.cos(a)*(R-12),-4+Math.sin(a)*(R-12));c.stroke();}c.restore();}
const WEDGES=[[GX-70,IB-14,-.3],[GX+60,IB-12,.25],[GX-5,IB-40,3.0]];
function drawWedges(c,t){const sq=eio(seg(t,bar(5)+.4,1.2));WEDGES.forEach(([x,y,r],i)=>{const t0=bar(3)+.9+i*.18;if(t<t0)return;const dt=t-t0;
  const yy=dt<.3?lerp(620,y,(dt/.3)**2):y-14*Math.exp(-(dt-.3)*8)*Math.abs(Math.sin((dt-.3)*16));
  c.save();if(yy>RIM-10)c.clip(INNER);else{c.beginPath();c.rect(0,600,W,H);c.clip();}limeWedge(c,x,yy,r+(dt<.3?(1-dt/.3)*2:0),sq);c.restore();});}
// дроблёный лёд
function iceShape(c,s,seed){c.beginPath();for(let k=0;k<7;k++){const a=k/7*Math.PI*2,rr=s/2*(.72+hash(seed+k)*.4);c[k?'lineTo':'moveTo'](Math.cos(a)*rr,Math.sin(a)*rr*.85);}c.closePath();}
function drawIce(c,t,lvl){for(const[i,p]of ICE.entries()){if(t<p.t0)continue;const dt=t-p.t0,ft=.24;const y=dt<ft?lerp(620,p.y,(dt/ft)**2):p.y;
  const under=y>lvl+6,k=under?.55:1;c.save();if(y>RIM-10)c.clip(INNER);else{c.beginPath();c.rect(0,600,W,H);c.clip();}
  c.translate(p.x,y);c.rotate(p.r+(dt<ft?(1-dt/ft)*2:0));iceShape(c,p.s,i*11);c.fillStyle=under?`rgba(225,250,200,${.14+hash(i+5)*.1})`:`rgba(255,255,255,${.16+hash(i+5)*.14})`;c.fill();
  c.strokeStyle=under?'rgba(235,255,215,.5)':'rgba(255,255,255,.75)';c.lineWidth=2;c.stroke();c.fillStyle=`rgba(255,255,255,${.8*k})`;c.beginPath();c.ellipse(-p.s*.15,-p.s*.15,p.s*.12,p.s*.05,-.6,0,7);c.fill();c.restore();}}
function drawLiquid(c,t,lvl,L){if(lvl>=IB-2)return;const h=hi(lvl),ry=ryOf(lvl,h);c.save();
  c.beginPath();c.moveTo(GX-h,lvl);c.lineTo(GX-hi(IB),IB);c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,Math.PI,0,true);c.lineTo(GX+h,lvl);c.ellipse(GX,lvl,h,ry,0,0,Math.PI,false);c.closePath();
  c.fillStyle='rgba(255,255,255,.16)';c.fill();c.globalAlpha=L.a;c.fillStyle=L.col;c.fill();c.globalAlpha=1;
  c.save();c.clip();const g=c.createLinearGradient(0,lvl,0,IB+30);g.addColorStop(0,'rgba(255,255,255,.05)');g.addColorStop(1,'rgba(40,90,10,.14)');c.fillStyle=g;c.fillRect(0,lvl-ry,W,IB-lvl+ry*3);
  // газ: после содовой пузырьки идут постоянно
  const fizz=seg(t,POUR(SK('soda'))[0],.6);if(fizz>0)for(let i=0;i<70;i++){const sp=70+hash(i)*120,ph=hash(i+3)*10;const y=IB-((t*sp+ph*150)%(IB-lvl+20));if(y<lvl+6)continue;const x=GX+(hash(i+11)*2-1)*(hi(y)-14);
    c.fillStyle=`rgba(255,255,255,${.6*fizz})`;c.beginPath();c.arc(x,y,1.4+hash(i+4)*2.6,0,7);c.fill();}
  c.restore();
  c.globalAlpha=Math.min(1,L.a+.1);c.fillStyle=L.col;c.beginPath();c.ellipse(GX,lvl,h,ry,0,0,7);c.fill();c.globalAlpha=1;
  c.fillStyle='rgba(255,255,255,.1)';c.beginPath();c.ellipse(GX,lvl,h,ry,0,0,7);c.fill();
  c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();c.ellipse(GX,lvl,h,ry,0,0,Math.PI);c.stroke();c.restore();}
// бутылки без брендов: сироп, ром, содовая
const MOUTH=[GX+30,700];
function bottleShape(c,k){c.beginPath();
  if(k==='rum'){c.moveTo(0,-13);c.lineTo(100,-14);c.quadraticCurveTo(128,-15,140,-40);c.quadraticCurveTo(150,-64,190,-64);c.lineTo(640,-64);c.quadraticCurveTo(650,-64,650,-54);c.lineTo(650,54);c.quadraticCurveTo(650,64,640,64);c.lineTo(190,64);c.quadraticCurveTo(150,64,140,40);c.quadraticCurveTo(128,15,100,14);c.lineTo(0,13);}
  else{const s=k==='syr'?.85:1;c.moveTo(0,-11*s);c.lineTo(70*s,-12*s);c.bezierCurveTo(120*s,-14*s,140*s,-46*s,190*s,-48*s);c.lineTo(470*s,-48*s);c.quadraticCurveTo(486*s,-48*s,486*s,-30*s);c.lineTo(486*s,30*s);c.quadraticCurveTo(486*s,48*s,470*s,48*s);c.lineTo(190*s,48*s);c.bezierCurveTo(140*s,46*s,120*s,14*s,70*s,12*s);c.lineTo(0,11*s);}
  c.closePath();}
function bottle(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const p=eoe(seg(t,a-.45,.4)),q=eie(seg(t,a+d+.05,.4));if(p<=0||q>=1)return;
  const tilt=lerp(-.04,-.16,eio(seg(t,a-.25,.3)))*(1-eio(seg(t,a+d,.3)));const k=s.key;
  c.save();c.translate(MOUTH[0]+(1-p)*600+q*600,MOUTH[1]);c.rotate(tilt);
  const pal={syr:['#6B5A3A','#E9DDBA','#FFF8E6'],rum:['#4E5E5A','#CFE0DA','#F7FBFA'],soda:['#5E8C99','#BFE0E8','#F2FBFD']}[k];
  bottleShape(c,k);const g=c.createLinearGradient(0,-70,0,70);g.addColorStop(0,pal[0]);g.addColorStop(.22,pal[2]);g.addColorStop(.38,pal[1]);g.addColorStop(.8,pal[0]);g.addColorStop(1,pal[0]);c.fillStyle=g;c.fill();
  c.globalAlpha=.55;c.fillStyle='rgba(255,255,255,.3)';c.fill();c.globalAlpha=1;
  c.save();bottleShape(c,k);c.clip();c.fillStyle='rgba(255,255,255,.55)';c.fillRect(30,-9,100,4);c.fillRect(k==='rum'?220:180,k==='rum'?-52:-38,300,7);c.restore();
  c.fillStyle={syr:'#B08A5A',rum:'#E9CF8E',soda:'#C9CDD1'}[k];rr(c,-8,-15,18,30,4);c.fill();
  const L=k==='rum'?[280,-50,240,100]:k==='syr'?[200,-34,150,68]:[250,-40,160,80];
  rr(c,L[0],L[1],L[2],L[3],6);c.fillStyle='#F3E6CC';c.fill();c.strokeStyle=GOLD;c.lineWidth=2;c.strokeRect(L[0]+7,L[1]+7,L[2]-14,L[3]-14);
  c.save();c.translate(L[0]+L[2]/2,L[1]+L[3]/2);c.rotate(Math.PI/4);c.fillStyle=GOLD;c.fillRect(-5,-5,10,10);c.restore();
  c.font=`${k==='rum'?26:20}px Deco`;c.letterSpacing='4px';c.fillStyle='#4A1A12';c.textAlign='center';
  c.fillText(TX.labels[k],L[0]+L[2]/2+2,L[1]+L[3]/2-12);c.letterSpacing='0px';c.restore();}
function stream(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const end=a+d;if(t<a-.05||t>end+.4)return;
  let lvl=levelY(t,liquidMl(t));if(iceFill(t)>.5)lvl=Math.min(lvl,ICE_TOP+20);const S0=MOUTH[1]+4;
  const head=t<a+.25?lerp(S0,lvl,eie(seg(t,a-.05,.3))):lvl,tail=t>end?lerp(S0,lvl,eie(seg(t,end,.35))):S0;if(head<=tail)return;
  const col=s.key==='soda'?'rgba(225,240,245,.85)':s.key==='rum'?'rgba(240,244,236,.85)':'rgba(246,236,205,.9)';const x=MOUTH[0];
  c.save();c.beginPath();const N=20;for(let i=0;i<=N;i++){const y=lerp(tail,head,i/N),w=lerp(8,5,i/N)+Math.sin(y*.05+t*30)*1;c[i?'lineTo':'moveTo'](x-w+Math.sin(y*.02+t*8)*1.5,y);}
  for(let i=N;i>=0;i--){const y=lerp(tail,head,i/N),w=lerp(8,5,i/N)+Math.sin(y*.05+t*30+1)*1;c.lineTo(x+w+Math.sin(y*.02+t*8)*1.5,y);}c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.5;c.stroke();c.restore();}
// мадлер: деревянный пестик, три нажатия
function muddler(c,t){const a=bar(5),p=seg(t,a,2);if(p<=0||p>=1)return;const inP=eoe(seg(t,a,.4)),outP=eie(seg(t,a+1.6,.4));
  const press=Math.abs(Math.sin(seg(t,a+.4,1.2)*Math.PI*3));const tip=lerp(300,IB-36,inP)-press*70-outP*1100;const len=620,x=GX+Math.sin(t*5)*8;
  c.save();c.translate(x,tip-len);c.rotate(Math.sin(t*4)*.02);const g=c.createLinearGradient(-16,0,16,0);g.addColorStop(0,'#7A522C');g.addColorStop(.45,'#D9AE73');g.addColorStop(1,'#6E4824');
  c.fillStyle=g;rr(c,-13,0,26,len-40,10);c.fill();c.beginPath();c.moveTo(-13,len-60);c.lineTo(-18,len-6);c.quadraticCurveTo(-18,len,-12,len);c.lineTo(12,len);c.quadraticCurveTo(18,len,18,len-6);c.lineTo(13,len-60);c.closePath();c.fill();
  c.fillStyle='rgba(60,35,15,.5)';for(let k=0;k<5;k++)c.fillRect(-18+k*8,len-6,4,6);c.fillStyle='rgba(255,230,190,.35)';c.fillRect(-6,10,4,len-80);c.restore();}
// украшение: веточка мяты пружиной садится в лёд, долька лайма — на край
function sprig(c,t){const a=bar(9);if(t<a)return;const s=spring(t-a-.05,1.6,.6),p=eoe(seg(t,a,.5));const bx=GX-70,by=RIM+90;
  c.save();c.beginPath();c.rect(0,600,W,H);c.clip();c.translate(bx,lerp(by-520,by,cl(s,0,1.2)));c.rotate(lerp(.5,-.12,cl(s,0,1.1)));
  c.strokeStyle='#3F7A2E';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(6,-90,-4,-200);c.stroke();
  [[-40,-.9,.9],[-40,.9+Math.PI,.9],[-90,-1,1],[-90,1+Math.PI,1],[-140,-1.2,1.05],[-140,1.2+Math.PI,1.05],[-185,-1.4,.95],[-185,1.4+Math.PI,.95],[-205,-1.57,.85]].forEach(([y,r,sc],i)=>{
    const ox=Math.cos(r)*24*sc,oy=Math.sin(r)*24*sc;leaf(c,ox,y+oy,r,sc*(.6+p*.4),0);});
  c.restore();}
function limeWheel(c,t){const a=bar(9)+.3;if(t<a)return;const s=spring(t-a-.1,1.7,.62),p=eoe(seg(t,a,.5));const R=66;
  const x=lerp(GX+420,GX+hi(RIM+20)-4,p),y=lerp(RIM-260,RIM+20,cl(s,0,1.2)),rot=lerp(1.2,-.35,cl(s,0,1.1));
  c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.arc(0,0,R,0,7);c.fillStyle='#4F8A1E';c.fill();c.beginPath();c.arc(0,0,R-7,0,7);c.fillStyle='#F3F8D8';c.fill();
  for(let k=0;k<10;k++){const a0=k/10*Math.PI*2+.05,a1=(k+1)/10*Math.PI*2-.05;c.beginPath();c.moveTo(Math.cos((a0+a1)/2)*6,Math.sin((a0+a1)/2)*6);c.arc(0,0,R-13,a0,a1);c.closePath();c.fillStyle='#C9E36A';c.fill();}
  c.fillStyle='#F5FAE0';c.beginPath();c.arc(0,0,6,0,7);c.fill();c.restore();}
// отметки уровня: сироп до льда, ром и содовая после
function levelTags(c,t){const tags=[['syr',20,0,bar(6)],['rum',70,1,bar(9)],['soda',170,1,bar(9)]];let prev=1e9;
  for(const[k,acc,ic,fadeAt]of tags.slice().sort((a,b)=>a[1]-b[1])){const s=SK(k);const[a,d]=POUR(s);const ly=lvlOf(ic?VOLI:VOL0,acc),ty=ic?Math.min(ly,prev-56):ly;if(ic)prev=ty;
    const p=eoe(seg(t,a+d-.2,.4)),fade=1-seg(t,fadeAt,.4);if(p<=0||fade<=0)continue;const x0=GX+ho(ly)+10;
    c.save();c.globalAlpha=fade;c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.moveTo(x0,ly);c.lineTo(x0+20,ty);c.lineTo(lerp(x0+20,x0+36,p),ty);c.stroke();
    c.beginPath();c.rect(x0+40,ty-46,W,60);c.clip();txt(c,s.amt,x0+44,ty+14+(1-p)*50,'40px Deco',k==='rum'?GREEN:INK,'left');c.restore();}}
// ---------- кадр ----------
// Плавная камера: одна непрерывная траектория по ключам, сплайн Эрмита (скорость без скачков).
// s — масштаб сцены, x/y — сдвиг сцены, bs/bx — масштаб и сдвиг бархата (параллакс и dolly zoom).
const CAM_KEYS=[
 // t     s     x     y    bs    bx
 [0    ,  .93, -150,   0, 1.14, -50],
 [3.5  , 1.00,    0,   0, 1.00,   0],
 [12   , 1.01,    0,   0, 1.00,   0],
 [18   , 1.05,    0,   0, 1.03,   0],
 [20   , 1.06,   20,   0, 1.05,  10],
 [21.8 , 1.18,  -40,   0, 1.08,  -6],
 [23   , 1.10,    0,   0, 1.12,   0],
 [25   , 1.12,    0,   0, 1.42,   0],
 [28   , 1.13,  -30,   0, 1.40, -14],
 [32   , 1.16,    0,   0, 1.30,   0],
 [34   , 1.02,    0,   0, 1.02,   0]];
function camera(t){const K=CAM_KEYS,n=K.length;let i=0;while(i<n-2&&t>K[i+1][0])i++;
  const t0=K[i][0],t1=K[i+1][0],h=t1-t0,u=cl((t-t0)/h);
  const tan=(j,c)=>{if(j<=0||j>=n-1)return 0;return (K[j+1][c]-K[j-1][c])/(K[j+1][0]-K[j-1][0]);};
  const H=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u;
    return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return{s:H(1),x:H(2),y:H(3),bs:H(4),bx:H(5)};}
const PIV=[GX,RIM-60],BPIV=[GX,1100];
function frame(t){const c=X;c.setTransform(1,0,0,1,0,0);const C=camera(t);
  c.fillStyle=BG;c.fillRect(0,0,W,H);
  c.save();c.translate(BPIV[0]+C.bx,BPIV[1]);c.scale(C.bs,C.bs);c.translate(-BPIV[0],-BPIV[1]);velvetBg(c,t);c.restore();
  const z=C.s;
  c.save();c.translate(PIV[0]+C.x,PIV[1]+C.y);c.scale(z,z);c.translate(-PIV[0],-PIV[1]);glassShadow(c);glassBack(c);
  const lvl=levelY(t,liquidMl(t)),L=liquid(t);
  drawLiquid(c,t,lvl,L);drawWedges(c,t);drawLeaves(c,t);drawIce(c,t,lvl);sprig(c,t);for(const s of STEPS)stream(c,t,s);muddler(c,t);
  glassFront(c,t,seg(t,bar(10),2),L,lvl);limeWheel(c,t);for(const s of STEPS)bottle(c,t,s);levelTags(c,t);
  c.restore();decoFrame(c);header(c,t);}
const D=(s)=>`${s}px Deco`, DL=(s,ls=8)=>`ls${ls} ${s}px Deco`, SC=(s)=>`${s}px Script`;
function rule(c,t,y,tIn,tOut,w=300){const p=eoe(seg(t,tIn,.5))*(1-eie(seg(t,tOut,.35)));if(p<=0)return;const hw2=w*p/2;
  c.save();c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.moveTo(GX-hw2,y);c.lineTo(GX-14,y);c.moveTo(GX+14,y);c.lineTo(GX+hw2,y);c.stroke();
  c.fillStyle=GOLD;c.translate(GX,y);c.rotate(Math.PI/4);c.fillRect(-6*p,-6*p,12*p,12*p);c.restore();}
function header(c,t){
  c.save();rr(c,76,84,110,56,4);c.strokeStyle=INK;c.lineWidth=2;c.stroke();txt(c,TX.age,131,123,D(32),INK);c.restore();
  // такт 1 — название
  rise(c,'COCKTAIL',GX,215,DL(40,16),SOFT,.1,bar(2)-.35,t,'center',60);
  rise(c,TX.t1,GX,420,SC(200),INK,.2,bar(2)-.32,t,'center',240);
  rule(c,t,480,.6,bar(2)-.3,420);
  rise(c,TX.sub,GX,545,DL(34,8),SOFT,.7,bar(2)-.28,t,'center',50);
  rise(c,TX.t2,GX,650,SC(84),GREEN,.9,bar(2)-.25,t,'center',100);
  // такт 2 — что нужно
  rise(c,TX.need,GX,240,DL(54,12),INK,bar(2),bar(3)-.3,t,'center',70);
  rule(c,t,290,bar(2)+.15,bar(3)-.3,360);
  [[TX.rum,ML(50)],[TX.soda,ML(100)],[TX.syr,ML(20)],[TX.mintList,''],[TX.iceList,'']].forEach(([n,a],i)=>{
    rise(c,n,150,380+i*86,D(52),INK,bar(2)+.5+i*.6,bar(3)-.3+i*.03,t,'left',70);
    if(a)rise(c,a,930,380+i*86,D(52),i===0?GREEN:INK,bar(2)+.6+i*.6,bar(3)-.3+i*.03,t,'right',70);});
  // шаги
  STEPS.forEach((s,i)=>{const a=bar(s.bar),out=bar(s.bar+1)-.3,hot=s.key==='rum';
    rise(c,TX.step(i+1),GX,220,DL(34,10),SOFT,a,out,t,'center',50);rule(c,t,250,a+.1,out,240);
    rise(c,s.amt,GX,420,D(s.ml?180:(s.amt.length>8?120:150)),hot?GREEN:INK,a+.05,out+.02,t,'center',180);
    rise(c,s.name,GX,520,SC(s.name.length>18?80:96),hot?INK:GREEN,a+.15,out+.04,t,'center',110);});
  // такты 11–12 — формула
  rise(c,TX.ratioT,GX,240,DL(40,10),SOFT,bar(11),bar(13)-.3,t,'center',60);
  rise(c,'50 · 20 · 100',GX,430,D(118),INK,bar(11)+.15,bar(13)-.28,t,'center',170);
  const ratio=[[TX.ratio[0],50,'#E9F1EC'],[TX.ratio[1],20,'#E9D9AE'],[TX.ratio[2],100,'#B9D3DA']];const U=780/170;let x=GX-390;
  ratio.forEach(([n,v,col],i)=>{const p=eoe(seg(t,bar(12)+i*.25,.5)),q=eie(seg(t,bar(13)-.3,.3));const w=v*U*p*(1-q);if(w<1)return;
    rr(c,x,500,Math.max(0,w-12),10,5);c.fillStyle=col;c.fill();if(p>.8&&q<.5)txt(c,n,x+(v*U-12)/2,560,D(v<30?28:34),INK);x+=v*U;});
  // такты 13–14 — название над готовым коктейлем
  rise(c,TX.name,GX,330,SC(140),INK,bar(13),bar(15)-.3,t,'center',160);
  rule(c,t,390,bar(13)+.2,bar(15)-.3,420);
  rise(c,TX.short,GX,450,DL(30,5),SOFT,bar(13)+.25,bar(15)-.28,t,'center',50);
  // такт 15 — финал
  rise(c,TX.save,GX,330,SC(130),GREEN,bar(15),99,t,'center',150);
  rule(c,t,390,bar(15)+.15,99,420);
  rise(c,TX.saveSub,GX,450,DL(34,6),INK,bar(15)+.2,99,t,'center',50);
  const wp=eoe(seg(t,bar(15)+.4,.4));if(wp>0){c.save();c.globalAlpha=wp;txt(c,TX.warn,GX,1860,DL(26,2),INK);c.restore();}
}
window.seek=async t=>frame(t);
window.ready=Promise.all([document.fonts.load('40px Deco'),document.fonts.load('40px Script')]);
