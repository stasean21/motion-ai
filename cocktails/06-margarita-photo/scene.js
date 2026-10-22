// Margarita · анимация фото. Каждый кадр считается от времени в window.seek(t).
// Слой 1 (WebGL): фото без рамки — камера с параллаксом по карте глубины, штора колышется, жидкость дрожит,
// лампа мерцает, по стеклу проходит блик. Слой 2 (2D): пузырьки, искры соли, боке, рамка с веером, текст.
// ?text=0 — чистая версия без текста, все движения периодичны с периодом DUR (бесшовный цикл).
const Q=new URLSearchParams(location.search), TEXT=Q.get('text')!=='0';
const DUR=16, W=2*Math.PI/DUR, PW=941, PH=1672, SC=1080/PW;
const CREAM='#F1E4CF', SOFT='#C9AE8E', LIME='#C8F05A';
const TX={need:'YOU WILL NEED',cocktail:'COCKTAIL',name:'Margarita',classic:'THE MEXICAN CLASSIC',
  rows:[['50','TEQUILA',0],['25','ORANGE LIQUEUR',0],['25','LIME JUICE',1]],extra:'+   SALT  ·  ICE  ·  LIME WHEEL',
  ratio:'REMEMBER THE RATIO',labels:['tequila','liqueur','lime'],save:'Save this recipe',warn:'PLEASE DRINK RESPONSIBLY'};

const cv=document.getElementById('c');let X=cv.getContext('2d');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), lerp=(a,b,k)=>a+(b-a)*k;
const ease=k=>{k=clamp(k);return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2}, eout=k=>1-Math.pow(1-clamp(k),3);
const seg=(t,a,b)=>clamp((t-a)/(b-a));
function rng(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}

// ---------- камера ----------
// Наезд и отъезд за один период, чтобы чистая версия зацикливалась. P — сдвиг параллакса в пикселях фото.
function cam(t){const k=(1-Math.cos(W*t))/2;
  return{Z:1.04+.05*k,C:[470.5,836+12*k],P:[11*Math.sin(W*t),4*Math.sin(2*W*t)]};}
function toS(c,x,y,d){const k=SC*c.Z;return[(x-d*c.P[0]-c.C[0])*k+540,(y-d*c.P[1]-c.C[1])*k+960];}

