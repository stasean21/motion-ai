// Негрони — 34 с, 120 BPM. Всё считается от времени в seek(t).
const W=1080,H=1920,cv=document.getElementById('c'),X=cv.getContext('2d');
const INK='#F1E4CF',SOFT='#C9AE8E',RED='#E0473F',ORANGE='#F58A3A',BG='#2A0B12',BG2='#3D121C',GOLD='#D2AA62';
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
 ru:{ml:'мл',ice:'Лёд',iceSub:'один большой кубик',gin:'Джин',bit:'Биттер',ver:'Красный вермут',labels:{gin:'ДЖИН',bit:'БИТТЕР',ver:'ВЕРМУТ'},
  t1:'Негрони',t2:'Флоренция, 1919',sub:'ИТАЛЬЯНСКАЯ КЛАССИКА',need:'ПОНАДОБИТСЯ',iceList:'Лёд, цедра апельсина',step:(n)=>`ШАГ ${n} ИЗ 6`,
  stir:'Перемешать',stirSub:'20 секунд со льдом',peel:'Цедра',peelSub:'сбрызнуть над бокалом',ratioT:'ЗАПОМНИ ПРОПОРЦИЮ',ratio:['джин','биттер','вермут'],
  name:'Негрони',short:'ЛЁД · 30 · 30 · 30 · ЦЕДРА',save:'Сохрани рецепт',saveSub:'И ПРИГОТОВЬ НА ВЫХОДНЫХ',age:'18+',warn:'ЧРЕЗМЕРНОЕ УПОТРЕБЛЕНИЕ АЛКОГОЛЯ ВРЕДИТ ВАШЕМУ ЗДОРОВЬЮ'},
 en:{ml:'ml',ice:'Ice',iceSub:'one big cube',gin:'Gin',bit:'Bitter',ver:'Sweet vermouth',labels:{gin:'GIN',bit:'BITTER',ver:'VERMOUTH'},
  t1:'Negroni',t2:'Florence, 1919',sub:'THE ITALIAN CLASSIC',need:'YOU WILL NEED',iceList:'Ice, orange peel',step:(n)=>`STEP ${n} OF 6`,
  stir:'Stir',stirSub:'20 seconds on ice',peel:'Orange peel',peelSub:'express over the glass',ratioT:'REMEMBER THE RATIO',ratio:['gin','bitter','vermouth'],
  name:'Negroni',short:'ICE · 30 · 30 · 30 · PEEL',save:'Save this recipe',saveSub:'AND MAKE IT THIS WEEKEND',age:'18+',warn:'PLEASE DRINK RESPONSIBLY'}}[LANG];
const ML=n=>`${n} ${TX.ml}`;
// ---------- бокал рокс (олд фэшн), тяжёлое дно ----------
const GX=W/2,RIM=900,IB=1440,BOT=1560,RXO=280,BXO=256,WALL=12;
const ho=y=>lerp(RXO,BXO,(y-RIM)/(BOT-RIM)), hi=y=>ho(y)-WALL, halfAt=hi;
const ryOf=(y,rx)=>rx*lerp(.13,.17,(y-RIM)/(BOT-RIM)); // эллипс в перспективе: ниже — шире
const INNER=(()=>{const p=new Path2D();p.moveTo(GX-hi(RIM),RIM);p.lineTo(GX-hi(IB),IB);p.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,Math.PI,0,true);
  p.lineTo(GX+hi(RIM),RIM);p.ellipse(GX,RIM,hi(RIM),ryOf(RIM,hi(RIM)),0,0,-Math.PI,true);p.closePath();return p;})();
// большой кубик льда: низ на дне, сторона CS
const CS=280,CD=38,CX=GX-8,CB=IB+16,CUBE_TOP=CB-CS-CD/2;
// объём → уровень (лёд вытесняет жидкость)
const VOL=[];{let v=0;for(let y=IB;y>=RIM;y--){const h=hi(y);v+=Math.PI*h*h-(y>CB-CS?CS*CS:0);VOL[y]=v;}}
const FULL_ML=90,K=VOL[1192]/FULL_ML;
function levelY(ml){if(ml<=0)return IB;const tg=ml*K;let y=IB;while(y>RIM&&VOL[y]<tg)y--;return y;}
// ---------- рецепт и тайминг ----------
const STEPS=[
 {key:'ice',bar:3,name:TX.iceSub,amt:TX.ice},
 {key:'gin',bar:4,name:TX.gin,amt:ML(30),ml:30},
 {key:'bit',bar:5,name:TX.bit,amt:ML(30),ml:30},
 {key:'ver',bar:6,name:TX.ver,amt:ML(30),ml:30}];
