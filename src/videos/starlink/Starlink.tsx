// "Armamos una antena de Starlink desde cero" — estilo 2D premium, 9:16, todas las redes.
// 12 escenas con transiciones. Cada evento atado a una palabra de la voz (words.json).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/starlink/voice/words.json";
import { Counter, Sfx, SfxTrack, Sticker, Title, clamp, ease, lerp, makeCue, pop, ramp, rnd, useFonts } from "../_cartoon3d/kit";
import {
  Defs, Earth, FlatDish, Hills, HouseExt, PAL, ParabolicDish, Phone, Pulse, Router, Satellite, Stars, Tree, WifiIcon, WifiRings,
  alongPath, sceneT,
} from "../_premium2d/art";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const C = {
  internet: cue("internet"), vamos: cue("vamos"), si: cue("si"), cielo: cue("cielo"), satelite: cue("satélite"),
  pero1: cue("pero"), km36: cue("36"), videollamada: cue("videollamada"), traba: cue("traba"),
  entonces: cue("entonces"), cerca: cue("cerca"), quinientos: cue("quinientos"),
  pero2: cue("pero", 2), rapidisimo: cue("rapidísimo"), cruza: cue("cruza"), asi1: cue("así"), miles: cue("miles"),
  pero3: cue("pero", 3), plato: cue("plato"), gira: cue("gira"), placa: cue("placa"), antenitas: cue("antenitas"),
  como: cue("habla") - 0.75, ondas: cue("ondas"), linterna: cue("linterna"), si2: cue("si", 2), inclina: cue("inclina"),
  asi2: cue("así", 2), moverse: cue("moverse"), sube: cue("sube"), baja: cue("baja"),
  ahora: cue("ahora"), estacion: cue("estación"), fibra: cue("fibra", 2), oceano: cue("océano"), laseres: cue("láseres"),
  router: cue("router"), wifi2: cue("wifi", 2), eso: cue("eso", 2), arbol: cue("árbol"), corta2: cue("corta", 2),
  listo: cue("listo") - 0.15, espacio: cue("espacio"), cable: cue("cable", 3), sabias: cue("sabías") - 0.25,
};
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.6) * FPS);

// escenas (inicio, fin) — se superponen 0.35 s para fundir
const S = {
  campo: [0, C.pero1], orbitas: [C.pero1, C.pero3], antena: [C.pero3, C.como], haz: [C.como, C.ahora],
  estacion: [C.ahora, C.oceano - 0.6], oceano: [C.oceano - 0.6, cue("casa", 2) - 0.4], casa: [cue("casa", 2) - 0.4, C.eso],
  arbol: [C.eso, C.listo], final: [C.listo, 999],
} as const;
const PIECES = [C.satelite - 0.5, C.entonces, C.asi1, C.placa, C.ondas - 0.2, C.estacion - 1.2, C.oceano - 0.6, cue("casa", 2) - 0.4, C.corta2 + 0.3];

// ---------------------------------------------------------------- escenas
const Field: React.FC<{ t: number }> = ({ t }) => {
  // al decir "cielo" la cámara sube del campo al cielo nocturno
  const pan = ease(ramp(t, C.si, 2.6)) * 1150;
  const night = ramp(t, C.si + 0.5, 2.0);
  const cut = ramp(t, 2.0, 0.6);
  const cross = ramp(t, C.internet - 0.1, 0.4);
  const sat = ease(ramp(t, C.cielo - 0.5, 1.4));
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gDusk)" />
      <rect width={1080} height={1920} fill="url(#gNight)" opacity={night} />
      <Stars t={t} n={110} h={1600} />
      {/* nubes que se desplazan (movimiento constante en el gancho) */}
      <g transform={`translate(0 ${pan * 0.4})`} opacity={0.85 * (1 - night * 0.7)}>
        {[[0, 760, 1.0], [1, 900, 0.7], [2, 640, 0.85]].map(([i, y, s]) => {
          const x = ((t * (18 + i * 9) + i * 400) % 1400) - 200;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <ellipse cx={0} cy={0} rx={120} ry={34} fill="#ffd9c4" />
              <ellipse cx={-50} cy={-20} rx={60} ry={34} fill="#ffe4d4" />
              <ellipse cx={40} cy={-26} rx={70} ry={40} fill="#ffe4d4" />
            </g>
          );
        })}
      </g>
      {/* acercamiento lento de cámara durante el gancho */}
      <g transform={`translate(${pan === 0 ? 0 : 0} ${pan}) translate(600 1440) scale(${1 + 0.06 * ease(ramp(t, 0, C.si))}) translate(-600 -1440)`}>
        <circle cx={760} cy={1120} r={90} fill="#ffd98a" opacity={0.9 * (1 - night)} filter="url(#glow)" />
        <Hills y={1300} tone="dusk" />
        {/* la ciudad a lo lejos y el cable que no llega */}
        <g opacity={0.85}>
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={40 + i * 34} y={1180 - (40 + rnd(i) * 80)} width={28} height={40 + rnd(i) * 80} fill="#5b4f8f" />)}
        </g>
        <path d="M120 1180 C 260 1190, 330 1220, 420 1240" stroke="#2b2b4b" strokeWidth={6} fill="none" />
        <g transform="translate(430 1240)" opacity={cut}>
          <circle r={26} fill={PAL.red} filter="url(#shSm)" />
          <path d="M-11 -11 L11 11 M11 -11 L-11 11" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
        </g>
        <rect x={0} y={1330} width={1080} height={700} fill="url(#gGrass)" />
        <g transform={`rotate(${1.5 * Math.sin(t * 1.8)} 180 1420)`}><Tree x={180} y={1420} s={0.9} /></g>
        <HouseExt x={600} y={1440} s={1.05} lit={1} />
        {/* cerca */}
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={760 + i * 34} y={1400} width={10} height={60} rx={3} fill="#e8d5b5" />)}
        <rect x={760} y={1418} width={290} height={8} fill="#e8d5b5" />
        <g opacity={cross}><WifiIcon x={880} y={1180} s={1.1} crossed={ramp(t, C.internet, 0.3)} /></g>
      </g>
      {/* el satélite aparece arriba */}
      {sat > 0 ? <Satellite x={lerp(1250, 560, sat)} y={lerp(1100, 1180, sat)} s={1.2} rot={-12 + 6 * Math.sin(t)} /> : null}
      {sat > 0.9 ? <circle cx={560} cy={1180} r={160 + 20 * Math.sin(t * 4)} fill="none" stroke={PAL.cyan} strokeWidth={3} opacity={0.4} /> : null}
    </g>
  );
};

