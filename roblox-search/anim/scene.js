// Roblox search interest (Episode 05) — 8:00, EN. Стиль выпуска 04: тёмная карта и наш интерфейс, флаг-персонаж с глазами.
// Обратный отсчёт 83 мест: от низкого индекса к высокому, общая шкала 0–100; карта постепенно окрашивается по индексу.
const W=1920,H=1080,cv=document.getElementById('c'),X=cv.getContext('2d');
const COL={bg:'#101B30',land:'#222C45',edge:'#101B30',or:'#FF9A45',tq:'#27D6CB',ui:'#172440',ui2:'#21304F',txt:'#F5F2E9',mut:'#9AA7C2',dot:'#24314D',ex:'#1C2640'};
// ---------- математика ----------
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,p)=>a+(b-a)*p,seg=(t,a,d)=>cl((t-a)/d);
const eio=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,eoe=p=>p>=1?1:1-Math.pow(2,-10*p),eie=p=>p<=0?0:Math.pow(2,10*p-10),eoc=p=>1-Math.pow(1-p,3);
function spring(t,f=2,z=.6){if(t<=0)return 0;const w=2*Math.PI*f,wd=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));}
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
// ---------- палитра индекса 0–100 (одна на карте, в шкалах и в легенде) ----------
const PAL=[[0,[96,110,214]],[20,[52,156,214]],[40,[39,214,203]],[60,[184,224,90]],[80,[255,201,60]],[100,[255,122,69]]];
function palRGB(v){for(let i=1;i<PAL.length;i++)if(v<=PAL[i][0]){const [a,ca]=PAL[i-1],[b,cb]=PAL[i],p=(v-a)/(b-a);return ca.map((c,k)=>Math.round(lerp(c,cb[k],p)));}return PAL[PAL.length-1][1];}
const pal=(v,a=1)=>{const c=palRGB(v);return `rgba(${c[0]},${c[1]},${c[2]},${a})`;};
// цвет цифр: палитра, осветлённая к белому — низкие индексы читаются на тёмном
const palT=v=>{const c=palRGB(v).map(x=>Math.round(lerp(x,255,.45)));return `rgb(${c})`;};
function palGrad(c,x0,x1){const g=c.createLinearGradient(x0,0,x1,0);for(const [v,k] of PAL)g.addColorStop(v/100,`rgb(${k})`);return g;}
// ---------- тайминг ----------
const S_T0=20,LEN5=5,LEN8=8,N5=78;
const ACTS=['Locate','Compare','Stack','Reveal','Map'];
let _t=S_T0;
const STEPS=DATA.map((d,i)=>{const fin=i>=N5,len=fin?LEN8:LEN5,s={i,id:d[0],fl:d[1],name:d[2].toUpperCase(),v:d[3],rank:RANK[i],tie:TIE[i],fin,len,t0:_t,
  act:fin?'Final':ACTS[i%5],newV:!i||DATA[i-1][3]!==d[3]};_t+=len;return s;});
const FIN=_t,DURATION=480;   // 450 → 480: итоговая карта, легенда, вопрос и конечная заставка
// внутренние моменты шага (с от начала шага): по брифу 0–0.6 камера+пульс, 0.6–1.2 флаг и имя, 1.2–2.0 шкала, до 4.5 держим, 4.5–5 переход
const K5={arrive:.6,reveal:.6,name:.72,bar:1.2,barEnd:2.0,out:4.5};
const K8={arrive:1.0,reveal:1.0,name:1.12,bar:1.4,barEnd:2.4,out:6.0};
for(const s of STEPS){s.K=s.fin?K8:K5;const ties=STEPS.filter(o=>o.v===s.v);s.tieN=ties.indexOf(s)+1;s.prevS=s.i?STEPS[s.i-1]:null;}
// ---------- камера ----------
function view(box,reg,k,zmax=7){const z=Math.min(zmax,Math.min((reg[2]-reg[0])/(box[2]-box[0]),(reg[3]-reg[1])/(box[3]-box[1]))*k);
  return[(box[0]+box[2])/2-((reg[0]+reg[2])/2-W/2)/z,(box[1]+box[3])/2-((reg[1]+reg[3])/2-H/2)/z,z];}
