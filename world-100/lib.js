// Общая библиотека стиля: плоский вектор без обводок, тени наложенными формами, НИ ОДНОГО острого угла.
const hash=n=>{const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s);};
const PAL={sky:'#A9E4F7',cyan:'#55CCEE',cyan2:'#2FA8D6',blue:'#2563C9',blue2:'#1B3F8F',navy:'#16245E',mint:'#7DE8C8',teal:'#15A7A0',teal2:'#0D7C86',
  white:'#F4FAFF',lav:'#E7E3FF',vio:'#6A3FD8',mag:'#E5176E',pink:'#FF8FB0',red:'#FF4D5A',org:'#FF8A1F',yel:'#FFD23F',mustard:'#F2B53A',mustard2:'#D9902A',
  skin:'#F0A27A',skin2:'#D9805A',hair:'#3B2A6B',pants:'#2B4C9B',shoe:'#1E2A5A',
  wood:'#C9783E',wood2:'#A65E2C',wood3:'#E39A5A',plaster:'#F6D9A8',plaster2:'#E9C08A',brass:'#F2C14E',ice:'#CFF4FF',ice2:'#9BE3FA',ink:'#2B1550'};
// скругление каждой вершины многоугольника
function roundPoly(pts,r){const n=pts.length;let d='';for(let i=0;i<n;i++){const P=pts[i],A=pts[(i+n-1)%n],B=pts[(i+1)%n];const rr=Array.isArray(r)?r[i]:r;
  const la=Math.hypot(A[0]-P[0],A[1]-P[1]),lb=Math.hypot(B[0]-P[0],B[1]-P[1]);const k1=Math.min(rr,la/2)/la,k2=Math.min(rr,lb/2)/lb;
  const p1=[P[0]+(A[0]-P[0])*k1,P[1]+(A[1]-P[1])*k1],p2=[P[0]+(B[0]-P[0])*k2,P[1]+(B[1]-P[1])*k2];d+=(i?`L${p1}`:`M${p1}`)+`Q${P} ${p2}`;}return d+'Z';}
