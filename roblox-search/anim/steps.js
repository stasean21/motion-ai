// Episode 05 — камера, вступление, карточка, рейтинг, финальная пятёрка и концовка.
// ---------- камера ----------
const REG=[400,150,1420,900],REG_F=[640,150,1420,900];
const sc3=(v,k)=>[v[0],v[1],v[2]*k];
{const vb=k=>view(VIEWS[k],[200,150,1720,930],.9);
  key(0,[WV[0]+60,WV[1]+10,WV[2]*.94]);key(3.7,sc3(WV,1.0));
  key(4.7,vb('EUR'));key(5.9,vb('LAM'));key(7.1,vb('SEA'));key(8.4,WVL);key(14,sc3(WVL,1.03));key(19.4,WVL);}
for(const s of STEPS){const K=s.K,pv=CAM[CAM.length-1],L=view(s.vbox,s.fin?REG_F:REG,s.act==='Locate'?.95:.78);
  // перелёт: сначала отъезд на месте, потом перенос на малом зуме, потом наезд — без смазанных «хлыстов» через полмира
  const dist=Math.hypot(L[0]-pv[1],L[1]-pv[2]),zm=Math.max(.3,Math.min(pv[3],L[2],650/Math.max(dist,1)));
  if(zm<Math.min(pv[3],L[2])*.85){CAM.push([s.t0-.15,pv[1],pv[2],zm,0,0]);CAM.push([s.t0+K.arrive*.5,L[0],L[1],zm*1.05,0,0]);}
  key(s.t0+K.arrive,L);
  if(s.act==='Map'){const R=view(s.reg,REG,.62);key(s.t0+2.2,sc3(L,1.02));key(s.t0+3.0,R);key(s.t0+K.out,sc3(R,1.03));}
  else if(s.i===STEPS.length-1){key(s.t0+6.0,sc3(L,1.05));key(s.t0+7.8,WV);key(FIN+10,sc3(WV,1.02));key(DURATION,sc3(WV,1.04));}
  else key(s.t0+K.out,sc3(L,1.05));}
// ---------- точки для глаз: самая «глубокая» точка внутри основной части ----------
const pcx=document.createElement('canvas').getContext('2d');
function deepPoint(p,box){const N=28,pts=[];for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=box[0]+(box[2]-box[0])*i/N,y=box[1]+(box[3]-box[1])*j/N;pts.push([x,y,pcx.isPointInPath(p,x,y)]);}
  const out=pts.filter(q=>!q[2]);let best=null,bd=-1;for(const q of pts){if(!q[2])continue;let d=1e9;for(const o of out)d=Math.min(d,Math.hypot(q[0]-o[0],q[1]-o[1]));if(d>bd){bd=d;best=q;}}
  return best?[best[0],best[1]]:[(box[0]+box[2])/2,(box[1]+box[3])/2];}
for(const s of STEPS)s.eye=deepPoint(s.p,MAINBOX[s.id]&&!VIEWS[s.fl]?MAINBOX[s.id]:s.box);
// реакция: короткое удивление только у мест без ничьей; у ничьих — спокойные глаза
const moodAt=(s,r)=>s.tie===1&&r>s.K.barEnd&&r<s.K.barEnd+1.3?'wide':'happy';
function mapEyes(c,t,r,s,C){if(s.tiny||r<s.K.reveal+.3||r>s.K.out+.35)return;const bw=(s.box[2]-s.box[0])*C.z,sz=cl(bw*.1,0,44);if(sz<9)return;
  const [x,y]=toScreen(C,s.eye[0],s.eye[1]);const q=cl(spring(r-s.K.reveal-.3,2.4,.5),0,1.2),m=moodAt(s,r),pop=m==='wide'?1+.25*Math.exp(-(r-s.K.barEnd)*5):1;
  eyes(c,x,y,sz*q*pop,1,-.1,m,blinkAt(t,s.i),seg(r,s.K.reveal+.3,.15)*(1-seg(r,s.K.out,.35)));}
