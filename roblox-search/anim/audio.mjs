// эффекты выпуска 05 → out/sfx.wav
import fs from 'fs'; import { open } from './page.mjs';
const {b,p,errs}=await open();
fs.writeFileSync('out/sfx.wav',Buffer.from(await p.evaluate(()=>makeAudio(DURATION)),'base64'));await b.close();console.log('sfx',errs.length);
