// Hand-drawn vector illustrations for the Madagascar fact cards (920 × 720 viewBox). Pure functions of their state.
const ART = {};
const rnd = i => { const s = Math.sin(i * 12.9898) * 43758.5453; return s - Math.floor(s) };
const cl01 = v => Math.min(1, Math.max(0, v));
const ebk = p => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2) };
const F = 'font-family="Inter Display,Inter" font-weight="800"';
const tag = (x, y, txt, o, col = '#111218', bg = '#fff', fs = 22) => o > 0 ? `<g transform="translate(${x} ${y}) scale(${(.6 + .4 * ebk(cl01(o))).toFixed(3)})" opacity="${cl01(o * 2).toFixed(2)}"><rect x="${-(txt.length * fs * .36 + 18)}" y="-20" width="${txt.length * fs * .72 + 36}" height="40" rx="20" fill="${bg}"/><text y="${fs * .36}" text-anchor="middle" ${F} font-size="${fs}" letter-spacing=".05em" fill="${col}">${txt}</text></g>` : '';

// ── 1. Tsingy de Bemaraha: forest of razor-sharp limestone needles, a tiny person for scale
ART.tsingy = (o = {}) => {
  const pan = o.pan || 0, outl = o.outline || 0, sc = o.scale || 0, per = o.person ?? 0, ring = o.ring || 0, par = o.par || 0;
  const layer = (seed, n, base, hmin, hmax, wmin, wmax, c1, c2, dx) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = -140 + i * (1240 / n) + rnd(seed + i) * 40 + dx, h = hmin + rnd(seed + i + 50) * (hmax - hmin), w = wmin + rnd(seed + i + 90) * (wmax - wmin);
      const tip = x + w * (.35 + rnd(seed + i + 7) * .3), y0 = base - h;
      const d = `M${x.toFixed(1)} ${base} L${(x + w * .18).toFixed(1)} ${(base - h * .55).toFixed(1)} L${(tip - w * .08).toFixed(1)} ${(y0 + h * .12).toFixed(1)} L${tip.toFixed(1)} ${y0.toFixed(1)} L${(tip + w * .1).toFixed(1)} ${(y0 + h * .2).toFixed(1)} L${(x + w * .82).toFixed(1)} ${(base - h * .5).toFixed(1)} L${(x + w).toFixed(1)} ${base}Z`;
      s += `<path d="${d}" fill="url(#ts_${c1})"/><path d="M${tip.toFixed(1)} ${(y0 + 10).toFixed(1)} L${(tip - w * .05).toFixed(1)} ${(base - 10).toFixed(1)}" stroke="${c2}" stroke-width="2" opacity=".5"/>`;
    }
    return s };
  const front = (dx) => {   // three hero needles on the right + the outline targets
    const P = [[560, 650, 470, 120], [660, 650, 560, 110], [770, 650, 420, 130]];
    return P.map(([x, b, h, w], i) => { const tip = x + w * .45, y0 = b - h; return { d: `M${x + dx} ${b} L${x + w * .15 + dx} ${b - h * .6} L${tip - 10 + dx} ${y0 + h * .1} L${tip + dx} ${y0} L${tip + 12 + dx} ${y0 + h * .16} L${x + w * .85 + dx} ${b - h * .55} L${x + w + dx} ${b}Z`, tip: tip + dx, y0 } }) };
  const fr = front(-pan * 70 + par * 8);
  const L = d => { const m = d.match(/[\d.-]+/g).map(Number); let l = 0; for (let i = 2; i < m.length; i += 2) l += Math.hypot(m[i] - m[i - 2], m[i + 1] - m[i - 1]); return l + 600 };
  let veg = ''; for (let i = 0; i < 22; i++) { const x = -60 + i * 50 + rnd(i) * 30 - pan * 70, y = 640 + rnd(i + 4) * 30; veg += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(30 + rnd(i + 8) * 30).toFixed(0)}" ry="${(18 + rnd(i + 2) * 14).toFixed(0)}" fill="${rnd(i + 3) > .5 ? '#3f6b35' : '#4f7d3d'}"/>` }
  const tall = fr[1];
  const per_x = 616 - pan * 70 + par * 8, per_y = 646;
  return `<defs>
   <linearGradient id="ts_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc4ee"/><stop offset="1" stop-color="#f3ead8"/></linearGradient>
   <linearGradient id="ts_b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfc8bb"/><stop offset="1" stop-color="#a59d90"/></linearGradient>
   <linearGradient id="ts_m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b3ab9e"/><stop offset=".55" stop-color="#8d857a"/><stop offset="1" stop-color="#6f685f"/></linearGradient>
   <linearGradient id="ts_f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a49b8e"/><stop offset=".5" stop-color="#7a7268"/><stop offset="1" stop-color="#4f4a44"/></linearGradient>
  </defs>
  <rect width="920" height="720" fill="url(#ts_sky)"/>
  <path d="M0 420 C160 380 300 410 460 390 C620 370 760 400 920 380 L920 720 L0 720Z" fill="#6f8f62" opacity=".6"/>
  ${layer(10, 26, 560, 120, 230, 40, 70, 'b', '#8a8377', -pan * 14 + par * 2)}
  ${layer(40, 20, 620, 180, 330, 55, 95, 'm', '#5d564e', -pan * 34 + par * 4)}
  ${veg}
  ${layer(80, 9, 720, 200, 380, 90, 150, 'f', '#3f3a35', -pan * 70 + par * 8).replace(/<path d="M(-?\d)/g, '<path d="M$1')}
  ${fr.map(f => `<path d="${f.d}" fill="url(#ts_f)"/>`).join('')}
  ${outl > 0 ? fr.map((f, i) => { const p = cl01(outl * 3 - i); const l = L(f.d); return p > 0 ? `<path d="${f.d}" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-dasharray="${l.toFixed(0)}" stroke-dashoffset="${(l * (1 - p)).toFixed(0)}"/>` : '' }).join('') : ''}
  ${per > 0 ? `<g transform="translate(${per_x.toFixed(1)} ${per_y}) scale(${per})"><circle cx="0" cy="-15" r="3.4" fill="#f2c94c"/><rect x="-2.8" y="-12" width="5.6" height="9" rx="2" fill="#e5484d"/><rect x="-2.5" y="-3" width="2" height="6" fill="#333"/><rect x=".5" y="-3" width="2" height="6" fill="#333"/></g>` : ''}
  ${ring > 0 ? `<circle cx="${per_x.toFixed(1)}" cy="${per_y - 8}" r="${(22 + 6 * Math.sin(ring * 8)).toFixed(1)}" fill="none" stroke="#ffd34d" stroke-width="4" opacity="${cl01(ring * 3)}"/>${tag(per_x - 90, per_y - 60, 'PERSON', ring, '#111218')}` : ''}
  ${sc > 0 ? `<g opacity="${cl01(sc * 3)}"><path d="M${(tall.tip + 70).toFixed(1)} 650 L${(tall.tip + 70).toFixed(1)} ${(650 - (650 - tall.y0) * cl01(sc * 1.4)).toFixed(1)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <path d="M${(tall.tip + 56).toFixed(1)} 650 H${(tall.tip + 84).toFixed(1)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    ${sc > .7 ? `<path d="M${(tall.tip + 56).toFixed(1)} ${tall.y0} H${(tall.tip + 84).toFixed(1)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` : ''}</g>${tag(tall.tip + 70, tall.y0 - 34, 'UP TO 100 M', (sc - .6) * 2.5, '#2f7bf5')}` : ''}`
};

