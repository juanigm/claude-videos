# Correcciones a mano de words.json (después de words_robust.py + words_snap.py).
# 1) el último trozo fue la alucinación clásica de whisper ("Subtítulos realizados por la comunidad de Amara.org"):
#    se reemplaza por el texto del guion, repartido en los tramos con voz medidos con silencedetect.
# 2) "admin 123" -> "admin123" (una sola palabra en pantalla); "las cierras" -> "la cierras".
import json
from pathlib import Path

p = Path(__file__).parent / "voice" / "words.json"
W = json.loads(p.read_text(encoding="utf-8"))


def spread(words, a, b):
    tot = sum(len(x) + 1 for x in words)
    t, out = a, []
    for x in words:
        d = (b - a) * (len(x) + 1) / tot
        out.append({"w": x, "s": round(t, 3), "e": round(t + d, 3), "p": 1.0})
        t += d
    return out


if any("Amara" in w["w"] or "Subtítulos" in w["w"] for w in W):
    W = [w for w in W if w["s"] < 61.6]
    W += spread(["van", "en", "una", "caja", "fuerte", "digital."], 61.85, 63.59)
    W += spread(["La", "seguridad", "va", "en", "cada", "paso."], 64.0, 65.91)
    W += spread(["¿Cuál", "te", "sorprendió", "más?"], 66.40, 67.45)

out = []
for w in W:
    if out and out[-1]["w"].lower() == "admin" and w["w"].startswith("123"):
        out[-1]["w"] = "admin" + w["w"]; out[-1]["e"] = w["e"]
        continue
    if w["w"] == "las" and 18.7 < w["s"] < 19.0:
        w["w"] = "la"
    out.append(w)
p.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
print(" ".join(f"{w['w']}@{w['s']}" for w in out))
