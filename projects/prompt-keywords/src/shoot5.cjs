// node shoot4.cjs <outdir> — one PNG per section of mockup5.html + contact sheet input
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const K = ['hook', 'announce', 'productshot', 'softlight', 'hardlight', 'rimlight', 'goldenhour', 'macro', 'lowangle', 'minimal', 'editorial', 'motionblur', 'save'];
(async () => {
  const dir = process.argv[2]; fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [i, k] of K.entries()) {
    await p.goto('file://' + path.resolve(__dirname, 'mockup5.html') + '#' + k); await p.reload(); await p.waitForFunction('window.ready===true');
    await p.screenshot({ path: `${dir}/${String(i + 1).padStart(2, '0')}_${k}.jpg`, type: 'jpeg', quality: 90 });
  }
  await b.close();
})();