const POUR=s=>[bar(s.bar)+.25,1.35];
function poured(t){let ml=0;for(const s of STEPS){if(!s.ml)continue;const[a,d]=POUR(s);ml+=s.ml*eio(seg(t,a,d));}return ml;}
const liquidMl=poured;
// цвет: прозрачный джин → алый биттер → рубиновый после вермута
function liquid(t){const b=eio(seg(t,POUR(STEPS[2])[0]+.2,1.6)),v=eio(seg(t,POUR(STEPS[3])[0]+.2,1.6)),st=eio(seg(t,bar(7)+.2,1.4));
  let c=mixC('D8E4E0','B8102A',b);c=mixC(c,'5E0A14',v*.5);c=mixC(c,'8A0E1E',st*.5);return{col:'#'+c,a:lerp(.2,.94,b)};}
// ---------- рисование ----------
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function txt(c,s,x,y,font,col,al='center'){let ls=0;const m=font.match(/^ls(\d+) /);if(m){ls=+m[1];font=font.slice(m[0].length);}c.font=font;c.letterSpacing=ls+'px';c.fillStyle=col;c.textAlign=al;c.fillText(s,x+(al==='center'?ls/2:0),y);c.letterSpacing='0px';}
function rise(c,s,x,y,font,col,tIn,tOut,t,al='center',h=120){const pi=eoe(seg(t,tIn,.45)),po=eie(seg(t,tOut,.35));if(pi<=0||po>=1)return;
  c.save();c.beginPath();c.rect(0,y-h,W,h*1.28);c.clip();txt(c,s,x,y+(1-pi)*h-po*h,font,col,al);c.restore();}
function velvetBg(c,t){const g=c.createRadialGradient(GX,1100,60,GX,1100,1100);g.addColorStop(0,BG2);g.addColorStop(1,BG);c.fillStyle=g;c.fillRect(-600,-600,W+1200,H+1200);
  // ворс бархата: мягкие вертикальные складки
  for(let i=-8;i<22;i++){const x=i*80+40,a=.05+.04*Math.sin(i*1.7);const v=c.createLinearGradient(x-40,0,x+40,0);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.5,`rgba(255,180,190,${a*.35})`);v.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=v;c.fillRect(x-40,-600,80,H+1200);}}
function glassShadow(c){const sh=c.createRadialGradient(GX,BOT+6,5,GX,BOT+6,330);sh.addColorStop(0,'rgba(0,0,0,.5)');sh.addColorStop(1,'rgba(0,0,0,0)');c.save();c.translate(GX,BOT+6);c.scale(1,.16);c.fillStyle=sh;c.beginPath();c.arc(0,0,330,0,7);c.fill();c.restore();}
function decoFrame(c){// рамка ар-деко
  c.strokeStyle=GOLD;c.globalAlpha=.85;c.lineWidth=2;c.strokeRect(40,40,W-80,H-80);c.lineWidth=1;c.strokeRect(54,54,W-108,H-108);
  c.save();c.translate(GX,54);for(let r=30;r<=110;r+=20){c.beginPath();c.arc(0,0,r,0,Math.PI);c.stroke();}for(let k=0;k<=8;k++){const a=k/8*Math.PI;c.beginPath();c.moveTo(Math.cos(a)*30,Math.sin(a)*30);c.lineTo(Math.cos(a)*110,Math.sin(a)*110);c.stroke();}c.restore();
  [[54,54,1,1],[W-54,54,-1,1],[54,H-54,1,-1],[W-54,H-54,-1,-1]].forEach(([x,y,sx,sy])=>{c.save();c.translate(x,y);c.scale(sx,sy);c.beginPath();c.moveTo(0,70);c.lineTo(70,0);c.moveTo(0,40);c.lineTo(40,0);c.stroke();c.restore();});
  c.globalAlpha=1;}
// задняя половина бокала: дальний край, толща стенок
function glassBack(c){c.save();c.fillStyle='rgba(255,255,255,.035)';c.fill(INNER);
  c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2.5;c.beginPath();c.ellipse(GX,RIM,RXO,ryOf(RIM,RXO),0,Math.PI,2*Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.22)';c.lineWidth=1.5;c.beginPath();c.ellipse(GX,RIM,hi(RIM),ryOf(RIM,hi(RIM)),0,Math.PI,2*Math.PI);c.stroke();
  c.beginPath();c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,Math.PI,2*Math.PI);c.stroke();c.restore();}
