// ═══════════════ animation layer (appended after the approved mockup builders) ═══════════════
const FPS=60,DUR=55;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,p)=>a+(b-a)*p;
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const E={lin:p=>p,out:p=>1-Math.pow(1-p,3),in:p=>p*p*p,io:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,outQ:p=>1-Math.pow(1-p,5),
  outExpo:p=>p>=1?1:1-Math.pow(2,-10*p),inExpo:p=>p<=0?0:Math.pow(2,10*p-10),back:p=>{const c1=1.6,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2)},
  spring:p=>p>=1?1:1-Math.exp(-6.5*p)*Math.cos(10*p),sine:p=>.5-.5*Math.cos(Math.PI*p)};
function mixObj(a,b,p){const o={};for(const k in b){const va=a[k]??b[k];o[k]=typeof b[k]==='number'?lerp(va,b[k],p):(p<.5?va:b[k])}for(const k in a)if(!(k in o))o[k]=a[k];return o}
function kf(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){const [t1,v1,e]=keys[i];if(t<=t1){const [t0,v0]=keys[i-1];const p=(E[e||'io'])(prog(t,t0,t1));return typeof v1==='number'?lerp(v0,v1,p):mixObj(v0,v1,p)}}return keys[keys.length-1][1]}
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
function hex2rgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}
const mixHex=(a,b,p)=>{const A=hex2rgb(a),B=hex2rgb(b);return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],p))).join(',')})`};
function mk(parent,html){const d=document.createElement('div');d.innerHTML=html.trim();const el=d.firstElementChild;parent.appendChild(el);return el}
function vis(el,o,blur=0){el.style.opacity=o;el.style.visibility=o<=.004?'hidden':'visible';el.style.filter=blur>.1?`blur(${blur.toFixed(1)}px)`:'none'}
function C(el,{x=0,y=0,s=1,sx,sy,r=0,ry=0,o=1,blur=0}){el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) perspective(1600px) rotateY(${ry}deg) rotate(${r}deg) scale(${sx??s},${sy??s})`;vis(el,o,blur)}
function cam(el,{x=540,y=960,z=1,sx=540,sy=960,r=0}){el.style.transform=`translate(${sx}px,${sy}px) rotate(${r}deg) scale(${z}) translate(${-x}px,${-y}px)`}
const SVGNS='http://www.w3.org/2000/svg';

root.innerHTML='';
const PAL={a:['#ffd9b0','#bdeee4','#ffe9c2','#ffd0c2'],b:['#ffd9b0','#bdeee4','#ffe3c9','#c9f0e6'],c:['#ffe3c9','#bdeee4','#ffe9c2','#ffd9b0'],d:['#ffd9b0','#bdeee4','#ffe3c9','#ffd0c2']};
function scene(cols){const el=mk(root,'<div class="abs" style="left:0;top:0;width:1080px;height:1920px;overflow:hidden"></div>');
  el.insertAdjacentHTML('beforeend',bg(cols));const blobs=[...el.querySelectorAll('.blob')];const cm=mk(el,'<div class="abs" style="left:0;top:0;width:1080px;height:1920px;transform-origin:0 0"></div>');return {el,blobs,cam:cm}}
function drift(S,t){S.blobs.forEach((b,i)=>b.style.transform=`translate(${Math.sin(t*.21+i*1.7)*90}px,${Math.cos(t*.17+i)*110}px)`)}
function show(S,o,blur=0){S.el.style.visibility=o<=.004?'hidden':'visible';S.el.style.opacity=o;S.el.style.filter=blur>.1?`blur(${blur.toFixed(1)}px)`:'none'}

// ───────── captions (kinetic, screen space)
const capLayer=mk(root,'<div class="abs" style="left:0;top:0;width:1080px;height:1920px;z-index:20"></div>');
const CAPS=[
 {t0:11.0,t1:14.15,y:190,size:118,words:['PRICES','<span class="O">STILL</span>','<span class="O">RISE</span>'],mode:'drop'},
 {t0:12.85,t1:14.15,y:310,size:84,color:'#3a372f',words:['JUST','MORE','SLOWLY'],mode:'slow'},
 {t0:29.6,t1:37.5,y:200,size:66,color:'#6f6a60',words:['INFLATION','RATE'],mode:'drop',ls:'.02em'},
 {t0:30.9,t1:37.5,y:1660,size:150,words:['<span class="O">SLOWER</span>'],mode:'stretch'},
 {t0:43.0,t1:46.3,y:190,size:128,words:['SAME','BASKET.'],mode:'drop'},
 {t0:44.3,t1:46.3,y:320,size:128,words:['HIGHER','<span class="O">BILL.</span>'],mode:'slam'},
];
CAPS.forEach(c=>{c.el=mk(capLayer,`<div class="cap" style="left:0;width:1080px;top:${c.y}px;font-size:${c.size}px;${c.color?`color:${c.color};`:''}${c.ls?`letter-spacing:${c.ls};`:''}">${c.words.map(w=>`<span class="kw" style="display:inline-block">${w}</span>`).join(' ')}</div>`);c.w=[...c.el.querySelectorAll('.kw')];
  if(c.mode==='slow'){c.w.forEach(w=>{w.innerHTML=[...w.textContent].map(ch=>`<span class="kl" style="display:inline-block">${ch}</span>`).join('')});c.letters=[...c.el.querySelectorAll('.kl')]}});
