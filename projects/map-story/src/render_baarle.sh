#!/bin/bash
# resumable render of baarle_video.html: 10 s chunks → projects/baarle-door/out/baarle_muted.mp4
cd "$(dirname "$0")"; O=../../baarle-door/out; mkdir -p $O/chunks
for s in 0 10 20 30 40 50 60 70; do e=$((s+10)); f=$O/chunks/c$(printf %03d $s).mp4
  [ -s "$f" ] && continue
  PAGE=baarle_video.html NODE_PATH=/opt/node22/lib/node_modules node render.cjs "$f.tmp.mp4" $s $e 4 >> $O/render.log 2>&1 && mv "$f.tmp.mp4" "$f"
  echo "chunk $s done $(date +%T)" >> $O/render.log
done
ls $O/chunks/c*.mp4 | sed "s#^#file '$PWD/#;s#\$#'#" > $O/chunks/list.txt
ffmpeg -y -v error -f concat -safe 0 -i $O/chunks/list.txt -c copy $O/baarle_muted.mp4 && echo ALLDONE >> $O/render.log
