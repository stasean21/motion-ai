// «Если бы население Земли было 100 человек» — 8 ключевых кадров первой минуты, 1920×1080.
const W=1920,H=1080;
// опорные данные (≈, ООН/МСЭ 2023–2024, сверить перед финалом)
const CONT=[{k:'asia',n:'АЗИЯ',c:59,col:'#FF6B6B',lon:92,lat:42},{k:'africa',n:'АФРИКА',c:18,col:'#FFB52E',lon:20,lat:4},{k:'europe',n:'ЕВРОПА',c:9,col:'#5B8CFF',lon:18,lat:54},
  {k:'latam',n:'ЛАТ. АМЕРИКА',c:8,col:'#2FCF9B',lon:-60,lat:-14},{k:'namerica',n:'СЕВ. АМЕРИКА',c:5,col:'#A35BFF',lon:-100,lat:46},{k:'oceania',n:'ОКЕАНИЯ',c:1,col:'#FF7AC8',lon:134,lat:-25}];
const SHAPES={
 namerica:[[-165,65],[-140,70],[-95,76],[-70,70],[-55,52],[-75,40],[-80,25],[-97,17],[-105,22],[-118,33],[-125,48],[-150,58]],
 latam:[[-80,10],[-60,8],[-35,-7],[-40,-22],[-58,-38],[-70,-53],[-75,-45],[-72,-18],[-80,-3]],
 europe:[[-10,36],[-9,44],[-5,50],[5,58],[12,66],[28,70],[40,66],[42,55],[35,45],[28,41],[15,38]],
 africa:[[-17,21],[-5,35],[10,37],[32,31],[43,12],[51,12],[40,-5],[35,-25],[20,-35],[13,-20],[8,4],[-8,5],[-17,14]],
 asia:[[42,55],[40,66],[60,72],[90,76],[140,72],[170,66],[160,58],[140,48],[122,40],[120,22],[108,10],[100,2],[95,15],[80,8],[72,20],[58,24],[48,28],[36,34],[35,45]],
 oceania:[[114,-22],[130,-12],[145,-12],[153,-26],[147,-38],[132,-33],[115,-34]]};
const proj=(lon,lat,M={x:160,y:150,w:1600,h:700})=>[M.x+(lon+170)/360*M.w,M.y+(80-lat)/135*M.h];
const landPath=(k,M)=>roundPoly(SHAPES[k].map(([a,b])=>proj(a,b,M)),M&&M.w<1600?18:34);
const defs=`<defs><linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A1550"/><stop offset="1" stop-color="#2E1F7A"/></linearGradient>
<linearGradient id="gPlaza" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9F7EE"/><stop offset="1" stop-color="#9FE6E0"/></linearGradient>
<radialGradient id="gAtmo" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="#7FD8FF" stop-opacity=".0"/><stop offset=".86" stop-color="#7FD8FF" stop-opacity=".55"/><stop offset="1" stop-color="#7FD8FF" stop-opacity="0"/></radialGradient>
<radialGradient id="gGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<clipPath id="globe"><circle cx="960" cy="540" r="300"/></clipPath></defs>`;
// человечек: одинаковый для всех, цвет тела = континент
function person(x,y,s=1,col='#B9B0F2',o={}){const head=o.elder?'#FFF4E8':'#FFF4E8';return g(`translate(${x},${y}) scale(${s*(o.kid?.72:1)})`,
  ell(0,4,22,6,'#000',0,'fill-opacity=".12"')+rect(-20,-46,40,48,20,col)+rect(-20,-46,16,48,8,'#000','fill-opacity=".08"')+circ(0,-62,19,head)+
  (o.elder?ell(0,-76,18,8,'#D9D9E6'):'')+circ(-6,-64,3.2,'#2B1550')+circ(6,-64,3.2,'#2B1550')+stroke('M-6,-55 Q0,-50 6,-55','#2B1550',2.6)+(o.wifi?stroke('M-12,-96 Q0,-108 12,-96','#2FA8D6',4)+stroke('M-6,-90 Q0,-95 6,-90','#2FA8D6',4):''));}