const WORLD=[0,140,4000,1880],WV=view(WORLD,[40,130,1880,1000],1),WVL=view(WORLD,[360,130,1460,920],1);
const CAM=[];const key=(t,v,rot=0)=>CAM.push([t,v[0],v[1],v[2],rot,0]);
function camera(t){const K=CAM.map(k=>[k[0],k[1],k[2],Math.log(k[3]),k[4]]),n=K.length;let i=0;while(i<n-2&&t>K[i+1][0])i++;
  const t0=K[i][0],h=K[i+1][0]-t0,u=cl((t-t0)/h);
  const sl=(j,c)=>(K[j+1][c]-K[j][c])/(K[j+1][0]-K[j][0]);
  const tan=(j,c)=>{if(j<=0||j>=n-1)return 0;const a=sl(j-1,c),b=sl(j,c);if(a*b<=0)return 0;return 2/(1/a+1/b);};
  const Hm=c=>{const p0=K[i][c],p1=K[i+1][c],m0=tan(i,c)*h,m1=tan(i+1,c)*h,u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*p0+(u3-2*u2+u)*m0+(-2*u3+3*u2)*p1+(u3-u2)*m1;};
  return{cx:Hm(1),cy:Hm(2),z:Math.exp(Hm(3)),rot:Hm(4)};}
const toScreen=(C,x,y)=>{const dx=(x-C.cx)*C.z,dy=(y-C.cy)*C.z,c=Math.cos(C.rot),s=Math.sin(C.rot);return[W/2+dx*c-dy*s,H/2+dx*s+dy*c];};
// ---------- карта ----------
const PATHS=Object.entries(MAP).map(([id,m])=>({id,p:new Path2D(m.d)}));const PBY={};for(const o of PATHS)PBY[o.id]=o.p;
const RU=PBY['643'],RU_IN=DATA.some(r=>r[0]==='643');
const REGS=['EUR','MENA','SAS','EAS','SEA','AFR','NAM','LAM','OCE','CAS'];
for(const s of STEPS){const box=VIEWS[s.fl]||MAINBOX[s.id];s.box=box;s.bc=[(box[0]+box[2])/2,(box[1]+box[3])/2];s.p=PBY[s.id];
  s.tiny=Math.max(box[2]-box[0],box[3]-box[1])<16;
  s.vbox=s.tiny?[s.bc[0]-50,s.bc[1]-40,s.bc[0]+50,s.bc[1]+40]:box;if(VIEWS[s.fl+'c'])s.vbox=VIEWS[s.fl+'c']; // огромные страны (Россия): камера на основную часть, а не на всю ширину
  const B=MAP[s.id].b;s.R=Math.max(...[[B[0][0],B[0][1]],[B[1][0],B[0][1]],[B[0][0],B[1][1]],[B[1][0],B[1][1]]].map(([x,y])=>Math.hypot(x-s.bc[0],y-s.bc[1])));
  let best=null,ba=1e12;for(const r of REGS){const b=VIEWS[r];if(s.bc[0]>=b[0]&&s.bc[0]<=b[2]&&s.bc[1]>=b[1]&&s.bc[1]<=b[3]){const a=(b[2]-b[0])*(b[3]-b[1]);if(a<ba){ba=a;best=r;}}}s.reg=VIEWS[best||'EUR'];}
