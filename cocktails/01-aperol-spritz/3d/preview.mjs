import { chromium } from '../../node_modules/playwright/index.mjs'; import { spawn } from 'child_process';
const FPS=30,SEC=3,SHOTS=['zoom','dolly','truck','double'];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:8765/01-aperol-spritz/3d/index.html');await p.waitForFunction(()=>window.preview);await p.evaluate(()=>window.ready);
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-i','-','-vf','scale=540:960','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','mock/camera-moves.mp4']);
const t0=Date.now();
for(const s of SHOTS)for(let i=0;i<FPS*SEC;i++){await p.evaluate(([s,q])=>window.preview(s,q),[s,i/(FPS*SEC-1)]);
  const buf=await p.locator('#wrap').screenshot({type:'jpeg',quality:85});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log('done',Math.round((Date.now()-t0)/1000)+'s',errs.slice(0,3));await b.close();
