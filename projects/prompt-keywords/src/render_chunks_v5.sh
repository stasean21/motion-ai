#!/bin/bash
# resumable render of v5.html: 9 chunks of 9 s → ../out/v5_muted.mp4
cd "$(dirname "$0")"; mkdir -p ../out/chunks5
for s in 0 9 18 27 36 45 54 63 72; do e=$((s+9)); f=../out/chunks5/c$(printf %02d $s).mp4
  [ -s "$f" ] && continue
  PAGE=v5.html NODE_PATH=/opt/node22/lib/node_modules node render.cjs "$f.tmp.mp4" $s $e 4 >> ../out/render5.log 2>&1 && mv "$f.tmp.mp4" "$f"
  echo "chunk $s done $(date +%T)" >> ../out/render5.log
done
ls ../out/chunks5/c*.mp4 | sed "s#^#file '$PWD/#;s#\$#'#" > ../out/chunks5/list.txt
ffmpeg -y -v error -f concat -safe 0 -i ../out/chunks5/list.txt -c copy ../out/v5_muted.mp4 && echo ALLDONE >> ../out/render5.log
