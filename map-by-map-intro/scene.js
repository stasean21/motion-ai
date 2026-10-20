// Map by Map — интро 8 с, 120 BPM. Глобус с обложки собирается «карта за картой», потом из него вырастает название.
const W=1920,H=1080,cv=document.getElementById('c'),X=cv.getContext('2d');
const DURATION=8;
const COL={bg:'#101C32',tq:'#2ED9D3',or:'#FA8D32',wh:'#F7F0E8',txt:'#F4F7FF',dot:'#22314F'};
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,p)=>a+(b-a)*p,seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,eoe=p=>p>=1?1:1-Math.pow(2,-10*p),eie=p=>p<=0?0:Math.pow(2,10*p-10),eoc=p=>1-Math.pow(1-p,3);
function spring(t,f=2,z=.6){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const q8=t=>Math.round(t*8)/8; // восьмые доли при 120 BPM — 0,125 с
// ---------- части обложки ----------
let J,P=[],RIM={},BAR,ICE,K=1;
async function load(){J=await (await fetch('parts.json')).json();K=W/J.W;
  await Promise.all(J.parts.map(p=>new Promise(r=>{const im=new Image();im.onload=r;im.src=`parts/${p.f}.png`;p.im=im;})));
  for(const p of J.parts){if(p.kind==='rim')RIM[p.layer]=p;else if(p.kind==='bar')BAR=p;else if(p.kind==='ice')ICE=p;else P.push(p);}
  // порядок «карта за картой»: слева направо, крупные материки — с весом
  P.sort((a,b)=>a.cx-b.cx);const big=Math.max(...P.map(p=>p.area));
  P.forEach((p,i)=>{p.t=q8(.25+1.75*i/(P.length-1));p.big=p.area>big*.2;
    const dx=p.cx-J.CX,dy=p.cy-J.CY,d=Math.hypot(dx,dy)||1;p.ox=dx/d;p.oy=dy/d;});}
// ---------- композиция: шар в центре → влево и меньше ----------
function globeXf(t){const m=eio(seg(t,3.15,.95));const pulse=t>=3?Math.exp(-(t-3)*7)*Math.sin((t-3)*22)*.035:0;
  return{x:lerp(W/2,610,m),y:lerp(J.CY*K,548,m),s:K*lerp(1,.8,m)*(1+pulse),rot:lerp(0,-.03,m)*(1-seg(t,4.2,1.2))};}
// камера: медленный наезд и дрейф на всём ролике
function cam(t){const p=eio(seg(t,0,8));return{s:lerp(1,1.06,p),x:lerp(0,-14,p),y:lerp(8,-6,p)};}
// ---------- шар ----------
function drawGlobe(c,t){const g=globeXf(t),{CX,CY,R}=J;
  c.save();c.translate(g.x,g.y);c.rotate(g.rot);c.scale(g.s,g.s);c.translate(-CX,-CY);
  // мягкое свечение: бирюзовое слева, оранжевое справа
  const gl=seg(t,.2,1.2)*(.8+.4*(t>=3?Math.exp(-(t-3)*3):0));
  for(const [col,dx] of [['46,217,211',-.35],['250,141,50',.35]]){const gx=CX+dx*R,gr=c.createRadialGradient(gx,CY,0,gx,CY,R*1.3);gr.addColorStop(0,`rgba(${col},${.14*gl})`);gr.addColorStop(1,`rgba(${col},0)`);c.fillStyle=gr;c.fillRect(CX-R*2,CY-R*2,R*4,R*4);}
  // контур-подсказка до ободков
  const gd=seg(t,0,.25)*(1-seg(t,1.8,.6));if(gd>0){c.save();c.globalAlpha=gd*.6;c.strokeStyle='#fff';c.lineWidth=3/g.s;c.setLineDash([3/g.s,12/g.s]);c.beginPath();c.arc(CX,CY,R,-Math.PI/2,-Math.PI/2+Math.PI*2*eio(seg(t,0,.7)));c.stroke();c.restore();}
  // ободки: бирюзовый снизу вверх по левой стороне, оранжевый сверху вниз по правой
  rim(c,RIM.tq,t,.25,1.1,95,292);rim(c,RIM.or,t,1.15,.9,282,428);
  // куски суши
  for(const p of P){const r=t-p.t;if(r<0)continue;const q=spring(r,p.big?1.7:2.4,p.big?.5:.45),off=(1-cl(q,0,1.2))*(p.big?90:60);
    c.save();c.globalAlpha=cl(r/.08);c.translate(p.cx+p.ox*off,p.cy+p.oy*off-(1-cl(q))*30);const sc=lerp(p.big?.7:.3,1,q);c.scale(sc,sc);
    const glow=Math.exp(-r*4);if(glow>.02){c.shadowColor=p.layer==='tq'?'rgba(46,217,211,.9)':'rgba(250,141,50,.9)';c.shadowBlur=30*glow;}
    c.drawImage(p.im,p.x-p.cx,p.y-p.cy);c.restore();}
  // разделитель: режет шар сверху вниз
  {const p=eio(seg(t,2.0,.35));if(p>0){const [a,b]=J.bar,ex=lerp(a[0],b[0],p),ey=lerp(a[1],b[1],p),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;
    c.save();c.beginPath();c.moveTo(a[0]-dx/L*60+nx*80,a[1]-dy/L*60+ny*80);c.lineTo(a[0]-dx/L*60-nx*80,a[1]-dy/L*60-ny*80);c.lineTo(ex-nx*80,ey-ny*80);c.lineTo(ex+nx*80,ey+ny*80);c.closePath();c.clip();
    c.drawImage(BAR.im,BAR.x,BAR.y);c.restore();
    const tip=1-seg(t,2.35,.3);if(tip>0){const gr=c.createRadialGradient(ex,ey,0,ex,ey,60);gr.addColorStop(0,`rgba(255,240,220,${.9*tip})`);gr.addColorStop(1,'rgba(255,240,220,0)');c.fillStyle=gr;c.fillRect(ex-60,ey-60,120,120);}}}
  // Антарктида всплывает снизу
  {const r=t-2.25;if(r>0){const q=spring(r,1.8,.55);c.save();c.beginPath();c.rect(CX-R,CY,2*R,R+8);c.clip();c.translate(0,(1-cl(q,0,1.1))*110);c.drawImage(ICE.im,ICE.x,ICE.y);c.restore();}}
  // удар на 3,0: кольцо расходится от шара
  const ring=seg(t,3.0,.7);if(ring>0&&ring<1){c.save();c.globalAlpha=(1-ring)*.7;c.strokeStyle='#fff';c.lineWidth=(6-5*ring)/g.s*2;c.beginPath();c.arc(CX,CY,R*(1.02+ring*.35),0,7);c.stroke();c.restore();}
  c.restore();return g;}
function rim(c,p,t,t0,d,a0,a1){const e=eio(seg(t,t0,d));if(e<=0)return;const A0=a0*Math.PI/180,A1=lerp(a0,a1,e)*Math.PI/180;
  c.save();c.beginPath();c.moveTo(J.CX,J.CY);c.arc(J.CX,J.CY,J.R*1.2,A0,A1);c.closePath();c.clip();c.drawImage(p.im,p.x,p.y);c.restore();
  // светящийся «кончик» дуги
  if(e<1){const tx=J.CX+Math.cos(A1)*J.R*.97,ty=J.CY+Math.sin(A1)*J.R*.97,gr=c.createRadialGradient(tx,ty,0,tx,ty,50);const col=p.layer==='tq'?'46,217,211':'250,141,50';
    gr.addColorStop(0,`rgba(${col},.8)`);gr.addColorStop(1,`rgba(${col},0)`);c.fillStyle=gr;c.fillRect(tx-50,ty-50,100,100);}}
// орбита: задняя половина за шаром, передняя — перед ним
function orbit(c,t,g,front){const a=eio(seg(t,3.3,.9));if(a<=0)return;const R=J.R*g.s,rx=R*1.32,ry=R*.3,tilt=-.32,ph=t*.55;
  c.save();c.translate(g.x,g.y);c.rotate(tilt);c.globalAlpha=front?.9*a:.4*a;c.strokeStyle='#fff';c.lineWidth=3.5;c.setLineDash([5,13]);c.lineDashOffset=-t*30;
  c.beginPath();if(front)c.ellipse(0,0,rx,ry,0,0,Math.PI*a);else c.ellipse(0,0,rx,ry,0,Math.PI,Math.PI+Math.PI*a);c.stroke();c.setLineDash([]);
  for(const [col,o] of [[COL.tq,0],[COL.or,Math.PI]]){const ang=ph+o,s=Math.sin(ang);if((s>0)!==front)continue;const x=Math.cos(ang)*rx,y=s*ry,r=9+3*s;
    c.globalAlpha=a*(front?1:.45);c.shadowColor=col;c.shadowBlur=20;c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,7);c.fill();c.shadowBlur=0;}
  c.restore();}