// ---------- слой фото (WebGL) ----------
const gc=document.createElement('canvas');gc.width=1080;gc.height=1920;
const gl=gc.getContext('webgl',{preserveDrawingBuffer:true,antialias:false});
const FS=`precision highp float;
uniform sampler2D img;uniform vec2 res;uniform float t,Z,S,lampF,glint,fade;uniform vec2 C,P;
const float W=${W.toFixed(8)};const vec2 TS=vec2(${PW}.,${PH}.);
float bowl(vec2 p){float k=clamp((p.y-830.)/225.,0.,1.);float hw=262.*pow(max(1.-k*k*k,0.),1./3.);
  return smoothstep(10.,-10.,abs(p.x-462.)-hw)*smoothstep(764.,782.,p.y)*smoothstep(1064.,1046.,p.y);}
float lime(vec2 p){return smoothstep(116.,106.,length(p-vec2(712.,805.)));}
float stem(vec2 p){float hw=24.+50.*smoothstep(1100.,1048.,p.y)+30.*smoothstep(1360.,1400.,p.y);
  return smoothstep(6.,-6.,abs(p.x-470.)-hw)*smoothstep(1036.,1046.,p.y)*smoothstep(1412.,1398.,p.y);}
float foot(vec2 p){return smoothstep(1.08,.95,length((p-vec2(466.,1428.))/vec2(186.,44.)));}
float glass(vec2 p){return max(max(bowl(p),lime(p)),max(stem(p),foot(p)));}
float edge(float x){return 1212.+x*.08;}
float depth(vec2 p){float cnt=smoothstep(-12.,12.,p.y-edge(p.x));
  float d=cnt*(.4+.6*clamp((p.y-1215.)/457.,0.,1.));
  d=max(d,(1.-smoothstep(240.,300.,p.x))*smoothstep(700.,760.,p.y)*(1.-cnt)*.15);
  return mix(d,.62,glass(p));}
vec3 tex(vec2 p){return texture2D(img,clamp(p,vec2(.5),TS-.5)/TS).rgb;}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 fc=vec2(gl_FragCoord.x,res.y-gl_FragCoord.y);
  vec2 p0=(fc-res*.5)/(S*Z)+C;vec2 p=p0+depth(p0)*P;p=p0+depth(p)*P;
  // штора: висит сверху, внизу качается сильнее; стекло, стойку и лампу не трогаем
  float g=glass(p),cnt=smoothstep(-20.,10.,p.y-edge(p.x));
  float lz=(1.-smoothstep(200.,320.,p.x))*smoothstep(680.,760.,p.y);
  float wc=(1.-g)*(1.-cnt)*(1.-lz),hang=clamp(p.y/1150.,0.,1.);
  p.x+=wc*hang*(3.4*sin(p.y*.0035-t*W*2.+p.x*.004)+1.7*sin(p.y*.007+t*W*3.+1.7));
  // жидкость: лёгкая дрожь под пеной
  float liq=bowl(p)*smoothstep(848.,872.,p.y)*(1.-lime(p));
  p+=liq*vec2(.6*sin(p.y*.08+t*W*8.),.5*sin(p.x*.06+t*W*6.));
  vec3 c=tex(p);
  vec3 bl=(tex(p+vec2(1.,0.))+tex(p-vec2(1.,0.))+tex(p+vec2(0.,1.))+tex(p-vec2(0.,1.)))*.25;
  c=max(c+(c-bl)*.45,0.);
  // свет скользит по складкам бархата
  c*=1.+wc*hang*.11*sin(p.x*.03-t*W*2.+2.*sin(p.y*.003+t*W));
  // лампа слева и её отражение на стойке
  float lw=exp(-dot(p-vec2(18.,880.),p-vec2(18.,880.))/24200.)+.8*exp(-dot(p-vec2(10.,1260.),p-vec2(10.,1260.))/16200.);
  c=c*(1.+lampF*lw)+vec3(1.,.62,.28)*max(lampF,0.)*.08*lw;
  // каустика в напитке
  float ca=.5+.5*sin(p.x*.05+p.y*.03+t*W*4.)*sin(p.x*.021-p.y*.06-t*W*3.);
  c+=liq*.05*vec3(.9,1.,.6)*ca*ca*ca;
  // блик по стеклу
  float u=(p.x-462.)*.85+(p.y-900.)*.55,band=exp(-pow((u-glint)/24.,2.));
  float gm=max(bowl(p),stem(p))*(1.-lime(p))+.5*lime(p)+.6*foot(p);
  c+=vec3(1.,.98,.9)*band*gm*.3*(.35+.65*dot(c,vec3(.33)));
  vec2 q=(fc/res-.5)*vec2(1.,1.15);c*=mix(1.,.8,smoothstep(.35,.75,length(q)));
  c+=(hash(fc+fract(t*7.13))-.5)*2./255.;
  gl_FragColor=vec4(c*fade,1.);}`;
let U={};
(function(){const sh=(ty,src)=>{const s=gl.createShader(ty);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  ['res','t','Z','S','lampF','glint','fade','C','P'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));})();

// блик по стеклу: проходы в секундах (начало), длительность 1.1 с
const GLINTS=[2.2,10.2];
function glintPos(t){for(const a of GLINTS){const k=(t-a)/1.1;if(k>=0&&k<=1)return lerp(-380,420,ease(k));}return 9999;}
function lampF(t){return .07*(.5*Math.sin(W*27*t)+.3*Math.sin(W*43*t+1)+.2*Math.sin(W*71*t+2));}

