#!/bin/bash
# resumable render: 7 chunks of 9 s, then concat → ../out/v2_muted.mp4
cd "$(dirname "$0")"; mkdir -p ../out/chunks
for s in 0 9 18 27 36 45 54; do e=$((s+9)); f=../out/chunks/c$(printf %02d $s).mp4
  [ -s "$f" ] && continue
  PAGE=v2.html NODE_PATH=/opt/node22/lib/node_modules node render.cjs "$f.tmp.mp4" $s $e 4 >> ../out/render.log 2>&1 && mv "$f.tmp.mp4" "$f"
  echo "chunk $s done $(date +%T)" >> ../out/render.log
done
ls ../out/chunks/c*.mp4 | sed "s#^#file '$PWD/#;s#\$#'#" > ../out/chunks/list.txt
ffmpeg -y -v error -f concat -safe 0 -i ../out/chunks/list.txt -c copy ../out/v2_muted.mp4 && echo ALLDONE >> ../out/render.log
