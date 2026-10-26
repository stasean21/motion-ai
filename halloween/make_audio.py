"""Extend the reference track to 30.25 s on the bar grid and dip it under the 'one more guest' beat."""
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
BAR = 2.516667          # 95.36 BPM, 4/4 (measured from the reference cuts)
SRC, OUT = "assets/audio/reference_track.m4a", sys.argv[1] if len(sys.argv) > 1 else "build/soundtrack.wav"
CUT_A, CUT_B = 17.6667, 10.1167      # splice: play 0..17.67, then repeat from 10.12 (same bar phase)
GUEST = (17.6667, 21.442)            # 1.5 bars of tension
END = 30.25

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
a, b = x[:int(CUT_A * SR)], x[int(CUT_B * SR):]
xf = int(0.015 * SR)
ramp = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
y = np.concatenate([a[:-xf], a[-xf:] * (1 - ramp) + b[:xf] * ramp, b[xf:]])
y = y[:int(END * SR)]

# tension: low-pass + duck during the guest beat, smooth in/out
s0, s1 = int(GUEST[0] * SR), int(GUEST[1] * SR)
sos = butter(4, 600, "lowpass", fs=SR, output="sos")
low = sosfilt(sos, y, axis=0).astype(np.float32) * 1.25
env = np.zeros(len(y), np.float32)
env[s0:s1] = 1
k = int(0.04 * SR)
env = np.convolve(env, np.ones(k) / k, "same")[:, None]
y = y * (1 - env) + low * env * 0.75
# soft tail so the loop point does not click
t = int(0.08 * SR)
y[-t:] *= np.linspace(1, 0, t, dtype=np.float32)[:, None]
y = np.clip(y, -1, 1)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", OUT],
               input=y.astype(np.float32).tobytes(), check=True)
print(OUT, len(y) / SR, "s")