const Orbits: React.FC<{ t: number }> = ({ t }) => {
  const E = { x: 500, y: 1200, r: 190 };
  const geo = 470, leo = 250;
  const leoOn = ramp(t, C.entonces + 0.3, 0.6);
  const geoDim = 1 - 0.65 * leoOn;
  // pulso Tierra -> satélite -> Tierra: lento en la órbita lejana, rápido en la baja
  const pulse = (R: number, period: number, ang: number) => {
    const u = (t % period) / period, k = u < 0.5 ? u * 2 : 2 - u * 2;
    const sx = E.x + Math.cos(ang) * R, sy = E.y + Math.sin(ang) * R;
    const gx = E.x + Math.cos(ang) * E.r, gy = E.y + Math.sin(ang) * E.r;
    return [lerp(gx, sx, k), lerp(gy, sy, k)];
  };
  const gAng = -1.1, lAng = -1.6 + (t - C.entonces) * 0.25 * (t > C.pero2 ? 3 : 1);
  const [gpx, gpy] = pulse(geo, 3.0, gAng);
  const [lpx, lpy] = pulse(leo, 0.7, lAng);
  const many = ramp(t, C.miles - 0.3, 1.6);
  const call = pop(t, C.videollamada - 0.1, 0.4) * (1 - ramp(t, C.entonces + 0.3, 0.3));
  const frozen = t < C.traba + 0.3 ? (Math.floor(t * 2) % 2) : 1;
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gSpace)" />
      <Stars t={t} n={150} h={1920} seed={2} />
      <circle cx={E.x} cy={E.y} r={geo} fill="none" stroke="#8fb4ff" strokeWidth={3} strokeDasharray="10 14" opacity={0.6 * geoDim} />
      <Earth cx={E.x} cy={E.y} r={E.r} t={t} />
      {leoOn > 0 ? <circle cx={E.x} cy={E.y} r={leo} fill="none" stroke={PAL.cyan} strokeWidth={4} strokeDasharray="8 10" opacity={0.85 * leoOn} /> : null}
      {/* satélite lejano y su pulso lento */}
      <g opacity={geoDim}>
        <Satellite x={E.x + Math.cos(gAng) * geo} y={E.y + Math.sin(gAng) * geo} s={0.5} rot={20} />
        {t < C.entonces + 0.5 ? <Pulse x={gpx} y={gpy} r={11} color="#ffd23f" /> : null}
      </g>
      {/* órbita baja: un satélite (rápido), después muchos, después miles */}
      {leoOn > 0 ? (
        <g opacity={leoOn}>
          <Satellite x={E.x + Math.cos(lAng) * leo} y={E.y + Math.sin(lAng) * leo} s={0.42} rot={lAng * 57} />
          {t < C.pero2 ? <Pulse x={lpx} y={lpy} r={10} color={PAL.green} /> : null}
          {t > C.pero2 ? Array.from({ length: 10 }, (_, i) => {
            const a = lAng + (i / 10) * Math.PI * 2;
            return <Satellite key={i} x={E.x + Math.cos(a) * leo} y={E.y + Math.sin(a) * leo} s={0.3 * pop(t, C.asi1 + i * 0.06, 0.3)} rot={a * 57} glow={false} />;
          }) : null}
          {many > 0 ? Array.from({ length: 260 }, (_, i) => {
            const shell = leo - 18 + (i % 4) * 12, a = (i / 260) * Math.PI * 2 * 7 + (t - C.miles) * (0.8 + (i % 4) * 0.1);
            const tilt = (i % 7) * 0.25;
            const x = E.x + Math.cos(a) * shell, y = E.y + Math.sin(a) * shell * Math.cos(tilt) * 0.98;
            return <circle key={i} cx={x} cy={y} r={3} fill="#e9f6ff" opacity={many * clamp(many * 2.5 - rnd(i) * 1.5)} />;
          }) : null}
        </g>
      ) : null}
      {/* la videollamada que se traba (y después fluye) */}
      {call > 0.01 ? (
        <g transform={`translate(800 1520) scale(${call})`} filter="url(#sh)">
          <rect x={-150} y={-100} width={300} height={200} rx={22} fill="#1e293b" />
          <circle cx={0} cy={-15} r={44} fill="#fbbf24" />
          <rect x={-60} y={34} width={120} height={50} rx={25} fill="#fbbf24" />
          <rect x={-150} y={-100} width={300} height={200} rx={22} fill="#0f172a" opacity={frozen ? 0.55 : 0} />
          {frozen ? <circle cx={0} cy={0} r={28} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray="44 132" transform={`rotate(${t * 360} 0 0)`} /> : null}
        </g>
      ) : null}
    </g>
  );
};

