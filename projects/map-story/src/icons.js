// Detailed SVG icons for the map story (house style: clean, lit from top-left, soft contact shadows).
const ICON = {};

// caravel facing right, Order of Christ crosses on the sails; wake drawn separately so it can trail
ICON.caravel = (s = 1) => `
<svg width="${240 * s}" height="${230 * s}" viewBox="0 0 240 230" style="overflow:visible">
 <defs>
  <linearGradient id="cvHull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9b6638"/><stop offset=".55" stop-color="#6e4322"/><stop offset="1" stop-color="#3f2410"/></linearGradient>
  <linearGradient id="cvSail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fffaf0"/><stop offset=".65" stop-color="#f1e6cc"/><stop offset="1" stop-color="#cdbb93"/></linearGradient>
  <linearGradient id="cvSail2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#d6c59f"/></linearGradient>
  <filter id="cvSh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
 </defs>
 <ellipse cx="122" cy="206" rx="92" ry="11" fill="#0b1e2c" opacity=".38" filter="url(#cvSh)"/>
 <!-- masts -->
 <rect x="73" y="38" width="5" height="150" rx="2" fill="#5a3518"/><rect x="124" y="14" width="6" height="176" rx="2" fill="#5a3518"/><rect x="172" y="52" width="5" height="134" rx="2" fill="#5a3518"/>
 <path d="M178 150 L232 118" stroke="#5a3518" stroke-width="4" stroke-linecap="round"/>
 <!-- lateen (stern) sail -->
 <path d="M48 150 L80 34 Q98 92 104 146 Z" fill="url(#cvSail2)" stroke="#bfa979" stroke-width="1.5"/>
 <path d="M80 34 Q98 92 104 146" fill="none" stroke="#a88f5f" stroke-width="1.2" opacity=".6"/>
 <!-- main square sail, bellied -->
 <path d="M92 40 Q127 30 162 40 Q170 88 160 134 Q127 144 94 134 Q84 88 92 40 Z" fill="url(#cvSail)" stroke="#bfa979" stroke-width="1.5"/>
 <path d="M96 62 Q127 54 158 62 M95 90 Q127 82 160 90 M95 116 Q127 108 159 116" fill="none" stroke="#b9a273" stroke-width="1" opacity=".5"/>
 <path d="M127 66 v52 M103 90 h48" stroke="#c4342d" stroke-width="12" stroke-linecap="butt"/>
 <path d="M127 66 v52 M103 90 h48" stroke="#fff6e6" stroke-width="3"/>
 <!-- fore sail -->
 <path d="M150 66 Q174 60 196 66 Q200 98 194 126 Q173 132 152 126 Q146 96 150 66 Z" fill="url(#cvSail)" stroke="#bfa979" stroke-width="1.5"/>
 <path d="M173 78 v36 M158 96 h30" stroke="#c4342d" stroke-width="9"/><path d="M173 78 v36 M158 96 h30" stroke="#fff6e6" stroke-width="2.4"/>
 <!-- pennant -->
 <path d="M130 16 Q148 10 166 18 Q148 22 130 28 Z" fill="#c4342d"/>
 <!-- hull: raised stern castle left, forecastle right -->
 <path d="M20 150 L58 146 L58 136 L96 140 L178 144 L180 136 L222 132 Q212 170 188 192 Q122 204 56 194 Q30 178 20 150 Z" fill="url(#cvHull)"/>
 <path d="M24 156 Q120 166 216 142" fill="none" stroke="#d9a548" stroke-width="3.2"/>
 <path d="M30 170 Q120 182 208 160 M40 184 Q120 194 196 176" fill="none" stroke="#2c180a" stroke-width="1.6" opacity=".55"/>
 <path d="M58 146 L96 150 L178 152" fill="none" stroke="#c9934a" stroke-width="2" opacity=".7"/>
 <circle cx="70" cy="161" r="3" fill="#2c180a"/><circle cx="104" cy="165" r="3" fill="#2c180a"/><circle cx="140" cy="166" r="3" fill="#2c180a"/><circle cx="174" cy="162" r="3" fill="#2c180a"/>
 <path d="M20 150 Q40 172 56 194" fill="none" stroke="#2c180a" stroke-width="2" opacity=".4"/>
</svg>`;

