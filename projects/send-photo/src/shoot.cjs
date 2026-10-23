const { chromium } = require('playwright'); const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.error('ERR',e.message));
for(const id of process.argv[3].split(',')){await p.goto('file://'+path.resolve(__dirname,'mockup.html')+'#'+id);await p.reload();await p.waitForFunction('window.ready===true');await p.waitForTimeout(150);
await p.screenshot({path:`${process.argv[2]}/frame_${id}.png`});}await b.close()})();
