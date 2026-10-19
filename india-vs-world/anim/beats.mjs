// контактный лист: node beats.mjs [шаг=0.5] [t1,t2,...] → out/keys.jpg; плюс время на кадр (проба)
import fs from 'fs'; import { execFileSync } from 'child_process'; import { open, grab } from './page.mjs';
const step=+(process.argv[2]||.5),list=process.argv[3]?process.argv[3].split(',').map(Number):Array.from({length:Math.round(14/step)},(_,i)=>i*step+step/2);
const {b,p,errs}=await open();fs.rmSync('out/beats',{recursive:true,force:true});fs.mkdirSync('out/beats',{recursive:true});
const t0=Date.now();for(const [i,t] of list.entries())fs.writeFileSync(`out/beats/${String(i).padStart(3,'0')}.jpg`,Buffer.from((await grab(p,t,.8)).split(',')[1],'base64'));
console.log('мс/кадр',Math.round((Date.now()-t0)/list.length));await b.close();
const cols=list.length>16?6:4;execFileSync('ffmpeg',['-y','-v','error','-pattern_type','glob','-i','out/beats/*.jpg','-vf',`scale=480:270,drawtext=text='%{n}':x=8:y=8:fontsize=20:fontcolor=white,tile=${cols}x${Math.ceil(list.length/cols)}:padding=4:color=white`,'-frames:v','1','out/keys.jpg']);
console.log('errors',errs,list.join(' '));