function drawPhoto(t,c,fade){gl.viewport(0,0,1080,1920);
  gl.uniform2f(U.res,1080,1920);gl.uniform1f(U.t,t);gl.uniform1f(U.Z,c.Z);gl.uniform1f(U.S,SC);
  gl.uniform1f(U.lampF,lampF(t));gl.uniform1f(U.glint,glintPos(t));gl.uniform1f(U.fade,fade);
  gl.uniform2f(U.C,c.C[0],c.C[1]);gl.uniform2f(U.P,c.P[0],c.P[1]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  X.drawImage(gc,0,0);}

// ---------- пузырьки ----------
const bowlHW=y=>{const k=clamp((y-830)/225);return 262*Math.cbrt(Math.max(1-k*k*k,0));};
const BUB=(()=>{const r=rng(7),a=[];for(let i=0;i<70;i++){const x=lerp(250,590,r()),dx=Math.abs(x-462);
  const yb=830+225*Math.cbrt(Math.max(1-Math.pow(Math.min(dx/262,.99),3),0))-10;
  a.push({x,yb,c:1+Math.floor(r()*3),ph:r(),rad:lerp(.8,2.1,r()*r()),wob:r()*6});}return a;})();
function bowlPath(c){X.beginPath();for(let i=0;i<=40;i++){const y=lerp(858,1052,i/40),[sx,sy]=toS(c,462-bowlHW(y)+6,y,.62);i?X.lineTo(sx,sy):X.moveTo(sx,sy);}
  for(let i=40;i>=0;i--){const y=lerp(858,1052,i/40),[sx,sy]=toS(c,462+bowlHW(y)-6,y,.62);X.lineTo(sx,sy);}X.closePath();}
function drawBubbles(t,c,a){if(a<=0)return;const k=SC*c.Z;X.save();bowlPath(c);X.clip();
  for(const b of BUB){const f=(b.ph+t*b.c/DUR)%1,y=lerp(b.yb,860,f),x=b.x+2.5*Math.sin(W*t*3+b.wob);
    const al=a*Math.min(f/.12,1)*Math.min((1-f)/.1,1);if(al<=0)continue;const[sx,sy]=toS(c,x,y,.62),r=b.rad*k;
    X.globalAlpha=al*.55;X.strokeStyle='#fffbe8';X.lineWidth=1;X.beginPath();X.arc(sx,sy,r,0,7);X.stroke();
    X.globalAlpha=al*.18;X.fillStyle='#ffffff';X.fill();
    X.globalAlpha=al*.8;X.beginPath();X.arc(sx-r*.35,sy-r*.35,Math.max(r*.3,.6),0,7);X.fill();}
  X.restore();X.globalAlpha=1;}

// ---------- искры соли ----------
const SPK=(()=>{const r=rng(11),a=[];const add=(p,big)=>a.push({x:p[0],y:p[1],sz:p[2],c:1+Math.floor(r()*2),ph:r(),big});
  SPARKLES.rim.filter(p=>p[2]>=6).forEach(p=>add(p,0));SPARKLES.salt.filter(p=>p[2]>=8).forEach(p=>add(p,1));return a;})();
function star(x,y,R,al){const g=X.createRadialGradient(x,y,0,x,y,R*.6);g.addColorStop(0,`rgba(255,250,235,${al*.9})`);g.addColorStop(1,'rgba(255,240,210,0)');
  X.fillStyle=g;X.beginPath();X.arc(x,y,R*.6,0,7);X.fill();
  X.strokeStyle=`rgba(255,252,240,${al})`;X.lineCap='round';
  for(const[dx,dy,s]of[[1,0,1],[0,1,1],[.7,.7,.45],[.7,-.7,.45]]){X.lineWidth=s>.5?1.6:1;X.beginPath();X.moveTo(x-dx*R*s,y-dy*R*s);X.lineTo(x+dx*R*s,y+dy*R*s);X.stroke();}}
function drawSparkles(t,c,a){if(a<=0)return;X.save();X.globalCompositeOperation='lighter';
  for(const s of SPK){const f=(s.ph+t*s.c/DUR)%1,L=.05;if(f>L)continue;const al=a*Math.sin(Math.PI*f/L);
    const d=s.big?.4+.6*clamp((s.y-1215)/457):.62,[sx,sy]=toS(c,s.x,s.y,d);
    star(sx,sy,(s.big?10:8)+Math.min(s.sz,60)*.22,al*.85);}
  X.restore();}

// ---------- боке на переднем плане ----------
const BOK=(()=>{const r=rng(23),a=[];for(let i=0;i<9;i++)a.push({x:r()*1080,y:lerp(150,1800,r()),R:lerp(30,85,r()),c:1+Math.floor(r()*2),ph:r()*6.28,
  col:r()<.45?'200,240,90':'235,185,100',al:lerp(.05,.11,r())});return a;})();
function drawBokeh(t,c,a){X.save();X.globalCompositeOperation='screen';
  for(const b of BOK){const x=b.x+50*Math.sin(W*t*b.c+b.ph)-c.P[0]*SC*1.6,y=b.y+40*Math.cos(W*t*b.c+b.ph*1.3)-c.P[1]*SC*1.6;
    const g=X.createRadialGradient(x,y,b.R*.2,x,y,b.R);g.addColorStop(0,`rgba(${b.col},${b.al*a})`);g.addColorStop(.75,`rgba(${b.col},${b.al*a*.8})`);g.addColorStop(1,`rgba(${b.col},0)`);
    X.fillStyle=g;X.beginPath();X.arc(x,y,b.R,0,7);X.fill();}
  X.restore();}

// ---------- рамка ар-деко с веером (неподвижна, как на фото) ----------
const FY=(1920-PH*SC)/2, F=(x,y)=>[x*SC,y*SC+FY];
const mir=pl=>pl.map(([x,y])=>[PW-x,y]), flip=pl=>pl.map(([x,y])=>[x,PH-y]);
const CORNER=[[21,800],[21,77],[36,77],[36,40],[300,40]], SQ=[[36,57],[51,57],[51,40]];
const FRAME=[CORNER,mir(CORNER),flip(CORNER),flip(mir(CORNER)),SQ,mir(SQ),flip(SQ),flip(mir(SQ)),
  [[300,40],[405,40]],[[641,40],[536,40]],[[300,PH-40],[641,PH-40]],[[21,800],[21,872]],[[920,800],[920,872]]];
const plen=pl=>{let L=0;for(let i=1;i<pl.length;i++)L+=Math.hypot(pl[i][0]-pl[i-1][0],pl[i][1]-pl[i-1][1]);return L*SC;};
const FAN=[0,20,40,60,90,120,140,160,180];
function framePaths(prog){X.lineCap='square';X.lineJoin='miter';
  FRAME.forEach((pl,i)=>{const L=plen(pl);X.beginPath();pl.forEach((p,j)=>{const[x,y]=F(...p);j?X.lineTo(x,y):X.moveTo(x,y);});
    if(prog<1)X.setLineDash([L*eout(prog),L+10]);X.stroke();X.setLineDash([]);});
  const[cx,cy]=F(470,79);
  FAN.forEach((a,i)=>{const k=eout(seg(prog,.05*Math.abs(i-4),.5+.05*Math.abs(i-4))),r0=(a%180===0?20:8)*SC,r1=lerp(r0,75*SC,k);if(k<=0)return;
    const ang=-a*Math.PI/180,ux=Math.cos(ang),uy=Math.sin(ang),nx=-uy,ny=ux,w0=.5,w1=2.1*SC;
    X.beginPath();X.moveTo(cx+ux*r0+nx*w0,cy+uy*r0+ny*w0);X.lineTo(cx+ux*r1+nx*w1,cy+uy*r1+ny*w1);
    X.arc(cx+ux*r1,cy+uy*r1,w1,ang+Math.PI/2,ang-Math.PI/2,true);X.lineTo(cx+ux*r0-nx*w0,cy+uy*r0-ny*w0);X.closePath();X.fill();});}
const fc=document.createElement('canvas');fc.width=1080;fc.height=1920;
function drawFrame(t,prog,a){X.save();X.globalAlpha=a;X.shadowColor='rgba(0,0,0,.6)';X.shadowBlur=6;
  const g=X.createLinearGradient(0,0,1080,1920);g.addColorStop(0,'#E2BC7C');g.addColorStop(.5,'#C99A58');g.addColorStop(1,'#E0B672');
  X.strokeStyle=X.fillStyle=g;X.lineWidth=2.8;framePaths(prog);X.restore();
  // блеск бежит по рамке по диагонали
  const f=fc.getContext('2d');f.clearRect(0,0,1080,1920);f.globalCompositeOperation='source-over';
  const k=((t/DUR)%1)*2-.2,x0=k*1600-260;const sg=f.createLinearGradient(x0,0,x0+420,700);
  sg.addColorStop(0,'rgba(255,240,200,0)');sg.addColorStop(.5,'rgba(255,244,214,.95)');sg.addColorStop(1,'rgba(255,240,200,0)');
  f.strokeStyle=f.fillStyle='#fff';f.lineWidth=2.8;drawOn(f,()=>framePaths(prog));
  f.globalCompositeOperation='source-in';f.fillStyle=sg;f.fillRect(0,0,1080,1920);
  X.save();X.globalAlpha=a*.85;X.globalCompositeOperation='lighter';X.drawImage(fc,0,0);X.restore();}
function drawOn(ctx,fn){const s=X;X=ctx;try{fn()}finally{X=s}}

// ---------- текст ----------
function txt(s,x,y,font,col,al,{ls=0,align='center',blur=22}={}){if(al<=0)return;X.save();X.globalAlpha=clamp(al);X.font=font;X.fillStyle=col;
  X.letterSpacing=ls+'px';X.textAlign=align;X.textBaseline='alphabetic';X.shadowColor='rgba(20,0,4,.75)';X.shadowBlur=blur;X.fillText(s,x,y);X.restore();}
function inOut(t,a,b,fi=.45,fo=.4){return Math.min(eout(seg(t,a,a+fi)),1-ease(seg(t,b-fo,b)));}
function drawText(t){
  // 18+
  const ba=eout(seg(t,.6,1.2));if(ba>0){X.save();X.globalAlpha=ba*.8;X.strokeStyle=SOFT;X.lineWidth=1.5;X.strokeRect(78,104,62,34);X.restore();
    txt('18+',109,129,'22px Deco',SOFT,ba*.9,{blur:0});}
  // 1. название
  {const a=inOut(t,.9,5.3),y=-20*ease(seg(t,4.9,5.3));
   txt(TX.cocktail,540,330+y,'34px Deco',SOFT,a,{ls:14});
   const w=eout(seg(t,1.2,2.6));if(w>0){X.save();X.beginPath();X.rect(0,330,lerp(80,1080,w),260);X.clip();
     txt(TX.name,540,505+y,'190px Script',CREAM,inOut(t,1.2,5.3,.2));X.restore();}
   txt(TX.classic,540,585+y,'32px Deco',SOFT,inOut(t,2.4,5.3,.5),{ls:10});}
  // 2. состав
  {const A=inOut(t,5.6,10.1);txt(TX.need,540,270,'34px Deco',SOFT,A,{ls:12});
   TX.rows.forEach(([n,w,l],i)=>{const t0=6.0+i*.5,k=eout(seg(t,t0,t0+.45)),side=i%2?1:-1,y=380+i*95;if(k<=0)return;
     X.save();X.translate(side*(1-k)*260,0);X.transform(1,0,side*(1-k)*.35,1,0,0);
     const a=k*inOut(t,5.6,10.1);txt(n,285,y,'84px Heavy',l?LIME:CREAM,a,{align:'left'});
     X.font='84px Heavy';const nw=X.measureText(n).width;txt('ml',285+nw+10,y,'30px Deco',SOFT,a,{align:'left'});
     txt(w,285+nw+70,y,'44px Deco',l?LIME:CREAM,a,{align:'left',ls:4});X.restore();});
   txt(TX.extra,540,665,'30px Deco',CREAM,.8*inOut(t,7.6,10.1),{ls:6});}
  // 3. пропорция
  {const A=inOut(t,10.4,13.5);txt(TX.ratio,540,280,'30px Deco',SOFT,A,{ls:12});
   const parts=[['2',LIME,10.6],[':',SOFT,10.9],['1',CREAM,11.0],[':',SOFT,11.3],['1',CREAM,11.4]],xs=[350,455,540,625,730];
   parts.forEach(([s,col,t0],i)=>{const k=eout(seg(t,t0,t0+.3));if(k<=0)return;X.save();X.translate(xs[i],480);X.scale(lerp(1.4,1,k),lerp(1.4,1,k));
     txt(s,0,0,s===':'?'120px Deco':'200px Heavy',col,k*A);X.restore();});
   const bars=[[250,450,LIME],[495,585,'#E8A55A'],[630,830,CREAM]].map((b,i)=>[...b,['tequila','liqueur','lime'][i]]);
   bars.forEach(([x0,x1,col,lab],i)=>{const k=eout(seg(t,11.8+i*.25,12.3+i*.25));if(k<=0)return;
     X.save();X.globalAlpha=A;X.fillStyle=col;X.fillRect(x0,525,(x1-x0)*k,6);X.restore();
     txt(TX.labels[i],(x0+x1)/2,570,'26px Deco',SOFT,k*A,{ls:3});});}
  // 4. финал
  {const a=eout(seg(t,13.7,14.4))*(1-ease(seg(t,15.5,16)));
   txt(TX.save,540,450,'128px Script',LIME,a);txt(TX.warn,540,540,'30px Deco',SOFT,eout(seg(t,14.1,14.7))*(1-ease(seg(t,15.5,16))),{ls:8});}
}

// ---------- кадр ----------
window.seek=async t=>{const c=cam(t);
  const fade=TEXT?Math.min(eout(seg(t,0,.9)),1-ease(seg(t,15.55,16))):1;
  X.setTransform(1,0,0,1,0,0);X.globalAlpha=1;X.globalCompositeOperation='source-over';X.fillStyle='#000';X.fillRect(0,0,1080,1920);
  drawPhoto(t,c,fade);drawBubbles(t,c,fade);drawSparkles(t,c,fade);drawBokeh(t,c,fade);
  drawFrame(t,TEXT?seg(t,.3,2.0):1,TEXT?Math.min(1,1-ease(seg(t,15.55,16))):1);
  if(TEXT)drawText(t);};

window.ready=(async()=>{const im=new Image();im.src=PLATE;await im.decode();
  const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);
  await Promise.all(['34px Deco','84px Heavy','190px Script'].map(f=>document.fonts.load(f)));await seek(0);return true;})();
