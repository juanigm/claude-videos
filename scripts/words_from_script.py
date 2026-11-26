# Rewrites words.json with the EXACT words of the script (captions show the script, not whisper's guesses), keeping
# whisper's timings. Script and heard words are aligned with difflib; where whisper misheard a span (tool names,
# acronyms: "CloudFormation" -> "cloudformaciones"), the script words of that span are spread over its time, by length.
# Run it after words.py + words_snap.py. The heard version is kept in words_heard.json.
# usage: py -3.13 scripts/words_from_script.py shorts/<name>
import difflib, json, re, sys, unicodedata
from pathlib import Path

ep = Path(sys.argv[1])
md = (ep / "SCRIPT.md").read_text(encoding="utf-8")
block = re.search(r"```\r?\n(.*?)```", md, re.S).group(1)
toks = [t for t in re.sub(r"\[[^\]]*\]", " ", block).split()]
vdir = ep / "voice"
src = vdir / "words_heard.json"
if not src.exists():
    src.write_text((vdir / "words.json").read_text(encoding="utf-8"), encoding="utf-8")
heard = json.loads(src.read_text(encoding="utf-8"))


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


toks = [t for t in toks if norm(t)]
sn, hn = [norm(t) for t in toks], [norm(h["w"]) for h in heard]
out = []


def spread(words, a, b, p=0.5):
    tot = sum(len(x) + 1 for x in words) or 1
    t = a
    for x in words:
        d = (b - a) * (len(x) + 1) / tot
        out.append({"w": x, "s": round(t, 3), "e": round(t + d, 3), "p": p})
        t += d


sm = difflib.SequenceMatcher(None, sn, hn, autojunk=False)
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal":
        for k in range(i2 - i1):
            h = heard[j1 + k]
            out.append({"w": toks[i1 + k], "s": h["s"], "e": h["e"], "p": h.get("p", 1.0)})
    elif op == "replace":
        spread(toks[i1:i2], heard[j1]["s"], heard[j2 - 1]["e"])
    elif op == "insert":  # whisper heard something that is not in the script: drop it
        continue
    elif op == "delete":  # script words whisper missed: squeeze them between the neighbours
        a = out[-1]["e"] if out else 0.0
        b = heard[j1]["s"] if j1 < len(heard) else a + 0.3 * (i2 - i1)
        spread(toks[i1:i2], a, max(b, a + 0.05), 0.2)
        print("missing:", " ".join(toks[i1:i2]), f"@ {a:.2f}")
    if op == "replace":
        print("respelled:", " ".join(hn[j1:j2]), "->", " ".join(toks[i1:i2]))

(vdir / "words.json").write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
print(len(out), "words ->", vdir / "words.json")
