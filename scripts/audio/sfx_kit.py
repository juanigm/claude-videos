# Biblioteca de efectos de sonido del canal, sintetizados con numpy (sin samples de terceros, sin derechos).
# usage: py -3.13 scripts/audio/sfx_kit.py [carpeta_salida=public/sfx]
# Cada efecto se normaliza a un pico de loudness momentáneo, para que todos suenen parejos debajo de la voz.
import sys
from pathlib import Path
import numpy as np
from scipy import signal

sys.path.insert(0, str(Path(__file__).parent))
from dsp import SR, TAU, ns, tt, rng, colored, lp, hp, bp, shape, phase, modal, fades, norm_to, write_wav, st  # noqa: E402

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "public/sfx")
OUT.mkdir(parents=True, exist_ok=True)
r = rng(7)


def ex(t, tau):
    return np.exp(-t / tau)


def band_sweep(dur, f0, f1, width=0.45, slope=1.0):
    """ruido con una banda que se mueve de f0 a f1 (whooshes)"""
    n = ns(dur)
    x = colored(n, r, slope)
    def g(T, F):
        fc = np.geomspace(f0, f1, len(T)) if len(T) > 1 else np.array([f0])
        return np.exp(-((np.log(F[:, None] + 1) - np.log(fc[None, :])) ** 2) / width)
    return shape(x, g)


def mix(n, *parts):
    y = np.zeros(n)
    for x, at, g in parts:
        i = ns(at)
        k = min(n - i, len(x))
        if k > 0:
            y[i:i + k] += g * x[:k]
    return y


def whoosh_down(dur=0.5):
    y = band_sweep(dur, 3500, 250)
    return fades(y * np.sin(np.pi * np.linspace(0, 1, len(y))) ** 1.4, 0.005, 0.03)


def whoosh_up(dur=0.4):
    y = band_sweep(dur, 300, 4000)
    return fades(y * np.sin(np.pi * np.linspace(0, 1, len(y))) ** 1.6, 0.005, 0.03)


def whoosh(dur=0.35):
    y = band_sweep(dur, 800, 2500, 0.6)
    return fades(y * np.sin(np.pi * np.linspace(0, 1, len(y))) ** 2, 0.005, 0.03)


def thud(dur=0.5, f=55, body=0.12):
    t = tt(dur)
    y = np.sin(phase(f + 70 * ex(t, 0.025))) * ex(t, body)
    y += 0.6 * lp(colored(len(t), r, 0), 1200) * ex(t, 0.018)
    return fades(y, 0.001, 0.05)


def pop(dur=0.14, f0=480, f1=1150):
    t = tt(dur)
    f = np.interp(t, [0, 0.045, dur], [f0, f1, f1 * 1.04])
    y = np.sin(phase(f)) * ex(t, 0.035) * (1 - ex(t, 0.002))
    y += 0.25 * np.sin(phase(2 * f)) * ex(t, 0.02)
    return fades(y, 0.001, 0.02)


def slap(dur=0.18):
    t = tt(dur)
    y = bp(colored(len(t), r, 0.5), 700, 3500) * ex(t, 0.02) + 0.7 * np.sin(phase(140 + 80 * ex(t, 0.01))) * ex(t, 0.04)
    return fades(y, 0.0005, 0.02)


def click1():
    return modal(0.06, [(2300, 1, 0.006), (3900, 0.6, 0.004), (6200, 0.35, 0.003)], r)


def click(dur=0.2):
    n = ns(dur)
    return fades(mix(n, (click1(), 0, 1), (click1(), 0.07, 0.8)), 0.0005, 0.02)


def bell(f, tau=0.15, amp=1.0, dur=None):
    return modal(dur or tau * 5, [(f, amp, tau), (f * 2.76, amp * 0.5, tau * 0.6), (f * 5.4, amp * 0.25, tau * 0.35)], r)


def keys(dur=0.7):
    n = ns(dur)
    parts = [(bell(r.uniform(3200, 6500), r.uniform(0.05, 0.12)), r.uniform(0, 0.45), r.uniform(0.4, 1)) for _ in range(9)]
    return fades(mix(n, *parts), 0.001, 0.05)


def coins(dur=1.3, k=14):
    n = ns(dur)
    parts = [(bell(r.uniform(2600, 4800), r.uniform(0.08, 0.2)), r.uniform(0, dur - 0.4), r.uniform(0.4, 1)) for _ in range(k)]
    return fades(mix(n, *parts), 0.001, 0.08)


def cash(dur=1.0):
    n = ns(dur)
    y = mix(n, (coins(0.5, 6), 0, 0.7), (bell(1760, 0.35), 0.12, 1.0), (bell(2637, 0.3), 0.12, 0.6))
    return fades(y, 0.001, 0.05)


def door(dur=0.45):
    n = ns(dur)
    return fades(mix(n, (thud(0.4, 95, 0.07), 0, 1), (click1(), 0.02, 0.6)), 0.001, 0.04)


def ding(dur=0.9):
    n = ns(dur)
    t = tt(dur)
    def tone(f):
        return (np.sin(TAU * f * t) + 0.3 * np.sin(TAU * 2 * f * t)) * ex(t, 0.28) * (1 - ex(t, 0.003))
    return fades(mix(n, (tone(1047), 0, 0.8), (tone(1319), 0.11, 1.0)), 0.001, 0.08)


