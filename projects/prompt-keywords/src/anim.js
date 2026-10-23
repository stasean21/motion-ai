'use strict';
// ═══════════ 10 photo prompt keywords — 63 s seamless loop, reference style (approved mockup v3) ═══════════
const FPS=60,DUR=63;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,p)=>a+(b-a)*p;
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const E={lin:p=>p,out:p=>1-Math.pow(1-p,3),in:p=>p*p*p,io:p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,outQ:p=>1-Math.pow(1-p,5),
  outExpo:p=>p>=1?1:1-Math.pow(2,-10*p),inExpo:p=>p<=0?0:Math.pow(2,10*p-10),back:p=>{const c1=1.6,c3=c1+1;return 1+c3*Math.pow(p-1,3)+c1*Math.pow(p-1,2)},
  spring:p=>p>=1?1:1-Math.exp(-6.5*p)*Math.cos(10*p)};
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const $=id=>document.getElementById(id);
function mk(parent,html){const d=document.createElement('div');d.innerHTML=html.trim();const el=d.firstElementChild;parent.appendChild(el);return el}
function vis(el,o,blur=0){el.style.opacity=o;el.style.visibility=o<=.004?'hidden':'visible';el.style.filter=blur>.1?`blur(${blur.toFixed(1)}px)`:'none'}
const IC={send:'<path d="M12 19.5V5M5.6 11.2L12 4.8l6.4 6.4"/>',cam:'<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.6"/><path d="M8.5 7l1.6-2.6h3.8L15.5 7"/>',
  sun:'<circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',bookmark:'<path d="M6 3.5h12v17l-6-4.2-6 4.2z"/>'};
const icon=(n,s,c,sw=2.2)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const SRC=k=>`assets/ph/${k}.jpg`;

// ───────── scenes
const SC=[
 {t0:0, key:null,         A:'00a',B:'00b',mech:'hook',  cap:'',                          line:'Want better AI photos? Try these ten keywords in your next ChatGPT image prompt.',v:[.3,4.5],keys:[5,6]},
 {t0:5, key:'productshot',A:'01a',B:'01b',mech:'wipe',  cap:'CLEAN PRODUCT PHOTOGRAPHY',line:'Product shot: give your subject a clean, commercial presentation.',v:[5.25,9.3],keys:[0,1]},
 {t0:10,key:'softlight',  A:'02a',B:'02b',mech:'diffuse',cap:'SOFT SHADOWS',           line:'Soft light: ask for gentle shadows and smooth transitions.',v:[10.25,14.3],keys:[0,1]},
 {t0:15,key:'hardlight',  A:'03a',B:'03b',mech:'flash', cap:'SHARP SHADOWS',            line:'Hard light: create crisp shadows and a bolder look.',v:[15.25,19.1],keys:[0,1]},
 {t0:20,key:'rimlight',   A:'04a',B:'04b',mech:'trace', cap:'LIGHT ALONG THE EDGES',    line:'Rim light: separate your subject with an illuminated edge.',v:[20.25,24.3],keys:[0,1]},
 {t0:25,key:'goldenhour', A:'05a',B:'05b',mech:'sun',   cap:'WARM EVENING LIGHT',       line:'Golden hour: bring in warm, low evening light.',v:[25.25,28.9],keys:[0,1]},
 {t0:30,key:'macro',      A:'06a',B:'06b',mech:'lens',  cap:'SHOW THE TEXTURE',         line:'Macro: move closer to reveal texture and tiny details.',v:[30.25,34.3],keys:[0]},
 {t0:35,key:'lowangle',   A:'07a',B:'07b',mech:'drop',  cap:'A STRONGER PERSPECTIVE',   line:'Low angle: make the subject feel more imposing.',v:[35.25,38.9],keys:[0,1]},
 {t0:40,key:'minimal',    A:'08a',B:'08b',mech:'shatter',cap:'LESS CLUTTER. MORE FOCUS.',line:'Minimal: remove distractions and give the subject room.',v:[40.25,44.3],keys:[0]},
 {t0:45,key:'editorial',  A:'09a',B:'09b',mech:'page',  cap:'MAGAZINE-STYLE COMPOSITION',line:'Editorial: try a styled, magazine-inspired composition.',v:[45.25,49.1],keys:[0]},
 {t0:50,key:'motionblur', A:'10a',B:'10b',mech:'streak',cap:'ADD A SENSE OF SPEED',     line:'Motion blur: suggest speed. Specify what should stay sharp.',v:[50.25,54.6],keys:[0,1]},
 {t0:55,key:null,         A:null, B:null, mech:'grid',  cap:'',                          line:'Add these to a clear description of your scene. Save this before your next generation.',v:[55.3,61.6],keys:[]},
];
const sceneAt=t=>{let i=0;while(i<SC.length-1&&t>=SC[i+1].t0)i++;return i};

