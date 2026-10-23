// ───── v3: real photos, one reveal mechanic per keyword (each frame = the peak of its mechanic)
const PW=644,PHh=790;
const box=(inner)=>`<div class="abs" style="left:28px;top:84px;width:${PW}px;height:${PHh}px;border-radius:28px;overflow:hidden">${inner}</div>`;
const card=(tag,inner,prompt,y=620,extra='')=>`<div class="card" style="left:190px;top:${y}px;width:700px;height:1010px"><div class="abs" style="left:28px;top:24px"><span class="tag">${tag}</span></div>${box(inner)}
  <div class="abs" style="left:28px;top:894px;width:644px;height:86px;border-radius:24px;background:#f2f4fa;display:flex;align-items:center;padding:0 100px 0 26px;font-weight:600;font-size:28px;color:#4a4d5c;white-space:nowrap;overflow:hidden">${prompt}</div>
  <div class="sq" style="position:absolute;right:38px;top:904px;width:66px;height:66px;border-radius:50%;background:#2f7bf5">${icon('send',34,'#fff',3)}</div>${extra}</div>`;
const P_=(k)=>'Product photo,&nbsp;'+kwChip(k);
F['01']=()=>progress(0)+karaoke('Want better AI photos? Try these ten keywords in your next ChatGPT image prompt.',9,[5,6])+
  card('prompt',img('boring2'),'Make it <s style="text-decoration-color:#e5484d;text-decoration-thickness:4px;color:#b2b6c4">look better.</s>')+
  `<div class="kw mb" style="left:700px;top:600px;font-size:64px;transform:rotate(-8deg)">/softlight</div><div class="kw" style="left:60px;top:1040px;font-size:64px;transform:rotate(6deg)">/macro</div><div class="kw" style="left:690px;top:1380px;font-size:64px;transform:rotate(-4deg)">/editorial</div>`+cursor(800,1520);
F['02']=()=>progress(1)+karaoke('Product shot: give your subject a clean, commercial presentation.',5,[0,1])+bigKw('productshot',140,420,110)+
  card('/productshot',img('messy')+`<div class="abs" style="left:0;top:0;width:${PW*.58}px;height:${PHh}px;overflow:hidden"><img src="assets/ph/01b.jpg" style="position:absolute;left:0;top:0;width:${PW}px;height:${PHh}px;object-fit:cover"></div>
   <div class="abs" style="left:${PW*.58-3}px;top:0;width:6px;height:${PHh}px;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.3)"></div><div class="pill" style="left:${PW*.58-34}px;top:${PHh/2-34}px;width:68px;height:68px;font-weight:900;font-size:26px">‹›</div>`,P_('productshot'))+cursor(560,1090);
// softlight: a huge diffuser panel sweeps across — behind it the image is already soft
F['03']=()=>progress(2)+karaoke('Soft light: ask for gentle shadows and smooth transitions.',6,[0,1])+
  card('/softlight',img('soft0')+`<div class="abs" style="left:0;top:0;width:${PW*.5}px;height:${PHh}px;overflow:hidden"><img src="assets/ph/02b.jpg" style="position:absolute;left:0;top:0;width:${PW}px;height:${PHh}px;object-fit:cover"></div>
   <div class="abs" style="left:${PW*.5-110}px;top:-40px;width:220px;height:${PHh+80}px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.92) 45%,rgba(255,255,255,.92) 55%,rgba(255,255,255,0));filter:blur(6px)"></div>`,P_('softlight'))+
  `<div class="card sq" style="left:820px;top:560px;width:170px;height:170px;border-radius:44px;flex-direction:column;gap:4px">${icon('bulb',64,'#2f7bf5')}<span style="font-weight:800;font-size:20px;color:#2f7bf5">DIFFUSED</span></div>`;
// hardlight: the keyword lands, a flash snaps the hard shadow in
F['04']=()=>progress(3)+karaoke('Hard light: create crisp shadows and a bolder look.',4,[0,1])+
  card('/hardlight',img('hard')+`<div class="abs" style="inset:0;background:radial-gradient(circle at 20% 15%,rgba(255,255,255,.95),rgba(255,255,255,.35) 40%,rgba(255,255,255,0) 70%)"></div>`,'Product photo,&nbsp;'+kwChip('hardlight'))+
  `<div class="kw" style="left:250px;top:400px;font-size:96px;opacity:.16;filter:blur(8px)">/hardlight</div>`+trail(520,470,500,1560)+
  `<div class="card sq" style="left:820px;top:560px;width:170px;height:170px;border-radius:44px;flex-direction:column;gap:4px">${icon('bulb',50,'#14151b')}<span style="font-weight:800;font-size:20px">SPOT</span></div>`;
// rimlight: lights out, a spark runs along the headband and leaves the glowing edge behind it
F['05']=()=>progress(4)+karaoke('Rim light: separate your subject with an illuminated edge.',7,[0,1])+
  card('/rimlight',img('rim0','filter:brightness(.55)')+`<div class="abs" style="inset:0;clip-path:polygon(0 0,62% 0,62% 100%,0 100%)">${img('rim')}</div>
   <svg class="abs" style="left:0;top:0" width="${PW}" height="${PHh}"><circle cx="${PW*.62}" cy="${PHh*.2}" r="14" fill="#fff" style="filter:drop-shadow(0 0 14px #fff) drop-shadow(0 0 30px #fff)"/></svg>`,P_('rimlight'));