// ── 2. Avenue of the Baobabs: golden-hour road, giant trunks, root-like crowns; synthetic zoom-out from the crown
ART.baobab = (o = {}) => {
  const z = o.zoom ?? 1, t = o.t || 0, per = o.person ?? 1;
  const tree = (x, base, h, w, seed, sc = 1) => {
    const top = base - h, sw = Math.sin(t * 1.3 + seed) * 1.5;
    let br = ''; for (let i = 0; i < 9; i++) { const a = -150 + i * 15 + rnd(seed + i) * 10, l = (40 + rnd(seed + i + 9) * 50) * sc, r = a * Math.PI / 180;
      const x1 = x + Math.cos(r) * l * .5, y1 = top + Math.sin(r) * l * .5, x2 = x + Math.cos(r) * l, y2 = top + Math.sin(r) * l - 6;
      br += `<path d="M${x} ${top + 6} Q${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#5a3f2e" stroke-width="${(7 * sc).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
      if (rnd(seed + i + 3) > .35) br += `<ellipse cx="${x2.toFixed(1)}" cy="${(y2 - 4).toFixed(1)}" rx="${(16 * sc).toFixed(1)}" ry="${(8 * sc).toFixed(1)}" fill="#4f7a34" opacity=".9"/>` }
    return `<g transform="rotate(${sw.toFixed(2)} ${x} ${base})">${br}</g><path d="M${x - w * .5} ${base} C${x - w * .62} ${base - h * .5} ${x - w * .36} ${top + 20} ${x - w * .2} ${top} L${x + w * .2} ${top} C${x + w * .36} ${top + 20} ${x + w * .62} ${base - h * .5} ${x + w * .5} ${base}Z" fill="url(#bb_tr)"/>
      <path d="M${x - w * .1} ${base - 10} C${x - w * .16} ${base - h * .5} ${x - w * .1} ${top + 40} ${x - w * .05} ${top + 10}" stroke="#7d5a43" stroke-width="3" fill="none" opacity=".5"/>` };
  const s = 1 + 2.4 * Math.pow(1 - z, 1.4), fx = 250 + (460 - 250) * z, fy = 150 + (360 - 150) * z;
  return `<defs>
   <linearGradient id="bb_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb2e3"/><stop offset=".55" stop-color="#ffd8a0"/><stop offset="1" stop-color="#ffab66"/></linearGradient>
   <linearGradient id="bb_tr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a6450"/><stop offset=".45" stop-color="#c49a78"/><stop offset="1" stop-color="#7a5642"/></linearGradient>
   <linearGradient id="bb_rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c77b4a"/><stop offset="1" stop-color="#a95a32"/></linearGradient>
  </defs>
  <rect width="920" height="720" fill="url(#bb_sky)"/>
  <g transform="translate(460 360) scale(${s.toFixed(3)}) translate(${-fx} ${-fy})">
   <circle cx="700" cy="430" r="46" fill="#fff3c4" opacity=".9"/>
   <path d="M0 470 C200 455 420 465 620 455 C760 450 860 462 920 458 L920 720 L0 720Z" fill="#6d8a45"/>
   <path d="M430 470 L490 470 L760 720 L160 720Z" fill="url(#bb_rd)"/>
   ${tree(560, 472, 120, 26, 7, .45)}${tree(380, 474, 150, 32, 3, .55)}${tree(640, 480, 190, 40, 11, .7)}${tree(150, 520, 330, 76, 5, 1)}${tree(250, 500, 260, 60, 1, .85)}${tree(800, 540, 400, 92, 9, 1.15)}
   <path d="M0 560 C240 540 600 556 920 540 L920 720 L0 720Z" fill="#7c9a4f" opacity=".5"/>
   ${per > 0 ? `<g transform="translate(720 600)"><circle cx="0" cy="-26" r="5" fill="#2b2420"/><rect x="-4.5" y="-21" width="9" height="15" rx="3" fill="#2f7bf5"/><rect x="-4" y="-6" width="3" height="10" fill="#333"/><rect x="1" y="-6" width="3" height="10" fill="#333"/></g>` : ''}
  </g>`
};

// ── 3. Aye-aye at night: taps the branch, a cutaway shows the hidden tunnel, gnaws, then hooks the grub with its long finger
ART.ayeaye = (o = {}) => {
  const tap = o.tap || 0, cut = o.cut || 0, rings = o.rings ?? -1, gnaw = o.gnaw || 0, reach = o.reach || 0, ear = o.ear || 0, t = o.t || 0;
  const hx = 360 + gnaw * 70 * (1 - reach * .6), hy = 330 + gnaw * 40 * (1 - reach * .6);
  // finger: from the wrist at (440,430) to the tapping point (560,452); during reach it dives into the hole and back out with the grub
  const fa = -Math.abs(Math.sin(tap * Math.PI * 3)) * 18, rd = Math.sin(cl01(reach) * Math.PI);
  const fx = 560, fy = 452 + rd * 46;
  const grubY = reach < .5 ? 520 : 520 - (reach - .5) * 2 * 100, grubX = reach < .5 ? 576 : 576 - (reach - .5) * 2 * 20;
  let stars = ''; for (let i = 0; i < 40; i++) stars += `<circle cx="${(rnd(i) * 920).toFixed(0)}" cy="${(rnd(i + 40) * 300).toFixed(0)}" r="${(.8 + rnd(i + 7) * 1.6).toFixed(1)}" fill="#fff" opacity="${(.3 + .5 * Math.abs(Math.sin(t * 1.5 + i))).toFixed(2)}"/>`;
  let rg = ''; if (rings >= 0 && rings < 1) for (let k = 0; k < 2; k++) { const u = cl01(rings * 1.4 - k * .4); if (u > 0 && u < 1) rg += `<ellipse cx="560" cy="456" rx="${(20 + u * 120).toFixed(1)}" ry="${(10 + u * 60).toFixed(1)}" fill="none" stroke="#9ad7ff" stroke-width="4" opacity="${(1 - u).toFixed(2)}"/>` }
  return `<defs>
   <linearGradient id="ay_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1b3d"/><stop offset="1" stop-color="#1f3b5c"/></linearGradient>
   <linearGradient id="ay_br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4c36"/><stop offset="1" stop-color="#3e2a1d"/></linearGradient>
   <radialGradient id="ay_eye" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#e09a1d"/></radialGradient>
   <clipPath id="ay_win"><rect x="${560 - 120 * cut}" y="470" width="${240 * cut}" height="80" rx="16"/></clipPath>
  </defs>
  <rect width="920" height="720" fill="url(#ay_sky)"/>${stars}
  <circle cx="780" cy="110" r="44" fill="#f4f1dc"/><circle cx="764" cy="100" r="44" fill="#16284a" opacity=".25"/>
  <path d="M0 260 C80 200 160 240 220 190 C300 150 360 210 420 180 L420 0 L0 0Z" fill="#0f2a22" opacity=".9"/>
  <path d="M920 300 C840 240 780 280 700 230 C640 200 600 240 560 210 L560 0 L920 0Z" fill="#0f2a22" opacity=".85"/>
  <path d="M0 720 L0 600 C120 560 220 610 320 580 C420 552 520 600 620 570 C720 545 820 590 920 560 L920 720Z" fill="#0b2019"/>
  <path d="M-20 470 C200 450 600 460 940 444 L940 556 C600 572 200 566 -20 584Z" fill="url(#ay_br)"/>
  ${[...Array(14)].map((_, i) => `<path d="M${i * 70} ${468 + rnd(i) * 10} q20 ${30 + rnd(i + 3) * 40} 4 ${80 + rnd(i + 5) * 20}" stroke="#2c1d14" stroke-width="2" fill="none" opacity=".5"/>`).join('')}
  ${cut > 0 ? `<g clip-path="url(#ay_win)"><rect x="420" y="460" width="300" height="100" fill="#d9b48a"/>${[...Array(8)].map((_, i) => `<path d="M420 ${470 + i * 11} H720" stroke="#c39a6c" stroke-width="2"/>`).join('')}
    <path d="M470 516 C520 500 560 530 610 512 C640 502 660 520 690 512" stroke="#5b3c25" stroke-width="16" fill="none" stroke-linecap="round"/>
    ${reach < .55 ? `<g transform="translate(${grubX} ${grubY})"><ellipse rx="16" ry="8" fill="#fff4d6" stroke="#cdb48a" stroke-width="2"/><path d="M-8 -7 V7 M0 -8 V8 M8 -7 V7" stroke="#cdb48a" stroke-width="1.5"/></g>` : ''}</g>
    <rect x="${560 - 120 * cut}" y="470" width="${240 * cut}" height="80" rx="16" fill="none" stroke="#2f7bf5" stroke-width="4" stroke-dasharray="12 8"/>` : ''}
  ${gnaw > 0 ? `<ellipse cx="565" cy="458" rx="${(16 * cl01(gnaw * 1.5)).toFixed(1)}" ry="${(7 * cl01(gnaw * 1.5)).toFixed(1)}" fill="#1c120b"/>` : ''}
  ${rg}
  <path d="M250 470 C180 420 120 330 150 240 C170 180 230 170 240 230 C250 290 210 360 280 430" stroke="#2c2622" stroke-width="44" fill="none" stroke-linecap="round"/>
  <path d="M250 470 C180 420 120 330 150 240 C170 180 230 170 240 230" stroke="#4a403a" stroke-width="14" fill="none" stroke-linecap="round" opacity=".6"/>
  <ellipse cx="320" cy="420" rx="92" ry="66" fill="#3a322d"/>
  ${[...Array(18)].map((_, i) => { const a = rnd(i) * 6.28, r = 60 + rnd(i + 3) * 30; return `<path d="M${(320 + Math.cos(a) * r).toFixed(0)} ${(420 + Math.sin(a) * r * .7).toFixed(0)} l${(Math.cos(a) * 14).toFixed(0)} ${(Math.sin(a) * 10 - 4).toFixed(0)}" stroke="#6b5f57" stroke-width="3" stroke-linecap="round"/>` }).join('')}
  <path d="M290 470 L300 520 M350 470 L360 520" stroke="#2c2622" stroke-width="16" stroke-linecap="round"/>
  <path d="M380 430 L440 430" stroke="#2c2622" stroke-width="16" stroke-linecap="round"/>
  <g transform="rotate(${fa.toFixed(1)} 440 430)"><path d="M440 430 L${fx} ${fy}" stroke="#1f1a17" stroke-width="5" stroke-linecap="round"/><circle cx="${fx}" cy="${fy}" r="4" fill="#1f1a17"/>
   ${reach >= .55 ? `<g transform="translate(${fx + 8} ${fy - 6})"><ellipse rx="14" ry="7" fill="#fff4d6" stroke="#cdb48a" stroke-width="2"/></g>` : ''}</g>
  <g transform="translate(${hx - 360} ${hy - 330})">
   <g transform="rotate(${(-8 + ear * 10).toFixed(1)} 330 300)"><ellipse cx="318" cy="262" rx="38" ry="52" fill="#2b2420"/><ellipse cx="318" cy="266" rx="24" ry="36" fill="#7d5f55"/></g>
   <g transform="rotate(${(10 - ear * 6).toFixed(1)} 400 300)"><ellipse cx="412" cy="258" rx="40" ry="54" fill="#2b2420"/><ellipse cx="412" cy="262" rx="26" ry="38" fill="#7d5f55"/></g>
   <ellipse cx="362" cy="330" rx="58" ry="50" fill="#5a4f48"/><ellipse cx="362" cy="350" rx="34" ry="26" fill="#d9cfc4"/>
   <circle cx="338" cy="322" r="17" fill="url(#ay_eye)" stroke="#1a1410" stroke-width="3"/><circle cx="388" cy="322" r="17" fill="url(#ay_eye)" stroke="#1a1410" stroke-width="3"/>
   <circle cx="340" cy="322" r="6" fill="#1a1410"/><circle cx="390" cy="322" r="6" fill="#1a1410"/><circle cx="335" cy="317" r="3" fill="#fff"/><circle cx="385" cy="317" r="3" fill="#fff"/>
   <ellipse cx="363" cy="352" rx="9" ry="6" fill="#e7a4a4"/>
  </g>`
};

// ── 4. Indri in the rainforest: black-and-white fur, round fluffy ears, almost no tail; sings; later a family joins
ART.indri = (o = {}) => {
  const sing = o.sing || 0, fam = o.fam || 0, t = o.t || 0, listen = o.listen || 0;
  const indri = (x, y, s, ph) => { const m = sing * (.5 + .5 * Math.abs(Math.sin(t * 5 + ph))), hb = Math.sin(t * 1.2 + ph) * 3;
    return `<g transform="translate(${x} ${y}) scale(${s})">
     <path d="M-30 -10 C-50 40 -46 120 -20 170 L24 170 C44 120 44 40 26 -10Z" fill="#1d1a19"/>
     <path d="M-24 60 C-60 70 -70 110 -50 140" stroke="#f1ede6" stroke-width="22" fill="none" stroke-linecap="round"/>
     <path d="M22 50 C60 30 70 -10 60 -40" stroke="#f1ede6" stroke-width="22" fill="none" stroke-linecap="round"/>
     <path d="M-30 -20 C-60 -40 -66 -80 -50 -110" stroke="#1d1a19" stroke-width="22" fill="none" stroke-linecap="round"/>
     <path d="M-10 160 C-40 190 -50 220 -36 250 M14 160 C40 190 50 220 40 250" stroke="#f1ede6" stroke-width="26" fill="none" stroke-linecap="round"/>
     <g transform="translate(0 ${hb.toFixed(1)})"><circle cx="-26" cy="-58" r="17" fill="#1d1a19"/><circle cx="26" cy="-58" r="17" fill="#1d1a19"/>
      <ellipse cx="0" cy="-34" rx="34" ry="36" fill="#1d1a19"/><ellipse cx="0" cy="-18" rx="20" ry="18" fill="#2b2624"/>
      <circle cx="-13" cy="-40" r="7" fill="#c9d65a"/><circle cx="13" cy="-40" r="7" fill="#c9d65a"/><circle cx="-13" cy="-40" r="3" fill="#111"/><circle cx="13" cy="-40" r="3" fill="#111"/>
      <ellipse cx="0" cy="-8" rx="${(6 + 6 * m).toFixed(1)}" ry="${(2 + 9 * m).toFixed(1)}" fill="#5a1f1f"/></g>
     ${sing > 0 ? [0, 1, 2].map(k => { const u = ((t * .9 + k / 3 + ph) % 1); return `<path d="M${30 + u * 60} ${-30 - u * 30} q14 -10 0 -22" stroke="#bfe8ff" stroke-width="4" fill="none" opacity="${(sing * (1 - u)).toFixed(2)}" transform="scale(${1 + u})"/>` }).join('') : ''}
    </g>` };
  let leaves = ''; for (let i = 0; i < 46; i++) { const x = rnd(i) * 960 - 20, y = rnd(i + 50) * 260 - 30, r = 30 + rnd(i + 9) * 50; leaves += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * .6).toFixed(0)}" fill="${['#1f5a33', '#2b6e3d', '#3d8447', '#174a2b'][i % 4]}" opacity=".95"/>` }
  let low = ''; for (let i = 0; i < 30; i++) { const x = rnd(i + 200) * 960 - 20, y = 600 + rnd(i + 250) * 140, r = 40 + rnd(i + 9) * 50; low += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${r.toFixed(0)}" ry="${(r * .55).toFixed(0)}" fill="${['#1f5a33', '#2b6e3d', '#3d8447'][i % 3]}"/>` }
  return `<defs><linearGradient id="in_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3a8"/><stop offset="1" stop-color="#3f7f52"/></linearGradient></defs>
  <rect width="920" height="720" fill="url(#in_bg)"/>
  ${[...Array(5)].map((_, i) => `<path d="M${120 + i * 180} 0 L${170 + i * 180} 0 L${300 + i * 180} 720 L${220 + i * 180} 720Z" fill="#fff" opacity=".07"/>`).join('')}
  <rect x="140" y="0" width="34" height="720" fill="#6b5640" opacity="${(.35 + .65 * fam).toFixed(2)}"/><rect x="740" y="0" width="30" height="720" fill="#6b5640" opacity="${(.35 + .65 * fam).toFixed(2)}"/>
  <rect x="438" y="0" width="56" height="720" fill="#7a6246"/><path d="M450 0 V720" stroke="#5a4532" stroke-width="4" opacity=".6"/>
  ${leaves}
  ${fam > 0 ? `<g opacity="${cl01(fam * 2)}">${indri(150, 300 + (1 - fam) * 40, .62, 1.7)}${indri(758, 360 + (1 - fam) * 40, .58, 3.1)}</g>` : ''}
  ${indri(466, 330, 1, 0)}
  ${low}
  ${listen > 0 ? `<g transform="translate(460 650)" opacity="${listen}">${[...Array(24)].map((_, i) => { const h = 6 + Math.abs(Math.sin(i * .9 + t * 6)) * 34 * sing + 4; return `<rect x="${-240 + i * 20}" y="${-h / 2}" width="10" height="${h.toFixed(1)}" rx="5" fill="#fff" opacity=".9"/>` }).join('')}</g>` : ''}`
};

// ── 5. Brookesia nana: macro on a fingertip; zoom-out reveals the scale; the measurement goes snout → tail base only
ART.chameleon = (o = {}) => {
  const z = o.zoom ?? 1, meas = o.meas || 0, eye = o.eye || 0, t = o.t || 0;
  const s = 1 + 5.2 * Math.pow(1 - z, 1.3), fx = 466, fy = 352 + 14 * Math.pow(1 - z, 1.3);
  let bok = ''; for (let i = 0; i < 18; i++) bok += `<circle cx="${(rnd(i) * 920).toFixed(0)}" cy="${(rnd(i + 30) * 720).toFixed(0)}" r="${(30 + rnd(i + 5) * 70).toFixed(0)}" fill="${['#9bd27a', '#c7ec9a', '#5fa35a'][i % 3]}" opacity=".35" filter="url(#ch_b)"/>`;
  const cham = `<g transform="translate(470 352)">
    <path d="M38 6 C70 10 84 30 70 46 C60 56 44 50 48 40 C52 32 62 36 58 42" stroke="#8a6a44" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M-52 4 C-50 -16 -20 -26 10 -22 C30 -20 44 -10 44 6 C44 14 20 16 -10 14 C-30 13 -48 12 -52 4Z" fill="#9b7a4f"/>
    <path d="M-44 -2 C-30 -14 0 -18 30 -12" stroke="#6f5534" stroke-width="2.5" fill="none"/>
    <path d="M-52 4 C-62 0 -66 -6 -60 -12 C-54 -16 -46 -12 -42 -8" fill="#a8875a"/>
    <circle cx="-44" cy="-6" r="6.5" fill="#b79464" stroke="#6f5534" stroke-width="1.5"/><circle cx="${(-44 + eye * 2.5).toFixed(1)}" cy="-6" r="2.4" fill="#1d150d"/>
    <path d="M-30 12 L-36 22 M-6 14 L-10 24 M18 14 L22 24 M34 12 L40 22" stroke="#7d6040" stroke-width="5" stroke-linecap="round"/>
   </g>`;
  const L = meas > 0 ? `<g transform="translate(470 352)" opacity="${cl01(meas * 3)}"><path d="M-64 -30 H${(-64 + 106 * cl01(meas * 1.3)).toFixed(1)}" stroke="#2f7bf5" stroke-width="3.5" stroke-linecap="round"/><path d="M-64 -38 V-22 M42 -38 V-22" stroke="#2f7bf5" stroke-width="3.5" stroke-linecap="round" opacity="${cl01(meas * 1.3 - .3)}"/>
     ${meas > .75 ? `<g opacity="${cl01((meas - .75) * 4)}"><rect x="-44" y="-66" width="66" height="24" rx="12" fill="#2f7bf5"/><text x="-11" y="-49" text-anchor="middle" ${F} font-size="14" fill="#fff">13.5 mm</text><path d="M52 18 l14 10" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/><text x="70" y="44" ${F} font-size="11" fill="#fff">tail not counted</text></g>` : ''}</g>` : '';
  return `<defs><filter id="ch_b"><feGaussianBlur stdDeviation="14"/></filter><filter id="ch_dof"><feGaussianBlur stdDeviation="${(3 * (1 - z / .6)).toFixed(2)}"/></filter>
   <radialGradient id="ch_sk" cx=".45" cy=".3" r=".8"><stop offset="0" stop-color="#f6cfb5"/><stop offset=".7" stop-color="#e3a985"/><stop offset="1" stop-color="#c98463"/></radialGradient></defs>
  <rect width="920" height="720" fill="#4f8f4a"/>${bok}
  <g transform="translate(460 360) scale(${s.toFixed(3)}) translate(${-fx} ${-fy})">
   <g filter="${z < .6 ? 'url(#ch_dof)' : ''}"><path d="M300 720 C290 520 330 380 470 368 C610 380 650 520 640 720Z" fill="url(#ch_sk)"/>
   <path d="M400 420 C420 380 520 380 540 420 C548 450 520 470 470 470 C420 470 392 450 400 420Z" fill="#f7e2d6" stroke="#d9a891" stroke-width="2" opacity=".9"/>
   ${[...Array(9)].map((_, i) => `<path d="M${330 + i * 6} ${560 - i * 18} q140 -40 280 0" stroke="#c98463" stroke-width="1.5" fill="none" opacity=".35"/>`).join('')}
   </g>${cham}${L}
  </g>`
};

// ── final row icons (100 × 100 box)
ART.icons = [
  `<path d="M14 84 L26 30 L34 60 L44 16 L54 62 L64 34 L74 66 L86 84Z" fill="#2f7bf5"/>`,
  `<path d="M40 86 C36 60 38 40 44 30 L56 30 C62 40 64 60 60 86Z" fill="#2f7bf5"/><path d="M44 30 L30 16 M47 30 L42 12 M53 30 L58 12 M56 30 L70 16" stroke="#2f7bf5" stroke-width="5" stroke-linecap="round"/>`,
  `<path d="M20 70 C30 62 40 60 50 62 L80 40" stroke="#2f7bf5" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="80" cy="40" r="5" fill="#2f7bf5"/><ellipse cx="30" cy="72" rx="16" ry="10" fill="#2f7bf5"/>`,
  `${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${16 + i * 10}" y="${50 - [10, 22, 34, 18, 30, 14, 8][i]}" width="6" height="${[10, 22, 34, 18, 30, 14, 8][i] * 2}" rx="3" fill="#2f7bf5"/>`).join('')}`,
  `<path d="M16 56 C18 40 44 34 66 40 C78 44 84 52 82 60 C80 66 60 66 40 64 C28 63 18 62 16 56Z" fill="#2f7bf5"/><path d="M82 58 C92 62 90 76 80 74 C74 72 76 66 80 68" stroke="#2f7bf5" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="26" cy="50" r="4" fill="#fff"/>`];