// ───────── static layout
const root=$('root');
root.innerHTML=`<div class="abs" style="inset:0;background:radial-gradient(110% 55% at 50% 0%,#f7f8fc 0%,#eef0f6 60%,#e8ebf3 100%)"></div>`;
const PROG=mk(root,`<div class="pill" style="left:540px;top:127px;height:62px;padding:0 26px;gap:18px;font-weight:700;font-size:26px;transform:translate(-50%,-50%)">
  <span style="display:inline-flex;align-items:center"><span style="display:inline-block;height:31px;overflow:hidden;line-height:31px;vertical-align:middle"><span id="cnt" style="display:block">${[...Array(12)].map((_,i)=>`<b style="display:block;height:31px;text-align:right">${i}</b>`).join('')}</span></span><span style="color:#9aa0b4">/10</span></span>
  <span class="mono" id="sl" style="letter-spacing:-.05em;font-size:30px;font-weight:700">${[...Array(10)].map(()=>`<span style="color:#c6cbdb;font-style:italic;display:inline-block">/</span>`).join('')}</span></div>`);
const CNT=$('cnt'),SL=[...$('sl').children];
// karaoke lines
const KL=SC.map(sc=>{const words=sc.line.split(' ');const el=mk(root,`<div class="karaoke" style="top:190px">${words.map(w=>w==='ChatGPT'?`<span class="gpt kwd">ChatGPT</span>`:`<span class="kwd" style="display:inline-block">${w}</span>`).join(' ')}</div>`);
  const VOW=/[aeiouyAEIOUY]/g;const wts=words.map((w,i)=>({d:Math.max(1,(w.match(VOW)||[]).length)+.4,p:(i<words.length-1&&/[.,:?!]$/.test(w))?1.1:0}));
  const tot=wts.reduce((a,b)=>a+b.d+b.p,0),k=(sc.v[1]-sc.v[0])/tot;let c=sc.v[0];const T=[];wts.forEach(x=>{T.push(c);c+=(x.d+x.p)*k});
  return {el,spans:[...el.querySelectorAll('.kwd')],T,keys:sc.keys}});
// big typed keyword (flies into the prompt)
const BIG=mk(root,`<div class="kw" style="left:0;top:0;font-size:116px;transform-origin:0 50%"><span id="bigt"></span><span id="bigc" style="display:inline-block;width:6px;height:96px;background:#2f7bf5;margin-left:6px;vertical-align:-10px"></span></div>`);
const BIGT=$('bigt'),BIGC=$('bigc');
// the working card
const CARD=mk(root,`<div class="card" style="left:190px;top:620px;width:700px;height:1010px">
  <div class="abs" style="left:28px;top:24px"><span class="tag" id="tag">prompt</span></div>
  <div class="abs" id="box" style="left:28px;top:84px;width:644px;height:790px;border-radius:28px;overflow:hidden;background:#dde1ea">
    <div class="abs" id="pA" style="inset:0"></div>
    <div class="abs" id="pB" style="inset:0"></div>
    <div class="abs" id="fx" style="inset:0"></div></div>
  <div class="abs" id="pr" style="left:28px;top:894px;width:644px;height:86px;border-radius:24px;background:#f2f4fa;display:flex;align-items:center;padding:0 100px 0 26px;font-weight:600;font-size:28px;color:#4a4d5c;white-space:nowrap;overflow:hidden"><span id="prT"></span><span id="prK" style="color:#2f7bf5;font-weight:700"></span><span id="prX" style="color:#14151b;font-weight:800"></span><span id="prC" style="display:inline-block;width:3px;height:36px;background:#2f7bf5;margin-left:4px"></span></div>
  <div class="sq" id="send" style="position:absolute;right:38px;top:904px;width:66px;height:66px;border-radius:50%;background:#2f7bf5">${icon('send',34,'#fff',3)}</div></div>`);
