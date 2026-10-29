// usage: node render.cjs <out.mp4> [start] [end] [workers] [stepFrames] ; or: node render.cjs --stills t1,t2,... outdir
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
const FPS = 60, URL = 'file://' + path.resolve(__dirname, process.env.PAGE || 'gtc.html');
async function page(browser) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto(URL); await p.waitForFunction('window.ready===true'); return p;
}
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--font-render-hinting=none'] });
  if (process.argv[2] === '--stills') {
    const ts = process.argv[3].split(',').map(Number), dir = process.argv[4]; fs.mkdirSync(dir, { recursive: true });
    const p = await page(browser);
    for (const t of ts) { await p.evaluate(t => renderAt(t), t); await p.screenshot({ path: `${dir}/t${t.toFixed(2).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 88 }); }
    if (process.argv[5] === 'meta') fs.writeFileSync(dir + '/meta.json', JSON.stringify(await p.evaluate(() => ({ SFX, SCN })), null, 1));
    await browser.close(); return;
  }
  const out = process.argv[2], start = +(process.argv[3] || 0), end = +(process.argv[4] || 89), W = +(process.argv[5] || 4);
  const f0 = Math.round(start * FPS), f1 = Math.round(end * FPS), n = f1 - f0, per = Math.ceil(n / W);
  const t0 = Date.now(); const parts = [];
  await Promise.all([...Array(W)].map(async (_, k) => {
    const a = f0 + k * per, b = Math.min(f1, a + per); if (a >= b) return;
    const part = `${out}.part${k}.mp4`; parts[k] = part;
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(FPS), part], { stdio: ['pipe', 'inherit', 'inherit'] });
    const p = await page(browser);
    for (let f = a; f < b; f++) {
      await p.evaluate(t => renderAt(t), f / FPS);
      const buf = await p.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (k === 0 && (f - a) % 120 === 0) console.log(`w0 ${f - a}/${b - a}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  await browser.close();
  const list = out + '.txt'; fs.writeFileSync(list, parts.filter(Boolean).map(p => `file '${path.resolve(p)}'`).join('\n'));
  await new Promise(r => spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
  parts.filter(Boolean).forEach(p => fs.unlinkSync(p)); fs.unlinkSync(list);
  console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
