// 1920×1080, 60 fps, 3 подкадра (tmix) → out/intro.mp4 со звуком AAC. Аргументы: [часть частей] для параллели
import fs from 'fs'; import { spawn, execFileSync } from 'child_process'; import { open, grab } from './page.mjs';
const PART=+(process.argv[2]||0),PARTS=+(process.argv[3]||1),DUR=+(process.env.DUR||14),FPS=+(process.env.FPS||60),SUB=3,N=DUR*FPS*SUB,a=Math.round(N*PART/PARTS/SUB)*SUB,z=Math.round(N*(PART+1)/PARTS/SUB)*SUB;
const {b,p,errs}=await open();

const out=PARTS>1?`out/part-${PART}.mp4`:'out/tmp-'+(process.env.NAME||'us-economy')+'.mp4';
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS*SUB),'-i','-','-vf',`tmix=frames=${SUB},select='not(mod(n\\,${SUB}))',setpts=N/${FPS}/TB`,'-r',String(FPS),'-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium',out]);
ff.stderr.on('data',d=>process.stderr.write(d));const t0=Date.now();
// подкадры кадра k: t=k/FPS - (SUB-1-j)/(FPS*SUB) — размытие «назад», кадр 0 без отрицательного времени
for(let i=a;i<z;i++){const k=Math.floor(i/SUB),j=i%SUB,t=Math.max(0,k/FPS-(SUB-1-j)/(FPS*SUB));
  const d=await grab(p,t,.93);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));
  if((i-a)%900===0)console.log(PART,i-a,'/',z-a,Math.round((Date.now()-t0)/1000)+'s');}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('errors',errs);
