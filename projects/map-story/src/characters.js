// Peg-doll characters: one capsule body, dot eyes, costume painted on; lit from top-left, soft contact shadow.
// peg(opts) → SVG string, box 200×320 (body 170×270 at x 15, y 30); scale with s.
let PEG_N = 0;
function peg(o, s = 1) {
  const id = 'pg' + (PEG_N++), W = 200, H = 320, x0 = 15, y0 = 30, bw = 170, bh = 270;
  const body = `M${x0} ${y0 + 85} A85 85 0 0 1 ${x0 + bw} ${y0 + 85} L${x0 + bw} ${y0 + bh - 26} Q${x0 + bw} ${y0 + bh} ${x0 + bw - 26} ${y0 + bh} L${x0 + 26} ${y0 + bh} Q${x0} ${y0 + bh} ${x0} ${y0 + bh - 26} Z`;
  const ex = [x0 + 58, x0 + 112], ey = y0 + 92 + (o.eyeY || 0);
  const brow = o.mood === 'angry' ? `<path d="M${ex[0] - 14} ${ey - 22} L${ex[0] + 10} ${ey - 13} M${ex[1] + 14} ${ey - 22} L${ex[1] - 10} ${ey - 13}" stroke="#1d1712" stroke-width="5" stroke-linecap="round"/>`
    : o.mood === 'happy' ? `<path d="M${ex[0] - 11} ${ey - 20} Q${ex[0]} ${ey - 27} ${ex[0] + 11} ${ey - 20} M${ex[1] - 11} ${ey - 20} Q${ex[1]} ${ey - 27} ${ex[1] + 11} ${ey - 20}" stroke="#1d1712" stroke-width="4" fill="none" stroke-linecap="round"/>` : '';
  const eyes = o.mood === 'happy'
    ? ex.map(x => `<path d="M${x - 9} ${ey + 2} Q${x} ${ey - 9} ${x + 9} ${ey + 2}" stroke="#1d1712" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')
    : ex.map(x => `<ellipse cx="${x}" cy="${ey}" rx="6.5" ry="${o.mood === 'angry' ? 5.5 : 8}" fill="#1d1712"/><circle cx="${x - 2}" cy="${ey - 3}" r="2" fill="#fff" opacity=".9"/>`).join('');
  const my = ey + 30;
  const mouth = o.mood === 'happy' ? `<path d="M${x0 + 72} ${my - 2} Q${x0 + 85} ${my + 12} ${x0 + 98} ${my - 2}" fill="#7a2f22" stroke="#1d1712" stroke-width="3"/>`
    : o.mood === 'angry' ? `<path d="M${x0 + 74} ${my + 4} Q${x0 + 85} ${my - 3} ${x0 + 96} ${my + 4}" stroke="#1d1712" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M${x0 + 76} ${my} H${x0 + 94}" stroke="#1d1712" stroke-width="4" stroke-linecap="round"/>`;
  const blush = `<ellipse cx="${ex[0] - 10}" cy="${ey + 22}" rx="12" ry="7" fill="#f08a7a" opacity=".28"/><ellipse cx="${ex[1] + 10}" cy="${ey + 22}" rx="12" ry="7" fill="#f08a7a" opacity=".28"/>`;
  const C = { x0, y0, bw, bh, cx: x0 + bw / 2 };
  return `<svg width="${W * s}" height="${H * s}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
  <defs>
   <clipPath id="${id}c"><path d="${body}"/></clipPath>
   <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2=".25"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1a1020" stop-opacity=".34"/></linearGradient>
   <radialGradient id="${id}h" cx=".32" cy=".18" r=".35"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
   <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
  </defs>
  <ellipse cx="${C.cx + 6}" cy="${y0 + bh + 4}" rx="${bw * .62}" ry="16" fill="#0b1420" opacity=".42" filter="url(#${id}b)"/>
  ${o.back ? o.back(C) : ''}
  <g clip-path="url(#${id}c)">
   <rect x="0" y="0" width="${W}" height="${H}" fill="${o.skin || '#f6dcc4'}"/>
   <g transform="translate(0 38)">${o.outfit(C)}</g>
   ${o.hair ? o.hair(C) : ''}
   <rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}l)"/>
   <rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}h)"/>
  </g>
  <path d="${body}" fill="none" stroke="#1d1712" stroke-width="2.5" opacity=".35"/>
  ${o.face !== false ? blush + brow + eyes + mouth : ''}
  ${o.front ? o.front(C) : ''}
 </svg>`;
}

// costume pieces
const P = {};
P.coat = (c, col, y = 150, lapel = '#000') => `<path d="M0 ${y} Q${c.cx} ${y - 18} 200 ${y} V320 H0 Z" fill="${col}"/>
  <path d="M${c.cx - 34} ${y - 12} L${c.cx} ${y + 70} L${c.cx + 34} ${y - 12}" fill="none" stroke="${lapel}" stroke-opacity=".25" stroke-width="3"/>`;
P.arms = (c, col) => `<path d="M${c.x0 + 6} ${c.y0 + 160} Q${c.x0 + 22} ${c.y0 + 215} ${c.x0 + 30} ${c.y0 + 240}" fill="none" stroke="#1d1712" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>
  <path d="M${c.x0 + c.bw - 6} ${c.y0 + 160} Q${c.x0 + c.bw - 22} ${c.y0 + 215} ${c.x0 + c.bw - 30} ${c.y0 + 240}" fill="none" stroke="#1d1712" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
P.buttons = (c, y, n, col = '#d8b24a') => [...Array(n)].map((_, k) => `<circle cx="${c.cx}" cy="${y + k * 24}" r="4.5" fill="${col}" stroke="#7a5a12" stroke-width="1"/>`).join('');
P.crown = (c, y = 18, w = 92) => { const l = c.cx - w / 2; return `<g transform="translate(0 0)">
  <path d="M${l} ${y + 44} L${l - 4} ${y + 6} L${l + w * .22} ${y + 26} L${c.cx} ${y - 4} L${l + w * .78} ${y + 26} L${l + w + 4} ${y + 6} L${l + w} ${y + 44} Z" fill="#f2c23a" stroke="#8a6410" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="${l}" y="${y + 36}" width="${w}" height="12" rx="3" fill="#d9a520" stroke="#8a6410" stroke-width="2"/>
  <circle cx="${c.cx}" cy="${y + 42}" r="5" fill="#c4342d"/><circle cx="${l + 18}" cy="${y + 42}" r="4" fill="#2f7bf5"/><circle cx="${l + w - 18}" cy="${y + 42}" r="4" fill="#2f7bf5"/>
  <circle cx="${c.cx}" cy="${y - 6}" r="5" fill="#f2c23a" stroke="#8a6410" stroke-width="2"/></g>` };

// cast
const CAST = {
  isabella: s => peg({ skin: '#f7dfca', mood: 'neutral',
    outfit: c => `${P.coat(c, '#7b1e2b', 156)}<path d="M${c.cx - 46} 156 Q${c.cx} 196 ${c.cx + 46} 156" fill="#f3e3c3" stroke="#c9a86a" stroke-width="2"/>
      <path d="M${c.cx - 46} 156 Q${c.cx} 196 ${c.cx + 46} 156" fill="none" stroke="#d8b24a" stroke-width="4" stroke-dasharray="3 6"/>
      <circle cx="${c.cx}" cy="196" r="8" fill="#d8b24a" stroke="#7a5a12"/>${P.arms(c)}`,
    hair: c => `<path d="M0 0 H200 V112 Q186 64 150 52 Q100 40 50 52 Q14 64 0 112 Z" fill="#8a4f24"/>
      <path d="M0 96 Q16 150 26 210 L0 230 Z M200 96 Q184 150 174 210 L200 230 Z" fill="#8a4f24"/>`,
    front: c => P.crown(c, 6, 88) }, s),
  ferdinand: s => peg({ skin: '#f2d2b6', mood: 'neutral',
    outfit: c => `${P.coat(c, '#22325e', 150)}<path d="M${c.cx - 52} 146 L${c.cx + 52} 146 L${c.cx + 44} 166 L${c.cx - 44} 166 Z" fill="#d8b24a"/>
      <path d="M${c.cx - 60} 186 L${c.cx + 60} 270" stroke="#c4342d" stroke-width="16"/>${P.buttons(c, 196, 4)}${P.arms(c)}`,
    hair: c => `<path d="M0 0 H200 V122 Q190 70 160 58 Q100 44 40 58 Q10 70 0 122 Z" fill="#3a2414"/><path d="M0 110 H38 V150 H0 Z M200 110 H162 V150 H200 Z" fill="#3a2414"/>`,
    front: c => P.crown(c, 4, 96) }, s),
  joao: s => peg({ skin: '#f0cfb0', mood: 'angry',
    outfit: c => `${P.coat(c, '#0f5e3a', 150)}<path d="M${c.cx - 70} 150 Q${c.cx} 170 ${c.cx + 70} 150 L${c.cx + 70} 166 Q${c.cx} 186 ${c.cx - 70} 166 Z" fill="#f2f0e8"/>
      ${P.buttons(c, 194, 4)}<rect x="0" y="246" width="200" height="12" fill="#d8b24a"/>${P.arms(c)}`,
    hair: c => `<path d="M0 0 H200 V112 Q188 66 158 56 Q100 44 42 56 Q12 66 0 112 Z" fill="#2b1a10"/>`,
    front: c => `<path d="M${c.cx - 46} ${c.y0 + 126} Q${c.cx - 40} ${c.y0 + 168} ${c.cx} ${c.y0 + 178} Q${c.cx + 40} ${c.y0 + 168} ${c.cx + 46} ${c.y0 + 126} Q${c.cx + 30} ${c.y0 + 140} ${c.cx + 16} ${c.y0 + 134} Q${c.cx} ${c.y0 + 128} ${c.cx - 16} ${c.y0 + 134} Q${c.cx - 30} ${c.y0 + 140} ${c.cx - 46} ${c.y0 + 126} Z" fill="#2b1a10"/>
      ${P.crown(c, 2, 90)}` , eyeY: -4 }, s),
  pope: s => peg({ skin: '#f5d8c0', mood: 'neutral',
    outfit: c => `<rect x="0" y="150" width="200" height="170" fill="#f6f4ee"/><path d="M0 146 Q${c.cx} 128 200 146 V214 Q${c.cx} 232 0 214 Z" fill="#b3202a"/>
      <path d="M${c.cx} 214 V300" stroke="#d8b24a" stroke-width="10"/><path d="M${c.cx - 16} 238 H${c.cx + 16}" stroke="#d8b24a" stroke-width="10"/>
      <path d="M${c.cx - 8} 150 V214" stroke="#fff" stroke-width="2" opacity=".5"/>${P.arms(c)}`,
    hair: c => `<path d="M30 70 Q${c.cx} 30 170 70 Q${c.cx} 56 30 70 Z" fill="#b3202a"/><path d="M0 92 Q8 130 24 150 L0 160 Z M200 92 Q192 130 176 150 L200 160 Z" fill="#e8e6df"/>`,
    front: c => `<path d="M${c.cx - 30} ${c.y0 - 26} Q${c.cx} ${c.y0 - 62} ${c.cx + 30} ${c.y0 - 26} L${c.cx + 34} ${c.y0 + 18} Q${c.cx} ${c.y0 + 8} ${c.cx - 34} ${c.y0 + 18} Z" fill="#fbfaf6" stroke="#c9a86a" stroke-width="2.5"/>
      <path d="M${c.cx} ${c.y0 - 50} V${c.y0 + 10} M${c.cx - 12} ${c.y0 - 24} H${c.cx + 12}" stroke="#d8b24a" stroke-width="5"/>
      <path d="M${c.cx - 34} ${c.y0 + 18} Q${c.cx} ${c.y0 + 8} ${c.cx + 34} ${c.y0 + 18}" stroke="#d8b24a" stroke-width="5" fill="none"/>` }, s),
  gama: s => peg({ skin: '#eec8a6', mood: 'neutral',
    outfit: c => `${P.coat(c, '#1d1f26', 150)}<path d="M${c.cx - 56} 160 Q${c.cx} 228 ${c.cx + 56} 160" fill="none" stroke="#d8b24a" stroke-width="5"/>
      <circle cx="${c.cx}" cy="212" r="10" fill="#d8b24a" stroke="#7a5a12" stroke-width="2"/><path d="M${c.cx - 6} 212 h12 M${c.cx} 206 v12" stroke="#c4342d" stroke-width="3"/>${P.arms(c)}`,
    hair: c => `<path d="M0 0 H200 V112 Q188 70 158 60 Q100 50 42 60 Q12 70 0 112 Z" fill="#4a3120"/>`,
    front: c => `<path d="M${c.cx - 50} ${c.y0 + 124} Q${c.cx - 46} ${c.y0 + 190} ${c.cx} ${c.y0 + 212} Q${c.cx + 46} ${c.y0 + 190} ${c.cx + 50} ${c.y0 + 124} Q${c.cx + 26} ${c.y0 + 142} ${c.cx} ${c.y0 + 134} Q${c.cx - 26} ${c.y0 + 142} ${c.cx - 50} ${c.y0 + 124} Z" fill="#4a3120"/>
      <path d="M${c.x0 - 14} ${c.y0 + 30} Q${c.cx} ${c.y0 - 36} ${c.x0 + c.bw + 14} ${c.y0 + 30} Q${c.cx} ${c.y0 + 10} ${c.x0 - 14} ${c.y0 + 30} Z" fill="#17181d"/>
      <path d="M${c.cx - 46} ${c.y0 + 8} Q${c.cx} ${c.y0 - 30} ${c.cx + 46} ${c.y0 + 8}" fill="#17181d"/>
      <path d="M${c.cx + 30} ${c.y0 - 10} Q${c.cx + 70} ${c.y0 - 60} ${c.cx + 92} ${c.y0 - 40} Q${c.cx + 64} ${c.y0 - 30} ${c.cx + 40} ${c.y0 + 2}" fill="#f2efe6" stroke="#c9c3b3" stroke-width="1.5"/>
      <g transform="translate(${c.x0 + c.bw - 16} ${c.y0 + 168}) rotate(-28)"><rect x="0" y="-9" width="96" height="18" rx="4" fill="#b8862e" stroke="#6b4a12" stroke-width="2"/><rect x="66" y="-12" width="34" height="24" rx="4" fill="#d9a520" stroke="#6b4a12" stroke-width="2"/><rect x="-6" y="-7" width="10" height="14" rx="2" fill="#2a2a2a"/></g>`, eyeY: -2 }, s),
  brazil: s => peg({ skin: '#c98d62', mood: 'happy',
    outfit: c => `<rect x="0" y="150" width="200" height="170" fill="#ffd21a"/><path d="M${c.cx - 34} 146 L${c.cx} 182 L${c.cx + 34} 146" fill="none" stroke="#139a43" stroke-width="12"/>
      <rect x="0" y="146" width="200" height="8" fill="#139a43"/><circle cx="${c.cx + 40}" cy="206" r="13" fill="#1d4fb8"/><path d="M0 274 H200" stroke="#139a43" stroke-width="6"/>${P.arms(c)}`,
    hair: c => `<path d="M0 0 H200 V100 Q190 60 160 52 Q100 40 40 52 Q10 60 0 100 Z" fill="#1d130c"/>` }, s),
  argentina: s => peg({ skin: '#f0cdb0', mood: 'happy',
    outfit: c => `<rect x="0" y="150" width="200" height="170" fill="#fff"/>${[0, 1, 2].map(k => `<rect x="${32 + k * 52}" y="150" width="24" height="170" fill="#74b8ec"/>`).join('')}
      <path d="M${c.cx - 30} 146 Q${c.cx} 170 ${c.cx + 30} 146" fill="none" stroke="#1d2a55" stroke-width="8"/>${P.arms(c)}`,
    hair: c => `<path d="M0 0 H200 V104 Q192 60 160 50 Q120 30 70 46 Q30 40 12 70 Q4 84 0 104 Z" fill="#6b4222"/>` }, s),
};

// speech bubble in house style
const bubble = (text, tail = 'left', col = '#111218') => `<div style="position:relative;display:inline-block;padding:18px 34px;border-radius:34px;background:#fff;font-weight:900;font-size:56px;letter-spacing:-.03em;color:${col};box-shadow:0 18px 36px -16px rgba(10,20,40,.55)">${text}
  <svg width="40" height="34" style="position:absolute;${tail === 'left' ? 'left:34px' : 'right:34px'};bottom:-26px"><path d="M0 0 H40 L${tail === 'left' ? 6 : 34} 32 Z" fill="#fff"/></svg></div>`;
