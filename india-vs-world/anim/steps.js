// Шаг страны, 10 с (5 тактов при 120 BPM). Герой — текст:
// перелёт камеры → белый контур → крупные «#01 / NAME / 3.4M PEOPLE» → текст складывается в карточку справа →
// страна заливается бирюзовым → чип «+3.4M» летит в шкалу → шкала растёт, «Added» перещёлкивается.
const S_T0=14,STEP=10,IPOP=1463.9;
// id ISO, флаг, название, млн, сумма (оценки 2025, UN WPP 2024)
const DATA=[['858','uy','Uruguay',3.4,3.4],['578','no','Norway',5.6,9.0],['246','fi','Finland',5.6,14.6]];
const STEPS=DATA.map((d,i)=>{const box=VIEWS[d[1]];return{i,id:d[0],fl:d[1],name:d[2].toUpperCase(),pop:d[3],sum:d[4],prev:i?DATA[i-1][4]:0,n:i+1,t0:S_T0+i*STEP,
  box,bc:[(box[0]+box[2])/2,(box[1]+box[3])/2],p:PATHS.find(o=>o.id===d[0]).p};});
DURATION=S_T0+STEPS.length*STEP;
// ключевые моменты внутри шага (с от начала шага)
const K={arrive:1.7,hl:1.9,idx:2.0,name:2.25,num:2.75,unit:3.75,card:5.0,fill:5.5,chip:6.0,land:6.6,grow:.8};
const FLAGS={};for(const s of STEPS){const im=new Image();im.src=`../flags/${s.fl}.svg`;FLAGS[s.fl]=im;}
window.ready=window.ready.then(()=>Promise.all(Object.values(FLAGS).map(im=>im.complete?0:new Promise(r=>im.onload=im.onerror=r))));
// ---------- камера: перелёт с дугой по зуму, страна слева под крупный текст, потом в центр ----------
function view(box,reg,k,zmax=6){const z=Math.min(zmax,Math.min((reg[2]-reg[0])/(box[2]-box[0]),(reg[3]-reg[1])/(box[3]-box[1]))*k);
  return[(box[0]+box[2])/2-((reg[0]+reg[2])/2-W/2)/z,(box[1]+box[3])/2-((reg[1]+reg[3])/2-H/2)/z,z];}
const REG_L=[100,200,900,860],REG_C=[90,180,1430,860];
for(const s of STEPS){const pv=CAM[CAM.length-1],L=view(s.box,REG_L,.82),C=view(s.box,REG_C,.78);
  if(s.i)CAM.push([s.t0+.12,pv[1],pv[2],pv[3],pv[4],0]);
  // в середине перелёта обе точки помещаются в ~1400 px — дальний прыжок идёт через отъезд
  const dist=Math.hypot(L[0]-pv[1],L[1]-pv[2]),zm=Math.max(.36,Math.min(pv[3],L[2],1400/Math.max(dist,1)));
  CAM.push([s.t0+.95,lerp(pv[1],L[0],.5),lerp(pv[2],L[1],.5),zm,s.i%2?.012:-.012,0],[s.t0+K.arrive,L[0],L[1],L[2],0,0],
    [s.t0+K.card,L[0],L[1],L[2]*1.04,.004,0],[s.t0+K.card+1.0,C[0],C[1],C[2],0,0],[s.t0+STEP-.1,C[0],C[1],C[2]*1.05,-.004,0]);}
