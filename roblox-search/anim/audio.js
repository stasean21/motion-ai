// Звук выпуска 05: только эффекты (музыка — music.js, сводится в join). Мягкий тик на каждое появление места,
// короткий акцент на новом (отличном от предыдущего) индексе; у ничьих — тише и без «удивления».
window.makeAudio=async(D=DURATION)=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-16;bus.ratio.value=3;bus.connect(ac.destination);
  const verb=ac.createConvolver();{const n=SR*2.2,b=ac.createBuffer(2,n,SR);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let s=7+ch;for(let i=0;i<n;i++){s=(s*16807)%2147483647;d[i]=(s/1073741823.5-1)*Math.pow(1-i/n,3);}}verb.buffer=b;}
  const wet=ac.createGain();wet.gain.value=.2;verb.connect(wet).connect(bus);
  const fx=ac.createGain();fx.gain.value=1;fx.connect(bus);const fxv=ac.createGain();fxv.gain.value=.5;fx.connect(fxv).connect(verb);
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,a=.005){if(t<0||t>D)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);o.connect(g).connect(fx);o.start(t);o.stop(t+d+.05);}
  function noise(t,d,type,f,q,v,a=.005){if(t<0||t>D)return;const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(fx);s.start(t,(t*1.37)%2);s.stop(t+d+.05);return{fl};}
  function sweep(f0,f1,t,d,v,type='sine'){if(t<0||t>D)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,.004,v,d);o.connect(g).connect(fx);o.start(t);o.stop(t+d+.05);}
  const whoosh=(t,d,v,f0,f1)=>{const n=noise(t,d,'bandpass',f0,.9,v,d*.6);if(n){n.fl.frequency.setValueAtTime(f0,t);n.fl.frequency.exponentialRampToValueAtTime(f1,t+d*.7);}};
  const hit=(t,v=.5,f=110)=>{sweep(f,42,t,.4,v);noise(t,.09,'lowpass',1200,.8,v*.6);};
  const bell=(t,v=.08,fs=[1318.5,1568,1975.5])=>fs.forEach((f,k)=>osc('sine',f,t,1.6,v/(k+1),.002));
  const boing=(t,v=.05)=>{sweep(520,1250,t,.16,v,'triangle');osc('sine',1500,t+.12,.08,v*.6);};
  const tick=(t,v=.05,f=2200)=>{osc('sine',f,t,.06,v,.001);noise(t,.02,'highpass',5000,.7,v*.8);};
  const odoTicks=(a,b,v=.026)=>{let t=a,dt=.03;while(t<b){osc('square',2600+((t*97)%1)*900,t,.01,v,.001);t+=dt;dt*=1.06;}};
  // ноты акцента по величине индекса: пентатоника вверх
  const VALS=[...new Set(STEPS.map(s=>s.v))].sort((a,b)=>a-b),PENT=[0,2,4,7,9];
  const note=v=>{const k=VALS.indexOf(v);return 392*Math.pow(2,(Math.floor(k/5)*12+PENT[k%5])/12);};
  // вступление
  hit(.3,.45,100);[.3,.5,.7].forEach(t=>boing(t,.05));hit(.7,.6,95);sweep(70,32,.7,.9,.25);whoosh(1.3,.4,.12,800,2600);whoosh(3.7,.45,.14,2500,600);
  [4.2,5.4,6.6,7.9].forEach(t=>whoosh(t,.9,.16,400,2400));hit(4.7,.55,100);noise(5.3,.3,'highpass',6000,.6,.05,.1);
  boing(8.2,.05);for(let k=0;k<6;k++){const t=8.7+k*.13;noise(t,.025,'bandpass',3500,1.5,.18);osc('sine',1800+k*40,t,.03,.04,.001);}
  whoosh(11.3,.45,.14,2600,800);osc('sine',880,11.55,.2,.1,.002);tick(11.8,.06);whoosh(13.6,.4,.12,1500,400);
  {const n=noise(14.3,1.2,'bandpass',300,1.2,.12,1.0);if(n){n.fl.frequency.setValueAtTime(300,14.3);n.fl.frequency.exponentialRampToValueAtTime(5000,15.5);}}bell(15.5,.06,[880,1318.5,1760]);
  hit(15.6,.6,95);sweep(70,32,15.6,1.0,.25);hit(17.4,.75,90);bell(17.45,.07,[1046.5,1318.5,1568]);whoosh(19.2,.5,.14,2500,500);
  // места
  for(const s of STEPS){const t0=s.t0,K=s.K,F=s.fin;
    whoosh(t0-.5,1.1,.13,400,2000);
    tick(t0+K.reveal,F?.08:.05,2400);noise(t0+K.reveal,.18,'bandpass',1800,.7,.06,.04);
    odoTicks(t0+K.bar,t0+K.barEnd,F?.03:.022);
    const tb=t0+K.barEnd;
    if(s.newV){osc('sine',note(s.v),tb,.4,F?.16:.11,.003);osc('sine',note(s.v)*2,tb+.04,.3,F?.07:.045,.003);noise(tb,.03,'highpass',4000,.7,.08);}
    else osc('sine',note(s.v),tb,.18,.05,.003);
    if(s.tie===1&&!s.tiny)boing(tb+.05,.045);
    if(s.act==='Map'){whoosh(t0+2.2,.9,.12,2000,500);[2.6,3.2,3.8].forEach(d=>osc('sine',1046.5,t0+d,.12,.04,.002));}
    if(s.act==='Compare')whoosh(t0+K.bar+.2,.4,.08,600,1800);
    if(!F){whoosh(t0+K.out,.45,.1,2000,700);const ti=t0+K.out+.42;if(s.act==='Stack'){hit(ti,.35,130);noise(ti,.06,'bandpass',900,1.4,.18);}else{osc('sine',660,ti,.08,.08,.001);noise(ti,.04,'bandpass',1400,1.4,.1);}}
    else{hit(t0+K.reveal,.5,105);bell(tb,.07,[note(s.v)*2,note(s.v)*3]);whoosh(t0+K.out,.55,.14,2200,600);hit(t0+K.out+.45,.55,110);bell(t0+K.out+.5,.05,[1568,2093]);}}
  // Монголия: отъезд и подпись
  {const M=STEPS[STEPS.length-1];hit(M.t0+M.K.barEnd,.8,90);sweep(70,30,M.t0+M.K.barEnd,1.2,.3);bell(M.t0+M.K.barEnd+.05,.09,[1318.5,1760,2217.5,2637]);
    whoosh(M.t0+6.0,1.8,.16,2400,300);bell(M.t0+6.3,.06,[1568,1975.5,2349]);}
  // концовка
  {const F=FIN;whoosh(F+9.8,.4,.1,800,2200);tick(F+10.1,.05);whoosh(F+15.0,.6,.14,500,2500);hit(F+15.5,.55,100);boing(F+16.6,.06);}
  const buf=await ac.startRendering();return toWav(buf);};
