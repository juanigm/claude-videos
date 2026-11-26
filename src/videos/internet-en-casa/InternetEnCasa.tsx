// "Cómo tener internet en tu casa, problema por problema" — 9:16, todas las redes.
// Maqueta en corte: tu casa (living + tu cuarto), el poste, el proveedor a lo lejos, la casa del vecino y la ciudad.
// Cada pieza aparece por un problema; cada problema y cada pieza entran en su palabra de la voz.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/internet-en-casa/voice/words.json";
import {
  CamRig, Counter, Lights, Padlock3D, Person3D, Sfx, SfxTrack, Shot, Sticker, Title, Toon, V3,
  clamp, drop, ease, lerp, makeCue, pop, ramp, rnd, shotAt, useFonts,
} from "../_cartoon3d/kit";
import { DataCenter3D } from "../que-es-la-nube/QueEsLaNube3D";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const C = {
  problema: cue("problema"), compu: cue("compu"), para: cue("para"), cable: cue("cable"), millones: cue("pero") + 0.0,
  entonces1: cue("entonces"), proveedor: cue("proveedor"), tira: cue("tira"), mundo: cue("mundo"),
  pero2: cue("pero", 2), debilita: cue("debilita"), asi1: cue("así"), fibra: cue("fibra"), viaja: cue("viaja"),
  pero3: cue("pero", 3), entiende: cue("entiende"), entonces2: cue("entonces", 2), tecnico: cue("técnico"), cajita: cue("cajita"), traduce: cue("traduce"),
  pero4: cue("pero", 4), celulares: cue("celulares"), tele: cue("tele"), consola: cue("consola"), solo: cue("solo"),
  asi2: cue("así", 2), router: cue("router"), reparte: cue("reparte"),
  pero5: cue("pero", 5), cables: cue("cables"), entonces3: cue("entonces", 3), aire: cue("aire"), wifi: cue("wifi"),
  pero6: cue("pero", 6), cuarto: cue("cuarto"), llega: cue("llega"), asi3: cue("así", 3), repetidores: cue("repetidores"), rincon: cue("rincón"),
  vecino: cue("vecino"), gratis: cue("gratis"), pones: cue("pones"), contrasena: cue("contraseña"),
  listo: cue("listo") - 0.2, que: cue("parte") - 0.25, // "qué" coincide con el primer "que" del guion: se ancla en "parte"
};
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.5) * FPS);

// zona segura (CANAL.md): títulos arriba, captions al medio, escena abajo
const LAY = { titleY: 420, hudTop: 300, capY: 0.47, stickerY: 1430, fov: 44 };

// ---------------------------------------------------------------- geometría útil
/** un tramo de cable (cilindro) entre dos puntos */
const Seg: React.FC<{ a: V3; b: V3; r?: number; color: string; glow?: string; u?: number; outline?: number }> = ({ a, b, r = 0.06, color, glow, u = 1, outline = 0.015 }) => {
  const { mid, len, quat } = useMemo(() => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { mid: A, len, quat: new THREE.Euler().setFromQuaternion(q) };
  }, [a, b]);
  if (u <= 0) return null;
  const L = len * clamp(u);
  const dir = new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize();
  const c: V3 = [mid.x + dir.x * L / 2, mid.y + dir.y * L / 2, mid.z + dir.z * L / 2];
  return <Toon kind="cyl" args={[r, r, Math.max(0.001, L)]} position={c} rotation={[quat.x, quat.y, quat.z]} color={color} glow={glow} glowI={glow ? 1.2 : 0} outline={outline} />;
};

/** posición a lo largo de una polilínea, u en [0,1] */
const along = (pts: V3[], u: number): V3 => {
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1], p[2] - pts[i][2]));
  let d = clamp(u) * lens.reduce((s, x) => s + x, 0);
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] ? d / lens[i] : 0;
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k), lerp(pts[i][2], pts[i + 1][2], k)];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
};

