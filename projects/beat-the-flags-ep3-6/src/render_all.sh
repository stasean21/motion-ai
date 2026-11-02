#!/bin/bash
# resumable render of parts 3–6 (97.5 s each, 10 s chunks) → ../out/epN/btfN_muted.mp4; muxed with the soundtrack when it exists
cd "$(dirname "$0")"; L=../out/render.log
for n in 3 4 5 6; do O=../out/ep$n; mkdir -p $O/chunks
  for s in 0 10 20 30 40 50 60 70 80 90; do e=$((s+10)); [ $s -eq 90 ] && e=97.5; f=$O/chunks/c$(printf %03d $s).mp4
    [ -s "$f" ] && continue
    PAGE=btf$n.html NODE_PATH=/opt/node22/lib/node_modules node render.cjs "$f.tmp.mp4" $s $e 4 >> $L 2>&1 && mv "$f.tmp.mp4" "$f"
    echo "ep$n chunk $s done $(date +%T)" >> $L
  done
  ls $O/chunks/c*.mp4 | sed "s#^#file '$PWD/#;s#\$#'#" > $O/chunks/list.txt
  ffmpeg -y -v error -f concat -safe 0 -i $O/chunks/list.txt -c copy $O/btf${n}_muted.mp4 && echo "ep$n VIDEO DONE $(date +%T)" >> $L
  [ -s $O/audio/mix_final.wav ] && ffmpeg -y -v error -i $O/btf${n}_muted.mp4 -i $O/audio/mix_final.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest $O/beat_the_flags_part${n}.mp4 && echo "ep$n MUXED" >> $L
done
echo ALLDONE >> $L