function basePath(c){c.beginPath();c.moveTo(GX-ho(IB),IB);c.lineTo(GX-BXO,BOT);c.ellipse(GX,BOT,BXO,ryOf(BOT,BXO),0,Math.PI,0,true);c.lineTo(GX+ho(IB),IB);c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,0,Math.PI,false);c.closePath();}
function glassFront(c,t,drops,L,lvl){
  // толстое дно: стекло подсвечено цветом напитка
  basePath(c);const bg=c.createLinearGradient(0,IB,0,BOT+40);bg.addColorStop(0,'rgba(255,255,255,.10)');bg.addColorStop(1,'rgba(255,255,255,.24)');c.fillStyle=bg;c.fill();
  if(lvl<IB-2){c.save();c.globalAlpha=.32*L.a;c.fillStyle=L.col;c.fill();c.restore();}
  c.save();basePath(c);c.clip();c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=2;for(let x=GX-BXO;x<=GX+BXO;x+=36){c.beginPath();c.moveTo(x,IB);c.lineTo(x+(x-GX)*.06,BOT+40);c.stroke();}
  c.strokeStyle='rgba(255,255,255,.3)';c.beginPath();c.ellipse(GX,BOT-28,BXO-34,ryOf(BOT,BXO-34),0,0,7);c.stroke();c.restore();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=3;c.beginPath();c.ellipse(GX,BOT,BXO,ryOf(BOT,BXO),0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;c.beginPath();c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,0,Math.PI);c.stroke();
  // стенки: внешний и внутренний край, толща между ними
  for(const sd of[-1,1]){c.fillStyle='rgba(255,255,255,.10)';c.beginPath();c.moveTo(GX+sd*RXO,RIM);c.lineTo(GX+sd*BXO,BOT);c.lineTo(GX+sd*hi(IB),IB);c.lineTo(GX+sd*hi(RIM),RIM);c.closePath();c.fill();
    const g=c.createLinearGradient(0,RIM,0,BOT);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.6,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,.85)');
    c.strokeStyle=g;c.lineWidth=3.5;c.beginPath();c.moveTo(GX+sd*RXO,RIM);c.lineTo(GX+sd*BXO,BOT);c.stroke();
    c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=1.5;c.beginPath();c.moveTo(GX+sd*hi(RIM),RIM);c.lineTo(GX+sd*hi(IB),IB);c.stroke();}
  // блики
  const hl=(x0,w,a,y0,y1)=>{const h=c.createLinearGradient(x0,0,x0+w,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.5,`rgba(255,255,255,${a})`);h.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=h;c.fillRect(x0,y0,w,y1-y0);};
  hl(GX-RXO+24,40,.26,RIM+34,BOT-20);hl(GX-RXO+74,14,.14,RIM+60,IB-30);hl(GX+RXO-52,20,.16,RIM+40,BOT-30);
  // передний край: кольцо толщины стенки
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=3;c.beginPath();c.ellipse(GX,RIM,RXO,ryOf(RIM,RXO),0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=1.5;c.beginPath();c.ellipse(GX,RIM,hi(RIM),ryOf(RIM,hi(RIM)),0,0,Math.PI);c.stroke();
  // конденсат
  if(drops>0){for(let i=0;i<70;i++){const y=RIM+40+hash(i)*(BOT-RIM-70),side=hash(i+90)*2-1,x=GX+side*(ho(y)-14)*.96;const a=cl(drops*3-hash(i+5)*2);if(a<=0)continue;
    const rx=2.5+hash(i+7)*3,ry=3.5+hash(i+8)*5;c.fillStyle=`rgba(40,0,8,${.35*a})`;c.beginPath();c.ellipse(x+.8,y+1.5,rx,ry,0,0,7);c.fill();
    c.fillStyle=`rgba(255,240,235,${.32*a})`;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.fillStyle=`rgba(255,255,255,${.9*a})`;c.beginPath();c.arc(x-rx*.35,y-ry*.4,1.2,0,7);c.fill();}}}
// лёд: один большой прозрачный кубик
function cubeState(t){const t0=bar(3)+.2;if(t<t0)return null;const dt=t-t0,fallT=.34;let y;
  if(dt<fallT)y=lerp(700,CB,(dt/fallT)**2);else y=CB-26*Math.exp(-(dt-fallT)*7)*Math.abs(Math.sin((dt-fallT)*14));
  let x=CX,r=dt<fallT?(1-dt/fallT)*.25:-.035*Math.exp(-(dt-fallT)*4)*Math.cos((dt-fallT)*12);
  const st=seg(t,bar(7)+.2,1.5);if(st>0&&st<1){const a=st*Math.PI*4,f=Math.sin(st*Math.PI);x+=Math.sin(a)*9*f;r+=Math.sin(a+1)*.035*f;}
  return{x,y,r};}