// ---------- лупа для компактных мест (Гонконг, Сингапур) ----------
const lc=document.createElement('canvas');lc.width=W;lc.height=H;const LM=lc.getContext('2d');
function lens(c,t,r,s,C){const K=s.K;if(r<.2||r>K.out+.4)return;const [sx,sy]=toScreen(C,s.bc[0],s.bc[1]),q=spring(r-.2,1.7,.6),out=1-seg(r,K.out,.35),RR=140,lx=sx-260,ly=Math.max(sy-200,330);
  const ph=(r*1.6)%1;c.save();c.globalAlpha=out*(1-ph);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(sx,sy,10+ph*36,0,7);c.stroke();c.restore();
  c.save();c.globalAlpha=out;c.fillStyle='#fff';c.beginPath();c.arc(sx,sy,6,0,7);c.fill();
  c.globalAlpha*=seg(r,.3,.3);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.setLineDash([2,12]);c.lineCap='round';c.beginPath();c.moveTo(sx,sy);c.lineTo(lx+RR*.7,ly+RR*.7);c.stroke();c.setLineDash([]);
  const z=Math.min(C.z*9,1.1*RR/Math.max(s.box[2]-s.box[0],s.box[3]-s.box[1]));drawMap(t,{cx:s.bc[0],cy:s.bc[1],z,rot:0},LM);
  c.translate(lx,ly);c.scale(cl(q,0,1.1),cl(q,0,1.1));c.fillStyle='#fff';c.beginPath();c.arc(0,0,RR+8,0,7);c.fill();c.beginPath();c.arc(0,0,RR,0,7);c.clip();
  c.fillStyle=COL.bg;c.fillRect(-RR,-RR,2*RR,2*RR);c.drawImage(lc,W/2-RR,H/2-RR,2*RR,2*RR,-RR,-RR,2*RR,2*RR);
  if(r>K.reveal+.3){const e=cl(spring(r-K.reveal-.3,2.4,.5),0,1.2);eyes(c,0,-8,26*e,1,-.1,moodAt(s,r),blinkAt(t,s.i),1);}
  font(c,9,20,2);c.textAlign='center';c.fillStyle='#fff';c.fillText('INSET',0,RR-18);c.restore();}
// ---------- вступление 0:00–0:20 ----------
const SIL=[[330,800],[960,850],[1590,800]];
function silhouette(c,x,y,a,t,k){if(a<=0)return;const bob=Math.sin(t*2.2+k*2)*8;c.save();c.globalAlpha=a;c.translate(x,y+bob);c.rotate(Math.sin(t*1.7+k)*.04);
  rr(c,-84,-63,168,126,16,'#33405F');c.strokeStyle='rgba(245,242,233,.45)';c.lineWidth=3;c.setLineDash([8,8]);c.stroke();c.setLineDash([]);
  font(c,9,74);c.textAlign='center';c.fillStyle='rgba(245,242,233,.55)';c.fillText('?',0,26);c.restore();eyes(c,x,y+bob-70,26*a,Math.sin(t*1.3+k),.3,'wide',blinkAt(t,k+200),a);}
