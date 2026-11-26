# Igual que words.py, pero resistente a que whisper invente texto o se saltee frases (pasa con voces largas):
# corta el audio en trozos de <= MAX s, siempre en un silencio, y transcribe cada trozo por separado
# (sin arrastrar contexto). Después suma el desfase de cada trozo.
# usage: py -3.13 scripts/words_robust.py shorts/<name>/voice/voice.wav [shorts/<name>/SCRIPT.md] [model=medium] [lang=es] [max_s=12]
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel

wav = Path(sys.argv[1])
script = Path(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] else None
model_name = sys.argv[3] if len(sys.argv) > 3 else "medium"
language = sys.argv[4] if len(sys.argv) > 4 else "es"
MAX = float(sys.argv[5]) if len(sys.argv) > 5 else 12.0
SR = 16000

prompt = None
if script and script.exists():
    m = re.search(r"```\r?\n(.*?)```", script.read_text(encoding="utf-8"), re.S)
    if m:
        prompt = re.sub(r"\[[^\]]*\]", "", m.group(1))
        prompt = re.sub(r"\s+", " ", prompt).strip()[-900:]

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32).copy()

# silencios: ventanas de 20 ms con energía < 3 % del percentil 95, al menos 250 ms seguidos -> su centro es un corte posible
hop = SR // 50
rms = np.sqrt(np.convolve(audio ** 2, np.ones(hop) / hop, "same")[::hop])
quiet = rms < 0.03 * np.percentile(rms, 95)
cuts, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]:
            j += 1
        if (j - i) * 0.02 >= 0.25:
            cuts.append((i + j) / 2 * 0.02)
        i = j
    else:
        i += 1
dur = len(audio) / SR
bounds, start = [], 0.0
while dur - start > MAX:
    cand = [c for c in cuts if start + 2.0 < c <= start + MAX]
    end = cand[-1] if cand else start + MAX
    bounds.append((start, end))
    start = end
bounds.append((start, dur))

model = WhisperModel(model_name, device="cpu", compute_type="int8")
out = []
for a, b in bounds:
    chunk = audio[int(a * SR): int(b * SR)]
    segs, _ = model.transcribe(chunk, language=language, word_timestamps=True, initial_prompt=prompt, beam_size=5,
                               vad_filter=False, condition_on_previous_text=False)
    n0 = len(out)
    for s in segs:
        for w in s.words:
            out.append({"w": w.word.strip(), "s": round(a + w.start, 3), "e": round(a + w.end, 3), "p": round(w.probability, 3)})
    print(f"  trozo {a:6.2f}-{b:6.2f} s: {len(out) - n0} palabras")
dst = wav.with_name("words.json")
dst.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"{len(out)} words, {dur:.2f} s -> {dst}")
