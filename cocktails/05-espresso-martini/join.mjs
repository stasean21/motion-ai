// склейка частей + звук → out/<name>.mp4
import fs from 'fs'; import { execFileSync } from 'child_process';
const NAME=process.argv[2]||'espresso-martini',PARTS=+(process.argv[3]||1);
fs.writeFileSync('out/parts.txt',Array.from({length:PARTS},(_,i)=>`file 'part-${i}.mp4'`).join('\n'));
execFileSync('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i','out/parts.txt','-i','out/track-en.wav','-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t','34',`out/${NAME}.mp4`]);
for(let i=0;i<PARTS;i++)fs.unlinkSync(`out/part-${i}.mp4`);fs.unlinkSync('out/parts.txt');console.log('done',`out/${NAME}.mp4`);