function cubeShape(c,s,d){const b=8;c.beginPath();c.moveTo(-s/2+12,-s-d);c.lineTo(s/2-12,-s-d);c.quadraticCurveTo(s/2,-s-d,s/2,-s);c.lineTo(s/2,-b);c.quadraticCurveTo(s/2,0,s/2-b,0);c.lineTo(-s/2+b,0);c.quadraticCurveTo(-s/2,0,-s/2,-b);c.lineTo(-s/2,-s);c.quadraticCurveTo(-s/2,-s-d,-s/2+12,-s-d);c.closePath();}
function cubeArt(c,k){const s=CS,d=CD;cubeShape(c,s,d);const g=c.createLinearGradient(0,-s,0,0);g.addColorStop(0,`rgba(255,255,255,${.30*k})`);g.addColorStop(1,`rgba(220,235,245,${.12*k})`);c.fillStyle=g;c.fill();
  c.save();cubeShape(c,s,d);c.clip();const fr=c.createRadialGradient(-10,-s*.45,10,-10,-s*.45,s*.55);fr.addColorStop(0,`rgba(255,255,255,${.22*k})`);fr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=fr;c.fillRect(-s,-s*1.3,s*2,s*1.4);
  c.strokeStyle=`rgba(255,255,255,${.35*k})`;c.lineWidth=1.5;c.beginPath();c.moveTo(-60,-150);c.lineTo(-10,-110);c.lineTo(30,-128);c.moveTo(-10,-110);c.lineTo(-4,-60);c.stroke();
  for(let i=0;i<14;i++){c.fillStyle=`rgba(255,255,255,${.5*k})`;c.beginPath();c.arc((hash(i+40)-.5)*s*.7,-s*.2-hash(i+60)*s*.6,1.5+hash(i+80)*2.5,0,7);c.fill();}c.restore();
  c.fillStyle=`rgba(255,255,255,${.4*k})`;c.beginPath();c.moveTo(-s/2+12,-s-d);c.lineTo(s/2-12,-s-d);c.quadraticCurveTo(s/2,-s-d,s/2,-s);c.lineTo(-s/2,-s);c.quadraticCurveTo(-s/2,-s-d,-s/2+12,-s-d);c.fill();
  cubeShape(c,s,d);c.lineWidth=3;c.strokeStyle=`rgba(255,255,255,${.9*k})`;c.stroke();
  c.lineWidth=2;c.strokeStyle=`rgba(255,255,255,${.6*k})`;c.beginPath();c.moveTo(-s/2+4,-s);c.lineTo(s/2-4,-s);c.stroke();
  rr(c,-s/2+16,-s+14,s-32,s-30,14);c.strokeStyle=`rgba(255,255,255,${.25*k})`;c.lineWidth=1.5;c.stroke();
  c.fillStyle=`rgba(255,255,255,${.85*k})`;c.beginPath();c.ellipse(-s/4,-s*.78,18,6,-.5,0,7);c.fill();}
function drawIce(c,t,lvl){const p=cubeState(t);if(!p)return;
  const put=()=>{c.translate(p.x,p.y);c.rotate(p.r);};
  // над жидкостью — яркий, под ней — приглушённый
  c.save();c.beginPath();c.rect(0,600,W,Math.max(0,lvl-600));c.clip();put();cubeArt(c,1);c.restore();
  if(lvl<IB){c.save();c.beginPath();c.rect(0,lvl,W,H);c.clip();put();cubeArt(c,.5);c.restore();
    // мениск поперёк кубика
    c.save();c.clip(INNER);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2;c.beginPath();c.ellipse(GX,lvl,hi(lvl),ryOf(lvl,hi(lvl)),0,0,Math.PI);c.stroke();c.restore();}}
function drawLiquid(c,t,lvl,L){if(lvl>=IB-2)return;const h=hi(lvl),ry=ryOf(lvl,h);c.save();
  c.beginPath();c.moveTo(GX-h,lvl);c.lineTo(GX-hi(IB),IB);c.ellipse(GX,IB,hi(IB),ryOf(IB,hi(IB)),0,Math.PI,0,true);c.lineTo(GX+h,lvl);c.ellipse(GX,lvl,h,ry,0,0,Math.PI,false);c.closePath();
  c.globalAlpha=L.a;c.fillStyle=L.col;c.fill();c.globalAlpha=1;
  c.save();c.clip();const g=c.createLinearGradient(0,lvl,0,IB+30);g.addColorStop(0,'rgba(255,255,255,.04)');g.addColorStop(1,`rgba(30,0,4,${.55*L.a})`);c.fillStyle=g;c.fillRect(0,lvl-ry,W,IB-lvl+ry*3);
  // шлейфы: биттер и вермут уходят вниз в прозрачном джине
  [[2,'#C8142E',.85],[3,'#6E1018',.7]].forEach(([i,col,al])=>{const[a]=POUR(STEPS[i]);const pl=seg(t,a+.1,1.9);if(pl<=0||pl>=1)return;c.globalAlpha=al*(1-pl);c.fillStyle=col;
    for(let k=0;k<6;k++){const yy=lerp(lvl+20,IB-30,eoe(pl)*(.45+k*.1)),xx=GX+30+Math.sin(k*1.9+pl*4)*70;c.beginPath();c.ellipse(xx,yy,60+k*12,26+k*6,0,0,7);c.fill();}c.globalAlpha=1;});
  // мелкие пузырьки только пока льётся
  const pourAct=STEPS.slice(1).reduce((m,s)=>{const[a,d]=POUR(s);return Math.max(m,seg(t,a,.2)*(1-seg(t,a+d,.8)));},0);
  if(pourAct>0)for(let i=0;i<26;i++){const sp=60+hash(i)*90,ph=hash(i+3)*10;const y=IB-((t*sp+ph*120)%(IB-lvl+20));if(y<lvl+8)continue;const x=GX+30+(hash(i+11)*2-1)*90;c.fillStyle=`rgba(255,255,255,${.5*pourAct})`;c.beginPath();c.arc(x,y,1.5+hash(i+4)*2.5,0,7);c.fill();}
  c.restore();
  // поверхность сверху
  c.globalAlpha=Math.min(1,L.a+.1);c.fillStyle=L.col;c.beginPath();c.ellipse(GX,lvl,h,ry,0,0,7);c.fill();c.globalAlpha=1;
  c.fillStyle=`rgba(255,255,255,${lerp(.1,.07,L.a)})`;c.beginPath();c.ellipse(GX,lvl,h,ry,0,0,7);c.fill();
  c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();c.ellipse(GX,lvl,h,ry,0,0,Math.PI);c.stroke();c.restore();}
