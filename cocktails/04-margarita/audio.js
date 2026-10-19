// Звук: лёгкая боссa 120 BPM (аккорды, бас, клаве 3-2, маракас) + SFX под действия слов.
window.makeAudio=async(D=34.5)=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-14;bus.ratio.value=3;bus.connect(ac.destination);
  const music=ac.createGain();music.gain.value=.55;music.connect(bus);const fx=ac.createGain();fx.gain.value=1;fx.connect(bus);
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,dest=music,a=.005){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);return o;}
  function noise(t,d,type,f,q,v,dest=fx,a=.005){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(t,Math.random()*2);s.stop(t+d+.05);return{fl,g};}
  function sweep(f0,f1,t,d,v,dest=fx){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,.004,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
  // музыка: 17 тактов по 2 с; минорная боссa-гармония
  const chords=[[220,261.6,329.6,392],[146.8,220,261.6,349.2],[164.8,207.7,246.9,329.6],[220,277.2,329.6,392]];
  const roots=[55,73.4,82.4,55];
  for(let b=1;b<=17;b++){const t=(b-1)*2,ch=chords[(b-1)%4];
    // аккорд «толчком» боссы: на 1 и на 2-и
    [0,.75,1.5].forEach((o,k)=>ch.forEach(f=>osc('triangle',f,t+o,.5-k*.08,.022,music,.01)));
    ch.forEach(f=>osc('sine',f*2,t,1.6,.012,music,.05));
    [[0,1],[.75,.6],[1,1],[1.75,.6]].forEach(([o,v])=>osc('sine',roots[(b-1)%4]*(o===1?1.5:1),t+o,.45,.22*v,music,.01));
    if(b>=3&&b<17){for(let k=0;k<4;k++){const tb=t+k*.5;if(k%2===0){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(100,tb);o.frequency.exponentialRampToValueAtTime(45,tb+.12);env(g,tb,.003,.35,.22);o.connect(g).connect(music);o.start(tb);o.stop(tb+.3);}}
      // клаве 3-2
      const cl=(b%2)?[0,.75,1.5]:[.5,1.0];cl.forEach(o=>{osc('sine',1750,t+o,.06,.09,music,.001);noise(t+o,.03,'bandpass',2500,4,.12,music);});
      // маракас 16-ми
      if(b>=4)for(let k=0;k<8;k++)noise(t+k*.25,.05,'highpass',7000,.7,k%2?.035:.06,music,.008);}
    if(b>=12&&b<=16)osc('sine',[659.3,587.3,523.3,587.3,659.3][b-12],t,1.2,.045,music,.01);}
  // хук: три удара слов
  [.5,1.0,1.5].forEach((t,i)=>{sweep(120,48,t,.3,.55);noise(t,.08,'lowpass',900,.8,.35);});
  // название: мягкий свуш
  noise(3.5,.6,'bandpass',1800,.7,.25,fx,.35);
  [7.5,8.0,8.5,9.0].forEach(t=>noise(t,.12,'bandpass',3000,1.2,.15,fx,.04));
  // соль: шорох крупинок
  noise(10.05,.1,'lowpass',800,.8,.3);sweep(110,50,10.05,.25,.4);
  for(let i=0;i<40;i++){const t=11.0+i/40*.9+Math.random()*.03;noise(t,.02,'highpass',6000+Math.random()*3000,1,.12);}
  // количества: удары; слова падают в стакан — «плюх»
  [12.0,14.0,16.0].forEach(t=>{sweep(110,48,t,.28,.5);noise(t,.07,'lowpass',900,.8,.3);});
  [13.15,15.15,17.15].forEach(t=>{noise(t,.4,'bandpass',1400,.8,.12,fx,.3);const h=t+.5;sweep(700,180,h,.18,.3);noise(h,.25,'bandpass',1100,1.2,.3,fx,.01);});
  // лёд и колпак шейкера
  for(let i=0;i<4;i++){const t=17.85+i*.09+.25;[2400,3700,5200].forEach((f,k)=>osc('sine',f*(1+i*.03),t,.3-k*.07,.1/(k+1),fx,.001));}
  osc('sine',420,18.48,.25,.25,fx,.002);noise(18.48,.1,'bandpass',2200,2,.4);
  // шейк: дребезг льда шестнадцатыми
  for(let t=18.55;t<19.85;t+=.0714){noise(t,.05,'bandpass',3200,1.5,.32,fx,.003);if(Math.random()<.5)osc('sine',2600+Math.random()*2000,t,.08,.05,fx,.001);}
  // колпак снят, пролив
  noise(19.95,.45,'bandpass',1500,.7,.25,fx,.25);
  {const t=20.62,d=1.1;const n=noise(t,d+.2,'bandpass',900,1.4,.5,fx,.06);const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=8;lg.gain.value=300;l.connect(lg).connect(n.fl.frequency);l.start(t);l.stop(t+d+.3);}
  // долька: свуш кольца и щелчок посадки
  noise(22.0,.9,'bandpass',2400,.8,.18,fx,.3);osc('sine',1300,22.97,.08,.18,fx,.001);noise(22.97,.06,'lowpass',700,.8,.4);
  // пропорция: удары цифр
  [24.5,25.0,25.5].forEach(t=>{sweep(110,48,t,.26,.45);});
  // звон
  [24,28,32].forEach(t=>[1568,2349,3136].forEach((f,k)=>osc('sine',f,t,1.4,.06/(k+1),fx,.002)));
  const buf=await ac.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));const g=.89/pk;
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
