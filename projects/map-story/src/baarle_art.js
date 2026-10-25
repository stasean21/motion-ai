// Baarle: brick facade whose window and door swap (m: 0 → door on the right/NL side, 1 → door on the left/BE side),
// pavement border marks as in Baarle (white crosses, B | NL), the resident, flags.
const BE = '#f08a24', NL = '#17a2a6';
function facade(m = 0, o = {}) {
  const W = 900, H = 980, top = 300, A = [170, 390], B = [510, 730], GY = 800;
  const lerp = (a, b, t) => a + (b - a) * t, cl = v => Math.max(0, Math.min(1, v)), ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const mA = ease(cl(m * 2)), mB = ease(cl(m * 2 - 1));          // step 1: window → door on the left; step 2: door → window on the right
  const slot = (x0, x1, doorness, id) => {
    const h = lerp(260, 500, doorness), y1 = top + h, w = x1 - x0;
    const win = `<g opacity="${1 - doorness}">
      <rect x="${x0 + 14}" y="${top + 14}" width="${w - 28}" height="${h - 28}" fill="url(#glass)"/>
      <path d="M${x0 + 14} ${top + 14} L${x0 + w * .55} ${top + 14} L${x0 + 14} ${top + h * .55} Z" fill="#fff" opacity=".18"/>
      <rect x="${x0 + w / 2 - 5}" y="${top + 14}" width="10" height="${h - 28}" fill="#f4f1ea"/><rect x="${x0 + 14}" y="${top + h * .42}" width="${w - 28}" height="10" fill="#f4f1ea"/>
      <path d="M${x0 + 18} ${top + 18} Q${x0 + 40} ${top + h * .5} ${x0 + 30} ${y1 - 18} L${x0 + 18} ${y1 - 18} Z" fill="#efe6d4" opacity=".9"/>
      <path d="M${x1 - 18} ${top + 18} Q${x1 - 40} ${top + h * .5} ${x1 - 30} ${y1 - 18} L${x1 - 18} ${y1 - 18} Z" fill="#efe6d4" opacity=".9"/>
      <rect x="${x0 - 14}" y="${y1}" width="${w + 28}" height="20" rx="3" fill="#e9e4da" stroke="#b9b1a2" stroke-width="2"/></g>`;
    const door = `<g opacity="${doorness}">
      <rect x="${x0 + 14}" y="${top + 14}" width="${w - 28}" height="${h - 14}" fill="url(#doorW)"/>
      <rect x="${x0 + 30}" y="${top + 30}" width="${w - 60}" height="${70}" rx="6" fill="url(#glass)"/>
      <rect x="${x0 + 34}" y="${top + 124}" width="${(w - 82) / 2}" height="${(h - 180) / 2}" rx="5" fill="none" stroke="#123a3d" stroke-opacity=".45" stroke-width="4"/>
      <rect x="${x0 + 48 + (w - 82) / 2}" y="${top + 124}" width="${(w - 82) / 2}" height="${(h - 180) / 2}" rx="5" fill="none" stroke="#123a3d" stroke-opacity=".45" stroke-width="4"/>
      <rect x="${x0 + 34}" y="${top + 140 + (h - 180) / 2}" width="${(w - 82) / 2}" height="${(h - 180) / 2 - 20}" rx="5" fill="none" stroke="#123a3d" stroke-opacity=".45" stroke-width="4"/>
      <rect x="${x0 + 48 + (w - 82) / 2}" y="${top + 140 + (h - 180) / 2}" width="${(w - 82) / 2}" height="${(h - 180) / 2 - 20}" rx="5" fill="none" stroke="#123a3d" stroke-opacity=".45" stroke-width="4"/>
      <circle cx="${x1 - 40}" cy="${top + h * .56}" r="10" fill="url(#brass)" stroke="#6b4a12" stroke-width="2"/><rect x="${x0 + w / 2 - 26}" y="${top + h * .4}" width="52" height="12" rx="3" fill="url(#brass)"/>
      <rect x="${x0 - 20}" y="${GY}" width="${w + 40}" height="26" rx="3" fill="#cfc9bd" stroke="#9f978a" stroke-width="2"/></g>`;
    const hl = o.hl === id ? `<g opacity="${o.hlOp ?? 1}"><rect x="${x0 - 10}" y="${top - 10}" width="${w + 20}" height="${h + 20}" rx="14" fill="none" stroke="#2f7bf5" stroke-width="8"/><rect x="${x0 - 22}" y="${top - 22}" width="${w + 44}" height="${h + 44}" rx="22" fill="none" stroke="#2f7bf5" stroke-width="3" opacity=".45"/></g>` : '';
    return `<rect x="${x0}" y="${top}" width="${w}" height="${h}" fill="#f4f1ea" stroke="#d8d1c3" stroke-width="2"/>
      <rect x="${x0 - 12}" y="${top - 26}" width="${w + 24}" height="26" fill="#e9e4da" stroke="#b9b1a2" stroke-width="2"/>${win}${door}${hl}`;
  };
  const arrows = o.arrows ? `<g opacity="${o.arrows}" stroke="#2f7bf5" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M300 236 Q450 150 600 236"/><path d="M584 206 L604 238 L568 248"/><path d="M316 206 L296 238 L332 248"/></g>` : '';
  return `<svg width="${W * (o.s || 1)}" height="${H * (o.s || 1)}" viewBox="0 0 ${W} ${H}" style="overflow:visible">
  <defs>
   <pattern id="brick" width="60" height="32" patternUnits="userSpaceOnUse"><rect width="60" height="32" fill="#c9cdd6"/>
    <rect x="2" y="2" width="56" height="12" rx="1.5" fill="#a9583b"/><rect x="-28" y="18" width="56" height="12" rx="1.5" fill="#b8643f"/><rect x="32" y="18" width="56" height="12" rx="1.5" fill="#9c4f35"/></pattern>
   <linearGradient id="wallShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
   <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe3f2"/><stop offset=".5" stop-color="#8fb3cc"/><stop offset="1" stop-color="#5d7f99"/></linearGradient>
   <linearGradient id="doorW" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a6e72"/><stop offset=".5" stop-color="#1f5a5e"/><stop offset="1" stop-color="#143f42"/></linearGradient>
   <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#d9a520"/><stop offset="1" stop-color="#7d5410"/></linearGradient>
   <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4f5c"/><stop offset="1" stop-color="#2c303a"/></linearGradient>
   <filter id="fsh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
  </defs>
  <rect x="20" y="${GY + 40}" width="860" height="40" fill="#000" opacity=".25" filter="url(#fsh)"/>
  <rect x="-200" y="90" width="190" height="740" fill="#e7e1d6"/><rect x="910" y="70" width="200" height="760" fill="#8d9aa8"/><rect x="940" y="300" width="120" height="200" fill="url(#glass)" stroke="#f4f1ea" stroke-width="12"/><rect x="-170" y="300" width="130" height="200" fill="url(#glass)" stroke="#f4f1ea" stroke-width="12"/>
  <path d="M-10 140 L450 20 L910 140 Z" fill="url(#roof)"/><path d="M-10 140 L450 20 L910 140" fill="none" stroke="#1d2027" stroke-width="6"/>
  
  <rect x="0" y="140" width="${W}" height="${GY - 140 + 26}" fill="url(#brick)"/><rect x="0" y="140" width="${W}" height="${GY - 140 + 26}" fill="url(#wallShade)"/>
  <rect x="0" y="140" width="450" height="${GY - 114}" fill="${BE}" opacity="${o.tint ?? .12}"/><rect x="450" y="140" width="450" height="${GY - 114}" fill="${NL}" opacity="${o.tint ?? .12}"/>
  <rect x="-6" y="132" width="912" height="16" fill="#e9e4da"/>
  ${slot(A[0], A[1], mA, 'A')}${slot(B[0], B[1], 1 - mB, 'B')}
  <path d="M430 236 h40 l-6 34 h-28 Z" fill="#2c303a"/><circle cx="450" cy="262" r="9" fill="#ffe7a6"/><path d="M450 214 V236" stroke="#2c303a" stroke-width="4"/>
  <!-- pavement with the real-world Baarle border marking: white crosses, B | NL -->
  <rect x="-200" y="${GY + 26}" width="1300" height="600" fill="#d9d6cf"/>${[...Array(22)].map((_, k) => `<path d="M${-200 + k * 60} ${GY + 26} V${GY + 626}" stroke="#bcb8af" stroke-width="2"/>`).join('')}${[1,2,3,4,5,6,7].map(k=>`<path d="M-200 ${GY + 26 + k * 74} H1100" stroke="#bcb8af" stroke-width="2"/>`).join('')}
  <path d="M-90 ${GY + 100} H990" stroke="#bcb8af" stroke-width="2"/>
  <path d="M450 ${GY + 26} V${GY + 626}" stroke="#fff" stroke-width="10"/>${[0, 1, 2, 3].map(k => `<path d="M${438} ${GY + 40 + k * 36} l24 20 m0 -20 l-24 20" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`).join('')}
 ${o.marks === false ? '' : `<text x="380" y="${GY + 150}" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="48" fill="#fff">B</text>
  <text x="530" y="${GY + 150}" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="48" fill="#fff">NL</text>`}
  <!-- border line through the building -->
  ${o.line === false || (o.lineP ?? 1) <= 0 ? '' : (() => { const y0 = o.lineTop ?? 140, y1 = y0 + (GY + 26 - y0) * (o.lineP ?? 1); return `<path d="M450 ${y0} V${y1}" stroke="#fff" stroke-width="12" opacity=".7"/><path d="M450 ${y0} V${y1}" stroke="#111218" stroke-width="5" stroke-dasharray="18 12"/>` + (o.lineGlow ? `<path d="M450 ${y0} V${y1}" stroke="#2f7bf5" stroke-width="16" opacity="${o.lineGlow * .55}"/>` : '') })()}
  ${o.houseGlow ? `<path d="M-6 826 V140 L450 20 L906 140 V826 Z" fill="none" stroke="#2f7bf5" stroke-width="10" stroke-linejoin="round" opacity="${o.houseGlow}"/>` : ''}
  ${arrows}
 </svg>`;
}
const FLAG = {
  BE: (s = 1) => `<svg width="${60 * s}" height="${44 * s}" viewBox="0 0 60 44"><rect width="20" height="44" fill="#1d1d1b"/><rect x="20" width="20" height="44" fill="#fdda24"/><rect x="40" width="20" height="44" fill="#ef3340"/><rect width="60" height="44" fill="none" stroke="#000" stroke-opacity=".12"/></svg>`,
  NL: (s = 1) => `<svg width="${60 * s}" height="${44 * s}" viewBox="0 0 60 44"><rect width="60" height="15" fill="#ae1c28"/><rect y="15" width="60" height="14" fill="#fff"/><rect y="29" width="60" height="15" fill="#21468b"/><rect width="60" height="44" fill="none" stroke="#000" stroke-opacity=".12"/></svg>`,
};
// resident: elderly lady in the painted peg style
const RESIDENT = s => figure({ skin: '#f8ebe0', mood: 'happy',
  costume: C => `${K.robe(C, 'cd', '#9b8fc4', '#7d70a8', '#4c4270', 192)}<path d="M${C.cx - 40} 192 L${C.cx} 250 L${C.cx + 40} 192" fill="#f3efe6"/>
    ${[0, 1, 2, 3].map(k => `<circle cx="${C.cx}" cy="${262 + k * 22}" r="5" fill="#f3efe6" stroke="#6a5f8f"/>`).join('')}
    ${[...Array(11)].map((_, k) => { const t = k / 10, x = C.cx - 44 + t * 88, y = 198 + Math.sin(Math.PI * t) * 30; return `<circle cx="${x}" cy="${y}" r="4.2" fill="#fbf7ef" stroke="#cfc6b6"/>` }).join('')}${K.arms(C)}`,
  hairIn: C => `<path d="M0 0 H260 V150 Q244 84 200 70 Q130 50 60 70 Q16 84 0 150 Z" fill="#d9d6d0"/>${K.strands([50, 20, 210, 68], '#a9a59d', 8)}`,
  front: C => `<ellipse cx="${C.cx}" cy="${C.y0 - 6}" rx="38" ry="30" fill="#d9d6d0" stroke="#b5b0a7" stroke-width="2"/>${K.strands([C.cx - 30, C.y0 - 30, C.cx + 30, C.y0 + 16], '#a9a59d', 5)}
    <g fill="none" stroke="#6b5a48" stroke-width="3"><circle cx="${C.cx - 36}" cy="${C.y0 + 104}" r="17"/><circle cx="${C.cx + 36}" cy="${C.y0 + 104}" r="17"/><path d="M${C.cx - 19} ${C.y0 + 102} Q${C.cx} ${C.y0 + 96} ${C.cx + 19} ${C.y0 + 102}"/></g>` }, s);