const STEP_BY_ID={};for(const s of STEPS)STEP_BY_ID[s.id]=s;
// штриховка «не включено» (Россия)
const hatch=(()=>{const c=document.createElement('canvas');c.width=c.height=14;const g=c.getContext('2d');g.fillStyle=COL.ex;g.fillRect(0,0,14,14);g.strokeStyle='#33405F';g.lineWidth=2;g.beginPath();g.moveTo(-2,16);g.lineTo(16,-2);g.moveTo(-2,2);g.lineTo(2,-2);g.moveTo(12,16);g.lineTo(16,12);g.stroke();return c;})();
const mc=document.createElement('canvas');mc.width=W;mc.height=H;const MM=mc.getContext('2d');
let HATCH=null;
function drawMap(t,C,M=MM){M.setTransform(1,0,0,1,0,0);M.clearRect(0,0,W,H);
  M.setTransform(1,0,0,1,W/2,H/2);M.rotate(C.rot);M.scale(C.z,C.z);M.translate(-C.cx,-C.cy);
  M.fillStyle=COL.land;for(const o of PATHS)if(o.id!=='643')M.fill(o.p);M.fillStyle=COL.land;
  if(RU_IN)M.fill(RU);else{if(!HATCH)HATCH=M.createPattern(hatch,'repeat');HATCH.setTransform(new DOMMatrix().scale(1/C.z));M.fillStyle=HATCH;M.fill(RU);}
  // окрашенные: цвет индекса появляется, когда шаг страны закончился (до этого — флаг)
  for(const s of STEPS){const r=t-s.t0;if(r<s.K.reveal)continue;
    const f=eoe(seg(r,s.K.reveal+.1,.6)),col=seg(r,s.K.out+.1,.8)*(s.fin?1-seg(t,FIN-.01,.01)*0:1);
    if(col<1){M.save();if(f<.999){M.beginPath();M.arc(s.bc[0],s.bc[1],f*s.R,0,7);M.clip();}M.clip(s.p);flagFill(M,FLAGS[s.fl],s.box,s.fl);M.restore();}
    if(col>0){M.globalAlpha=col;M.fillStyle=pal(s.v);M.fill(s.p);M.globalAlpha=1;}}
  M.lineJoin='round';M.strokeStyle=COL.edge;M.lineWidth=1.3/C.z;for(const o of PATHS)M.stroke(o.p);
  // контур текущей: белый пульс при прилёте; «Map» — кольца пульса
  for(const s of STEPS){const r=t-s.t0;if(r<-.1||r>s.len+.3)continue;const hl=seg(r,-.1,.3)*(1-seg(r,s.K.out,.5));if(hl<=0)continue;
    const pu=.6+.4*Math.sin(r*9);M.save();M.globalAlpha=hl*(r<s.K.reveal+.4?1:.75);M.shadowColor='rgba(255,255,255,.9)';M.shadowBlur=18*pu;M.strokeStyle='#fff';M.lineWidth=3.2/C.z;M.stroke(s.p);M.restore();}
  M.setTransform(1,0,0,1,0,0);}
// полосатые флаги огромных стран растягиваются на всю рамку страны — видны все три полосы
const STRETCH={ru:1};
function flagFill(M,im,box,fl){if(STRETCH[fl]){M.drawImage(im,box[0],box[1],box[2]-box[0],box[3]-box[1]);return;}const bw=box[2]-box[0],bh=box[3]-box[1],sc=Math.max(bw/4,bh/3),w=4*sc,h=3*sc;M.drawImage(im,(box[0]+box[2])/2-w/2,(box[1]+box[3])/2-h/2,w,h);}
function dots(c,C){const k=.4,step=28,ox=-(C.cx*C.z*k)%step,oy=-(C.cy*C.z*k)%step;c.fillStyle=COL.dot;c.globalAlpha=.7;
  for(let x=ox-step;x<W+step;x+=step)for(let y=oy-step;y<H+step;y+=step){c.beginPath();c.arc(x,y,1.6,0,7);c.fill();}c.globalAlpha=1;}
