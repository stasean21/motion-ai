// Апероль Шприц — 30 с, 120 BPM, 15 тактов. Всё считается от времени в seek(t).
const W=1080,H=1920,cv=document.getElementById('c'),X=cv.getContext('2d');
const INK='#2B211C',SOFT='#665850',ORANGE='#E8590F',BG='#F4EEE7',GOLD='#B8915A';
const BAR=2; const bar=n=>(n-1)*BAR; // начало такта n
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), lerp=(a,b,p)=>a+(b-a)*p, seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2, eoe=p=>p>=1?1:1-Math.pow(2,-10*p), eie=p=>p<=0?0:Math.pow(2,10*p-10);
function spring(t,f=2,z=.7){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const mixC=(a,b,p)=>{const A=a.match(/\w\w/g).map(h=>parseInt(h,16)),B=b.match(/\w\w/g).map(h=>parseInt(h,16));return`rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],p))).join(',')})`;};
// ---------- бокал ----------
const GX=540, RIM=760, BOT=1262, BH=BOT-RIM;
function hw(u){const base=200+62*Math.sin(Math.PI*u*.95);const tp=u<.6?1:Math.pow(Math.cos((u-.6)/.4*Math.PI/2),.75);return 26+(base-26)*tp;}
function bowlPath(inset=0){const p=new Path2D();const N=80;
  for(let i=0;i<=N;i++){const u=i/N;p[i?'lineTo':'moveTo'](GX-hw(u)+inset,RIM+u*BH);}
  for(let i=N;i>=0;i--){const u=i/N;p.lineTo(GX+hw(u)-inset,RIM+u*BH);}p.closePath();return p;}
const BOWL=bowlPath(0),INNER=bowlPath(9);
// объём → уровень
const VOL=[];{let v=0;for(let i=400;i>=0;i--){const u=i/400,w=hw(u)-9;v+=Math.PI*w*w*(BH/400);VOL[i]=v;}}
const ICE_ML=110,FULL_ML=180+ICE_ML,K=VOL[Math.round(.2*400)]/FULL_ML;
function levelY(ml){if(ml<=0)return BOT;const target=ml*K;let i=400;while(i>0&&VOL[i]<target)i--;return RIM+i/400*BH;}
// ---------- рецепт и тайминг ----------
const STEPS=[
 {key:'ice',bar:3,name:'кубики доверху',amt:'Лёд',col:'#FFFFFF'},
 {key:'pro',bar:4,name:'Просекко',amt:'90 мл',ml:90,col:'F2E3A6'},
 {key:'ape',bar:5,name:'Апероль',amt:'60 мл',ml:60,col:'F0611A'},
 {key:'soda',bar:6,name:'Содовая',amt:'30 мл',ml:30,col:'EAF4F6'}];
const POUR=s=>[bar(s.bar)+.25,1.35]; // старт, длительность
function poured(t){let ml=0;for(const s of STEPS){if(!s.ml)continue;const[a,d]=POUR(s);ml+=s.ml*eio(seg(t,a,d));}return ml;}
function iceIn(t){return t>=bar(3);}
function liquidMl(t){const ml=poured(t);return ml+(iceIn(t)?ICE_ML*cl(ml/90):0);}
function liquidColor(t){ // соломенный → оранжевый
  const ape=eio(seg(t,POUR(STEPS[2])[0]+.2,1.6)), soda=eio(seg(t,POUR(STEPS[3])[0],1.2)), stir=eio(seg(t,bar(7)+.2,1.4));
  const a=lerp(.0,.86,ape)*lerp(1,.94,soda); return mixC('F2E3A6','EE5A12',cl(a+stir*.06));}
// ---------- рисование ----------
function rr(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r);}
function txt(c,s,x,y,font,col,al='center'){let ls=0;const m=font.match(/^ls(\d+) /);if(m){ls=+m[1];font=font.slice(m[0].length);}c.font=font;c.letterSpacing=ls+'px';c.fillStyle=col;c.textAlign=al;c.fillText(s,x+(al==='center'?ls/2:0),y);c.letterSpacing='0px';}
// текст поднимается из-под линии и уходит вверх; вход и выход разнесены по времени
function rise(c,s,x,y,font,col,tIn,tOut,t,al='center',h=120){
  const pi=eoe(seg(t,tIn,.45)),po=eie(seg(t,tOut,.35)); if(pi<=0||po>=1)return;
  c.save();c.beginPath();c.rect(0,y-h,W,h*1.28);c.clip();txt(c,s,x,y+(1-pi)*h-po*h,font,col,al);c.restore();}
