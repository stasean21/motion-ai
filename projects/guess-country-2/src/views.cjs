// Country framing: fit each country's Mercator bbox into the map area (936×850 centred at 540,855) → camera centre/width.
const tc = require('./lib/topojson-client.min.js'); global.WORLD10 = null;
const src = require('fs').readFileSync('lib/world10m.js', 'utf8'); const W = JSON.parse(src.slice(src.indexOf('=') + 1, src.lastIndexOf(';')));
const F = tc.feature(W, W.objects.countries).features;
const C = { brazil: '076', australia: '036', uk: '826', norway: '578', turkey: '792', newzealand: '554', uzbekistan: '860', ecuador: '218', hungary: '348' };
// framing boxes [lon0, lon1, lat0, lat1] where the country's far-flung parts must stay off-frame (the highlight still covers them)
const BOX = { brazil: [-74.0, -34.7, -33.8, 5.3], australia: [112.9, 153.7, -43.7, -10.6], norway: [4.5, 31.2, 57.9, 71.2], newzealand: [166.3, 178.7, -47.4, -34.3], ecuador: [-81.1, -75.2, -5.0, 1.5] };
const my = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 180 / Math.PI;   // mercator y in "degrees"
const out = {};
for (const [k, id] of Object.entries(C)) {
  const f = F.find(c => c.id === id); const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  if (BOX[k]) { [x0, x1] = BOX[k]; y0 = my(BOX[k][2]); y1 = my(BOX[k][3]) }
  else polys.forEach(p => p[0].forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, my(y)); y1 = Math.max(y1, my(y)) }));
  const fill = .8, pxPerDeg = Math.min(936 * fill / (x1 - x0), 850 * fill / (y1 - y0)), w = 1080 / pxPerDeg;
  const cx = (x0 + x1) / 2, cyM = (y0 + y1) / 2, cy = Math.atan(Math.sinh(cyM * Math.PI / 180)) * 180 / Math.PI;
  out[k] = { id, cx: +cx.toFixed(3), cy: +cy.toFixed(3), w: +w.toFixed(3), bbox: [x0, x1, y0, y1].map(v => +v.toFixed(2)) };
}
require('fs').writeFileSync('views.json', JSON.stringify(out, null, 1)); console.log(out);
