// Звук выпуска 03 (электричество Китая): тёмный пульс 120 BPM, Am–F–C–G, музыка тише — место под голос; SFX под каждое действие.
window.makeAudio=async(D=DURATION,{music:withMusic=true}={})=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-16;bus.ratio.value=3;const master=ac.createGain();bus.connect(master).connect(ac.destination);
  master.gain.setValueAtTime(1,D-2.2);master.gain.linearRampToValueAtTime(0,D-.1);
  // пространство: свёртка с затухающим шумом
  const verb=ac.createConvolver();{const n=SR*2.2,b=ac.createBuffer(2,n,SR);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let s=7+ch;for(let i=0;i<n;i++){s=(s*16807)%2147483647;d[i]=(s/1073741823.5-1)*Math.pow(1-i/n,3);}}verb.buffer=b;}
  const wet=ac.createGain();wet.gain.value=.22;verb.connect(wet).connect(bus);
  const music=ac.createGain();music.gain.value=withMusic?.34:0;music.connect(bus);music.connect(verb);const fx=ac.createGain();fx.gain.value=1;fx.connect(bus);const fxv=ac.createGain();fxv.gain.value=.5;fx.connect(fxv).connect(verb); // музыка тише — место под будущий голос
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,dest=music,a=.005,lp=0){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);
    if(lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl).connect(g);}else o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.05);return o;}
  function noise(t,d,type,f,q,v,dest=fx,a=.005){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(t,(t*1.37)%2);s.stop(t+d+.05);return{fl,g};}
  function sweep(f0,f1,t,d,v,dest=fx,type='sine'){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,.004,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
  const whoosh=(t,d,v=.25,f0=600,f1=3000)=>{const n=noise(t,d,'bandpass',f0,.9,v,fx,d*.6);n.fl.frequency.setValueAtTime(f0,t);n.fl.frequency.exponentialRampToValueAtTime(f1,t+d*.7);};
  const hit=(t,v=.5,f=110)=>{sweep(f,42,t,.4,v);noise(t,.09,'lowpass',1200,.8,v*.6);};
  // музыка: цикл Am–F–C–G, такт 2 с; вступление — без бочки до 3,0, вдох на 15–16
  const CY=[[220,261.6,329.6],[174.6,220,261.6],[196,261.6,329.6],[196,246.9,293.7]],CR=[55,43.65,65.41,49];
  // пульс: пауза на «STILL SHORT» (Нигерия) до пересечения цели (Филиппины), затихает в конце финала
  const tense=tb=>tb>=JP.t0+STEP&&tb<crossT(US,TPOP);
  const groove=tb=>((tb>=3&&tb<15)||(tb>=16&&tb<D-1))&&!tense(tb)&&!(tb>=FIN+14);
  const busy=tb=>tb>=crossT(BR,TPOP/2)&&groove(tb);
  for(let b=0;b<Math.ceil(D/2);b++){const t=b*2,ch=CY[b%4],R_=CR[b%4];
    ch.forEach(f=>{osc('sawtooth',f,t,2.1,.018,music,.4,900);osc('sawtooth',f*1.006,t,2.1,.014,music,.4,900);});
    if(t<3){osc('sine',R_,t,2.1,.22,music,.3);}
    for(let k=0;k<4;k++){const tb=t+k*.5;
      if(groove(tb)){osc('sawtooth',R_*2,tb,.2,.09,music,.004,380);osc('sawtooth',R_*2,tb+.25,.18,.06,music,.004,380);sweep(140,44,tb,.26,.6,music);}
      if(busy(tb)){noise(tb+.125,.03,'highpass',9000,.7,.04,music,.002);noise(tb+.375,.03,'highpass',9000,.7,.04,music,.002);}
      if(tb>=9&&groove(tb))noise(tb+.25,.04,'highpass',8000,.7,.07,music,.002);
      if(tb>=5&&groove(tb))[0,1,2].forEach(j=>osc('triangle',ch[(k+j)%ch.length]*2,tb+j*.166,.22,.03,music,.003));}}
  const bell=(t,v=.08,fs=[1318.5,1568,1975.5])=>fs.forEach((f,k)=>osc('sine',f,t,1.6,v/(k+1),fx,.002));
  // вступление: удар, Китай загорается, карточки «?», вопрос, счётчик, сборка интерфейса
  hit(.6,.6,100);noise(.6,.7,'bandpass',1800,.7,.12,fx,.3);[1568,2093].forEach((f,k)=>osc('sine',f,.65,.9,.04/(k+1),fx,.01));
  for(let i=0;i<8;i++)osc('triangle',[659.3,784,880,987.8,1174.7,1318.5,1568,1760][i],1.5+i*.25,.2,.07,fx,.002);
  hit(3.0,.7,120);whoosh(3.5,.6,.1,2500,6000);hit(4.0,.8,95);sweep(70,32,4.0,1.0,.35);noise(5.0,.8,'highpass',6000,.6,.07,fx,.25);
  [8.5,8.55,8.6].forEach((t,i)=>whoosh(t,.5,.12,1500-i*200,400));whoosh(8.7,1.2,.2,300,2200);sweep(90,45,10.3,.3,.3);
  {let t=T_ODO[0],dt=.035;while(t<T_ODO[1]){osc('square',2600+((t*97)%1)*900,t,.012,.035,fx,.001);t+=dt;dt*=1.03;}}
  [T_ODO[1]-.64,T_ODO[1]-.48,T_ODO[1]-.32,T_ODO[1]-.16].forEach((t,i)=>{osc('sine',1200+i*150,t,.08,.16,fx,.001);});
  hit(T_ODO[1],.6,120);bell(T_ODO[1],.08,[1318.5,2637]);whoosh(T_TAG,.5,.2,2500,600);
  whoosh(T_PILL-.2,1.2,.2,400,2600);sweep(80,45,T_PILL+.55,.3,.35);
  [.55,.8,1.05].forEach((d,i)=>{osc('sine',[880,1108.7,1318.5][i],T_PILL+.3+d,.18,.13,fx,.002);noise(T_PILL+.3+d,.02,'highpass',4000,.7,.12);});
  bell(T_PILL+1.3,.07,[1760,2637,3520]);osc('sine',520,T_PILL+.8,.08,.15,fx,.001);
  osc('sine',520,18.0,.08,.15,fx,.001);noise(18.0,.05,'bandpass',2000,2,.15);whoosh(22.6,.6,.14,2500,700);hit(23.55,.5,110);whoosh(26,.35,.14,700,3000);hit(26.05,.35,120);
  // шаги стран
  for(const st of STEPS){const t0=st.t0;
    if(st.i)whoosh(t0,.4,.12,1200,400);
    whoosh(t0+.1,.9,.2,400,2000);sweep(90,45,t0+K.arrive,.3,.3);
    [1568,2093].forEach((f,k)=>osc('sine',f,t0+K.hl,.9,.04/(k+1),fx,.01));
    osc('sine',3000,t0+K.idx,.05,.05,fx,.001);hit(t0+K.name,.5,120);
    {let t=t0+K.num,dt=.035;while(t<t0+K.unit){osc('square',2600+((t*97)%1)*900,t,.012,.035,fx,.001);t+=dt;dt*=1.035;}}
    [1318.5,2637].forEach((f,k)=>osc('sine',f,t0+K.unit,1.0,.06/(k+1),fx,.002));noise(t0+K.unit+.2,.6,'highpass',6000,.6,.07,fx,.2);
    whoosh(t0+K.card,.5,.18,2500,600);osc('sine',520,t0+K.card+.6,.08,.15,fx,.001);noise(t0+K.card+.6,.05,'bandpass',2000,2,.15);
    noise(t0+K.fill,.6,'bandpass',1800,.7,.12,fx,.25);whoosh(t0+K.chip,.6,.18,500,2800);
    const lf=[880,987.8,1108.7,1174.7,1318.5][st.i%5];osc('sine',lf,t0+K.land,.25,.15,fx,.002);noise(t0+K.land,.03,'highpass',4000,.7,.14);sweep(80,45,t0+K.land,.25,.3);
    for(const ph of NOTE[st.n]||[]){const tn=t0+(ph[2]??K.note);whoosh(tn,.35,.14,700,3000);hit(tn+.05,.35,120);noise(tn+.35,.6,'highpass',6000,.6,.06,fx,.2);}
    for(const [n,m] of MILE)if(n===st.n){const t=crossT(st,TPOP*m/100);hit(t,m===100?.95:.8,95);sweep(70,32,t,1.0,.35);bell(t,.1,m===100?[1318.5,1760,2217.5,2637]:m===75?[1174.7,1568,1975.5]:m===50?[1046.5,1318.5,1568]:[987.8,1318.5,1661.2]);}}
  // отметки 100M…1B: сдержанный «тик»
  for(const [n,v,lab] of POPS){const t=crossT(STEPS[n-1],v);osc('sine',1975.5,t,.3,.07,fx,.002);osc('sine',2637,t+.06,.3,.05,fx,.002);if(lab.includes('10%'))bell(t+.1,.07,[880,1318.5,1760]);}
  // Япония: музыка падает, «STILL SHORT»
  {const a=JP.t0+STEP;whoosh(a+.1,1.0,.18,2500,300);sweep(60,28,a+1.0,1.6,.45);hit(a+1.3,.7,90);noise(a+1.9,.5,'highpass',5000,.6,.06,fx,.2);
    osc('sine',520,a+3.0,.1,.12,fx,.002);[110,164.8,220].forEach(f=>osc('sine',f,a+.5,JP.len-STEP+1.5,.03,music,1.2));}
  // США: долгий рост, нарастание к цели, удар и аккорд на пересечении
  {const L=crossT(US,TPOP);{const n=noise(L-1.6,1.6,'bandpass',300,1.5,.28,fx,1.55);n.fl.frequency.setValueAtTime(300,L-1.6);n.fl.frequency.exponentialRampToValueAtTime(6000,L);sweep(150,800,L-1.4,1.4,.06,fx,'sawtooth');}
    noise(L,1.2,'lowpass',500,.7,.35,fx,.01);[220,277.2,329.6,440,554.4].forEach(f=>osc('sawtooth',f,L,3.0,.016,music,.02,1400));}
  // финал: волна по странам, рост полос, «DIFFERENCE», разрешение музыки
  {const F=FIN;for(let k=0;k<25;k++)osc('sine',1046.5*Math.pow(2,(k%12)/12),F+1.0+k*.1,.12,.035,fx,.002);
    [3.2,4.4].forEach(d=>{const n=noise(F+d,.9,'bandpass',300,1.2,.16,fx,.8);n.fl.frequency.setValueAtTime(300,F+d);n.fl.frequency.exponentialRampToValueAtTime(2500,F+d+.9);});
    bell(F+5.4,.07);hit(F+6.4,.7,100);bell(F+6.4,.08,[1318.5,1760,2217.5]);
    [220,261.6,329.6,493.9,659.3].forEach(f=>osc('sawtooth',f,F+14,FLEN-14,.016,music,.05,1100));osc('sine',55,F+14,FLEN-14,.25,music,.05);bell(F+14,.06);}
  const buf=await ac.startRendering();const L=buf.getChannelData(0),Rr=buf.getChannelData(1),n=L.length;
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(Rr[i]));const g=.89/pk;
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,Rr[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
