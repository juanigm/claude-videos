# Biblioteca de efectos v2 del canal (desde el video de IaC), sintetizada con numpy: sin samples ni derechos.
# Mejoras sobre sfx_kit.py:
#  - estéreo de verdad: paneos que se mueven (los whooshes cruzan la pantalla), ensanchado y reverb corta de "sala"
#    en todo, para que no suenen secos ni "pegados" a la voz;
#  - capas: cada golpe tiene transitorio + cuerpo + cola (impact = click + sub + ruido + reverb);
#  - variantes ("round robin"): pop1..pop4, swish_a/b, mouse1..3, para que lo repetido no suene a loop;
#  - sonidos nuevos para contar historias de sistemas: riser, reveal, problem, typing, stamp, crumble, build, glitch,
#    success, error, tick, conveyor.
#  - ecualizado para no pisar la voz: casi todo tiene un recorte suave en 1-4 kHz o vive fuera de esa banda.
# usage: py -3.13 scripts/audio/sfx_kit2.py [carpeta_salida=public/sfx2]
import sys
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from dsp import (SR, TAU, ns, tt, rng, colored, lp, hp, bp, peq, shape, phase, modal, fades, norm_to, write_wav,  # noqa: E402
                 st, widen, make_ir, convolve_st)

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "public/sfx2")
OUT.mkdir(parents=True, exist_ok=True)
r = rng(23)
IR_ROOM = make_ir(0.45, 5, hf=1.6)
IR_HALL = make_ir(1.3, 9, hf=1.2)


def ex(t, tau):
    return np.exp(-t / tau)


def pad(x, dur):
    n = ns(dur)
    x = st(x) if np.ndim(x) == 2 else x
    if x.shape[-1] >= n:
        return x[..., :n]
    w = [(0, 0)] * (np.ndim(x) - 1) + [(0, n - x.shape[-1])]
    return np.pad(x, w)


def verb(x, wet=0.18, ir=None, tail=0.5):
    """reverb de envío: x mono o estéreo -> estéreo con cola"""
    x = pad(x, x.shape[-1] / SR + tail)
    dry = st(x) if np.ndim(x) == 1 else x
    return dry + wet * convolve_st(x, IR_ROOM if ir is None else ir)


def autopan(x, p0, p1, curve=1.0):
    """paneo que se mueve de p0 a p1 (constant power)"""
    n = len(x)
    p = p0 + (p1 - p0) * np.linspace(0, 1, n) ** curve
    th = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)]) * np.sqrt(2)


def mix(dur, *parts):
    """parts = (x mono/estéreo, t_inicio, ganancia)"""
    y = np.zeros((2, ns(dur)))
    for x, at, g in parts:
        x = st(x)
        i = ns(at)
        k = min(y.shape[1] - i, x.shape[1])
        if k > 0:
            y[:, i:i + k] += g * x[:, :k]
    return y


def band_sweep(dur, f0, f1, width=0.45, slope=1.0):
    n = ns(dur)
    x = colored(n, r, slope)

    def g(T, F):
        fc = np.geomspace(f0, f1, len(T)) if len(T) > 1 else np.array([f0])
        return np.exp(-((np.log(F[:, None] + 1) - np.log(fc[None, :])) ** 2) / width)
    return shape(x, g)


def env_bell(n, peak=0.5, p=1.6):
    """sube y baja, con el pico en 'peak' (0..1)"""
    u = np.linspace(0, 1, n)
    e = np.where(u < peak, (u / peak), (1 - u) / (1 - peak))
    return np.clip(e, 0, 1) ** p


# ---------------------------------------------------------------- transiciones
def swish(dur=0.42, f0=500, f1=3800, p0=-0.8, p1=0.8, peak=0.55):
    """whoosh que cruza la pantalla: aire filtrado + 'silbido' tonal leve, paneo en movimiento"""
    n = ns(dur)
    air = band_sweep(dur, f0, f1, 0.5, 1.0) * env_bell(n, peak, 1.8)
    t = tt(dur)
    tone = np.sin(phase(np.geomspace(f0 * 0.4, f1 * 0.15, n))) * env_bell(n, peak, 3) * 0.18
    y = autopan(air + tone, p0, p1, 1.2)
    return fades(verb(y, 0.22), 0.004, 0.08)