const rp=(pts,r,fill,extra='')=>`<path d="${roundPoly(pts,r)}" fill="${fill}" ${extra}/>`;
const rect=(x,y,w,h,r,fill,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const circ=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const ell=(x,y,rx,ry,fill,rot=0,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${fill}" ${extra}/>`;
const stroke=(d,col,w,extra='')=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
function star(cx,cy,r){const pts=[],rad=[];for(let i=0;i<4;i++){const a=i*Math.PI/2-Math.PI/2,m=a+Math.PI/4;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);rad.push(r*.16);pts.push([cx+Math.cos(m)*r*.24,cy+Math.sin(m)*r*.24]);rad.push(r*.5);}return `<path d="${roundPoly(pts,rad)}" fill="#fff"/>`;}
const g=(tr,inner)=>`<g transform="${tr}">${inner}</g>`;
// ---------- герой ----------
// поза: руки задаются точками [плечо → локоть → кисть] в локальных координатах (ноги в 0,0, рост ~560)
function hero({x,y,s=1,dir=1,arms,eyes='look',mouth='smile',head=0,sweat=false,shirt=PAL.mustard,shirt2=PAL.mustard2,pants=PAL.pants,pants2='#24418A',hair=PAL.hair,cap=null,stache=false}){
  const A=arms||{l:[[-70,-440],[-95,-340],[-80,-250]],r:[[70,-440],[100,-340],[90,-250]]};
  const arm=(pts,front)=>stroke(`M${pts[0]} Q${pts[1]} ${pts[2]}`,front?shirt:shirt2,52)+circ(pts[2][0],pts[2][1],32,front?PAL.skin:PAL.skin2);
  const eye=eyes==='closed'?stroke('M-8,-572 Q12,-590 32,-572','#2B1550',9):eyes==='side'?circ(14,-575,15,'#fff')+circ(22,-574,8,PAL.ink):circ(14,-575,16,'#fff')+circ(18,-573,9,PAL.ink);
  const m=mouth==='o'?ell(36,-528,10,13,'#9C2F4A'):mouth==='flat'?stroke('M18,-530 L44,-532','#9C2F4A',7):stroke('M14,-534 Q32,-518 48,-536','#9C2F4A',7);
  return g(`translate(${x},${y}) scale(${s*dir},${s})`,
    arm(A.l,false)+
    rect(-62,-262,54,250,26,pants)+rect(8,-262,54,250,26,pants2)+rect(-74,-30,78,34,17,PAL.shoe)+rect(0,-30,84,34,17,PAL.shoe)+
    rp([[-96,-470],[96,-470],[86,-240],[-86,-240]],[46,46,30,30],shirt)+rp([[-96,-470],[-20,-470],[-30,-240],[-86,-240]],[46,10,10,30],shirt2)+
    rect(-70,-262,140,30,15,shirt2)+rect(-30,-500,60,50,22,PAL.skin2)+
    g(`rotate(${head} 0 -560)`,ell(0,-560,88,92,PAL.skin)+ell(-70,-556,20,26,PAL.skin2)+ell(40,-548,16,12,PAL.skin2)+
      circ(-50,-630,48,hair)+circ(0,-650,52,hair)+circ(48,-628,44,hair)+circ(-82,-592,34,hair)+circ(70,-604,30,hair)+(cap?rect(-96,-690,182,70,34,cap)+rect(30,-640,96,26,13,cap):'')+(stache?ell(30,-542,30,12,hair):'')+
      eye+m+ell(54,-544,14,9,'#F48C8C',0,'fill-opacity=".6"')+(sweat?ell(84,-600,9,14,PAL.ice2):''))+
    arm(A.r,true));}
// ---------- продукты ----------
const milk=(x,y,s=1,rot=0)=>g(`translate(${x},${y}) rotate(${rot}) scale(${s})`,rp([[-34,0],[34,0],[34,-120],[0,-150],[-34,-120]],[10,10,8,10,8],'#fff')+rp([[-34,-120],[0,-150],[34,-120]],[6,8,6],'#D8EEFF')+rect(-34,-90,68,46,10,PAL.cyan)+rect(-10,-168,20,22,8,PAL.blue));
const meat=(x,y,s=1)=>g(`translate(${x},${y}) scale(${s})`,ell(0,-22,78,30,'#E8DCC8')+ell(0,-30,60,22,'#F07A8A')+ell(-12,-34,22,9,'#FFB0BA')+ell(26,-28,12,6,'#FFF0E6'));
const butter=(x,y,s=1)=>g(`translate(${x},${y}) scale(${s})`,rect(-58,-50,116,50,14,PAL.yel)+rect(-58,-50,116,18,9,'#FFE68A')+rect(-20,-50,40,50,0,'#F4C230',`fill-opacity=".45"`));
const bag=(x,y,s=1)=>g(`translate(${x},${y}) scale(${s})`,rp([[-90,0],[90,0],[76,-210],[-76,-210]],[24,24,18,18],'#F5E2C0')+rp([[-90,0],[-20,0],[-26,-210],[-76,-210]],[24,8,8,18],'#E7CC9E')+stroke('M-40,-205 Q0,-270 40,-205','#E7CC9E',14));
// ---------- среда ----------
function clock(x,y,r,h=10,m=2,blur=false){return g(`translate(${x},${y})`,circ(0,0,r+12,PAL.wood2)+circ(0,0,r,'#FFF6E6')+
  Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return circ(Math.sin(a)*r*.8,-Math.cos(a)*r*.8,r*.06,PAL.wood2);}).join('')+
  (blur?`<path d="M0,0 L0,${-r*.75} A${r*.75},${r*.75} 0 0 1 ${r*.53},${-r*.53}Z" fill="${PAL.cyan}" fill-opacity=".35"/>`:'')+
  stroke(`M0,0 L${Math.sin(h/12*Math.PI*2)*r*.5},${-Math.cos(h/12*Math.PI*2)*r*.5}`,PAL.ink,r*.1)+stroke(`M0,0 L${Math.sin(m/12*Math.PI*2)*r*.75},${-Math.cos(m/12*Math.PI*2)*r*.75}`,PAL.ink,r*.07)+circ(0,0,r*.08,PAL.mag));}
function fly(x,y,s=1){return g(`translate(${x},${y}) scale(${s})`,ell(-10,-12,16,10,'#fff',-30,'fill-opacity=".8"')+ell(10,-12,16,10,'#fff',30,'fill-opacity=".8"')+ell(0,0,12,9,PAL.ink)+stroke('M-40,20 Q-20,40 -60,50 Q-90,60 -70,80','#2B1550',3,'stroke-dasharray="6 10" opacity=".5"'));}
const iceBlock=(x,y,w,h,rot=0)=>g(`translate(${x},${y}) rotate(${rot})`,rect(-w/2,-h/2,w,h,w*.14,PAL.ice)+rect(-w/2,h*.1,w,h*.4,w*.14,PAL.ice2,'fill-opacity=".6"')+rect(-w*.36,-h*.36,w*.24,h*.12,h*.06,'#fff')+rect(-w*.36,-h*.16,w*.1,h*.08,h*.04,'#fff'));
// подпись-стрелка движения камеры (служебная пометка раскадровки)
const camNote=(d,label,lx,ly,col='#FFFFFF')=>stroke(d,col,8,'stroke-dasharray="2 18" opacity=".9"')+`<text x="${lx}" y="${ly}" font-family="Round" font-size="34" fill="${col}" opacity=".95">${label}</text>`;
