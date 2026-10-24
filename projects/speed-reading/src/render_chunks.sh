#!/bin/bash
# resumable render of reading.html: 15 s chunks → ../out/ru_muted.mp4
cd "$(dirname "$0")"; mkdir -p ../out/chunks
for s in 0 15 30 45 60 75 90 105 120; do e=$((s+15)); [ $s -eq 120 ] && e=135.36667; f=../out/chunks/c$(printf %03d $s).mp4
  [ -s "$f" ] && continue
  PAGE=reading.html NODE_PATH=/opt/node22/lib/node_modules node render.cjs "$f.tmp.mp4" $s $e 4 >> ../out/render.log 2>&1 && mv "$f.tmp.mp4" "$f"
  echo "chunk $s done $(date +%T)" >> ../out/render.log
done
ls ../out/chunks/c*.mp4 | sed "s#^#file '$PWD/#;s#\$#'#" > ../out/chunks/list.txt
ffmpeg -y -v error -f concat -safe 0 -i ../out/chunks/list.txt -c copy ../out/ru_muted.mp4 && echo ALLDONE >> ../out/render.log