const TAG=$('tag'),BOX=$('box'),pA=$('pA'),pB=$('pB'),FX=$('fx'),prT=$('prT'),prK=$('prK'),prX=$('prX'),prC=$('prC'),SEND=$('send');
const CAP=mk(root,`<div class="pill" style="left:540px;top:1712px;height:76px;padding:0 34px;font-weight:800;font-size:30px;letter-spacing:.1em;transform:translate(-50%,-50%)"></div>`);
const NOTE=mk(root,`<div class="abs" style="left:0;width:1080px;top:1796px;text-align:center;font-weight:600;font-size:26px;color:#8b90a3">Prompt keywords • Slash optional</div>`);
// scene extras
const XL=mk(root,`<div class="abs" style="left:0;top:0;width:1080px;height:1920px"></div>`);
const BULB=mk(XL,`<div class="card sq" style="left:820px;top:560px;width:170px;height:170px;border-radius:44px;flex-direction:column;gap:4px"><span id="bulbI">${icon('bulb',64,'#2f7bf5')}</span><span id="bulbL" style="font-weight:800;font-size:20px;color:#2f7bf5">DIFFUSED</span></div>`);
const SUN=mk(XL,`<div class="card sq" style="left:0;top:0;width:130px;height:130px;border-radius:50%">${icon('sun',70,'#ff8a1a')}</div>`);
const ARC=mk(XL,`<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920"><path id="arcP" d="M150 1180 Q 540 260 930 1180" stroke="#ff9a3c" stroke-width="5" fill="none" stroke-dasharray="3 14"/></svg>`);const ARCP=$('arcP');
const LENS=mk(XL,`<div class="abs" style="left:0;top:0;width:500px;height:500px"><div id="lensIn" style="position:absolute;inset:0;border-radius:50%;overflow:hidden;border:10px solid #fff;box-shadow:0 30px 60px -20px rgba(40,50,110,.45)"><img src="${SRC('06b')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div>
  <div id="lensH" style="position:absolute;left:395px;top:440px;width:44px;height:170px;border-radius:22px;background:#fff;transform:rotate(-40deg);box-shadow:0 10px 20px rgba(0,0,0,.2)"></div></div>`);
const RAIL=mk(XL,`<div class="abs" style="left:950px;top:640px;width:6px;height:800px;border-radius:3px;background:repeating-linear-gradient(180deg,#9fb6e8 0 10px,transparent 10px 24px)"></div>`);
const CAMT=mk(XL,`<div class="card sq" style="left:0;top:0;width:120px;height:120px;border-radius:34px;flex-direction:column">${icon('cam',56,'#2f7bf5')}<b style="color:#2f7bf5;font-size:28px;line-height:1">↓</b></div>`);
const SHARDS=[[0,0,-1,-1],[1,0,1,-1],[0,1,-1,1],[1,1,1,1]].map(([c,r,dx,dy])=>({c,r,dx,dy,el:mk(XL,`<div class="abs" style="left:0;top:0;width:322px;height:395px;overflow:hidden;border-radius:18px;box-shadow:0 20px 40px rgba(0,0,0,.2)"><img src="${SRC('08a')}" style="position:absolute;left:${-c*322}px;top:${-r*395}px;width:644px;height:790px;object-fit:cover"></div>`)}));
const STREAKS=[...Array(10)].map((_,i)=>mk(XL,`<div class="abs" style="left:0;top:0;height:8px;border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.9))"></div>`));
// grid (scene 12)
const GRIDK=SC.slice(1,11);
const THUMBS=GRIDK.map((s,i)=>mk(root,`<div class="card" style="left:0;top:0;width:440px;height:232px;border-radius:30px"><img src="${SRC(s.B)}" style="position:absolute;left:10px;top:10px;width:170px;height:212px;object-fit:cover;border-radius:22px">
  <div class="abs" style="left:198px;top:62px"><div style="font-weight:700;font-size:22px;color:#9aa0b4">${String(i+1).padStart(2,'0')}</div><div style="font-weight:700;font-size:34px;color:#2f7bf5;letter-spacing:-.02em">/${s.key}</div></div></div>`));
const SAVE=mk(root,`<div class="pill" style="left:540px;top:506px;height:72px;padding:0 30px;font-weight:700;font-size:28px;gap:12px;letter-spacing:.06em;transform:translate(-50%,-50%)">${icon('bookmark',30,'#2f7bf5')}SAVE FOR YOUR NEXT PROMPT</div>`);
const CUR=mk(root,`<svg class="cursor" style="left:0;top:0;transform-origin:22px 6px" width="64" height="72" viewBox="0 0 32 36"><path d="M11 2.5c1.4 0 2.5 1.1 2.5 2.5v9.2l1.1-.2c1.2-.2 2.3.5 2.6 1.6l.1.4.6-.1c1.2-.2 2.3.5 2.6 1.7l.1.3.4-.1c1.3-.2 2.5.7 2.7 2l.9 6.2c.4 2.8-1.2 5.5-3.8 6.5l-2.2.8c-2.3.9-4.9.3-6.6-1.5l-5.8-6.1c-.9-1-.9-2.5.1-3.4.9-.8 2.3-.8 3.2 0l.9.9V5c0-1.4 1.1-2.5 2.5-2.5z" fill="#fff" stroke="#14151b" stroke-width="1.8" stroke-linejoin="round"/></svg>`);
const FLASH=mk(root,`<div class="abs" style="inset:0;background:#fff;pointer-events:none"></div>`);
const PW=644,PH=790,BX=218,BY=704;          // photo box in screen space (card at rest)
const SENDP={x:190+700-38-33,y:620+904+33}; // send button centre

