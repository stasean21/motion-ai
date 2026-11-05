#!/bin/bash
# A Day in Japan: 600 frames @ 30 fps (frames 001–600, no duplicate frame at the loop seam) → ../out/day_in_japan_muted.mp4
cd "$(dirname "$0")"
FPS=30 PAGE=jp.html NODE_PATH=/opt/node22/lib/node_modules node render.cjs ../out/day_in_japan_muted.mp4 0 20 4 > ../out/render.log 2>&1 && echo ALLDONE >> ../out/render.log
