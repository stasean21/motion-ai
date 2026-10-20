// Звук интро: 120 BPM, Am. Плинки кусков по пентатонике, свуши ободков, разрез, импакт, удары слов, финальный аккорд.
window.makeAudio=async(D=DURATION)=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-16;bus.ratio.value=3;const master=ac.createGain();bus.connect(master).connect(ac.destination);
  master.gain.setValueAtTime(1,D-.7);master.gain.linearRampToValueAtTime(0,D-.02);
  const verb=ac.createConvolver();{const n=SR*2.4,b=ac.createBuffer(2,n,SR);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let s=11+ch;for(let i=0;i<n;i++){s=(s*16807)%2147483647;d[i]=(s/1073741823.5-1)*Math.pow(1-i/n,3);}}verb.buffer=b;}
  const wet=ac.createGain();wet.gain.value=.25;verb.connect(wet).connect(bus);
  const music=ac.createGain();music.gain.value=.4;music.connect(bus);music.connect(verb);const fx=ac.createGain();fx.gain.value=1;fx.connect(bus);const fxv=ac.createGain();fxv.gain.value=.55;fx.connect(fxv).connect(verb);
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,dest=music,a=.005,lp=0){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);
    if(lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl).connect(g);}else o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.05);}
  function noise(t,d,type,f,q,v,dest=fx,a=.005){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(t,(t*1.37)%2);s.stop(t+d+.05);return{fl};}
  function sweep(f0,f1,t,d,v,dest=fx,type='sine'){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,.004,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
  const whoosh=(t,d,v,f0,f1)=>{const n=noise(t,d,'bandpass',f0,.9,v,fx,d*.6);n.fl.frequency.setValueAtTime(f0,t);n.fl.frequency.exponentialRampToValueAtTime(f1,t+d*.7);};
  const hit=(t,v=.5,f=110)=>{sweep(f,42,t,.4,v);noise(t,.09,'lowpass',1200,.8,v*.6);};
  const bell=(t,v=.08,fs=[1318.5,1568,1975.5])=>fs.forEach((f,k)=>osc('sine',f,t,1.8,v/(k+1),fx,.002));
  // подложка: пэд Am → F → C → Am(add9), с 3,0 — бочка на долю
  const CH=[[220,261.6,329.6],[174.6,220,261.6],[196,261.6,329.6],[220,261.6,329.6,493.9]];
  CH.forEach((ch,b)=>ch.forEach(f=>{osc('sawtooth',f,b*2,b===3?2.4:2.1,.016,music,b?0.3:1.2,b===3?1400:900);osc('sawtooth',f*1.006,b*2,b===3?2.4:2.1,.012,music,b?0.3:1.2,900);}));
  osc('sine',55,0,3.2,.18,music,1.0);
  for(let tb=3;tb<6;tb+=.5){sweep(140,44,tb,.26,.55,music);osc('sawtooth',[43.65,43.65,65.41,65.41,55,55][Math.round((tb-3)*2)]*2,tb,.2,.08,music,.004,380);if(tb>=4)noise(tb+.25,.04,'highpass',8000,.7,.06,music,.002);}
  osc('sine',55,6,2,.25,music,.03);
  // старт: воздушный подъём
  {const n=noise(0,.7,'bandpass',400,1.2,.12,fx,.5);n.fl.frequency.setValueAtTime(400,0);n.fl.frequency.exponentialRampToValueAtTime(2500,.7);}
  // куски «карта за картой»: пентатоника вверх, крупные — с глухим ударом
  const PENT=[440,493.9,587.3,659.3,784,880,987.8,1174.7,1318.5,1568,1760,1975.5];
  P.forEach((p,i)=>{const f=PENT[Math.min(PENT.length-1,Math.floor(i*PENT.length/P.length))];osc('triangle',f,p.t,.25,.09,fx,.002);osc('sine',f*2,p.t,.12,.03,fx,.001);
    if(p.big){sweep(120,45,p.t,.3,.45);noise(p.t,.06,'lowpass',900,.8,.25);}});
  // ободки: свуши по дуге
  whoosh(.25,1.1,.16,400,2600);whoosh(1.15,.9,.16,500,3000);
  // разрез разделителя и всплеск Антарктиды
  {const n=noise(2.0,.35,'highpass',9000,.7,.3,fx,.01);n.fl.frequency.setValueAtTime(9000,2.0);n.fl.frequency.exponentialRampToValueAtTime(1500,2.35);osc('sine',2637,2.02,.5,.06,fx,.001);osc('sine',3520,2.35,.6,.05,fx,.001);}
  sweep(90,45,2.3,.35,.35);noise(2.3,.8,'highpass',5000,.6,.07,fx,.3);
  // импакт сборки
  hit(3.0,.85,100);noise(3.0,1.2,'lowpass',500,.7,.3,fx,.01);sweep(70,30,3.0,1.0,.35);bell(3.0,.05);
  whoosh(3.15,.9,.18,300,1800);
  // слова
  hit(4.0,.7,120);whoosh(4.5,.6,.1,2500,6000);noise(4.5,.7,'highpass',6000,.6,.06,fx,.3);
  hit(5.0,.8,95);sweep(70,32,5.0,1.0,.35);
  {const n=noise(5.5,.6,'bandpass',1500,2,.1,fx,.3);n.fl.frequency.setValueAtTime(1500,5.5);n.fl.frequency.exponentialRampToValueAtTime(7000,6.1);}
  // финальный аккорд
  bell(6.0,.1,[1318.5,1760,2217.5,2637]);[220,277.2,329.6,440,554.4].forEach(f=>osc('sawtooth',f,6.0,2.0,.014,music,.05,1300));
  const buf=await ac.startRendering();const L=buf.getChannelData(0),Rr=buf.getChannelData(1),n=L.length;
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(Rr[i]));const g=.89/pk;
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,Rr[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