function background(c,t){c.fillStyle=BG;c.fillRect(0,0,W,H);
  // стол и мягкий свет студии
  const g=c.createRadialGradient(GX,980,80,GX,980,900);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='#ECE3D9';c.fillRect(0,1530,W,H-1530);
  const s=c.createRadialGradient(GX,1515,10,GX,1515,240);s.addColorStop(0,'rgba(60,40,30,.22)');s.addColorStop(1,'rgba(60,40,30,0)');
  c.save();c.translate(GX,1515);c.scale(1,.12);c.translate(-GX,-1515);c.fillStyle=s;c.beginPath();c.arc(GX,1515,240,0,7);c.fill();c.restore();}
function glassBack(c){c.save();c.strokeStyle='rgba(120,110,105,.25)';c.lineWidth=2;c.beginPath();c.ellipse(GX,RIM,hw(0),16,0,Math.PI,0);c.stroke();c.restore();}
function glassFront(c,t,drops){
  c.save();c.fillStyle='rgba(255,255,255,.10)';c.fill(BOWL);
  c.lineWidth=3;c.strokeStyle='rgba(110,100,95,.35)';c.stroke(BOWL);c.lineWidth=1.5;c.strokeStyle='rgba(255,255,255,.9)';c.stroke(INNER);
  // блики
  c.clip(BOWL);const hl=c.createLinearGradient(GX-230,0,GX-150,0);hl.addColorStop(0,'rgba(255,255,255,0)');hl.addColorStop(.5,'rgba(255,255,255,.55)');hl.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=hl;c.beginPath();c.ellipse(GX-170,RIM+190,26,190,-.08,0,7);c.fill();
  c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(GX+205,RIM+170,7,120,.1,0,7);c.fill();
  if(drops>0){for(let i=0;i<70;i++){const u=.1+hash(i)*.62,side=hash(i+90)*2-1,x=GX+side*(hw(u)-22)*.95,y=RIM+u*BH;const a=cl(drops*3-hash(i+5)*2);if(a<=0)continue;
    c.fillStyle=`rgba(255,255,255,${.55*a})`;c.beginPath();c.ellipse(x,y,3+hash(i+7)*4,4+hash(i+8)*6,0,0,7);c.fill();c.fillStyle=`rgba(90,50,20,${.12*a})`;c.beginPath();c.ellipse(x+1.5,y+2,2,3,0,0,7);c.fill();}}
  c.restore();
  // ножка и основание
  c.save();const sg=c.createLinearGradient(GX-18,0,GX+18,0);sg.addColorStop(0,'rgba(150,140,135,.5)');sg.addColorStop(.4,'rgba(255,255,255,.9)');sg.addColorStop(1,'rgba(150,140,135,.4)');
  c.fillStyle=sg;c.beginPath();c.moveTo(GX-24,BOT-4);c.lineTo(GX-11,1490);c.lineTo(GX+11,1490);c.lineTo(GX+24,BOT-4);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.55)';c.strokeStyle='rgba(120,110,105,.35)';c.lineWidth=2;c.beginPath();c.ellipse(GX,1505,165,20,0,0,7);c.fill();c.stroke();
  c.strokeStyle='rgba(255,255,255,.95)';c.beginPath();c.ellipse(GX,1500,150,13,0,Math.PI*1.1,Math.PI*1.9);c.stroke();
  // кромка
  c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=3;c.beginPath();c.ellipse(GX,RIM,hw(0),16,0,0,Math.PI);c.stroke();
  c.strokeStyle='rgba(120,110,105,.3)';c.lineWidth=1.5;c.beginPath();c.ellipse(GX,RIM,hw(0)+2,18,0,0,7);c.stroke();c.restore();}
