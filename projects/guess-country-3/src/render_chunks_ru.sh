#!/bin/bash
# resumable render of gtc.html (Part 3, 89 s): 10 s chunks → ../out/gtc_ru_muted.mp4
cd "$(dirname "$0")"; O=../out; mkdir -p $O/chunks_ru
for s in 0 10 20 30 40 50 60 70 80; do e=$((s+10)); [ $s -eq 80 ] && e=89; f=$O/chunks_ru/c$(printf %03d $s).mp4
  [ -s "$f" ] && continue
  PAGE=gtc_ru.html NODE_PATH=/opt/node22/lib/node_modules node render.cjs "$f.tmp.mp4" $s $e 4 >> $O/render_ru.log 2>&1 && mv "$f.tmp.mp4" "$f"
  echo "chunk $s done $(date +%T)" >> $O/render_ru.log
done
ls $O/chunks_ru/c*.mp4 | sed "s#^#file '$PWD/#;s#\$#'#" > $O/chunks_ru/list.txt
ffmpeg -y -v error -f concat -safe 0 -i $O/chunks_ru/list.txt -c copy $O/gtc_ru_muted.mp4 && echo ALLDONE >> $O/render_ru.log
