// Hand-drawn vector illustrations for the five fact cards (920 × 720 viewBox). Every scene is a pure function of its state.
const ART = {};
const rnd = i => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s) };
const cl01 = v => Math.min(1, Math.max(0, v));
const blob = (cx, cy, rx, ry, k, n = 96, seed = 1) => {   // irregular closed shape, k = roughness
  const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 1 + k * (.5 * Math.sin(3 * a + seed) + .3 * Math.sin(7 * a + 2 * seed) + .2 * Math.sin(13 * a + 3 * seed));
    p.push([cx + rx * r * Math.cos(a), cy + ry * r * Math.sin(a)]) }
  return p };
const pathOf = p => 'M' + p.map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') + 'Z';
const lenOf = p => p.reduce((s, q, i) => s + Math.hypot(q[0] - p[(i + 1) % p.length][0], q[1] - p[(i + 1) % p.length][1]), 0);
const draw = (p, prog, attrs) => { const L = lenOf(p); return `<path d="${pathOf(p)}" fill="none" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${(L * (1 - prog)).toFixed(1)}" ${attrs}/>` };

// ── 2. Aogashima: oblique aerial view — steep cliffs, big caldera, small inner cone (Maruyama), village on the north rim
ART.aogashima = (o = {}) => {
  const par = o.par || 0, out = o.outer || 0, inn = o.inner || 0, lab = o.labels || 0;
  const isl = blob(460, 352, 336, 226, .07, 120, 1.3), cliff = isl.map(([x, y]) => [x, y + 58]);
  const rimIn = blob(476, 338, 248, 158, .06, 120, 2.1), floor = blob(478, 344, 236, 148, .05, 120, 2.1);
  const cone = blob(388, 372, 82, 52, .05, 60, .7), crater = blob(392, 362, 32, 17, .08, 40, .4);
  const g1 = par * 3, g2 = par * 6, g3 = par * 11;
  let fields = ''; for (let i = 0; i < 26; i++) { const a = rnd(i) * 6.28, r = .25 + rnd(i + 50) * .6, x = 520 + Math.cos(a) * 170 * r, y = 352 + Math.sin(a) * 100 * r;
    if (Math.hypot((x - 388) / 95, (y - 372) / 65) < 1) continue; fields += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(14 + rnd(i + 9) * 22).toFixed(0)}" height="${(6 + rnd(i + 3) * 9).toFixed(0)}" rx="2" fill="${rnd(i + 7) > .5 ? '#86b85a' : '#a7c46c'}" opacity=".75" transform="rotate(${(-12 + rnd(i + 2) * 24).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>` }
  let houses = ''; for (let i = 0; i < 16; i++) { const x = 540 + i * 9 + rnd(i) * 6, y = 150 + rnd(i + 20) * 14 - i * .6; houses += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="7" height="5" rx="1" fill="${rnd(i + 4) > .4 ? '#f4f1ea' : '#9fb4c8'}"/>` }
  let waves = ''; for (let i = 0; i < 18; i++) { const x = rnd(i) * 920, y = 40 + rnd(i + 30) * 660; waves += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q14 -6 28 0 t28 0" stroke="#fff" stroke-opacity=".14" stroke-width="2" fill="none"/>` }
  return `<defs>
   <linearGradient id="ao_sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8ccc"/><stop offset="1" stop-color="#0d4a86"/></linearGradient>
   <linearGradient id="ao_cliff" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6a32"/><stop offset=".55" stop-color="#5a5a3e"/><stop offset="1" stop-color="#4a3f33"/></linearGradient>
   <radialGradient id="ao_floor" cx=".45" cy=".45" r=".7"><stop offset="0" stop-color="#78b04e"/><stop offset="1" stop-color="#3f7f34"/></radialGradient>
   <radialGradient id="ao_cone" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#6fa847"/><stop offset="1" stop-color="#2f6a2c"/></radialGradient>
   <filter id="ao_b6"><feGaussianBlur stdDeviation="6"/></filter><filter id="ao_b3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="920" height="720" fill="url(#ao_sea)"/>${waves}
  <g transform="translate(${g1} 0)">
   <path d="${pathOf(cliff.map(([x, y]) => [x, y + 6]))}" fill="none" stroke="#fff" stroke-width="14" stroke-opacity=".55" filter="url(#ao_b6)"/>
   <path d="${pathOf(cliff)}" fill="url(#ao_cliff)"/>
   <path d="${pathOf(isl)}" fill="#3b7a33"/>
   <path d="${pathOf(isl)}" fill="none" stroke="#2a5a26" stroke-width="5" opacity=".6"/>
  </g>
  <g transform="translate(${g2} 0)">
   <path d="${pathOf(rimIn)}" fill="#29552a"/>
   <path d="${pathOf(floor.map(([x, y]) => [x, y + 7]))}" fill="url(#ao_floor)"/>
   ${fields}
   <path d="${pathOf(rimIn)}" fill="none" stroke="#1d3f1f" stroke-width="16" stroke-opacity=".35" filter="url(#ao_b6)"/>
   <path d="${pathOf(cone.map(([x, y]) => [x + 4, y + 10]))}" fill="#244d24" opacity=".6" filter="url(#ao_b3)"/>
   <path d="${pathOf(cone)}" fill="url(#ao_cone)"/>
   <path d="${pathOf(crater)}" fill="#24532a"/>
   ${houses}
   <path d="M470 196 C520 172 600 160 690 176" stroke="#e8e2cf" stroke-width="2.4" fill="none" opacity=".8"/>
  </g>
  <g transform="translate(${g3} 0)" opacity=".85">
   <ellipse cx="170" cy="150" rx="70" ry="22" fill="#fff" opacity=".55" filter="url(#ao_b6)"/>
   <ellipse cx="770" cy="560" rx="90" ry="26" fill="#fff" opacity=".45" filter="url(#ao_b6)"/>
  </g>
  <g transform="translate(${g2} 0)" stroke-linecap="round">
   ${out > 0 ? draw(rimIn.map(([x, y]) => [x, y - 2]), out, `stroke="#fff" stroke-width="5"`) : ''}
   ${inn > 0 ? draw(cone.map(([x, y]) => [(x - 388) * 1.12 + 388, (y - 372) * 1.18 + 372]), inn, `stroke="#ffd34d" stroke-width="5"`) : ''}
   ${lab > 0 ? `<g opacity="${lab}" font-family="Inter Display,Inter" font-weight="800" font-size="20" letter-spacing=".06em">
     <rect x="640" y="226" width="196" height="38" rx="19" fill="#fff"/><text x="738" y="252" text-anchor="middle" fill="#111218">BIG CALDERA</text>
     <rect x="200" y="452" width="190" height="38" rx="19" fill="#fff"/><text x="295" y="478" text-anchor="middle" fill="#111218">INNER CONE</text></g>` : ''}
  </g>`
};

// ── 3. Kishi station + Tama: cat-ear roof station, local train behind, calico cat, the stationmaster cap drops onto her head
ART.tama = (o = {}) => {
  const cap = o.cap ?? 1, blink = o.blink || 0, tr = o.train ?? -2, pass = o.pass || 0, tilt = o.tilt || 0;
  const tx = -760 + tr * 1100;
  let pol = ''; for (let i = 0; i < 4; i++) { const x = 60 + i * 260; pol += `<rect x="${x}" y="90" width="8" height="260" fill="#8b8f99"/><rect x="${x - 40}" y="96" width="88" height="5" fill="#8b8f99"/>` }
  const eyeH = 1 - blink;
  const capY = -260 * Math.pow(1 - cap, 2) + (cap > .85 ? Math.sin((cap - .85) / .15 * Math.PI) * -6 : 0);
  const person = (x, c, k) => `<g transform="translate(${x} 0)"><rect x="-13" y="${398 - k}" width="26" height="62" rx="12" fill="${c}"/><circle cx="0" cy="${386 - k}" r="12" fill="#e9c3a3"/><rect x="-11" y="${452 - k}" width="8" height="30" rx="4" fill="#3b4150"/><rect x="3" y="${452 - k}" width="8" height="30" rx="4" fill="#3b4150"/></g>`;
  return `<defs>
   <linearGradient id="tm_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd1f7"/><stop offset="1" stop-color="#e9f5fd"/></linearGradient>
   <linearGradient id="tm_roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a7148"/><stop offset="1" stop-color="#6e4d30"/></linearGradient>
   <clipPath id="tm_body"><path d="M262 450 C246 520 238 590 250 640 L410 640 C422 590 414 520 398 450 C380 420 280 420 262 450Z"/></clipPath>
   <clipPath id="tm_head"><path d="M252 330 C252 268 408 268 408 330 C408 392 252 392 252 330Z"/></clipPath>
   <filter id="tm_b"><feGaussianBlur stdDeviation="5"/></filter>
  </defs>
  <rect width="920" height="720" fill="url(#tm_sky)"/>
  <ellipse cx="160" cy="110" rx="80" ry="22" fill="#fff" opacity=".7"/><ellipse cx="560" cy="80" rx="110" ry="26" fill="#fff" opacity=".6"/>
  <path d="M0 300 C120 240 220 270 330 250 C450 228 560 270 680 246 C780 228 860 250 920 240 L920 380 L0 380Z" fill="#7fb36a"/>
  <path d="M0 330 C160 300 300 320 460 300 C620 282 760 316 920 296 L920 400 L0 400Z" fill="#5f9c55"/>
  ${pol}<path d="M0 104 L920 104" stroke="#555a66" stroke-width="2"/>
  <g transform="translate(${tx.toFixed(1)} 0)">
   <rect x="0" y="300" width="700" height="150" rx="22" fill="#f6f7f9" stroke="#b9bfca" stroke-width="3"/>
   <rect x="0" y="392" width="700" height="12" fill="#2f5fd0"/><rect x="0" y="406" width="700" height="7" fill="#f08a24"/>
   ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${40 + i * 108}" y="322" width="74" height="50" rx="7" fill="#2d4b6e"/>`).join('')}
   <rect x="676" y="316" width="16" height="60" rx="5" fill="#2d4b6e"/>
  </g>
  <rect x="0" y="440" width="920" height="40" fill="#e9e5dc"/><rect x="0" y="474" width="920" height="10" fill="#f2c94c"/>
  <rect x="0" y="484" width="920" height="236" fill="#d8d3c8"/><path d="M0 484 L920 484" stroke="#bcb5a6" stroke-width="3"/>
  <g>
   <rect x="610" y="250" width="290" height="200" rx="6" fill="#f3efe6" stroke="#c9bfae" stroke-width="3"/>
   <path d="M590 262 L612 150 L660 206 L756 206 L804 150 L826 262 Z" fill="url(#tm_roof)"/>
   <path d="M612 150 L640 210 M804 150 L776 210" stroke="#5a3d25" stroke-width="5"/>
   <path d="M826 262 L920 262 L920 220 L826 220Z" fill="url(#tm_roof)"/>
   <circle cx="676" cy="232" r="13" fill="#2d2a26"/><circle cx="740" cy="232" r="13" fill="#2d2a26"/>
   <rect x="640" y="300" width="80" height="150" rx="6" fill="#4a5a70"/><rect x="740" y="300" width="70" height="60" rx="4" fill="#9cc6e6"/><rect x="826" y="300" width="60" height="60" rx="4" fill="#9cc6e6"/>
  </g>
  ${pass > 0 ? `<g opacity="${Math.min(1, pass * 4)}">${person(890 - pass * 150, '#e57373', 0)}${person(860 - pass * 120, '#5c7cfa', 6)}</g>` : ''}
  <ellipse cx="330" cy="646" rx="120" ry="16" fill="#000" opacity=".16" filter="url(#tm_b)"/>
  <g transform="rotate(${tilt} 330 560)">
   <path d="M396 610 C470 610 482 570 456 548" stroke="#2b2420" stroke-width="22" fill="none" stroke-linecap="round"/>
   <path d="M262 450 C246 520 238 590 250 640 L410 640 C422 590 414 520 398 450 C380 420 280 420 262 450Z" fill="#fbfaf7"/>
   <g clip-path="url(#tm_body)"><ellipse cx="400" cy="520" rx="60" ry="70" fill="#e0893a"/><ellipse cx="250" cy="580" rx="48" ry="54" fill="#2b2420"/><ellipse cx="380" cy="625" rx="40" ry="26" fill="#2b2420"/></g>
   <path d="M290 640 C290 600 300 590 312 600 L314 640Z M350 640 C350 600 360 590 372 600 L374 640Z" fill="#f2efe9" stroke="#d5cfc4" stroke-width="2"/>
   <path d="M282 440 Q330 462 378 440" stroke="#d93a3a" stroke-width="12" fill="none" stroke-linecap="round"/>
   <circle cx="330" cy="470" r="18" fill="#d9a62e" stroke="#9b7419" stroke-width="3"/>
   <path d="M262 300 L270 236 L314 284Z" fill="#2b2420"/><path d="M398 300 L390 236 L346 284Z" fill="#e0893a"/>
   <path d="M272 286 L276 252 L300 280Z" fill="#f2a6a6"/><path d="M388 286 L384 252 L360 280Z" fill="#f2a6a6"/>
   <path d="M252 330 C252 268 408 268 408 330 C408 392 252 392 252 330Z" fill="#fbfaf7"/>
   <g clip-path="url(#tm_head)"><ellipse cx="268" cy="292" rx="44" ry="40" fill="#2b2420"/><ellipse cx="398" cy="294" rx="46" ry="42" fill="#e0893a"/></g>
   <g transform="translate(0 ${(1 - eyeH) * 3})">
    <ellipse cx="300" cy="330" rx="15" ry="${(13 * eyeH + .8).toFixed(2)}" fill="#c8d24a" stroke="#3a3326" stroke-width="2"/><ellipse cx="300" cy="330" rx="4" ry="${(11 * eyeH + .5).toFixed(2)}" fill="#1e1a14"/>
    <ellipse cx="360" cy="330" rx="15" ry="${(13 * eyeH + .8).toFixed(2)}" fill="#c8d24a" stroke="#3a3326" stroke-width="2"/><ellipse cx="360" cy="330" rx="4" ry="${(11 * eyeH + .5).toFixed(2)}" fill="#1e1a14"/>
   </g>
   <path d="M323 352 L337 352 L330 360Z" fill="#e88a9a"/><path d="M330 360 Q322 370 314 366 M330 360 Q338 370 346 366" stroke="#5a4a40" stroke-width="2.4" fill="none" stroke-linecap="round"/>
   <path d="M300 358 L246 350 M300 364 L248 370 M360 358 L414 350 M360 364 L412 370" stroke="#8a8072" stroke-width="1.8" stroke-linecap="round"/>
   ${cap > 0 ? `<g transform="translate(0 ${capY.toFixed(1)}) rotate(${((1 - cap) * -14).toFixed(1)} 330 262)" opacity="${Math.min(1, cap * 3)}">
     <path d="M270 268 C266 230 292 214 330 214 C368 214 394 230 390 268Z" fill="#1f2d5a"/>
     <rect x="270" y="256" width="120" height="16" rx="3" fill="#d9a62e"/>
     <path d="M262 272 Q330 300 398 272 L392 284 Q330 306 268 284Z" fill="#111a33"/>
     <circle cx="330" cy="240" r="11" fill="#d9a62e"/><circle cx="330" cy="240" r="5" fill="#1f2d5a"/></g>` : ''}
  </g>`
};

// ── 4. Zao snow monsters: winter slope, monsters behind, one fir in front: snow → cutaway → ice → snow again
ART.zao = (o = {}) => {
  const cut = o.cut || 0, clear = o.clear || 0, ice = o.ice || 0, snow = o.snow ?? 1, fall = o.fall || 0, ft = o.t || 0;
  const mon = (x, y, s, sh) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 0 C-52 -40 -44 -80 -30 -110 C-36 -140 -16 -170 0 -186 C18 -170 34 -142 28 -112 C44 -84 50 -40 40 0Z" fill="#f4f8fc"/><path d="M8 -180 C26 -150 36 -120 28 -100 C46 -70 50 -36 40 0 L18 0 C30 -40 22 -90 8 -180Z" fill="${sh}" opacity=".55"/></g>`;
  let bg = ''; [[90, 470, .7], [190, 452, .55], [300, 444, .45], [620, 446, .5], [730, 460, .62], [850, 478, .8], [40, 500, .9], [540, 438, .38]].forEach(([x, y, s], i) => bg += mon(x, y, s, '#b9cde3'));
  // fir tiers (drooping triangles), top to bottom
  const tiers = []; for (let i = 0; i < 7; i++) { const y = 210 + i * 56, w = 34 + i * 26; tiers.push(`M460 ${y - 40} C${460 - w * .4} ${y - 10} ${460 - w} ${y + 10} ${460 - w - 10} ${y + 22} C${460 - w * .5} ${y + 14} ${460 + w * .5} ${y + 14} ${460 + w + 10} ${y + 22} C${460 + w} ${y + 10} ${460 + w * .4} ${y - 10} 460 ${y - 40}Z`) }
  const tree = `<rect x="452" y="200" width="16" height="430" fill="#5a3f2b"/>` + tiers.map(d => `<path d="${d}" fill="#2e5a3a" stroke="#1e3f28" stroke-width="2"/>`).join('');
  const iceL = ice > 0 ? tiers.map(d => `<path d="${d}" fill="#e9f8ff" fill-opacity="${(.5 * ice).toFixed(2)}" stroke="#dff6ff" stroke-width="${(2 + 7 * ice).toFixed(1)}" stroke-linejoin="round"/>`).join('') +
    [...Array(28)].map((_, i) => { const y = 200 + rnd(i) * 400, w = 30 + (y - 170) / 56 * 26, x = 460 + (rnd(i + 40) - .5) * 2 * w; return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2 + rnd(i + 3) * 3).toFixed(1)}" fill="#fff" opacity="${cl01(ice * 2 - rnd(i + 8))}"/>` }).join('') : '';
  // snow monster: stacked lumps, each grows in from the bottom up
  const L = [[452, 604, 216, 66], [356, 566, 96, 74], [566, 548, 104, 80], [470, 516, 150, 78], [388, 470, 92, 72], [548, 446, 86, 76], [458, 408, 120, 68], [400, 352, 78, 64], [526, 330, 70, 70], [452, 288, 92, 60], [492, 236, 62, 58], [430, 200, 48, 50], [470, 160, 36, 42], [344, 420, 50, 44], [590, 380, 44, 50]];
  const n = L.length, lumps = L.map(([x, y, rx, ry], i) => { const p = cl01(snow * n - (n - 1 - (n - 1 - i))); const q = cl01((snow - i / n) * n); const s = .2 + .8 * q;
    return q > 0 ? `<ellipse cx="${x}" cy="${(y + (1 - q) * 20).toFixed(1)}" rx="${(rx * s).toFixed(1)}" ry="${(ry * s).toFixed(1)}" fill="url(#zo_snow)" opacity="${Math.min(1, q * 2)}"/>` : '' }).join('');
  const slotW = 260 * cut;
  let flakes = ''; if (fall > 0) for (let i = 0; i < 70; i++) { const x = (rnd(i) * 960 + Math.sin(ft * 1.3 + i) * 14) % 920, y = (rnd(i + 99) * 760 + ft * (40 + rnd(i + 5) * 40)) % 760 - 20; flakes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.5 + rnd(i + 7) * 2.5).toFixed(1)}" fill="#fff" opacity="${(fall * (.5 + rnd(i + 3) * .5)).toFixed(2)}"/>` }
  return `<defs>
   <linearGradient id="zo_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb6dd"/><stop offset="1" stop-color="#e3edf6"/></linearGradient>
   <radialGradient id="zo_snow" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#eef4fa"/><stop offset="1" stop-color="#c3d5e8"/></radialGradient>
   <mask id="zo_slot"><rect width="920" height="720" fill="#fff"/><rect x="${(460 - slotW / 2).toFixed(1)}" y="120" width="${slotW.toFixed(1)}" height="540" rx="${Math.min(40, slotW / 2).toFixed(1)}" fill="#000"/></mask>
   <filter id="zo_b"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <rect width="920" height="720" fill="url(#zo_sky)"/>
  <path d="M0 330 L120 270 L230 300 L360 230 L470 280 L600 220 L720 270 L840 240 L920 262 L920 520 L0 520Z" fill="#d6e3f0"/>
  <path d="M0 420 C200 380 400 400 600 380 C760 366 860 390 920 380 L920 720 L0 720Z" fill="#f2f6fa"/>
  ${bg}
  <path d="M0 640 C220 600 480 628 700 606 C820 596 880 610 920 604 L920 720 L0 720Z" fill="#fff"/>
  <ellipse cx="460" cy="636" rx="230" ry="22" fill="#9db4cc" opacity=".45" filter="url(#zo_b)"/>
  ${tree}${iceL}
  <g mask="url(#zo_slot)" opacity="${(1 - clear).toFixed(3)}">${lumps}</g>
  ${cut > 0 && clear < 1 ? `<rect x="${(460 - slotW / 2).toFixed(1)}" y="120" width="${slotW.toFixed(1)}" height="540" rx="${Math.min(40, slotW / 2).toFixed(1)}" fill="none" stroke="#2f7bf5" stroke-width="4" stroke-dasharray="14 10" opacity="${((1 - clear) * Math.min(1, cut * 3)).toFixed(2)}"/>` : ''}
  ${flakes}`
};

