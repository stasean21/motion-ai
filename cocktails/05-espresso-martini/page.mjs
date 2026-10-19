// общий запуск: локальный http (ES-модули three), swiftshader WebGL
import { chromium } from '../node_modules/playwright/index.mjs'; import { spawn } from 'child_process'; import net from 'net';
export const PORT=8766;
async function up(){return new Promise(r=>{const s=net.connect(PORT,'127.0.0.1',()=>{s.end();r(true);});s.on('error',()=>r(false));});}
export async function open(){if(!await up()){spawn('python3',['-m','http.server',String(PORT),'--bind','127.0.0.1'],{cwd:'..',stdio:'ignore',detached:true}).unref();for(let i=0;i<30&&!await up();i++)await new Promise(r=>setTimeout(r,200));}
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:1080,height:1920}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
  await p.goto(`http://127.0.0.1:${PORT}/05-espresso-martini/index.html`);await p.waitForFunction(()=>window.ready,null,{timeout:120000});await p.evaluate(()=>window.ready);return{b,p,errs};}
export const grab=(p,t,q=.9)=>p.evaluate(async([t,q])=>{await seek(t);return document.getElementById('c').toDataURL('image/jpeg',q)},[t,q]);
