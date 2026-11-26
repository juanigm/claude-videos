# Word timings for a voice track: faster-whisper with word timestamps -> words.json [{w, s, e, p}, ...] next to the wav.
# The script text (the first ``` block of SCRIPT.md) is passed as the prompt so spellings match.
# usage: py -3.13 scripts/words.py shorts/<name>/voice/voice.wav [shorts/<name>/SCRIPT.md] [model] [language]
#   model:    small.en (default, English only), medium.en, or a multilingual one: small, medium, large-v3
#   language: en, es, pt, ... (default: en for *.en models, auto-detect otherwise)
# The first run of each model downloads it (small.en is about 0.5 GB).
import json, re, sys
from pathlib import Path
from faster_whisper import WhisperModel

wav = Path(sys.argv[1])
script = Path(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] else None
model_name = sys.argv[3] if len(sys.argv) > 3 else "small.en"
language = sys.argv[4] if len(sys.argv) > 4 else ("en" if model_name.endswith(".en") else None)

prompt = None
if script and script.exists():
    m = re.search(r"```\r?\n(.*?)```", script.read_text(encoding="utf-8"), re.S)  # the voice-over block
    if m:
        prompt = re.sub(r"\[[^\]]*\]", "", m.group(1))       # drop the audio tags
        prompt = re.sub(r"\s+", " ", prompt).strip()[-900:]  # whisper keeps the last ~224 tokens

# decode ourselves (16 kHz mono float32) with ffmpeg: faster-whisper's PyAV path breaks with some av versions
import subprocess
import numpy as np
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(wav), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(raw, dtype=np.float32).copy()

model = WhisperModel(model_name, device="cpu", compute_type="int8")
segs, info = model.transcribe(audio, language=language, word_timestamps=True, initial_prompt=prompt,
                              vad_filter=False, beam_size=5, condition_on_previous_text=True)
out = []
for s in segs:
    for w in s.words:
        out.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3), "p": round(w.probability, 3)})
dst = wav.with_name("words.json")
dst.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
print(f"{len(out)} words, {info.duration:.2f} s -> {dst}")
