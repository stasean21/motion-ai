// новая музыка для пробы стиля: SFX из таймлайна (без старой музыки) + непрерывная музыка по референсу
import fs from 'fs'; import { execFileSync } from 'child_process'; import { open } from './page.mjs';
const {b,p,errs}=await open();
fs.writeFileSync('out/sfx-sample.wav',Buffer.from(await p.evaluate(()=>makeAudio(80,{music:false})),'base64'));
fs.writeFileSync('out/music-sample.wav',Buffer.from(await p.evaluate(async()=>toWav(await makeMusic(14,{intro:1.2}))),'base64'));
fs.writeFileSync('out/music-demo.wav',Buffer.from(await p.evaluate(async()=>toWav(await makeMusic(40,{intro:2.2,outro:4}))),'base64'));
await b.close();
const SEGS=[[0.4,5.4],[69.6,78.6]];
const fc=SEGS.map(([a,z],k)=>`[1:a]atrim=${a}:${z},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=${(z-a-.06).toFixed(2)}:d=0.06[s${k}]`).join(';')+
  `;[s0][s1]concat=n=2:v=0:a=1,volume=1.0[sfx];[2:a]volume=0.55[mus];[sfx][mus]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
execFileSync('ffmpeg',['-y','-v','error','-i','out/us-economy-style-test.mp4','-i','out/sfx-sample.wav','-i','out/music-sample.wav','-filter_complex',fc,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','44100','-movflags','+faststart','out/us-economy-style-test-music.mp4']);
execFileSync('ffmpeg',['-y','-v','error','-i','out/music-demo.wav','-c:a','libmp3lame','-b:a','192k','out/music-demo.mp3']);
console.log('errors',errs,'done');