function renderCaps(t){CAPS.forEach(c=>{
  if(t<c.t0-.05||t>c.t1+.4){c.el.style.visibility='hidden';return}c.el.style.visibility='visible';
  const out=E.in(prog(t,c.t1,c.t1+.35));c.el.style.opacity=1-out;c.el.style.filter=out>0?`blur(${out*14}px)`:'none';c.el.style.transform=`translateY(${-out*40}px)`;
  if(c.mode==='slow'){c.w.forEach(w=>{w.style.opacity=1});c.letters.forEach((l,i)=>{const q=E.out(prog(t,c.t0+i*.07,c.t0+i*.07+.45));l.style.opacity=q;l.style.transform=`translateY(${(1-q)*24}px)`;l.style.filter=`blur(${(1-q)*8}px)`});return}
  c.w.forEach((w,i)=>{const t0=c.t0+i*.12;const q=prog(t,t0,t0+.5);
    if(c.mode==='drop'){const e=E.back(q);w.style.transform=`translateY(${(1-e)*-90}px) scale(${lerp(1.25,1,E.out(q))})`;w.style.opacity=clamp(q*3);w.style.filter=`blur(${(1-E.out(q))*14}px)`}
    if(c.mode==='slam'){const e=E.back(q);w.style.transform=`scale(${lerp(2.2,1,E.outExpo(q))})`;w.style.opacity=clamp(q*4);w.style.filter=`blur(${(1-E.outExpo(q))*18}px)`}
    if(c.mode==='stretch'){const k=prog(t,t0,t0+1.6);w.style.transformOrigin='50% 100%';w.style.transform=`scaleX(${lerp(1.8,1,E.out(k))}) scaleY(${lerp(.7,1,E.out(k))})`;w.style.opacity=clamp(k*5);w.style.filter=`blur(${(1-E.out(k))*10}px)`}
  })})}

// ═════════ SCENE 1 + 6 — news phone & receipt (world = approved frame 1B; 1A = zoom on the phone)
const S1=scene(PAL.a);
const RCLIP=mk(S1.cam,`<div class="abs" style="left:0;top:884px;width:1080px;height:2400px;overflow:hidden"></div>`);
RCLIP.insertAdjacentHTML('beforeend',receipt(540,800-884,620,1040,'112.20',4));
const R1=RCLIP.lastElementChild;const R1tot=[...R1.querySelectorAll('span')].pop();R1tot.style.display='inline-block';R1tot.style.transformOrigin='100% 80%';
S1.cam.insertAdjacentHTML('beforeend',phone(newsScreen,540,520,.62));const PH1=S1.cam.lastElementChild;
const ARROW1=PH1.querySelector('.sq');const HEAD1=[...PH1.querySelectorAll('.card > div')].find(d=>d.innerHTML.includes('INFLATION'));
const ICONROW={x:540-310+44+20,y:800+112+4*62+31};
const Z1=1.36/.62;
function renderS1(t){
  const act=(t<6.15)||(t>=46.85);
  if(!act){show(S1,0);return}
  const τ=t>=46.85?t-55:t;          // negative τ = the closing section of the loop
  drift(S1,t);
  let c,o=1,blur=0;
  if(t<6.15){
    c=kf(t,[[0,{x:540,y:520,z:Z1,sx:540,sy:1010}],[1.35,{x:540,y:520,z:Z1,sx:540,sy:1010}],[2.6,{x:540,y:960,z:1,sx:540,sy:960},'outExpo'],[4.6,{x:540,y:975,z:1.02,sx:540,sy:960},'lin'],
      [5.05,{x:440,y:1120,z:1.25,sx:540,sy:960},'io'],[6.0,{x:ICONROW.x,y:ICONROW.y,z:7.5,sx:540,sy:960},'inExpo']]);
    blur=E.in(prog(t,5.5,6.0))*14;o=1-prog(t,5.9,6.15);
  }else{
    c=kf(t,[[46.85,{x:620,y:1560,z:1.5,sx:540,sy:960}],[47.6,{x:560,y:1500,z:1.12,sx:540,sy:960},'outExpo'],[50.2,{x:540,y:930,z:1.0,sx:540,sy:960},'io'],
      [51.2,{x:540,y:860,z:1.0,sx:540,sy:960},'lin'],[53.9,{x:540,y:520,z:Z1,sx:540,sy:1010},'io'],[55,{x:540,y:520,z:Z1,sx:540,sy:1010}]]);
    o=E.out(prog(t,46.85,47.15));blur=(1-E.out(prog(t,46.85,47.4)))*12;
  }
  show(S1,o,blur);cam(S1.cam,c);
  // receipt: slides out of the phone with squash & stretch, retracts at the very end of the loop
  const out=t<6.15?kf(t,[[2.0,0],[3.25,1.025,'out'],[3.6,1,'io']]):1-E.io(prog(t,52.6,53.8));
  const vel=t<6.15?Math.max(0,Math.sin(Math.PI*prog(t,2.0,2.9))):0;
  R1.style.transform=`translateY(${(out-1)*1040}px) scaleY(${1+vel*.035})`;R1.style.transformOrigin='50% 0';
  // "like this?" — the total jumps
  const lk=prog(t,4.65,5.15);R1tot.style.transform=`scale(${t<6.15?1+.22*Math.sin(Math.PI*lk)+ .06*E.out(prog(t,5.1,5.4)):1}) rotate(${t<6.15?Math.sin(lk*Math.PI*4)*2*(1-lk):0}deg)`;
  R1tot.style.textShadow=t<6.15&&lk>0?`0 0 ${30*Math.sin(Math.PI*lk)}px rgba(255,106,0,.6)`:'none';
  // headline arrow: a soft downward nudge at the start of every loop
  const nd=prog(t,.25,.9);ARROW1.style.transform=`translateY(${Math.sin(Math.PI*nd)*22}px)`;
  if(HEAD1)HEAD1.style.transform=`translateY(${Math.sin(Math.PI*prog(t,.2,.75))*6}px)`;
}