const KEYS=['00a','00b',...SC.flatMap(s=>[s.A,s.B]).filter(Boolean)];
const IA={},IB={};KEYS.forEach(k=>{IA[k]=mk(pA,`<img src="${SRC(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none">`);IB[k]=mk(pB,`<img src="${SRC(k)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none">`)});
function setImgs(a,b){KEYS.forEach(k=>{IA[k].style.display=k===a?'block':'none';IB[k].style.display=k===b?'block':'none'})}
function resetFX(){pA.style.cssText='position:absolute;inset:0';pB.style.cssText='position:absolute;inset:0';FX.innerHTML='';
  [BULB,SUN,ARC,LENS,RAIL,CAMT,...SHARDS.map(s=>s.el),...STREAKS].forEach(e=>vis(e,0))}

// ───────── per frame
function renderAt(t){
  const i=sceneAt(t),sc=SC[i],τ=t-sc.t0;
  resetFX();
  renderTop(t,i,τ);
  if(sc.mech==='grid'){renderGrid(t,τ);return}
  THUMBS.forEach(e=>vis(e,0));vis(SAVE,0);
  // card in/out (kinetic swap: alternating horizontal / vertical whip with directional blur)
  const horiz=i%2===1;const inQ=i===0?1:E.outExpo(prog(τ,0,.42)),outQ=i===10?0:E.inExpo(prog(τ,4.55,5.0));
  let dx=0,dy=0;if(horiz){dx=(1-inQ)*1100-outQ*1100}else{dy=(1-inQ)*1500-outQ*1500}
  const sp=(1-inQ)+outQ;CARD.style.transform=`translate(${dx}px,${dy}px) scale(${1-.06*sp})`;vis(CARD,1,sp*14);
  if(i===10&&τ>4.55){} // motion blur scene leaves through the grid build (scene 12)
  // keyword typing + flight into the prompt
  renderKeyword(t,i,τ);
  // images & reveal mechanic
  setImgs(sc.A,sc.B);
  const m=prog(τ,1.85,3.45);
  MECH[sc.mech](τ,m,sc);
  // caption under the card
  const cq=prog(τ,3.25,3.6),co=1-prog(τ,4.45,4.7);
  if(sc.cap){CAP.textContent=sc.cap;CAP.style.transform=`translate(-50%,-50%) translateY(${(1-E.back(cq))*40}px)`;vis(CAP,clamp(cq*3)*co)}else if(i!==0)vis(CAP,0);
  renderCursor(t,i,τ);
  // flash (hard light)
  vis(FLASH,0);
}

function renderTop(t,i,τ){
  // counter: 0 in the hook, n in scene n, 10 in the grid; resets to 0 when the stack becomes the hook card again
  let n=i===0?0:i===11?10:i;let roll=0;
  if(i>=1&&i<=10){roll=1-E.out(prog(τ,.35,.75));n=n-roll}
  if(i===11&&t>60.4){n=10*(1-E.io(prog(t,60.4,60.9)))}
  CNT.style.transform=`translateY(${-n*31}px)`;
  const filled=Math.round(Math.min(10,i===11?(t>60.4?10*(1-prog(t,60.4,60.9)):10):i===0?0:i - (τ<.55?1:0)));
  SL.forEach((s,k)=>{const on=k<filled;s.style.color=on?'#2f7bf5':'#c6cbdb';s.style.transform=on&&k===filled-1&&i>=1&&i<=10?`scale(${1+.5*Math.sin(Math.PI*prog(τ,.55,.85))})`:'none'});
  // karaoke
  KL.forEach((k,j)=>{const nx=KL[(j+1)%KL.length];let on=j===i,o=1;
    const tin=SC[j].t0,tout=j===11?62.3:SC[j+1].t0-.12;
    if(j===0&&t>62.3){on=true;o=E.out(prog(t,62.3,62.8))}   // loop lead-in: the first line comes back as ghosts
    if(!on){k.el.style.visibility='hidden';return}
    k.el.style.visibility='visible';const lead=j===0&&t>62.3;const qo=lead?0:j===11?E.in(prog(t,61.9,62.3)):E.in(prog(t,tout,tout+.25));const qi=lead?o:j===0?1:E.out(prog(t,tin-.05,tin+.25));
    k.el.style.opacity=qi*(1-qo);k.el.style.filter=qo>0?`blur(${qo*12}px)`:'none';k.el.style.transform=`translateY(${(1-qi)*16-qo*20}px)`;
    const tt=(j===0&&t>62.3)?-1:t;
    k.spans.forEach((s,w)=>{const q=prog(tt,k.T[w]-.04,k.T[w]+.14);const key=k.keys.includes(w);
      s.style.color=q>0?(key?'#2f7bf5':'#14151b'):'#a9c1ee';if(s.classList.contains('gpt'))s.style.opacity=q>0?1:.5;})});
}

