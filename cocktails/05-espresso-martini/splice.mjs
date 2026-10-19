// подмена отрезка [T0,T1) в готовом видео перерендеренными частями + новый звук → out/<name>.mp4
import fs from 'fs'; import { execFileSync } from 'child_process';
const [NAME,SRC,T0,T1,PARTS]=[process.argv[2],process.argv[3],+process.argv[4],+process.argv[5],+(process.argv[6]||2)];
const ins=['-i',SRC];for(let i=0;i<PARTS;i++)ins.push('-i',`out/part-${i}.mp4`);ins.push('-i','out/track-en.wav');
const parts=Array.from({length:PARTS},(_,i)=>`[${i+1}:v]setpts=PTS-STARTPTS[p${i}]`).join(';');
const fc=`[0:v]trim=0:${T0},setpts=PTS-STARTPTS[a];[0:v]trim=${T1}:34,setpts=PTS-STARTPTS[b];${parts};[a]${Array.from({length:PARTS},(_,i)=>`[p${i}]`).join('')}[b]concat=n=${PARTS+2}:v=1:a=0[v]`;
execFileSync('ffmpeg',['-y','-v','error',...ins,'-filter_complex',fc,'-map','[v]','-map',`${PARTS+1}:a`,'-r','60','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','medium','-c:a','aac','-b:a','192k','-t','34',`out/${NAME}.mp4`]);
for(let i=0;i<PARTS;i++)fs.unlinkSync(`out/part-${i}.mp4`);console.log('done',`out/${NAME}.mp4`);