// ═════════ SCENE 2 — same basket, rising tag
const S2=scene(PAL.b);
function basketEl(parent){
  const w=mk(parent,`<div class="abs" style="left:0;top:0;width:520px;height:500px"></div>`);
  w.insertAdjacentHTML('beforeend',`<svg class="abs" style="left:0;top:0" width="520" height="500"><path d="M80 210 Q 260 -40 440 210" stroke="#b9b2a6" stroke-width="18" fill="none" stroke-linecap="round"/><ellipse cx="260" cy="214" rx="230" ry="34" fill="#a39c90"/></svg>`);
  const P={bread:mk(w,`<div class="abs" style="left:200px;top:30px">${BREAD(1.2)}</div>`),milk:mk(w,`<div class="abs" style="left:56px;top:-40px">${MILK(1.25)}</div>`),
    eggs:mk(w,`<div class="abs" style="left:290px;top:110px">${EGGS(1.05)}</div>`),apple1:mk(w,`<div class="abs" style="left:130px;top:118px">${APPLE(1.15)}</div>`),apple2:mk(w,`<div class="abs" style="left:240px;top:140px">${APPLE(1.0,'#f0602e')}</div>`)};
  w.insertAdjacentHTML('beforeend',`<svg class="abs" style="left:0;top:0" width="520" height="500"><defs><linearGradient id="bk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e7e1d6"/></linearGradient></defs>
     <path d="M30 214 L490 214 L452 462 Q448 482 428 482 L92 482 Q72 482 68 462 Z" fill="url(#bk)" stroke="#fff" stroke-width="4"/>
     ${[270,320,370,420].map(yy=>`<path d="M${42+(yy-214)*.15} ${yy} L${478-(yy-214)*.15} ${yy}" stroke="#d9d2c5" stroke-width="6" stroke-linecap="round"/>`).join('')}
     <path d="M30 214 L490 214" stroke="#cfc7b9" stroke-width="12" stroke-linecap="round"/></svg>
     <div class="abs" style="left:0;top:470px;width:520px;height:40px;border-radius:50%;background:radial-gradient(rgba(70,45,20,.25),rgba(70,45,20,0) 70%)"></div>`);
  return {el:w,P};
}
function placeBasket(b,x,y,s,o=1,blur=0,extra=''){b.el.style.transform=`translate(${x-260}px,${y-250}px) scale(${s}) ${extra}`;b.el.style.transformOrigin='50% 50%';vis(b.el,o,blur)}
const TRAIL=mk(S2.cam,`<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920"><path id="tr2" stroke="#ff6a00" stroke-width="9" fill="none" stroke-linecap="round" opacity=".55" stroke-dasharray="2 16"/><path id="tr2s" stroke="#ff6a00" stroke-width="12" fill="none" stroke-linecap="round"/></svg>`);
const tr2=document.getElementById('tr2'),tr2s=document.getElementById('tr2s');
const B2=basketEl(S2.cam);
const INFP=mk(S2.cam,`<div class="pill" style="left:70px;top:560px;height:110px;padding:0 40px;font-weight:900;font-size:56px;gap:12px"><span class="T">INFLATION</span>${icon('down',58,'#0fa3a0',3.2)}</div>`);
const TAG2=mk(S2.cam,`<div class="abs" style="left:0;top:0;width:250px;height:150px">${tag(0,0,250,150,'',80)}</div>`);
const TAGF=TAG2.querySelector('.tag');TAGF.innerHTML+=`<span class="tagA" style="position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;padding-left:24px">↑</span><span class="tagB" style="position:absolute;left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center;padding-left:24px;font-size:96px">100</span>`;
const tagA=TAGF.querySelector('.tagA'),tagB=TAGF.querySelector('.tagB');
// the tag's height over time: fast rise, a hesitation when "inflation ↓" appears, then the same direction but slower
const TAGY=t=>kf(t,[[8.0,1180],[9.55,880,'out'],[9.95,905,'io'],[10.35,880,'io'],[12.9,735,'out'],[14.0,700,'lin']]);
const PRODS=[['milk',6.7,-420,-300],['bread',7.0,600,-380],['eggs',7.35,700,-120],['apple1',7.7,-600,-80],['apple2',7.95,560,-420]];
function renderS2(t){
  if(t<5.85||t>15.2){show(S2,0);return}
  drift(S2,t);show(S2,E.out(prog(t,5.85,6.15)),(1-E.out(prog(t,5.85,6.35)))*14);
  cam(S2.cam,kf(t,[[5.85,{x:540,y:960,z:1.06}],[7,{x:540,y:980,z:1.0},'out'],[12.5,{x:560,y:960,z:1.03},'lin'],[14.4,{x:640,y:900,z:1.06},'io'],[15.2,{x:700,y:760,z:1.3},'in']]));
  // basket grows out of the receipt icon, then settles
  const b=kf(t,[[5.85,{x:540,y:960,s:.18}],[6.55,{x:540,y:1010,s:1.15},'back'],[7.4,{x:470,y:1290,s:1.45},'io']]);
  placeBasket(B2,b.x,b.y,b.s,1,0);
  PRODS.forEach(([k,t0,dx,dy],i)=>{const el=B2.P[k];const q=prog(t,t0,t0+.6);if(q<=0){vis(el,0);return}
    const e=E.out(q),land=prog(t,t0+.6,t0+.9);
    el.style.transform=`translate(${(1-e)*dx}px,${(1-e)*dy-Math.sin(Math.PI*q)*160}px) rotate(${(1-e)*(i%2?-30:30)}deg) scale(${1+.08*Math.sin(Math.PI*land)},${1-.08*Math.sin(Math.PI*land)})`;vis(el,1)});
  // tag + trail
  if(t>=7.6){
    const ty=t<8?lerp(1250,1180,E.out(prog(t,7.6,8))):TAGY(t);const tx=905+Math.sin(t*1.3)*4;
    const flip=prog(t,14.0,14.5),grow=E.inExpo(prog(t,14.35,15.15));
    C(TAG2,{x:lerp(tx,700,E.io(prog(t,14.1,15))),y:lerp(ty,760,E.io(prog(t,14.1,15))),s:lerp(1,1+grow*9,1)*(t<8?E.back(prog(t,7.6,8)):1),ry:flip*180,o:clamp(prog(t,7.6,7.75))});
    tagA.style.opacity=flip<.5?1:0;tagB.style.opacity=flip<.5?0:1;tagB.style.transform='scaleX(-1)';
    let d='',ds='';const t0=8.0,t1=Math.min(t,14.0);
    for(let s=t0;s<=t1;s+=.04){const y=TAGY(s)+75,x=812+(s-8)*7;d+=(d?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)+' '}
    const recent=Math.max(t0,t1-.6);for(let s=recent;s<=t1;s+=.04){const y=TAGY(s)+75,x=812+(s-8)*7;ds+=(ds?'L':'M')+x.toFixed(1)+' '+y.toFixed(1)+' '}
    tr2.setAttribute('d',d);tr2s.setAttribute('d',ds);TRAIL.style.opacity=1-prog(t,14.0,14.4);
  }else vis(TAG2,0);
  // "INFLATION ↓" pill: kinetic drop-in, the arrow keeps pointing down
  const ip=prog(t,9.5,10.0);INFP.style.transform=`translateY(${(1-E.back(ip))*-80}px) scale(${lerp(1.3,1,E.out(ip))})`;vis(INFP,clamp(ip*3)*(1-prog(t,14.0,14.4)),(1-E.out(ip))*12);
}

