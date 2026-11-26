# Música de fondo del canal, sintetizada (sin samples ni derechos de terceros): loop tech/lo-fi en La menor, 100 bpm.
# Durante los tramos "dark" (por ejemplo cada hackeo) la música se apaga, se filtra y entra un drone oscuro.
# usage: py -3.13 scripts/audio/music_bed.py <salida.wav> <duración_s> [a:b,a:b,...] [lufs=-29]
import sys
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from dsp import SR, TAU, ns, tt, rng, colored, lp, hp, bp, place, pan, widen, integrated, dbg, write_wav, true_peak  # noqa: E402

out = sys.argv[1]
DUR = float(sys.argv[2])
DARK = [tuple(map(float, s.split(":"))) for s in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else []
LUFS = float(sys.argv[4]) if len(sys.argv) > 4 else -29.0
r = rng(11)

BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am  F  C  G
N = ns(DUR + 1.0)


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def saw(f, n, ph=0.0):
    p = (np.arange(n) * f / SR + ph) % 1
    return 2 * p - 1


def buf():
    return np.zeros((2, N))


norm, dark = buf(), buf()
nbars = int(DUR / BAR) + 2
for b in range(nbars):
    t0 = b * BAR
    ch = PROG[b % 4]
    # pad: saws desafinados, ataque lento
    n = ns(BAR)
    tp = np.arange(n) / SR
    env = np.minimum(1, tp / 0.5) * np.minimum(1, (BAR - tp) / 0.4)
    pad = sum(saw(mtof(m) * d, n, r.uniform()) for m in ch for d in (0.997, 1.003)) * env
    place(norm, widen(lp(pad, 1300) * 0.10, r, 13, 0.8), t0)
    place(dark, widen(lp(pad, 380) * 0.10, r, 13, 0.8), t0)
    # bajo en corcheas
    for k in range(8):
        tb = tt(BEAT / 2)
        f = mtof(ch[0] - 12)
        x = (np.sin(TAU * f * tb) + 0.25 * lp(saw(f, len(tb)), 600)) * np.exp(-tb / 0.16) * (1 - np.exp(-tb / 0.004))
        place(norm, x * (0.22 if k % 2 == 0 else 0.14), t0 + k * BEAT / 2)
    # arpegio pluck en semicorcheas (suave)
    pat = [0, 1, 2, 1, 0, 2, 1, 2]
    for k in range(16):
        tb = tt(0.25)
        f = mtof(ch[pat[k % 8]] + 12)
        x = (np.sin(TAU * f * tb) + 0.3 * np.sin(TAU * 2 * f * tb)) * np.exp(-tb / 0.09) * (1 - np.exp(-tb / 0.002))
        place(norm, pan(x * 0.05, -0.4 if k % 2 else 0.4), t0 + k * BEAT / 4)
    # batería suave
    for k in range(4):
        tb = tt(0.3)
        kick = np.sin(TAU * np.cumsum(48 + 90 * np.exp(-tb / 0.03)) / SR) * np.exp(-tb / 0.11)
        if k in (0, 2):
            place(norm, kick * 0.32, t0 + k * BEAT)
        else:
            clap = bp(colored(ns(0.15), r, 0.3), 900, 3500) * np.exp(-tt(0.15) / 0.04)
            place(norm, clap * 0.07, t0 + k * BEAT)
        place(dark, lp(kick, 200) * 0.38, t0 + k * BEAT)  # latido en el modo oscuro
        hat = hp(colored(ns(0.04), r, 0), 7000) * np.exp(-tt(0.04) / 0.012)
        place(norm, pan(hat * 0.05, 0.3), t0 + k * BEAT + BEAT / 2)

# drone oscuro (La grave + quinta disminuida que molesta un poco)
td = np.arange(N) / SR
drone = sum(saw(mtof(m) * d, N, r.uniform()) for m in (33, 45, 51) for d in (0.996, 1.004))
drone = lp(drone, 260) * (0.75 + 0.25 * np.sin(TAU * 0.5 * td))
dark += widen(drone * 0.09, r, 17, 0.9)

# mezcla normal <-> oscuro según los tramos DARK (rampas de 0.15 s a la entrada, 0.6 s a la salida)
h = np.zeros(N)
for a, b in DARK:
    up = np.clip((td - a) / 0.15, 0, 1)
    down = 1 - np.clip((td - b) / 0.6, 0, 1)
    h = np.maximum(h, up * down)
mixd = norm * (1 - h) + dark * h * 1.3

# fundido de entrada y de salida
fade = np.minimum(1, td / 1.0) * np.clip((DUR - td) / 2.0, 0, 1)
mixd *= fade
mixd = mixd[:, : ns(DUR)]
mixd *= dbg(LUFS - integrated(mixd))
tp = true_peak(mixd)
if tp > -3:
    mixd *= dbg(-3 - tp)
write_wav(out, mixd, bits=16)
print(f"{out}: {DUR:.2f} s, {integrated(mixd):.1f} LUFS, {len(DARK)} tramos oscuros")
