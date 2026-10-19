// Звук: тёмный электронный пульс 120 BPM, Am–F–C–G, + SFX под каждое действие слов и интерфейса.
window.makeAudio=async(D=DURATION)=>{
  const SR=44100,ac=new OfflineAudioContext(2,Math.ceil(SR*D),SR);
  const bus=ac.createDynamicsCompressor();bus.threshold.value=-16;bus.ratio.value=3;const master=ac.createGain();bus.connect(master).connect(ac.destination);
  master.gain.setValueAtTime(1,D-.8);master.gain.linearRampToValueAtTime(0,D);
  // пространство: свёртка с затухающим шумом
  const verb=ac.createConvolver();{const n=SR*2.2,b=ac.createBuffer(2,n,SR);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let s=7+ch;for(let i=0;i<n;i++){s=(s*16807)%2147483647;d[i]=(s/1073741823.5-1)*Math.pow(1-i/n,3);}}verb.buffer=b;}
  const wet=ac.createGain();wet.gain.value=.22;verb.connect(wet).connect(bus);
  const music=ac.createGain();music.gain.value=.34;music.connect(bus);music.connect(verb);const fx=ac.createGain();fx.gain.value=1;fx.connect(bus);const fxv=ac.createGain();fxv.gain.value=.5;fx.connect(fxv).connect(verb); // музыка тише — место под будущий голос
  const nb=ac.createBuffer(1,SR*3,SR);{const d=nb.getChannelData(0);let s=1;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823.5-1;}}
  const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);};
  function osc(type,f,t,d,v,dest=music,a=.005,lp=0){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=f;env(g,t,a,v,d);
    if(lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl).connect(g);}else o.connect(g);g.connect(dest);o.start(t);o.stop(t+d+.05);return o;}
  function noise(t,d,type,f,q,v,dest=fx,a=.005){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const g=ac.createGain();env(g,t,a,v,d);s.connect(fl).connect(g).connect(dest);s.start(t,(t*1.37)%2);s.stop(t+d+.05);return{fl,g};}
  function sweep(f0,f1,t,d,v,dest=fx,type='sine'){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,t,.004,v,d);o.connect(g).connect(dest);o.start(t);o.stop(t+d+.05);}
  const whoosh=(t,d,v=.25,f0=600,f1=3000)=>{const n=noise(t,d,'bandpass',f0,.9,v,fx,d*.6);n.fl.frequency.setValueAtTime(f0,t);n.fl.frequency.exponentialRampToValueAtTime(f1,t+d*.7);};
  const hit=(t,v=.5,f=110)=>{sweep(f,42,t,.4,v);noise(t,.09,'lowpass',1200,.8,v*.6);};
  // музыка: 7 тактов по 2 с
  const A=[[220,261.6,329.6],[174.6,220,261.6],[196,261.6,329.6],[196,246.9,293.7],[220,261.6,329.6],[174.6,220,261.6],[220,261.6,329.6,493.9]];
  const R=[55,43.65,65.41,49,55,43.65,55];
  // после вступления — цикл Am–F–C–G
  const CY=[A[0],A[1],A[2],A[3]],CR=[55,43.65,65.41,49];
  const groove=tb=>(tb>=3&&tb<12)||(tb>=14&&tb<D-1);
  for(let b=0;b<Math.ceil(D/2);b++){const t=b*2,ch=b<7?A[b]:CY[(b-7)%4],root=b<7?R[b]:CR[(b-7)%4];
    // пэд: два расстроенных пилообразных через низкие частоты
    ch.forEach(f=>{osc('sawtooth',f,t,b===6?2.2:2.1,.018,music,.4,900);osc('sawtooth',f*1.006,t,b===6?2.2:2.1,.014,music,.4,900);});
    const R_=root;
    // бас: до 3 с — гул, потом восьмые
    if(t<3){osc('sine',R_,t,2.1,.22,music,.3);}
    for(let k=0;k<4;k++){const tb=t+k*.5;
      if(groove(tb)){osc('sawtooth',R_*2,tb,.2,.09,music,.004,380);osc('sawtooth',R_*2,tb+.25,.18,.06,music,.004,380);
        // бочка на долю
        sweep(140,44,tb,.26,.6,music);}
      if((tb>=7&&tb<12)||(tb>=14&&tb<D-1)){noise(tb+.25,.04,'highpass',8000,.7,.07,music,.002);}
      if((tb>=4&&tb<12)||(tb>=14&&tb<D-1)){[0,1,2].forEach(j=>osc('triangle',ch[(k+j)%ch.length]*2,tb+j*.166,.22,.03,music,.003));}}}
  osc('sine',55,12,2.2,.25,music,.02);
  // S1: «ONE» — воздушный удар, «COUNTRY» — глубокий
  sweep(90,40,.25,.5,.35);noise(.25,.6,'bandpass',2500,.6,.12,fx,.15);
  hit(.75,.6,120);noise(.75,.25,'bandpass',900,.8,.25);
  // райзер к нырку и импакт
  {const n=noise(1.8,1.2,'bandpass',300,1.5,.28,fx,1.15);n.fl.frequency.setValueAtTime(300,1.8);n.fl.frequency.exponentialRampToValueAtTime(5000,3.0);sweep(150,700,2.0,1.0,.06,fx,'sawtooth');}
  whoosh(2.5,.6,.22,500,2400);
  hit(3.0,.8,100);noise(3.0,1.2,'lowpass',500,.7,.35,fx,.01);
  // заливка Индии и вспышка контура
  noise(3.05,.7,'bandpass',1800,.7,.14,fx,.3);[1568,2093].forEach((f,k)=>osc('sine',f,3.05,.9,.04/(k+1),fx,.01));
  // одометр: щелчки замедляются к фиксациям
  {let t=3.6,dt=.035;while(t<5.0){osc('square',2600+((t*97)%1)*900,t,.012,.035,fx,.001);t+=dt;dt*=1.035;}}
  [4.3,4.45,4.6,4.75].forEach((t,i)=>{osc('sine',1200+i*150,t,.08,.18,fx,.001);noise(t,.03,'highpass',5000,.7,.12);});
  hit(5.0,.6,120);[1318.5,2637].forEach((f,k)=>osc('sine',f,5.0,1.4,.08/(k+1),fx,.002));
  whoosh(5.0,.35,.18,800,3000);noise(5.25,.7,'highpass',6000,.6,.08,fx,.2);
  // число сжимается в метку
  whoosh(6.75,.5,.2,2500,600);osc('sine',880,7.2,.12,.12,fx,.002);
  // S3: вопрос
  whoosh(7.0,.35,.24,700,3500);
  hit(7.5,.85,90);sweep(70,32,7.5,1.0,.4);
  {for(let i=0;i<10;i++)osc('sine',3000+i*120,8.5+i*.03,.05,.04,fx,.001);}
  hit(9.0,.7,130);noise(9.0,.12,'bandpass',1500,1,.25);
  // уход слов и сборка интерфейса
  [10.45,10.52,10.58,10.64].forEach((t,i)=>whoosh(t,.4,.12,1200+i*200,400));
  whoosh(10.7,.6,.22,400,2600);osc('sine',660,11.3,.15,.15,fx,.002);
  whoosh(11.0,.45,.2,300,1500);sweep(80,45,11.25,.3,.35);
  [11.25,11.5,11.75].forEach((t,i)=>{osc('sine',[880,1108.7,1318.5][i],t,.18,.13,fx,.002);noise(t,.02,'highpass',4000,.7,.12);});
  osc('sine',520,11.5,.08,.15,fx,.001);noise(11.5,.05,'bandpass',2000,2,.15);
  [1760,2637,3520].forEach((f,k)=>osc('sine',f,12.0,1.2,.07/(k+1),fx,.002));
  hit(12.25,.6,110);whoosh(12.4,.3,.12,900,2500);
  {const n=noise(12.9,.9,'bandpass',2000,2,.08,fx,.4);n.fl.frequency.setValueAtTime(1500,12.9);n.fl.frequency.exponentialRampToValueAtTime(7000,13.8);}
  // шаги стран: те же эффекты, что во вступлении
  if(typeof STEPS!=='undefined')for(const st of STEPS){const t0=st.t0;
    if(st.i)whoosh(t0,.4,.12,1200,400);                                   // уход прошлой карточки
    whoosh(t0+.1,.9,.2,400,2000);sweep(90,45,t0+K.arrive,.3,.3);          // перелёт и посадка
    [1568,2093].forEach((f,k)=>osc('sine',f,t0+K.hl,.9,.04/(k+1),fx,.01)); // вспышка контура
    osc('sine',3000,t0+K.idx,.05,.05,fx,.001);hit(t0+K.name,.5,120);       // «#01» и название
    {let t=t0+K.num,dt=.035;while(t<t0+K.unit){osc('square',2600+((t*97)%1)*900,t,.012,.035,fx,.001);t+=dt;dt*=1.035;}}
    [1318.5,2637].forEach((f,k)=>osc('sine',f,t0+K.unit,1.0,.06/(k+1),fx,.002));noise(t0+K.unit+.2,.6,'highpass',6000,.6,.07,fx,.2);
    whoosh(t0+K.card,.5,.18,2500,600);osc('sine',520,t0+K.card+.6,.08,.15,fx,.001);noise(t0+K.card+.6,.05,'bandpass',2000,2,.15); // текст → карточка
    noise(t0+K.fill,.6,'bandpass',1800,.7,.12,fx,.25);                    // заливка
    whoosh(t0+K.chip,.6,.18,500,2800);                                     // чип летит
    const lf=[880,987.8,1108.7,1174.7,1318.5][st.i%5];osc('sine',lf,t0+K.land,.25,.15,fx,.002);noise(t0+K.land,.03,'highpass',4000,.7,.14);sweep(80,45,t0+K.land,.25,.3);}
  const buf=await ac.startRendering();const L=buf.getChannelData(0),Rr=buf.getChannelData(1),n=L.length;
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(Rr[i]));const g=.89/pk;
  const ab=new ArrayBuffer(44+n*4),dv=new DataView(ab),ws=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');dv.setUint32(4,36+n*4,true);ws(8,'WAVE');ws(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,SR,true);dv.setUint32(28,SR*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);ws(36,'data');dv.setUint32(40,n*4,true);
  for(let i=0;i<n;i++){dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]*g))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,Rr[i]*g))*32767,true);}
  let s='';const u=new Uint8Array(ab);for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