// ---------------------------------------------------------------- lugares
const ISP: V3 = [-11, 0, -7];
const POLE: V3 = [-6.6, 0, 1.2];
const ONT: V3 = [-4.35, 1.3, -1.0];
const PATH: V3[] = [[ISP[0] + 1.2, 2.6, ISP[2] + 1.2], [POLE[0], 4.1, POLE[2]], [-4.7, 1.6, -1.0], ONT];
const PC: V3 = [-3.0, 1.15, -1.7];
const ROUTER: V3 = [-1.7, 1.12, -2.1];
const TV: V3 = [-0.4, 1.75, -2.38];
const CONSOLE: V3 = [-0.4, 0.62, -2.15];
const PHONE: V3 = [0.2, 0.95, -0.7];
const REPEATER: V3 = [0.75, 1.0, 0.6];
const ME: V3 = [2.6, 0, 0.1];
const NEIGH: V3 = [6.0, 0, -1.5];
const PC2: V3 = [NEIGH[0] - 0.4, 1.15, NEIGH[2] + 1.0];

// ---------------------------------------------------------------- piezas
const Monitor: React.FC<{ position: V3; on: number; rot?: number }> = ({ position, on, rot = 0.3 }) => (
  <group position={position} rotation={[0, rot, 0]}>
    <Toon kind="box" args={[0.9, 0.6, 0.08]} position={[0, 0.35, 0]} color="#1f2937" />
    <Toon kind="box" args={[0.78, 0.48, 0.02]} position={[0, 0.35, 0.05]} color={on > 0.5 ? "#38bdf8" : "#334155"} glow={on > 0.5 ? "#38bdf8" : undefined} glowI={0.7} outline={0} />
    <Toon kind="box" args={[0.1, 0.18, 0.08]} position={[0, -0.05, 0]} color="#475569" />
    <Toon kind="box" args={[0.4, 0.04, 0.25]} position={[0, -0.13, 0]} color="#475569" />
  </group>
);

const Desk: React.FC<{ position: V3; w?: number }> = ({ position, w = 1.6 }) => (
  <group position={position}>
    <Toon kind="box" args={[w, 0.1, 0.8]} position={[0, 0.9, 0]} color="#b45309" />
    {[-1, 1].map((s) => <Toon key={s} kind="box" args={[0.08, 0.9, 0.7]} position={[s * (w / 2 - 0.08), 0.45, 0]} color="#92400e" />)}
  </group>
);

const House: React.FC<{ t: number; s?: number }> = ({ s = 1 }) => (
  <group scale={s}>
    {/* piso de tu casa, en corte */}
    <Toon kind="box" args={[8.2, 0.25, 5.6]} position={[-0.5, 0.0, -0.3]} color="#f5e6c8" />
    {/* pared del fondo y pared izquierda */}
    <Toon kind="box" args={[8.2, 3.2, 0.2]} position={[-0.5, 1.6, -3.0]} color="#fde68a" />
    <Toon kind="box" args={[0.2, 3.2, 5.6]} position={[-4.6, 1.6, -0.3]} color="#fcd34d" />
    {/* pared que separa tu cuarto, con puerta */}
    <Toon kind="box" args={[0.18, 3.2, 2.6]} position={[1.3, 1.6, -1.7]} color="#fcd34d" />
    <Toon kind="box" args={[0.18, 1.0, 1.4]} position={[1.3, 2.7, 0.3]} color="#fcd34d" />
    <Toon kind="box" args={[0.18, 3.2, 0.9]} position={[1.3, 1.6, 2.0]} color="#fcd34d" />
    {/* alfombra y cama */}
    <Toon kind="box" args={[2.2, 0.04, 1.6]} position={[-1.6, 0.14, 0.3]} color="#93c5fd" outline={0.01} />
    <Toon kind="box" args={[1.6, 0.45, 2.2]} position={[2.6, 0.35, -1.6]} color="#f472b6" />
    <Toon kind="box" args={[1.6, 0.3, 0.5]} position={[2.6, 0.7, -2.5]} color="#ffffff" />
    {/* mesa de la tele */}
    <Toon kind="box" args={[1.8, 0.5, 0.6]} position={[-0.4, 0.38, -2.5]} color="#78350f" />
  </group>
);