const Antenna: React.FC<{ t: number }> = ({ t }) => {
  const dizzy = clamp(ramp(t, C.plato - 0.2, 0.4) - ramp(t, C.placa, 0.4));
  const x = ramp(t, C.gira, 0.25);
  const flat = pop(t, C.placa - 0.15, 0.5);
  const open = ease(ramp(t, C.antenitas - 0.4, 0.8));
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gDay)" />
      <circle cx={850} cy={760} r={80} fill="#fff6c2" filter="url(#glow)" />
      <Hills y={1340} tone="day" />
      <rect x={0} y={1380} width={1080} height={600} fill="url(#gGrass)" />
      {/* "tendría que perseguirlos": satélites que cruzan el cielo a toda velocidad */}
      {t < C.placa ? [0, 1, 2].map((i) => {
        const u = ((t - C.pero3) * 0.55 + i / 3) % 1;
        const x = lerp(-150, 1230, u), y = 820 + i * 90 - Math.sin(u * Math.PI) * 60;
        return (
          <g key={i} opacity={1 - ramp(t, C.placa - 0.4, 0.4)}>
            <line x1={x - 220} y1={y + 20} x2={x - 40} y2={y + 4} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
            <Satellite x={x} y={y} s={0.45} rot={-6} />
          </g>
        );
      }) : null}
      {/* el plato que gira mareado, tachado */}
      {dizzy > 0.01 ? (
        <g opacity={dizzy}>
          <ParabolicDish x={500} y={1230} s={1.4} rot={-40 + 70 * Math.sin(t * 6)} />
          <g opacity={x}>
            <line x1={330} y1={1060} x2={670} y2={1380} stroke={PAL.red} strokeWidth={16} strokeLinecap="round" />
            <line x1={670} y1={1060} x2={330} y2={1380} stroke={PAL.red} strokeWidth={16} strokeLinecap="round" />
          </g>
        </g>
      ) : null}
      {flat > 0.01 ? <g opacity={clamp(flat * 2)}><FlatDish x={500} y={1180} s={1.25 * flat} open={open} t={t} tilt={-8} /></g> : null}
    </g>
  );
};

