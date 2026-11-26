# whisper se saltó "Y te hackean, bro. Cerrá ese puerto," (voz provisoria). Tiempos medidos con silencedetect.
import json
from pathlib import Path

p = Path(__file__).parent / "voice" / "words.json"
W = json.loads(p.read_text(encoding="utf-8"))
if not any(w["w"].lower().startswith("hackean") for w in W):
    add = [("Y", 14.98, 15.12), ("te", 15.12, 15.24), ("hackean,", 15.24, 15.56), ("bro.", 15.94, 16.21),
           ("Cerrá", 17.24, 17.5), ("ese", 17.5, 17.68), ("puerto,", 17.68, 18.0)]
    W += [{"w": w, "s": s, "e": e, "p": 1.0} for w, s, e in add]
    for w in W:
        if w["w"] == "Y" and abs(w["s"] - 18.396) < 0.01: w["w"] = "y"
    W.sort(key=lambda w: w["s"])
    p.write_text(json.dumps(W, indent=1, ensure_ascii=False), encoding="utf-8")
print(" ".join(f"{w['w']}@{w['s']}" for w in W))