def swish_down(dur=0.55):
    return swish(dur, 3200, 260, 0.6, -0.6, 0.35)


def riser(dur=1.1):
    """tensión que sube y corta en seco: ruido con banda ascendente + tono con trémolo acelerado"""
    n = ns(dur)
    t = tt(dur)
    noise = band_sweep(dur, 300, 6000, 0.35) * (t / dur) ** 2.2
    trem = 0.5 + 0.5 * np.sin(phase(np.geomspace(4, 22, n)))
    tone = (np.sin(phase(np.geomspace(180, 720, n))) + 0.4 * np.sin(phase(np.geomspace(270, 1080, n)))) * (t / dur) ** 2.5 * trem * 0.35
    y = widen(noise + tone, r, 13, 0.8)
    return fades(verb(y, 0.12, tail=0.2), 0.05, 0.012)


# ---------------------------------------------------------------- golpes
def impact(dur=1.2, f=48):
    t = tt(dur)
    sub = np.sin(phase(f + 90 * ex(t, 0.03))) * ex(t, 0.28)
    click = hp(colored(len(t), r, 0), 2500) * ex(t, 0.004) * 0.6
    body = lp(colored(len(t), r, 1), 900) * ex(t, 0.06) * 0.7
    y = sub + click + body
    return fades(verb(y, 0.18, IR_HALL, 0.4), 0.0005, 0.15)


def reveal(dur=1.6, notes=(523.25, 659.25, 783.99, 1174.66), f=52):
    """aparición de una pieza: impacto + acorde brillante (Do mayor 9) que se abre en estéreo"""
    t = tt(1.3)

    def note(f, d=0.7):
        return (np.sin(TAU * f * t) + 0.25 * np.sin(TAU * 2.001 * f * t) + 0.08 * np.sin(TAU * 3 * f * t)) * ex(t, d) * (1 - ex(t, 0.004))
    chord = [(note(notes[0]), -0.5), (note(notes[1]), 0.5), (note(notes[2]), -0.2), (note(notes[3], 0.5), 0.3)]
    y = mix(dur, (impact(1.2, f), 0, 0.8), *[(autopan(c, p, p), 0.015 * i, 0.22) for i, (c, p) in enumerate(chord)])
    sh = bp(colored(ns(0.9), r, 0), 6000, 11000) * ex(tt(0.9), 0.12) * 0.07
    y = y + mix(dur, (widen(sh, r, 9, 1.0), 0.02, 1))
    return fades(verb(lp(y, 9000), 0.12, IR_HALL, 0.3)[:, :ns(dur)], 0.0005, 0.2)


def problem(dur=0.85, n1=233.08, n2=220.0):
    """'uh-oh': dos notas graves que bajan medio tono, sintetizador suave con leve vibrato"""
    def tone(f, d):
        tb = tt(d)
        v = 1 + 0.012 * np.sin(TAU * 6 * tb)
        x = np.sin(phase(f * v)) + 0.45 * np.sin(phase(2 * f * v)) + 0.2 * np.sin(phase(3 * f * v))
        return lp(x, 2200) * ex(tb, d * 0.45) * (1 - ex(tb, 0.008))
    y = mix(dur, (tone(n1, 0.3), 0, 0.7), (tone(n2, 0.55), 0.17, 0.8))
    tb = tt(0.3)
    y = y + mix(dur, (np.sin(phase(70 + 40 * ex(tb, 0.02))) * ex(tb, 0.09), 0.17, 0.5))
    return fades(verb(y, 0.2), 0.002, 0.1)


def pop(f0=440, f1=1100, dur=0.22, p=0.0):
    t = tt(dur)
    f = np.interp(t, [0, 0.04, dur], [f0, f1, f1 * 1.03])
    y = (np.sin(phase(f)) + 0.2 * np.sin(phase(2 * f))) * ex(t, 0.04) * (1 - ex(t, 0.0015))
    y += 0.25 * bp(colored(len(t), r, 0), 2000, 7000) * ex(t, 0.003)
    return fades(verb(autopan(y, p, p), 0.15), 0.0008, 0.04)


def tick(dur=0.12, f=3100, p=0.0):
    y = autopan(modal(dur, [(f, 1, 0.008), (f * 1.71, 0.5, 0.005), (f * 0.45, 0.3, 0.01)], r), p, p)
    return fades(verb(y, 0.1, tail=0.15), 0.0005, 0.02)