// лёд
const ICE=[[478,1170,-.3],[602,1150,.25],[540,1060,.1],[452,970,.4],[628,990,-.2],[545,880,-.35]];
function cubePos(i,t,lvl){const[x,y,r]=ICE[i];const t0=bar(3)+.1+i*.25;if(t<t0)return null;const dt=t-t0;
  const fallT=.32;let cy;if(dt<fallT)cy=lerp(-150,y,(dt/fallT)**2);else cy=y-38*Math.exp(-(dt-fallT)*7)*Math.abs(Math.sin((dt-fallT)*16));
  let cx=x;const st=seg(t,bar(7)+.2,1.5);if(st>0&&st<1){const a=st*Math.PI*4;cx+=Math.sin(a+i)*14*(1-st);cy+=Math.cos(a+i)*6*(1-st);}
  // всплытие: верхние кубики держатся на поверхности
  if(lvl<y-40&&i>=3)cy=Math.min(cy,y);
  return[cx,cy,r+(dt<fallT?(1-dt/fallT)*1.4:0)+(st>0&&st<1?Math.sin(st*12+i)*.08:0)];}
function drawIce(c,t,lvl,col){
  for(let i=0;i<ICE.length;i++){const p=cubePos(i,t,lvl);if(!p)continue;const[x,y,r]=p,s=118;
    c.save();if(y>RIM-30)c.clip(INNER);c.translate(x,y);c.rotate(r);const under=y>lvl;
    const g=c.createLinearGradient(-s/2,-s/2,s/2,s/2);g.addColorStop(0,under?'rgba(255,245,235,.55)':'rgba(255,255,255,.9)');g.addColorStop(1,under?'rgba(255,200,170,.25)':'rgba(205,220,228,.75)');
    rr(c,-s/2,-s/2,s,s,22);c.fillStyle=g;c.fill();
    c.lineWidth=3;c.strokeStyle=under?'rgba(255,255,255,.95)':'rgba(150,172,185,.85)';c.stroke();
    rr(c,-s/2+14,-s/2+14,s-28,s-28,14);c.strokeStyle=under?'rgba(255,255,255,.45)':'rgba(150,172,185,.45)';c.lineWidth=2;c.stroke();
    c.fillStyle='rgba(255,255,255,.95)';c.beginPath();c.ellipse(-s/4,-s/4,16,7,-.6,0,7);c.fill();c.restore();}}
function drawLiquid(c,t,lvl,col){if(lvl>=BOT-2)return;c.save();c.clip(INNER);
  const g=c.createLinearGradient(0,lvl,0,BOT);g.addColorStop(0,col);g.addColorStop(1,mixC('C8400A','8A2A05',.0));
  c.globalAlpha=.92;c.fillStyle=col;c.fillRect(0,lvl,W,BOT-lvl);c.globalAlpha=.25;c.fillStyle=g;c.fillRect(0,lvl,W,BOT-lvl);c.globalAlpha=1;
  // шлейф аперитива опускается вниз
  const[a]=POUR(STEPS[2]);const pl=seg(t,a+.1,1.9);if(pl>0&&pl<1){c.globalAlpha=.75*(1-pl);c.fillStyle='#E4470C';
    for(let k=0;k<5;k++){const yy=lerp(lvl+20,BOT-60,eoe(pl)*(0.5+k*.12)),xx=GX+Math.sin(k*1.7+pl*4)*60;c.beginPath();c.ellipse(xx,yy,70+k*12,40+k*10,0,0,7);c.fill();}c.globalAlpha=1;}
  // пузырьки
  for(let i=0;i<46;i++){const sp=40+hash(i)*70,ph=hash(i+3)*10;const y=BOT-((t*sp+ph*120)%(BOT-lvl+40));if(y<lvl+6)continue;
    const u=(y-RIM)/BH,x=GX+(hash(i+11)*2-1)*(hw(u)-30);c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(x,y,2+hash(i+4)*3.5,0,7);c.fill();}
  // мениск
  const u=(lvl-RIM)/BH,w=hw(cl(u))-9;c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(GX,lvl,w,14,0,0,7);c.fill();
  c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;c.beginPath();c.ellipse(GX,lvl,w,14,0,0,Math.PI);c.stroke();
  c.restore();}