// бутылки без брендов: джин, биттер, вермут
const MOUTH=[GX+30,700];
function bottleShape(c,k){c.beginPath();
  if(k==='gin'){c.moveTo(0,-13);c.lineTo(100,-14);c.quadraticCurveTo(128,-15,140,-40);c.quadraticCurveTo(150,-64,190,-64);c.lineTo(640,-64);c.quadraticCurveTo(650,-64,650,-54);c.lineTo(650,54);c.quadraticCurveTo(650,64,640,64);c.lineTo(190,64);c.quadraticCurveTo(150,64,140,40);c.quadraticCurveTo(128,15,100,14);c.lineTo(0,13);}
  else if(k==='ver'){c.moveTo(0,-15);c.lineTo(150,-17);c.bezierCurveTo(230,-20,250,-66,330,-68);c.lineTo(720,-68);c.lineTo(720,68);c.lineTo(330,68);c.bezierCurveTo(250,66,230,20,150,17);c.lineTo(0,15);}
  else{c.moveTo(0,-14);c.lineTo(110,-15);c.bezierCurveTo(150,-17,170,-60,230,-62);c.lineTo(640,-62);c.quadraticCurveTo(660,-62,660,-42);c.lineTo(660,42);c.quadraticCurveTo(660,62,640,62);c.lineTo(230,62);c.bezierCurveTo(170,60,150,17,110,15);c.lineTo(0,14);}
  c.closePath();}
function bottle(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const p=eoe(seg(t,a-.45,.4)),q=eie(seg(t,a+d+.05,.4));if(p<=0||q>=1)return;
  const tilt=lerp(-.04,-.16,eio(seg(t,a-.25,.3)))*(1-eio(seg(t,a+d,.3)));const k=s.key;
  c.save();c.translate(MOUTH[0]+(1-p)*600+q*600,MOUTH[1]);c.rotate(tilt);
  const pal={gin:['#3E5A57','#A9C9C3','#EEF8F5'],bit:['#3E0510','#B3112B','#FF7486'],ver:['#1E0705','#5A1610','#B5604A']}[k];
  bottleShape(c,k);const g=c.createLinearGradient(0,-70,0,70);g.addColorStop(0,pal[0]);g.addColorStop(.22,pal[2]);g.addColorStop(.38,pal[1]);g.addColorStop(.8,pal[0]);g.addColorStop(1,pal[0]);c.fillStyle=g;c.fill();
  if(k==='gin'){c.globalAlpha=.55;c.fillStyle='rgba(255,255,255,.3)';c.fill();c.globalAlpha=1;}
  c.save();bottleShape(c,k);c.clip();c.fillStyle='rgba(255,255,255,.55)';c.fillRect(30,-9,100,4);c.fillRect(k==='ver'?340:220,k==='ver'?-54:-52,300,7);c.restore();
  // горлышко: капсула / крышка
  if(k==='ver'){const f=c.createLinearGradient(0,-20,0,20);f.addColorStop(0,'#5A1010');f.addColorStop(.3,'#C9505A');f.addColorStop(1,'#3A0808');c.fillStyle=f;c.beginPath();c.moveTo(-6,-18);c.lineTo(120,-19);c.lineTo(120,19);c.lineTo(-6,18);c.closePath();c.fill();
    c.fillStyle=GOLD;c.fillRect(104,-19,8,38);}
  else{c.fillStyle=k==='gin'?'#C9CDD1':'#E9CF8E';rr(c,-8,-15,18,30,4);c.fill();}
  // этикетка без бренда
  const L=k==='ver'?[400,-58,220,116]:k==='bit'?[300,-52,240,104]:[280,-50,240,100];
  rr(c,L[0],L[1],L[2],L[3],6);c.fillStyle='#F3E6CC';c.fill();c.strokeStyle=GOLD;c.lineWidth=2;c.strokeRect(L[0]+7,L[1]+7,L[2]-14,L[3]-14);
  c.save();c.translate(L[0]+L[2]/2,L[1]+L[3]/2);c.rotate(Math.PI/4);c.fillStyle=GOLD;c.fillRect(-5,-5,10,10);c.restore();
  c.font=`${TX.labels[k].length>6?22:26}px Deco`;c.letterSpacing='4px';c.fillStyle='#4A1A12';c.textAlign='center';
  c.fillText(TX.labels[k],L[0]+L[2]/2+2,L[1]+L[3]/2-14);c.letterSpacing='0px';c.restore();}
