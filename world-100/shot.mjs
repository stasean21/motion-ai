import { chromium } from '../cocktails/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];
for(const n of [1,2,3,4,5,6,7,8]){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>errs.push(n+': '+e.message));
  await p.goto('file://'+process.cwd()+'/board.html?p='+n);await p.evaluate(()=>window.ready);await p.screenshot({path:`panels/${n}.png`,clip:{x:0,y:0,width:1920,height:1080}});await p.close();}
const p=await b.newPage({viewport:{width:2000,height:1200}});p.on('pageerror',e=>errs.push('board: '+e.message));await p.goto('file://'+process.cwd()+'/board.html');await p.evaluate(()=>window.ready);
await p.screenshot({path:'storyboard.png',fullPage:true});await b.close();console.log(errs);