// foam wake behind a ship (to the left); length in px
ICON.wake = (len = 260) => `
<svg width="${len}" height="90" viewBox="0 0 ${len} 90" style="overflow:visible">
 <defs><linearGradient id="wk" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <filter id="wkb"><feGaussianBlur stdDeviation="1.6"/></filter></defs>
 <g filter="url(#wkb)" fill="none" stroke="url(#wk)" stroke-linecap="round">
  <path d="M${len} 50 Q${len * .55} 30 0 6" stroke-width="5"/><path d="M${len} 54 Q${len * .55} 74 0 88" stroke-width="5"/>
  <path d="M${len} 52 Q${len * .5} 50 ${len * .1} 52" stroke-width="9" opacity=".55"/>
 </g></svg>`;

// quill with ink at the nib; nib tip sits at (14, 286) of the box
ICON.quill = (s = 1) => `
<svg width="${170 * s}" height="${300 * s}" viewBox="0 0 170 300" style="overflow:visible">
 <defs>
  <linearGradient id="qF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ecebe6"/><stop offset="1" stop-color="#b9b6ad"/></linearGradient>
  <linearGradient id="qN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a6a55"/><stop offset="1" stop-color="#1f1a14"/></linearGradient>
  <filter id="qS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
 </defs>
 <path d="M30 300 L160 20" stroke="#000" stroke-width="22" opacity=".18" filter="url(#qS)" transform="translate(26 -6)"/>
 <path d="M150 6 Q172 40 140 104 Q112 160 74 206 L58 222 Q60 170 84 120 Q112 52 150 6 Z" fill="url(#qF)" stroke="#c9c6bd" stroke-width="1"/>
 <path d="M150 6 Q120 44 104 92 Q88 138 66 214" fill="none" stroke="#a9a59a" stroke-width="2.4"/>
 <g stroke="#cfccc3" stroke-width="1" opacity=".9">
  <path d="M141 30 L156 26 M134 48 L160 44 M126 66 L158 66 M118 86 L152 90 M110 108 L144 116 M102 128 L134 140 M94 150 L120 164 M86 172 L104 186"/>
  <path d="M134 34 L118 60 M126 54 L104 84 M118 76 L96 108 M110 98 L90 134 M100 122 L82 158 M92 146 L76 182"/>
 </g>
 <path d="M66 214 L58 222 L40 262 L22 284 L14 288 L18 278 L30 254 L50 214 Z" fill="url(#qN)"/>
 <path d="M14 288 L26 268" stroke="#c9a76a" stroke-width="1.2" opacity=".7"/>
</svg>`;