function intro(c,t,C){if(t>S_T0+.5)return;
  const dim=seg(t,.2,.5)*(1-seg(t,19.2,.6))*.5;if(dim>0){c.fillStyle=`rgba(8,12,26,${dim})`;c.fillRect(0,0,W,H);}
  // 0–4: три безымянных флага и вопрос
  SIL.forEach(([x,y],k)=>silhouette(c,x,y,cl(spring(t-.3-k*.2,2,.55),0,1.1)*(1-seg(t,3.75,.3)),t,k));
  word(c,t,{s:'WHERE DOES',w:2,size:72,x:960,y:330,al:'center',in:.3,a:'track',ls0:60,ls:10,out:3.7,ex:'up',odur:.3});
  word(c,t,{s:'ROBLOX',w:9,size:190,x:960,y:520,al:'center',in:.7,a:'slam',col:COL.or,glow:'rgba(255,154,69,.3)',out:3.75,ex:'up',odur:.3});
  word(c,t,{s:'GET THE MOST *SEARCH INTEREST?*',rich:1,w:9,size:58,x:960,y:610,al:'center',in:1.3,a:'mask',out:3.8,ex:'up',odur:.3});
  // 4–8: быстрые перелёты, «PICK YOUR COUNTRY»
  word(c,t,{s:'PICK YOUR',w:2,size:84,x:960,y:470,al:'center',in:4.4,a:'track',ls0:70,ls:12,out:7.75,ex:'up',odur:.3});
  word(c,t,{s:'COUNTRY',w:9,size:200,x:960,y:650,al:'center',in:4.7,a:'slam',col:COL.tq,glow:'rgba(39,214,203,.3)',out:7.8,ex:'up',odur:.3});
  word(c,t,{s:'before the map fills up',w:7,size:34,x:960,y:720,al:'center',in:5.3,a:'mask',col:COL.mut,out:7.82,ex:'up',odur:.3});
  // 8–14: строка поиска «Roblox» → «JAN–SEP 2026» и подпись метрики
  {const a=cl(spring(t-8.2,2,.6),0,1.1),o=1-eie(seg(t,13.6,.4));if(t>8.2&&o>0){const fw=900,fh=112,x=960-fw/2,y=470;c.save();c.globalAlpha=cl(a*2)*o;
      c.translate(960,y+fh/2-o*0);c.scale(lerp(.7,1,cl(a)),lerp(.7,1,cl(a)));c.translate(-960,-(y+fh/2));
      c.shadowColor='rgba(0,0,0,.4)';c.shadowBlur=40;rr(c,x,y,fw,fh,fh/2,'#F5F2E9');c.shadowBlur=0;
      c.strokeStyle='#5B6785';c.lineWidth=7;c.beginPath();c.arc(x+70,y+50,20,0,7);c.stroke();c.lineCap='round';c.beginPath();c.moveTo(x+85,y+65);c.lineTo(x+102,y+82);c.stroke();
      c.save();c.beginPath();c.rect(x+120,y+8,fw-170,fh-16);c.clip();
      const sw=eio(seg(t,11.3,.45)),txt='Roblox',n=Math.floor(cl((t-8.7)/.13,0,6));font(c,7,60);c.textAlign='left';c.fillStyle='#14121F';
      c.fillText(txt.slice(0,n),x+130,y+78-sw*fh);const tw=c.measureText(txt.slice(0,n)).width;
      if(sw<.5&&(t<9.6||Math.floor(t*2.4)%2===0)){c.fillStyle=COL.or;c.fillRect(x+136+tw,y+28,4,58);}
      if(sw>0){font(c,9,60,2);c.fillStyle='#14121F';c.fillText('JAN–SEP 2026',x+130,y+78+(1-sw)*fh);}c.restore();c.restore();}}
  word(c,t,{s:'RELATIVE GOOGLE',w:9,size:62,x:960,y:330,al:'center',in:11.8,a:'mask',col:COL.tq,out:13.6,ex:'up',odur:.3});
  word(c,t,{s:'SEARCH INTEREST',w:9,size:62,x:960,y:400,al:'center',in:11.95,a:'mask',col:COL.tq,out:13.62,ex:'up',odur:.3});
  word(c,t,{s:'Search term: Roblox · Worldwide · Web Search',w:7,size:28,x:960,y:650,al:'center',in:12.2,a:'mask',col:COL.mut,out:13.64,ex:'up',odur:.3});
  // 14–20: шкала 0–100, «NOT PLAYER COUNTS», «83 COUNTRIES AND REGIONS»
  {const a=seg(t,14.1,.35)*(1-seg(t,17.1,.35));if(a>0){c.save();c.globalAlpha=a;c.translate(0,(1-eoe(seg(t,14.1,.5)))*40);
      scale100(c,460,500,1000,46,100,eio(seg(t,14.4,1.1)),{labels:false});font(c,9,30);c.fillStyle=COL.txt;c.textAlign='center';for(const m of [0,25,50,75,100])c.fillText(String(m),460+m*10,590);c.restore();}}
  word(c,t,{s:'INDEX 0–100',w:9,size:70,x:960,y:450,al:'center',in:14.15,a:'mask',out:17.1,ex:'up',odur:.3});
  word(c,t,{s:'NOT PLAYER COUNTS',w:9,size:66,x:960,y:700,al:'center',in:15.6,a:'slam',from:1.5,col:COL.or,glow:'rgba(255,154,69,.3)',out:17.15,ex:'up',odur:.3});
  word(c,t,{s:'The leading location = 100 · each score compares Roblox with all searches there',w:7,size:26,x:960,y:752,al:'center',in:16.0,a:'mask',col:COL.mut,out:17.17,ex:'up',odur:.3});
  word(c,t,{s:'83',w:9,size:230,x:960,y:560,al:'center',in:17.4,a:'slam',col:COL.tq,glow:'rgba(39,214,203,.3)',out:19.2,ex:'push',odur:.4});
  word(c,t,{s:'COUNTRIES AND REGIONS',w:2,size:58,x:960,y:650,al:'center',in:17.7,a:'track',ls0:50,ls:8,out:19.2,ex:'fade',odur:.4});
  word(c,t,{s:'from the lowest score to the highest',w:7,size:30,x:960,y:705,al:'center',in:18.1,a:'mask',col:COL.mut,out:19.2,ex:'fade',odur:.4});}