// фон: точки с параллаксом
function dots(c,t,C){const step=30,ox=(C.x*.4)%step,oy=(C.y*.4)%step,a=seg(t,0,.6);c.fillStyle=COL.dot;c.globalAlpha=.8*a;
  for(let x=ox-step;x<W+step;x+=step)for(let y=oy-step;y<H+step;y+=step){c.beginPath();c.arc(x,y,1.6,0,7);c.fill();}c.globalAlpha=1;}
function dust(c,t,C){for(let i=0;i<22;i++){const r=5+hash(i+1)*20,x=((hash(i)*(W+300)+t*(10+hash(i+9)*16)+C.x*1.6)%(W+300))-150,y=((hash(i+20)*(H+200)-t*(8+hash(i+11)*10)+C.y*1.6)%(H+200)+H+200)%(H+200)-100;
  const g=c.createRadialGradient(x,y,0,x,y,r),col=i%3===0?'250,170,90':'140,220,215';g.addColorStop(0,`rgba(${col},${.07+hash(i+5)*.07})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}}
// ---------- текст ----------
const FAM={2:'N2',7:'N7',9:'N9'};
function font(c,w,size,ls=0){c.font=`${size}px ${FAM[w]}`;c.letterSpacing=ls+'px';}
// диагональная раскраска как у глобуса: бирюзовый слева от линии, оранжевый справа
function splitFill(c,txt,x,y,size){const w=c.measureText(txt).width,mx=x+w/2,my=y-size*.36,[a,b]=J.bar,dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
  for(const [col,side] of [[COL.tq,-1],[COL.or,1]]){c.save();c.beginPath();const nx=-uy*side,ny=ux*side;
    c.moveTo(mx-ux*600,my-uy*600);c.lineTo(mx+ux*600,my+uy*600);c.lineTo(mx+ux*600-nx*900,my+uy*600-ny*900);c.lineTo(mx-ux*600-nx*900,my-uy*600-ny*900);c.closePath();c.clip();
    c.fillStyle=col;c.fillText(txt,x,y);c.restore();}}
function word(c,t,o){if(t<o.in)return;const pin=seg(t,o.in,o.dur||.45);let dx=0,dy=0,sc=1,sy=1,skew=0,al=1,ls=o.ls||0,clip=false,blur=0;
  switch(o.a){
    case'slam':{const p=spring(t-o.in,2.2,.55);sc=lerp(1.8,1,p);al=seg(t,o.in,.08);blur=(1-cl(p))*8;break;}
    case'track':{const e=eoe(pin);ls=lerp(o.ls0??90,ls,e);al=seg(t,o.in,.25);dx=(1-e)*-40;break;}
    case'flip':{const p=spring(t-o.in,1.8,.6);sy=Math.max(.02,cl(p,0,1.15));skew=(1-cl(p))*-.5;al=seg(t,o.in,.08);break;}}
  c.save();font(c,o.w,o.size,ls);c.textAlign='left';c.translate(o.x+dx,o.y+dy);c.transform(1,0,skew,1,0,0);c.scale(sc,sc*sy);c.globalAlpha=al;
  if(blur>.3)c.filter=`blur(${blur.toFixed(1)}px)`;if(o.glow){c.shadowColor=o.glow;c.shadowBlur=36;}
  if(o.split)splitFill(c,o.s,0,0,o.size);else{c.fillStyle=o.col||COL.txt;c.fillText(o.s,0,0);}c.restore();}
function title(c,t){const x=1120;
  word(c,t,{s:'MAP',w:9,size:220,x,y:440,a:'slam',in:4.0,ls:6});
  word(c,t,{s:'by',w:2,size:140,x:x+8,y:600,a:'track',in:4.5,ls0:80,ls:10,dur:.6});
  word(c,t,{s:'MAP',w:9,size:220,x,y:820,a:'flip',in:5.0,ls:6,split:true,glow:'rgba(250,170,90,.25)'});
  // двухцветная черта под названием
  const p=eio(seg(t,5.5,.55));if(p>0){font(c,9,220,6);const w=c.measureText('MAP').width,cx=x+w/2,half=w/2*p;c.save();c.lineCap='round';c.lineWidth=12;
    c.strokeStyle=COL.tq;c.beginPath();c.moveTo(cx,880);c.lineTo(cx-half,880);c.stroke();c.strokeStyle=COL.or;c.beginPath();c.moveTo(cx,880);c.lineTo(cx+half,880);c.stroke();c.restore();
    const sh=seg(t,6.0,.6);if(sh>0&&sh<1){const sx=cx-w/2+sh*w;const g=c.createRadialGradient(sx,880,0,sx,880,40);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(sx-40,840,80,80);}}}
// ---------- кадр ----------
function frame(t){const C=cam(t);X.setTransform(1,0,0,1,0,0);X.fillStyle=COL.bg;X.fillRect(0,0,W,H);
  X.save();X.translate(W/2,H/2);X.scale(C.s,C.s);X.translate(-W/2+C.x,-H/2+C.y);
  dots(X,t,C);const g=globeXf(t);orbit(X,t,g,false);drawGlobe(X,t);orbit(X,t,g,true);
  X.save();X.translate(C.x*.15,C.y*.15);title(X,t);X.restore();
  X.restore();
  const v=X.createRadialGradient(W/2,H*.5,H*.35,W/2,H*.5,H*1.05);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');X.fillStyle=v;X.fillRect(0,0,W,H);
  dust(X,t,C);}
window.ready=Promise.all([load(),...['N2','N7','N9'].map(f=>document.fonts.load(`40px ${f}`))]);
window.seek=async t=>frame(t);