// parchment treaty with a wax seal
ICON.treaty = (s = 1, t1 = 'Договор', t2 = 'Тордесильяс · 1494') => `
<svg width="${300 * s}" height="${380 * s}" viewBox="0 0 300 380" style="overflow:visible">
 <defs>
  <linearGradient id="pp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7ebcb"/><stop offset=".6" stop-color="#ecd9a8"/><stop offset="1" stop-color="#d4b97f"/></linearGradient>
  <radialGradient id="ws" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e2524a"/><stop offset=".6" stop-color="#a8231e"/><stop offset="1" stop-color="#6c1310"/></radialGradient>
  <filter id="ppS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
 </defs>
 <rect x="18" y="30" width="270" height="340" rx="10" fill="#2a2010" opacity=".35" filter="url(#ppS)"/>
 <g filter="url(#rough)">
  <path d="M14 14 L286 10 L290 352 Q150 366 12 356 Z" fill="url(#pp)" stroke="#b08f55" stroke-width="2"/>
 </g>
 <path d="M14 14 L286 10 L290 352 Q150 366 12 356 Z" fill="none" stroke="#8a6b38" stroke-width="10" opacity=".12"/>
 <text x="150" y="74" text-anchor="middle" font-family="Cormorant Garamond" font-weight="700" font-size="38" fill="#3c2c17">${t1}</text>
 <text x="150" y="108" text-anchor="middle" font-family="Cormorant Garamond" font-weight="700" font-size="25" fill="#5a4426">${t2}</text>
 <g stroke="#6d5634" stroke-width="2.2" stroke-linecap="round" opacity=".55">
  <path d="M44 140 H256 M44 162 H246 M44 184 H252 M44 206 H230 M44 228 H250 M44 250 H200"/>
 </g>
 <path d="M48 300 q14 -26 28 -4 t26 -6 t22 4" fill="none" stroke="#3c2c17" stroke-width="2.4"/>
 <path d="M168 302 q10 -22 24 -2 q12 -26 26 0 t20 -4" fill="none" stroke="#3c2c17" stroke-width="2.4"/>
 <path d="M226 318 l-14 52 l16 -10 l12 14 l6 -54" fill="#a8231e"/>
 <circle cx="236" cy="314" r="30" fill="url(#ws)"/>
 <circle cx="236" cy="314" r="20" fill="none" stroke="#6c1310" stroke-width="2.5" opacity=".7"/>
 <path d="M236 302 v24 M224 314 h24" stroke="#6c1310" stroke-width="3" opacity=".7"/>
</svg>`;

// waving flags (simplified modern designs) with cloth shading
const clothShade = id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".22" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#000" stop-opacity=".14"/>
  <stop offset=".7" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>`;
const flagWave = 'M0 6 Q24 0 48 6 T96 6 V66 Q72 60 48 66 T0 66 Z';
ICON.flagPT = (s = 1) => `
<svg width="${96 * s}" height="${72 * s}" viewBox="0 0 96 72"><defs><clipPath id="fpt"><path d="${flagWave}"/></clipPath>${clothShade('fsP')}</defs>
 <g clip-path="url(#fpt)"><rect width="38" height="72" fill="#0b7a3b"/><rect x="38" width="58" height="72" fill="#d52b1e"/>
 <circle cx="38" cy="36" r="13" fill="none" stroke="#f4c21b" stroke-width="5"/><path d="M33 29 h10 v10 q0 6 -5 7 q-5 -1 -5 -7 Z" fill="#fff" stroke="#d52b1e" stroke-width="2"/>
 <rect width="96" height="72" fill="url(#fsP)"/></g></svg>`;
ICON.flagES = (s = 1) => `
<svg width="${96 * s}" height="${72 * s}" viewBox="0 0 96 72"><defs><clipPath id="fes"><path d="${flagWave}"/></clipPath>${clothShade('fsE')}</defs>
 <g clip-path="url(#fes)"><rect width="96" height="72" fill="#c60b1e"/><rect y="20" width="96" height="32" fill="#ffc400"/>
 <rect x="20" y="27" width="14" height="18" rx="3" fill="#c60b1e" opacity=".85"/>
 <rect width="96" height="72" fill="url(#fsE)"/></g></svg>`;

// map pin with pulse rings (rings animate outwards in the video)
ICON.pulse = (color = '#2f7bf5', p = .4) => `
<svg width="160" height="160" viewBox="-80 -80 160 160" style="overflow:visible">
 ${[0, .5].map(o => { const q = (p + o) % 1; return `<circle r="${14 + q * 62}" fill="none" stroke="${color}" stroke-width="${4 * (1 - q) + .5}" opacity="${(1 - q) * .8}"/>` }).join('')}
 <circle r="16" fill="#fff" style="filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))"/><circle r="9" fill="${color}"/>
</svg>`;
