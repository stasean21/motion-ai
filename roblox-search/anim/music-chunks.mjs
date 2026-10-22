// музыка выпуска 05 кусками по CH секунд (с запасом PRE на стыке) — параллельно; потом stitch.py
// одна дорожка через весь выпуск; фактура меняется в середине (4:00), ещё раз к 5:30 и на финальной пятёрке
import fs from 'fs'; import { open } from './page.mjs';
const [k,CH,PRE]=[+process.argv[2],+(process.argv[3]||60),4];
const {b,p,errs}=await open();
const wav=await p.evaluate(async([k,CH,PRE])=>{const F5=STEPS[N5].t0,M=STEPS[STEPS.length-1],top=M.t0+M.K.barEnd;
  const lvl=t=>t<8?1:t<S_T0?.5:t<240?1:t<330?2:t<F5?3:t<FIN?4:1,drumsOff=t=>t>=FIN+15;
  return toWav(await makeMusic(DURATION,{intro:1.5,lvl,drumsOff,hits:[[240,'res'],[F5,'rise'],[top,'rise'],[top,'res']],T0:k*CH,L:CH,PRE}),.6);},[k,CH,PRE]);
fs.writeFileSync(`out/music-${k}.wav`,Buffer.from(wav,'base64'));await b.close();console.log('chunk',k,errs.length);