// goldenhour: the cursor drags the sun down an arc; warmth follows it diagonally
F['06']=()=>progress(5)+karaoke('Golden hour: bring in warm, low evening light.',5,[0,1])+
  card('/goldenhour',img('golden0')+`<div class="abs" style="inset:0;clip-path:polygon(0 0,78% 0,30% 100%,0 100%)">${img('golden')}</div>`,P_('goldenhour'))+
  `<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920"><path d="M110 1240 Q 540 280 970 1240" stroke="#ff9a3c" stroke-width="5" fill="none" stroke-dasharray="3 14"/></svg>
   <div class="card sq" style="left:785px;top:610px;width:130px;height:130px;border-radius:50%">${icon('sun',70,'#ff8a1a')}</div>`+cursor(860,690);
// macro: a lens dives into the watch
F['07']=()=>progress(6)+karaoke('Macro: move closer to reveal texture and tiny details.',6,[0])+
  card('/macro',img('macro0'),P_('macro'))+
  `<div class="abs" style="left:310px;top:740px;width:500px;height:500px;border-radius:50%;overflow:hidden;border:10px solid #fff;box-shadow:0 30px 60px -20px rgba(40,50,110,.45)">${img('macro')}</div>
   <div class="abs" style="left:705px;top:1180px;width:44px;height:170px;border-radius:22px;background:#fff;transform:rotate(-40deg);box-shadow:0 10px 20px rgba(0,0,0,.2)"></div>`;
// lowangle: the camera tile drops down the rail, the card dips and flips to the low view
F['08']=()=>progress(7)+karaoke('Low angle: make the subject feel more imposing.',5,[0,1])+
  card('/lowangle',`<div class="abs" style="left:0;top:${-PHh*.78}px;width:${PW}px;height:${PHh}px">${img('low0')}</div><div class="abs" style="left:0;top:${PHh*.22}px;width:${PW}px;height:${PHh}px">${img('low')}</div>
   <div class="abs" style="left:0;top:${PHh*.22-3}px;width:${PW}px;height:6px;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.3)"></div>`,P_('lowangle'))+
  `<div class="abs" style="left:950px;top:640px;width:6px;height:800px;border-radius:3px;background:repeating-linear-gradient(180deg,#9fb6e8 0 10px,transparent 10px 24px)"></div>
   <div class="card sq" style="left:893px;top:860px;width:120px;height:120px;border-radius:34px">${icon('cam',56,'#2f7bf5')}</div><div class="abs" style="left:938px;top:990px;font-weight:900;font-size:40px;color:#2f7bf5">↓</div>`;
// minimal: the cluttered photo shatters into tiles that fly off — the clean shot is underneath
F['09']=()=>{const tiles=[[0,0,-260,-180,-14],[1,0,300,-200,12],[0,1,-320,160,10],[1,1,280,240,-12]];
  return progress(8)+karaoke('Minimal: remove distractions and give the subject room.',4,[0])+
  card('/minimal',img('minimal'),P_('minimal'))+
  tiles.map(([c,r,dx,dy,rot])=>`<div class="abs" style="left:${218+c*PW/2+dx}px;top:${704+r*PHh/2+dy}px;width:${PW/2}px;height:${PHh/2}px;overflow:hidden;border-radius:18px;transform:rotate(${rot}deg) scale(.86);opacity:.9;filter:blur(3px);box-shadow:0 20px 40px rgba(0,0,0,.2)"><img src="assets/ph/08a.jpg" style="position:absolute;left:${-c*PW/2}px;top:${-r*PHh/2}px;width:${PW}px;height:${PHh}px;object-fit:cover"></div>`).join('')};
// editorial: the catalogue shot slides back like a page, the magazine shot lands on top
F['10']=()=>progress(9)+karaoke('Editorial: try a styled, magazine-inspired composition.',5,[0])+
  `<div class="card" style="left:80px;top:540px;width:560px;height:700px;opacity:.65;filter:blur(2px)">${photo('editorial0',20,20,520,660)}</div>`+
  card('/editorial',img('editorial'),P_('editorial'),660);
// motionblur: streaks wipe across — behind them the background is moving, the bike stays sharp
F['11']=()=>progress(10)+karaoke('Motion blur: suggest speed. Specify what should stay sharp.',8,[0,1])+
  card('/motionblur',img('blur0')+`<div class="abs" style="inset:0;clip-path:polygon(0 0,60% 0,60% 100%,0 100%)">${img('blur')}</div>
   ${[...Array(9)].map((_,i)=>`<div class="abs" style="left:${PW*.6-260+(i%3)*30}px;top:${60+i*82}px;width:${240-(i%3)*40}px;height:8px;border-radius:4px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.85))"></div>`).join('')}`,kwChip('motionblur')+'.&nbsp;<b style="color:#14151b">Keep the bike sharp.</b>');
F['12']=()=>{const K=[['productshot','product'],['softlight','soft'],['hardlight','hard'],['rimlight','rim'],['goldenhour','golden'],['macro','macro'],['lowangle','low'],['minimal','minimal'],['editorial','editorial'],['motionblur','blur']];
  return progress(10)+karaoke('Add these to a clear description of your scene. Save this before your next generation.',13,[])+
  `<div class="pill" style="left:250px;top:470px;height:72px;padding:0 30px;font-weight:700;font-size:28px;gap:12px;letter-spacing:.06em">${icon('bookmark',30,'#2f7bf5')}SAVE FOR YOUR NEXT PROMPT</div>`+
  K.map(([k,kind],i)=>{const c=i%2,r=Math.floor(i/2);const x=90+c*460,y=580+r*250;return `<div class="card" style="left:${x}px;top:${y}px;width:440px;height:232px;border-radius:30px">
     ${photo(kind,10,10,170,212)}<div class="abs" style="left:198px;top:62px"><div style="font-weight:700;font-size:22px;color:#9aa0b4">${String(i+1).padStart(2,'0')}</div><div style="font-weight:700;font-size:34px;color:#2f7bf5;letter-spacing:-.02em">/${k}</div></div></div>`}).join('')};
