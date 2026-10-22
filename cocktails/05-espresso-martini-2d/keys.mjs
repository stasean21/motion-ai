// Выбранные кадры → out/keys.jpg: node keys.mjs 1.8,5.5,...
import { chromium } from 'playwright'; import fs from 'fs'; import { execFileSync } from 'child_process';
const TS=(process.argv[2]||'1.8,5.5,8.9,11.2,12.9,15.4,19.2,21.0,23.8,26.5,30,33').split(',').map(Number);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html?lang=en');await p.evaluate(()=>window.ready);
fs.rmSync('out/keys',{recursive:true,force:true});fs.mkdirSync('out/keys',{recursive:true});
for(const [i,t] of TS.entries()){const d=await p.evaluate(async t=>{await seek(t);return document.getElementById('c').toDataURL('image/jpeg',.85)},t);
  fs.writeFileSync(`out/keys/${String(i).padStart(2,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();
const cols=Math.min(6,TS.length);
execFileSync('ffmpeg',['-y','-v','error','-pattern_type','glob','-i','out/keys/*.jpg','-vf',`scale=360:640,tile=${cols}x${Math.ceil(TS.length/cols)}:padding=6:color=white`,'-frames:v','1','out/keys.jpg']);
console.log('errors',errs);
