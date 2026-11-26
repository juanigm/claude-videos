# Align an episode's SCRIPT words to the recognised voice (words.json), so shots can key on the real script words and
# captions show the script text (not whisper's guesses). Also builds the phrase caption chunks, applying the
# "Caption digit map" (spelled numbers -> digits) from SCRIPT.md.
# usage: python scripts/align_script.py <episode>
#   in : shorts/<ep>/SCRIPT.md, shorts/<ep>/voice/words.json
#   out: shorts/<ep>/timing.json  {words:[{w,n,s,e}], chunks:[{text,s}], end}
import difflib, json, re, sys
from pathlib import Path

ep = sys.argv[1]
md = Path(f"shorts/{ep}/SCRIPT.md").read_text(encoding="utf-8")
block = re.search(r"```\n(.*?)```", md, re.S).group(1)
text = re.sub(r"\[[^\]]*\]", " ", block)
heard = json.loads(Path(f"shorts/{ep}/voice/words.json").read_text(encoding="utf-8"))

norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
toks = [t for t in text.split() if norm(t)]
# whisper writes numbers as digits: expand them to the words we may compare against is overkill; we only match words.
hn = [norm(h["w"]) for h in heard]
sn = [norm(t) for t in toks]
times = [None] * len(toks)
sm = difflib.SequenceMatcher(a=sn, b=hn, autojunk=False)
for a, b, size in sm.get_matching_blocks():
    for k in range(size):
        times[a + k] = (heard[b + k]["s"], heard[b + k]["e"])
# interpolate the unmatched runs between their matched neighbours, weighted by word length
i = 0
end_all = heard[-1]["e"] if heard else 0.0
while i < len(toks):
    if times[i] is not None:
        i += 1; continue
    j = i
    while j < len(toks) and times[j] is None:
        j += 1
    t0 = times[i - 1][1] if i > 0 else 0.0
    t1 = times[j][0] if j < len(toks) else end_all
    lens = [max(2, len(sn[k])) for k in range(i, j)]
    tot = sum(lens); acc = 0
    for k in range(i, j):
        s = t0 + (t1 - t0) * acc / tot
        acc += lens[k - i]
        times[k] = (s, t0 + (t1 - t0) * acc / tot)
    i = j
words = [{"w": t, "n": n, "s": round(s, 3), "e": round(e, 3)} for t, n, (s, e) in zip(toks, sn, times)]

# caption digit map: "a → B · c → D"
dmap = []
m = re.search(r"## Caption digit map\s*\n(.*?)(\n## |\Z)", md, re.S)
if m:
    for part in re.split(r"[·\n]", m.group(1)):
        if "→" in part:
            k, v = [x.strip() for x in part.split("→", 1)]
            if k:
                dmap.append(([norm(x) for x in k.split()], v))
dmap.sort(key=lambda kv: -len(kv[0]))

# display tokens: merge mapped phrases into one token
disp = []  # (text, start, punct_end)
i = 0
while i < len(toks):
    hit = None
    for keys, val in dmap:
        n = len(keys)
        if [norm(x) for x in toks[i:i + n]] == keys:
            # keep trailing punctuation of the last word of the phrase
            tail = re.sub(r"^.*?([.,!?:;…]*)$", r"\1", toks[i + n - 1])
            hit = (val + tail, times[i][0], n)
            break
    if hit:
        disp.append((hit[0], hit[1])); i += hit[2]
    else:
        disp.append((toks[i].upper(), times[i][0])); i += 1

