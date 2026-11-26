# Correcciones a mano de words.json (después de words_robust.py + words_snap.py). En los tramos donde whisper se perdió,
# cada frase del guion va al tramo de voz medido con silencedetect y sus palabras se reparten por largo.
import json
from pathlib import Path

p = Path(__file__).parent / "voice" / "words.json"
W = json.loads(p.read_text(encoding="utf-8"))


def spread(text, a, b):
    words = text.split()
    tot = sum(len(x) + 1 for x in words)
    t, out = a, []
    for x in words:
        d = (b - a) * (len(x) + 1) / tot
        out.append({"w": x, "s": round(t, 3), "e": round(t + d, 3), "p": 1.0})
        t += d
    return out


def cut(a, b):
    """saca las palabras que empiezan en [a, b)"""
    global W
    W = [w for w in W if not (a <= w["s"] < b)]


if not any(w["w"].startswith("rapidísimo") for w in W):
    cut(20.4, 29.36)       # "Entonces, start..." + "El" (de "El cielo")
    W += spread("Entonces Starlink los pone mucho más cerca:", 20.42, 23.10)
    W += spread("a unos quinientos cincuenta kilómetros.", 23.25, 25.39)
    W += spread("Pero tan cerca, se mueven rapidísimo,", 25.96, 28.03)
    W += spread("y cada uno cruza tu", 28.17, 29.38)
    cut(36.3, 37.9)        # "Por eso no es un plato que... Lo que gira."
    W += spread("Por eso no es un plato que gira:", 36.36, 37.79)
    cut(47.8, 48.36)       # "Si cada..." repetido
    for w in W:
        if w["w"] == "Si" and abs(w["s"] - 48.37) < 0.01: w["s"] = 47.88
        if w["w"] == "cada" and abs(w["s"] - 48.37) < 0.01: w["s"] = 48.15
    cut(72.8, 75.6)        # "que reparte..." + "La"
    W += spread("que reparte internet por WiFi.", 72.87, 74.51)
    W += spread("Eso sí: la", 74.79, 75.60)
    cut(80.3, 99)          # alucinación del final
    W += spread("Y listo:", 80.42, 80.96)
    W += spread("internet desde el espacio...", 81.11, 82.58)
    W += spread("que igual termina en un cable.", 82.82, 84.21)
    W += spread("¿Lo sabías?", 84.55, 85.20)
    W.sort(key=lambda w: w["s"])
p.write_text(json.dumps(W, indent=1, ensure_ascii=False), encoding="utf-8")
print(len(W), "palabras")
