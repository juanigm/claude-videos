# Compare words.json against the FIRST voice-over block of SCRIPT.md (keep the as-recorded text first):
# missing / extra / misheard words, low-confidence words, one line per sentence with its start frame.
# usage: python scripts/words_check.py shorts/<name>
import json, re, sys, difflib
from pathlib import Path
d = Path(sys.argv[1])
W = json.loads((d / "voice" / "words.json").read_text(encoding="utf-8"))
blk = re.search(r"```\n(.*?)```", (d / "SCRIPT.md").read_text(encoding="utf-8"), re.S).group(1)
blk = re.sub(r"\[[^\]]*\]", "", blk)
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
S = [norm(x) for x in blk.split() if norm(x)]
T = [norm(w["w"]) for w in W]
print("script words", len(S), "| heard", len(T))
for op, a, b, c, e in difflib.SequenceMatcher(None, S, T, autojunk=False).get_opcodes():
    if op != "equal":
        print(f"{op:8s} SCRIPT: {' '.join(S[a:b])!r:40s} HEARD: {' '.join(T[c:e])!r}  @ {W[min(c, len(W) - 1)]['s']:.2f}s")
print("low confidence:", [(w["w"], w["s"]) for w in W if w.get("p", 1) < 0.6])
print("bad spans:", [(i, w) for i, w in enumerate(W) if w["e"] <= w["s"] or (i and w["s"] < W[i - 1]["s"])])
line = []
for i, w in enumerate(W):  # one line per sentence: start-end (s), frame of the first word at 30 fps, text
    line.append(w)
    if w["w"][-1] in ".?" or i == len(W) - 1:
        print(f"{line[0]['s']:6.2f}-{w['e']:6.2f}  f{round(line[0]['s'] * 30):5d}  {' '.join(x['w'] for x in line)}")
        line = []