# one-line caption chunks: 3-5 words, at most MAXC characters (fits the 820 px safe width at 46 px);
# a chunk closes at punctuation once it has 3+ words, short sentences merge into the next one.
MAXC = int(sys.argv[2]) if len(sys.argv) > 2 else 26
WEAK = {"a", "an", "the", "to", "of", "and", "is", "it", "its", "for", "in", "on", "at", "with", "that", "so"}
ends = lambda tok: re.search(r"[.,!?:;…]$", tok) is not None
tlen = lambda ws: len(" ".join(w[0] for w in ws))
fits = lambda ws: len(ws) <= 5 and tlen(ws) <= MAXC
# 1) clauses (split at punctuation)
clauses, cur = [], []
for tok in disp:
    cur.append(tok)
    if ends(tok[0]):
        clauses.append(cur); cur = []
if cur:
    clauses.append(cur)
# 2) each clause -> fewest balanced lines that fit, avoiding lines that end on a weak word
def split_clause(c):
    for k in range(1, len(c) + 1):
        size = -(-len(c) // k)
        lines, i = [], 0
        while i < len(c):
            j = min(len(c), i + size)
            if j < len(c) and norm(c[j - 1][0]) in WEAK and j - i > 2:
                j -= 1
            lines.append(c[i:j]); i = j
        if len(lines) <= k and all(fits(l) for l in lines):
            return lines
    return [[w] for w in c]
lines = [l for c in clauses for l in split_clause(c)]
# 3) merge lines shorter than 3 words into the next (or previous) line when the result still fits
changed = True
while changed:
    changed = False
    for i, l in enumerate(lines):
        if len(l) >= 3:
            continue
        if i + 1 < len(lines) and fits(l + lines[i + 1]):
            lines[i:i + 2] = [l + lines[i + 1]]; changed = True; break
        if i > 0 and fits(lines[i - 1] + l):
            lines[i - 1:i + 1] = [lines[i - 1] + l]; changed = True; break
# "even" mode (when MAXC is passed): lines of about the same length (~20 chars), never across a
# sentence end; DP per sentence: cost = (len - TARGET)^2 + penalties (weak last word, one-word line), bonus after a comma.
if len(sys.argv) > 2:
    TARGET = 20
    tlen = lambda ws: len(" ".join(re.sub(r"[.…]+$", "", w[0]) for w in ws))
    sents, cur = [], []
    for tok in disp:
        cur.append(tok)
        if re.search(r"([.!?…]|\.\.\.)$", tok[0]):
            sents.append(cur); cur = []
    if cur:
        sents.append(cur)
    def even(c):
        n = len(c); best = [0.0] + [1e18] * n; prev = [0] * (n + 1)
        for j in range(1, n + 1):
            for i in range(max(0, j - 6), j):
                seg = c[i:j]; L = tlen(seg)
                if L > MAXC and j - i > 1:
                    continue
                cost = (L - TARGET) ** 2
                if j < n and norm(seg[-1][0]) in WEAK: cost += 60
                if j - i == 1 and n > 1: cost += 80
                if j < n and seg[-1][0].endswith(","): cost -= 25
                if best[i] + cost < best[j]:
                    best[j] = best[i] + cost; prev[j] = i
        out, j = [], n
        while j > 0:
            out.append(c[prev[j]:j]); j = prev[j]
        return out[::-1]
    lines = [l for s_ in sents for l in even(s_)]
# no periods / ellipses in captions; commas, ? and ! stay
clean = lambda s: re.sub(r"[.…]+$", "", s) if not re.fullmatch(r"[\d.,]+", s) else s
lines = [[(clean(w[0]), w[1]) for w in l] for l in lines]
chunks = [{"text": " ".join(w[0] for w in l), "s": round(l[0][1], 3), "words": [[w[0], round(w[1], 3)] for w in l]} for l in lines]

out = Path(f"shorts/{ep}/timing.json")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({"words": words, "chunks": chunks, "end": round(end_all, 3)}, indent=1, ensure_ascii=False), encoding="utf-8")
matched = sum(1 for a, b, size in sm.get_matching_blocks() for _ in range(size))
print(f"{ep}: {len(toks)} script words, {matched} matched to the voice, {len(chunks)} caption chunks, end {end_all:.2f}s -> {out}")
