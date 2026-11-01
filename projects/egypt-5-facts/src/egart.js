// Vector illustrations for the Egypt cards (920 × 720 viewBox). Reconstructions are labelled in the page.
const ART = {};
const rnd = i => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s) };
const cl01 = v => Math.min(1, Math.max(0, v));
const F = 'font-family="Inter Display,Inter" font-weight="800"';

// ── Abu Simbel great temple facade: four seated colossi; optional cut lines and block numbers
ART.abusimbel = (o = {}) => {
  const cut = o.cut || 0, sep = o.sep || 0, nums = o.nums || 0;
  const colossus = (x, s, i) => `<g transform="translate(${x} 0)">
    <path d="M-62 640 L-62 470 C-62 430 -40 410 -30 400 L30 400 C40 410 62 430 62 470 L62 640Z" fill="#e7b57a" stroke="#8a5a2e" stroke-width="4"/>
    <path d="M-62 640 L-62 560 L62 560 L62 640Z" fill="#b97f48"/><rect x="-70" y="600" width="140" height="40" fill="#a86f3c"/>
    <path d="M-52 470 L-52 560 M52 470 L52 560" stroke="#a86f3c" stroke-width="5"/>
    <path d="M-40 330 C-46 290 -30 262 0 262 C30 262 46 290 40 330 L46 400 L-46 400Z" fill="#f0c58c" stroke="#8a5a2e" stroke-width="4"/>
    ${[0, 1, 2, 3, 4].map(k => `<path d="M${-44 + k * 1} ${300 + k * 20} H${44 - k}" stroke="#b97f48" stroke-width="3" opacity=".6"/>`).join('')}
    <ellipse cx="0" cy="318" rx="22" ry="28" fill="#f6d19d" stroke="#8a5a2e" stroke-width="3"/><path d="M-10 312 h7 M3 312 h7" stroke="#7a4f2b" stroke-width="3"/><rect x="-5" y="338" width="10" height="16" fill="#b97f48"/>
    ${i === 1 ? `<path d="M-40 262 L40 262 L46 330 L-46 330Z" fill="#b97f48" opacity="0"/>` : ''}</g>`;
  let lines = ''; if (cut > 0) { for (let k = 1; k < 5; k++) { const y = 230 + k * 90; lines += `<path d="M90 ${y} H${90 + 740 * cl01(cut * 2 - k * .15)}" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>` }
    for (let k = 1; k < 6; k++) { const x = 90 + k * 123; lines += `<path d="M${x} 230 V${230 + 410 * cl01(cut * 2 - 1 + k * .05)}" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>` } }
  let nb = ''; if (nums > 0) for (let k = 0; k < 6; k++) nb += `<g opacity="${cl01(nums * 3 - k * .3)}"><circle cx="${150 + k * 123}" cy="${270 + (k % 2) * 180}" r="18" fill="#2f7bf5"/><text x="${150 + k * 123}" y="${277 + (k % 2) * 180}" text-anchor="middle" ${F} font-size="18" fill="#fff">${k + 1}</text></g>`;
  return `<defs><linearGradient id="as_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc6f0"/><stop offset="1" stop-color="#f7e6c6"/></linearGradient>
   <linearGradient id="as_cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b27a"/><stop offset="1" stop-color="#c38a52"/></linearGradient></defs>
  <rect width="920" height="720" fill="url(#as_sky)"/>
  <path d="M0 260 C120 200 260 190 460 196 C660 190 800 200 920 250 L920 720 L0 720Z" fill="url(#as_cl)"/>
  <path d="M90 640 L110 230 L810 230 L830 640Z" fill="#b5793f"/><path d="M110 230 L810 230 L810 252 L110 252Z" fill="#b97f48"/>
  <g transform="translate(${-sep * 30} ${-sep * 20})">${colossus(200, 1, 0)}${colossus(345, 1, 1)}</g>
  <rect x="430" y="470" width="60" height="170" fill="#4a3220"/>
  <g transform="translate(${sep * 30} ${-sep * 20})">${colossus(575, 1, 2)}${colossus(720, 1, 3)}</g>
  <path d="M0 640 C200 630 700 650 920 636 L920 720 L0 720Z" fill="#e8c894"/>
  ${[0, 1, 2].map(k => `<g transform="translate(${470 + k * 26} 652)"><circle cy="-14" r="4" fill="#333"/><rect x="-3.5" y="-10" width="7" height="12" rx="2" fill="${['#e5484d', '#2f7bf5', '#f2c94c'][k]}"/></g>`).join('')}
  ${lines}${nb}`
};