function renderKeyword(t,i,τ){
  const sc=SC[i];
  if(i===0){ // hook: prompt says "Make it look better." until the keywords replace it
    prT.innerHTML=τ<2.25?'Make it <span id="lb">look better.</span>':(τ<2.55?'Make it <span id="lb" style="text-decoration:line-through;text-decoration-color:#e5484d;text-decoration-thickness:4px;color:#b2b6c4">look better.</span>':'');
    const lb=document.getElementById('lb');if(lb&&τ>2.25){const q=prog(τ,2.25,2.55);lb.style.opacity=1-q;lb.style.filter=`blur(${q*8}px)`}
    prK.textContent=τ>=2.55?['/softlight','/macro','/editorial'].slice(0,1+Math.floor(prog(τ,2.55,3.3)*2.99)).join(' '):'';prX.textContent='';
    TAG.textContent='prompt';prC.style.opacity=τ<2.4?(Math.floor(t*4)%2?1:.2):0;vis(BIG,0);return}
  const word='/'+sc.key;
  prT.innerHTML=i===10?'':'Product photo,&nbsp;';
  const typed=Math.floor(clamp((τ-.3)/.045,0,word.length));
  const land=τ>=1.42;
  prK.textContent=land?word:'';
  prX.innerHTML=i===10&&τ>1.5?'.&nbsp;'+'Keep the bike sharp.'.slice(0,Math.floor(clamp((τ-1.5)/.04,0,20))):'';
  prC.style.opacity=(τ<1.5||(i===10&&τ<2.4))?(Math.floor(t*4)%2?1:.2):0;
  TAG.textContent=τ>=1.42?word:SC[i-1].key?'/'+SC[i-1].key:'prompt';
  if(τ<.25||τ>=1.45){vis(BIG,0);return}
  BIGT.textContent=word.slice(0,typed);BIGC.style.opacity=τ<.95?1:0;
  // start: centred above the card; end: the prompt chip position
  const w0=BIG.offsetWidth||600;const sx=540-w0/2,sy=420;
  const r=prK.getBoundingClientRect(),pr=prT.getBoundingClientRect();const tx=pr.right+2,ty=r.top||1557;
  const f=E.inExpo(prog(τ,.95,1.42));const s=lerp(1,.25,E.io(prog(τ,.95,1.42)));
  const x=lerp(sx,tx,f),y=lerp(sy,1530,f)-Math.sin(Math.PI*f)*120;
  BIG.style.transform=`translate(${x}px,${y}px) rotate(${-10*Math.sin(Math.PI*f)}deg) scale(${s})`;
  const appear=prog(τ,.25,.4);vis(BIG,appear,f>.15&&f<.95?6*Math.sin(Math.PI*f):(1-appear)*10);
}

