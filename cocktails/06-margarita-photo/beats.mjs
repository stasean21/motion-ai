// Кадр каждые 0.5 с (32 кадра) → out/storyboard.jpg; второй аргумент clean — версия без текста
import { chromium } from 'playwright'; import fs from 'fs'; import { execFileSync } from 'child_process';
const off=parseFloat(process.argv[2]||'0.25'), CLEAN=process.argv[3]==='clean', SUF=CLEAN?'-clean':'';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('file://'+process.cwd()+'/index.html'+(CLEAN?'?text=0':''));await p.evaluate(()=>window.ready);
fs.rmSync('out/beats'+SUF,{recursive:true,force:true});fs.mkdirSync('out/beats'+SUF,{recursive:true});
for(let i=0;i<32;i++){const d=await p.evaluate(async t=>{await seek(t);return document.getElementById('c').toDataURL('image/jpeg',.8)},i*.5+off);
  fs.writeFileSync(`out/beats${SUF}/${String(i+1).padStart(2,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64'));}
await b.close();
execFileSync('ffmpeg',['-y','-v','error','-pattern_type','glob','-i',`out/beats${SUF}/*.jpg`,'-vf','scale=270:480,tile=8x4:padding=6:color=white','-frames:v','1',`out/storyboard${SUF}.jpg`]);
console.log('errors',errs);