// ── Tutankhamun's iron dagger: iron blade, gold hilt, rock-crystal pommel. Scan line, Fe/Ni tags, space reveal through the blade shape
ART.dagger = (o = {}) => {
  const rot = o.rot || 0, scan = o.scan ?? -1, space = o.space || 0, t = o.t || 0, tags = o.tags || 0, glow = o.glow || 0;
  const blade = 'M460 120 C474 170 482 300 484 420 L436 420 C438 300 446 170 460 120Z';
  let stars = ''; for (let i = 0; i < 60; i++) stars += `<circle cx="${(400 + rnd(i) * 120).toFixed(0)}" cy="${(110 + rnd(i + 60) * 320).toFixed(0)}" r="${(.8 + rnd(i + 7) * 1.8).toFixed(1)}" fill="#fff" opacity="${(.4 + .6 * Math.abs(Math.sin(t * 2 + i))).toFixed(2)}"/>`;
  return `<defs><radialGradient id="dg_bg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#2b3448"/><stop offset="1" stop-color="#0c111c"/></radialGradient>
   <linearGradient id="dg_bl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f7680"/><stop offset=".45" stop-color="#e6ebf0"/><stop offset=".6" stop-color="#aab2bb"/><stop offset="1" stop-color="#555c66"/></linearGradient>
   <linearGradient id="dg_au" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c6b12"/><stop offset=".5" stop-color="#ffd76a"/><stop offset="1" stop-color="#a8761a"/></linearGradient>
   <radialGradient id="dg_sp" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#3b2d78"/><stop offset="1" stop-color="#070a1a"/></radialGradient>
   <clipPath id="dg_clip"><path d="${blade}"/></clipPath></defs>
  <rect width="920" height="720" fill="url(#dg_bg)"/><ellipse cx="460" cy="640" rx="260" ry="30" fill="#000" opacity=".35"/>
  <g transform="rotate(${rot} 460 420)">
   ${glow > 0 ? `<path d="${blade}" fill="none" stroke="#9fd0ff" stroke-width="${10 * glow}" opacity="${(.5 * glow).toFixed(2)}" style="filter:blur(6px)"/>` : ''}
   <path d="${blade}" fill="url(#dg_bl)"/><path d="M460 130 L460 418" stroke="#fff" stroke-width="2" opacity=".5"/>
   ${space > 0 ? `<g clip-path="url(#dg_clip)" opacity="${space}"><rect x="400" y="100" width="120" height="330" fill="url(#dg_sp)"/>${stars}<g transform="translate(${470 - space * 20} ${200 + space * 60})"><circle r="9" fill="#ffb86b"/><path d="M0 0 L-30 -50" stroke="#ffd59a" stroke-width="6" stroke-linecap="round" opacity=".8"/></g></g>` : ''}
   ${scan >= 0 && scan <= 1 ? `<path d="M424 ${120 + scan * 300} H496" stroke="#6fd3ff" stroke-width="4"/><rect x="424" y="${120 + scan * 300 - 30}" width="72" height="30" fill="#6fd3ff" opacity=".18"/>` : ''}
   <rect x="418" y="418" width="84" height="22" rx="6" fill="url(#dg_au)"/>
   <path d="M432 440 L488 440 L482 560 L438 560Z" fill="url(#dg_au)"/>
   ${[0, 1, 2, 3, 4, 5].map(k => `<path d="M434 ${452 + k * 18} H486" stroke="#5a3b10" stroke-width="3"/>`).join('')}
   <ellipse cx="460" cy="582" rx="34" ry="26" fill="#e9f3f7" stroke="#cfa64a" stroke-width="5"/>
  </g>
  ${tags > 0 ? ['Fe', 'Ni'].map((s, k) => `<g opacity="${cl01(tags * 2 - k * .5)}" transform="translate(${600 + k * 70} 240)"><rect x="-28" y="-26" width="56" height="52" rx="12" fill="#fff"/><text y="10" text-anchor="middle" ${F} font-size="26" fill="#2f7bf5">${s}</text></g>`).join('') + `<path d="M500 260 L570 250" stroke="#fff" stroke-width="2" stroke-dasharray="6 6" opacity="${cl01(tags * 2)}"/>` : ''}`
};