function stream(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const end=a+d;if(t<a-.05||t>end+.4)return;
  const lvl=levelY(liquidMl(t));const S0=648;
  const head=t<a+.25?lerp(S0,lvl,eie(seg(t,a-.05,.3))):lvl; const tail=t>end?lerp(S0,lvl,eie(seg(t,end,.35))):S0;
  if(head<=tail)return; const col=s.key==='soda'?'rgba(225,240,245,.85)':s.key==='ape'?'#E9520E':'rgba(242,227,166,.95)';
  c.save();const x=GX+70;c.beginPath();const N=24;for(let i=0;i<=N;i++){const y=lerp(tail,head,i/N),w=lerp(11,7,i/N)+Math.sin(y*.05+t*30)*1.2;c[i?'lineTo':'moveTo'](x-w+Math.sin(y*.02+t*8)*2,y);}
  for(let i=N;i>=0;i--){const y=lerp(tail,head,i/N),w=lerp(11,7,i/N)+Math.sin(y*.05+t*30+1)*1.2;c.lineTo(x+w+Math.sin(y*.02+t*8)*2,y);}c.closePath();
  c.fillStyle=col;c.fill();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.stroke();
  if(head>=lvl-2&&t<end+.1){c.fillStyle='rgba(255,255,255,.6)';for(let k=0;k<6;k++){const ang=hash(k+Math.floor(t*30))*Math.PI;c.beginPath();c.arc(x+Math.cos(ang)*30,lvl-Math.sin(ang)*16,3,0,7);c.fill();}}
  c.restore();}
// горлышко бутылки въезжает справа, наклоняется и уезжает
const BOTTLE={pro:['#3E5B3A','#5E8457'],ape:['#C2410C','#E4581A'],soda:['#9CC3CF','#C9E2E8']};
function bottle(c,t,s){if(!s.ml)return;const[a,d]=POUR(s);const p=eoe(seg(t,a-.45,.4)),q=eie(seg(t,a+d+.05,.4));if(p<=0||q>=1)return;
  const tilt=lerp(-.05,-.2,eio(seg(t,a-.25,.3)))*(1-eio(seg(t,a+d,.3)));
  c.save();c.translate(GX+70+(1-p)*560+q*560,640);c.rotate(tilt);const[c1,c2]=BOTTLE[s.key];
  const g=c.createLinearGradient(0,-40,0,40);g.addColorStop(0,c2);g.addColorStop(.45,c1);g.addColorStop(1,c1);
  c.fillStyle=g;c.beginPath();c.moveTo(0,-15);c.lineTo(150,-17);c.quadraticCurveTo(230,-20,280,-62);c.lineTo(700,-62);c.lineTo(700,62);c.lineTo(280,62);c.quadraticCurveTo(230,20,150,17);c.lineTo(0,15);c.closePath();c.fill();
  c.fillStyle='rgba(255,255,255,.45)';c.fillRect(20,-11,120,5);c.fillRect(300,-48,380,10);
  c.fillStyle=c1;rr(c,-8,-20,24,40,6);c.fill();
  if(s.key!=='soda'){c.fillStyle='#F6F1E8';c.fillRect(330,-62,170,124);c.fillStyle=s.key==='ape'?'#C2410C':'#3E5B3A';c.font='30px Deco';c.letterSpacing='4px';c.textAlign='center';c.fillText(s.key==='ape'?'APEROL':'PROSECCO',415,10);c.letterSpacing='0px';}
  c.restore();}
function spoon(c,t){const a=bar(7),p=seg(t,a,2);if(p<=0||p>=1)return;
  const inP=eoe(seg(t,a,.4)),outP=eie(seg(t,a+1.65,.35));const y=lerp(-200,520,inP)-outP*900;const ang=seg(t,a+.3,1.4)*Math.PI*6;const x=GX+Math.sin(ang)*70;
  c.save();c.translate(x,y);c.rotate(Math.sin(ang)*.06);const g=c.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#9A958F');g.addColorStop(.5,'#F4F2EF');g.addColorStop(1,'#8E8984');
  c.fillStyle=g;c.fillRect(-5,0,10,640);for(let k=0;k<10;k++){c.fillStyle='rgba(120,115,110,.5)';c.fillRect(-5,60+k*14,10,3);}
  c.beginPath();c.ellipse(0,650,16,26,0,0,7);c.fill();c.restore();}
