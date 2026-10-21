// музыка выпуска 04 кусками по CH секунд (с запасом PRE на стыке) — параллельно; потом склейка
import fs from 'fs'; import { open } from './page.mjs';
const [k,CH,PRE]=[+process.argv[2],+(process.argv[3]||60),4];
const {b,p,errs}=await open();
const wav=await p.evaluate(async([k,CH,PRE])=>{const c10=crossT(STEPS[30],TPOP*.1),c25=crossT(STEPS[39],TPOP*.25),c50=crossT(STEPS[44],TPOP*.5),c100=crossT(DE,TPOP);
  const lvl=t=>t<12?1:t<26?.5:t<c10?1:t<c25?2:t<c50?3:4,drumsOff=t=>(t>=GB.t0+12.2&&t<c100)||t>=FIN+10;
  return toWav(await makeMusic(DURATION,{intro:1.5,lvl,drumsOff,hits:[[FR.t0+4,'rise'],[c100,'rise'],[c100,'res'],[c50,'res']],T0:k*CH,L:CH,PRE}),.6);},[k,CH,PRE]);
fs.writeFileSync(`out/music-${k}.wav`,Buffer.from(wav,'base64'));await b.close();console.log('chunk',k,errs.length);