// ── 5. Susami: camera dives from the sea surface to the seabed; red Japanese post box, postcard drops into the slot
ART.susami = (o = {}) => {
  const dive = o.dive ?? 1, card = o.card || 0, posted = o.posted || 0, bt = o.t || 0, bag = o.bag || 0;
  const off = -720 * dive;   // scene is 920 × 1440: 0–360 above water, 360–1440 underwater
  let rays = ''; for (let i = 0; i < 6; i++) { const x = 80 + i * 150 + Math.sin(bt * .6 + i) * 20; rays += `<path d="M${x} 360 L${x + 70} 360 L${x + 200} 1300 L${x + 60} 1300Z" fill="#fff" opacity=".07"/>` }
  let weeds = ''; for (let i = 0; i < 9; i++) { const x = 40 + i * 104 + rnd(i) * 30, h = 60 + rnd(i + 3) * 90, sw = Math.sin(bt * 1.2 + i) * 10; weeds += `<path d="M${x} 1400 Q${x + sw} ${1400 - h / 2} ${x + sw * 1.6} ${1400 - h}" stroke="#2f8f6a" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>` }
  let bub = ''; for (let i = 0; i < 14; i++) { const ph = (bt * .35 + rnd(i)) % 1, x = 600 + (rnd(i + 9) - .5) * 160 + Math.sin(bt * 2 + i) * 6, y = 1300 - ph * 820; bub += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3 + rnd(i + 2) * 6).toFixed(1)}" fill="none" stroke="#e6fbff" stroke-width="2" opacity="${(.7 * Math.sin(ph * Math.PI)).toFixed(2)}"/>` }
  // postcard path: from upper left down to the slot (scene coords), slides in at the end
  const pc = cl01(card / .85), ins = cl01((card - .85) / .15), px = 360 + (600 - 360) * pc, py = 820 + (1146 - 820) * pc, rot = Math.sin(pc * 9) * 14 * (1 - pc);
  return `<defs>
   <linearGradient id="su_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fcdf5"/><stop offset="1" stop-color="#d9f1ff"/></linearGradient>
   <linearGradient id="su_sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fc0e6"/><stop offset=".45" stop-color="#178fc4"/><stop offset="1" stop-color="#0b4f86"/></linearGradient>
   <linearGradient id="su_box" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a5121b"/><stop offset=".35" stop-color="#e5323a"/><stop offset=".6" stop-color="#d4222b"/><stop offset="1" stop-color="#7e0d14"/></linearGradient>
   <clipPath id="su_slot"><rect x="0" y="0" width="920" height="1146"/></clipPath>
   <filter id="su_b"><feGaussianBlur stdDeviation="8"/></filter>
  </defs>
  <g transform="translate(0 ${off.toFixed(1)})">
   <rect width="920" height="360" fill="url(#su_sky)"/>
   <path d="M520 360 C540 260 600 220 660 220 C730 220 780 280 800 360Z" fill="#2f6b3a"/><path d="M0 330 C120 300 200 320 300 340 L300 360 L0 360Z" fill="#4f8a4a"/>
   <rect y="360" width="920" height="1080" fill="url(#su_sea)"/>
   <path d="M0 360 ${[...Array(24)].map((_, i) => `Q${i * 40 + 20} ${360 + Math.sin(bt * 2 + i) * 5} ${i * 40 + 40} 360`).join(' ')}" stroke="#fff" stroke-width="5" fill="none" opacity=".8"/>
   ${rays}
   <path d="M0 1300 C200 1270 420 1290 620 1276 C760 1266 860 1284 920 1278 L920 1440 L0 1440Z" fill="#d9c79a"/>
   <path d="M0 1340 C260 1320 520 1346 920 1326 L920 1440 L0 1440Z" fill="#c8b483"/>
   <path d="M60 1300 C80 1250 160 1240 200 1290Z" fill="#5c6f7a"/><path d="M760 1290 C780 1230 880 1236 900 1290Z" fill="#4f6370"/>
   ${weeds}
   <ellipse cx="600" cy="1336" rx="96" ry="14" fill="#073a63" opacity=".35" filter="url(#su_b)"/>
   <rect x="546" y="1300" width="108" height="34" rx="6" fill="#7e0d14"/>
   <rect x="552" y="1112" width="96" height="196" rx="10" fill="url(#su_box)"/>
   <path d="M540 1118 C540 1074 660 1074 660 1118 L660 1124 L540 1124Z" fill="url(#su_box)"/>
   <rect x="536" y="1116" width="128" height="14" rx="5" fill="#8f1018"/>
   <rect x="566" y="1142" width="68" height="10" rx="4" fill="#3a0508"/>
   <text x="600" y="1222" text-anchor="middle" font-family="Inter Display,Inter" font-weight="900" font-size="52" fill="#fff">〒</text>
   <g clip-path="url(#su_slot)">${card > 0 ? `<g transform="translate(${px.toFixed(1)} ${(py + ins * 60).toFixed(1)}) rotate(${rot.toFixed(1)})" opacity="${(1 - ins * .3).toFixed(2)}">
     <rect x="-62" y="-40" width="124" height="80" rx="6" fill="#fffaf0" stroke="#d6cdb8" stroke-width="2"/><rect x="28" y="-30" width="24" height="28" rx="2" fill="#e5323a"/>
     <path d="M-48 -18 H10 M-48 -4 H10 M-48 10 H-4" stroke="#9aa3b6" stroke-width="3"/></g>` : ''}</g>
   ${bub}
  </g>
  ${posted > 0 ? `<g transform="translate(720 300) rotate(-8) scale(${(.85 + .15 * Math.min(1, posted * 2)).toFixed(3)})" opacity="${Math.min(1, posted * 3)}">
    <rect x="-96" y="-30" width="192" height="60" rx="14" fill="#fff" stroke="#2f7bf5" stroke-width="5"/><text x="0" y="13" text-anchor="middle" font-family="Inter Display,Inter" font-weight="900" font-size="34" fill="#2f7bf5" letter-spacing=".08em">POSTED</text></g>` : ''}
  ${bag > 0 ? `<g transform="translate(150 160)" opacity="${bag}"><circle r="46" fill="#fff" opacity=".92"/><path d="M-20 -6 C-20 -26 20 -26 20 -6 L24 24 L-24 24Z" fill="#c9a26b" stroke="#8a6a3e" stroke-width="3"/><path d="M-10 -20 Q0 -32 10 -20" stroke="#8a6a3e" stroke-width="3" fill="none"/><path d="M0 -60 L0 -82 M-8 -74 L0 -84 L8 -74" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></g>` : ''}`
};