// ═════════ SCENE 3 — the worked example
const S3=scene(PAL.d);
const BASE=1560,K=7.2,BX=[230,540,850],BV=[100,110,112.2];
const ILLU=mk(S3.cam,`<div class="pill" style="left:290px;top:190px;height:76px;padding:0 34px;font-weight:800;font-size:28px;letter-spacing:.14em;color:#6f6a60">ILLUSTRATIVE EXAMPLE</div>`);
const BIG=mk(S3.cam,`<div class="cap" style="left:0;width:1080px;top:310px;font-size:190px;font-feature-settings:'tnum' 1;display:flex;justify-content:center"></div>`);
const COLS=[];'000.00'.split('').forEach(ch=>{if(ch==='.'){BIG.insertAdjacentHTML('beforeend','<span style="display:inline-block;width:.28em;text-align:center">.</span>');return}
  const c=mk(BIG,`<span style="display:inline-block;width:.6em;height:.95em;overflow:hidden;position:relative"><span class="strip" style="position:absolute;left:0;top:0;width:100%;line-height:.95em">${[0,1,2,3,4,5,6,7,8,9,0].map(d=>`<span style="display:block;height:.95em;text-align:center">${d}</span>`).join('')}</span></span>`);COLS.push(c.firstElementChild)});
const UNITS=[10000,1000,100,10,1];   // in cents
function setNumber(v){const H=190*.95,c=Math.round(v*100*1000)/1000;UNITS.forEach((u,i)=>{const q=c/u;const d=Math.floor(q+1e-9)%10;let off=0;
  if(i===UNITS.length-1)off=q-Math.floor(q+1e-9);else{const low=(c%u)/u;off=clamp((low-.9)/.1)}COLS[i].style.transform=`translateY(${-(d+off)*H}px)`})}
