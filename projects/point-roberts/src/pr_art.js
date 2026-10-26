// Point Roberts: route (approximate, along 56 St → Hwy 17 → Hwy 99 → Peace Arch; every waypoint checked to be on land),
// the car, flags, pins.
const ROUTE = [[-123.0650, 48.9850], [-123.0680, 48.9960], [-123.0680, 49.0016], [-123.0680, 49.0150], [-123.0680, 49.0300], [-123.0640, 49.0420],
  [-123.0560, 49.0560], [-123.0530, 49.0720], [-123.0480, 49.0880], [-123.0200, 49.0950], [-122.9800, 49.0990], [-122.9400, 49.1010],
  [-122.9000, 49.0960], [-122.8600, 49.0900], [-122.8450, 49.0800], [-122.8350, 49.0650], [-122.8050, 49.0450], [-122.7850, 49.0250],
  [-122.7650, 49.0100], [-122.7570, 49.0020], [-122.7520, 48.9960], [-122.7480, 48.9930]];
const XING = [[-123.0680, 49.0016], [-122.7570, 49.0020]];      // Point Roberts crossing, Peace Arch / Blaine
const C_US = '#2f7bf5', C_CA = '#f08a24', C_WATER = '#d4ebfa', C_LAND = '#f7f4ee';
const ART = {};
// top-down car, nose to the right; rotate with CSS
ART.car = (s = 1) => `<svg width="${96 * s}" height="${52 * s}" viewBox="-48 -26 96 52" style="overflow:visible">
 <defs><linearGradient id="carB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dde6"/></linearGradient>
 <filter id="carS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5"/></filter></defs>
 <rect x="-40" y="-17" width="84" height="40" rx="14" fill="#0b1420" opacity=".35" filter="url(#carS)" transform="translate(3 4)"/>
 <rect x="-42" y="-20" width="84" height="40" rx="14" fill="url(#carB)" stroke="#9aa3b6" stroke-width="1.5"/>
 <path d="M8 -15 Q22 -14 25 0 Q22 14 8 15 Z" fill="#1f2a3d"/><path d="M-26 -14 Q-34 0 -26 14 L-18 13 Q-24 0 -18 -13 Z" fill="#1f2a3d"/>
 <rect x="-16" y="-15" width="22" height="30" rx="5" fill="${C_US}"/>
 <rect x="37" y="-15" width="5" height="8" rx="2" fill="#ffe7a6"/><rect x="37" y="7" width="5" height="8" rx="2" fill="#ffe7a6"/>
 <rect x="-42" y="-15" width="4" height="7" rx="1.5" fill="#e5484d"/><rect x="-42" y="8" width="4" height="7" rx="1.5" fill="#e5484d"/>
</svg>`;
ART.flagUS = (s = 1) => `<svg width="${60 * s}" height="${40 * s}" viewBox="0 0 60 40">${[...Array(7)].map((_, k) => `<rect y="${k * 40 / 6.5}" width="60" height="${40 / 13}" fill="#b22234"/>`).join('')}<rect width="26" height="21.5" fill="#3c3b6e"/>${[...Array(12)].map((_, k) => `<circle cx="${3.5 + (k % 4) * 6.3}" cy="${3.6 + Math.floor(k / 4) * 6.8}" r="1.3" fill="#fff"/>`).join('')}<rect width="60" height="40" fill="none" stroke="#000" stroke-opacity=".12"/></svg>`;
ART.flagCA = (s = 1) => `<svg width="${60 * s}" height="${40 * s}" viewBox="0 0 60 40"><rect width="60" height="40" fill="#fff"/><rect width="15" height="40" fill="#d52b1e"/><rect x="45" width="15" height="40" fill="#d52b1e"/>
 <path d="M30 8 l2.2 4.6 3 -1.4 -1.2 7 3.6 -3.4 0.8 2.4 3.8 -0.8 -1.4 4 1.6 0.8 -6.2 5 0.6 2.2 -5.8 -0.8 0 5.6 h-2 l0 -5.6 -5.8 0.8 0.6 -2.2 -6.2 -5 1.6 -0.8 -1.4 -4 3.8 0.8 0.8 -2.4 3.6 3.4 -1.2 -7 3 1.4 Z" fill="#d52b1e"/><rect width="60" height="40" fill="none" stroke="#000" stroke-opacity=".12"/></svg>`;
ART.flagUK = (s = 1) => `<svg width="${60 * s}" height="${40 * s}" viewBox="0 0 60 40"><clipPath id="ukc"><rect width="60" height="40"/></clipPath><g clip-path="url(#ukc)"><rect width="60" height="40" fill="#012169"/>
 <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0 L60 40 M60 0 L0 40" stroke="#c8102e" stroke-width="3"/>
 <path d="M30 0 V40 M0 20 H60" stroke="#fff" stroke-width="12"/><path d="M30 0 V40 M0 20 H60" stroke="#c8102e" stroke-width="7"/></g></svg>`;
ART.pin = (col, s = 1, inner = '') => `<svg width="${56 * s}" height="${72 * s}" viewBox="-28 -64 56 72" style="overflow:visible">
 <ellipse cx="0" cy="4" rx="12" ry="4" fill="#0b1420" opacity=".3"/><path d="M0 0 C-6 -14 -24 -26 -24 -42 A24 24 0 0 1 24 -42 C24 -26 6 -14 0 0 Z" fill="${col}" stroke="#fff" stroke-width="3"/>
 <circle cx="0" cy="-42" r="10" fill="#fff"/>${inner}</svg>`;
ART.house = (s = 1) => `<svg width="${120 * s}" height="${110 * s}" viewBox="0 0 120 110"><ellipse cx="62" cy="104" rx="52" ry="6" fill="#0b1420" opacity=".25"/>
 <rect x="16" y="44" width="88" height="58" rx="4" fill="#fff" stroke="#c6cbdb" stroke-width="2"/><path d="M8 48 L60 10 L112 48 Z" fill="${C_US}"/>
 <rect x="50" y="68" width="20" height="34" rx="3" fill="#1f2a3d"/><rect x="24" y="58" width="18" height="16" rx="2" fill="#bfe0f7"/><rect x="78" y="58" width="18" height="16" rx="2" fill="#bfe0f7"/></svg>`;
