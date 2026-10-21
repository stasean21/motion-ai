// проба стиля: несколько отрезков таймлайна → один ролик со звуком (out/us-economy-style-test.mp4)
import fs from 'fs'; import { spawn, execFileSync } from 'child_process'; import { open, grab } from './page.mjs';
const SEGS=[[0.4,5.4],[69.6,78.6]],FPS=60,SUB=3;
const {b,p,errs}=await open();
fs.writeFileSync('out/track-sample.wav',Buffer.from(await p.evaluate(D=>makeAudio(D),80),'base64'));
for(const [k,[a,z]] of SEGS.entries()){const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS*SUB),'-i','-','-vf',`tmix=frames=${SUB},select='not(mod(n\\,${SUB}))',setpts=N/${FPS}/TB`,'-r',String(FPS),'-c:v','libx264','-pix_fmt','yuv420p','-crf','17',`out/seg-${k}.mp4`]);
  const N=Math.round((z-a)*FPS)*SUB;for(let i=0;i<N;i++){const kf=Math.floor(i/SUB),j=i%SUB,t=a+kf/FPS-(SUB-1-j)/(FPS*SUB);
    const d=await grab(p,t,.93);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));}
await b.close();
// звук: те же отрезки из общей дорожки, короткие переходы на стыке
const fc=SEGS.map(([a,z],k)=>`[${SEGS.length}:a]atrim=${a}:${z},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(z-a-.06).toFixed(2)}:d=0.06[a${k}]`).join(';')+';'+SEGS.map((_,k)=>`[${k}:v][a${k}]`).join('')+`concat=n=${SEGS.length}:v=1:a=1[v][a]`;
execFileSync('ffmpeg',['-y','-v','error',...SEGS.flatMap((_,k)=>['-i',`out/seg-${k}.mp4`]),'-i','out/track-sample.wav','-filter_complex',fc,'-map','[v]','-map','[a]','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-c:a','aac','-b:a','192k','-movflags','+faststart','out/us-economy-style-test.mp4']);
for(const k in SEGS)fs.unlinkSync(`out/seg-${k}.mp4`);console.log('errors',errs,'done');
