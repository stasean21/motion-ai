// usage: node shots.cjs page.html outdir A,B,C — one screenshot per #variant
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
(async () => {
  const [pg, dir, vs] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ args: ['--font-render-hinting=none'] });
  for (const v of vs.split(',')) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on('pageerror', e => console.error('PAGEERR', v, e.message));
    await p.goto('file://' + path.resolve(pg) + '#' + v); await p.waitForFunction('window.ready===true');
    await p.screenshot({ path: `${dir}/${v}.jpg`, type: 'jpeg', quality: 90 }); await p.close();
  }
  await b.close();
})();
