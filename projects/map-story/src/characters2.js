// Painted peg characters (reference look): porcelain dome head, tiny dot eyes, layered costume with
// soft volume shading, rim light and contact shadow. figure(spec, s) → SVG 260×360, body 210×300 at (25, 40).
let FIG_N = 0;
function figure(o, s = 1) {
  const u = 'f' + (FIG_N++), W = 260, H = 360, x0 = 25, x1 = 235, y0 = 40, yb = 340, r = 105, cx = 130;
  const body = `M${x0} ${y0 + r} A${r} ${r} 0 0 1 ${x1} ${y0 + r} C${x1 + 4} ${y0 + 190} ${x1 + 8} ${yb - 60} ${x1 + 4} ${yb - 34} Q${x1} ${yb} ${x1 - 40} ${yb} L${x0 + 40} ${yb} Q${x0} ${yb} ${x0 - 4} ${yb - 34} C${x0 - 8} ${yb - 60} ${x0 - 4} ${y0 + 190} ${x0} ${y0 + r} Z`;
  const C = { u, x0, x1, y0, yb, cx, r, W, H };
  const eyeY = y0 + 104, eyeDx = 36, mouthY = y0 + 136;
  const eye = x => o.mood === 'angry'
    ? `<path d="M${x - 8} ${eyeY - 3} Q${x} ${eyeY - 5} ${x + 8} ${eyeY - 3} L${x + 7} ${eyeY + 6} Q${x} ${eyeY + 11} ${x - 7} ${eyeY + 6} Z" fill="#17110c"/>`
    : `<ellipse cx="${x}" cy="${eyeY}" rx="6.8" ry="9.5" fill="#17110c"/><ellipse cx="${x - 1.8}" cy="${eyeY - 3.5}" rx="2" ry="2.6" fill="#fff" opacity=".55"/>`;
  const brows = o.mood === 'angry' ? `<path d="M${cx - eyeDx - 13} ${eyeY - 19} L${cx - eyeDx + 11} ${eyeY - 10} M${cx + eyeDx + 13} ${eyeY - 19} L${cx + eyeDx - 11} ${eyeY - 10}" stroke="#2a1d14" stroke-width="5" stroke-linecap="round"/>` : '';
  const mouth = o.mood === 'angry' ? `<path d="M${cx - 11} ${mouthY + 2} Q${cx} ${mouthY - 2} ${cx + 11} ${mouthY + 2}" stroke="#3a2418" stroke-width="3.6" fill="none" stroke-linecap="round"/>`
    : `<path d="M${cx - 10} ${mouthY} H${cx + 10}" stroke="#3a2418" stroke-width="3.6" stroke-linecap="round"/>`;
  return `<svg width="${W * s}" height="${H * s}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
 <defs>
  <clipPath id="${u}c"><path d="${body}"/></clipPath>
  <radialGradient id="${u}skin" cx=".42" cy=".16" r=".55"><stop offset="0" stop-color="${o.skin || '#f8ece2'}"/><stop offset=".7" stop-color="${o.skin2 || '#ecd5c3'}"/><stop offset="1" stop-color="${o.skin3 || '#cfae96'}"/></radialGradient>
  <linearGradient id="${u}vol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".3" stop-color="#fff" stop-opacity=".05"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#140c18" stop-opacity=".42"/></linearGradient>
  <linearGradient id="${u}ao" x1="0" y1="0" x2="0" y2="1"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
  <filter id="${u}sh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="${u}soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.4"/></filter>
  <filter id="${u}fold" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
 </defs>
 <ellipse cx="${cx + 10}" cy="${yb + 2}" rx="${120}" ry="20" fill="#0d0a08" opacity=".45" filter="url(#${u}sh)"/>
 ${o.back ? o.back(C) : ''}
 <g clip-path="url(#${u}c)">
  <rect width="${W}" height="${H}" fill="url(#${u}skin)"/>
  ${o.costume(C)}
  ${o.hairIn ? o.hairIn(C) : ''}
  <rect width="${W}" height="${H}" fill="url(#${u}vol)"/>
  <rect width="${W}" height="${H}" fill="url(#${u}ao)"/>
 </g>
 <path d="${body}" fill="none" stroke="#2a1c12" stroke-width="2.4" stroke-opacity=".55"/>
 ${o.face === false ? '' : `<g class="eyes" style="transform-box:fill-box;transform-origin:center">${eye(cx - eyeDx) + eye(cx + eyeDx)}</g>` + brows + mouth}
 ${o.front ? o.front(C) : ''}
</svg>`;
}

