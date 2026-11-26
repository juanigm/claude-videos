"""sharp high-frequency onsets in a mix that do NOT come from the voice: >2 kHz energy in 5 ms windows jumping by
>= 14 dB over the previous 30 ms, where the voice's own >2 kHz energy did not jump. usage: mix.wav voice.wav t0"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt


def load(p):
    sr, x = wavfile.read(p)
    x = x.astype(np.float64)
    if x.ndim == 2:
        x = x.mean(axis=1)
    return sr, x / (np.max(np.abs(x)) + 1e-12)


def hf_db(x, sr, h):
    y = sosfilt(butter(4, 2000, "hp", fs=sr, output="sos"), x)
    n = len(y) // h
    return 10 * np.log10(np.mean(y[: n * h].reshape(n, h) ** 2, axis=1) + 1e-12)


sr, m = load(sys.argv[1])
_, v = load(sys.argv[2])
t0 = float(sys.argv[3])
L = min(len(m), len(v))
m, v = m[:L], v[:L]
h = int(0.005 * sr)
em, ev = hf_db(m, sr, h), hf_db(v, sr, h)
k0 = int(t0 / 0.005)
out = []
for k in range(max(k0, 6), len(em)):
    jm = em[k] - np.max(em[k - 6:k])
    jv = ev[k] - np.max(ev[k - 6:k])
    if jm >= 14 and jv < 8 and em[k] > np.max(em) - 50:
        out.append((k * 0.005, jm))
last = -1
for t, j in out:
    if t - last > 0.04:
        print(f"  {t:7.3f}s +{j:.0f} dB")
    last = t
print(len(out), "windows")
