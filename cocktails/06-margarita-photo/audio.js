// Звук: лёгкая боссa 120 BPM (8 тактов = 16 с) + тихие эффекты под блики, строки и цифры.
// В чистой версии (?text=0) только музыка и звон бликов, без затухания: дорожка повторяется вместе с видео.
window.makeAudio=async(D=DUR)=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-14;bus.ratio.value=3;const master=ac.createGain();bus.connect(master).connect(ac.destination);
  if(TEXT){master.gain.setValueAtTime(0,0);master.gain.linearRampToValueAtTime(1,.4);master.gain.setValueAtTime(1,15.2);master.gain.linearRampToValueAtTime(0,16);}
  const music=ac.createGain();music.gain.value=.55;music.connect(bus);const fx=ac.createGain();fx.gain.value=.9;fx.connect(bus);
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,dest=music,a=.005){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
  function noise(t,d,type,f,q,v,dest=fx,a=.005){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(t,(t*.37)%2);s.stop(t+d+.05);}
  function sweep(f0,f1,t,d,v,dest=fx){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,.004,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
  const chime=(t,v=.06)=>[1568,2349,3136].forEach((f,k)=>osc('sine',f,t,1.4,v/(k+1),fx,.002));
  // музыка: та же минорная гармония, что в 04 Margarita
  const chords=[[220,261.6,329.6,392],[146.8,220,261.6,349.2],[164.8,207.7,246.9,329.6],[220,277.2,329.6,392]],roots=[55,73.4,82.4,55];
  for(let b=1;b<=8;b++){const t=(b-1)*2,ch=chords[(b-1)%4];
    [0,.75,1.5].forEach((o,k)=>ch.forEach(f=>osc('triangle',f,t+o,.5-k*.08,.02,music,.01)));
    ch.forEach(f=>osc('sine',f*2,t,1.6,.011,music,.05));
    [[0,1],[.75,.6],[1,1],[1.75,.6]].forEach(([o,v])=>osc('sine',roots[(b-1)%4]*(o===1?1.5:1),t+o,.45,.2*v,music,.01));
    for(let k=0;k<4;k+=2){const tb=t+k*.5,o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(100,tb);o.frequency.exponentialRampToValueAtTime(45,tb+.12);env(g,tb,.003,.3,.22);o.connect(g).connect(music);o.start(tb);o.stop(tb+.3);}
    ((b%2)?[0,.75,1.5]:[.5,1.0]).forEach(o=>{osc('sine',1750,t+o,.06,.08,music,.001);noise(t+o,.03,'bandpass',2500,4,.1,music);});
    for(let k=0;k<8;k++)noise(t+k*.25,.05,'highpass',7000,.7,k%2?.03:.05,music,.008);
    if(b>=5)osc('sine',[659.3,587.3,523.3,587.3][b-5],t,1.2,.04,music,.01);}
  // блик по стеклу: звон
  GLINTS.forEach(t=>{chime(t+.45,.05);noise(t,.9,'bandpass',5200,1.2,.05,fx,.4);});
  // искры соли: редкие тихие «динь»
  for(let i=0;i<14;i++){const t=.6+i*1.1+(i*.37)%.4;osc('sine',3200+((i*733)%1400),t,.35,.018,fx,.002);}
  if(TEXT){
    noise(.3,1.4,'bandpass',1600,.6,.16,fx,.6);
    noise(1.2,.9,'bandpass',1800,.7,.2,fx,.35);
    [6.0,6.5,7.0].forEach(t=>{sweep(110,48,t,.26,.4);noise(t,.06,'lowpass',900,.8,.22);});
    [10.6,11.0,11.4].forEach(t=>sweep(110,48,t,.26,.45));
    [11.8,12.05,12.3].forEach(t=>noise(t,.35,'bandpass',2600,.9,.1,fx,.15));
    chime(13.7,.07);}
  const buf=await ac.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));const g=.89/pk;
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