def mouse(seed=0, dur=0.22):
    """clic de mouse: presión + suelta, plástico (modos) + golpecito grave"""
    rr = rng(100 + seed)
    def part(f, a):
        x = modal(0.05, [(f, 1, 0.004), (f * 1.73, 0.5, 0.003), (f * 0.45, 0.4, 0.006)], rr)
        return x * a
    gap = 0.07 + rr.uniform(-0.015, 0.015)
    y = mix(dur, (part(2600 + rr.uniform(-200, 200), 1.0), 0, 1), (part(3100 + rr.uniform(-200, 200), 0.6), gap, 1))
    return fades(verb(y, 0.12, tail=0.15), 0.0003, 0.02)


def key(rr, heavy=False):
    """una tecla mecánica: chasquido + 'thock' del cuerpo"""
    d = 0.09
    tb = tt(d)
    clack = bp(colored(len(tb), rr, 0), 1800, 6500) * ex(tb, 0.004) * rr.uniform(0.6, 1.0)
    thock = np.sin(phase(np.full(len(tb), rr.uniform(320, 460)))) * ex(tb, 0.012) * (0.7 if heavy else 0.45)
    body = modal(d, [(rr.uniform(1500, 2400), 0.3, 0.01)], rr)
    return clack + thock + body


def typing(dur=1.4, cps=13, seed=1):
    rr = rng(200 + seed)
    t, parts = 0.02, []
    while t < dur - 0.12:
        heavy = rr.random() < 0.12  # barra espaciadora / enter
        parts.append((autopan(key(rr, heavy), rr.uniform(-0.3, 0.3), rr.uniform(-0.3, 0.3)), t, rr.uniform(0.55, 1.0)))
        t += rr.exponential(1 / cps) * 0.7 + 0.025
    return fades(verb(mix(dur, *parts), 0.12), 0.002, 0.05)


def stamp(dur=0.8):
    """sello de goma: golpe grave + papel"""
    t = tt(0.5)
    thump = np.sin(phase(85 + 60 * ex(t, 0.015))) * ex(t, 0.07)
    paper = bp(colored(len(t), r, 0.5), 600, 5000) * ex(t, 0.025) * 0.7
    rattle = modal(0.3, [(210, 0.3, 0.05), (460, 0.2, 0.03)], r)
    y = mix(dur, (thump + paper, 0, 1), (rattle, 0.004, 0.6))
    return fades(verb(y, 0.25), 0.0005, 0.1)


def crumble(dur=1.8):
    """se cae todo: muchos golpecitos con pitch al azar + rumble grave"""
    t = tt(dur)
    rumble = lp(colored(len(t), r, 1.8), 220) * np.interp(t, [0, 0.1, 0.9, dur], [0, 1, 0.6, 0]) * 0.8
    parts = [(st(rumble), 0, 1)]
    for i in range(34):
        at = abs(r.normal(0.35, 0.3))
        f = r.uniform(300, 2200)
        x = modal(0.15, [(f, 1, 0.02), (f * 1.6, 0.5, 0.012)], r) + 0.5 * bp(colored(ns(0.15), r, 0), 800, 4000) * ex(tt(0.15), 0.01)
        parts.append((autopan(x, r.uniform(-0.8, 0.8), r.uniform(-0.8, 0.8)), min(at, dur - 0.2), r.uniform(0.15, 0.5)))
    parts.append((impact(1.0, 40), 0, 0.6))
    return fades(verb(mix(dur, *parts), 0.2, IR_HALL, 0.0)[:, :ns(dur)], 0.002, 0.25)


def build(dur=1.2, n=7):
    """se arma de nuevo: blips ascendentes (pentatónica) que van de izquierda a derecha"""
    notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5]
    parts = []
    for i in range(n):
        tb = tt(0.16)
        f = notes[i % len(notes)]
        x = (np.sin(TAU * f * tb) + 0.3 * np.sign(np.sin(TAU * f * tb)) * 0.3) * ex(tb, 0.05) * (1 - ex(tb, 0.002))
        parts.append((autopan(lp(x, 4000), -0.7 + 1.4 * i / max(1, n - 1), -0.7 + 1.4 * i / max(1, n - 1)), i * (dur - 0.3) / n, 0.7))
    return fades(verb(mix(dur, *parts), 0.25), 0.001, 0.1)


