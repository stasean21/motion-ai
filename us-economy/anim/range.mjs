// перерендер отрезка [a,b) таймлайна → out/seg-<a>.mp4 (те же FPS и подкадры, что у render.mjs)
import { spawn } from 'child_process'; import { open, grab } from './page.mjs';
const a=+process.argv[2],b=+process.argv[3],FPS=+(process.env.FPS||30),SUB=3;
const {b:br,p,errs}=await open();
const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS*SUB),'-i','-','-vf',`tmix=frames=${SUB},select='not(mod(n\\,${SUB}))',setpts=N/${FPS}/TB`,'-r',String(FPS),'-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium',`out/seg-${a}.mp4`]);
const N=Math.round((b-a)*FPS)*SUB;for(let i=0;i<N;i++){const k=Math.floor(i/SUB),j=i%SUB,t=a+k/FPS-(SUB-1-j)/(FPS*SUB);
  const d=await grab(p,t,.93);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();console.log('seg',a,b,errs.length);