// ── final row icons (88 px, drawn in a 100 × 100 box)
ART.icons = [
  `<path d="M18 70 C22 56 40 54 46 66 Z" fill="#2f7bf5"/><path d="M50 58 C56 36 80 36 84 58 C80 66 56 66 50 58Z" fill="#2f7bf5"/><circle cx="34" cy="40" r="7" fill="#2f7bf5"/><path d="M10 78 H90" stroke="#9cc6f2" stroke-width="4" stroke-linecap="round"/>`,
  `<ellipse cx="50" cy="56" rx="38" ry="24" fill="#2f7bf5"/><ellipse cx="52" cy="52" rx="26" ry="15" fill="#9cc6f2"/><ellipse cx="44" cy="54" rx="10" ry="7" fill="#2f7bf5"/>`,
  `<path d="M26 34 L30 14 L44 28 L56 28 L70 14 L74 34 C80 46 76 70 50 72 C24 70 20 46 26 34Z" fill="#2f7bf5"/><circle cx="40" cy="46" r="4" fill="#fff"/><circle cx="60" cy="46" r="4" fill="#fff"/><path d="M30 26 Q50 6 70 26 L70 30 L30 30Z" fill="#111a33"/>`,
  `<path d="M50 10 C64 26 70 40 64 50 C76 62 78 76 70 86 L30 86 C22 76 24 62 36 50 C30 40 36 26 50 10Z" fill="#2f7bf5"/><path d="M50 22 C58 32 60 42 56 50" stroke="#9cc6f2" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  `<rect x="34" y="26" width="32" height="56" rx="5" fill="#2f7bf5"/><path d="M30 28 C30 12 70 12 70 28Z" fill="#2f7bf5"/><rect x="40" y="34" width="20" height="5" rx="2" fill="#fff"/><text x="50" y="66" text-anchor="middle" font-family="Inter Display,Inter" font-weight="900" font-size="20" fill="#fff">〒</text>`];