const Beam: React.FC<{ t: number }> = ({ t }) => {
  // vista "de perfil": fila de antenitas abajo, ondas que salen de cada una y forman un haz
  const N = 13, x0 = 200, dx = 50, y0 = 1420;
  const steer = clamp(ramp(t, C.si2 + 0.3, 1.0));                       // empiezan a dispararse escalonadas
  const track = t > C.asi2 ? (t - C.asi2) : 0;                          // el satélite cruza y el haz lo sigue
  const satX = t > C.asi2 ? lerp(260, 780, clamp(track / 4.5)) : lerp(500, 760, steer);
  const angle = Math.atan2(satX - 500, 1420 - 900) * 180 / Math.PI;   // hacia el satélite
  const delay = Math.sin(angle * Math.PI / 180) * 0.12;                 // retraso entre antenitas
  const beamOn = ramp(t, C.ondas + 0.6, 0.6);
  const packets = t > C.sube - 0.1;
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gSpace)" />
      <Stars t={t} n={70} h={1300} seed={5} />
      {/* el haz (cono) */}
      <g transform={`rotate(${angle} 500 ${y0})`} opacity={beamOn}>
        <path d={`M ${500 - 330} ${y0} L ${500 - 120} 820 L ${500 + 120} 820 L ${500 + 330} ${y0} Z`} fill="url(#gBeam)" opacity={0.45} />
      </g>
      {/* ondas de cada antenita */}
      {Array.from({ length: N }, (_, i) => {
        const ax = x0 + i * dx;
        const d = (i - (N - 1) / 2) * delay * steer;
        return (
          <g key={i}>
            {[0, 1, 2, 3].map((k) => {
              const u = ((t - C.ondas - d) * 0.55 + k / 4) % 1;
              if (t < C.ondas || u < 0) return null;
              return <circle key={k} cx={ax} cy={y0} r={10 + u * 520} fill="none" stroke={PAL.cyan} strokeWidth={3} opacity={0.5 * (1 - u)} />;
            })}
          </g>
        );
      })}
      {/* la placa (quieta) */}
      <rect x={160} y={y0 - 14} width={680} height={50} rx={14} fill="#1a2552" filter="url(#sh)" />
      {Array.from({ length: N }, (_, i) => <circle key={i} cx={x0 + i * dx} cy={y0} r={11} fill={PAL.cyan} filter="url(#glowSm)" />)}
      {/* el satélite */}
      <Satellite x={satX} y={880} s={0.65} rot={0} />
      {/* paquetes que suben (pedido) y bajan (respuesta) por el haz */}
      {packets ? Array.from({ length: 6 }, (_, i) => {
        const up = i % 2 === 0;
        const u = ((t - C.sube) * 0.7 + i / 6) % 1;
        const k = up ? u : 1 - u;
        if (!up && t < C.baja - 0.1) return null;
        return <Pulse key={i} x={lerp(500, satX, k)} y={lerp(y0 - 30, 930, k)} r={13} color={up ? PAL.yellow : PAL.green} />;
      }) : null}
    </g>
  );
};

const Station: React.FC<{ t: number }> = ({ t }) => {
  const beam = ramp(t, C.ahora + 0.8, 0.6);
  const fib = ease(ramp(t, cue("fibra", 2) - 1.0, 1.2));
  const pts: [number, number][] = [[380, 1500], [380, 1640], [960, 1640], [960, 1520]];
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gNight)" />
      <Stars t={t} n={90} h={1100} seed={8} />
      <Satellite x={300} y={820} s={0.7} rot={10} />
      {beam > 0 ? <path d="M300 860 L330 1300 L420 1300 Z" fill={PAL.cyan} opacity={0.35 * beam} filter="url(#glowSm)" /> : null}
      <Hills y={1330} tone="night" />
      <rect x={0} y={1460} width={1080} height={60} fill="#2f6b4a" />
      <rect x={0} y={1510} width={1080} height={420} fill="url(#gSoil)" />
      {/* capas de tierra */}
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={1560 + rnd(i + 3) * 330} r={4 + rnd(i + 5) * 6} fill="#4a2d1e" opacity={0.6} />)}
      {/* estación con antenas grandes */}
      <ParabolicDish x={330} y={1300} s={1.0} rot={-25} big />
      <ParabolicDish x={160} y={1330} s={0.75} rot={-30} big />
      <rect x={440} y={1370} width={150} height={100} rx={8} fill="#cbd5e1" filter="url(#shSm)" />
      {[0, 1, 2].map((i) => <rect key={i} x={455 + i * 45} y={1395} width={30} height={20} rx={3} fill="#ffe6a3" />)}
      {/* ciudad con data center a la derecha */}
      {[0, 1, 2, 3].map((i) => <rect key={i} x={720 + i * 70} y={1460 - (140 + rnd(i + 9) * 180)} width={58} height={140 + rnd(i + 9) * 180} rx={6} fill="#33406e" filter="url(#shSm)" />)}
      {[0, 1, 2, 3].map((i) => Array.from({ length: 6 }, (_, k) => <rect key={`${i}-${k}`} x={730 + i * 70} y={1450 - 20 - k * 28} width={12} height={10} fill="#ffe6a3" opacity={rnd(i * 9 + k) > 0.4 ? 0.9 : 0.2} />))}
      {/* fibra bajo tierra, con pulsos */}
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#1e3a5f" strokeWidth={16} strokeLinejoin="round" />
      <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="url(#gFiber)" strokeWidth={9} strokeLinejoin="round"
        strokeDasharray={`${1300 * fib} 2000`} filter="url(#glowSm)" />
      {fib > 0.9 ? Array.from({ length: 5 }, (_, i) => {
        const [x, y] = alongPath(pts, ((t * 0.5) + i / 5) % 1);
        return <Pulse key={i} x={x} y={y} r={9} />;
      }) : null}
    </g>
  );
};