// раскладка группы по сетке вокруг центра
function cluster(cx,cy,n,step=40,cols){cols=cols||Math.ceil(Math.sqrt(n*1.6));const rows=Math.ceil(n/cols);const out=[];for(let i=0;i<n;i++){const r=Math.floor(i/cols),c=i%cols,inRow=Math.min(cols,n-r*cols);
  out.push([cx+(c-(inRow-1)/2)*step+(r%2?step*.25:0),cy+(r-(rows-1)/2)*step*.82]);}return out;}
const badge=(x,y,txt,col,fs=40)=>{const w=txt.length*fs*.62+50;return rect(x-w/2,y-fs*.95,w,fs*1.4,fs*.7,'#fff')+`<text x="${x}" y="${y+fs*.05}" text-anchor="middle" font-family="Round" font-size="${fs}" fill="${col}">${txt}</text>`;};
const title=(t,y=120,fs=84,col='#2B1550')=>`<text x="966" y="${y+6}" text-anchor="middle" font-family="Round" font-size="${fs}" fill="${col}" opacity=".25">${t}</text><text x="960" y="${y}" text-anchor="middle" font-family="Round" font-size="${fs}" fill="${col}">${t}</text>`;
const P={};
// 1 · Земля в облаке точек, стремительный отъезд
P[1]=()=>{let dots='';for(let i=0;i<900;i++){const a=hash(i)*Math.PI*2,r=330+Math.pow(hash(i+7),.6)*560;const x=960+Math.cos(a)*r*1.25,y=540+Math.sin(a)*r*.82;
  dots+=circ(x,y,1.5+hash(i+3)*3.5,['#FFFFFF','#FFD23F','#7FD8FF','#FF8FB0'][i%4],`fill-opacity="${.45+hash(i+5)*.5}"`);}
 let streaks='';for(let i=0;i<46;i++){const a=i/46*Math.PI*2+hash(i)*.1,r0=380+hash(i+2)*120,r1=r0+120+hash(i+4)*160;streaks+=stroke(`M${960+Math.cos(a)*r0*1.25},${540+Math.sin(a)*r0*.82} L${960+Math.cos(a)*r1*1.25},${540+Math.sin(a)*r1*.82}`,'#FFFFFF',4,'opacity=".35"');}
 return `<rect width="${W}" height="${H}" fill="url(#gNight)"/>${Array.from({length:60},(_,i)=>circ(hash(i+50)*W,hash(i+80)*H,2,'#fff','fill-opacity=".5"')).join('')}
 ${streaks}${dots}${circ(960,540,380,'url(#gAtmo)')}${circ(960,540,300,'#2F7BE6')}
 <g clip-path="url(#globe)">${['africa','europe','asia','latam','namerica'].map(k=>`<path d="${landPath(k,{x:420,y:300,w:1500,h:560})}" fill="#4FD1A4"/>`).join('')}${circ(860,420,260,'#fff','fill-opacity=".08"')}</g>
 ${camNote('M1480,960 L1780,960','стремительный отъезд ←→',1360,1030)}`;};
// 2 · облако складывается в сетку 10×10
P[2]=()=>`<rect width="${W}" height="${H}" fill="url(#gPlaza)"/>${rect(460,250,1000,760,60,'#FFFFFF','fill-opacity=".55"')}
 ${title('ВЕСЬ МИР — 100 ЧЕЛОВЕК',150,86)}
 ${Array.from({length:100},(_,i)=>person(564+(i%10)*88,348+Math.floor(i/10)*72,.72)).join('')}
 ${badge(1660,560,'1 = 1%','#6A3FD8',52)}${stroke('M1540,560 Q1500,560 1470,540','#6A3FD8',8)}`;