// reveal mechanics: τ = scene time, m = 0..1 reveal progress (τ 1.85→3.45)
const clipL=(el,p)=>el.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;
const MECH={
 hook(τ){ // send → barely better → three quick results
   const better=τ>1.15;setImgs('00a',better?'00b':'00a');vis(pB,better?E.out(prog(τ,1.15,1.5)):0);
   FX.innerHTML=τ>.6&&τ<1.2?`<div class="abs" style="inset:0;background:linear-gradient(110deg,rgba(255,255,255,0) ${(τ-.6)*160-30}%,rgba(255,255,255,.55) ${(τ-.6)*160}%,rgba(255,255,255,0) ${(τ-.6)*160+30}%)"></div>`:'';
   const R=[['02b',3.0],['06b',3.45],['09b',3.9]];R.forEach(([k,tq])=>{if(τ>=tq){setImgs('00a',k);vis(pB,1);}});
   if(τ>=3.0){const last=R.filter(r=>τ>=r[1]).pop();const q=prog(τ,last[1],last[1]+.12);vis(FLASH,0);pB.style.transform=`scale(${1.08-.08*E.out(q)})`;
     FX.innerHTML=`<div class="abs" style="inset:0;background:#fff;opacity:${(1-q)*.7}"></div>`}
   // captions below the card
   const c1=prog(τ,1.75,2.05),c2=prog(τ,2.75,3.05);CAP.textContent=τ<2.75?'STOP GUESSING.':'DESCRIBE THE SHOT.';
   CAP.style.transform=`translate(-50%,-50%) translateY(${(1-E.back(τ<2.75?c1:c2))*40}px)`;vis(CAP,(τ<2.75?clamp(c1*3)*(1-prog(τ,2.55,2.75)):clamp(c2*3))*(1-prog(τ,4.45,4.7)));
   vis(NOTE,E.out(prog(τ,3.0,3.3))*(1-prog(τ,4.45,4.7)))},
 wipe(τ,m){vis(NOTE,0);clipL(pB,E.io(m));const x=PW*E.io(m);
   FX.innerHTML=m>0&&m<1?`<div class="abs" style="left:${x-3}px;top:0;width:6px;height:${PH}px;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.3)"></div><div class="pill" style="left:${x-34}px;top:${PH/2-34}px;width:68px;height:68px;font-weight:900;font-size:26px">‹›</div>`:''},
 diffuse(τ,m){vis(NOTE,0);const x=lerp(-.35,1.35,E.io(m));clipL(pB,clamp(x+.05));
   FX.innerHTML=m>0&&m<1?`<div class="abs" style="left:${x*PW-150}px;top:-40px;width:300px;height:${PH+80}px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.95) 40%,rgba(255,255,255,.95) 60%,rgba(255,255,255,0));filter:blur(8px)"></div>`:'';
   const g=prog(τ,1.6,2.0)*(1-prog(τ,4.4,4.6));BULB.style.transform=`scale(${(g>0?E.back(Math.min(1,g*1.5)):0)*(1+.5*Math.sin(Math.PI*m))})`;$('bulbL').textContent='DIFFUSED';vis(BULB,clamp(g*4))},
 flash(τ,m){vis(NOTE,0);vis(pB,τ>=2.45?1:0);const fl=Math.max(0,1-Math.abs(τ-2.45)/.2)*.7;FX.innerHTML=fl>0?`<div class="abs" style="inset:0;background:radial-gradient(circle at 25% 15%,#fff,rgba(255,255,255,.6) 50%,rgba(255,255,255,.3));opacity:${fl}"></div>`:'';
   const g=prog(τ,1.6,2.0)*(1-prog(τ,4.4,4.6));BULB.style.transform=`scale(${(g>0?E.back(Math.min(1,g*1.5)):0)*(1-.35*Math.sin(Math.PI*prog(τ,2.0,2.5)))})`;$('bulbL').textContent='SPOT';vis(BULB,clamp(g*4))},
 trace(τ,m){vis(NOTE,0);const dark=E.out(prog(τ,1.75,2.15));pA.style.filter=`brightness(${1-.45*dark})`;
   const p=E.io(prog(τ,2.15,3.45));pB.style.clipPath=`inset(0 ${(1-p)*100}% 0 0)`;
   if(p>0&&p<1){const x=p*PW,y=PH*(.22+.5*Math.pow((p-.5)*2,2)*.5);FX.innerHTML=`<svg class="abs" style="left:0;top:0" width="${PW}" height="${PH}"><circle cx="${x}" cy="${y}" r="14" fill="#fff" style="filter:drop-shadow(0 0 14px #fff) drop-shadow(0 0 30px #fff)"/></svg>`}},
 sun(τ,m){vis(NOTE,0);const p=E.io(m);pB.style.clipPath=`polygon(0 0,${p*130}% 0,${p*130-48}% 100%,0 100%)`;
   const L=ARCP.getTotalLength();const g=prog(τ,1.5,1.85)*(1-prog(τ,4.4,4.6));vis(ARC,g);
   const q=ARCP.getPointAtLength(L*lerp(.22,.62,p));SUN.style.transform=`translate(${q.x-65}px,${q.y-65}px) scale(${g>0?E.back(Math.min(1,g)):0})`;vis(SUN,clamp(g*3))},
 lens(τ,m){vis(NOTE,0);const a=prog(τ,1.7,2.15);const grow=E.inExpo(prog(τ,2.75,3.45));
   if(τ<3.45){const R=lerp(250,700,grow);LENS.style.width=LENS.style.height=R*2+'px';LENS.style.transform=`translate(${560-R}px,${1000-R}px) scale(${a>0?E.back(Math.min(1,a)):0})`;
     document.getElementById('lensH').style.opacity=1-grow*3;document.getElementById('lensH').style.left=R*1.58+'px';document.getElementById('lensH').style.top=R*1.76+'px';vis(LENS,clamp(a*4)*(1-prog(τ,3.3,3.45)))}
   vis(pB,τ>=3.3?1:0)},
 drop(τ,m){vis(NOTE,0);const p=E.io(m);pA.style.transform=`translateY(${-p*PH}px)`;pB.style.transform=`translateY(${(1-p)*PH}px)`;
   FX.innerHTML=p>0&&p<1?`<div class="abs" style="left:0;top:${(1-p)*PH-3}px;width:${PW}px;height:6px;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.3)"></div>`:'';
   const g=prog(τ,1.5,1.85)*(1-prog(τ,4.4,4.6));vis(RAIL,g);CAMT.style.transform=`translate(893px,${lerp(640,1320,p)}px) scale(${g>0?E.back(Math.min(1,g)):0})`;vis(CAMT,clamp(g*3))},
 shatter(τ,m){vis(NOTE,0);const p=E.in(m);vis(pA,τ<1.85?1:0);
   SHARDS.forEach(s=>{if(τ<1.85||p>=1){vis(s.el,0);return}const x=BX+s.c*322+s.dx*p*520,y=BY+s.r*395+s.dy*p*420;s.el.style.transform=`translate(${x}px,${y}px) rotate(${s.dx*s.dy*p*24}deg) scale(${1-.25*p})`;vis(s.el,1-prog(p,.75,1),p*10)})},
 page(τ,m){vis(NOTE,0);const p=E.io(m);pA.style.transform=`translateX(${-p*105}%) scale(${1-.12*p})`;pA.style.opacity=1-p*.6;pB.style.transform=`translateX(${(1-p)*105}%)`},
 streak(τ,m){vis(NOTE,0);const p=E.io(m);clipL(pB,p);
   STREAKS.forEach((s,k)=>{if(p<=0||p>=1){vis(s,0);return}const w=180+hash(k)*160;s.style.width=w+'px';s.style.transform=`translate(${BX+p*PW-w+hash(k+3)*60}px,${BY+30+k*76}px)`;vis(s,1)})},
};