// ---------- шапка ----------
function header(c,t){const a=seg(t,S_T0-.5,.5)*(1-seg(t,FIN+14.5,.5));if(a<=0)return;c.save();c.globalAlpha=a*.95;
  font(c,9,19,3);const s='ROBLOX · RELATIVE SEARCH INTEREST · INDEX 0–100',w=c.measureText(s).width;rr(c,960-w/2-24,36,w+48,42,21,COL.ui);c.fillStyle=COL.mut;c.textAlign='center';c.fillText(s,960,64);c.restore();}
// ---------- карточка места (справа) ----------
const CX=1462,CY=128,CWd=418,CHt=830;
const curStep=t=>{let cur=null;for(const s of STEPS)if(t>=s.t0-.6)cur=s;return cur;};
function card(c,t,C){const a=eoe(seg(t,S_T0-.7,.6)),o=eie(seg(t,FIN+.2,.5));if(a<=0||o>=1)return;c.save();c.translate((1-a)*500+o*560,0);
  c.save();c.globalAlpha=.96;rr(c,CX+8,CY+14,CWd,CHt,40,'rgba(0,0,0,.25)');rr(c,CX,CY,CWd,CHt,40,COL.ui);c.restore();c.strokeStyle='rgba(39,214,203,.3)';c.lineWidth=3;c.stroke();
  // заглушка флага между местами
  const s=curStep(t),r=s?t-s.t0:-9;const shown=s&&r>=s.K.reveal-.05;
  const gap=s?(1-seg(r,s.K.reveal-.25,.2))*(s.i?seg(t,s.prevS.t0+s.prevS.K.out+.3,.2):1):1;
  if(gap>0){c.save();c.globalAlpha=gap*.9;rr(c,CX+44,CY+92,330,247.5,26,'rgba(33,48,79,.95)');c.strokeStyle='rgba(245,242,233,.3)';c.lineWidth=3;c.setLineDash([8,9]);c.stroke();c.setLineDash([]);
    font(c,9,110);c.textAlign='center';c.fillStyle='rgba(245,242,233,.35)';c.fillText('?',CX+209,CY+258);c.restore();}
  for(const st of STEPS){const rr2=t-st.t0;if(rr2<st.K.reveal-.05||rr2>st.K.out+.5)continue;cardContent(c,t,rr2,st);}
  c.restore();}