const MINI=mk(S3.cam,`<div class="abs" style="left:0;top:0;width:1080px;height:1920px"></div>`);MINI.insertAdjacentHTML('beforeend',basket(120,420,.34));
const LINE3=mk(S3.cam,`<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920"><path id="l3" d="M230 ${BASE-100*K} L540 ${BASE-110*K} L850 ${BASE-112.2*K}" stroke="#0d0d12" stroke-width="6" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>
  <path id="a3a" d="M330 690 Q 385 760 440 690" stroke="#ff6a00" stroke-width="6" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/><path id="a3b" d="M640 690 Q 695 740 750 690" stroke="#0fa3a0" stroke-width="6" fill="none" stroke-linecap="round" pathLength="1" stroke-dasharray="1 1"/>
  <ellipse id="ring3" cx="540" cy="400" rx="400" ry="125" stroke="#ff6a00" stroke-width="7" fill="none" pathLength="1" stroke-dasharray="1 1"/></svg>`);
const l3=document.getElementById('l3'),a3a=document.getElementById('a3a'),a3b=document.getElementById('a3b'),ring3=document.getElementById('ring3');
const BARS=BX.map((x,i)=>({bar:mk(S3.cam,`<div class="abs" style="left:${x-110}px;top:0;width:220px;height:0;border-radius:40px 40px 18px 18px;background:linear-gradient(180deg,${i?'#ffb15c':'#ffc98f'},#ff6a00);box-shadow:0 30px 60px -20px rgba(255,106,0,.45),inset 0 3px 0 rgba(255,255,255,.5)"></div>`),
  lbl:mk(S3.cam,`<div class="abs" style="left:${x-150}px;top:0;width:300px;text-align:center;font-weight:900;font-size:62px;letter-spacing:-.03em">${BV[i].toFixed(2)}</div>`)}));
const badge=(txt,col)=>mk(S3.cam,`<div class="pill" style="left:0;top:0;height:90px;padding:0 34px;font-weight:900;font-size:48px;color:${col}">+<span class="num" style="display:inline-block">${txt}</span>%</div>`);
const BADA=badge('10','#ff6a00'),BADB=badge('10','#ff6a00');const numB=BADB.querySelector('.num');
const BT=[16.0,19.25,24.35];   // bar growth starts
function renderS3(t){
  if(t<14.75||t>29.0){show(S3,0);return}
  drift(S3,t);show(S3,E.out(prog(t,14.75,15.1))*(1-prog(t,28.75,29.0)));
  cam(S3.cam,kf(t,[[14.75,{x:540,y:420,z:1.5}],[15.6,{x:540,y:900,z:1.0},'outExpo'],[18.2,{x:540,y:860,z:1.04},'lin'],[20.6,{x:540,y:880,z:1.04},'lin'],[22.0,{x:540,y:860,z:1.07},'io'],
    [25.8,{x:540,y:880,z:1.04},'lin'],[26.6,{x:540,y:960,z:1.0},'io'],[27.85,{x:540,y:960,z:1.0}],[28.95,{x:695,y:BASE-111.1*K,z:6.5},'inExpo']]));
  const ip=prog(t,15.2,15.6);ILLU.style.transform=`translateY(${(1-E.back(ip))*-40}px)`;vis(ILLU,clamp(ip*3));
  const mp=prog(t,15.5,15.9);MINI.style.transformOrigin='120px 420px';MINI.style.transform=`scale(${mp>0?E.back(mp):0})`;vis(MINI,mp>0?1:0);
  // big number
  const v=t<19.3?100:t<20.4?lerp(100,110,E.io(prog(t,19.3,20.4))):t<24.4?110:lerp(110,112.2,E.io(prog(t,24.4,25.5)));setNumber(v);
  const bp=prog(t,14.9,15.5);BIG.style.transform=`scale(${lerp(1.4,1,E.outExpo(bp))})`;vis(BIG,1,(1-E.outExpo(bp))*16);
  BIG.style.color=(t>19.3&&t<20.6)||(t>24.4&&t<25.7)?'#ff6a00':'#0d0d12';
  ring3.setAttribute('stroke-dashoffset',1-E.io(prog(t,18.15,18.6)));ring3.style.opacity=1-prog(t,19.6,20.0);
  // bars
  BARS.forEach((b,i)=>{const g=E.back(prog(t,BT[i],BT[i]+.8))*BV[i]*K-40;const h=Math.max(0,g);b.bar.style.height=h+'px';b.bar.style.top=(BASE-h)+'px';vis(b.bar,t>BT[i]?1:0);
    const lq=prog(t,BT[i]+.45,BT[i]+.8);b.lbl.style.top=(BASE-BV[i]*K-40+(1-E.out(lq))*30)+'px';vis(b.lbl,lq)});
  // +10% appears on the number, moves to the first gap; a copy morphs 10 → 2 and moves to the second gap
  const a=kf(t,[[18.4,{x:540,y:560,s:.3}],[18.8,{x:540,y:560,s:1.15},'back'],[20.5,{x:540,y:560,s:1.1}],[21.1,{x:385,y:605,s:1},'io']]);
  C(BADA,{x:a.x,y:a.y,s:a.s,o:clamp(prog(t,18.4,18.55))});
  const m1=prog(t,22.05,22.35),m2=prog(t,22.35,22.7);
  numB.textContent=t<22.35?'10':'2';numB.style.transform=`scaleX(${t<22.35?1-E.in(m1):E.back(m2)})`;
  BADB.style.color=mixHex('#ff6a00','#0fa3a0',E.io(prog(t,22.1,22.6)));
  const bb=kf(t,[[21.9,{x:385,y:605,s:1}],[22.4,{x:540,y:575,s:1.35},'out'],[23.6,{x:540,y:575,s:1.3}],[24.3,{x:695,y:605,s:1},'io']]);
  C(BADB,{x:bb.x,y:bb.y,s:bb.s,o:t>21.9?1:0});
  a3a.setAttribute('stroke-dashoffset',1-E.io(prog(t,21.0,21.4)));a3b.setAttribute('stroke-dashoffset',1-E.io(prog(t,24.2,24.6)));
  l3.style.opacity=E.out(prog(t,25.9,26.6));
}

