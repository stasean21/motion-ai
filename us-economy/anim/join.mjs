// склейка частей + сведение: эффекты + музыка (−4.4 дБ в окнах реплик диктора из брифа) → out/<NAME>.mp4
import fs from 'fs'; import { execFileSync } from 'child_process';
const NAME=process.env.NAME||'us-economy',DUR=String(process.env.DUR||501);
const parts=fs.readdirSync('out').filter(f=>/^part-\d+\.mp4$/.test(f)).sort((a,b)=>parseInt(a.slice(5))-parseInt(b.slice(5)));
fs.writeFileSync('out/parts.txt',parts.map(f=>`file '${f}'`).join('\n'));
const VO=[[0,12],[12,26],[98,106],[178,186],[258,266],[338,346],[394,406],[430,450],[450,470],[470,486],[486,501]];
const duck=VO.map(([a,b])=>`between(t,${a},${b})`).join('+');
const fc=`[2:a]volume=0.5,volume=0.6:enable='${duck}'[m];[1:a][m]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]`;
execFileSync('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i','out/parts.txt','-i','out/sfx.wav','-i','out/music.wav','-filter_complex',fc,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','44100','-t',DUR,'-movflags','+faststart',`out/${NAME}.mp4`]);
for(const f of parts)fs.unlinkSync('out/'+f);fs.unlinkSync('out/parts.txt');console.log('done',NAME);
