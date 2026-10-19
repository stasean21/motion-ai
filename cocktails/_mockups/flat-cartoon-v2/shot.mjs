import { chromium } from '../../node_modules/playwright/index.mjs';
const page=process.argv[2]||'hero';const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+process.cwd()+`/${page}.html`);await p.evaluate(()=>window.ready);await p.waitForTimeout(200);
await p.screenshot({path:`${page}.png`,clip:{x:0,y:0,width:1080,height:1920}});await b.close();console.log(errs);
