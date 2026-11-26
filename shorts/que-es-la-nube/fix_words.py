# Correcciones a mano de words.json para la voz de David (después de words_robust.py + words_snap.py).
# 1) whisper oyó "¿Ya lo has visto? servidor" donde se dice "y pagás por lo que usás. ¿Necesitás un servidor?":
#    se reemplaza, repartiendo las palabras en los tramos con voz medidos con silencedetect.
# 2) voseo: whisper escribe "necesitas", el guion dice "necesitás".
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


if not any(w["w"].lower().startswith("pagás") for w in W):
    W = [w for w in W if not (31.9 < w["s"] < 34.5)]
    W += spread(["y", "pagás", "por", "lo", "que", "usás."], 31.68, 32.85)
    W += spread(["¿Necesitás", "un", "servidor?"], 33.26, 34.37)
    W.sort(key=lambda w: w["s"])

VOS = {"compras": "comprás", "alquilas": "alquilás", "pagas": "pagás", "usas": "usás", "necesitas": "necesitás",
       "borras": "borrás", "dejas": "dejás", "configuras": "configurás", "proteges": "protegés", "armas": "armás"}
for w in W:
    core = w["w"].strip("¿?¡!.,:;").lower()
    if core in VOS:
        w["w"] = w["w"].replace(core, VOS[core]).replace(core.capitalize(), VOS[core].capitalize())
p.write_text(json.dumps(W, indent=1, ensure_ascii=False), encoding="utf-8")
print(" ".join(f"{w['w']}@{w['s']}" for w in W if 28 < w["s"] < 40))
