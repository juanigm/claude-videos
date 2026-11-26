# Tighten a voice take to a target length: shorten the pauses first (cut in the middle of each silence, short
# crossfades), then close the remaining gap with a pitch-preserving tempo change (ffmpeg atempo).
# usage: python scripts/voice_tighten.py in.wav out.wav target_s [cap_s=0.30] [keep=t1:len1,t2:len2,...]
#   cap_s:  every silence longer than this is shortened to it
#   keep:   silences that START near t (±0.3 s) are shortened to len instead (dramatic [pause] beats)
import re, subprocess, sys
import numpy as np

src, dst, target = sys.argv[1], sys.argv[2], float(sys.argv[3])
cap = float(sys.argv[4]) if len(sys.argv) > 4 else 0.30
keep = {}
if len(sys.argv) > 5 and sys.argv[5]:
    for kv in sys.argv[5].split(","):
        t, l = kv.split(":"); keep[float(t)] = float(l)
SR = 48000

def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()

a = decode(src)
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "silencedetect=noise=-40dB:d=0.12", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
sil = list(zip(starts, ends))

pieces, pos, saved, XF = [], 0, 0.0, int(0.012 * SR)
dur = len(a) / SR
for s, e in sil:
    if s < 0.05 or e > dur - 0.05:      # leading / trailing silence: leave it
        continue
    d = e - s
    want = next((l for t, l in keep.items() if abs(t - s) < 0.3), cap)
    if d <= want:
        continue
    cut = d - want                       # remove the middle of the silence
    c0 = int((s + want / 2) * SR); c1 = int((s + want / 2 + cut) * SR)
    pieces.append(a[pos:c0]); pos = c1; saved += cut
pieces.append(a[pos:])

out = pieces[0]
for p in pieces[1:]:                     # equal-power crossfade at each cut (inside silence anyway)
    n = min(XF, len(out), len(p))
    r = np.linspace(0, 1, n, dtype=np.float32)
    mid = out[-n:] * np.cos(r * np.pi / 2) + p[:n] * np.sin(r * np.pi / 2)
    out = np.concatenate([out[:-n], mid, p[n:]])
mid_len = len(out) / SR
tempo = mid_len / target
print(f"original {dur:.2f} s, pauses -{saved:.2f} s -> {mid_len:.2f} s, tempo x{tempo:.4f} -> {target:.2f} s")

tmp = dst + ".tmp.f32"
out.astype(np.float32).tofile(tmp)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp,
                "-af", f"atempo={tempo:.6f}", "-ar", str(SR), "-c:a", "pcm_s16le", dst], check=True)
import os; os.remove(tmp)
