// звук выпуска 04 отдельно от видео: эффекты (sfx.wav) и музыка из демо с секциями по брифу (music.wav)
import fs from 'fs'; import { open } from './page.mjs';
const what=process.argv[2]||'both',{b,p,errs}=await open();
if(what!=='music')fs.writeFileSync('out/sfx.wav',Buffer.from(await p.evaluate(()=>makeAudio(DURATION)),'base64'));
if(what!=='sfx')fs.writeFileSync('out/music.wav',Buffer.from(await p.evaluate(async()=>{
  const c10=crossT(STEPS[30],TPOP*.1),c25=crossT(STEPS[39],TPOP*.25),c50=crossT(STEPS[44],TPOP*.5),c100=crossT(DE,TPOP);
  // уровни: вступление 1 → правила 0.5 → страны 1 → после 10% 2 → после 25% 3 → после 50% 4; провал под разрывом Великобритании; тихий финал
  const lvl=t=>t<12?1:t<26?.5:t<c10?1:t<c25?2:t<c50?3:4;
  const drumsOff=t=>(t>=GB.t0+12.2&&t<c100)||t>=FIN+10;
  return toWav(await makeMusic(DURATION,{intro:1.5,outro:0,lvl,drumsOff,hits:[[FR.t0+4,'rise'],[c100,'rise'],[c100,'res'],[c50,'res']]}));}),'base64'));
await b.close();console.log('errors',errs);