// ───── costume kit (all coordinates in the 260×360 box; body top 40, collar line ≈ 186)
const K = {};
K.grad = (id, a, b, c) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2=".35"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
// velvet robe from the neckline down, with soft vertical folds
K.robe = (C, id, a, b, c, top = 186) => `<defs>${K.grad(C.u + id, a, b, c)}</defs>
 <path d="M0 ${top} Q${C.cx} ${top - 14} ${C.W} ${top} V${C.H} H0 Z" fill="url(#${C.u + id})"/>
 <g filter="url(#${C.u}fold)" opacity=".5"><path d="M70 ${top + 40} Q64 ${top + 100} 72 ${C.H}" stroke="#000" stroke-width="10" opacity=".35"/><path d="M190 ${top + 40} Q196 ${top + 100} 188 ${C.H}" stroke="#000" stroke-width="12" opacity=".4"/>
 <path d="M96 ${top + 30} Q90 ${top + 100} 98 ${C.H}" stroke="#fff" stroke-width="7" opacity=".18"/></g>`;
K.arms = C => `<path d="M${C.x0 + 14} ${C.y0 + 170} Q${C.x0 + 30} ${C.y0 + 232} ${C.x0 + 46} ${C.y0 + 262}" fill="none" stroke="#120c08" stroke-opacity=".55" stroke-width="3.2" stroke-linecap="round"/>
 <path d="M${C.x1 - 14} ${C.y0 + 170} Q${C.x1 - 30} ${C.y0 + 232} ${C.x1 - 46} ${C.y0 + 262}" fill="none" stroke="#120c08" stroke-opacity=".55" stroke-width="3.2" stroke-linecap="round"/>`;
K.ermine = (C, top = 180, h = 30) => `<path d="M0 ${top + 4} Q${C.cx} ${top - 12} ${C.W} ${top + 4} V${top + h} Q${C.cx} ${top + h - 14} 0 ${top + h} Z" fill="#f6f2ea"/>
 <path d="M0 ${top + h} Q${C.cx} ${top + h - 14} ${C.W} ${top + h}" stroke="#cfc6b6" stroke-width="3" fill="none"/>
 ${[40, 78, 116, 154, 192, 228].map((x, k) => `<path d="M${x} ${top + 8 + (k % 2) * 8} q3 7 0 12 q-3 -5 0 -12" fill="#1a1612"/>`).join('')}`;
K.chain = (C, y = 206, sag = 46) => { let d = ''; for (let i = 0; i <= 18; i++) { const t = i / 18, x = 58 + t * 144, yy = y + Math.sin(Math.PI * t) * sag; d += `<circle cx="${x}" cy="${yy}" r="4.6" fill="#e2b84a" stroke="#7d5810" stroke-width="1.2"/><circle cx="${x - 1.4}" cy="${yy - 1.6}" r="1.4" fill="#fff6cf"/>` }
  return d + `<circle cx="${C.cx}" cy="${y + sag + 12}" r="12" fill="#e2b84a" stroke="#7d5810" stroke-width="2"/><circle cx="${C.cx}" cy="${y + sag + 12}" r="6" fill="#b3202a"/><circle cx="${C.cx - 3}" cy="${y + sag + 9}" r="2" fill="#fff" opacity=".7"/>` };
K.crown = (C, y = 2, w = 112, lift = 0) => { const l = C.cx - w / 2, u = C.u;
  return `<defs><linearGradient id="${u}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".35" stop-color="#eebf45"/><stop offset=".75" stop-color="#b98318"/><stop offset="1" stop-color="#7d5410"/></linearGradient></defs>
  <g transform="translate(0 ${lift})">
  <path d="M${l + 8} ${y + 52} Q${C.cx} ${y + 30} ${l + w - 8} ${y + 52} L${l + w - 10} ${y + 34} Q${C.cx} ${y + 16} ${l + 10} ${y + 34} Z" fill="#8f1b26"/>
  <path d="M${l} ${y + 58} L${l - 2} ${y + 22} L${l + w * .18} ${y + 38} L${l + w * .33} ${y + 8} L${C.cx} ${y + 30} L${l + w * .67} ${y + 8} L${l + w * .82} ${y + 38} L${l + w + 2} ${y + 22} L${l + w} ${y + 58} Q${C.cx} ${y + 50} ${l} ${y + 58} Z" fill="url(#${u}gold)" stroke="#6b470c" stroke-width="2" stroke-linejoin="round"/>
  <path d="M${l} ${y + 58} Q${C.cx} ${y + 50} ${l + w} ${y + 58} L${l + w} ${y + 70} Q${C.cx} ${y + 62} ${l} ${y + 70} Z" fill="url(#${u}gold)" stroke="#6b470c" stroke-width="2"/>
  ${[[l + w * .33, y + 8], [l + w * .67, y + 8], [l - 2, y + 22], [l + w + 2, y + 22]].map(([x, yy]) => `<circle cx="${x}" cy="${yy}" r="5" fill="url(#${u}gold)" stroke="#6b470c" stroke-width="1.5"/>`).join('')}
  <ellipse cx="${C.cx}" cy="${y + 64}" rx="7" ry="5" fill="#b3202a"/><ellipse cx="${C.cx - 2}" cy="${y + 62.5}" rx="2.2" ry="1.4" fill="#fff" opacity=".8"/>
  <ellipse cx="${l + 26}" cy="${y + 64}" rx="5" ry="4" fill="#1f5fc4"/><ellipse cx="${l + w - 26}" cy="${y + 64}" rx="5" ry="4" fill="#1f5fc4"/>
  <ellipse cx="${C.cx}" cy="${y + 40}" rx="4" ry="5" fill="#1d8a52"/></g>` };