// 3 · под площадкой разворачивается карта, континенты подсвечиваются по очереди
P[3]=()=>{const M={x:160,y:120,w:1600,h:700};return `<rect width="${W}" height="${H}" fill="#EAF6FF"/>${rect(120,90,1680,760,60,'#BFE6FA')}
 ${CONT.map((c,i)=>`<path d="${landPath(c.k,M)}" fill="${c.k==='asia'?c.col:'#D7D2F2'}" ${c.k==='asia'?'':''}/>`).join('')}
 ${circ(proj(92,42,M)[0],proj(92,42,M)[1],260,'url(#gGlow)','opacity=".35"')}
 ${CONT.map((c,i)=>{const [x,y]=proj(c.lon,c.lat,M);return circ(x,y,30,c.k==='asia'?'#fff':'#B9B0F2')+`<text x="${x}" y="${y+12}" text-anchor="middle" font-family="Round" font-size="34" fill="${c.k==='asia'?c.col:'#fff'}">${i+1}</text>`;}).join('')}
 ${Array.from({length:100},(_,i)=>person(130+(i%50)*34.5,935+Math.floor(i/50)*62,.55)).join('')}
 ${badge(1500,180,'размер ≠ население','#2B1550',40)}
 ${camNote('M150,880 L1770,880','карта разворачивается под людьми',150,875,'#2B1550')}`;};
// 4 · жители идут к континентам — пунктирные траектории
P[4]=()=>{const M={x:160,y:120,w:1600,h:700};let people='',trails='';
 CONT.forEach(c=>{const [x,y]=proj(c.lon,c.lat,M);const pts=cluster(x,y,c.c,36);pts.forEach((p,i)=>{const arrived=i<Math.ceil(c.c*.55);if(arrived)people+=person(p[0],p[1]+20,.62,c.col);
   else{const sx=200+hash(i+c.c)*1500,sy=1000,t=.35+hash(i*3+c.c)*.4;const mx=sx+(p[0]-sx)*t,my=sy+(p[1]-sy)*t;trails+=stroke(`M${sx},${sy} Q${(sx+p[0])/2},${sy-120} ${mx},${my}`,c.col,5,'stroke-dasharray="2 14" opacity=".8"');people+=person(mx,my+20,.62,c.col);}});});
 return `<rect width="${W}" height="${H}" fill="#EAF6FF"/>${rect(120,90,1680,760,60,'#BFE6FA')}
 ${CONT.map(c=>`<path d="${landPath(c.k,M)}" fill="${c.col}" fill-opacity=".35"/>`).join('')}${trails}${people}
 ${badge(960,1010,'Азия заполняется быстрее всех','#FF6B6B',44)}`;};
// 5 · группы со счётчиками + полоса 100 сегментов
P[5]=()=>{const M={x:160,y:120,w:1600,h:700};let people='';CONT.forEach(c=>{const [x,y]=proj(c.lon,c.lat,M);cluster(x,y,c.c,36).forEach(p=>people+=person(p[0],p[1]+20,.62,c.col));});
 let bar='',bx=180;CONT.forEach(c=>{for(let i=0;i<c.c;i++){bar+=rect(bx,960,12,46,6,c.col);bx+=15.6;}});
 return `<rect width="${W}" height="${H}" fill="#EAF6FF"/>${rect(120,90,1680,760,60,'#BFE6FA')}
 ${CONT.map(c=>`<path d="${landPath(c.k,M)}" fill="${c.col}" fill-opacity=".35"/>`).join('')}${people}
 ${CONT.map(c=>{const [x,y]=proj(c.lon,c.lat,M);const off={asia:-200,africa:-120,europe:-110,latam:-95,namerica:-95,oceania:-70}[c.k];return badge(x,y+off,`${c.n} ${c.c}`,c.col,c.k==='asia'?46:34);}).join('')}
 ${bar}<text x="180" y="1050" font-family="Round" font-size="30" fill="#6A6290">100 человек = 100%</text>`;};
