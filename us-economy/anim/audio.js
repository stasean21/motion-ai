// Звук выпуска 04: только эффекты (музыка — music.js, сводится в join). Эффекты под каждое действие; у стран — мультяшный «бульк» глаз.
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
  // вступление
  hit(.6,.6,100);noise(.6,.7,'bandpass',1800,.7,.12,.3);boing(1.2,.07);
  {let t=T_ODO[0],dt=.03;while(t<T_ODO[1]){osc('square',2600+((t*97)%1)*900,t,.012,.03,.001);t+=dt;dt*=1.035;}}hit(T_ODO[1],.5,120);bell(T_ODO[1],.07,[1318.5,2637]);
  whoosh(T_TAG,.5,.18,2500,600);for(let k=0;k<50;k+=5)osc('sine',1400+k*12,5.0+k*.02,.05,.03,.001);
  noise(7.6,.6,'highpass',6000,.6,.07,.2);hit(8.0,.7,95);sweep(70,32,8.0,1.0,.3);whoosh(11.3,.5,.14,1500,400);
  whoosh(T_PILL-.2,1.2,.18,400,2600);sweep(80,45,T_PILL+.55,.3,.3);[.55,.8,1.05].forEach((d,i)=>osc('sine',[880,1108.7,1318.5][i],T_PILL+.3+d,.18,.12,.002));bell(T_PILL+1.3,.06,[1760,2637,3520]);
  osc('sine',520,14.0,.08,.14,.001);noise(14.0,.05,'bandpass',2000,2,.14);whoosh(17.6,.6,.12,2500,700);whoosh(18.6,.8,.16,500,2800);osc('sine',880,19.4,.2,.12,.002);
  {const n=noise(21.8,.5,'bandpass',3000,1,.1,.1);if(n){n.fl.frequency.setValueAtTime(3000,21.8);n.fl.frequency.exponentialRampToValueAtTime(400,22.3);}}hit(22.55,.45,110);whoosh(25.5,.4,.12,1200,400);
  // шаги стран
  for(const st of STEPS){const t0=st.t0,K=st.K,big=st.n>40;
    if(st.i)whoosh(t0,.35,.1,1200,400);
    whoosh(t0+.05,K.arrive,.16,400,2000);sweep(90,45,t0+K.arrive,.28,.25);
    [1568,2093].forEach((f,k)=>osc('sine',f,t0+K.hl,.8,.03/(k+1),.01));
    osc('sine',3000,t0+K.idx,.05,.04,.001);hit(t0+K.name,big?.5:.38,120);
    {let t=t0+K.num,dt=.03;while(t<t0+K.unit){osc('square',2600+((t*97)%1)*900,t,.01,.028,.001);t+=dt;dt*=1.04;}}
    [1318.5,2637].forEach((f,k)=>osc('sine',f,t0+K.unit,.8,.05/(k+1),.002));
    whoosh(t0+K.card,.45,.14,2500,600);osc('sine',520,t0+K.card+.5,.08,.12,.001);
    noise(t0+K.fill,.5,'bandpass',1800,.7,.1,.2);boing(t0+K.fill+.35,.045);
    whoosh(t0+K.chip,K.land-K.chip+.1,.15,500,2800);
    const lf=[880,987.8,1108.7,1174.7,1318.5][st.i%5];osc('sine',lf,t0+K.land,.25,.13,.002);noise(t0+K.land,.03,'highpass',4000,.7,.12);sweep(80,45,t0+K.land,.25,.26);
    if(K.lin){let t=t0+K.land,dt=.06;while(t<t0+K.land+K.grow){osc('square',1800+((t-t0)*60)%900,t,.012,.022,.001);t+=dt;}}
    for(const ph of NOTE[st.n]||[]){const tn=t0+(ph[2]??K.note);whoosh(tn,.3,.12,700,3000);hit(tn+.05,.3,120);}
    for(const [n,m] of MILE)if(n===st.n){const t=crossT(st,TPOP*m/100);hit(t,m===100?.95:.7,95);sweep(70,32,t,1.0,.3);bell(t,.09,m===100?[1318.5,1760,2217.5,2637]:m===75?[1174.7,1568,1975.5]:m===50?[1046.5,1318.5,1568]:[987.8,1318.5,1661.2]);}
    if(GRID[st.n])for(let k=0;k<st.n;k+=2)osc('sine',880*Math.pow(2,(k%12)/12),t0+K.note-.2+k*.02,.06,.03,.001);}
  for(const [n,v,lab] of POPS){const t=crossT(STEPS[n-1],v);osc('sine',1975.5,t,.3,.06,.002);osc('sine',2637,t+.06,.3,.045,.002);if(lab.endsWith('%'))bell(t+.1,.06,[880,1318.5,1760]);}
  // Великобритания: «STILL SHORT»
  {const a=GB.t0+12.4;sweep(60,28,a,1.4,.4);hit(a+.4,.6,90);noise(a+1.0,.5,'highpass',5000,.6,.05,.2);}
  // финал
  {const F=FIN;for(let k=0;k<50;k+=2)osc('sine',1046.5*Math.pow(2,(k%12)/12),F+.8+k*.04,.1,.03,.002);
    [5.2,6.0].forEach(d=>{const n=noise(F+d,1.0,'bandpass',300,1.2,.14,.9);if(n){n.fl.frequency.setValueAtTime(300,F+d);n.fl.frequency.exponentialRampToValueAtTime(2500,F+d+1.0);}});
    bell(F+7.0,.07);hit(F+7.6,.6,100);bell(F+7.6,.07,[1318.5,1760,2217.5]);}
  const buf=await ac.startRendering();return toWav(buf);};