// поток бьёт в верх кубика
function stream(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const end=a+d;if(t<a-.05||t>end+.4)return;const lvl=Math.min(levelY(liquidMl(t)),CUBE_TOP+12),S0=MOUTH[1]+4;
  const head=t<a+.25?lerp(S0,lvl,eie(seg(t,a-.05,.3))):lvl,tail=t>end?lerp(S0,lvl,eie(seg(t,end,.35))):S0;if(head<=tail)return;
  const col=s.key==='gin'?'rgba(235,244,240,.8)':s.key==='bit'?'#C8142E':'#6A1712';const x=MOUTH[0];
  c.save();c.beginPath();const N=20;for(let i=0;i<=N;i++){const y=lerp(tail,head,i/N),w=lerp(9,6,i/N)+Math.sin(y*.05+t*30)*1;c[i?'lineTo':'moveTo'](x-w+Math.sin(y*.02+t*8)*1.5,y);}
  for(let i=N;i>=0;i--){const y=lerp(tail,head,i/N),w=lerp(9,6,i/N)+Math.sin(y*.05+t*30+1)*1;c.lineTo(x+w+Math.sin(y*.02+t*8)*1.5,y);}c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.5;c.stroke();
  // брызги о лёд
  if(head>=lvl-1){for(let i=0;i<8;i++){const ph=(t*3+hash(i))%1,ang=-Math.PI/2+(hash(i+20)-.5)*2.4;c.globalAlpha=.7*(1-ph);c.fillStyle=col;c.beginPath();c.arc(x+Math.cos(ang)*ph*50,lvl+Math.sin(ang)*ph*34+ph*ph*30,3,0,7);c.fill();}c.globalAlpha=1;}
  c.restore();}
function spoon(c,t){const a=bar(7),p=seg(t,a,2);if(p<=0||p>=1)return;const inP=eoe(seg(t,a,.4)),outP=eie(seg(t,a+1.65,.35));const y=lerp(-200,740,inP)-outP*1100;const ang=seg(t,a+.3,1.4)*Math.PI*6;const x=GX+185+Math.sin(ang)*26;
  c.save();c.translate(x,y);c.rotate(Math.sin(ang)*.05);const g=c.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#8E7A55');g.addColorStop(.5,'#F1DDA6');g.addColorStop(1,'#8E7A55');
  c.fillStyle=g;c.fillRect(-5,0,10,560);for(let k=0;k<10;k++){c.fillStyle='rgba(90,70,30,.5)';c.fillRect(-5,60+k*14,10,3);}c.beginPath();c.ellipse(0,570,14,22,0,0,7);c.fill();c.restore();}