function cardContent(c,t,r,s){const K=s.K,ex=eie(seg(r,K.out,.38));if(ex>=1)return;c.save();c.globalAlpha=1-ex;c.translate(0,-ex*50);
  // ранг и ничья
  {const q=cl(spring(r-K.reveal-.06,2.4,.5),0,1.15);c.save();c.translate(CX+44,CY+56);c.scale(q,q);font(c,9,30);const rs='#'+s.rank,w=c.measureText(rs).width;rr(c,0,-34,w+36,50,25,COL.tq);c.fillStyle=COL.bg;c.textAlign='left';c.fillText(rs,18,2);
    let x=w+48;if(s.tie>1){font(c,9,20,2);const tw=c.measureText('TIED').width;c.strokeStyle=COL.or;c.lineWidth=3;rr(c,x,-30,tw+28,42,21);c.stroke();c.fillStyle=COL.or;c.fillText('TIED',x+14,-2);x+=tw+40;}
    font(c,7,18,2);c.fillStyle=COL.mut;c.fillText('OF 83',x,-2);c.restore();}
  // флаг-персонаж
  {const p=spring(r-K.reveal,2,.55),fy=CY+92,sy=Math.max(.02,cl(p,0,1.12));c.save();c.translate(0,fy+124);c.scale(1,sy);c.translate(0,-(fy+124));
    if(s.act==='Locate')flagWave(c,FLAGS[s.fl],CX+44,fy,330,7*cl(r-K.reveal),t);else flag(c,CX+44,fy,330,FLAGS[s.fl]);c.restore();
    const look=s.act==='Reveal'&&r>K.bar-.1?[0,1]:[-1,.15];if(r>K.reveal+.25)eyes(c,CX+209,fy+150,30*cl(spring(r-K.reveal-.25,2.4,.5),0,1.1),look[0],look[1],moodAt(s,r),blinkAt(t,s.i+50),1);}
  // название
  {const sz=fitSize(c,s.name,9,52,340);word(c,t,{s:s.name,w:9,size:sz,x:CX+44,y:CY+400,in:s.t0+K.name,a:s.act==='Reveal'?'track':'mask',ls0:40,dur:.4});}
  // индекс: одометр + /100; шкала 0–100 к точному значению
  if(r>=K.bar){const ns=String(Math.round(s.v*eoc(seg(r,K.bar,K.barEnd-K.bar))));c.save();c.globalAlpha*=seg(r,K.bar,.12);// счёт идёт вместе со шкалой и никогда не показывает больше итогового значения
    const sz=s.act==='Reveal'?130:116,kick=r>K.barEnd?Math.exp(-(r-K.barEnd)*9)*Math.sin((r-K.barEnd)*40)*.05:0;font(c,9,sz,-sz*.02);c.textAlign='left';c.fillStyle=palT(s.v);c.fillText(ns,CX+44,CY+528+kick*sz);
    font(c,9,sz,-sz*.02);const w=c.measureText(String(s.v)).width;
    font(c,7,34);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('/100',CX+52+w,CY+528);c.restore();}
  {const p=eoc(seg(r,K.bar,K.barEnd-K.bar));c.save();c.globalAlpha*=seg(r,K.reveal,.3);scale100(c,CX+44,CY+560,330,26,s.v,p);c.restore();
    const g=Math.exp(-Math.max(0,r-K.barEnd)*3)*(r>K.barEnd?1:0);if(g>.02){const gx=CX+44+330*s.v/100;const gr=c.createRadialGradient(gx,CY+573,0,gx,CY+573,60);gr.addColorStop(0,`rgba(255,255,255,${.6*g})`);gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(gx-60,CY+513,120,120);}}
  // ничья: общий ранг и номер внутри группы
  let y=CY+648;
  if(s.tie>1){const a=seg(r,K.barEnd-.2,.3);c.save();c.globalAlpha*=a;font(c,9,24,1);c.fillStyle=COL.or;c.textAlign='left';c.fillText(`TIED AT ${s.v} · RANK #${s.rank}`,CX+44,y);
    font(c,7,18,1);c.fillStyle=COL.mut;c.fillText(`${s.tie} locations share this score`,CX+44,y+30);
    for(let k=0;k<s.tie;k++){const dx=CX+44+k*24,on=k<s.tieN;c.beginPath();c.arc(dx+8,y+56,8,0,7);if(on){c.fillStyle=k===s.tieN-1?COL.or:'rgba(255,154,69,.55)';c.fill();}else{c.strokeStyle='rgba(154,167,194,.6)';c.lineWidth=2;c.stroke();}}
    c.restore();y+=96;}
  // «Compare»: предыдущее место на той же шкале
  if(s.act==='Compare'&&s.prevS){const P=s.prevS,a=eoe(seg(r,K.bar+.2,.5));c.save();c.globalAlpha*=a;c.translate(-(1-a)*80,0);
    font(c,7,15,2);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('SAME 0–100 SCALE',CX+44,y);
    flag(c,CX+44,y+14,40,FLAGS[P.fl]);font(c,7,17);c.fillStyle=COL.mut;c.fillText(fitTxt(c,P.name,150),CX+94,y+34);scale100(c,CX+250,y+22,90,10,P.v,1,{ticks:false,labels:false});font(c,9,20);c.textAlign='right';c.fillStyle=palT(P.v);c.fillText(String(P.v),CX+376,y+34);
    flag(c,CX+44,y+60,40,FLAGS[s.fl]);font(c,9,17);c.textAlign='left';c.fillStyle=COL.txt;c.fillText(fitTxt(c,s.name,150),CX+94,y+80);scale100(c,CX+250,y+68,90,10,s.v,eoc(seg(r,K.bar+.4,.6)),{ticks:false,labels:false});font(c,9,20);c.textAlign='right';c.fillStyle=palT(s.v);c.fillText(String(s.v),CX+376,y+80);
    c.restore();}
  c.restore();}
