// Апероль Шприц — 30 с, 120 BPM, 15 тактов. Всё считается от времени в seek(t).
const W=1080,H=1920,cv=document.getElementById('c'),X=cv.getContext('2d');
const INK='#F1E4CF',SOFT='#C9AE8E',ORANGE='#F58A3A',BG='#2A0B12',BG2='#3D121C',GOLD='#D2AA62';
const BAR=2; const bar=n=>(n-1)*BAR; // начало такта n
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), lerp=(a,b,p)=>a+(b-a)*p, seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2, eoe=p=>p>=1?1:1-Math.pow(2,-10*p), eie=p=>p<=0?0:Math.pow(2,10*p-10);
function spring(t,f=2,z=.7){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const mixC=(a,b,p)=>{const A=a.match(/\w\w/g).map(h=>parseInt(h,16)),B=b.match(/\w\w/g).map(h=>parseInt(h,16));return`rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],p))).join(',')})`;};
// ---------- язык: index.html?lang=en ----------
const LANG=new URLSearchParams(location.search).get('lang')||'ru';
const TX={
 ru:{ml:'мл',ice:'Лёд',iceSub:'кубики доверху',pro:'Просекко',ape:'Апероль',soda:'Содовая',labels:{pro:'ИГРИСТОЕ',ape:'АПЕРИТИВ',soda:'СОДОВАЯ'},
  t1:'Апероль',t2:'Шприц',sub:'ИТАЛЬЯНСКИЙ АПЕРИТИВ',need:'ПОНАДОБИТСЯ',iceList:'Лёд, долька апельсина',step:(n)=>`ШАГ ${n} ИЗ 6`,
  stir:'Перемешать',stirSub:'один круг ложкой',orange:'Апельсин',orangeSub:'долька в бокал',ratioT:'ЗАПОМНИ ПРОПОРЦИЮ',ratio:['просекко','апероль','содовая'],
  name:'Апероль Шприц',short:'ЛЁД · 90 · 60 · 30 · АПЕЛЬСИН',save:'Сохрани рецепт',saveSub:'И ПРИГОТОВЬ НА ВЫХОДНЫХ',age:'18+',warn:'ЧРЕЗМЕРНОЕ УПОТРЕБЛЕНИЕ АЛКОГОЛЯ ВРЕДИТ ВАШЕМУ ЗДОРОВЬЮ'},
 en:{ml:'ml',ice:'Ice',iceSub:'fill to the top',pro:'Prosecco',ape:'Aperol',soda:'Soda',labels:{pro:'SPARKLING',ape:'APERITIF',soda:'SODA'},
  t1:'Aperol',t2:'Spritz',sub:'THE ITALIAN APERITIVO',need:'YOU WILL NEED',iceList:'Ice, orange slice',step:(n)=>`STEP ${n} OF 6`,
  stir:'Stir',stirSub:'one gentle turn',orange:'Orange',orangeSub:'a slice in the glass',ratioT:'REMEMBER THE RATIO',ratio:['prosecco','aperol','soda'],
  name:'Aperol Spritz',short:'ICE · 90 · 60 · 30 · ORANGE',save:'Save this recipe',saveSub:'AND MAKE IT THIS WEEKEND',age:'18+',warn:'PLEASE DRINK RESPONSIBLY'}}[LANG];
const ML=n=>`${n} ${TX.ml}`;
// ---------- бокал (с фото) ----------
const GIMG=new Image();GIMG.src=window.GLASS_IMG;
const S=.98,GW=350*S,OX=(W-GW)/2,OY=640,GX=W/2,CXO=175;
const TOP_R=12,BOT_R=488; const RIM=OY+TOP_R*S, BOT=OY+BOT_R*S;
const ROWS=CONT.rows; const half=r=>{const v=ROWS[r]||ROWS[r+1]||ROWS[r-1];return v?Math.max(0,(v[1]-v[0])/2-6)*S:0;};
const halfAt=y=>half(Math.round((y-OY)/S));
const INNER=(()=>{const p=new Path2D();const rs=[];for(let r=TOP_R;r<=BOT_R;r++)rs.push(r);
  rs.forEach((r,i)=>p[i?'lineTo':'moveTo'](GX-half(r),OY+r*S));rs.reverse().forEach(r=>p.lineTo(GX+half(r),OY+r*S));p.closePath();return p;})();
// объём → уровень
const VOL=[];{let v=0;for(let r=BOT_R;r>=TOP_R;r--){const h=half(r);v+=Math.PI*h*h*S;VOL[r]=v;}}
const ICE_ML=70,FULL_ML=180+ICE_ML,K=VOL[TOP_R+Math.round((BOT_R-TOP_R)*.1)]/FULL_ML;
function levelY(ml){if(ml<=0)return BOT;const tg=ml*K;let r=TOP_R;while(r<BOT_R&&VOL[r]>tg)r++;return OY+r*S;}
// ---------- рецепт и тайминг ----------
const STEPS=[
 {key:'ice',bar:3,name:TX.iceSub,amt:TX.ice},
 {key:'pro',bar:4,name:TX.pro,amt:ML(90),ml:90},
 {key:'ape',bar:5,name:TX.ape,amt:ML(60),ml:60},
 {key:'soda',bar:6,name:TX.soda,amt:ML(30),ml:30}];
const POUR=s=>[bar(s.bar)+.25,1.35];
function poured(t){let ml=0;for(const s of STEPS){if(!s.ml)continue;const[a,d]=POUR(s);ml+=s.ml*eio(seg(t,a,d));}return ml;}
function liquidMl(t){const ml=poured(t);return ml+(t>=bar(3)?ICE_ML*cl(ml/90):0);}
function liquidColor(t){const ape=eio(seg(t,POUR(STEPS[2])[0]+.2,1.6)),soda=eio(seg(t,POUR(STEPS[3])[0],1.2)),stir=eio(seg(t,bar(7)+.2,1.4));
  return mixC('F2E3A6','F06418',cl(lerp(0,.86,ape)*lerp(1,.94,soda)+stir*.06));}
// ---------- рисование ----------
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function txt(c,s,x,y,font,col,al='center'){let ls=0;const m=font.match(/^ls(\d+) /);if(m){ls=+m[1];font=font.slice(m[0].length);}c.font=font;c.letterSpacing=ls+'px';c.fillStyle=col;c.textAlign=al;c.fillText(s,x+(al==='center'?ls/2:0),y);c.letterSpacing='0px';}
function rise(c,s,x,y,font,col,tIn,tOut,t,al='center',h=120){const pi=eoe(seg(t,tIn,.45)),po=eie(seg(t,tOut,.35));if(pi<=0||po>=1)return;
  c.save();c.beginPath();c.rect(0,y-h,W,h*1.28);c.clip();txt(c,s,x,y+(1-pi)*h-po*h,font,col,al);c.restore();}
function velvetBg(c,t){const g=c.createRadialGradient(GX,1100,60,GX,1100,1100);g.addColorStop(0,BG2);g.addColorStop(1,BG);c.fillStyle=g;c.fillRect(-600,-600,W+1200,H+1200);
  // ворс бархата: мягкие вертикальные складки
  for(let i=-8;i<22;i++){const x=i*80+40,a=.05+.04*Math.sin(i*1.7);const v=c.createLinearGradient(x-40,0,x+40,0);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(.5,`rgba(255,180,190,${a*.35})`);v.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=v;c.fillRect(x-40,-600,80,H+1200);}}
function glassShadow(c){const sh=c.createRadialGradient(GX,OY+1135*S,5,GX,OY+1135*S,200);sh.addColorStop(0,'rgba(0,0,0,.45)');sh.addColorStop(1,'rgba(0,0,0,0)');c.save();c.translate(GX,OY+1135*S);c.scale(1,.12);c.fillStyle=sh;c.beginPath();c.arc(0,0,200,0,7);c.fill();c.restore();}
function decoFrame(c){// рамка ар-деко
  c.strokeStyle=GOLD;c.globalAlpha=.85;c.lineWidth=2;c.strokeRect(40,40,W-80,H-80);c.lineWidth=1;c.strokeRect(54,54,W-108,H-108);
  c.save();c.translate(GX,54);for(let r=30;r<=110;r+=20){c.beginPath();c.arc(0,0,r,0,Math.PI);c.stroke();}for(let k=0;k<=8;k++){const a=k/8*Math.PI;c.beginPath();c.moveTo(Math.cos(a)*30,Math.sin(a)*30);c.lineTo(Math.cos(a)*110,Math.sin(a)*110);c.stroke();}c.restore();
  [[54,54,1,1],[W-54,54,-1,1],[54,H-54,1,-1],[W-54,H-54,-1,-1]].forEach(([x,y,sx,sy])=>{c.save();c.translate(x,y);c.scale(sx,sy);c.beginPath();c.moveTo(0,70);c.lineTo(70,0);c.moveTo(0,40);c.lineTo(40,0);c.stroke();c.restore();});
  c.globalAlpha=1;}
function glassFront(c,t,drops){c.drawImage(GIMG,OX,OY,GW,1135*S);c.save();c.globalAlpha=.55;c.drawImage(GIMG,OX,OY,GW,1135*S);c.restore();
  c.save();c.clip(INNER);const h=c.createLinearGradient(OX+55*S,0,OX+105*S,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.5,'rgba(255,255,255,.28)');h.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=h;c.fillRect(OX+40,RIM+40,90,380);
  if(drops>0){for(let i=0;i<60;i++){const y=RIM+60+hash(i)*360,side=hash(i+90)*2-1,x=GX+side*(halfAt(y)-10)*.95;const a=cl(drops*3-hash(i+5)*2);if(a<=0)continue;
    c.fillStyle=`rgba(255,255,255,${.5*a})`;c.beginPath();c.ellipse(x,y,2.5+hash(i+7)*3,3.5+hash(i+8)*5,0,0,7);c.fill();}}
  c.restore();}
// лёд
const ICE=[[GX-34,OY+425*S,-.3],[GX+38,OY+400*S,.25],[GX-4,OY+325*S,.1],[GX-44,OY+245*S,.4],[GX+40,OY+225*S,-.2],[GX-6,OY+145*S,-.35]];
function cubePos(i,t,lvl){const[x,y,r]=ICE[i];const t0=bar(3)+.1+i*.25;if(t<t0)return null;const dt=t-t0,fallT=.3;let cy;
  if(dt<fallT)cy=lerp(560,y,(dt/fallT)**2);else cy=y-30*Math.exp(-(dt-fallT)*7)*Math.abs(Math.sin((dt-fallT)*16));
  let cx=x;const st=seg(t,bar(7)+.2,1.5);if(st>0&&st<1){const a=st*Math.PI*4;cx+=Math.sin(a+i)*10*(1-st);cy+=Math.cos(a+i)*5*(1-st);}
  return[cx,cy,r+(dt<fallT?(1-dt/fallT)*1.4:0)];}
function drawIce(c,t,lvl){for(let i=0;i<ICE.length;i++){const p=cubePos(i,t,lvl);if(!p)continue;const[x,y,r]=p,s=84;c.save();if(y>RIM-20)c.clip(INNER);else{c.beginPath();c.rect(0,598,W,H);c.clip();}c.translate(x,y);c.rotate(r);const under=y>lvl;
  const g=c.createLinearGradient(-s/2,-s/2,s/2,s/2);g.addColorStop(0,under?'rgba(255,235,215,.45)':'rgba(255,255,255,.8)');g.addColorStop(1,under?'rgba(255,170,120,.2)':'rgba(210,225,235,.55)');
  rr(c,-s/2,-s/2,s,s,16);c.fillStyle=g;c.fill();c.lineWidth=2.5;c.strokeStyle='rgba(255,255,255,.9)';c.stroke();
  rr(c,-s/2+11,-s/2+11,s-22,s-22,10);c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1.5;c.stroke();c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.ellipse(-s/4,-s/4,11,5,-.6,0,7);c.fill();c.restore();}}
function drawLiquid(c,t,lvl,col){if(lvl>=BOT-2)return;c.save();c.clip(INNER);c.globalAlpha=.92;c.fillStyle=col;c.fillRect(0,lvl,W,BOT-lvl+20);c.globalAlpha=1;
  const g=c.createLinearGradient(0,lvl,0,BOT);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(90,20,0,.38)');c.fillStyle=g;c.fillRect(0,lvl,W,BOT-lvl+20);
  const[a]=POUR(STEPS[2]);const pl=seg(t,a+.1,1.9);if(pl>0&&pl<1){c.globalAlpha=.75*(1-pl);c.fillStyle='#E4470C';for(let k=0;k<5;k++){const yy=lerp(lvl+20,BOT-40,eoe(pl)*(.5+k*.12)),xx=GX+Math.sin(k*1.7+pl*4)*40;c.beginPath();c.ellipse(xx,yy,50+k*8,30+k*7,0,0,7);c.fill();}c.globalAlpha=1;}
  for(let i=0;i<40;i++){const sp=40+hash(i)*70,ph=hash(i+3)*10;const y=BOT-((t*sp+ph*120)%(BOT-lvl+40));if(y<lvl+6)continue;const x=GX+(hash(i+11)*2-1)*(halfAt(y)-16);c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(x,y,1.8+hash(i+4)*3,0,7);c.fill();}
  const w=halfAt(lvl);c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.ellipse(GX,lvl,w,9,0,0,7);c.fill();c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=2;c.beginPath();c.ellipse(GX,lvl,w,9,0,0,Math.PI);c.stroke();c.restore();}
// бутылки без брендов: игристое, аперитив, содовая
const MOUTH=[GX+30,600];
function bottleShape(c,k){c.beginPath();
  if(k==='soda'){c.moveTo(0,-11);c.lineTo(70,-12);c.bezierCurveTo(120,-14,140,-46,190,-48);c.lineTo(470,-48);c.quadraticCurveTo(486,-48,486,-30);c.lineTo(486,30);c.quadraticCurveTo(486,48,470,48);c.lineTo(190,48);c.bezierCurveTo(140,46,120,14,70,12);c.lineTo(0,11);}
  else if(k==='pro'){c.moveTo(0,-15);c.lineTo(150,-17);c.bezierCurveTo(230,-20,250,-66,330,-68);c.lineTo(720,-68);c.lineTo(720,68);c.lineTo(330,68);c.bezierCurveTo(250,66,230,20,150,17);c.lineTo(0,15);}
  else{c.moveTo(0,-14);c.lineTo(110,-15);c.bezierCurveTo(150,-17,170,-60,230,-62);c.lineTo(640,-62);c.quadraticCurveTo(660,-62,660,-42);c.lineTo(660,42);c.quadraticCurveTo(660,62,640,62);c.lineTo(230,62);c.bezierCurveTo(170,60,150,17,110,15);c.lineTo(0,14);}
  c.closePath();}
function bottle(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const p=eoe(seg(t,a-.45,.4)),q=eie(seg(t,a+d+.05,.4));if(p<=0||q>=1)return;
  const tilt=lerp(-.04,-.16,eio(seg(t,a-.25,.3)))*(1-eio(seg(t,a+d,.3)));const k=s.key;
  c.save();c.translate(MOUTH[0]+(1-p)*600+q*600,MOUTH[1]);c.rotate(tilt);
  const pal={pro:['#0F2A1C','#2E5B3E','#6FA27E'],ape:['#7A250B','#E4581A','#FFB37A'],soda:['#5E8C99','#BFE0E8','#F2FBFD']}[k];
  bottleShape(c,k);const g=c.createLinearGradient(0,-70,0,70);g.addColorStop(0,pal[0]);g.addColorStop(.22,pal[2]);g.addColorStop(.38,pal[1]);g.addColorStop(.8,pal[0]);g.addColorStop(1,pal[0]);c.fillStyle=g;c.fill();
  if(k==='soda'){c.globalAlpha=.6;c.fillStyle='rgba(255,255,255,.35)';c.fill();c.globalAlpha=1;}
  c.save();bottleShape(c,k);c.clip();c.fillStyle='rgba(255,255,255,.55)';c.fillRect(30,-9,100,4);c.fillRect(k==='soda'?200:k==='pro'?340:240,k==='soda'?-38:-54,300,7);c.restore();
  // горлышко: фольга / крышка
  if(k==='pro'){const f=c.createLinearGradient(0,-20,0,20);f.addColorStop(0,'#6E5326');f.addColorStop(.3,'#E9CF8E');f.addColorStop(1,'#6E5326');c.fillStyle=f;c.beginPath();c.moveTo(-6,-18);c.lineTo(170,-20);c.lineTo(190,-34);c.lineTo(190,34);c.lineTo(170,20);c.lineTo(-6,18);c.closePath();c.fill();}
  else{c.fillStyle=k==='soda'?'#C9CDD1':'#5A1A07';rr(c,-8,-15,18,30,4);c.fill();}
  // этикетка без бренда
  const L=k==='pro'?[400,-58,220,116]:k==='ape'?[300,-52,240,104]:[250,-40,160,80];
  rr(c,L[0],L[1],L[2],L[3],6);c.fillStyle='#F3E6CC';c.fill();c.strokeStyle=GOLD;c.lineWidth=2;c.strokeRect(L[0]+7,L[1]+7,L[2]-14,L[3]-14);
  c.save();c.translate(L[0]+L[2]/2,L[1]+L[3]/2);c.rotate(Math.PI/4);c.fillStyle=GOLD;c.fillRect(-5,-5,10,10);c.restore();
  c.font=`${k==='soda'?22:26}px Deco`;c.letterSpacing='4px';c.fillStyle='#4A1A12';c.textAlign='center';
  c.fillText(TX.labels[k],L[0]+L[2]/2+2,L[1]+L[3]/2-14);c.letterSpacing='0px';c.restore();}
function stream(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const end=a+d;if(t<a-.05||t>end+.4)return;const lvl=levelY(liquidMl(t)),S0=MOUTH[1]+4;
  const head=t<a+.25?lerp(S0,lvl,eie(seg(t,a-.05,.3))):lvl,tail=t>end?lerp(S0,lvl,eie(seg(t,end,.35))):S0;if(head<=tail)return;
  const col=s.key==='soda'?'rgba(225,240,245,.85)':s.key==='ape'?'#E9520E':'rgba(242,227,166,.95)';const x=MOUTH[0];
  c.save();c.beginPath();const N=20;for(let i=0;i<=N;i++){const y=lerp(tail,head,i/N),w=lerp(9,6,i/N)+Math.sin(y*.05+t*30)*1;c[i?'lineTo':'moveTo'](x-w+Math.sin(y*.02+t*8)*1.5,y);}
  for(let i=N;i>=0;i--){const y=lerp(tail,head,i/N),w=lerp(9,6,i/N)+Math.sin(y*.05+t*30+1)*1;c.lineTo(x+w+Math.sin(y*.02+t*8)*1.5,y);}c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1.5;c.stroke();c.restore();}
function spoon(c,t){const a=bar(7),p=seg(t,a,2);if(p<=0||p>=1)return;const inP=eoe(seg(t,a,.4)),outP=eie(seg(t,a+1.65,.35));const y=lerp(-200,560,inP)-outP*900;const ang=seg(t,a+.3,1.4)*Math.PI*6;const x=GX+Math.sin(ang)*40;
  c.save();c.translate(x,y);c.rotate(Math.sin(ang)*.05);const g=c.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#8E7A55');g.addColorStop(.5,'#F1DDA6');g.addColorStop(1,'#8E7A55');
  c.fillStyle=g;c.fillRect(-5,0,10,560);for(let k=0;k<10;k++){c.fillStyle='rgba(90,70,30,.5)';c.fillRect(-5,60+k*14,10,3);}c.beginPath();c.ellipse(0,570,14,22,0,0,7);c.fill();c.restore();}
function orange(c,t){const a=bar(8);if(t<a)return;const s=spring(t-a-.1,1.7,.62),p=eoe(seg(t,a,.5));const R=82;
  const x=lerp(GX+420,GX+halfAt(RIM+20)-6,p),y=lerp(RIM-260,RIM+22,cl(s,0,1.2)),rot=lerp(1.2,-.35,cl(s,0,1.1));
  c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.arc(0,0,R,0,7);c.fillStyle='#F28A1F';c.fill();c.beginPath();c.arc(0,0,R-9,0,7);c.fillStyle='#FBE3B8';c.fill();
  for(let k=0;k<10;k++){const a0=k/10*Math.PI*2+.05,a1=(k+1)/10*Math.PI*2-.05;c.beginPath();c.moveTo(Math.cos((a0+a1)/2)*7,Math.sin((a0+a1)/2)*7);c.arc(0,0,R-16,a0,a1);c.closePath();c.fillStyle='#F7A23A';c.fill();}
  c.fillStyle='#FDEBD0';c.beginPath();c.arc(0,0,8,0,7);c.fill();c.restore();}
function tagLayout(){let acc=0,prev=1e9;return STEPS.slice(1).map(s=>{acc+=s.ml;const ly=levelY(acc+ICE_ML*cl(acc/90));const ty=Math.min(ly,prev-56);prev=ty;return{s,ly,ty};});}
let TAGS=null;
function levelTags(c,t){TAGS=TAGS||tagLayout();const fade=1-seg(t,bar(9),.4);if(fade<=0)return;
  for(const{s,ly,ty}of TAGS){const[a,d]=POUR(s);const p=eoe(seg(t,a+d-.2,.4));if(p<=0)continue;const x0=GX+halfAt(ly)+16;
    c.save();c.globalAlpha=fade;c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.moveTo(x0,ly);c.lineTo(x0+30,ty);c.lineTo(lerp(x0+30,x0+70,p),ty);c.stroke();
    c.beginPath();c.rect(x0+76,ty-46,W,60);c.clip();txt(c,s.amt,x0+80,ty+14+(1-p)*50,'46px Deco',s.key==='ape'?ORANGE:INK,'left');c.restore();}}
// ---------- кадр ----------
// камера: s/x — слой бокала, bs/bx — слой бархата (параллакс). Dolly zoom: бархат растёт, бокал держит размер.
// Плавная камера: одна непрерывная траектория по ключам, сплайн Эрмита (скорость без скачков).
// s — масштаб сцены, x/y — сдвиг сцены, bs/bx — масштаб и сдвиг бархата (параллакс и dolly zoom).
const SL=[GX+150,0];// фокус на дольке задаётся сдвигом, точка опоры не меняется
const CAM_KEYS=[
 // t     s     x     y    bs    bx
 [0,    .93, -150,   0, 1.14, -50],
 [2.5,  1.00,  0,    0, 1.00,   0],
 [6,    1.01,  0,    0, 1.00,   0],
 [12,   1.10,  0,    0, 1.04,   0],
 [13.5, 1.11, 30,    0, 1.05,  10],
 [15.2, 1.26,-40,   0, 1.08,  -6],
 [16.6, 1.12,  0,    0, 1.10,   0],
 [20,   1.14,  0,    0, 1.42,   0],
 [24,   1.15,-40,    0, 1.40, -14],
 [28,   1.20,  0,    0, 1.30,   0],
 [30,   1.02,  0,    0, 1.02,   0]];
function camera(t){const K=CAM_KEYS,n=K.length;let i=0;while(i<n-2&&t>K[i+1][0])i++;
  const t0=K[i][0],t1=K[i+1][0],h=t1-t0,u=cl((t-t0)/h);
  const tan=(j,c)=>{if(j<=0||j>=n-1)return 0;return (K[j+1][c]-K[j-1][c])/(K[j+1][0]-K[j-1][0]);};
  const H=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u;
    return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return{s:H(1),x:H(2),y:H(3),bs:H(4),bx:H(5)};}
// фокус наезда на дольку смещён вправо-вверх: pivot сцены
const PIV=[GX,700],BPIV=[GX,1100];
function frame(t){const c=X;c.setTransform(1,0,0,1,0,0);const C=camera(t);
  c.fillStyle=BG;c.fillRect(0,0,W,H);
  c.save();c.translate(BPIV[0]+C.bx,BPIV[1]);c.scale(C.bs,C.bs);c.translate(-BPIV[0],-BPIV[1]);velvetBg(c,t);c.restore();
  const z=C.s;
  c.save();c.translate(PIV[0]+C.x,PIV[1]+C.y);c.scale(z,z);c.translate(-PIV[0],-PIV[1]);glassShadow(c);
  const ml=liquidMl(t),lvl=levelY(ml),col=liquidColor(t);
  drawLiquid(c,t,lvl,col);drawIce(c,t,lvl);for(const s of STEPS)stream(c,t,s);spoon(c,t);
  glassFront(c,t,seg(t,bar(9),2));orange(c,t);for(const s of STEPS)bottle(c,t,s);levelTags(c,t);
  c.restore();decoFrame(c);header(c,t);}
const D=(s)=>`${s}px Deco`, DL=(s,ls=8)=>`ls${ls} ${s}px Deco`, SC=(s)=>`${s}px Script`;
function rule(c,t,y,tIn,tOut,w=300){const p=eoe(seg(t,tIn,.5))*(1-eie(seg(t,tOut,.35)));if(p<=0)return;const hw2=w*p/2;
  c.save();c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.moveTo(GX-hw2,y);c.lineTo(GX-14,y);c.moveTo(GX+14,y);c.lineTo(GX+hw2,y);c.stroke();
  c.fillStyle=GOLD;c.translate(GX,y);c.rotate(Math.PI/4);c.fillRect(-6*p,-6*p,12*p,12*p);c.restore();}
function header(c,t){
  c.save();rr(c,76,84,110,56,4);c.strokeStyle=INK;c.lineWidth=2;c.stroke();txt(c,TX.age,131,123,D(32),INK);c.restore();
  // такт 1 — название
  rise(c,'COCKTAIL',GX,205,DL(40,16),SOFT,.1,bar(2)-.35,t,'center',60);
  rise(c,TX.t1,GX,335,SC(150),INK,.2,bar(2)-.32,t,'center',190);
  rise(c,TX.t2,GX,460,SC(150),ORANGE,.4,bar(2)-.3,t,'center',190);
  rule(c,t,505,.7,bar(2)-.3,420);
  rise(c,TX.sub,GX,565,DL(34,8),SOFT,.8,bar(2)-.25,t,'center',50);
  // такт 2 — что нужно
  rise(c,TX.need,GX,240,DL(54,12),INK,bar(2),bar(3)-.3,t,'center',70);
  rule(c,t,290,bar(2)+.15,bar(3)-.3,360);
  [[TX.pro,ML(90)],[TX.ape,ML(60)],[TX.soda,ML(30)],[TX.iceList,'']].forEach(([n,a],i)=>{
    rise(c,n,150,380+i*86,D(52),INK,bar(2)+.4+i*.38,bar(3)-.3+i*.03,t,'left',70);
    if(a)rise(c,a,930,380+i*86,D(52),i===1?ORANGE:INK,bar(2)+.5+i*.38,bar(3)-.3+i*.03,t,'right',70);});
  // шаги
  const step=(n,a,out)=>{rise(c,TX.step(n),GX,220,DL(34,10),SOFT,a,out,t,'center',50);rule(c,t,250,a+.1,out,240);};
  STEPS.forEach((s,i)=>{const a=bar(s.bar),out=bar(s.bar+1)-.3;step(i+1,a,out);
    rise(c,s.amt,GX,420,D(s.key==='ice'?170:180),s.key==='ape'?ORANGE:INK,a+.05,out+.02,t,'center',180);
    rise(c,s.name,GX,520,SC(96),s.key==='ape'?INK:ORANGE,a+.15,out+.04,t,'center',110);});
  step(5,bar(7),bar(8)-.3);
  rise(c,TX.stir,GX,410,D(120),INK,bar(7)+.05,bar(8)-.28,t,'center',130);
  rise(c,TX.stirSub,GX,515,SC(84),ORANGE,bar(7)+.15,bar(8)-.26,t,'center',100);
  step(6,bar(8),bar(9)-.3);
  rise(c,TX.orange,GX,410,D(130),ORANGE,bar(8)+.05,bar(9)-.28,t,'center',140);
  rise(c,TX.orangeSub,GX,515,SC(84),INK,bar(8)+.15,bar(9)-.26,t,'center',100);
  // такты 11–12 — пропорция
  rise(c,TX.ratioT,GX,240,DL(40,10),SOFT,bar(11),bar(13)-.3,t,'center',60);
  rise(c,'3 : 2 : 1',GX,430,D(190),INK,bar(11)+.15,bar(13)-.28,t,'center',190);
  const ratio=[[TX.ratio[0],3,'#E9D48A'],[TX.ratio[1],2,ORANGE],[TX.ratio[2],1,'#B9D3DA']];let x=GX-390;
  ratio.forEach(([n,v,col],i)=>{const p=eoe(seg(t,bar(12)+i*.25,.5)),q=eie(seg(t,bar(13)-.3,.3));const w=v*130*(p)*(1-q);if(w<1)return;
    rr(c,x,500,Math.max(0,w-12),10,5);c.fillStyle=col;c.fill();if(p>.8&&q<.5)txt(c,n,x+(v*130-12)/2,560,D(34),INK);x+=v*130;});
  // такты 13–14 — название над готовым коктейлем
  rise(c,TX.name,GX,330,SC(140),INK,bar(13),bar(15)-.3,t,'center',160);
  rule(c,t,390,bar(13)+.2,bar(15)-.3,420);
  rise(c,TX.short,GX,450,DL(34,6),SOFT,bar(13)+.25,bar(15)-.28,t,'center',50);
  // такт 15 — финал
  rise(c,TX.save,GX,330,SC(130),ORANGE,bar(15),99,t,'center',150);
  rule(c,t,390,bar(15)+.15,99,420);
  rise(c,TX.saveSub,GX,450,DL(34,6),INK,bar(15)+.2,99,t,'center',50);
  const wp=eoe(seg(t,bar(15)+.4,.4));if(wp>0){c.save();c.globalAlpha=wp;txt(c,TX.warn,GX,1860,DL(26,2),INK);c.restore();}
}
window.seek=async t=>frame(t);
window.ready=Promise.all([document.fonts.load('40px Deco'),document.fonts.load('40px Script'),new Promise(r=>GIMG.complete?r():GIMG.onload=r)]);