// цедра: прилетает, скручивается над бокалом (брызги масел), ложится на край
const PEEL_H=[GX+40,770],PEEL_F=[GX+200,RIM-4];
function peel(c,t){const a=bar(8);if(t<a)return;const pin=eoe(seg(t,a,.55)),tw=seg(t,a+.5,.55),dt=t-a-1.1,d=dt>0?spring(dt,1.5,.6):0;
  let x=lerp(GX+560,PEEL_H[0],pin),y=lerp(620,PEEL_H[1],pin),rot=lerp(.9,-.25,pin);
  if(dt>0){x=lerp(PEEL_H[0],PEEL_F[0],cl(d,0,1.15));y=lerp(PEEL_H[1],PEEL_F[1],cl(d,0,1.15));rot=lerp(-.25,.42,cl(d,0,1.1));}
  // брызги эфирного масла
  for(let i=0;i<46;i++){const te=a+.62+hash(i)*.35,l=t-te;if(l<0||l>.8)continue;const ang=Math.PI/2+(hash(i+9)-.5)*1.3,v=220+hash(i+17)*260;
    c.fillStyle=`rgba(255,196,96,${.8*(1-l/.8)})`;c.beginPath();c.arc(PEEL_H[0]+(hash(i+3)-.5)*120+Math.cos(ang)*v*l,PEEL_H[1]+Math.sin(ang)*v*l+180*l*l,1.6+hash(i+5)*2.2,0,7);c.fill();}
  const sy=Math.cos(eio(tw)*Math.PI*2),sx=1-.12*Math.sin(tw*Math.PI);const L=250,w=74;
  // серп: изогнутая полоска с сужающимися концами
  const shape=()=>{c.beginPath();const N=24,pt=(i,sd)=>{const u=i/N*2-1,x=u*L/2,yc=u*u*26-13,hw=w/2*Math.pow(1-u*u,.6)+3;return[x,yc+sd*hw];};
    for(let i=0;i<=N;i++)c[i?'lineTo':'moveTo'](...pt(i,-1));for(let i=N;i>=0;i--)c.lineTo(...pt(i,1));c.closePath();};
  c.save();c.translate(x,y);c.rotate(rot);c.scale(sx,Math.max(.08,Math.abs(sy)));shape();
  if(sy>=0){const g=c.createLinearGradient(0,-w/2,0,w/2);g.addColorStop(0,'#FFB04A');g.addColorStop(.45,'#F07E16');g.addColorStop(1,'#A84406');c.fillStyle=g;c.fill();c.strokeStyle='#FCE7C4';c.lineWidth=3;c.stroke();
    c.save();shape();c.clip();for(let i=0;i<70;i++){c.fillStyle='rgba(140,50,0,.32)';c.beginPath();c.arc((hash(i+100)-.5)*L,(hash(i+130)-.5)*w+((hash(i+100)-.5)*2)**2*26-13,1.5,0,7);c.fill();}
    c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=5;c.lineCap='round';c.beginPath();for(let i=4;i<=14;i++){const u=i/24*2-1;c[i>4?'lineTo':'moveTo'](u*L/2,u*u*26-13-w*.22);}c.stroke();c.restore();}
  else{c.fillStyle='#F7E5C4';c.fill();c.strokeStyle='#E8892A';c.lineWidth=4;c.stroke();}
  c.restore();}
function tagLayout(){let acc=0,prev=1e9;return STEPS.slice(1).map(s=>{acc+=s.ml;const ly=levelY(acc);const ty=Math.min(ly,prev-56);prev=ty;return{s,ly,ty};});}
let TAGS=null;
function levelTags(c,t){TAGS=TAGS||tagLayout();const fade=1-seg(t,bar(8),.4);if(fade<=0)return;
  for(const{s,ly,ty}of TAGS){const[a,d]=POUR(s);const p=eoe(seg(t,a+d-.2,.4));if(p<=0)continue;const x0=GX+ho(ly)+10;
    c.save();c.globalAlpha=fade;c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.moveTo(x0,ly);c.lineTo(x0+20,ty);c.lineTo(lerp(x0+20,x0+36,p),ty);c.stroke();
    c.beginPath();c.rect(x0+40,ty-46,W,60);c.clip();txt(c,s.amt,x0+44,ty+14+(1-p)*50,'40px Deco',s.key==='bit'?RED:INK,'left');c.restore();}}
// ---------- кадр ----------
// Плавная камера: одна непрерывная траектория по ключам, сплайн Эрмита (скорость без скачков).
// s — масштаб сцены, x/y — сдвиг сцены, bs/bx — масштаб и сдвиг бархата (параллакс и dolly zoom).
const CAM_KEYS=[
 // t     s     x     y    bs    bx
 [0    ,  .93, -150,   0, 1.14, -50],
 [3.5  , 1.00,    0,   0, 1.00,   0],
 [10   , 1.01,    0,   0, 1.00,   0],
 [16   , 1.07,    0,   0, 1.04,   0],
 [17.5 , 1.08,   20,   0, 1.05,  10],
 [19.6 , 1.22,  -60,   0, 1.08,  -6],
 [21   , 1.12,    0,   0, 1.10,   0],
 [24   , 1.14,    0,   0, 1.42,   0],
 [28   , 1.15,  -40,   0, 1.40, -14],
 [32   , 1.20,    0,   0, 1.30,   0],
 [34   , 1.02,    0,   0, 1.02,   0]];
function camera(t){const K=CAM_KEYS,n=K.length;let i=0;while(i<n-2&&t>K[i+1][0])i++;
  const t0=K[i][0],t1=K[i+1][0],h=t1-t0,u=cl((t-t0)/h);
  const tan=(j,c)=>{if(j<=0||j>=n-1)return 0;return (K[j+1][c]-K[j-1][c])/(K[j+1][0]-K[j-1][0]);};
  const H=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u;
    return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return{s:H(1),x:H(2),y:H(3),bs:H(4),bx:H(5)};}
