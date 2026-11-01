// Vector illustrations for the Egypt cards (920 × 720 viewBox). Reconstructions are labelled in the page.
const ART = {};
const rnd = i => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s) };
const cl01 = v => Math.min(1, Math.max(0, v));
const F = 'font-family="Inter Display,Inter" font-weight="800"';

// ── Abu Simbel great temple facade: four seated colossi; optional cut lines and block numbers
ART.abusimbel = (o = {}) => {
  const cut = o.cut || 0, sep = o.sep || 0, nums = o.nums || 0;
  const colossus = (x, s, i) => `<g transform="translate(${x} 0)">
    <path d="M-62 640 L-62 470 C-62 430 -40 410 -30 400 L30 400 C40 410 62 430 62 470 L62 640Z" fill="#c98f55"/>
    <path d="M-62 640 L-62 560 L62 560 L62 640Z" fill="#b97f48"/><rect x="-70" y="600" width="140" height="40" fill="#a86f3c"/>
    <path d="M-52 470 L-52 560 M52 470 L52 560" stroke="#a86f3c" stroke-width="5"/>
    <path d="M-40 330 C-46 290 -30 262 0 262 C30 262 46 290 40 330 L46 400 L-46 400Z" fill="#d8a066"/>
    ${[0, 1, 2, 3, 4].map(k => `<path d="M${-44 + k * 1} ${300 + k * 20} H${44 - k}" stroke="#b97f48" stroke-width="3" opacity=".6"/>`).join('')}
    <ellipse cx="0" cy="318" rx="22" ry="28" fill="#e2ad73"/><path d="M-10 312 h7 M3 312 h7" stroke="#7a4f2b" stroke-width="3"/><rect x="-5" y="338" width="10" height="16" fill="#b97f48"/>
    ${i === 1 ? `<path d="M-40 262 L40 262 L46 330 L-46 330Z" fill="#b97f48" opacity="0"/>` : ''}</g>`;
  let lines = ''; if (cut > 0) { for (let k = 1; k < 5; k++) { const y = 230 + k * 90; lines += `<path d="M90 ${y} H${90 + 740 * cl01(cut * 2 - k * .15)}" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>` }
    for (let k = 1; k < 6; k++) { const x = 90 + k * 123; lines += `<path d="M${x} 230 V${230 + 410 * cl01(cut * 2 - 1 + k * .05)}" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>` } }
  let nb = ''; if (nums > 0) for (let k = 0; k < 6; k++) nb += `<g opacity="${cl01(nums * 3 - k * .3)}"><circle cx="${150 + k * 123}" cy="${270 + (k % 2) * 180}" r="18" fill="#2f7bf5"/><text x="${150 + k * 123}" y="${277 + (k % 2) * 180}" text-anchor="middle" ${F} font-size="18" fill="#fff">${k + 1}</text></g>`;
  return `<defs><linearGradient id="as_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc6f0"/><stop offset="1" stop-color="#f7e6c6"/></linearGradient>
   <linearGradient id="as_cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b27a"/><stop offset="1" stop-color="#c38a52"/></linearGradient></defs>
  <rect width="920" height="720" fill="url(#as_sky)"/>
  <path d="M0 260 C120 200 260 190 460 196 C660 190 800 200 920 250 L920 720 L0 720Z" fill="url(#as_cl)"/>
  <path d="M90 640 L110 230 L810 230 L830 640Z" fill="#d6a067"/><path d="M110 230 L810 230 L810 252 L110 252Z" fill="#b97f48"/>
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
