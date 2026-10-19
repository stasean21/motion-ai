// кадр на каждый удар → out/storyboard-en.jpg; node beats.mjs [offset] [t1,t2,... → out/keys.jpg]
import fs from 'fs'; import { execFileSync } from 'child_process'; import { open, grab } from './page.mjs';
const off=parseFloat(process.argv[2]||'0.35'),list=process.argv[3]?.split(',').map(Number);
const {b,p,errs}=await open();const dir=list?'out/keys':'out/beats-en';fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const ts=list||Array.from({length:68},(_,i)=>i*.5+off);
for(const [i,t] of ts.entries()){const d=await grab(p,t,.8);fs.writeFileSync(`${dir}/${String(i).padStart(2,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();
execFileSync('ffmpeg',['-y','-v','error','-pattern_type','glob','-i',`${dir}/*.jpg`,'-vf',list?`scale=360:640,tile=${Math.min(6,ts.length)}x${Math.ceil(ts.length/6)}:padding=6:color=white`:'scale=216:384,tile=12x6:padding=6:color=white','-frames:v','1',list?'out/keys.jpg':'out/storyboard-en.jpg']);
console.log('errors',errs);