function dust(c,t,C){for(let i=0;i<22;i++){const f=1.6+hash(i+4)*.6,r=6+hash(i+1)*22;
  const x=((hash(i)*(W+400)-C.cx*C.z*f*.25+t*(8+hash(i+9)*14))%(W+400)+W+400)%(W+400)-200,y=((hash(i+20)*(H+300)-C.cy*C.z*f*.25-t*(6+hash(i+11)*10))%(H+300)+H+300)%(H+300)-150;
  const g=c.createRadialGradient(x,y,0,x,y,r);const col=i%4?'160,200,230':'255,175,110';g.addColorStop(0,`rgba(${col},${.07+hash(i+5)*.07})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();}}
// ---------- текст ----------
const FAM={2:'N2',7:'N7',9:'N9'};
function font(c,w,size,ls=0){c.font=`${size}px ${FAM[w]}`;c.letterSpacing=ls+'px';}
function fitSize(c,s,w,max,maxW,ls=0){font(c,w,100,ls);return Math.min(max,100*maxW/c.measureText(s).width);}
// слово: вход a (slam | mask | track | skew | flip), выход ex (left | up | push | fade)
function word(c,t,o){const tin=o.in;if(t<tin||t>(o.out??1e9)+.6)return;
  const size=o.size;let ls=o.ls||0;const pin=seg(t,tin,o.dur||.45);let dx=0,dy=0,sc=1,rot=0,sy=1,skew=0,al=1,clip=null,blur=0;
  switch(o.a){
    case'slam':{const p=spring(t-tin,2.2,.55);sc=lerp(o.from||1.8,1,p);al=seg(t,tin,.08);blur=(1-cl(p))*8;break;}
    case'mask':{dy=(1-eoe(pin))*size*1.1;clip=true;break;}
    case'track':{const e=eoe(pin);ls=lerp(o.ls0??90,ls,e);al=seg(t,tin,.25);break;}
    case'skew':{const e=eoe(pin);dx=-(1-e)*320;skew=(1-e)*.55;al=seg(t,tin,.15);blur=(1-e)*10;break;}
    case'flip':{const p=spring(t-tin,1.8,.6);sy=Math.max(.02,cl(p,0,1.15));skew=(1-cl(p))*-.5;rot=(1-cl(p))*.08;al=seg(t,tin,.08);break;}
    case'fade':{al=eoc(pin);break;}}
  if(o.out!=null&&t>o.out){const po=seg(t,o.out,o.odur||.4),e=eie(po);
    if(o.ex==='left'){dx-=e*1500;skew-=e*.45;blur+=e*14;}
    else if(o.ex==='up'){dy-=eie(po)*size*1.1;clip=true;}
    else if(o.ex==='push'){sc*=1+eie(po)*2.2;al*=1-po;blur+=po*18;}
    else al*=1-po;}
  if(al<=0)return;
  c.save();font(c,o.w,size,ls);c.textBaseline='alphabetic';c.textAlign=o.al||'left';
  if(clip){const wd=c.measureText(o.s).width,x0=o.al==='center'?o.x-wd/2:o.al==='right'?o.x-wd:o.x;c.beginPath();c.rect(x0-80,o.y-size*1.02,wd+160,size*1.3);c.clip();}
  c.translate(o.x+dx,o.y+dy);c.rotate(rot);c.transform(1,0,skew,1,0,0);c.scale(sc,sc*sy);
  c.globalAlpha=al*(o.alpha??1);if(blur>.3)c.filter=`blur(${blur.toFixed(1)}px)`;
  if(o.glow){c.shadowColor=o.glow;c.shadowBlur=40;}
  c.fillStyle=o.col||COL.txt;if(o.rich)rich(c,o.s,0,0,o.col||COL.txt,o.al||'left');else c.fillText(o.s,0,0);c.restore();}
// одометр: каждая цифра крутится колонкой и фиксируется в свой момент (справа налево к end)
function odo(c,t,str,x,y,size,col,start,end,gap=.12,al='left'){const nd=str.replace(/\D/g,'').length;font(c,9,size,-size*.02);c.textAlign='left';c.fillStyle=col;
  const dw=c.measureText('0').width;let tw=0;for(const ch of str)tw+=/\d/.test(ch)?dw:c.measureText(ch).width;let px=al==='center'?x-tw/2:al==='right'?x-tw:x,k=0;
  for(const ch of str){if(!/\d/.test(ch)){c.fillText(ch,px,y);px+=c.measureText(ch).width;continue;}
    const lt=end-(nd-1-k)*gap,spins=1+k++,p=cl((t-start)/(lt-start)),pos=+ch+spins*10*(1-eoc(p));
    const fr=pos-Math.floor(pos),f=fr<.55?0:eio((fr-.55)/.45),d0=Math.floor(pos)%10,kick=t>lt?Math.exp(-(t-lt)*9)*Math.sin((t-lt)*40)*.06:0;
    c.save();c.beginPath();c.rect(px-6,y-size*.8,dw+12,size*.88);c.clip();c.fillText(String(d0),px,y-f*size*.98+kick*size);
    if(f>.001)c.fillText(String((d0+1)%10),px,y+(1-f)*size*.98+kick*size);c.restore();px+=dw;}
  return tw;}
// строка с ключевым словом: «*ключ*» — бирюзовый, «^ключ^» — оранжевый
function rich(c,str,x,y,col,al='left'){const parts=str.split(/([*^][^*^]+[*^])/).filter(Boolean);
  let w=0;for(const p of parts)w+=c.measureText(p[0]==='*'||p[0]==='^'?p.slice(1,-1):p).width;let px=al==='center'?x-w/2:al==='right'?x-w:x;c.textAlign='left';
  for(const p of parts){const k=p[0]==='*'?COL.tq:p[0]==='^'?COL.or:null,txt=k?p.slice(1,-1):p;c.fillStyle=k||col;c.fillText(txt,px,y);px+=c.measureText(txt).width;}return w;}
// ---------- интерфейс: общие элементы ----------
function rr(c,x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}}
// флаги: SVG растрируются один раз в 640×480 (без этого у SVG без размеров «натуральный» размер 300×150)
const FLAGS={},FLAG_IM={};for(const s of STEPS){const im=new Image();im.src=`../flags/${s.fl}.svg`;FLAG_IM[s.fl]=im;}
function rasterFlags(){for(const k in FLAG_IM){const c=document.createElement('canvas');c.width=640;c.height=480;c.getContext('2d').drawImage(FLAG_IM[k],0,0,640,480);FLAGS[k]=c;}}
function flag(c,x,y,w,im){const h=w*.75;c.save();c.beginPath();c.roundRect(x,y,w,h,w*.12);c.clip();c.drawImage(im,x,y,w,h);c.restore();}
// флаг развевается: вертикальные полосы со сдвигом по синусу
function flagWave(c,im,x,y,w,amp,t){const h=w*.75,N=22,sw=w/N;c.save();c.beginPath();c.roundRect(x-2,y-amp-2,w+4,h+2*amp+4,w*.12);c.clip();
  for(let i=0;i<N;i++){const u=i/N,dy=Math.sin(u*5-t*7)*amp*u;c.drawImage(im,u*im.width,0,im.width/N+1,im.height,x+i*sw,y+dy,sw+1,h);}
  c.restore();}
// мультяшные глаза (как в выпуске 04)
function eyes(c,x,y,s,lx,ly,mood,blink=0,al=1){if(s<6||al<=0)return;c.save();c.globalAlpha=al;c.translate(x,y);const sy=1-blink*.9;
  if(mood==='wide')s*=1.12;
  for(const k of [-1,1]){const ex=k*s*.62;c.save();c.translate(ex,0);c.scale(1,sy);c.fillStyle='#fff';c.strokeStyle='#14121F';c.lineWidth=s*.14;c.beginPath();c.ellipse(0,0,s*.5,s*.62,0,0,7);c.fill();c.stroke();
    const d=Math.hypot(lx,ly)||1,px=lx/d*s*.16,py=ly/d*s*.2,pr=mood==='wide'?s*.2:s*.25;c.fillStyle='#14121F';c.beginPath();c.arc(px,py,pr,0,7);c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(px-s*.08,py-s*.1,s*.07,0,7);c.fill();c.restore();
    if(mood==='wide'){c.strokeStyle='#14121F';c.lineWidth=s*.14;c.lineCap='round';c.beginPath();c.arc(ex,-s*.66,s*.42,Math.PI*1.22,Math.PI*1.78);c.stroke();}}
  c.restore();}
function blinkAt(t,seed){const ph=(t+hash(seed)*5)%4.3;return ph<.14?Math.sin(ph/.14*Math.PI):0;}
// шкала 0–100 с делениями: x,y,w,h; v — значение, p — доля анимации
function scale100(c,x,y,w,h,v,p,{ticks=true,labels=true,bg=COL.ui2}={}){rr(c,x,y,w,h,h/2,bg);
  if(v*p>0){c.save();c.beginPath();c.roundRect(x,y,w,h,h/2);c.clip();c.fillStyle=palGrad(c,x,x+w);c.fillRect(x,y,Math.max(h*.6,w*v*p/100),h);c.fillStyle='rgba(255,255,255,.28)';c.fillRect(x,y+h*.18,w*v*p/100,h*.22);c.restore();}
  if(ticks)for(const m of [25,50,75]){c.fillStyle='rgba(16,27,48,.55)';c.fillRect(x+w*m/100-1.5,y,3,h);}
  if(labels){font(c,7,15,1);c.fillStyle=COL.mut;c.textAlign='center';for(const m of [0,25,50,75,100])c.fillText(String(m),x+w*m/100,y+h+20);}}
// ---------- постоянные подписи: метрика и оговорка ----------
function footer(c,t){const a=seg(t,.4,.6)*(1-seg(t,DURATION-.6,.5));if(a<=0)return;c.save();c.globalAlpha=a;
  font(c,9,18,3);const s='GOOGLE SEARCH INTEREST · JAN–SEP 2026',w=c.measureText(s).width;rr(c,40,1018-26,w+40,38,19,'rgba(23,36,64,.92)');c.fillStyle=COL.txt;c.textAlign='left';c.fillText(s,60,1018);
  font(c,7,15,2);const s2='INDEX 0–100 · NOT PLAYER COUNTS',w2=c.measureText(s2).width;rr(c,W-40-w2-36,1018-23,w2+36,32,16,'rgba(23,36,64,.92)');c.fillStyle=COL.mut;c.fillText(s2,W-40-w2-18,1017);
  c.restore();}
const uc=document.createElement('canvas');uc.width=W;uc.height=H;const U=uc.getContext('2d');
// ---------- кадр ----------
function frame(t){const C=camera(t);X.setTransform(1,0,0,1,0,0);X.fillStyle=COL.bg;X.fillRect(0,0,W,H);dots(X,C);
  drawMap(t,C);X.drawImage(mc,0,0);
  const v=X.createRadialGradient(W/2,H*.45,H*.35,W/2,H*.45,H*1.05);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');X.fillStyle=v;X.fillRect(0,0,W,H);
  intro(X,t,C);
  for(const s of STEPS){const r=t-s.t0;if(r<-.2||r>s.len+.8)continue;if(s.tiny)lens(X,t,r,s,C);mapEyes(X,t,r,s,C);}
  rail(X,t);podium(X,t);card(X,t,C);header(X,t);closing(X,t,C);footer(X,t);dust(X,t,C);}
window.seek=async t=>frame(t);
