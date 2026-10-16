// Один кадр на каждый удар (60 ударов) → out/storyboard.jpg
import { chromium } from 'playwright'; import fs from 'fs'; import { execFileSync } from 'child_process';
const off=parseFloat(process.argv[2]||'0.35'), LANG=process.argv[3]||'ru', SUF=LANG==='ru'?'':'-'+LANG;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/index.html?lang='+LANG);await p.evaluate(()=>window.ready);
fs.mkdirSync('out/beats'+SUF,{recursive:true});
for(let i=0;i<68;i++){const d=await p.evaluate(async t=>{await seek(t);return document.getElementById('c').toDataURL('image/jpeg',.8)},i*.5+off);
  fs.writeFileSync(`out/beats${SUF}/${String(i+1).padStart(2,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();
execFileSync('ffmpeg',['-y','-v','error','-pattern_type','glob','-i',`out/beats${SUF}/*.jpg`,'-vf','scale=216:384,tile=12x6:padding=6:color=white','-frames:v','1',`out/storyboard${SUF}.jpg`]);
console.log('errors',errs);
