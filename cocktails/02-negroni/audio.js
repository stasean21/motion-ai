// Звук целиком синтезируется: лёгкая музыка 120 BPM + наливание, большой кубик льда, ложка, цедра.
window.makeAudio=async(D=34.5)=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-14;bus.ratio.value=3;bus.connect(ac.destination);
  const music=ac.createGain();music.gain.value=.55;music.connect(bus);const fx=ac.createGain();fx.gain.value=1;fx.connect(bus);
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const bar=n=>n<=1?0:n===2?4:(n-1)*2+4; // такты сцены
  const mbar=n=>(n-1)*2; // такты музыки, 17 по 2 с
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,dest=music,a=.005){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);return o;}
  function noise(t,d,type,f,q,v,dest=fx,a=.005){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(t,Math.random()*2);s.stop(t+d+.05);return{fl,g};}
  // музыка
  const chords=[[261.6,329.6,392,493.9],[220,277.2,329.6,415.3],[174.6,220,261.6,329.6],[196,246.9,293.7,392]];
  const roots=[65.4,55,43.65,49];
  for(let b=1;b<=17;b++){const t=mbar(b),ch=chords[(b-1)%4];
    ch.forEach(f=>{osc('sine',f,t,1.9,.05,music,.03);osc('triangle',f*2,t,.6,.012,music);});
    [0,1].forEach(h=>osc('sine',roots[(b-1)%4],t+h,.9,.22,music,.01));
    for(let k=0;k<4;k++){const tb=t+k*.5;
      if(b>=5&&b<17){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(110,tb);o.frequency.exponentialRampToValueAtTime(45,tb+.12);env(g,tb,.003,.45,.25);o.connect(g).connect(music);o.start(tb);o.stop(tb+.3);}
      noise(tb+.25,.05,'highpass',7500,.7,.08,music);}
    // нота мелодии на сильную долю
    if(b>=11&&b<=16) osc('sine',[784,659.3,587.3,659.3,784,880][b-11],t,1.2,.05,music,.01);}
  // лёд: один тяжёлый кубик — глухой удар о дно и два отскока
  {const t=bar(3)+.2+.34;osc('sine',95,t,.35,.6,fx,.002);noise(t,.12,'lowpass',900,.8,.7);
   [[0,1],[.12,.45],[.2,.25]].forEach(([d,v])=>[2100,3300,4700].forEach((f,k)=>osc('sine',f,t+d,.4-k*.1,.13*v/(k+1),fx,.001)));}
  // наливание: шум с бульканьем
  [[bar(4)+.25,1.4,1100,.45],[bar(5)+.25,1.4,800,.55],[bar(6)+.25,1.4,650,.55]].forEach(([t,d,f,v])=>{
    const n=noise(t,d+.2,'bandpass',f,1.4,v,fx,.06);const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=9;lg.gain.value=f*.35;l.connect(lg).connect(n.fl.frequency);l.start(t);l.stop(t+d+.3);});
  // ложка
  for(let k=0;k<6;k++){const t=bar(7)+.4+k*.24;osc('sine',3100+k*40,t,.12,.12,fx,.001);osc('sine',4900,t,.08,.05,fx,.001);}
  // цедра: «пшик» масел и мягкая посадка на край
  noise(bar(8)+.62,.35,'highpass',6000,.6,.3,fx,.01);noise(bar(8)+1.25,.14,'lowpass',600,.8,.4);
  // звон на финал
  [bar(9),bar(13),bar(15)].forEach(t=>[1568,2349,3136].forEach((f,k)=>osc('sine',f,t,1.4,.06/(k+1),fx,.002)));
  const buf=await ac.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));const g=.89/pk;
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
