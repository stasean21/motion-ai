// 60 fps, SUB подкадров (tmix) → out/<name>.mp4 со звуком. Можно резать на части: node render.mjs name part parts
import fs from 'fs'; import { spawn, execFileSync } from 'child_process'; import { open } from './page.mjs';
const NAME=process.argv[2]||'espresso-martini',PART=+(process.argv[3]||0),PARTS=+(process.argv[4]||1),DUR=34,FPS=60,SUB=2;
const {b,p,errs}=await open();
if(PART===0)fs.writeFileSync('out/track-en.wav',Buffer.from(await p.evaluate(()=>makeAudio()),'base64'));
const N=DUR*FPS*SUB,a=Math.floor(N*PART/PARTS),z=Math.floor(N*(PART+1)/PARTS);
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS*SUB),'-i','-','-vf',`tmix=frames=${SUB},select='not(mod(n\\,${SUB}))',setpts=N/${FPS}/TB`,'-r',String(FPS),'-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium',`out/part-${PART}.mp4`]);
ff.stderr.on('data',d=>process.stderr.write(d));const t0=Date.now();
for(let i=a;i<z;i++){const d=await p.evaluate(async t=>{await seek(t);return document.getElementById('c').toDataURL('image/jpeg',.93)},i/(FPS*SUB));
  if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));
  if((i-a)%600===0)console.log(PART,i-a,'/',z-a,Math.round((Date.now()-t0)/1000)+'s');}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('errors',errs,'part done',PART);