// ---------- карта: контур и бирюзовая заливка ----------
window.mapSteps=(M,t,C)=>{for(const s of STEPS){const r=t-s.t0;if(r<K.hl)continue;
  const f=eoe(seg(r,K.fill,.6)),u=eio(seg(r,K.fill,.45)),R=Math.max(s.box[2]-s.box[0],s.box[3]-s.box[1])*.9;
  if(u>0){M.globalAlpha=u*.45;M.fillStyle=COL.tq;M.fill(s.p);M.globalAlpha=1;}
  if(f>0){M.save();M.beginPath();M.arc(s.bc[0],s.bc[1],f*R,0,7);M.clip();M.fillStyle=COL.tq;M.fill(s.p);M.restore();
    M.strokeStyle=COL.edge;M.lineWidth=1.3/C.z;M.stroke(s.p);}
  const hl=seg(r,K.hl,.3)*(1-seg(r,K.fill+.6,.8));
  if(hl>0){M.save();M.globalAlpha=hl*.12*(1-f);M.fillStyle='#fff';M.fill(s.p);M.globalAlpha=hl;M.shadowColor='rgba(255,255,255,.9)';M.shadowBlur=18;
    M.strokeStyle='#fff';M.lineWidth=3/C.z;M.stroke(s.p);M.restore();}}};
// ---------- шкала и счётчик ----------
window.sumAt=t=>{let v=0,glow=0;for(const s of STEPS){const r=t-s.t0;if(r<K.land)break;v=lerp(s.prev,s.sum,eoe(seg(r,K.land,K.grow)));glow=1-seg(r,K.land+.5,.8);}return{v,glow};};
window.addedAt=t=>{let a={from:0,to:0,p:1};for(const s of STEPS){const r=t-s.t0;if(r<K.land)break;a={from:s.n-1,to:s.n,p:seg(r,K.land,.35)};}return a;};
// ---------- текст: одометр ----------
function odo(c,t,str,x,y,size,col,start,end){const nd=str.replace(/\D/g,'').length;font(c,9,size,-size*.02);c.textAlign='left';c.fillStyle=col;
  const dw=c.measureText('0').width;let px=x,k=0;
  for(const ch of str){if(!/\d/.test(ch)){c.fillText(ch,px,y);px+=c.measureText(ch).width;continue;}
    const lt=end-(nd-1-k)*.25,spins=2+k++,p=cl((t-start)/(lt-start)),pos=+ch+spins*10*(1-eoc(p));
    const fr=pos-Math.floor(pos),f=fr<.55?0:eio((fr-.55)/.45),d0=Math.floor(pos)%10,kick=t>lt?Math.exp(-(t-lt)*9)*Math.sin((t-lt)*40)*.06:0;
    c.save();c.beginPath();c.rect(px-6,y-size*.8,dw+12,size*.88);c.clip();c.fillText(String(d0),px,y-f*size*.98+kick*size);
    if(f>.001)c.fillText(String((d0+1)%10),px,y+(1-f)*size*.98+kick*size);c.restore();px+=dw;}
  return px-x;}
const CD={x:1478,y:168,w:402,h:488};
function fitSize(c,s,w,max,maxW){font(c,w,100);return Math.min(max,100*maxW/c.measureText(s).width);}
window.stepsUI=(c,t,C)=>{for(const s of STEPS){const r=t-s.t0;if(r<K.chip-4.3||r>STEP+.6)continue;drawStep(c,t,r,s,C);}};
function drawStep(c,t,r,s,C){
  // затемнение справа под крупным текстом
  const dim=seg(r,1.8,.4)*(1-seg(r,K.card,.6));if(dim>0){const g=c.createLinearGradient(760,0,1500,0);g.addColorStop(0,'rgba(8,12,34,0)');g.addColorStop(1,`rgba(8,12,34,${.75*dim})`);c.fillStyle=g;c.fillRect(760,140,W-760,760);}
  const idx='#'+String(s.n).padStart(2,'0'),num=fmt(s.pop),nameH=fitSize(c,s.name,9,170,860),nameC=fitSize(c,s.name,9,58,330);
  // выход карточки в начале следующего шага
  const ex=eie(seg(r,STEP,.45));c.save();if(ex>0){c.translate(ex*560,0);c.globalAlpha=1-ex;c.filter=`blur(${(ex*10).toFixed(1)}px)`;}
  const col=eio(seg(r,K.card,.6)),arc=p=>-Math.sin(Math.PI*p)*34;
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
  {const p=eio(seg(r,K.card+.1,.6)),NS=210;
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