function orange(c,t){const a=bar(8);if(t<a)return;const s=spring(t-a-.1,1.7,.62);const p=eoe(seg(t,a,.5));
  const x=lerp(GX+420,GX+188,p),y=lerp(RIM-260,RIM+40,cl(s,0,1.2)),R=118,rot=lerp(1.2,-.35,cl(s,0,1.1));
  c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.arc(0,0,R,0,7);c.fillStyle='#F28A1F';c.fill();
  c.beginPath();c.arc(0,0,R-12,0,7);c.fillStyle='#FBE3B8';c.fill();
  for(let k=0;k<10;k++){const a0=k/10*Math.PI*2+.04,a1=(k+1)/10*Math.PI*2-.04;c.beginPath();c.moveTo(Math.cos((a0+a1)/2)*10,Math.sin((a0+a1)/2)*10);c.arc(0,0,R-22,a0,a1);c.closePath();c.fillStyle='#F7A23A';c.fill();}
  c.fillStyle='#FDEBD0';c.beginPath();c.arc(0,0,12,0,7);c.fill();c.restore();}
// уровни-отметки рядом с бокалом
function tagLayout(){let acc=0,prev=1e9;return STEPS.slice(1).map(s=>{acc+=s.ml;const ly=levelY(acc+ICE_ML*cl(acc/90));const ty=Math.min(ly,prev-58);prev=ty;return{s,ly,ty};});}
const TAGS=tagLayout();
function levelTags(c,t){const fade=1-seg(t,bar(9),.4);if(fade<=0)return;
  for(const{s,ly,ty}of TAGS){const[a,d]=POUR(s);const p=eoe(seg(t,a+d-.2,.4));if(p<=0)continue;const u=(ly-RIM)/BH,x0=GX+hw(u)+10;
    c.save();c.globalAlpha=fade;c.strokeStyle=INK;c.lineWidth=2;c.beginPath();c.moveTo(x0,ly);c.lineTo(x0+30,ty);c.lineTo(lerp(x0+30,x0+70,p),ty);c.stroke();
    c.beginPath();c.rect(x0+76,ty-46,W,60);c.clip();txt(c,s.amt,x0+80,ty+14+(1-p)*50,'46px Deco',s.key==='ape'?ORANGE:INK,'left');c.restore();}}
// ---------- кадр ----------
function frame(t){const c=X;c.setTransform(1,0,0,1,0,0);
  // камера: стоит на месте, к финалу мягко наезжает на бокал
  const z=1+.14*eio(seg(t,bar(9),3.6))-.14*eio(seg(t,bar(15),.9)), oy=0;
  background(c,t); c.save();c.translate(GX,1420);c.scale(z,z);c.translate(-GX,-1420);
  const ml=liquidMl(t),lvl=levelY(ml),col=liquidColor(t);
  glassBack(c);drawLiquid(c,t,lvl,col);drawIce(c,t,lvl,col);
  for(const s of STEPS){stream(c,t,s);} spoon(c,t);
  glassFront(c,t,seg(t,bar(9),2));orange(c,t);for(const s of STEPS)bottle(c,t,s);
  levelTags(c,t);
  c.restore();
  header(c,t);}
const D=(s)=>`${s}px Deco`, DL=(s,ls=8)=>`ls${ls} ${s}px Deco`, SC=(s)=>`${s}px Script`;
function rule(c,t,y,tIn,tOut,w=300){const p=eoe(seg(t,tIn,.5))*(1-eie(seg(t,tOut,.35)));if(p<=0)return;const hw2=w*p/2;
  c.save();c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.moveTo(GX-hw2,y);c.lineTo(GX-14,y);c.moveTo(GX+14,y);c.lineTo(GX+hw2,y);c.stroke();
  c.fillStyle=GOLD;c.translate(GX,y);c.rotate(Math.PI/4);c.fillRect(-6*p,-6*p,12*p,12*p);c.restore();}