function fitTxt(c,s,w){if(c.measureText(s).width<=w)return s;let k=s.length;while(k>3&&c.measureText(s.slice(0,k)+'…').width>w)k--;return s.slice(0,k)+'…';}
// ---------- рейтинг (слева): завершённые места, новые сверху ----------
const RXL=40,RYT=128,RW=316,ROWH=64,RMAX=11;
const insT=s=>s.t0+s.K.out+.42;
function rail(c,t){const a=eoe(seg(t,S_T0-.6,.6))*(1-seg(t,STEPS[N5].t0-.5,.5));if(a<=0)return;c.save();c.globalAlpha=a;c.translate(-(1-a)*360,0);
  rr(c,RXL,RYT,RW,82+RMAX*ROWH,32,'rgba(23,36,64,.94)');
  let n=0,last=null;for(const s of STEPS){if(s.fin)break;if(t>=insT(s)){n++;last=s;}}
  font(c,7,16,3);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('RANKING SO FAR',RXL+24,RYT+40);
  font(c,9,22);c.textAlign='right';c.fillStyle=COL.txt;c.fillText(`${n}`,RXL+RW-64,RYT+42);font(c,7,16);c.fillStyle=COL.mut;c.fillText(' / 83',RXL+RW-22,RYT+42);
  c.save();c.beginPath();c.rect(RXL,RYT+56,RW,RMAX*ROWH+20);c.clip();
  const sh=last?1-eoc(seg(t,insT(last),.45)):0;
  for(let k=0;k<Math.min(n,RMAX+1);k++){const s=STEPS[n-1-k],y=RYT+64+(k-sh)*ROWH,ra=k===0?seg(t,insT(s)+.1,.25):1;if(ra<=0)continue;
    c.save();c.globalAlpha*=ra*(k>=RMAX?1-seg(sh,0,1)*0:1);
    if(k===0){const g=c.createLinearGradient(RXL,0,RXL+RW,0);g.addColorStop(0,'rgba(39,214,203,.16)');g.addColorStop(1,'rgba(39,214,203,0)');c.fillStyle=g;c.fillRect(RXL+8,y,RW-16,ROWH-8);}
    font(c,7,15);c.fillStyle=COL.mut;c.textAlign='left';c.fillText('#'+s.rank,RXL+18,y+34);
    flag(c,RXL+68,y+10,48,FLAGS[s.fl]);font(c,9,18);c.fillStyle=COL.txt;c.fillText(fitTxt(c,s.name,128),RXL+126,y+28);
    const bp=s.act==='Stack'?eoc(seg(t,insT(s)+.15,.6)):1;scale100(c,RXL+126,y+38,128,7,s.v,bp,{ticks:false,labels:false});
    font(c,9,26);c.textAlign='right';c.fillStyle=palT(s.v);c.fillText(String(s.v),RXL+RW-20,y+42);c.restore();}
  c.restore();c.restore();
  // перелёт значения из карточки в рейтинг (Stack — крупный флаг с отскоком)
  for(const s of STEPS){if(s.fin)break;const r=t-s.t0-s.K.out;if(r<0||r>.5)continue;const p=eio(seg(r,0,.45)),big=s.act==='Stack';
    const x0=CX+44+165,y0=CY+92+124,x1=RXL+92,y1=RYT+64+34,x=lerp(x0,x1,p),y=lerp(y0,y1,p)-Math.sin(Math.PI*p)*(big?220:140);
    const w=lerp(big?200:120,48,p);c.save();c.globalAlpha=1-seg(p,.85,.15);c.translate(x,y);c.rotate((big?.6:.2)*Math.sin(Math.PI*p));flag(c,-w/2,-w*.375,w,FLAGS[s.fl]);
    font(c,9,lerp(34,20,p));const vs=String(s.v),vw=c.measureText(vs).width;rr(c,w/2+6,-18,vw+20,36,18,palT(s.v));c.fillStyle=COL.bg;c.textAlign='left';c.fillText(vs,w/2+16,9);c.restore();}}