const SmallHouse: React.FC<{ position: V3; s?: number; color?: string; roof?: string }> = ({ position, s = 1, color = "#fde68a", roof = "#dc2626" }) => (
  <group position={position} scale={s}>
    <Toon kind="box" args={[1.6, 1.2, 1.4]} position={[0, 0.6, 0]} color={color} />
    <Toon kind="cone" args={[1.35, 0.8]} position={[0, 1.6, 0]} rotation={[0, Math.PI / 4, 0]} color={roof} />
  </group>
);

const Phone: React.FC<{ position: V3; on: number; rot?: V3; s?: number }> = ({ position, on, rot = [0, 0.4, 0], s = 1 }) => (
  <group position={position} rotation={rot} scale={s}>
    <Toon kind="box" args={[0.24, 0.44, 0.04]} color="#111827" />
    <Toon kind="box" args={[0.2, 0.36, 0.01]} position={[0, 0, 0.025]} color={on > 0.5 ? "#4ade80" : "#475569"} glow={on > 0.5 ? "#4ade80" : undefined} glowI={0.6} outline={0} />
  </group>
);

/** anillos de WiFi que se expanden desde un punto */
const Waves: React.FC<{ t: number; at: V3; on: number; max?: number; color?: string }> = ({ t, at, on, max = 3, color = "#38bdf8" }) => {
  if (on <= 0) return null;
  return (
    <group position={at}>
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.9 + i / 3) % 1);
        return <Toon key={i} kind="torus" args={[0.3 + u * max, 0.035]} rotation={[Math.PI / 2, 0, 0]} color={color} basic outline={0} opacity={on * (1 - u)} />;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- escena