// hook teaser: dagger silhouette sliding in at the screen edge (drawn in page coordinates)
ART.daggerTeaser = (p, t) => `<g transform="translate(${(1110 - 230 * p).toFixed(1)} 700) rotate(${(-28 + 12 * p).toFixed(1)}) scale(1.15)" opacity="${p.toFixed(2)}">
  <path d="M0 -190 C14 -140 22 -40 24 60 L-24 60 C-22 -40 -14 -140 0 -190Z" fill="#cfd6de"/><rect x="-40" y="58" width="80" height="20" rx="6" fill="#e8b84a"/><path d="M-26 78 L26 78 L20 190 L-20 190Z" fill="#e8b84a"/><ellipse cy="212" rx="30" ry="22" fill="#eef6f8" stroke="#cfa64a" stroke-width="5"/></g>`;

// ── Great Pyramid of Khufu today (stepped core, flat top) + reconstruction of the smooth white casing, with a cutaway window
ART.pyramid = (o = {}) => {
  const cas = o.casing || 0, glint = o.glint ?? -1, cut = o.cut || 0, par = o.par || 0;
  const A = [180, 610], B = [470, 150], C = [720, 600], D = [860, 560];          // left base, apex, front-right base, back-right base
  const flat = 'M180 610 L470 150 L720 600Z', side = 'M720 600 L470 150 L860 560Z';
  let rows = ''; for (let k = 0; k < 26; k++) { const f = k / 26, y = 610 - (610 - 150) * f, xl = 180 + (470 - 180) * f, xr = 720 + (470 - 720) * f; rows += `<path d="M${xl.toFixed(1)} ${y.toFixed(1)} L${xr.toFixed(1)} ${(600 - 450 * f).toFixed(1)}" stroke="#a07a4c" stroke-width="2" opacity=".55"/>` }
  let rows2 = ''; for (let k = 0; k < 26; k++) { const f = k / 26; rows2 += `<path d="M${(720 + (470 - 720) * f).toFixed(1)} ${(600 - 450 * f).toFixed(1)} L${(860 + (470 - 860) * f).toFixed(1)} ${(560 - 410 * f).toFixed(1)}" stroke="#7d5c36" stroke-width="2" opacity=".5"/>` }
  const top = 150 + 460 * (1 - cas);   // casing mask rises from the base
  const gx = glint >= 0 ? 180 + glint * 680 : -999;
  return `<defs><linearGradient id="py_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb8ea"/><stop offset="1" stop-color="#f7e3bd"/></linearGradient>
   <linearGradient id="py_f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2b77d"/><stop offset="1" stop-color="#c89558"/></linearGradient>
   <linearGradient id="py_s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b98647"/><stop offset="1" stop-color="#9a6c38"/></linearGradient>
   <linearGradient id="py_cf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf8f1"/><stop offset="1" stop-color="#e9e2d2"/></linearGradient>
   <linearGradient id="py_cs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dcd5c4"/><stop offset="1" stop-color="#c2baa7"/></linearGradient>
   <linearGradient id="py_gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <clipPath id="py_m"><rect x="0" y="${top.toFixed(1)}" width="920" height="720"/></clipPath>
   <clipPath id="py_win"><path d="M${400 - 70 * cut} ${470 - 60 * cut} L${400 + 70 * cut} ${470 - 60 * cut} L${400 + 90 * cut} ${470 + 60 * cut} L${400 - 90 * cut} ${470 + 60 * cut}Z"/></clipPath>
   <clipPath id="py_all"><path d="${flat} ${side}"/></clipPath></defs>
  <rect width="920" height="720" fill="url(#py_sky)"/><circle cx="${780 + par * 6}" cy="130" r="48" fill="#fff6d8" opacity=".9"/>
  <path d="M0 560 C200 540 400 560 600 548 C760 540 860 552 920 548 L920 720 L0 720Z" fill="#e7c48c"/>
  <path d="${side}" fill="url(#py_s)"/>${rows2}<path d="${flat}" fill="url(#py_f)"/>${rows}
  <path d="M452 178 L488 178 L470 150Z" fill="#c89558"/>
  ${cas > 0 ? `<g clip-path="url(#py_m)"><path d="${side}" fill="url(#py_cs)"/><path d="${flat}" fill="url(#py_cf)"/><path d="M470 150 L720 600" stroke="#fff" stroke-width="2" opacity=".7"/></g>` : ''}
  ${cas > 0 && cut > 0 ? `<g clip-path="url(#py_win)"><path d="${flat}" fill="url(#py_f)"/>${rows}</g><path d="M${400 - 70 * cut} ${470 - 60 * cut} L${400 + 70 * cut} ${470 - 60 * cut} L${400 + 90 * cut} ${470 + 60 * cut} L${400 - 90 * cut} ${470 + 60 * cut}Z" fill="none" stroke="#2f7bf5" stroke-width="4" stroke-dasharray="12 8"/>` : ''}
  ${glint >= 0 && glint <= 1 ? `<g clip-path="url(#py_all)"><rect x="${gx - 90}" y="100" width="180" height="560" fill="url(#py_gl)" transform="skewX(-20)"/></g>` : ''}
  <path d="M0 640 C240 620 600 650 920 630 L920 720 L0 720Z" fill="#f0d29e"/>
  ${[0, 1].map(k => `<g transform="translate(${130 + k * 18} 650)"><circle cy="-12" r="3.5" fill="#333"/><rect x="-3" y="-8" width="6" height="10" rx="2" fill="${k ? '#2f7bf5' : '#e5484d'}"/></g>`).join('')}`
};