// ---------- финальная пятёрка (слева) ----------
const PX=40,PY=128,PW=560,PROW=104;
function podium(c,t){const t0=STEPS[N5].t0,a=eoe(seg(t,t0-.4,.6))*(1-seg(t,FIN+14.6,.5));if(a<=0)return;c.save();c.globalAlpha=a;c.translate(-(1-a)*600,0);
  rr(c,PX,PY,PW,128+5*PROW,36,'rgba(23,36,64,.95)');font(c,9,40);c.fillStyle=COL.txt;c.textAlign='left';c.fillText('FINAL FIVE',PX+32,PY+58);
  font(c,7,17,2);c.fillStyle=COL.mut;c.fillText('SHARED 0–100 SCALE',PX+34,PY+90);
  for(let k=0;k<5;k++){const s=STEPS[N5+4-k],y=PY+112+k*PROW,ft=s.t0+s.K.out,fill=seg(t,ft+.45,.3),p=eoc(seg(t,ft+.5,.8));
    font(c,9,36);c.textAlign='left';c.fillStyle=k===0?COL.or:COL.tq;c.fillText('#'+(k+1),PX+28,y+60);
    if(fill<1){c.save();c.globalAlpha*=1-fill;rr(c,PX+110,y+18,72,54,10,'rgba(33,48,79,.95)');c.strokeStyle='rgba(245,242,233,.3)';c.lineWidth=2;c.setLineDash([5,6]);c.stroke();c.setLineDash([]);
      font(c,9,34);c.textAlign='center';c.fillStyle='rgba(245,242,233,.4)';c.fillText('?',PX+146,y+58);rr(c,PX+200,y+56,250,14,7,COL.ui2);c.restore();}
    if(fill>0){c.save();c.globalAlpha*=fill;const q=cl(spring(t-ft-.45,2.2,.5),0,1.15);c.save();c.translate(PX+146,y+45);c.scale(q,q);flag(c,-36,-27,72,FLAGS[s.fl]);c.restore();
      font(c,9,26);c.textAlign='left';c.fillStyle=COL.txt;c.fillText(s.name,PX+200,y+42);scale100(c,PX+200,y+56,250,14,s.v,p,{ticks:true,labels:false});
      font(c,9,36);c.textAlign='right';c.fillStyle=palT(s.v);c.fillText(String(s.v),PX+PW-26,y+70);c.restore();}}
  c.restore();
  // перелёт из карточки на пьедестал
  for(let k=0;k<5;k++){const s=STEPS[N5+k],r=t-s.t0-s.K.out;if(r<0||r>.55)continue;const p=eio(seg(r,0,.5)),row=4-k;
    const x=lerp(CX+209,PX+146,p),y=lerp(CY+216,PY+112+row*PROW+45,p)-Math.sin(Math.PI*p)*180,w=lerp(220,72,p);
    c.save();c.globalAlpha=1-seg(p,.9,.1);c.translate(x,y);c.rotate(.3*Math.sin(Math.PI*p));flag(c,-w/2,-w*.375,w,FLAGS[s.fl]);c.restore();}}