// en 9:16 el ancho visible es angosto: las tomas generales van lejos (r ~20+) para que la casa entre entera
const SHOTS: Shot[] = [
  { at: 0, target: [-0.5, 0.6, -0.5], r: 21, h: 12, ang: 0.25 },
  { at: C.compu - 0.2, target: [-2.6, 0.9, -1.3], r: 10.5, h: 6.5, ang: 0.35 },
  { at: C.para, target: [1.0, 0.8, -1.0], r: 23, h: 12, ang: 0.15 },
  { at: C.millones, target: [0, 0.8, -6], r: 30, h: 14, ang: 0.12 },
  { at: C.entonces1, target: [-6.0, 1.2, -3.0], r: 24, h: 12, ang: -0.1 },
  { at: C.pero2, target: [-6.5, 1.5, -2.5], r: 20, h: 10, ang: -0.05 },
  { at: C.pero3, target: [-3.4, 1.1, -1.4], r: 11, h: 6.5, ang: 0.2 },
  { at: C.pero4, target: [-1.6, 1.0, -1.5], r: 14, h: 8, ang: 0.3 },
  { at: C.pero5, target: [-1.4, 0.9, -1.0], r: 15, h: 8.5, ang: 0.3 },
  { at: C.pero6, target: [2.4, 0.8, -0.8], r: 12, h: 7.5, ang: 0.45 },
  { at: C.vecino - 0.3, target: [3.8, 1.0, -1.0], r: 19, h: 9, ang: 0.3 },
  { at: C.listo, target: [-0.3, 0.8, -1.0], r: 24, h: 13, ang: 0.25 },
];

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const sh = shotAt(SHOTS, t);
  const ang = sh.ang + 0.02 * Math.sin(t * 0.3) + (t > C.listo ? (t - C.listo) * 0.05 : 0);
  // estados
  const house = pop(t, 0, 0.6);
  const pc = pop(t, C.compu - 0.1, 0.4);
  const neighborCable = ease(ramp(t, C.cable - 0.2, 0.6)) * (1 - ease(ramp(t, C.millones + 1.0, 0.5)));
  const city = ramp(t, C.millones, 1.5);
  const isp = pop(t, C.proveedor - 0.2, 0.5);
  const mainCable = ease(ramp(t, C.tira, 1.4));
  const fiber = ease(ramp(t, C.fibra, 0.5));
  const ont = pop(t, C.cajita - 0.1, 0.45);
  const tech = pop(t, C.tecnico - 0.1, 0.4) * (1 - ease(ramp(t, C.pero4, 0.4)));
  const pcOn = ramp(t, C.traduce + 0.4, 0.2);
  const devs = [pop(t, C.celulares, 0.35), pop(t, C.tele, 0.35), pop(t, C.consola, 0.35)];
  const router = drop(t, C.router - 0.25);
  const devOn = ramp(t, C.reparte + 0.3, 0.2);
  const wired = clamp(ramp(t, C.reparte, 0.6) - ramp(t, C.entonces3 + 0.2, 0.3));
  const wifi = ramp(t, C.aire - 0.2, 0.4);
  const tangle = clamp(ramp(t, C.cables, 0.3) - ramp(t, C.entonces3, 0.3));
  const me = pop(t, C.cuarto - 0.3, 0.4);
  const rep = pop(t, C.repetidores - 0.1, 0.45);
  const meOn = ramp(t, C.rincon - 0.3, 0.2);
  const neigh = pop(t, C.vecino - 0.1, 0.45);
  const lock = pop(t, C.contrasena - 0.15, 0.45);

  // la señal por cobre que se apaga a mitad de camino / pulsos de luz por la fibra
  const copperU = ramp(t, C.debilita - 1.2, 2.2);
  const routerDevs: V3[] = [PHONE, [TV[0], TV[1] - 0.2, TV[2] + 0.1], [CONSOLE[0], CONSOLE[1], CONSOLE[2] + 0.1], [PC[0] + 0.2, PC[1], PC[2]]];
  return (
    <>
      <CamRig pos={[sh.target[0] + Math.sin(ang) * sh.r, sh.h, sh.target[2] + Math.cos(ang) * sh.r]} target={[sh.target[0], sh.target[1] + 2.2, sh.target[2]]} t={t} />
      <Lights />
      {/* el terreno */}
      <Toon kind="box" args={[34, 0.5, 26]} position={[-2, -0.4, -5]} color="#86efac" outline={0.03} />
      <Toon kind="box" args={[34, 0.06, 2.2]} position={[-2, -0.13, 3.6]} color="#64748b" outline={0.01} />

      <group scale={house}><House t={t} /></group>

      {/* 0. la compu */}
      <group scale={pc}><Desk position={[PC[0], 0.12, PC[2]]} /><Monitor position={[PC[0], PC[1], PC[2] - 0.05]} on={pcOn} /></group>

      {/* 1. la compu del vecino y el cable entre las dos casas; después millones de casas */}
      <group scale={pop(t, C.para - 0.2, 0.45)}>
        <SmallHouse position={NEIGH} s={1.4} color="#bfdbfe" roof="#2563eb" />
        <Monitor position={PC2} on={neighborCable > 0.5 ? 1 : 0} rot={0} />
      </group>
      <Seg a={[PC[0] + 0.4, 1.0, PC[2] + 0.3]} b={[PC2[0], 1.0, PC2[2]]} color="#f97316" u={neighborCable} r={0.05} />
      {city > 0 ? Array.from({ length: 36 }, (_, i) => {
        const x = -16 + (i % 12) * 2.8 + rnd(i) * 0.8, z = -13 - Math.floor(i / 12) * 2.6 - rnd(i + 3);
        return <SmallHouse key={i} position={[x, 0, z]} s={0.75 * pop(t, C.millones + i * 0.035, 0.3)} color={["#fde68a", "#fecaca", "#bbf7d0", "#ddd6fe"][i % 4]} roof={["#dc2626", "#2563eb", "#16a34a"][i % 3]} />;
      }) : null}

      {/* 2. el proveedor, el poste y el cable hasta tu casa */}
      {isp > 0.01 ? <group position={ISP} scale={0.55 * isp} rotation={[0, 0.4, 0]}><DataCenter3D t={t} /></group> : null}
      {isp > 0.01 ? Array.from({ length: 8 }, (_, i) => {
        const x = -16 + i * 3.6 + rnd(i) * 0.8;
        return <Seg key={i} a={[ISP[0], 0.3, ISP[2]]} b={[x, 0.3, -13 - (i % 3) * 2.6]} color="#94a3b8" u={ramp(t, C.mundo - 0.4 + i * 0.05, 0.6)} r={0.04} />;
      }) : null}
      <group position={POLE} scale={pop(t, C.tira - 0.2, 0.4)}>
        <Toon kind="cyl" args={[0.14, 0.18, 4.2]} position={[0, 2.1, 0]} color="#78716c" />
        <Toon kind="box" args={[1.0, 0.12, 0.12]} position={[0, 4.0, 0]} color="#57534e" />
      </group>
      {PATH.slice(1).map((p, i) => (
        <Seg key={i} a={PATH[i]} b={p} r={fiber > 0.5 ? 0.07 : 0.06} color={fiber > 0.5 ? "#a5f3fc" : "#b45309"} glow={fiber > 0.5 ? "#67e8f9" : undefined} u={clamp(mainCable * 3 - i)} />
      ))}
      {/* señal por cobre: se achica y desaparece a mitad de camino */}
      {t > C.debilita - 1.3 && t < C.asi1 ? (
        <Toon kind="sphere" args={[0.32 * clamp(1 - copperU * 1.6)]} position={along(PATH, copperU * 0.85)} color="#facc15" glow="#facc15" glowI={0.8} opacity={clamp(1 - copperU * 1.4)} outline={0} />
      ) : null}
      {/* pulsos de luz por la fibra */}
      {fiber > 0.5 ? Array.from({ length: 6 }, (_, i) => {
        const u = ((t - C.fibra) * 0.45 + i / 6) % 1;
        return <Toon key={i} kind="sphere" args={[0.16]} position={along(PATH, u)} color="#ffffff" basic outline={0} />;
      }) : null}

      {/* 3. la cajita (ONT) y el técnico */}
      <group position={ONT} scale={ont} rotation={[0, Math.PI / 2, 0]}>
        <Toon kind="box" args={[0.7, 0.45, 0.2]} color="#f8fafc" />
        {[-0.18, 0, 0.18].map((x, i) => <Toon key={x} kind="sphere" args={[0.045]} position={[x, 0.08, 0.11]} color={pcOn > 0.5 && Math.sin(t * 6 + i) > -0.3 ? "#4ade80" : "#cbd5e1"} basic outline={0} />)}
      </group>
      {ont > 0.5 ? <Seg a={[ONT[0] + 0.15, ONT[1] - 0.2, ONT[2]]} b={[PC[0] - 0.3, 1.0, PC[2]]} color="#22c55e" r={0.04} u={ramp(t, C.traduce, 0.5)} /> : null}
      <Person3D t={t * 0.3} position={[-3.6, 0.12, 0.4]} s={1.3 * tech} color="#f97316" face={-0.8} />

      {/* 4. los aparatos y el router */}
      <Phone position={PHONE} on={devOn} s={1.4 * devs[0]} />
      <group position={TV} scale={devs[1]}>
        <Toon kind="box" args={[1.6, 0.9, 0.08]} color="#111827" />
        <Toon kind="box" args={[1.45, 0.77, 0.02]} position={[0, 0, 0.05]} color={devOn > 0.5 ? "#f43f5e" : "#334155"} glow={devOn > 0.5 ? "#f43f5e" : undefined} glowI={0.5} outline={0} />
      </group>
      <group position={CONSOLE} scale={devs[2]}>
        <Toon kind="box" args={[0.6, 0.14, 0.4]} color="#e5e7eb" />
        <Toon kind="box" args={[0.08, 0.03, 0.02]} position={[0.18, 0.02, 0.21]} color={devOn > 0.5 ? "#22d3ee" : "#64748b"} basic outline={0} />
      </group>
      {/* todos tironeando del único cable */}
      {t > C.solo - 0.3 && t < C.router ? routerDevs.slice(0, 3).map((d, i) => (
        <Seg key={i} a={[ONT[0] + 0.2, ONT[1] - 0.2, ONT[2]]} b={[d[0] + 0.15 * Math.sin(t * 18 + i), d[1], d[2]]} color="#ef4444" r={0.03} u={ramp(t, C.solo - 0.2, 0.4)} />
      )) : null}
      {t > C.router - 0.3 ? (
        <group position={[ROUTER[0], ROUTER[1] + (1 - router) * 5, ROUTER[2]]}>
          <Toon kind="box" args={[0.8, 0.18, 0.5]} color="#0f172a" />
          {[-0.25, -0.08, 0.08, 0.25].map((x, i) => <Toon key={x} kind="sphere" args={[0.035]} position={[x, 0.02, 0.26]} color={devOn > 0.5 && Math.sin(t * 7 + i * 2) > 0 ? "#4ade80" : "#334155"} basic outline={0} />)}
          {/* antenas cuando llega el WiFi */}
          {[-0.3, 0.3].map((x) => <Toon key={x} kind="cyl" args={[0.03, 0.03, 0.6]} position={[x, 0.38, -0.15]} rotation={[0, 0, x * 0.6]} scale={[1, wifi, 1]} color="#0f172a" />)}
          <group position={[0, 0.35, 0.3]} rotation={[0, Math.PI / 2, 0]}><Padlock3D s={0.45 * lock} /></group>
        </group>
      ) : null}
      {wired > 0 ? routerDevs.map((d, i) => <Seg key={i} a={ROUTER} b={d} color="#94a3b8" r={0.03} u={wired} />) : null}
      {/* cables por todos lados (el problema) */}
      {tangle > 0 ? Array.from({ length: 8 }, (_, i) => (
        <Seg key={i} a={[-4 + rnd(i) * 5, 0.16, -2 + rnd(i + 1) * 3]} b={[-4 + rnd(i + 2) * 5, 0.16, -2 + rnd(i + 3) * 3]} color={["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][i % 4]} r={0.035} u={tangle} />
      )) : null}
      {tangle > 0 ? <Person3D t={t} position={[-1.2, 0.12, 0.6]} s={1.2 * tangle} face={0.3} color="#a78bfa" /> : null}
      <Waves t={t} at={[ROUTER[0], ROUTER[1] + 0.3, ROUTER[2]]} on={wifi} max={2.6} />

      {/* 6. tu cuarto, sin señal; el repetidor */}
      <Person3D t={t * 0.4} position={ME} s={1.3 * me} face={-0.3} color="#facc15" />
      <Phone position={[ME[0] + 0.1, 1.55 + 0.1 * Math.sin(t * 5) * (1 - meOn), ME[2] + 0.35]} on={meOn} s={1.4 * me} rot={[0, -0.3, 0.2 * Math.sin(t * 4) * (1 - meOn)]} />
      <group position={REPEATER} scale={rep}>
        <Toon kind="box" args={[0.3, 0.4, 0.15]} color="#f8fafc" />
        <Toon kind="sphere" args={[0.04]} position={[0, 0.1, 0.08]} color="#4ade80" basic outline={0} />
      </group>
      <Waves t={t + 0.3} at={REPEATER} on={ramp(t, C.repetidores, 0.4)} max={2.2} color="#22d3ee" />

      {/* 7. el vecino, asomado con su celular */}
      <group scale={neigh}>
        <Person3D t={t * 0.2} position={[NEIGH[0] - 1.6, 0, NEIGH[2] + 1.2]} s={1.2} face={-1.2} color="#fb923c" />
        <Phone position={[NEIGH[0] - 1.85, 1.35, NEIGH[2] + 1.5]} on={lock > 0.5 ? 0 : 1} s={1.2} rot={[0, -1.0, 0]} />
      </group>
    </>
  );
};

// ---------------------------------------------------------------- 2D + sonido
const PIECES = [C.entonces1, C.asi1, C.entonces2, C.asi2, C.entonces3, C.asi3, C.pones];

const SFX: Sfx[] = [
  { at: 0, s: "whoosh_up", v: 0.7 }, { at: 0.05, s: "pop" }, { at: C.problema, s: "pop", v: 0.7 },
  { at: C.compu - 0.1, s: "pop" }, { at: C.cable - 0.2, s: "whoosh", v: 0.7 },
  { at: C.millones, s: "pop" }, ...[0, 1, 2, 3, 4].map((i): Sfx => ({ at: C.millones + 0.2 + i * 0.25, s: "pop", v: 0.4 })),
  ...PIECES.map((a): Sfx => ({ at: a, s: "ding", v: 0.8 })),
  { at: C.proveedor - 0.2, s: "thud", v: 0.7 }, { at: C.tira, s: "whoosh_up", v: 0.7 },
  { at: C.pero2, s: "pop" }, { at: C.debilita, s: "whoosh_down", v: 0.6 },
  { at: C.fibra, s: "shield", v: 0.7 },
  { at: C.pero3, s: "pop" }, { at: C.entiende, s: "slap" },
  { at: C.tecnico - 0.1, s: "pop", v: 0.7 }, { at: C.cajita - 0.1, s: "thud", v: 0.6 }, { at: C.traduce + 0.4, s: "bleep" },
  { at: C.pero4, s: "pop" }, { at: C.celulares, s: "pop", v: 0.6 }, { at: C.tele, s: "pop", v: 0.6 }, { at: C.consola, s: "pop", v: 0.6 }, { at: C.solo, s: "slap" },
  { at: C.router - 0.45, s: "whoosh_down" }, { at: C.router + 0.08, s: "thud" }, { at: C.reparte + 0.3, s: "bleep", v: 0.8 },
  { at: C.pero5, s: "pop" }, { at: C.cables, s: "slap" }, { at: C.cables + 0.4, s: "thud", v: 0.5 },
  { at: C.aire - 0.2, s: "whoosh_up" }, { at: C.wifi, s: "bleep", v: 0.8 },
  { at: C.pero6, s: "pop" }, { at: C.llega, s: "slap" },
  { at: C.repetidores - 0.1, s: "pop" }, { at: C.rincon - 0.3, s: "bleep", v: 0.8 },
  { at: C.vecino - 0.1, s: "pop" }, { at: C.gratis, s: "slap" },
  { at: C.contrasena - 0.15, s: "click" }, { at: C.contrasena + 0.3, s: "slap", v: 0.7 },
  { at: C.listo, s: "whoosh_up", v: 0.8 }, { at: C.listo + 0.05, s: "ding" }, { at: C.que, s: "pop" },
];

const P = (t: number, a: number, b: number, l2: string) => <Title t={t} a={a} b={b} l1="Problema:" l2={l2} c2="#ff4d5e" y={LAY.titleY} size={84} />;
const S = (t: number, a: number, b: number, n: number, l2: string) => <Title t={t} a={a} b={b} l1={`Pieza ${n}:`} l2={l2} c2="#3dff8a" y={LAY.titleY} size={88} />;

export const InternetEnCasa: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const n = PIECES.filter((a) => t >= a).length;
  const last = [...PIECES].reverse().find((a) => t >= a) ?? 999;
  const SY = LAY.stickerY;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #7cc4ff 0%, #e3f3ff 100%)" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: LAY.fov, position: [8, 6, 10] }}>
        <Scene t={t} />
      </ThreeCanvas>
      <Counter label="PIEZAS" n={n} t={t} lastAt={last} o={ramp(t, C.problema, 0.3)} color={n ? "#3dff8a" : "#aab4c8"} top={LAY.hudTop} />

      <Title t={t} a={0.05} b={C.problema - 0.1} l1="Internet en tu casa" l2="desde cero" y={LAY.titleY} />
      <Title t={t} a={C.problema} b={C.compu - 0.2} l1="Problema" l2="por problema" y={LAY.titleY} />
      <Title t={t} a={C.compu - 0.2} b={C.millones - 0.1} l1="Tienes" l2="una compu" y={LAY.titleY} />
      {P(t, C.millones, C.entonces1 - 0.1, "millones de compus")}
      {S(t, C.entonces1, C.pero2 - 0.1, 1, "el proveedor")}
      {P(t, C.pero2, C.asi1 - 0.1, "la señal se pierde")}
      {S(t, C.asi1, C.pero3 - 0.1, 2, "la fibra óptica")}
      <Sticker t={t} a={C.viaja} b={C.pero3 - 0.1} x={500} y={SY} text="luz por un hilo de vidrio" rot={-3} size={40} />
      {P(t, C.pero3, C.entonces2 - 0.1, "la compu no entiende luz")}
      <Sticker t={t} a={C.entiende} b={C.entonces2 - 0.1} x={500} y={SY} text="¿¿ LUZ ??" bg="#ff4d5e" color="#fff" rot={4} size={58} />
      {S(t, C.entonces2, C.pero4 - 0.1, 3, "la cajita")}
      <Sticker t={t} a={C.cajita} b={C.pero4 - 0.1} x={500} y={SY} text="ONT / MÓDEM" mono rot={-3} size={48} />
      {P(t, C.pero4, C.asi2 - 0.1, "un cable, muchos aparatos")}
      {S(t, C.asi2, C.pero5 - 0.1, 4, "el router")}
      <Sticker t={t} a={C.reparte} b={C.pero5 - 0.1} x={500} y={SY} text="reparte la conexión" rot={3} size={42} />
      {P(t, C.pero5, C.entonces3 - 0.1, "cables por todos lados")}
      {S(t, C.entonces3, C.pero6 - 0.1, 5, "el WiFi")}
      <Sticker t={t} a={C.wifi} b={C.pero6 - 0.1} x={500} y={SY} text="internet por el aire" rot={-3} size={42} />
      {P(t, C.pero6, C.asi3 - 0.1, "en tu cuarto no llega")}
      <Sticker t={t} a={C.llega} b={C.asi3 - 0.1} x={500} y={SY} text="SIN SEÑAL" bg="#ff4d5e" color="#fff" rot={-4} size={52} />
      {S(t, C.asi3, C.vecino - 0.4, 6, "los repetidores")}
      {P(t, C.vecino - 0.3, C.pones - 0.1, "el vecino gorrón")}
      <Sticker t={t} a={C.gratis} b={C.pones - 0.1} x={500} y={SY} text="¿WIFI GRATIS?" rot={4} size={50} />
      {S(t, C.pones, C.listo - 0.1, 7, "la contraseña")}
      <Sticker t={t} a={C.contrasena + 0.3} b={C.listo - 0.1} x={500} y={SY} text="ACCESO DENEGADO" bg="#0d0f17" color="#ff4d5e" mono rot={-3} size={44} />
      <Title t={t} a={C.listo} b={C.que - 0.1} l1="¡Y listo!" l2="ya tienes internet" c2="#3dff8a" y={LAY.titleY} />
      <Title t={t} a={C.que} b={END + 1.5} l1="¿Qué parte" l2="no conocías?" y={LAY.titleY} />

      <WordCaptions words={WORDS} look="pop" y={LAY.capY} size={80} />
      {audio ? <Audio src={staticFile("internet-en-casa/voice.wav")} /> : null}
      {audio ? <SfxTrack events={SFX} master={0.85} /> : null}
    </AbsoluteFill>
  );
};
