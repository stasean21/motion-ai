import { chromium } from '../../node_modules/playwright/index.mjs'; import fs from 'fs'; import { execFileSync } from 'child_process';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const fr=(process.argv[2]||'1,2,3,4').split(',');
for(const f of fr){await p.goto('http://127.0.0.1:8766/_mockups/stylized-3d/mockup3d.html?f='+f);await p.waitForFunction(()=>window.done,null,{timeout:180000});
  const d=await p.evaluate(()=>document.getElementById('gl').toDataURL('image/png'));fs.writeFileSync(`frame-${f}.png`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();
execFileSync('ffmpeg',['-y','-v','error','-i','frame-1.png','-i','frame-4.png','-i','frame-2.png','-i','frame-3.png','-filter_complex','[0][1][2][3]hstack=4,scale=2160:-1','mockup-sheet.jpg']);console.log(errs.filter(e=>!e.includes('404')));