// ═════════ SCENE 4 — the car slows down (but keeps going)
const S4=scene(PAL.c);
const ROAD=mk(S4.cam,`<div class="abs" style="left:-400px;top:1300px;width:1880px;height:300px;background:linear-gradient(180deg,#e9e3d8,#ddd6c9)"></div>`);
const DASH=[...Array(9)].map(()=>mk(S4.cam,`<div class="abs" style="left:0;top:1440px;width:150px;height:18px;border-radius:9px;background:#fff"></div>`));
const POSTS=[...Array(6)].map(()=>mk(S4.cam,`<div class="abs" style="left:0;top:1210px;width:14px;height:90px;border-radius:7px;background:#d8d1c4"></div>`));
const SPD=[...Array(5)].map((_,i)=>mk(S4.cam,`<div class="abs" style="left:0;top:0;height:8px;border-radius:4px;background:rgba(255,106,0,.35)"></div>`));
S4.cam.insertAdjacentHTML('beforeend',`<div class="abs" id="rev4" style="left:110px;top:1330px;display:flex;align-items:center;gap:10px;font-weight:900;font-size:40px;color:#6f6a60">${icon('back',90,'#6f6a60',2.6)}REVERSE</div>`);
const REV=document.getElementById('rev4');
const CARW=mk(S4.cam,`<div class="abs" style="left:0;top:0;width:1080px;height:1920px"></div>`);CARW.insertAdjacentHTML('beforeend',car(640,1360,1.15));
const CARSVG=CARW.firstElementChild;const WHEELS=[...CARSVG.querySelectorAll('circle')].filter(c=>c.getAttribute('r')==='36');
WHEELS.forEach(w=>{const g=document.createElementNS(SVGNS,'g');g.innerHTML=[0,60,120].map(a=>`<line x1="-26" y1="0" x2="26" y2="0" stroke="#4a4c55" stroke-width="5" transform="rotate(${a})"/>`).join('');g.setAttribute('class','spk');w.parentNode.insertBefore(g,w.nextSibling.nextSibling)});
const SPOKES=[...CARSVG.querySelectorAll('.spk')];
const GAUGE=mk(S4.cam,`<div class="abs" style="left:0;top:0;width:1080px;height:1920px"></div>`);
const GLBL=mk(S4.cam,`<div class="abs" style="left:390px;top:930px;width:300px;text-align:center;font-weight:900;font-size:64px"><span class="T" id="glbl">10%</span></div>`);const glbl=document.getElementById('glbl');
const SPEED=t=>lerp(1500,260,E.io(prog(t,29.6,35.8)));
function roadOffset(t){let o=0;for(let s=28.5;s<t;s+=1/120)o+=SPEED(s)/120;return o}
function renderS4(t){
  if(t<28.75||t>37.9){show(S4,0);return}
  drift(S4,t);show(S4,E.out(prog(t,28.75,29.0)));
  cam(S4.cam,kf(t,[[28.75,{x:540,y:1449,z:5.5}],[29.9,{x:540,y:960,z:1.0},'outExpo'],[36.4,{x:560,y:1000,z:1.03},'lin'],[37.9,{x:548,y:1427,z:11},'inExpo']]));
  const rate=lerp(10,2,E.io(prog(t,29.6,35.6)));const val=rate/10*.55+.07;   // needle 10% → 2%
  const gp=prog(t,29.1,29.8);GAUGE.innerHTML=gauge(540,820,330,val);GAUGE.style.transformOrigin='540px 820px';GAUGE.style.transform=`scale(${lerp(.12,1,E.back(gp))})`;vis(GAUGE,clamp(gp*3));
  glbl.textContent=Math.round(rate)+'%';vis(GLBL,clamp(prog(t,29.5,29.8)));
  const off=roadOffset(t);DASH.forEach((d,i)=>{const x=((i*260-off)%2340+2340)%2340-400;d.style.transform=`translateX(${x}px)`});
  POSTS.forEach((p,i)=>{const x=((i*420-off*.6)%2520+2520)%2520-400;p.style.transform=`translateX(${x}px)`});
  const sp=SPEED(t);SPD.forEach((s,i)=>{const len=(140-i*20)*sp/1500,on=sp/1500>i*.18;s.style.width=len+'px';s.style.transform=`translate(${120+i*110-((t*sp*.3+i*90)%220)}px,${1330+i*50}px)`;vis(s,on?clamp(sp/1500*1.4-i*.15):0)});
  const bob=Math.sin(t*sp/40)*2;CARSVG.style.transform=`translate(${Math.sin(t*.7)*10}px,${bob}px)`;
  SPOKES.forEach(g=>{const c=g.previousElementSibling.previousElementSibling;const cx=+c.getAttribute('cx'),cy=+c.getAttribute('cy');g.setAttribute('transform',`translate(${cx} ${cy}) rotate(${(off*1.6)%360})`)});
  // wheel turns orange as the camera dives into it (becomes the tag)
  const wo=E.io(prog(t,36.9,37.5));WHEELS.forEach(w=>w.setAttribute('fill',wo>0?mixHex('#22242c','#ff6a00',wo):'#22242c'));
  const rv=prog(t,34.55,35.0)*(1-prog(t,35.5,36.0));REV.style.opacity=.3*rv;REV.style.transform=`translateX(${(1-rv)*-30}px)`;REV.style.textDecoration=t>35.3?'line-through':'none';
}

