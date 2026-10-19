// Звук: полночный лаунж 120 BPM (электропиано m9, шагающий бас, щётки, щелчки на 2 и 4) + SFX под действия слов.
window.makeAudio=async(D=34.5)=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-14;bus.ratio.value=3;const master=ac.createGain();bus.connect(master).connect(ac.destination);
  master.gain.setValueAtTime(1,33.2);master.gain.linearRampToValueAtTime(0,34.0);
  const music=ac.createGain();music.gain.value=.6;music.connect(bus);const fx=ac.createGain();fx.gain.value=1;fx.connect(bus);
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,dest=music,a=.005){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);return o;}
  function noise(t,d,type,f,q,v,dest=fx,a=.005){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(t,Math.random()*2);s.stop(t+d+.05);return{fl,g};}
  function sweep(f0,f1,t,d,v,dest=fx){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,.004,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
  // электропиано: синус + обертон с тремоло
  const trem=ac.createGain();trem.gain.value=.8;const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=5;lg.gain.value=.2;lfo.connect(lg).connect(trem.gain);lfo.start(0);trem.connect(music);
  function ep(f,t,d,v){osc('sine',f,t,d,v,trem,.01);osc('sine',f*2,t,d*.4,v*.25,trem,.005);osc('triangle',f*3.01,t,.15,v*.08,trem,.002);}
  const CH=[[130.8,155.6,196,233.1,293.7],[174.6,207.7,261.6,311.1,392],[103.8,207.7,261.6,311.1,392],[98,196,246.9,293.7,349.2]];// Cm9 Fm9 Abmaj7 G7
  const BASS=[[65.4,73.4,77.8,98],[87.3,98,103.8,110],[103.8,98,87.3,77.8],[98,92.5,87.3,82.4]];
  for(let b=1;b<=17;b++){const t=(b-1)*2,ch=CH[(b-1)%4];
    ch.forEach((f,k)=>ep(f,t+k*.012,1.8,.03));if(b>=5&&b<17)ch.slice(1).forEach(f=>ep(f*2,t+1.25,.5,.012));
    if(b>=2)BASS[(b-1)%4].forEach((f,k)=>{osc('sine',f,t+k*.5,.42,.26,music,.01);osc('triangle',f*2,t+k*.5,.12,.03,music,.003);});
    if(b>=3&&b<17){for(let k=0;k<4;k++){noise(t+k*.5,.32,'bandpass',4500,.6,k%2?.05:.035,music,.12);// щётки
        if(k%2)noise(t+k*.5,.05,'bandpass',2100,3,.22,music,.001);}// щелчки на 2 и 4
      if(b>=4)[0,1].forEach(k=>{const tb=t+k*1.0;const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(90,tb);o.frequency.exponentialRampToValueAtTime(42,tb+.15);env(g,tb,.004,.32,.26);o.connect(g).connect(music);o.start(tb);o.stop(tb+.3);});}
    if(b>=12&&b<=16)[784,698.5,622.3,587.3,622.3].slice(b-12,b-11).forEach(f=>{ep(f,t,1.3,.035);ep(f*.75,t+1,0.8,.02);});}
  const thud=(t,v=.55)=>{sweep(95,40,t,.32,v);noise(t,.09,'lowpass',600,.8,.4*v/.55);};
  const whoosh=(t,d=.45,v=.18)=>noise(t,d,'bandpass',1600,.7,v,fx,d*.7);
  // хук
  whoosh(.5);whoosh(1.0);thud(1.84,.7);thud(2.0,.2);
  // название, список
  whoosh(4.0,.6,.2);whoosh(4.3,.6,.16);[0,1,2,3].forEach(i=>{const t=7.75+i*.5+.22;noise(t,.04,'bandpass',2800,2,.25);osc('sine',900,t,.05,.08,fx,.001);});
  // ингредиенты: удары чисел, наливы
  [10.55,12.55,14.55].forEach(t=>{thud(t+.08,.5);whoosh(t+.25,.4,.14);});
  [[11.35,.9,1500,.42],[13.35,.9,700,.5],[15.35,.9,520,.5]].forEach(([t,d,f,v])=>{const n=noise(t,d+.2,'bandpass',f,1.3,v,fx,.06);const l=ac.createOscillator(),g=ac.createGain();l.frequency.value=8;g.gain.value=f*.3;l.connect(g).connect(n.fl.frequency);l.start(t);l.stop(t+d+.3);});
  // лёд, колпак, шейк
  for(let i=0;i<4;i++){const t=16.55+i*.1+.26;[2400,3600,5100].forEach((f,k)=>osc('sine',f*(1+i*.03),t,.28-k*.07,.09/(k+1),fx,.001));}
  {const t=17.2;[523,1187,1810,2650].forEach((f,k)=>osc('sine',f,t,.5-k*.08,.12/(k+1),fx,.001));noise(t,.08,'bandpass',2500,2,.35);}
  for(let t=17.25;t<18.7;t+=.0625){noise(t,.045,'bandpass',3000,1.4,.28,fx,.003);if(Math.random()<.45)osc('sine',2400+Math.random()*2200,t,.07,.045,fx,.001);}
  noise(18.55,.7,'bandpass',900,.6,.14,fx,.4);// бокал скользит по стойке
  {const t=18.8;[700,1500].forEach((f,k)=>osc('sine',f,t,.3,.06/(k+1),fx,.002));whoosh(t,.45,.2);}
  {const t=19.95,d=1.2;const n=noise(t,d+.2,'bandpass',800,1.3,.5,fx,.06);const l=ac.createOscillator(),g=ac.createGain();l.frequency.value=7;g.gain.value=260;l.connect(g).connect(n.fl.frequency);l.start(t);l.stop(t+d+.3);}
  // зёрна на пенке: три мягких касания на долю
  thud(22.0,.35);[22.0,22.5,23.0].forEach((t,i)=>{osc('sine',1500+i*120,t,.06,.12,fx,.001);noise(t,.05,'lowpass',1200,.8,.25);});
  // пропорция: столбики поднимаются
  [25.05,25.4,25.75].forEach((t,i)=>{sweep(60,140-i*15,t,.3,.35);noise(t,.2,'lowpass',500,.8,.2,fx,.05);});
  // звон
  [24.95,28.1,31.9].forEach(t=>[1568,2349,3136].forEach((f,k)=>osc('sine',f,t,1.4,.055/(k+1),fx,.002)));
  const buf=await ac.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));const g=.89/pk;
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