// ── Abu Simbel rescue: water rises on the old site; six blocks lift to the higher plateau and are rebuilt
ART.abusimbelMove = (o = {}) => {
  const water = o.water || 0, cut = o.cut || 0, move = o.move || 0, seams = o.seams ?? 1, t = o.t || 0;
  const S = .62, X0 = 175, Y0 = 210, LIFT = -150;          // facade drawn at 62 %, old site at Y0, new site LIFT higher
  const face = ART.abusimbel({}).replace(/<rect width="920" height="720" fill="url\(#as_sky\)"\/>/, '').replace(/<path d="M0 260 C120[^"]*" fill="url\(#as_cl\)"\/>/, '').replace(/<path d="M0 640 C200[^"]*" fill="#e8c894"\/>/, '');
  const blocks = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) blocks.push([90 + c * 246.7, 230 + r * 205, 246.7, 205]);
  const order = [3, 4, 5, 0, 1, 2];
  let g = '';
  blocks.forEach(([bx, by, bw, bh], i) => {
    const k = order.indexOf(i), p = Math.min(1, Math.max(0, move * 6 - k)), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const dy = LIFT * e - Math.sin(p * Math.PI) * 60, dx = Math.sin(p * Math.PI) * 18;
    g += `<g transform="translate(${dx.toFixed(1)} ${(dy / S).toFixed(1)})"><clipPath id="ab${i}"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}"/></clipPath><g clip-path="url(#ab${i})">${face}</g>
      ${cut > 0 && seams > 0 ? `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 10" opacity="${(Math.min(1, cut * 2 - k * .1) * seams).toFixed(2)}"/>` : ''}
      ${cut > .5 && seams > 0 ? `<g opacity="${seams}"><circle cx="${bx + 34}" cy="${by + 34}" r="22" fill="#2f7bf5"/><text x="${bx + 34}" y="${by + 42}" text-anchor="middle" font-family="Inter Display,Inter" font-weight="800" font-size="22" fill="#fff">${k + 1}</text></g>` : ''}
      ${p > 0 && p < 1 ? `<path d="M${bx + bw / 2} ${by - 600} V${by}" stroke="#2b2b2b" stroke-width="5"/><path d="M${bx + bw / 2 - 30} ${by} L${bx + bw / 2} ${by - 30} L${bx + bw / 2 + 30} ${by}" stroke="#2b2b2b" stroke-width="5" fill="none"/>` : ''}</g>`;
  });
  const wl = 720 - water * 230;
  return `<defs><linearGradient id="am_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc6f0"/><stop offset="1" stop-color="#f7e6c6"/></linearGradient>
   <linearGradient id="am_w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb3e8" stop-opacity=".9"/><stop offset="1" stop-color="#1d6fb0" stop-opacity=".95"/></linearGradient></defs>
  <rect width="920" height="720" fill="url(#am_sky)"/>
  <path d="M0 330 L920 330 L920 720 L0 720Z" fill="#d9a86c"/><path d="M0 330 L920 330" stroke="#b97f48" stroke-width="4"/>
  <path d="M0 470 L920 470 L920 720 L0 720Z" fill="#c38a52"/>
  <text x="890" y="318" text-anchor="end" font-family="Inter Display,Inter" font-weight="800" font-size="20" fill="#7a4f2b" letter-spacing=".05em">NEW SITE · HIGHER</text>
  <text x="890" y="458" text-anchor="end" font-family="Inter Display,Inter" font-weight="800" font-size="20" fill="#6a3f1b" letter-spacing=".05em">ORIGINAL SITE</text>
  <path d="M60 700 V40 H400" stroke="#e6a23c" stroke-width="14" fill="none" opacity="${move > 0 && move < 1 ? 1 : 0}"/>
  <g transform="translate(${X0} ${Y0}) scale(${S}) translate(-90 -230)">${g}</g>
  <rect x="0" y="${wl.toFixed(1)}" width="920" height="${(720 - wl).toFixed(1)}" fill="url(#am_w)"/>
  <path d="M0 ${wl.toFixed(1)} ${[...Array(24)].map((_, i) => `Q${i * 40 + 20} ${(wl + Math.sin(t * 3 + i) * 5).toFixed(1)} ${i * 40 + 40} ${wl.toFixed(1)}`).join(' ')}" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>`
};

// ── Rosetta Stone: dark granodiorite, broken top; three zones of writing shown as neutral texture rows (no invented signs)
ART.rosetta = (o = {}) => {
  const z = o.zones || 0, greek = o.greek || 0, guides = o.guides || 0, unlock = o.unlock || 0;
  const stone = 'M250 140 L330 96 L420 120 L520 84 L600 110 L670 150 L690 640 L230 650Z';
  const zone = (y0, y1, kind, i) => { let s = ''; for (let r = y0 + 16; r < y1 - 8; r += kind === 0 ? 22 : 16) for (let x = 262; x < 670; x += 0) {
      const w = kind === 0 ? 10 + rnd(r * 7 + x) * 10 : kind === 1 ? 14 + rnd(r * 3 + x) * 30 : 6 + rnd(r + x * 3) * 8; if (x + w > 672) break;
      s += kind === 1 ? `<path d="M${x.toFixed(0)} ${r} q${(w / 2).toFixed(0)} -5 ${w.toFixed(0)} 0" stroke="#c9c2b6" stroke-width="2" fill="none" opacity=".6"/>` : `<rect x="${x.toFixed(0)}" y="${r - (kind === 0 ? 7 : 3)}" width="${w.toFixed(0)}" height="${kind === 0 ? 12 : 5}" rx="2" fill="#c9c2b6" opacity="${kind === 0 ? .45 : .6}"/>`; x += w + (kind === 0 ? 7 : 5) }
    return s };
  const Z = [[150, 300, 'HIEROGLYPHS'], [300, 470, 'DEMOTIC'], [470, 640, 'GREEK']];
  return `<defs><radialGradient id="rs_bg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#e9e1d2"/><stop offset="1" stop-color="#cbbfa9"/></radialGradient>
   <linearGradient id="rs_st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4a52"/><stop offset="1" stop-color="#2a2a30"/></linearGradient><clipPath id="rs_c"><path d="${stone}"/></clipPath></defs>
  <rect width="920" height="720" fill="url(#rs_bg)"/><ellipse cx="460" cy="668" rx="270" ry="22" fill="#000" opacity=".2"/>
  <path d="${stone}" fill="url(#rs_st)"/>
  <g clip-path="url(#rs_c)">${Z.map(([a, b], i) => zone(a, b, i, i)).join('')}
   ${Z.map(([a, b], i) => { const p = cl01(z * 3 - i); const isG = i === 2; return p > 0 ? `<rect x="230" y="${a}" width="470" height="${b - a}" fill="${isG && greek > 0 ? '#2f7bf5' : '#ffd34d'}" opacity="${((isG && greek > 0 ? .35 * greek + .12 * (1 - greek) : .14) * p).toFixed(2)}"/>` : '' }).join('')}
   ${guides > 0 ? `<ellipse cx="420" cy="230" rx="44" ry="18" fill="none" stroke="#ffd34d" stroke-width="4" opacity="${guides}"/><rect x="330" y="${560}" width="120" height="14" rx="4" fill="none" stroke="#ffd34d" stroke-width="4" opacity="${guides}"/>` : ''}
  </g>
  ${guides > 0 ? `<path d="M464 236 C620 300 620 480 450 566" stroke="#ffd34d" stroke-width="3" stroke-dasharray="8 7" fill="none" opacity="${guides}"/>` : ''}
  ${Z.map(([a, b, n], i) => { const p = cl01(z * 3 - i); return p > 0 ? `<g opacity="${p}" transform="translate(${720 + (1 - p) * 20} ${(a + b) / 2})"><rect x="0" y="-20" width="${n.length * 15 + 36}" height="40" rx="20" fill="${i === 2 && greek > 0 ? '#2f7bf5' : '#fff'}"/><text x="18" y="8" font-family="Inter Display,Inter" font-weight="800" font-size="20" letter-spacing=".05em" fill="${i === 2 && greek > 0 ? '#fff' : '#111218'}">${n}</text></g>` : '' }).join('')}
  ${greek > .5 ? `<g opacity="${cl01(greek * 2 - 1)}" transform="translate(90 560)"><rect x="-10" y="-20" width="140" height="40" rx="20" fill="#fff"/><text x="60" y="7" text-anchor="middle" font-family="Inter Display,Inter" font-weight="800" font-size="15" fill="#2f7bf5">RECOGNISED</text></g>` : ''}
  ${unlock > 0 ? `<g transform="translate(460 380) scale(${(.6 + .4 * Math.min(1, unlock * 2)).toFixed(3)})" opacity="${cl01(unlock * 3)}"><circle r="70" fill="#fff"/><rect x="-30" y="-6" width="60" height="46" rx="8" fill="#2f7bf5"/><path d="M-18 -6 V-26 A18 18 0 0 1 18 -26 V${(-26 + 22 * cl01(unlock * 2 - .6)).toFixed(1)}" stroke="#2f7bf5" stroke-width="9" fill="none" transform="translate(${(cl01(unlock * 2 - .6) * 14).toFixed(1)} ${(-cl01(unlock * 2 - .6) * 8).toFixed(1)})"/></g>` : ''}`
};

// ── Cleopatra: the question card (portrait medallion between a pyramid and a modern person) and the honest-scale timeline
ART.cleo = (o = {}) => {
  const tl = o.tl || 0, r1 = o.r1 || 0, r2 = o.r2 || 0, look = o.look || 0;
  const X = y => 120 + (y + 2560) / (2026 + 2560) * 680;            // years → x on one linear scale
  const xp = X(-2560), xc = X(-50), xt = X(2026), Y = 520;
  const pyr = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 30 L0 -36 L40 30Z" fill="#e2b77d"/><path d="M0 -36 L40 30 L56 24Z" fill="#b98647"/></g>`;
  const person = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cy="-30" r="12" fill="#2f7bf5"/><rect x="-14" y="-16" width="28" height="44" rx="12" fill="#2f7bf5"/></g>`;
  const portrait = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="92" fill="#e9c46a" stroke="#b8862b" stroke-width="8"/><circle r="76" fill="none" stroke="#b8862b" stroke-width="3" stroke-dasharray="4 6"/>
    <path d="M18 -60 C-10 -62 -30 -40 -30 -14 C-30 0 -40 6 -36 14 C-30 18 -32 26 -26 32 C-20 40 -10 40 -4 50 L24 56 C30 30 40 10 40 -14 C40 -40 34 -56 18 -60Z" fill="#7a5320"/>
    <path d="M20 -62 C50 -60 66 -30 60 0 C56 30 44 50 30 64 L18 40 C30 20 34 -10 26 -40Z" fill="#3b2a12"/></g>`;
  const q = 1 - tl;
  return `<defs><radialGradient id="cl_bg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#1e2a44"/><stop offset="1" stop-color="#0b1120"/></radialGradient></defs>
  <rect width="920" height="720" fill="url(#cl_bg)"/>
  <g opacity="${q.toFixed(2)}">${portrait(460, 330, 1.25)}${pyr(170, 360, 1.6)}${person(760, 370, 1.6)}
   <text x="170" y="460" text-anchor="middle" font-family="Inter Display,Inter" font-weight="800" font-size="22" fill="#fff" letter-spacing=".05em">GREAT PYRAMID</text><text x="760" y="460" text-anchor="middle" font-family="Inter Display,Inter" font-weight="800" font-size="22" fill="#fff" letter-spacing=".05em">US</text>
   <text x="460" y="540" text-anchor="middle" font-family="Inter Display,Inter" font-weight="800" font-size="24" fill="#ffd34d" letter-spacing=".05em">CLEOPATRA</text>
   <circle cx="${(400 + look * 120).toFixed(1)}" cy="600" r="0"/></g>
  ${tl > 0 ? `<g opacity="${tl.toFixed(2)}">
   <path d="M${xp} ${Y} H${(xp + (xt - xp) * Math.min(1, tl * 1.3)).toFixed(1)}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
   ${r2 > 0 ? `<path d="M${xc} ${Y} H${(xc + (xt - xc) * r2).toFixed(1)}" stroke="#2f7bf5" stroke-width="10" stroke-linecap="round"/>` : ''}
   ${[[xp, 'GREAT PYRAMID', pyr(0, 0, .9)], [xc, 'CLEOPATRA', portrait(0, 0, .36)], [xt, 'TODAY', person(0, 4, .9)]].map(([x, n, ic], i) => `<g opacity="${cl01(tl * 3 - i * .6)}"><circle cx="${x}" cy="${Y}" r="14" fill="#fff"/><g transform="translate(${x} ${Y - 110})">${ic}</g><text x="${x}" y="${Y + 52}" text-anchor="middle" font-family="Inter Display,Inter" font-weight="800" font-size="22" fill="#fff" letter-spacing=".04em">${n}</text></g>`).join('')}
   ${r1 > 0 ? `<g opacity="${cl01(r1 * 2)}"><path d="M${xp + 20} ${Y - 30} Q${(xp + xc) / 2} ${Y - 70} ${xc - 20} ${Y - 30}" stroke="#ffd34d" stroke-width="3" fill="none"/><text x="${(xp + xc) / 2}" y="${Y - 84}" text-anchor="middle" font-family="Inter Display,Inter" font-weight="900" font-size="30" fill="#ffd34d">≈2,500 YEARS</text></g>` : ''}
   ${r2 > 0 ? `<g opacity="${cl01(r2 * 2)}"><path d="M${xc + 20} ${Y - 30} Q${(xc + xt) / 2} ${Y - 70} ${xt - 20} ${Y - 30}" stroke="#7fb2ff" stroke-width="3" fill="none"/><text x="${(xc + xt) / 2}" y="${Y - 84}" text-anchor="middle" font-family="Inter Display,Inter" font-weight="900" font-size="30" fill="#7fb2ff">≈2,000 YEARS</text></g>` : ''}
   <text x="460" y="${Y + 120}" text-anchor="middle" font-family="Inter Display,Inter" font-weight="600" font-size="18" fill="#9aa6bd">pyramid c. 26th century BCE · Cleopatra 69–30 BCE · one linear scale</text></g>` : ''}`
};

ART.icons = [
  `<path d="M14 80 L50 18 L86 80Z" fill="#2f7bf5"/><path d="M50 18 L86 80 L70 80Z" fill="#1f5fc8"/>`,
  `<path d="M50 8 C56 24 58 50 58 64 L42 64 C42 50 44 24 50 8Z" fill="#2f7bf5"/><rect x="34" y="62" width="32" height="8" rx="3" fill="#2f7bf5"/><path d="M42 70 H58 L56 88 H44Z" fill="#2f7bf5"/>`,
  `<rect x="14" y="30" width="72" height="54" fill="#2f7bf5"/>${[0, 1, 2, 3].map(k => `<rect x="${20 + k * 17}" y="40" width="10" height="40" rx="4" fill="#fff"/>`).join('')}<path d="M10 30 H90" stroke="#2f7bf5" stroke-width="6"/>`,
  `<path d="M28 20 L46 12 L64 18 L76 26 L78 88 L24 90Z" fill="#2f7bf5"/>${[0, 1, 2, 3, 4].map(k => `<path d="M32 ${34 + k * 11} H70" stroke="#fff" stroke-width="3" opacity=".8"/>`).join('')}`,
  `<circle cx="50" cy="52" r="36" fill="none" stroke="#2f7bf5" stroke-width="8"/><path d="M50 30 V52 L64 62" stroke="#2f7bf5" stroke-width="7" stroke-linecap="round" fill="none"/>`];