// 6 · карта складывается в площадку: город и село
P[6]=()=>{let city='',village='',people='';
 [[120,330,170,560,'#8FA8FF'],[310,230,200,660,'#6A8CFF'],[530,380,150,510,'#A9B8FF'],[700,280,170,610,'#7B9BFF']].forEach(([x,y,w,h,c])=>{city+=rect(x,y,w,h,40,c);for(let r=0;r<Math.floor((h-80)/90);r++)for(let k=0;k<2;k++)city+=rect(x+26+k*(w/2-10),y+40+r*90,w/2-46,50,18,'#E8F0FF','fill-opacity=".9"');});
 [[1180,700,'#FF8A6B'],[1420,730,'#FFB52E'],[1640,690,'#FF7AC8']].forEach(([x,y,c])=>{village+=rect(x-110,y-120,220,170,30,'#FFF1DC')+rp([[x-140,y-110],[x,y-230],[x+140,y-110]],[24,40,24],c)+rect(x-30,y-50,60,100,24,'#C9783E')+rect(x+50,y-90,46,46,14,'#9FE0FF');});
 village+=[[1300,560],[1540,600],[1760,560]].map(([x,y])=>rect(x-10,y,20,90,10,'#8A5A3A')+circ(x,y-10,56,'#3DBA7C')+circ(x-30,y+10,40,'#2FA866')).join('');
 cluster(560,900,57,34,19).forEach((p,i)=>people+=person(p[0],p[1],.56,CONT[i%6].col));cluster(1460,900,43,34,15).forEach((p,i)=>people+=person(p[0],p[1],.56,CONT[(i+2)%6].col));
 return `<rect width="${W}" height="${H}" fill="url(#gPlaza)"/>${rect(-40,800,2000,320,0,'#B8EEDF')}${city}${village}${people}
 ${badge(560,200,'ГОРОД ≈57','#5B8CFF',56)}${badge(1460,300,'СЕЛО ≈43','#2FA866',56)}
 ${stroke('M960,880 Q1040,820 1120,880','#2B1550',8,'stroke-dasharray="2 16"')}${person(1040,850,.56,'#FFB52E')}`;};
// 7 · крупно один человек: возраст, язык, интернет
P[7]=()=>{let bokeh='';for(let i=0;i<34;i++)bokeh+=circ(hash(i)*W,hash(i+9)*H,30+hash(i+3)*60,CONT[i%6].col,'fill-opacity=".18"');
 const icon=(x,y,col,inner,label)=>circ(x,y,110,'#fff')+circ(x,y,96,col,'fill-opacity=".15"')+inner+badge(x,y+170,label,col,40);
 return `<rect width="${W}" height="${H}" fill="#F3F0FF"/>${bokeh}${circ(960,600,330,'url(#gGlow)')}
 ${person(960,980,7.2,'#FF6B6B')}
 ${icon(430,330,'#FFB52E',rect(380,320,100,60,16,'#FFB52E')+rect(392,300,76,26,12,'#FFD98A')+rect(424,262,12,36,6,'#FF6B6B')+ell(430,256,9,13,'#FFD23F'),'ВОЗРАСТ')}
 ${icon(1490,330,'#5B8CFF',rp([[1420,280],[1560,280],[1560,370],[1470,370],[1440,400],[1440,370],[1420,370]],[26,26,26,10,8,8,26],'#5B8CFF')+`<text x="1490" y="345" text-anchor="middle" font-family="Round" font-size="46" fill="#fff">Aa 文</text>`,'ЯЗЫК')}
 ${icon(1560,760,'#2FA8D6',stroke('M1500,760 Q1560,700 1620,760','#2FA8D6',18)+stroke('M1525,790 Q1560,755 1595,790','#2FA8D6',18)+circ(1560,820,14,'#2FA8D6'),'ИНТЕРНЕТ')}
 ${camNote('M760,170 L1160,170','наезд на одного → и снова вся сотня',650,140,'#2B1550')}`;};