def success(dur=1.4, notes=(783.99, 987.77, 1174.66, 1567.98), gap=0.075):
    """arpegio de campanita que sube (mayor) con cola"""
    parts = []
    for i, f in enumerate(notes):
        x = modal(0.9, [(f, 1, 0.3), (f * 2.0, 0.25, 0.15), (f * 3.01, 0.08, 0.08)], r)
        parts.append((autopan(x, -0.4 + 0.27 * i, -0.4 + 0.27 * i), i * gap, 0.55))
    return fades(verb(mix(dur, *parts), 0.3, IR_HALL, 0.0)[:, :ns(dur)], 0.001, 0.15)


def error(dur=0.5):
    """'bzzt' doble, cuadrada filtrada, sin estridencia"""
    def bz(d):
        tb = tt(d)
        x = np.sign(np.sin(TAU * 150 * tb)) + 0.5 * np.sign(np.sin(TAU * 151.5 * tb))
        return lp(x, 1600) * (1 - ex(tb, 0.004)) * np.minimum(1, (d - tb) / 0.02)
    return fades(verb(mix(dur, (bz(0.11), 0, 0.6), (bz(0.16), 0.15, 0.6)), 0.12), 0.001, 0.05)


def glitch(dur=0.45):
    """glitch digital corto: tartamudeo de ruido 'crushed' + cuadradas"""
    n = ns(dur)
    t = tt(dur)
    hold = np.repeat(r.uniform(-1, 1, n // 23 + 1), 23)[:n]
    crush = np.round(hold * 4) / 4 * (np.floor(t * 38) % 3 != 0) * ex(t, 0.18)
    sq = np.sign(np.sin(TAU * np.where((t * 24) % 1 < 0.5, 1200, 700) * t)) * (t < 0.2) * 0.4
    y = hp(crush, 400) * 0.6 + lp(sq, 4000)
    return fades(verb(autopan(y, -0.4, 0.4), 0.1), 0.001, 0.04)


def conveyor(dur=2.6):
    """cinta transportadora: zumbido de motor + traqueteo rítmico"""
    t = tt(dur)
    hum = (np.sin(TAU * 60 * t) + 0.5 * np.sin(TAU * 120 * t) + 0.25 * np.sin(TAU * 180 * t)) * 0.25
    hum += 0.3 * lp(colored(len(t), r, 1), 400)
    parts = [(st(hum * np.interp(t, [0, 0.3, dur - 0.4, dur], [0, 1, 1, 0])), 0, 1)]
    k = 0
    while k * 0.19 < dur - 0.3:
        x = modal(0.08, [(900 + 80 * (k % 2), 1, 0.01), (1700, 0.4, 0.006)], r) * 0.5
        parts.append((x, 0.15 + k * 0.19, 0.6 if k % 2 == 0 else 0.4))
        k += 1
    return fades(verb(mix(dur, *parts), 0.15), 0.05, 0.3)


def sparkle(dur=0.9):
    """brillito (sticker / tilde): campanitas agudas al azar en estéreo"""
    parts = []
    for i in range(7):
        f = r.uniform(2400, 5200)
        x = modal(0.4, [(f, 1, 0.08), (f * 2.3, 0.3, 0.04)], r)
        parts.append((autopan(x, r.uniform(-0.8, 0.8), r.uniform(-0.8, 0.8)), i * 0.045 + r.uniform(0, 0.02), r.uniform(0.3, 0.7)))
    return fades(verb(mix(dur, *parts), 0.3, IR_HALL, 0.0)[:, :ns(dur)], 0.001, 0.1)


def pen(dur=0.8, seed=0):
    """lápiz/lapicera escribiendo: trazos cortos de ruido filtrado con fricción"""
    rr = rng(300 + seed)
    t = tt(dur)
    x = bp(colored(len(t), rr, 0.3), 2500, 7000)
    strokes = np.zeros(len(t))
    k = 0.03
    while k < dur - 0.08:
        d = rr.uniform(0.05, 0.13)
        a, b = ns(k), ns(min(dur, k + d))
        strokes[a:b] = np.sin(np.linspace(0, np.pi, b - a)) * rr.uniform(0.5, 1)
        k += d + rr.uniform(0.02, 0.06)
    grit = 1 + 0.6 * np.sign(np.sin(TAU * rr.uniform(35, 60) * t))
    return fades(verb(autopan(x * strokes * grit * 0.5, -0.2, 0.2), 0.1), 0.002, 0.05)


def card(seed=0, dur=0.35):
    """tarjeta que se apoya: deslizamiento de papel + golpecito suave"""
    rr = rng(400 + seed)
    t = tt(0.2)
    slide = bp(colored(len(t), rr, 0.5), 1200 + rr.uniform(-200, 300), 6000) * np.sin(np.pi * np.minimum(1, t / 0.12)) ** 2 * (t < 0.12)
    tb = tt(0.15)
    tap = np.sin(phase(np.full(len(tb), rr.uniform(160, 240)))) * ex(tb, 0.03) + 0.4 * modal(0.15, [(rr.uniform(900, 1400), 1, 0.02)], rr)
    p = rr.uniform(-0.5, 0.5)
    y = mix(dur, (autopan(slide * 0.5, p - 0.3, p), 0, 1), (autopan(tap, p, p), 0.1, 0.8))
    return fades(verb(y, 0.12), 0.001, 0.05)


SFX = {
    # nombre: (función, loudness momentáneo máximo en LUFS)
    "swish_a": (lambda: swish(0.42, 500, 3800, -0.8, 0.8), -21), "swish_b": (lambda: swish(0.5, 350, 3000, 0.8, -0.7, 0.6), -21),
    "swish_down": (swish_down, -20), "riser": (riser, -22),
    "impact": (impact, -16), "reveal": (reveal, -18), "problem": (problem, -19),
    "pop1": (lambda: pop(440, 1100, p=-0.25), -21), "pop2": (lambda: pop(520, 1300, p=0.25), -21),
    "pop3": (lambda: pop(380, 950, p=-0.1), -21), "pop4": (lambda: pop(600, 1500, p=0.15), -21),
    "tick": (tick, -24), "mouse1": (lambda: mouse(1), -21), "mouse2": (lambda: mouse(2), -21), "mouse3": (lambda: mouse(3), -21),
    "typing": (typing, -24), "typing_short": (lambda: typing(0.7, 15, 4), -24),
    "stamp": (stamp, -17), "crumble": (crumble, -18), "build": (build, -21), "success": (success, -20),
    "error": (error, -22), "glitch": (glitch, -22), "conveyor": (conveyor, -25), "sparkle": (sparkle, -23),
    # variantes (para que lo repetido no suene igual)
    "swish_c": (lambda: swish(0.38, 700, 5000, -0.5, 0.9, 0.45), -22), "swish_d": (lambda: swish(0.55, 250, 2200, 0.9, -0.3, 0.65), -21),
    "tick1": (lambda: tick(f=2700, p=-0.3), -24), "tick2": (lambda: tick(f=3500, p=0.3), -24), "tick3": (lambda: tick(f=2300, p=0.0), -24),
    "reveal2": (lambda: reveal(notes=(587.33, 739.99, 880.0, 1318.5), f=46), -18),
    "reveal3": (lambda: reveal(notes=(493.88, 622.25, 739.99, 1108.73), f=56), -18),
    "problem2": (lambda: problem(n1=207.65, n2=196.0), -19), "problem3": (lambda: problem(n1=261.63, n2=246.94), -19),
    "success2": (lambda: success(notes=(1046.5, 1318.5, 1567.98), gap=0.09), -20),
    "success3": (lambda: success(notes=(659.25, 830.61, 987.77, 1318.5), gap=0.06), -20),
    "pen": (pen, -24), "pen2": (lambda: pen(0.6, 2), -24),
    "card1": (lambda: card(1), -22), "card2": (lambda: card(2), -22), "card3": (lambda: card(3), -22),
}

if __name__ == "__main__":
    only = set(sys.argv[2:])
    for name, (fn, lufs) in SFX.items():
        if only and name not in only:
            continue
        y = st(fn())
        y = norm_to(y, lufs)
        y = y / max(1.0, np.abs(y).max() / 0.89)  # sin clipping
        write_wav(str(OUT / f"{name}.wav"), y, bits=16)
        print(f"{name:13s} {y.shape[1] / SR:5.2f} s")
