// Музыка по референсу пользователя (zvuk.mov): 110 BPM, ля минор, круг F–G–Am–G (смена каждые 2 доли),
// суб-бас 808 по тоникам, бочка, клэп на 2 и 4, хэты шестнадцатыми с роллами, мягкий пэд и арпеджио-плак с эхом.
// Энергия ровная; во вступлении фильтр открывается, в конце — аутро без низа.
window.makeMusic=async(D=14,{intro=1.2,outro=0,lvl=()=>1,drumsOff=()=>false,hits=[],T0=0,L=null,PRE=0}={})=>{
  // окно рендера [T0-PRE, T0+L] из общего таймлайна длиной D: куски одинаковы на стыках и склеиваются без швов
  const OFF=Math.max(0,T0-PRE),END=L==null?D:Math.min(D,T0+L),T=t=>t-OFF,inW=t=>t>=OFF-4&&t<=END;
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*(END-OFF)),SR),B=60/110;
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-14;bus.ratio.value=3;bus.attack.value=.005;bus.release.value=.12;
  const master=ac.createGain();bus.connect(master).connect(ac.destination);if(D-1.2<END&&D-1.2>OFF){master.gain.setValueAtTime(1,T(D-1.2));master.gain.linearRampToValueAtTime(0,T(D-.02));}
  const verb=ac.createConvolver();{const n=SR*1.8,b=ac.createBuffer(2,n,SR);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let s=5+ch;for(let i=0;i<n;i++){s=(s*16807)%2147483647;d[i]=(s/1073741823.5-1)*Math.pow(1-i/n,2.5);}}verb.buffer=b;}
  const wet=ac.createGain();wet.gain.value=.18;verb.connect(wet).connect(bus);
  // эхо на 3/16 для плака
  const dl=ac.createDelay(1);dl.delayTime.value=B*.75;const fb=ac.createGain();fb.gain.value=.32;const dlo=ac.createGain();dlo.gain.value=.35;dl.connect(fb).connect(dl);dl.connect(dlo).connect(bus);
  // общий фильтр вступления: открывается за intro секунд
  const tone=ac.createBiquadFilter();tone.type='lowpass';if(OFF<intro){tone.frequency.setValueAtTime(600,0);tone.frequency.exponentialRampToValueAtTime(18000,Math.max(.05,T(intro)));}else tone.frequency.setValueAtTime(18000,0);tone.connect(bus);tone.connect(verb);
  const nb=ac.createBuffer(1,SR*2,SR);{const d=nb.getChannelData(0);let s=3;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{t=T(t);if(t<0){d+=t;a=Math.max(.001,a+t);t=0;if(d<=a)return;}g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  const sat=ac.createWaveShaper();{const k=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;k[i]=Math.tanh(2.2*x);}sat.curve=k;}const satG=ac.createGain();satG.gain.value=.55;sat.connect(satG).connect(tone);
  function osc(type,f,t,d,v,dest=tone,a=.004,lp=0){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);
    if(lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl).connect(g);}else o.connect(g);g.connect(dest);o.start(Math.max(0,T(t)));o.stop(Math.max(.01,T(t+d+.05)));return o;}
  function noise(t,d,type,f,q,v,dest=tone,a=.002){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(Math.max(0,T(t)),(t*.731)%1.5);s.stop(Math.max(.01,T(t+d+.05)));}
  const CH=[[174.6,220,261.6],[196,246.9,293.7],[220,261.6,329.6],[196,246.9,293.7]],ROOT=[43.65,49,55,49];
  const ARP=[[349.2,440,523.3,659.3],[392,493.9,587.3,784],[440,523.3,659.3,880],[392,493.9,587.3,784]];
  const drumsOn=t=>t>=intro*.6&&t<D-outro&&!drumsOff(t);
  for(let k=0;k*2*B<D;k++){const t=k*2*B,c=k%4,L=lvl(t);if(!inW(t))continue;
    // секции: тембр открывается с уровнем
    tone.frequency.setTargetAtTime(L<1?1400:L<2?9000:18000,Math.max(0,T(t)),.3);
    // пэд
    CH[c].forEach(f=>{osc('sawtooth',f,t,2*B+.05,.06,tone,.06,1600);osc('sawtooth',f*1.007,t,2*B+.05,.045,tone,.06,1600);osc('square',f/2,t,2*B+.05,.03,tone,.06,900);});
    // 808: тоника с коротким «скольжением» вниз, насыщение
    if(t<D-outro&&L>=.5&&!drumsOff(t)){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(ROOT[c]*1.5,Math.max(0,T(t)));o.frequency.exponentialRampToValueAtTime(ROOT[c],Math.max(.01,T(t+.06)));env(g,t,.005,.42,2*B*.95);o.connect(g).connect(sat);o.start(Math.max(0,T(t)));o.stop(Math.max(.01,T(t+2*B)));}
    // арпеджио-плак восьмыми (в эхо)
    if(L>=.5)for(let i=0;i<4;i++){const tt=t+i*B/2,f=ARP[c][[0,2,1,3][i]];const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();o.type='square';o.frequency.value=f;fl.type='lowpass';fl.frequency.setValueAtTime(3200,Math.max(0,T(tt)));fl.frequency.exponentialRampToValueAtTime(500,Math.max(.01,T(tt+.18)));
      env(g,tt,.003,.13,.26);o.connect(fl).connect(g);g.connect(tone);g.connect(dl);o.start(Math.max(0,T(tt)));o.stop(Math.max(.01,T(tt+.3)));osc('triangle',f*2,tt,.12,.04);if(L>=3)osc('triangle',f*4,tt+B/4,.1,.025);}
    // встречная мелодия (уровень ≥2): верхние ноты аккорда четвертями
    if(L>=2)[0,1].forEach(q=>osc('triangle',CH[c][2]*2*(q?1.122:1),t+q*B,B*.9,.05,tone,.01));
    // большой пэд (уровень ≥4)
    if(L>=4)CH[c].forEach(f=>osc('sawtooth',f*2,t,2*B+.05,.02,tone,.1,2400));
    // ударные: каждые 2 доли — половина такта
    if(drumsOn(t)){const kick=tt=>{const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(150,Math.max(0,T(tt)));o.frequency.exponentialRampToValueAtTime(42,Math.max(.01,T(tt+.11)));env(g,tt,.002,.95,.28);o.connect(g).connect(tone);o.start(Math.max(0,T(tt)));o.stop(Math.max(.01,T(tt+.3)));noise(tt,.012,'highpass',3000,.7,.12);};
      const half=k%2;
      if(!half){kick(t);kick(t+B*.75);}else{kick(t+B*.5);}
      // клэп на 2 и 4
      {const tt=t+B;noise(tt,.16,'bandpass',1700,.9,.42);noise(tt+.012,.12,'bandpass',2400,1.2,.25);osc('triangle',190,tt,.09,.18);if(L>=4)noise(tt+B*.75,.1,'bandpass',1900,.9,.18);}
      // хэты 16-ми, акцент на офф-битах, ролл в конце такта
      for(let i=0;i<8;i++){const tt=t+i*B/4;noise(tt,.035,'highpass',8500,.7,i%2?.028:.045);}
      if(half&&k%4===3)for(let i=0;i<6;i++)noise(t+B*1.5+i*B/12,.025,'highpass',9000,.7,.025+i*.006);}}
  // акценты: [время, тип] — 'res' разрешающий аккорд, 'rise' подъём к моменту
  for(const [t,k] of hits){if(!inW(t)&&!inW(t+3.4))continue;if(k==='res'){[220,277.2,329.6,440,554.4,659.3].forEach(f=>osc('sawtooth',f,t,3.4,.03,tone,.02,2600));osc('sine',55,t,3,.5,sat,.01);}
    if(k==='rise'&&T(t-4)>=0){const n=ac.createBufferSource();n.buffer=nb;n.loop=true;const fl=ac.createBiquadFilter();fl.type='bandpass';fl.Q.value=1.4;fl.frequency.setValueAtTime(300,T(t-4));fl.frequency.exponentialRampToValueAtTime(6000,T(t));
      const g=ac.createGain();g.gain.setValueAtTime(0,T(t-4));g.gain.linearRampToValueAtTime(.18,T(t-.05));g.gain.linearRampToValueAtTime(0,T(t));n.connect(fl).connect(g).connect(tone);n.start(T(t-4));n.stop(T(t+.05));}}
  const buf=await ac.startRendering();return buf;};
// AudioBuffer → WAV base64 (нормализация по пику)
window.toWav=(buf,fixed=0)=>{const L=buf.getChannelData(0),R=buf.getChannelData(1),n=L.length;let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));const g=fixed||.89/(pk||1);
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,44100,true);dv.setUint32(28,44100*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