// опора масштаба — у края бокала, чтобы текст сверху не перекрывался
const PIV=[GX,RIM-60],BPIV=[GX,1100];
function frame(t){const c=X;c.setTransform(1,0,0,1,0,0);const C=camera(t);
  c.fillStyle=BG;c.fillRect(0,0,W,H);
  c.save();c.translate(BPIV[0]+C.bx,BPIV[1]);c.scale(C.bs,C.bs);c.translate(-BPIV[0],-BPIV[1]);velvetBg(c,t);c.restore();
  const z=C.s;
  c.save();c.translate(PIV[0]+C.x,PIV[1]+C.y);c.scale(z,z);c.translate(-PIV[0],-PIV[1]);glassShadow(c);glassBack(c);
  const lvl=levelY(liquidMl(t)),L=liquid(t);
  drawLiquid(c,t,lvl,L);drawIce(c,t,lvl);for(const s of STEPS)stream(c,t,s);spoon(c,t);
  glassFront(c,t,seg(t,bar(9),2),L,lvl);peel(c,t);for(const s of STEPS)bottle(c,t,s);levelTags(c,t);
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
  rise(c,TX.t2,GX,650,SC(80),RED,.9,bar(2)-.25,t,'center',100);
  // такт 2 — что нужно
  rise(c,TX.need,GX,240,DL(54,12),INK,bar(2),bar(3)-.3,t,'center',70);
  rule(c,t,290,bar(2)+.15,bar(3)-.3,360);
  [[TX.gin,ML(30)],[TX.bit,ML(30)],[TX.ver,ML(30)],[TX.iceList,'']].forEach(([n,a],i)=>{
    rise(c,n,150,380+i*86,D(52),INK,bar(2)+.5+i*.7,bar(3)-.3+i*.03,t,'left',70);
    if(a)rise(c,a,930,380+i*86,D(52),i===1?RED:INK,bar(2)+.6+i*.7,bar(3)-.3+i*.03,t,'right',70);});
  // шаги
  const step=(n,a,out)=>{rise(c,TX.step(n),GX,220,DL(34,10),SOFT,a,out,t,'center',50);rule(c,t,250,a+.1,out,240);};
  STEPS.forEach((s,i)=>{const a=bar(s.bar),out=bar(s.bar+1)-.3;step(i+1,a,out);
    rise(c,s.amt,GX,420,D(s.key==='ice'?170:180),s.key==='bit'?RED:INK,a+.05,out+.02,t,'center',180);
    rise(c,s.name,GX,520,SC(96),s.key==='bit'?INK:RED,a+.15,out+.04,t,'center',110);});
  step(5,bar(7),bar(8)-.3);
  rise(c,TX.stir,GX,410,D(120),INK,bar(7)+.05,bar(8)-.28,t,'center',130);
  rise(c,TX.stirSub,GX,515,SC(84),RED,bar(7)+.15,bar(8)-.26,t,'center',100);
  step(6,bar(8),bar(9)-.3);
  rise(c,TX.peel,GX,410,D(LANG==='ru'?130:110),ORANGE,bar(8)+.05,bar(9)-.28,t,'center',140);
  rise(c,TX.peelSub,GX,515,SC(84),INK,bar(8)+.15,bar(9)-.26,t,'center',100);
  // такты 11–12 — пропорция
  rise(c,TX.ratioT,GX,240,DL(40,10),SOFT,bar(11),bar(13)-.3,t,'center',60);
  rise(c,'1 : 1 : 1',GX,430,D(190),INK,bar(11)+.15,bar(13)-.28,t,'center',190);
  const ratio=[[TX.ratio[0],1,'#DCE6DE'],[TX.ratio[1],1,RED],[TX.ratio[2],1,'#B8643E']];let x=GX-390;
  ratio.forEach(([n,v,col],i)=>{const p=eoe(seg(t,bar(12)+i*.25,.5)),q=eie(seg(t,bar(13)-.3,.3));const w=v*260*(p)*(1-q);if(w<1)return;
    rr(c,x,500,Math.max(0,w-12),10,5);c.fillStyle=col;c.fill();if(p>.8&&q<.5)txt(c,n,x+(v*260-12)/2,560,D(34),INK);x+=v*260;});
  // такты 13–14 — название над готовым коктейлем
  rise(c,TX.name,GX,330,SC(140),INK,bar(13),bar(15)-.3,t,'center',160);
  rule(c,t,390,bar(13)+.2,bar(15)-.3,420);
  rise(c,TX.short,GX,450,DL(34,6),SOFT,bar(13)+.25,bar(15)-.28,t,'center',50);
  // такт 15 — финал
  rise(c,TX.save,GX,330,SC(130),RED,bar(15),99,t,'center',150);
  rule(c,t,390,bar(15)+.15,99,420);
  rise(c,TX.saveSub,GX,450,DL(34,6),INK,bar(15)+.2,99,t,'center',50);
  const wp=eoe(seg(t,bar(15)+.4,.4));if(wp>0){c.save();c.globalAlpha=wp;txt(c,TX.warn,GX,1860,DL(26,2),INK);c.restore();}
}
window.seek=async t=>frame(t);
window.ready=Promise.all([document.fonts.load('40px Deco'),document.fonts.load('40px Script')]);