// 8 · снова вся сотня: дети, пожилые, онлайн
P[8]=()=>{let ppl='',idx=0;const ord=[];CONT.forEach(c=>{for(let i=0;i<c.c;i++)ord.push(c.col);});
 for(let i=0;i<100;i++){const kid=hash(i*7+1)<.25,elder=!kid&&hash(i*5+2)<.135,wifi=hash(i*3+4)<.67;ppl+=person(466+(i%10)*90,340+Math.floor(i/10)*72,.72,ord[i],{kid,elder,wifi});}
 return `<rect width="${W}" height="${H}" fill="url(#gPlaza)"/>${rect(400,230,940,760,60,'#FFFFFF','fill-opacity=".55"')}
 ${title('НАША ПЛАНЕТА — 100 ЧЕЛОВЕК',150,74)}${ppl}
 ${badge(1600,380,'ДЕТИ ДО 15 ≈ 25','#FF6B6B',40)}${badge(1600,560,'СТАРШЕ 65 ≈ 10','#A35BFF',40)}${badge(1600,740,'В ИНТЕРНЕТЕ ≈ 67','#2FA8D6',40)}`;};
const CAPS={
1:{t:'0:00–0:08',name:'Слишком много людей',cam:'Земля в облаке точек. Камера стремительно отдаляется, точки сливаются в плотное облако, вокруг лучи скорости.',snd:'Нарастающий гул, лёгкий «вжух» отъезда.',vo:'«Представить всё население Земли почти невозможно. Поэтому давай уменьшим человечество до ста человек».'},
2:{t:'0:08–0:16',name:'Весь мир — 100 человек',cam:'Облако сжимается и раскладывается в ровную сетку 10×10 одинаковых человечков. Сверху падает заголовок, рядом значок «1 = 1%».',snd:'Сто коротких «тик» по сетке, акцент на заголовке.',vo:'«Вот они. Всё человечество на одной площадке. Каждый — один процент жителей планеты».'},
3:{t:'0:16–0:26',name:'Карта',cam:'Под человечками разворачивается карта, сами они собираются в полосу внизу. Континенты подсвечиваются по очереди (1–6), Азия ярче всех.',snd:'Шелест разворота, мягкие ноты на каждый континент.',vo:'«Но расселим мы их не поровну. Размер территории ещё не говорит о том, сколько людей на ней живёт».'},
4:{t:'0:26–0:32',name:'Расселение',cam:'Человечки идут по пунктирным дугам и окрашиваются в цвет своего континента. Азия заполняется заметно быстрее.',snd:'Шаги-«топ» в ритм музыки, частота растёт.',vo:'«Сначала распределим жителей по континентам. Посмотри, как быстро заполняется Азия…»'},
5:{t:'0:32–0:39',name:'Счётчики',cam:'Над группами появляются счётчики: Азия 59, Африка 18, Европа 9, Латинская Америка 8, Северная Америка 5, Океания 1. Внизу полоса из 100 сегментов.',snd:'Щелчки счётчиков, финальный аккорд.',vo:'«…и сколько свободного места остаётся на карте».'},
6:{t:'0:39–0:49',name:'Город и село',cam:'Карта складывается обратно в площадку. Слева растут дома города, справа поселение. Люди переходят: в городе ≈57, в селе ≈43.',snd:'Город гудит, в деревне птицы, шаги.',vo:'«Теперь уберём границы. Кто из нашей сотни живёт в городе, а кто — в сельской местности?»'},
7:{t:'0:49–0:55',name:'Один из ста',cam:'Камера наезжает на одного человечка. Вокруг него всплывают значки: возраст, язык, интернет.',snd:'Тишина на наезде, три мягких «поп» на значках.',vo:'«А сколько среди них детей? Сколько пожилых? Сколько могут посмотреть это видео?»'},
8:{t:'0:55–1:00',name:'Снова вся сотня',cam:'Отъезд к сетке 100: дети меньше ростом, у пожилых седина, у тех, кто онлайн, значок Wi‑Fi. Справа три плашки со значениями.',snd:'Основная тема, акцент на финальной плашке.',vo:'«Давай познакомимся с нашей планетой поближе».'}};
