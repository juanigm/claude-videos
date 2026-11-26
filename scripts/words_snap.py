# Hand-fix helper for words.json: whisper clamps words after a pause (zero-length words, starts glued to the next
# word). Every speech onset in the audio (end of a silence >= 70 ms at -42 dB) becomes the start of the first word
# spoken after it; zero-length words get split from their neighbour. Keeps the raw file as words_raw.json.
# usage: python scripts/words_snap.py shorts/<name>/voice
import json, re, subprocess, sys
from pathlib import Path
d = Path(sys.argv[1])
raw = d / "words_raw.json"
if not raw.exists(): raw.write_text((d / "words.json").read_text(encoding="utf-8"), encoding="utf-8")
W = json.loads(raw.read_text(encoding="utf-8"))
log = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(d / "voice.wav"), "-af", "silencedetect=noise=-42dB:d=0.07", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
gaps = list(zip(starts, ends))
fixed = []
for g0, g1 in gaps:
    # the first word whose span reaches past the gap's end: it is the one spoken right after the pause
    i = next((k for k, w in enumerate(W) if w["e"] > g1 + 0.02), None)
    if i is None or abs(W[i]["s"] - g1) < 0.03 or abs(W[i]["s"] - g1) > 0.6: continue
    if i and W[i - 1]["s"] > g1: continue  # previous word already after the onset: leave it
    fixed.append((W[i]["w"], W[i]["s"], round(g1, 3)))
    W[i]["s"] = round(g1, 3)
    if i and W[i - 1]["e"] > g0: W[i - 1]["e"] = round(max(W[i - 1]["s"] + 0.08, g0), 3)
# split zero-length / glued words: share the span of the pair by letter count
for k in range(len(W) - 1):
    a, b = W[k], W[k + 1]
    if a["e"] - a["s"] < 0.06 and b["s"] - a["s"] < 0.06:
        span, la, lb = b["e"] - a["s"], len(a["w"]), len(b["w"])
        cut = round(a["s"] + span * la / (la + lb), 3)
        fixed.append((a["w"] + "|" + b["w"], a["s"], cut)); a["e"] = cut; b["s"] = cut
    if a["e"] < a["s"] + 0.05: a["e"] = round(a["s"] + 0.05, 3)
(d / "words.json").write_text(json.dumps(W, indent=1, ensure_ascii=False), encoding="utf-8")
for f in fixed: print("fix", f)