const Ocean: React.FC<{ t: number }> = ({ t }) => {
  const sats: [number, number][] = [[150, 900], [380, 820], [620, 800], [860, 840]];
  const hop = ramp(t, C.laseres - 1.2, 2.0);
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gNight)" />
      <Stars t={t} n={100} h={1200} seed={11} />
      <path d="M0 1300 Q540 1230 1080 1300 L1080 1920 L0 1920 Z" fill="url(#gSea)" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${(i * 97 + t * 30) % 1180 - 100} ${1360 + (i % 5) * 60} q 30 -10 60 0`} stroke="#5aa0e8" strokeWidth={3} fill="none" opacity={0.5} />)}
      {/* un barco y la costa lejana con estación */}
      <g transform={`translate(${260 + Math.sin(t) * 6} 1420)`}><path d="M-60 0 L60 0 L40 26 L-40 26 Z" fill="#e2e8f0" /><rect x={-10} y={-40} width={20} height={40} fill="#94a3b8" /></g>
      <path d="M880 1300 Q980 1270 1080 1290 L1080 1340 L880 1340 Z" fill="#2f6b4a" />
      <ParabolicDish x={980} y={1235} s={0.5} rot={-35} big />
      {sats.map(([x, y], i) => <Satellite key={i} x={x} y={y} s={0.45} rot={i * 8} />)}
      {/* láseres de satélite en satélite, hasta la costa */}
      {sats.slice(1).map(([x, y], i) => {
        const k = clamp(hop * 4 - i);
        const [px, py] = sats[i];
        return k > 0 ? <line key={i} x1={px} y1={py} x2={lerp(px, x, k)} y2={lerp(py, y, k)} stroke="#ff4d8d" strokeWidth={5} filter="url(#glowSm)" /> : null;
      })}
      {hop > 0.75 ? <line x1={860} y1={840} x2={lerp(860, 980, ramp(t, C.laseres + 0.3, 0.4))} y2={lerp(840, 1220, ramp(t, C.laseres + 0.3, 0.4))} stroke="#ff4d8d" strokeWidth={5} filter="url(#glowSm)" /> : null}
      <line x1={260} y1={1400} x2={150} y2={900} stroke={PAL.cyan} strokeWidth={4} opacity={0.6 * ramp(t, C.oceano, 0.4)} strokeDasharray="10 8" />
    </g>
  );
};

const House: React.FC<{ t: number }> = ({ t }) => {
  const cab = ease(ramp(t, cue("conecta") - 0.2, 0.8));
  const wifi = ramp(t, C.wifi2 - 0.4, 0.4);
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gDay)" />
      <rect x={0} y={1520} width={1080} height={400} fill="url(#gGrass)" />
      {/* casa en corte: dos pisos */}
      <g filter="url(#sh)">
        <path d="M120 900 L500 700 L880 900 Z" fill="url(#gRoof)" />
        <rect x={150} y={900} width={700} height={620} fill="#f8ead0" />
      </g>
      <rect x={170} y={920} width={660} height={280} fill="#fdf3e1" />
      <rect x={170} y={1220} width={660} height={280} fill="#fff7ea" />
      <rect x={150} y={1200} width={700} height={20} fill="#c9a77c" />
      <rect x={490} y={920} width={14} height={280} fill="#e6d2b0" />
      {/* cuarto de arriba: cama y lámpara */}
      <rect x={560} y={1110} width={220} height={70} rx={14} fill="#f472b6" />
      <rect x={560} y={1090} width={70} height={36} rx={10} fill="#fff" />
      <circle cx={300} cy={980} r={70} fill="url(#gWarm)" opacity={0.7} />
      <rect x={260} y={1060} width={120} height={80} rx={6} fill="#93c5fd" />
      {/* living: sillón, tele, escritorio */}
      <rect x={200} y={1400} width={220} height={80} rx={20} fill="#6d7fe0" filter="url(#shSm)" />
      <rect x={560} y={1290} width={220} height={130} rx={10} fill="#111827" />
      <rect x={570} y={1300} width={200} height={110} rx={6} fill={wifi > 0.5 ? "#f43f5e" : "#334155"} />
      <rect x={600} y={1430} width={160} height={60} rx={8} fill="#8b5e3c" />
      {/* antena en el techo y cable bajando al router */}
      <g transform="translate(640 780) rotate(-20)" filter="url(#shSm)"><rect x={-6} y={0} width={12} height={40} fill="#8b95a8" /><rect x={-50} y={-34} width={100} height={64} rx={10} fill="url(#gMetal)" /></g>
      <polyline points="640,820 860,890 860,1380 440,1380" fill="none" stroke="#1f2937" strokeWidth={8} strokeDasharray={`${1100 * cab} 2000`} />
      <Router x={440} y={1360} s={0.9} on={cab > 0.95 ? 1 : 0} t={t} />
      <WifiRings x={440} y={1330} t={t} on={wifi} max={300} />
      <Phone x={310} y={1350} s={0.7} on={wifi} />
    </g>
  );
};

const Yard: React.FC<{ t: number }> = ({ t }) => {
  const moved = ease(ramp(t, C.corta2 + 0.4, 0.9));
  const dx = lerp(280, 640, moved), dy = lerp(1400, 1060, moved);
  const blocked = t > C.arbol - 0.2 && moved < 0.5;
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gDay)" />
      <Satellite x={780} y={760} s={0.7} rot={-10} />
      <Hills y={1360} tone="day" />
      <rect x={0} y={1400} width={1080} height={600} fill="url(#gGrass)" />
      <HouseExt x={680} y={1460} s={0.95} lit={0} />
      {/* el haz: cortado por el árbol, o limpio desde el techo */}
      <line x1={dx} y1={dy - 30} x2={blocked ? 420 : 780} y2={blocked ? 1130 : 790} stroke={PAL.cyan} strokeWidth={10} opacity={0.75} filter="url(#glowSm)" />
      <Tree x={430} y={1440} s={1.35} />
      <g transform={`translate(${dx} ${dy}) rotate(-30)`} filter="url(#shSm)">
        <rect x={-6} y={0} width={12} height={46} fill="#8b95a8" /><rect x={-50} y={-34} width={100} height={64} rx={10} fill="url(#gMetal)" />
      </g>
      {blocked ? <WifiIcon x={240} y={1220} s={0.9} color={PAL.red} crossed={1} /> : null}
      {moved > 0.9 ? <WifiIcon x={640} y={960} s={0.9} color={PAL.green} /> : null}
    </g>
  );
};

const ICONS = ["sat", "orb", "many", "panel", "beam", "station", "laser", "wifi", "sky"];
const RecapIcon: React.FC<{ k: string; x: number; y: number; s: number }> = ({ k, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#shSm)">
    <circle r={42} fill="#ffffff" />
    <circle r={36} fill="#1e2a5a" />
    {k === "sat" ? <Satellite x={0} y={0} s={0.17} glow={false} /> : null}
    {k === "orb" ? <g><circle r={10} fill="#3b82f6" /><circle r={22} fill="none" stroke={PAL.cyan} strokeWidth={3} /></g> : null}
    {k === "many" ? <g>{Array.from({ length: 8 }, (_, i) => <circle key={i} cx={Math.cos(i * 0.8) * 20} cy={Math.sin(i * 0.8) * 20} r={3.5} fill="#e9f6ff" />)}</g> : null}
    {k === "panel" ? <rect x={-20} y={-14} width={40} height={28} rx={5} fill="#e2e8f0" /> : null}
    {k === "beam" ? <path d="M-14 18 L-4 -18 L4 -18 L14 18 Z" fill={PAL.cyan} /> : null}
    {k === "station" ? <path d="M-20 4 Q0 26 20 4 Z" fill="#e2e8f0" /> : null}
    {k === "laser" ? <line x1={-20} y1={14} x2={20} y2={-14} stroke="#ff4d8d" strokeWidth={5} /> : null}
    {k === "wifi" ? <WifiIcon x={0} y={6} s={0.32} color={PAL.green} /> : null}
    {k === "sky" ? <g><circle cx={-8} cy={-6} r={10} fill="#ffd23f" /><path d="M-18 14 Q0 -2 18 14 Z" fill="#4ade80" /></g> : null}
  </g>
);

const Final: React.FC<{ t: number }> = ({ t }) => {
  const z = ease(ramp(t, C.listo, 2.2));
  const glow = ramp(t, C.espacio, 0.6);
  return (
    <g>
      <rect width={1080} height={1920} fill="url(#gSpace)" />
      <Stars t={t} n={160} h={1920} seed={14} />
      <g transform={`translate(500 1180) scale(${lerp(2.2, 1, z)}) translate(-500 -1180)`}>
        <Earth cx={500} cy={1180} r={230} t={t} lights={glow} />
        {Array.from({ length: 160 }, (_, i) => {
          const a = (i / 160) * Math.PI * 2 * 5 + t * 0.6, sh = 270 + (i % 3) * 14;
          return <circle key={i} cx={500 + Math.cos(a) * sh} cy={1180 + Math.sin(a) * sh * 0.9} r={2.6} fill="#e9f6ff" opacity={0.8} />;
        })}
        {/* cables de fibra encendidos sobre la Tierra */}
        {[[-0.9, 0.2], [-0.4, 0.8], [0.3, -0.5]].map(([a, b], i) => (
          <path key={i} d={`M${500 + Math.cos(a) * 200} ${1180 + Math.sin(a) * 200} Q 500 1180 ${500 + Math.cos(b) * 200} ${1180 + Math.sin(b) * 200}`} stroke={PAL.cyan} strokeWidth={4} fill="none" opacity={glow} filter="url(#glowSm)" />
        ))}
      </g>
      {/* resumen: las 9 piezas */}
      {ICONS.map((k, i) => <RecapIcon key={k} k={k} x={120 + i * 95} y={1480} s={pop(t, C.cable - 0.6 + i * 0.07, 0.3) * 0.95} />)}
    </g>
  );
};

// ---------------------------------------------------------------- video
const Layer: React.FC<{ t: number; ab: readonly [number, number]; children: (t: number) => React.ReactNode }> = ({ t, ab, children }) => {
  const { o, z } = sceneT(t, ab[0], ab[1]);
  if (o <= 0) return null;
  return <g opacity={o} transform={`translate(540 960) scale(${z}) translate(-540 -960)`}>{children(t)}</g>;
};

const SFX: Sfx[] = [
  { at: 0, s: "whoosh_up", v: 0.6 }, { at: 0.05, s: "pop" }, { at: 2.0, s: "slap", v: 0.6 }, { at: C.internet, s: "slap" }, { at: C.vamos, s: "pop" },
  { at: C.si, s: "whoosh_up" }, { at: C.satelite - 0.4, s: "whoosh", v: 0.8 },
  ...PIECES.map((a): Sfx => ({ at: a, s: "ding", v: 0.75 })),
  ...[S.orbitas[0], S.antena[0], S.haz[0], S.estacion[0], S.oceano[0], S.casa[0], S.arbol[0], S.final[0]].map((a): Sfx => ({ at: a - 0.15, s: "whoosh", v: 0.8 })),
  { at: C.km36, s: "slap" }, { at: C.videollamada, s: "pop" }, { at: C.traba, s: "bleep", v: 0.6 }, { at: C.quinientos, s: "slap" },
  { at: C.rapidisimo, s: "whoosh", v: 0.6 }, { at: C.miles, s: "shield", v: 0.6 },
  { at: C.plato, s: "pop" }, { at: C.gira, s: "slap" }, { at: C.placa, s: "thud", v: 0.6 }, { at: C.antenitas - 0.4, s: "whoosh_up", v: 0.7 },
  { at: C.ondas, s: "bleep", v: 0.6 }, { at: C.si2, s: "pop", v: 0.7 }, { at: C.inclina, s: "whoosh", v: 0.6 }, { at: C.moverse, s: "slap", v: 0.7 },
  { at: C.sube, s: "pop", v: 0.7 }, { at: C.baja, s: "pop", v: 0.7 },
  { at: C.estacion, s: "thud", v: 0.6 }, { at: cue("fibra", 2) - 1.0, s: "whoosh_up", v: 0.6 },
  { at: C.laseres - 1.2, s: "bleep", v: 0.6 }, { at: C.laseres, s: "bleep", v: 0.6 },
  { at: C.router, s: "click" }, { at: C.wifi2 - 0.4, s: "bleep", v: 0.7 },
  { at: C.arbol, s: "slap" }, { at: C.corta2, s: "thud", v: 0.6 }, { at: C.corta2 + 0.4, s: "whoosh_up", v: 0.7 },
  { at: C.listo, s: "whoosh_up", v: 0.8 }, ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i): Sfx => ({ at: C.cable - 0.6 + i * 0.07, s: "pop", v: 0.45 })), { at: C.sabias, s: "ding", v: 0.8 },
];

const P = (t: number, a: number, b: number, l2: string) => <Title t={t} a={a} b={b} l1="Problema:" l2={l2} c2="#ff5a6a" y={420} size={84} />;
const Pz = (t: number, a: number, b: number, n: number, l2: string) => <Title t={t} a={a} b={b} l1={`Pieza ${n}:`} l2={l2} c2="#4ade80" y={420} size={86} />;
const T2 = (t: number, a: number, b: number, l1: string, l2: string, c2 = "#ffd23f", size = 86) => <Title t={t} a={a} b={b} l1={l1} l2={l2} c2={c2} y={420} size={size} />;

export const Starlink: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t = f / fps;
  const n = PIECES.filter((a) => t >= a).length;
  const last = [...PIECES].reverse().find((a) => t >= a) ?? 999;
  return (
    <AbsoluteFill style={{ background: "#0b1030" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Defs />
        <Layer t={t} ab={S.campo}>{(tt) => <Field t={tt} />}</Layer>
        <Layer t={t} ab={S.orbitas}>{(tt) => <Orbits t={tt} />}</Layer>
        <Layer t={t} ab={S.antena}>{(tt) => <Antenna t={tt} />}</Layer>
        <Layer t={t} ab={S.haz}>{(tt) => <Beam t={tt} />}</Layer>
        <Layer t={t} ab={S.estacion}>{(tt) => <Station t={tt} />}</Layer>
        <Layer t={t} ab={S.oceano}>{(tt) => <Ocean t={tt} />}</Layer>
        <Layer t={t} ab={S.casa}>{(tt) => <House t={tt} />}</Layer>
        <Layer t={t} ab={S.arbol}>{(tt) => <Yard t={tt} />}</Layer>
        <Layer t={t} ab={S.final}>{(tt) => <Final t={tt} />}</Layer>
        {/* viñeta suave para dar profundidad */}
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></radialGradient>
        <rect width={1080} height={1920} fill="url(#vig)" pointerEvents="none" />
      </svg>

      <Counter label="PIEZAS" n={n} t={t} lastAt={last} o={ramp(t, C.si, 0.3)} color={n ? "#4ade80" : "#aab4c8"} top={300} />

      {T2(t, 0.05, C.vamos - 0.1, "¿Internet en el", "medio del campo?")}
      {T2(t, C.vamos, C.si - 0.1, "Armamos una antena", "de Starlink", "#5ee7ff")}
      {T2(t, C.si, C.satelite - 0.6, "Sin cables, la señal", "viene del cielo")}
      {Pz(t, C.satelite - 0.5, C.pero1 - 0.1, 1, "el satélite")}
      {P(t, C.pero1, C.entonces - 0.1, "está a 36.000 km")}
      <Sticker t={t} a={C.km36} b={C.entonces - 0.1} x={260} y={1530} text="36.000 km" mono bg="#ffd23f" rot={-4} size={46} />
      {Pz(t, C.entonces, C.pero2 - 0.1, 2, "órbita baja")}
      <Sticker t={t} a={C.quinientos} b={C.pero2 - 0.1} x={500} y={1500} text="550 km" mono bg="#5ee7ff" rot={3} size={50} />
      {P(t, C.pero2, C.asi1 - 0.1, "se mueven rapidísimo")}
      {Pz(t, C.asi1, C.pero3 - 0.1, 3, "miles de satélites")}
      {P(t, C.pero3, C.placa - 0.1, "hay que perseguirlos")}
      {Pz(t, C.placa, C.como - 0.1, 4, "la antena plana")}
      <Sticker t={t} a={C.antenitas} b={C.como - 0.1} x={500} y={1500} text="cientos de antenitas" rot={-3} size={42} />
      {T2(t, C.como, C.ondas - 0.25, "¿Cómo se habla", "con el satélite?")}
      {Pz(t, C.ondas - 0.2, C.si2 - 0.1, 5, "el haz de radio")}
      <Sticker t={t} a={C.linterna - 0.6} b={C.si2 - 0.1} x={500} y={1520} text="como una linterna" rot={3} size={42} />
      {T2(t, C.si2, C.asi2 - 0.1, "Un instante antes...", "y el haz se inclina", "#5ee7ff", 82)}
      {T2(t, C.asi2, C.sube - 0.2, "Apunta al satélite", "sin moverse", "#5ee7ff", 84)}
      {T2(t, C.sube - 0.2, C.ahora - 0.1, "Sube tu pedido,", "baja la respuesta", "#4ade80", 84)}
      {P(t, C.ahora, C.estacion - 1.2, "el satélite no es internet")}
      {Pz(t, C.estacion - 1.2, S.oceano[0] - 0.1, 6, "estación en tierra")}
      <Sticker t={t} a={cue("fibra", 2) - 0.3} b={S.oceano[0] - 0.1} x={560} y={1500} text="fibra bajo tierra" mono bg="#5ee7ff" rot={-3} size={42} />
      {Pz(t, S.oceano[0], S.casa[0] - 0.1, 7, "láseres entre satélites")}
      {Pz(t, S.casa[0], C.eso - 0.1, 8, "router y WiFi")}
      {P(t, C.eso, C.corta2 + 0.2, "un árbol corta el haz")}
      {Pz(t, C.corta2 + 0.3, C.listo - 0.1, 9, "cielo despejado")}
      {T2(t, C.listo, C.sabias - 0.1, "¡Y listo!", "internet desde el espacio", "#5ee7ff", 84)}
      {T2(t, C.sabias, END + 1.6, "...que termina", "en un cable", "#ffd23f")}

      <WordCaptions words={WORDS} look="pop" y={0.47} size={80} />
      {audio ? <Audio src={staticFile("starlink/voice.wav")} /> : null}
      {audio ? <SfxTrack events={SFX} master={0.85} /> : null}
    </AbsoluteFill>
  );
};