function renderGrid(t,τ){
  vis(BIG,0);vis(NOTE,0);vis(CAP,0);
  // thumbnails burst out of the card into a 2×5 grid, hold, collapse into a stack, the top card is the hook card again
  const col=E.inExpo(prog(t,59.5,60.3));
  THUMBS.forEach((el,k)=>{const c=k%2,r=Math.floor(k/2);const gx=90+c*460,gy=580+r*250;const t0=55.05+k*.08;
    const q=E.back(prog(t,t0,t0+.5)),e=E.out(prog(t,t0,t0+.5));
    let x=lerp(320,gx,e),y=lerp(1000,gy,e),s=lerp(.4,1,q);
    x=lerp(x,320,col);y=lerp(y,1010-k*3,col);s=lerp(s,1,col);
    el.style.transform=`translate(${x}px,${y}px) scale(${s})`;vis(el,t<t0?0:clamp(prog(t,t0,t0+.12))*(1-prog(t,60.2,60.45)),(1-e)*8+col*4)});
  const sq=prog(t,55.8,56.2);SAVE.style.transform=`translate(-50%,-50%) translateY(${(1-E.back(sq))*40}px)`;vis(SAVE,clamp(sq*3)*(1-prog(t,59.4,59.7)));
  // the hook card comes back (same object, same scale as frame 0), the prompt is retyped
  const back=E.outExpo(prog(t,60.2,60.8));
  CARD.style.transform=`translateY(${(1-back)*60}px) scale(${lerp(.9,1,back)})`;vis(CARD,clamp(prog(t,60.2,60.45)),(1-back)*10);
  setImgs('00a','00a');vis(pB,0);TAG.textContent='prompt';
  const msg='Make it look better.';const n=Math.floor(clamp((t-61.0)/.07,0,msg.length));
  prT.innerHTML=n>=8?'Make it <span>'+msg.slice(8,n)+'</span>':msg.slice(0,n);prK.textContent='';prX.textContent='';prC.style.opacity=Math.floor(t*4)%2?1:.2;
  renderCursor(t,11,τ);
}