// ---------- Монголия: отъезд на всю карту и подпись; концовка ----------
function closing(c,t,C){const M=STEPS[STEPS.length-1],r=t-M.t0;
  {const a=seg(r,6.3,.4)*(1-seg(t,FIN+9.4,.5));if(a>0){c.save();c.globalAlpha=a;const x=1030;
    word(c,t,{s:'HIGHEST RELATIVE',w:9,size:54,x,y:200,al:'center',in:M.t0+6.3,a:'mask',col:COL.or});
    word(c,t,{s:'SEARCH INTEREST',w:9,size:54,x,y:262,al:'center',in:M.t0+6.45,a:'mask',col:COL.or});
    word(c,t,{s:'MONGOLIA · 100 · IN THIS EXPORT',w:7,size:24,x,y:306,al:'center',in:M.t0+6.7,a:'mask',col:COL.txt,ls:3});c.restore();}}
  const a=t-FIN;if(a<0)return;
  // легенда (7:40–7:45)
  {const l=eoe(seg(a,9.8,.5))*(1-seg(a,15.2,.5));if(l>0){const x=1290,y=640,w=590,h=300;c.save();c.globalAlpha=l;c.translate((1-l)*60,0);rr(c,x,y,w,h,32,'rgba(23,36,64,.95)');
    font(c,9,26);c.fillStyle=COL.txt;c.textAlign='left';c.fillText('MAP LEGEND',x+30,y+46);
    scale100(c,x+30,y+70,300,18,100,1,{ticks:false,labels:false});font(c,7,15);c.fillStyle=COL.mut;c.fillText('0',x+30,y+108);c.textAlign='right';c.fillText('100',x+330,y+108);
    c.textAlign='left';font(c,7,20);c.fillStyle=COL.txt;c.fillText('Colored = numeric result',x+346,y+86);
    rr(c,x+30,y+132,70,44,8,COL.land);c.strokeStyle='rgba(245,242,233,.6)';c.lineWidth=2;c.stroke();c.fillStyle=COL.txt;c.fillText('Neutral = no numeric result',x+118,y+162);
    c.save();rr(c,x+30,y+196,70,44,8);c.fillStyle=c.createPattern(hatch,'repeat');c.fill();c.strokeStyle='rgba(245,242,233,.6)';c.stroke();c.restore();c.fillStyle=COL.txt;c.fillText('Excluded = not included (Russia)',x+118,y+226);
    font(c,7,15);c.fillStyle=COL.mut;c.fillText('Blank results are never shown as zero.',x+30,y+274);c.restore();}}
  // 7:45–8:00: вопрос зрителям и подписка; центр и низ свободны под элементы конечной заставки
  {const d=seg(a,15,.6)*.35;if(d>0){c.fillStyle=`rgba(8,12,26,${d})`;c.fillRect(0,0,W,H);}}
  word(c,t,{s:'WHERE DID YOUR',w:2,size:64,x:960,y:150,al:'center',in:FIN+15.2,a:'track',ls0:50,ls:8});
  word(c,t,{s:'COUNTRY *FINISH?*',rich:1,w:9,size:104,x:960,y:262,al:'center',in:FIN+15.5,a:'slam',from:1.5});
  word(c,t,{s:'Tell us in the comments',w:7,size:32,x:960,y:318,al:'center',in:FIN+16.1,a:'mask',col:COL.mut});
  {const q=cl(spring(a-16.6,2,.55),0,1.1);if(q>0){c.save();c.translate(960,388);c.scale(q,q);font(c,9,26,4);const s='SUBSCRIBE · MAP BY MAP',w=c.measureText(s).width;rr(c,-w/2-34,-30,w+68,56,28,COL.or);c.fillStyle=COL.bg;c.textAlign='center';c.fillText(s,0,8);c.restore();}}}
window.ready=Promise.all([...['N2','N7','N9'].map(f=>document.fonts.load(`40px ${f}`)),...Object.values(FLAG_IM).map(im=>im.complete?0:new Promise(r=>im.onload=im.onerror=r))]).then(rasterFlags);
