// склейка частей + звук → out/intro.mp4
import fs from 'fs'; import { execFileSync } from 'child_process';
const parts=fs.readdirSync('out').filter(f=>/^part-\d+\.mp4$/.test(f)).sort((a,b)=>parseInt(a.slice(5))-parseInt(b.slice(5)));
const src=parts.length?parts.map(f=>'out/'+f):['out/tmp-'+(process.env.NAME||'china-electricity')+'.mp4'];
fs.writeFileSync('out/parts.txt',src.map(f=>`file '${f.slice(4)}'`).join('\n'));
execFileSync('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i','out/parts.txt','-i','out/track.wav','-map','0:v','-map','1:a','-c:v','copy','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','44100','-c:a','aac','-b:a','192k','-t',String(process.env.DUR||14),'-movflags','+faststart','out/'+(process.env.NAME||'china-electricity')+'.mp4']);
for(const f of src)fs.unlinkSync(f);fs.unlinkSync('out/parts.txt');console.log('done',process.env.NAME||'china-electricity');