function renderCursor(t,i,τ){
  let p=null;
  const atSend={x:SENDP.x-14,y:SENDP.y-4};
  if(i===0){p=τ<.45?{x:lerp(860,atSend.x,E.out(prog(τ,0,.45))),y:lerp(1640,atSend.y,E.out(prog(τ,0,.45))),o:1}:{x:lerp(atSend.x,1000,E.in(prog(τ,.75,1.4))),y:lerp(atSend.y,1900,E.in(prog(τ,.75,1.4))),o:1-prog(τ,1.2,1.4)};
    const press=τ>.4&&τ<.6;CUR.style.transform=`translate(${p.x}px,${p.y}px) scale(${press?.88:1})`;vis(CUR,p.o);SEND.style.transform=`scale(${press?.88:1})`;return}
  if(i===11){if(t<61.6){vis(CUR,0);return}const q=E.out(prog(t,61.6,63));CUR.style.transform=`translate(${lerp(1080,860,q)}px,${lerp(1950,1640,q)}px)`;vis(CUR,clamp(prog(t,61.6,61.9)));SEND.style.transform='none';return}
  // keyword scenes: in → click send → (wipe: drag the handle / sun: drag the sun) → out
  const press=τ>1.52&&τ<1.68;
  if(τ<1.1||τ>4.3){vis(CUR,0);SEND.style.transform='none';return}
  let x=lerp(1100,atSend.x,E.out(prog(τ,1.1,1.5))),y=lerp(1800,atSend.y,E.out(prog(τ,1.1,1.5)));
  const sc=SC[i];
  if(sc.mech==='wipe'&&τ>1.68){const m=E.io(prog(τ,1.85,3.45));const hx=BX+PW*m,hy=BY+PH/2;const g=E.io(prog(τ,1.68,1.85));x=lerp(x,hx-8,g);y=lerp(y,hy-6,g)}
  else if(sc.mech==='sun'&&τ>1.68){const p2=E.io(prog(τ,1.85,3.45));const L=ARCP.getTotalLength();const q=ARCP.getPointAtLength(L*lerp(.22,.62,p2));const g=E.io(prog(τ,1.68,1.85));x=lerp(x,q.x+10,g);y=lerp(y,q.y+20,g)}
  const leave=E.in(prog(τ,3.6,4.3));x=lerp(x,1150,leave);y=lerp(y,1950,leave);
  CUR.style.transform=`translate(${x}px,${y}px) scale(${press?.88:1})`;vis(CUR,1-prog(τ,4.1,4.3));SEND.style.transform=`scale(${press?.88:1})`;
}

// ───────── sound events
const SFX=[];const sx=(t,type,g=1,pan=0,extra)=>SFX.push(Object.assign({t:+t.toFixed(3),type,g,pan},extra||{}));
sx(.45,'click',.8,.3);sx(.65,'shimmer',.35,0,{soft:1});sx(2.25,'erase',.5,0);sx(2.55,'tick',.45,-.3);sx(2.85,'tick',.45,0);sx(3.15,'tick',.45,.3);[3.0,3.45,3.9].forEach(x=>sx(x,'snap',.5));
SC.slice(1,11).forEach((s,k)=>{const a=s.t0;
  for(let c=0;c<s.key.length+1;c++)sx(a+.3+c*.045,'key',.22,(hash(c+k)-.5)*.5,{s:c+k*20});
  sx(a+.95,'swish',.45,.2,{d:.5});sx(a+1.42,'tick',.5,.25,{hi:1});sx(a+1.6,'click',.75,.35);
  if(k>0)sx(a-.05,'whip',.5,0,{d:.55});
  const M={wipe:[[1.85,'air',.6,{d:1.6}],[3.45,'click',.5,{}]],diffuse:[[1.8,'air',.55,{d:1.8}]],flash:[[2.45,'shutter',.85,{}],[2.6,'swish',.35,{d:.4}]],trace:[[2.1,'rise',.55,{d:1.4}]],
    sun:[[1.85,'air',.5,{d:1.6}],[2.6,'bell',.4,{}]],lens:[[1.9,'swoosh',.55,{d:1.5}],[3.35,'focus',.6,{}]],drop:[[1.85,'lowswish',.6,{d:1.2}]],
    shatter:[[1.9,'swish',.4,{d:.4}],[2.25,'swish',.35,{d:.4}],[2.6,'swish',.3,{d:.4}]],page:[[2.0,'accent',.5,{n:0}],[2.9,'accent',.6,{n:1}]],streak:[[1.85,'speed',.75,{d:1.3}]]}[s.mech]||[];
  M.forEach(([o,ty,g,ex])=>sx(a+o,ty,g,0,ex));});
for(let k=0;k<10;k++)sx(55.05+k*.08+.35,'tick',.3,(k%2?.3:-.3),{hi:1});sx(59.5,'fold',.55,0,{d:.8});
'Make it look better.'.split('').forEach((c,k)=>sx(61.0+k*.07,'key',.2,(hash(k)-.5)*.4,{s:k+300}));
window.SFX=SFX;window.renderAt=renderAt;window.DUR=DUR;window.SCN=SC.map(s=>({t0:s.t0,line:s.line,v:s.v}));
Promise.all([document.fonts.ready,...[...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=i.onerror=r))]).then(()=>{
  // preload every photo so frame rendering never waits
  return Promise.all(['00a','00b',...SC.flatMap(s=>[s.A,s.B]).filter(Boolean)].map(k=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=SRC(k)})))}).then(()=>{renderAt(0);window.ready=true});