// hair masses with strand strokes
K.strands = (pts, col, n = 7, w = 2) => [...Array(n)].map((_, k) => { const t = (k + .5) / n, x = pts[0] + (pts[2] - pts[0]) * t;
  return `<path d="M${x} ${pts[1]} Q${x + (t - .5) * 30} ${(pts[1] + pts[3]) / 2} ${x + (t - .5) * 46} ${pts[3]}" stroke="${col}" stroke-width="${w}" fill="none" opacity=".45" stroke-linecap="round"/>` }).join('');

const CAST2 = {
  isabella: s => figure({ skin: '#f9eee5', mood: 'neutral',
    costume: C => `${K.robe(C, 'gw', '#7a1c2c', '#5d1220', '#2f0810', 196)}
      <path d="M70 196 L190 196 L180 232 L80 232 Z" fill="#f4e6cc"/><path d="M70 196 L190 196 L180 232 L80 232 Z" fill="none" stroke="#d9ad46" stroke-width="7"/>
      <path d="M74 200 L186 200" stroke="#fff4cf" stroke-width="2" opacity=".7"/>${K.chain(C, 236, 34)}${K.arms(C)}`,
    hairIn: C => `<path d="M0 0 H260 V150 Q240 80 196 66 Q130 46 64 66 Q20 80 0 150 Z" fill="#7b4a26"/>
      <path d="M64 66 Q130 46 196 66 Q170 60 130 64 Q92 60 64 66 Z" fill="#a8703f"/>
      <path d="M0 140 Q24 200 34 270 L0 290 Z M260 140 Q236 200 226 270 L260 290 Z" fill="#6a3d1d"/>
      <path d="M20 40 Q130 -30 240 40 L250 160 Q240 110 226 96 Q130 70 34 96 Q20 110 10 160 Z" fill="#f2ede4" opacity=".92"/>
      <path d="M34 96 Q130 70 226 96" stroke="#d6cfc2" stroke-width="3" fill="none"/>`,
    front: C => K.crown(C, 0, 108, 6) }, s),
  ferdinand: s => figure({ skin: '#f6e6d8', mood: 'neutral',
    costume: C => `${K.robe(C, 'rb', '#2c3f7a', '#1e2c5a', '#0c1430', 186)}${K.ermine(C, 178, 34)}
      <path d="M118 212 V340 M142 212 V340" stroke="#d9ad46" stroke-width="4"/>${K.chain(C, 214, 50)}${K.arms(C)}`,
    hairIn: C => `<path d="M0 0 H260 V158 Q244 86 200 72 Q130 52 60 72 Q16 86 0 158 Z" fill="#3b2516"/>
      <path d="M0 120 H52 Q50 160 56 186 L0 190 Z M260 120 H208 Q210 160 204 186 L260 190 Z" fill="#3b2516"/>
      <path d="M60 72 Q130 52 200 72" stroke="#5c3a22" stroke-width="5" fill="none"/>`,
    front: C => K.crown(C, 0, 112, 8) }, s),
  joao: s => figure({ skin: '#f3e1d1', mood: 'angry',
    costume: C => `${K.robe(C, 'jr', '#1f5a3e', '#14412b', '#081c12', 186)}${K.ermine(C, 180, 30)}
      <path d="M100 212 Q130 226 160 212 V340 H100 Z" fill="#2a2016"/><path d="M100 212 Q130 226 160 212" stroke="#d9ad46" stroke-width="3" fill="none"/>
      ${K.chain(C, 216, 44)}${K.arms(C)}`,
    hairIn: C => `<path d="M0 0 H260 V150 Q240 86 198 72 Q130 54 62 72 Q20 86 0 150 Z" fill="#241710"/>${K.strands([50, 20, 210, 66], '#0d0805', 8)}`,
    front: C => `<path d="M${C.cx - 58} ${C.y0 + 130} Q${C.cx - 56} ${C.y0 + 196} ${C.cx} ${C.y0 + 214} Q${C.cx + 56} ${C.y0 + 196} ${C.cx + 58} ${C.y0 + 130} Q${C.cx + 40} ${C.y0 + 146} ${C.cx + 16} ${C.y0 + 142} Q${C.cx} ${C.y0 + 150} ${C.cx - 16} ${C.y0 + 142} Q${C.cx - 40} ${C.y0 + 146} ${C.cx - 58} ${C.y0 + 130} Z" fill="#241710"/>
      ${K.strands([C.cx - 46, C.y0 + 150, C.cx + 46, C.y0 + 206], '#0a0604', 7, 1.6)}
      <path d="M${C.cx - 26} ${C.y0 + 134} Q${C.cx} ${C.y0 + 126} ${C.cx + 26} ${C.y0 + 134}" stroke="#241710" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M${C.cx - 11} ${C.y0 + 152} Q${C.cx} ${C.y0 + 147} ${C.cx + 11} ${C.y0 + 152}" stroke="#d9b9a2" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      ${K.crown(C, 0, 108, 6)}`, face: true }, s),
  pope: s => figure({ skin: '#f8ebe0', mood: 'neutral',
    costume: C => `<rect y="196" width="260" height="180" fill="#f5f3ee"/><path d="M0 196 Q130 180 260 196 V266 Q130 286 0 266 Z" fill="#a51c26"/>${K.ermine(C, 260, 22)}
      <path d="M130 282 V340" stroke="#d9ad46" stroke-width="12"/><path d="M110 304 H150" stroke="#d9ad46" stroke-width="10"/>${K.arms(C)}`,
    hairIn: C => `<path d="M0 120 Q14 170 40 190 L0 200 Z M260 120 Q246 170 220 190 L260 200 Z" fill="#e9e4dc"/>`,
    front: C => `<path d="M${C.cx - 92} ${C.y0 + 46} Q${C.cx} ${C.y0 - 40} ${C.cx + 92} ${C.y0 + 46} Q${C.cx} ${C.y0 + 22} ${C.cx - 92} ${C.y0 + 46} Z" fill="#a51c26"/>
      <path d="M${C.cx - 96} ${C.y0 + 46} Q${C.cx} ${C.y0 + 22} ${C.cx + 96} ${C.y0 + 46} L${C.cx + 96} ${C.y0 + 58} Q${C.cx} ${C.y0 + 34} ${C.cx - 96} ${C.y0 + 58} Z" fill="#f6f2ea"/>` }, s),
};

