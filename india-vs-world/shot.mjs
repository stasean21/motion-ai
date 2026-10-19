import { chromium } from '../cocktails/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--allow-file-access-from-files']});const errs=[];
const only=process.argv[2]?process.argv[2].split(',').map(Number):[1,2,3];
for(const n of only){const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>errs.push(n+': '+e.message));
  await p.goto('file://'+process.cwd()+'/frame.html?f='+n);await p.evaluate(()=>window.ready);await p.screenshot({path:`frames/${n}.png`});await p.close();}
if(!process.argv[2]){const p=await b.newPage({viewport:{width:2000,height:1200}});p.on('pageerror',e=>errs.push('board: '+e.message));
  await p.goto('file://'+process.cwd()+'/board.html');await p.evaluate(()=>window.ready);await p.screenshot({path:'board.png',fullPage:true});}
await b.close();console.log(errs);