function header(c,t){
  c.save();rr(c,60,70,110,56,4);c.strokeStyle=INK;c.lineWidth=2;c.stroke();txt(c,'18+',115,109,D(32),INK);c.restore();
  // такт 1 — название
  rise(c,'COCKTAIL',GX,250,DL(40,16),SOFT,.1,bar(2)-.35,t,'center',60);
  rise(c,'Апероль',GX,400,SC(170),INK,.2,bar(2)-.32,t,'center',190);
  rise(c,'Шприц',GX,540,SC(170),ORANGE,.4,bar(2)-.3,t,'center',190);
  rule(c,t,600,.7,bar(2)-.3,420);
  rise(c,'ИТАЛЬЯНСКИЙ АПЕРИТИВ',GX,660,DL(34,8),SOFT,.8,bar(2)-.25,t,'center',50);
  // такт 2 — что нужно
  rise(c,'ПОНАДОБИТСЯ',GX,240,DL(54,12),INK,bar(2),bar(3)-.3,t,'center',70);
  rule(c,t,290,bar(2)+.15,bar(3)-.3,360);
  [['Просекко','90 мл'],['Апероль','60 мл'],['Содовая','30 мл'],['Лёд, долька апельсина','']].forEach(([n,a],i)=>{
    rise(c,n,150,380+i*86,D(52),INK,bar(2)+.4+i*.38,bar(3)-.3+i*.03,t,'left',70);
    if(a)rise(c,a,930,380+i*86,D(52),i===1?ORANGE:INK,bar(2)+.5+i*.38,bar(3)-.3+i*.03,t,'right',70);});
  // шаги
  const step=(n,a,out)=>{rise(c,`ШАГ ${n} ИЗ 6`,GX,220,DL(34,10),SOFT,a,out,t,'center',50);rule(c,t,250,a+.1,out,240);};
  STEPS.forEach((s,i)=>{const a=bar(s.bar),out=bar(s.bar+1)-.3;step(i+1,a,out);
    rise(c,s.amt,GX,420,D(s.key==='ice'?170:180),s.key==='ape'?ORANGE:INK,a+.05,out+.02,t,'center',180);
    rise(c,s.name,GX,520,SC(96),s.key==='ape'?INK:ORANGE,a+.15,out+.04,t,'center',110);});
  step(5,bar(7),bar(8)-.3);
  rise(c,'Перемешать',GX,410,D(120),INK,bar(7)+.05,bar(8)-.28,t,'center',130);
  rise(c,'один круг ложкой',GX,515,SC(84),ORANGE,bar(7)+.15,bar(8)-.26,t,'center',100);
  step(6,bar(8),bar(9)-.3);
  rise(c,'Апельсин',GX,410,D(130),ORANGE,bar(8)+.05,bar(9)-.28,t,'center',140);
  rise(c,'долька в бокал',GX,515,SC(84),INK,bar(8)+.15,bar(9)-.26,t,'center',100);
  // такты 11–12 — пропорция
  rise(c,'ЗАПОМНИ ПРОПОРЦИЮ',GX,240,DL(40,10),SOFT,bar(11),bar(13)-.3,t,'center',60);
  rise(c,'3 : 2 : 1',GX,430,D(190),INK,bar(11)+.15,bar(13)-.28,t,'center',190);
  const ratio=[['просекко',3,'#E9D48A'],['апероль',2,ORANGE],['содовая',1,'#B9D3DA']];let x=GX-390;
  ratio.forEach(([n,v,col],i)=>{const p=eoe(seg(t,bar(12)+i*.25,.5)),q=eie(seg(t,bar(13)-.3,.3));const w=v*130*(p)*(1-q);if(w<1)return;
    rr(c,x,500,Math.max(0,w-12),10,5);c.fillStyle=col;c.fill();if(p>.8&&q<.5)txt(c,n,x+(v*130-12)/2,560,D(34),INK);x+=v*130;});
  // такты 13–14 — название над готовым коктейлем
  rise(c,'Апероль Шприц',GX,330,SC(140),INK,bar(13),bar(15)-.3,t,'center',160);
  rule(c,t,390,bar(13)+.2,bar(15)-.3,420);
  rise(c,'ЛЁД · 90 · 60 · 30 · АПЕЛЬСИН',GX,450,DL(34,6),SOFT,bar(13)+.25,bar(15)-.28,t,'center',50);
  // такт 15 — финал
  rise(c,'Сохрани рецепт',GX,330,SC(130),ORANGE,bar(15),99,t,'center',150);
  rule(c,t,390,bar(15)+.15,99,420);
  rise(c,'И ПРИГОТОВЬ НА ВЫХОДНЫХ',GX,450,DL(34,6),INK,bar(15)+.2,99,t,'center',50);
  const wp=eoe(seg(t,bar(15)+.4,.4));if(wp>0){c.save();c.globalAlpha=wp;txt(c,'ЧРЕЗМЕРНОЕ УПОТРЕБЛЕНИЕ АЛКОГОЛЯ ВРЕДИТ ВАШЕМУ ЗДОРОВЬЮ',GX,1860,DL(26,2),INK);c.restore();}
}
window.seek=async t=>frame(t);
window.ready=Promise.all([document.fonts.load('40px Deco'),document.fonts.load('40px Script')]);