// ───── props
const PROP = {};
// wooden easel with a framed map (img url + background position), legs and a shelf
PROP.easel = (img, bx, by, scale = 1, bgW = 1080 * scale * .9) => `<div style="position:relative;width:${560 * scale}px;height:${720 * scale}px">
 <svg width="${560 * scale}" height="${720 * scale}" viewBox="0 0 560 720" style="position:absolute;left:0;top:0;overflow:visible">
  <defs><linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a32"/><stop offset=".5" stop-color="#a87444"/><stop offset="1" stop-color="#6a4224"/></linearGradient>
  <filter id="es" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>
  <ellipse cx="280" cy="706" rx="250" ry="22" fill="#0d0a08" opacity=".35" filter="url(#es)"/>
  <path d="M140 300 L80 700 M420 300 L480 700 M280 380 L280 690" stroke="url(#wood)" stroke-width="20" stroke-linecap="round"/>
  <rect x="60" y="474" width="440" height="26" rx="6" fill="url(#wood)"/>
  <rect x="96" y="440" width="60" height="34" rx="4" fill="#5a3a20"/><rect x="164" y="430" width="44" height="44" rx="4" fill="#7a5530"/><rect x="216" y="448" width="70" height="26" rx="4" fill="#4a2f1a"/>
  <path d="M320 470 q40 -26 90 -8 l-6 10 q-44 -14 -80 6 Z" fill="#efe2c2" stroke="#b9a274" stroke-width="2"/>
  <rect x="10" y="0" width="540" height="410" rx="10" fill="url(#wood)"/>
 </svg>
 <div style="position:absolute;left:${30 * scale}px;top:${20 * scale}px;width:${500 * scale}px;height:${370 * scale}px;border-radius:4px;background:url(${img}) ${bx}px ${by}px / ${bgW}px auto;box-shadow:inset 0 0 ${30 * scale}px rgba(60,40,10,.45)"></div>
</div>`;
