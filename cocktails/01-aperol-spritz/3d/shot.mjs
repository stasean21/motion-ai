import { chromium } from '../../node_modules/playwright/index.mjs'; import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://127.0.0.1:8765/01-aperol-spritz/3d/index.html');await p.waitForFunction(()=>window.ready&&window.shot);await p.evaluate(()=>window.ready);
fs.mkdirSync('mock',{recursive:true});
for(const k of ['title','pour','final']){const t0=Date.now();await p.evaluate(k=>window.shot(k),k);await p.locator('#wrap').screenshot({path:`mock/${k}.jpg`,quality:90});console.log(k,Date.now()-t0,'ms');}
console.log('errors',errs.slice(0,5));await b.close();
