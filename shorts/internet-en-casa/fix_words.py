# Arma words.json para esta voz combinando dos pasadas de whisper y el guion (whisper alucinó en el medio y al final).
#   A = words_robust con trozos de 12 s  -> bien de 0 a 30.3 s
#   B = words_robust con trozos de 7 s   -> bien de 31 a 34.3 s y de 42.9 a 61.3 s
#   Tramos rotos: cada frase del guion va al tramo de voz medido con silencedetect, palabras repartidas por largo.
import json
from pathlib import Path

d = Path(__file__).parent / "voice"
A = json.loads((d / "words_a12.json").read_text(encoding="utf-8"))
B = json.loads((d / "words_b7.json").read_text(encoding="utf-8"))


def spread(text, a, b):
    words = text.split()
    tot = sum(len(x) + 1 for x in words)
    t, out = a, []
    for x in words:
        dd = (b - a) * (len(x) + 1) / tot
        out.append({"w": x, "s": round(t, 3), "e": round(t + dd, 3), "p": 1.0})
        t += dd
    return out


W = [w for w in A if w["s"] < 30.29]
W += [w for w in B if 31.0 <= w["s"] < 34.29]
W += spread("una consola...", 34.30, 35.30)
W += spread("y un solo cable.", 35.50, 36.65)
W += spread("Así que sumas un router,", 36.84, 38.09)
W += spread("que reparte la conexión entre todos.", 38.24, 40.12)
W += spread("Pero nadie quiere cables por toda la casa.", 40.31, 42.75)
W += [w for w in B if 42.85 <= w["s"] < 60.9]
W += spread("internet de tu casa.", 60.97, 61.7)
W += spread("¿Qué parte no conocías?", 62.11, 63.35)
W.sort(key=lambda w: w["s"])
(d / "words.json").write_text(json.dumps(W, indent=1, ensure_ascii=False), encoding="utf-8")
print(len(W), "palabras")
print(" ".join(f"{w['w']}@{w['s']}" for w in W))
