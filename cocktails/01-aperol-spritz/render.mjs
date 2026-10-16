// 60 fps, 3 подкадра на кадр (tmix) → out/video.mp4, затем звук → out/<name>.mp4
import { chromium } from 'playwright'; import fs from 'fs'; import { spawn, execFileSync } from 'child_process';
const NAME=process.argv[2]||'video', LANG=process.argv[3]||'ru', DUR=30, FPS=60, SUB=3;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html?lang='+LANG);await p.evaluate(()=>window.ready);
fs.writeFileSync(`out/track-${LANG}.wav`,Buffer.from(await p.evaluate(()=>makeAudio()),'base64'));
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS*SUB),'-i','-','-vf',`tmix=frames=${SUB},select='not(mod(n\\,${SUB}))',setpts=N/${FPS}/TB`,'-r',String(FPS),'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium',`out/tmp-${NAME}.mp4`]);
ff.stderr.on('data',d=>process.stderr.write(d));
const N=DUR*FPS*SUB,t0=Date.now();
for(let i=0;i<N;i++){const d=await p.evaluate(async t=>{await seek(t);return document.getElementById('c').toDataURL('image/jpeg',.93)},i/(FPS*SUB));
  if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%1800===0)console.log(i,'/',N,Math.round((Date.now()-t0)/1000)+'s');}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
execFileSync('ffmpeg',['-y','-v','error','-i',`out/tmp-${NAME}.mp4`,'-i',`out/track-${LANG}.wav`,'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(DUR),`out/${NAME}.mp4`]);
fs.unlinkSync(`out/tmp-${NAME}.mp4`);console.log('errors',errs,'done',`out/${NAME}.mp4`);