// ═════════ SCENE 5 — same basket, higher bill
const S5=scene(PAL.d);
const GH=basketEl(S5.cam);const B5=basketEl(S5.cam);
const LINES5=mk(S5.cam,`<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920">${[[160,800,675,800],[260,880,775,880],[350,960,865,960]].map(l=>`<path class="ln5" d="M${l[0]+70} ${l[1]} L${l[2]-60} ${l[3]}" stroke="#0d0d12" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round" opacity=".45"/>`).join('')}</svg>`);
const LN5=[...LINES5.querySelectorAll('.ln5')];
const TAG5=mk(S5.cam,`<div class="abs" style="left:0;top:0;width:250px;height:150px">${tag(0,0,250,150,'',72)}</div>`);TAG5.querySelector('.tag').insertAdjacentHTML('beforeend','<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-left:24px">112.20</span>');
const CBEF=mk(S5.cam,`<div class="card sq" style="left:120px;top:1250px;width:330px;height:150px;border-radius:44px;font-weight:900;font-size:76px;letter-spacing:-.03em;color:#9a978f">100.00</div>`);
const CNOW=mk(S5.cam,`<div class="card sq" style="left:630px;top:1250px;width:340px;height:150px;border-radius:44px;font-weight:900;font-size:76px;letter-spacing:-.03em;color:#ff6a00">112.20</div>`);
const LB5=mk(S5.cam,`<div class="abs" style="left:150px;top:1420px;width:270px;text-align:center;font-weight:800;font-size:28px;color:#9a978f;letter-spacing:.12em">BEFORE</div>`);
const LN5b=mk(S5.cam,`<div class="abs" style="left:665px;top:1420px;width:270px;text-align:center;font-weight:800;font-size:28px;color:#ff6a00;letter-spacing:.12em">NOW</div>`);
const RCLIP5=mk(S5.cam,`<div class="abs" style="left:0;top:1490px;width:1080px;height:800px;overflow:hidden"></div>`);RCLIP5.insertAdjacentHTML('beforeend',receipt(800,10,420,520,'112.20'));const R5=RCLIP5.lastElementChild;
const HOLE5={x:690+20+13.5,y:760+75};
function renderS5(t){
  if(t<37.65||t>47.2){show(S5,0);return}
  drift(S5,t);show(S5,E.out(prog(t,37.65,37.8))*(1-prog(t,46.95,47.2)),prog(t,46.6,47.2)*10);
  cam(S5.cam,kf(t,[[37.65,{x:HOLE5.x,y:HOLE5.y,z:14}],[38.9,{x:540,y:1000,z:1.0},'outExpo'],[42.5,{x:540,y:980,z:1.02},'lin'],[45.2,{x:560,y:1060,z:1.04},'io'],[46.4,{x:640,y:1300,z:1.1},'io'],[47.2,{x:780,y:1700,z:1.6},'in']]));
  const mv=E.io(prog(t,39.2,40.2));
  placeBasket(B5,lerp(540,800,mv),lerp(1080,960,mv),lerp(1.15,.88,mv));
  Object.values(B5.P).forEach(p=>{p.style.transform='none';vis(p,1)});
  const gq=E.out(prog(t,39.35,40.3)),gf=1-E.io(prog(t,44.9,45.6));placeBasket(GH,lerp(800,285,gq),960,.88,gq*.38*gf,0);GH.el.style.filter='saturate(.6)';
  Object.values(GH.P).forEach(p=>{p.style.transform='none';vis(p,1)});
  // tag on the basket → flies down into the NOW price card
  const tq=E.io(prog(t,40.0,40.6));C(TAG5,{x:lerp(815,800,tq),y:lerp(835,1325,tq),s:lerp(1,.5,tq),o:1-prog(t,40.35,40.6)});
  const cn=prog(t,40.4,40.8);CNOW.style.transform=`scale(${cn>0?E.back(cn):0})`;vis(CNOW,cn>0?1:0);vis(LN5b,E.out(prog(t,40.6,40.9)));
  const cb=prog(t,40.7,41.1);CBEF.style.transform=`scale(${cb>0?E.back(cb):0})`;vis(CBEF,(cb>0?1:0)*gf);vis(LB5,E.out(prog(t,40.9,41.2))*gf);
  LN5.forEach((l,i)=>{const q=E.io(prog(t,42.5+i*.15,42.9+i*.15));l.style.opacity=.45*q*gf;l.setAttribute('stroke-dashoffset',(1-q)*400)});
  const rq=E.spring(prog(t,45.3,46.3));R5.style.transform=`translateY(${(rq-1)*580}px)`;
}

// grain
const GR=document.createElement('canvas');GR.width=540;GR.height=960;GR.style.cssText='position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:.045;mix-blend-mode:overlay;z-index:30';document.body.appendChild(GR);
const gctx=GR.getContext('2d'),gimg=gctx.createImageData(540,960);
function grain(f){let s=f*9301+49297;const d=gimg.data;for(let i=0;i<d.length;i+=4){s=(s*1103515245+12345)&0x7fffffff;const v=(s>>16)&255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}gctx.putImageData(gimg,0,0)}

function renderAt(t){renderS1(t);renderS2(t);renderS3(t);renderS4(t);renderS5(t);renderCaps(t);grain(Math.round(t*FPS))}

// ───────── sound events
const SFX=[];const sx=(t,type,g=1,pan=0,extra)=>SFX.push(Object.assign({t:+t.toFixed(3),type,g,pan},extra||{}));
sx(.3,'news',.75);sx(1.4,'whip',.45,0,{d:.6});sx(2.0,'paper',.8,0,{d:1.4});sx(4.75,'thud',.9);sx(5.45,'whoosh',.6,0,{d:.7});
PRODS.forEach(([k,t0],i)=>sx(t0+.55,'pop',.6,(i%2?.3:-.3),{n:i}));sx(7.6,'tick',.4);sx(9.5,'swish',.45,-.3,{d:.4});sx(12.85,'drop',.65);sx(14.3,'whoosh',.65,0,{d:.85,up:1});
BT.forEach((b,i)=>sx(b+.7,'click',.7,-.3+.3*i));sx(18.15,'swish',.35,0,{d:.45});sx(20.4,'click',.6);sx(22.3,'shimmer',.65);sx(25.5,'click',.6);sx(28.2,'whoosh',.6,0,{d:.8,up:1});
sx(29.0,'engine',.55,0,{d:7.2});sx(34.6,'swish',.25,-.4,{d:.35});sx(36.9,'whoosh',.7,0,{d:1.0,up:1});
sx(38.0,'air',.4,0,{d:.9});sx(39.3,'swish',.4,-.3,{d:.5});sx(40.5,'pop',.55,.3,{n:5});sx(42.6,'tick',.35);sx(43.0,'accent',.7,0,{n:0});sx(44.3,'accent',.85,0,{n:1});sx(45.3,'paper',.7,.2,{d:1.0});
sx(46.7,'whip',.5,0,{d:.7});sx(50.3,'air',.35,0,{d:1.2});sx(52.6,'air',.4,0,{d:1.1});
window.SFX=SFX;window.CAPS=CAPS;window.renderAt=renderAt;window.DUR=DUR;
Promise.all([document.fonts.ready]).then(()=>{renderAt(0);window.ready=true});