def shield(dur=0.9):
    n = ns(dur)
    t = tt(0.7)
    def tone(f):
        return np.sin(TAU * f * t) * ex(t, 0.22) * (1 - ex(t, 0.003))
    y = mix(n, (whoosh_up(0.5), 0, 0.5), (tone(523), 0.05, 0.6), (tone(659), 0.11, 0.6), (tone(784), 0.17, 0.7), (tone(1047), 0.23, 0.8))
    return fades(y, 0.002, 0.08)


def saw(f):
    p = np.cumsum(f) / SR
    return 2 * (p % 1) - 1


def hack(dur=1.4):
    t = tt(dur)
    n = len(t)
    boom = np.sin(phase(38 + 110 * ex(t, 0.05))) * ex(t, 0.4)
    buzz = lp(saw(np.interp(t, [0, dur], [700, 90])), 3500) * (np.floor(t * 20) % 2 == 0) * (t < 0.9) * ex(t, 0.6)
    # ruido "digital": sample & hold a 2.5 kHz con 3 bits
    hold = np.repeat(r.uniform(-1, 1, n // 19 + 1), 19)[:n]
    crush = np.round(hold * 3) / 3 * ex(t, 0.25) * (np.floor(t * 31) % 3 != 0)
    alarm = np.sign(np.sin(TAU * np.where((t % 0.36) < 0.18, 880, 660) * t)) * (t > 0.35) * ex(t - 0.35, 0.5) * 0.5
    y = 1.0 * boom + 0.35 * buzz + 0.22 * hp(crush, 300) + 0.18 * lp(alarm, 3000)
    return fades(y, 0.001, 0.1)


def hack_glitch(dur=0.9):
    """'Y te hackean, bro': glitch digital corto + tono de error descendente (tipo computadora que se rinde).
    Más liviano y cómico que 'hack' (que queda como versión dramática: hack_heavy)."""
    n = ns(dur)
    # 1) tartamudeo digital: 4 ráfagas cortas de cuadrada con ruido, cada una más grave
    parts = []
    for i, f in enumerate([1900, 1400, 1100, 700]):
        tb = tt(0.045)
        sq = np.sign(np.sin(TAU * f * tb)) * 0.5 + 0.5 * bp(colored(len(tb), r, 0), 1500, 6000)
        parts.append((lp(sq, 5000) * fades(np.ones(len(tb)), 0.002, 0.008), i * 0.06, 0.7 - i * 0.08))
    # 2) "error": dos notas descendentes, cuadrada suave filtrada
    def tone(f, d):
        tb = tt(d)
        return lp(np.sign(np.sin(TAU * f * tb)), 1800) * np.exp(-tb / (d * 0.7)) * (1 - np.exp(-tb / 0.004))
    parts += [(tone(440, 0.16), 0.28, 0.55), (tone(311, 0.32), 0.45, 0.6)]
    # 3) golpe grave muy suave debajo
    tb = tt(0.4)
    parts.append((np.sin(phase(55 + 50 * np.exp(-tb / 0.03))) * np.exp(-tb / 0.12), 0.0, 0.35))
    return fades(mix(n, *parts), 0.001, 0.06)


def bots(dur=1.0):
    n = ns(dur)
    parts = []
    for i in range(8):
        tb = tt(0.06)
        f = r.choice([620, 780, 930, 1240, 1480])
        parts.append((np.sign(np.sin(TAU * f * tb)) * 0.6 * fades(np.ones(len(tb)), 0.002, 0.01), i * 0.1 + r.uniform(0, 0.03), r.uniform(0.5, 1)))
    return lp(mix(n, *parts), 5000)


def bleep(dur=0.6):
    n = ns(dur)
    tb = tt(0.08)
    b = np.sin(TAU * 1500 * tb) * fades(np.ones(len(tb)), 0.003, 0.02)
    return mix(n, (b, 0, 1), (b, 0.16, 1), (b, 0.32, 1))


def fire(dur=1.8):
    t = tt(dur)
    n = len(t)
    rumble = lp(colored(n, r, 1.5), 500) * 0.5
    imp = np.zeros(n)
    idx = r.integers(0, n, 70)
    imp[idx] = r.uniform(0.3, 1, 70) * r.choice([-1, 1], 70)
    crackle = bp(imp, 1500, 6000) * 6
    return fades(rumble + crackle, 0.15, 0.4)


def safe(dur=0.7):
    n = ns(dur)
    return fades(mix(n, (thud(0.5, 70, 0.1), 0, 1), (click(), 0.18, 0.9)), 0.001, 0.05)


SFX = {
    # nombre: (función, loudness momentáneo máximo en LUFS)
    "whoosh_down": (whoosh_down, -18), "whoosh_up": (whoosh_up, -20), "whoosh": (whoosh, -22),
    "thud": (thud, -16), "pop": (pop, -20), "slap": (slap, -19), "click": (click, -19), "keys": (keys, -21),
    "coins": (coins, -20), "cash": (cash, -17), "door": (door, -18), "ding": (ding, -19), "shield": (shield, -19),
    "hack_heavy": (hack, -16), "hack": (hack_glitch, -20), "bots": (bots, -22), "bleep": (bleep, -22), "fire": (fire, -23), "safe": (safe, -17),
}

for name, (fn, lufs) in SFX.items():
    y = norm_to(fn(), lufs)
    y = y / max(1.0, np.abs(y).max() / 0.89)  # sin clipping
    write_wav(str(OUT / f"{name}.wav"), st(y), bits=16)
    print(f"{name:12s} {len(y) / SR:5.2f} s")
