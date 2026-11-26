// "Montamos una tienda online en la nube... y te hackean, bro". 3D cartoon, 1080 x 1350, ~69 s.
// Cada pieza se agrega mal, te hackean, y se arregla. Todo atado a las palabras de la voz (words.json).
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/te-hackean-tienda/voice/words.json";
import {
  Bucket3D, CamRig, Card3D, CloudIsland, Coin3D, Counter, Database3D, Fire, Glitch, Hacker3D, Hud, Key3D, Lights,
  Padlock3D, Rack3D, Safe3D, Sfx, SfxTrack, Shot, Sticker, Title, Toon, V3,
  clamp, drop, ease, lerp, makeCue, pop, ramp, rnd, shotAt, skyBg, useFonts,
} from "../_cartoon3d/kit";
import { TiendaFinal } from "./TiendaFinal";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// "Y te hackean, bro": empieza en la "Y" (dos palabras antes de "hackean")
const HACK = WORDS.map((w, i) => (n(w.w) === "hackean" ? WORDS[i - 2].s : -1)).filter((x) => x >= 0);

const C = {
  tienda: cue("tienda"), spoiler: cue("spoiler"), primero: cue("primero"), servidor: cue("servidor"), puerto: cue("puerto"),
  internet: cue("internet"), contrasena: cue("contraseña"), admin: cue("admin123"),
  entonces1: cue("entonces"), cierras: cue("cierras"), llaves: cue("llaves"),
  luego: cue("luego"), base: cue("base"), ip: cue("ip"), asi1: cue("así"), quitas: cue("quitas"), privada: cue("privada"), servidor2: cue("servidor", 2),
  despues: cue("después"), guardas: cue("guardas"), publico: cue("público"), total: cue("total"), bots: cue("bots"),
  entonces2: cue("entonces", 2), privado: cue("privado"), links: cue("links"),
  por: cue("por", 2), subes: cue("subes"), github: cue("github"), claves: cue("claves"), minando: cue("minando"), cripto: cue("cripto"),
  encima: cue("encima"), pagas: cue("pagas"), asi2: cue("así", 2), sacas: cue("sacas"), roles: cue("roles"), secretos: cue("secretos"),
  la: cue("seguridad") - 0.2, cada: cue("cada"), cual: cue("cuál"),
};
// fin de cada hackeo = cuando arranca el arreglo
const HACK_END = [C.entonces1, C.asi1, C.entonces2, C.asi2];
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.6) * FPS);

// dónde está cada cosa sobre la nube
const P = { rack: [0, 0, 0] as V3, db: [-2.7, 0, 0] as V3, bucket: [2.6, 0, -0.5] as V3, safe: [1.5, 0, 2.0] as V3, code: [-1.0, 3.7, -2.6] as V3 };

const hackOn = (t: number) => HACK.map((a, i) => clamp(ramp(t, a, 0.2) - ramp(t, HACK_END[i], 0.4)));
const hacked = (t: number) => Math.max(...hackOn(t));

const security = (t: number) => {
  const steps: [number, number][] = [[0, 100], [C.puerto, 50], [C.admin, 15], [HACK[0], 0], [C.cierras, 80],
    [C.ip, 35], [HACK[1], 0], [C.quitas, 85], [C.publico, 35], [HACK[2], 0], [C.privado, 90], [C.claves, 30], [HACK[3], 0], [C.sacas, 100]];
  let v = 100;
  for (const [a, x] of steps) v = lerp(v, x, ease(ramp(t, a, 0.6)));
  return v;
};

const SHOTS: Shot[] = [
  { at: 0, target: [0, 1, 0], r: 17, h: 7.5, ang: 0.5 },
  { at: 0.2, target: [0, 1, 0], r: 13.5, h: 7, ang: 0.45 },
  { at: C.servidor - 0.3, target: [0, 1.1, 0], r: 10, h: 5.5, ang: 0.55 },
  { at: C.puerto, target: [0.4, 1.2, 0], r: 8, h: 4.8, ang: 0.95 },
  { at: HACK[0] - 0.1, target: [0, 1.6, -0.6], r: 11.5, h: 6.5, ang: 0.6 },
  { at: C.cierras, target: [0.5, 1.2, 0], r: 8.5, h: 4.8, ang: 0.95 },
  { at: C.luego, target: [-2.6, 1.1, 0], r: 9, h: 5.5, ang: 0.2 },
  { at: HACK[1] - 0.1, target: [-2.4, 1.6, -0.8], r: 11.5, h: 6.5, ang: 0.25 },
  { at: C.quitas, target: [-1.3, 1.0, 0], r: 10, h: 5.5, ang: 0.3 },
  { at: C.despues, target: [2.6, 0.9, -0.5], r: 8.5, h: 5, ang: 0.85 },
  { at: C.bots - 0.3, target: [2.4, 1.2, -0.8], r: 11.5, h: 6.5, ang: 0.7 },
  { at: C.entonces2, target: [2.6, 0.9, -0.5], r: 8.5, h: 5, ang: 0.85 },
  { at: C.por, target: [-1.0, 3.5, -2.6], r: 9.5, h: 6.5, ang: 0.45 },
  { at: HACK[3] - 0.1, target: [0, 1.8, -1], r: 15, h: 8, ang: 0.5 },
  { at: C.sacas, target: [0.4, 1.6, 0.6], r: 12, h: 6.5, ang: 0.55 },
  { at: C.la, target: [0, 1.2, 0], r: 16.5, h: 8.5, ang: 0.45 },
];

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const hk = hackOn(t);
  const red = hacked(t);
  const sh = shotAt(SHOTS, t);
  const ang = sh.ang + 0.02 * Math.sin(t * 0.4) + (t > C.la ? (t - C.la) * 0.06 : 0);
  const shake = Math.max(...HACK.map((a, i) => (ramp(t, a, 0.05) - ramp(t, a + (i === 3 ? 1.4 : 0.8), 0.4)) * (i === 3 ? 1.6 : 1)));

  // servidor + puerto 22
  const door = ease(ramp(t, C.puerto, 0.5)) * (1 - ease(ramp(t, C.cierras, 0.4)));
  const lock1 = pop(t, C.cierras + 0.3, 0.45);
  const key1 = ease(ramp(t, C.llaves - 0.2, 0.8));
  // base de datos
  const dbIn = drop(t, C.base - 0.2);
  const antenna = pop(t, C.ip - 0.1, 0.4) * (1 - ease(ramp(t, C.quitas, 0.4)));
  const dome = pop(t, C.privada - 0.1, 0.5);
  const pipe = ease(ramp(t, C.servidor2 - 0.1, 0.6));
  // bucket
  const bIn = drop(t, C.guardas - 0.2);
  const lid = ease(ramp(t, C.privado - 0.1, 0.5));
  // código
  const codeIn = pop(t, C.subes - 0.1, 0.5);
  const codeKey = pop(t, C.claves - 0.1, 0.4);
  const keyFly = ease(ramp(t, C.sacas, 1.0));
  const safe = pop(t, C.sacas - 0.1, 0.45);
  const badge = pop(t, C.roles - 0.1, 0.4);
  const crypto = clamp(ramp(t, C.minando - 0.1, 0.3) - ramp(t, C.asi2, 0.4));

  const hackerPos: V3[] = [[-0.6, 0, -2.4], [-3.4, 0, -2.2], [3.2, 0, -2.6], [0, 0, -3.0]];
  return (
    <>
      {/* la cámara mira 0.8 más arriba del objeto: así el objeto queda debajo de los títulos */}
      <CamRig pos={[sh.target[0] + Math.sin(ang) * sh.r * 1.08, sh.h, sh.target[2] + Math.cos(ang) * sh.r * 1.08]} target={[sh.target[0], sh.target[1] + 0.8, sh.target[2]]} shake={shake} t={t} />
      <Lights red={red} />
      <group scale={pop(t, 0, 0.6)}><CloudIsland t={t} s={1.15} /></group>

      {/* el guiño del spoiler: el hacker asoma y se esconde */}
      {t > C.spoiler - 0.2 && t < C.primero + 0.3 ? (
        <Hacker3D t={t} s={1.2} position={[0.4, lerp(-3.5, -1.0, ease(ramp(t, C.spoiler, 0.4)) * (1 - ease(ramp(t, C.primero - 0.4, 0.4)))), -2.6]} />
      ) : null}

      {/* 1. servidor */}
      {t > C.servidor - 0.3 ? (
        <group position={[P.rack[0], (1 - drop(t, C.servidor - 0.25)) * 9, P.rack[2]]}>
          <Rack3D t={t} state={red > 0.5 ? "alert" : "ok"} />
          <Toon kind="box" args={[0.03, 0.62, 0.46]} position={[0.66, 1.15, 0]} color="#ff2d2d" glow="#ff2d2d" glowI={1.5 * door} outline={0} />
          <group position={[0.68, 1.15, 0.25]} rotation={[0, door * 1.7, 0]}>
            <Toon kind="box" args={[0.05, 0.66, 0.5]} position={[0, 0, -0.25]} color="#7c8aa6" outline={0.02} />
          </group>
          <group position={[0.85, 1.15, 0]} rotation={[0, Math.PI / 2, 0]}><Padlock3D s={0.55 * lock1} open={1 - ease(ramp(t, C.llaves + 0.7, 0.3))} /></group>
          {t > C.llaves - 0.3 && t < C.llaves + 1.6 ? (
            <Key3D position={[lerp(4, 1.35, key1), 1.15 + (1 - key1) * 2.5, 0]} rotation={[key1 > 0.95 ? ease(ramp(t, C.llaves + 0.8, 0.3)) * 1.5 : t * 5, 0, Math.PI]} s={0.7 * (1 - ramp(t, C.llaves + 1.3, 0.3))} />
          ) : null}
          {/* el "rol": un gafete amarillo en el frente */}
          <group position={[0, 2.05, 0.62]} scale={badge}>
            <Toon kind="box" args={[0.5, 0.3, 0.06]} color="#ffd23f" />
            <Toon kind="box" args={[0.3, 0.05, 0.02]} position={[0, -0.04, 0.04]} color="#0d0f17" outline={0} />
          </group>
        </group>
      ) : null}

      {/* 2. base de datos */}
      {t > C.base - 0.3 ? (
        <group position={[P.db[0], (1 - dbIn) * 9, P.db[2]]}>
          <Database3D t={t} alert={hk[1] > 0.5} />
          <group scale={antenna}>
            <Toon kind="cyl" args={[0.05, 0.05, 1.3]} position={[0, 2.4, 0]} color="#9aa6bd" />
            <Toon kind="sphere" args={[0.18]} position={[0, 3.1, 0]} color="#ff2d2d" glow="#ff2d2d" glowI={0.6 + 0.6 * Math.abs(Math.sin(t * 6))} />
            {[0.45, 0.75].map((r) => <Toon key={r} kind="torus" args={[r, 0.025]} position={[0, 3.1, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1 + 0.2 * Math.sin(t * 6 + r * 5)} color="#ff6b6b" basic outline={0} />)}
          </group>
          {dome > 0 ? <Toon kind="sphere" args={[1.55]} position={[0, 0.2, 0]} scale={[dome, dome * 1.05, dome]} color="#38bdf8" opacity={0.22} outline={0} /> : null}
          {dome > 0 ? <Toon kind="torus" args={[1.55, 0.07]} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={dome} color="#38bdf8" /> : null}
        </group>
      ) : null}
      {/* datos que se escapan durante el 2.º hackeo */}
      {hk[1] > 0 ? Array.from({ length: 12 }, (_, i) => {
        const u = ((t - HACK[1]) * 0.9 + rnd(i)) % 1;
        return <Toon key={i} kind="box" args={[0.3, 0.2, 0.03]} color="#f8fafc" outline={0.015}
          position={[lerp(P.db[0], hackerPos[1][0], u) + (rnd(i + 2) - 0.5), lerp(1.8, 3.0, u) + Math.sin(u * Math.PI) * 1.2, lerp(P.db[2], hackerPos[1][2], u)]} rotation={[t * 3 + i, t * 2, 0]} scale={hk[1]} />;
      }) : null}
      {/* el caño servidor -> base */}
      {pipe > 0 ? (
        <group position={[lerp(P.rack[0] - 0.65, (P.rack[0] + P.db[0]) / 2, 1), 0.55, 0]}>
          <Toon kind="cyl" args={[0.11, 0.11, 1.4]} rotation={[0, 0, Math.PI / 2]} scale={[1, pipe, 1]} color="#ffd23f" />
          {pipe > 0.9 ? <Toon kind="sphere" args={[0.09]} position={[lerp(0.7, -0.7, (t * 0.8) % 1), 0, 0]} color="#ffffff" basic outline={0} /> : null}
        </group>
      ) : null}

      {/* 3. bucket */}
      {t > C.guardas - 0.3 ? (
        <group position={[P.bucket[0], (1 - bIn) * 9, P.bucket[2]]}>
          <Bucket3D t={t} lid={lid} photos={1 - 0.6 * hk[2]} />
          <group position={[0, 1.15, 0.95]} rotation={[0, 0, 0]}><Padlock3D s={0.45 * pop(t, C.privado + 0.3, 0.4)} /></group>
        </group>
      ) : null}
      {/* fotos que se escapan durante el 3.er hackeo */}
      {hk[2] > 0 ? Array.from({ length: 10 }, (_, i) => {
        const u = ((t - HACK[2]) * 1.0 + rnd(i + 7)) % 1;
        return <Toon key={i} kind="box" args={[0.36, 0.44, 0.04]} color={["#fde68a", "#f9a8d4", "#a5f3fc", "#fecaca"][i % 4]} outline={0.015}
          position={[lerp(P.bucket[0], hackerPos[2][0], u) + (rnd(i) - 0.5), lerp(1.5, 3.0, u) + Math.sin(u * Math.PI), lerp(P.bucket[2], hackerPos[2][2], u)]} rotation={[t * 2 + i, t * 3, 0]} scale={hk[2]} />;
      }) : null}
      {/* bots que adivinan el nombre del bucket */}
      {t > C.bots - 0.2 && t < C.privado + 0.5 ? Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI * (1.0 + (i / 7) * 1.2) + 0.5;
        const rr = lerp(4.5, 1.7, ease(ramp(t, C.bots, 1.2)));
        const s = pop(t, C.bots + i * 0.05, 0.3) * (1 - ramp(t, C.privado, 0.4));
        return (
          <group key={i} position={[P.bucket[0] + Math.cos(a) * rr, 1.5 + 0.3 * Math.sin(t * 3 + i) + rnd(i) * 0.8, P.bucket[2] + Math.sin(a) * rr]} scale={s * 0.6}>
            <Toon kind="sphere" args={[0.32]} color="#e23b4a" />
            <Toon kind="box" args={[0.36, 0.1, 0.05]} position={[0, 0.06, 0.3]} color="#ffef5c" basic outline={0} />
          </group>
        );
      }) : null}

      {/* 4. el código en GitHub: una caja en su propia nubecita, con la llave adentro */}
      {codeIn > 0 ? (
        <group position={P.code} scale={codeIn}>
          <group scale={0.32} position={[0, -0.6, 0]}><CloudIsland t={t + 2} /></group>
          <Toon kind="box" args={[1.5, 1.1, 1.1]} position={[0, 0.2, 0]} color="#24292f" />
          <Toon kind="box" args={[1.2, 0.08, 0.02]} position={[0, 0.45, 0.56]} color="#7ee787" outline={0} />
          <Toon kind="box" args={[0.8, 0.08, 0.02]} position={[-0.2, 0.25, 0.56]} color="#79c0ff" outline={0} />
          <Toon kind="box" args={[1.0, 0.08, 0.02]} position={[-0.1, 0.05, 0.56]} color="#d2a8ff" outline={0} />
          {codeKey > 0 && keyFly < 0.02 ? <Key3D position={[0, 1.15 + 0.1 * Math.sin(t * 4), 0]} rotation={[0, t * 2, 0]} s={0.8 * codeKey} /> : null}
        </group>
      ) : null}
      {/* la llave viaja del código a la caja fuerte */}
      {keyFly > 0.02 && keyFly < 1 ? (
        <Key3D position={[lerp(P.code[0], P.safe[0], keyFly), lerp(P.code[1] + 1.2, 1.1, keyFly) + Math.sin(keyFly * Math.PI) * 1.5, lerp(P.code[2], P.safe[2] + 0.6, keyFly)]} rotation={[0, t * 6, 0]} s={0.8} />
      ) : null}
      {safe > 0 ? <Safe3D position={P.safe} s={safe} glow={ramp(t, C.secretos, 0.2)} /> : null}

      {/* cripto con tu tarjeta */}
      {crypto > 0 ? (
        <group position={[P.code[0] + 2.2, P.code[1] - 0.6, P.code[2] + 0.8]} scale={crypto}>
          <Card3D rotation={[0.1, -0.4, 0.15 * Math.sin(t * 8)]} />
          <Fire t={t} a={C.minando} on={1} position={[0, 0.3, 0]} size={0.6} n={14} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + t * 2;
            return <Coin3D key={i} position={[Math.cos(a) * 1.4, Math.sin(a * 2) * 0.3, Math.sin(a) * 1.4]} rotation={[0, t * 4 + i, 0]} s={0.8} />;
          })}
        </group>
      ) : null}

      {/* el hacker de cada hackeo */}
      {hk.map((h, i) => (h > 0 ? <Hacker3D key={i} t={t} s={i === 3 ? 2.1 : 1.35} position={[hackerPos[i][0], lerp(-4.5, 0, ease(h)), hackerPos[i][2]]} /> : null))}
    </>
  );
};

// la ventana de la tienda terminada entra con "La seguridad..." y tilda un ítem cada medio segundo
const CHECK_AT = [0, 1, 2, 3].map((i) => C.la + 0.55 + i * 0.5);

// efectos de sonido: cada uno en el momento exacto de su animación
const SFX: Sfx[] = [
  { at: 0, s: "whoosh_up", v: 0.7 }, { at: 0.1, s: "pop" },
  { at: C.spoiler, s: "pop" }, { at: C.spoiler + 0.05, s: "whoosh", v: 0.8 },
  { at: C.primero, s: "pop" },
  { at: C.servidor - 0.45, s: "whoosh_down" }, { at: C.servidor + 0.08, s: "thud" },
  { at: C.puerto, s: "door", v: 0.7 }, { at: C.internet, s: "slap" }, { at: C.admin, s: "slap" },
  ...HACK.map((a, i): Sfx => ({ at: a, s: "hack", v: i === 3 ? 1.0 : 0.85 })),
  ...HACK_END.map((a): Sfx => ({ at: a, s: "ding", v: 0.9 })),
  { at: C.cierras, s: "door" }, { at: C.cierras + 0.35, s: "click" },
  { at: C.llaves - 0.2, s: "keys" }, { at: C.llaves + 0.75, s: "click" },
  { at: C.luego, s: "pop" }, { at: C.base - 0.4, s: "whoosh_down" }, { at: C.base + 0.13, s: "thud" },
  { at: C.ip, s: "slap" }, { at: C.ip + 0.15, s: "bleep" },
  { at: C.quitas, s: "whoosh", v: 0.8 }, { at: C.privada, s: "shield" }, { at: C.servidor2, s: "whoosh_up", v: 0.6 },
  { at: C.despues, s: "pop" }, { at: C.guardas - 0.4, s: "whoosh_down" }, { at: C.guardas + 0.13, s: "thud" },
  { at: C.publico, s: "slap" }, { at: C.bots, s: "bots" },
  { at: C.privado + 0.3, s: "thud", v: 0.6 }, { at: C.privado + 0.35, s: "click" }, { at: C.links, s: "slap" },
  { at: C.por, s: "pop" }, { at: C.subes, s: "whoosh_up", v: 0.8 }, { at: C.github, s: "slap" },
  { at: C.claves, s: "keys" }, { at: C.claves + 0.1, s: "slap", v: 0.7 },
  { at: C.minando, s: "fire" }, { at: C.cripto, s: "coins" },
  { at: C.encima, s: "pop" }, { at: C.pagas, s: "cash" },
  { at: C.sacas + 0.1, s: "whoosh" }, { at: C.sacas, s: "pop", v: 0.7 }, { at: C.sacas + 0.95, s: "safe" },
  { at: C.roles, s: "pop" }, { at: C.secretos, s: "ding", v: 0.6 },
  { at: C.la, s: "whoosh_up", v: 0.8 }, { at: C.la + 0.05, s: "pop" }, { at: C.cual, s: "pop" },
  // la tienda terminada: un clic por cada ítem tildado y el sello final
  ...CHECK_AT.map((a): Sfx => ({ at: a, s: "click", v: 0.9 })),
  { at: C.cada, s: "thud", v: 0.7 }, { at: C.cada + 0.05, s: "ding", v: 0.8 },
];

const money = (v: number) => `$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const TeHackeanTienda: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const red = hacked(t);
  const s = security(t);
  const col = s > 70 ? "#3dff8a" : s > 30 ? "#ffd23f" : "#ff4d5e";
  const count = HACK.filter((a) => t >= a).length;
  const lastHack = [...HACK].reverse().find((a) => t >= a) ?? 999;
  const Y = 250; // altura de los títulos (debajo de los HUD)
  const H = (i: number, size = 104) => (
    <Title key={`h${i}`} t={t} a={HACK[i]} b={(i === 3 ? C.encima : HACK_END[i]) - 0.1} l1="Y te hackean," l2="bro" c2="#ff4d5e" y={Y} size={i === 3 ? 124 : size} shake={red > 0.5 && Math.sin(t * 37) > 0.2 ? 1 : 0.4} />
  );
  return (
    <AbsoluteFill style={{ background: skyBg(0.2 * red, red) }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 34, position: [8, 6, 10] }}>
        <Scene t={t} />
      </ThreeCanvas>
      <Glitch t={t} on={red > 0.5} />
      <Hud label="SEGURIDAD" value={red > 0.5 ? "HACKEADO" : `${Math.round(s)} %`} bar={s / 100} color={col} o={ramp(t, C.servidor, 0.3)} pulse={red} />
      <Counter label="HACKEOS" n={count} t={t} lastAt={lastHack} o={ramp(t, C.servidor, 0.3)} color={count ? "#ff4d5e" : "#aab4c8"} />

      <Title t={t} a={0.1} b={C.spoiler - 0.1} l1="Montamos una tienda" l2="en la nube" y={Y} />
      <Title t={t} a={C.spoiler} b={C.primero - 0.1} l1="Spoiler:" l2="nos hackean" c2="#ff4d5e" y={Y} />
      <Title t={t} a={C.primero} b={HACK[0] - 0.1} l1="Paso 1:" l2="el servidor" y={Y} />
      <Sticker t={t} a={C.internet} b={HACK[0] - 0.1} x={540} y={980} text="22 → 0.0.0.0/0" mono bg="#ff4d5e" color="#fff" rot={4} size={50} />
      <Sticker t={t} a={C.admin} b={HACK[0] - 0.1} x={760} y={1080} text="admin123" mono rot={-6} size={56} />
      {H(0)}
      <Title t={t} a={HACK_END[0]} b={C.luego - 0.1} l1="Puerto cerrado" l2="+ llaves SSH" c2="#3dff8a" y={Y} />

      <Title t={t} a={C.luego} b={HACK[1] - 0.1} l1="Paso 2:" l2="la base de datos" y={Y} />
      <Sticker t={t} a={C.ip} b={HACK[1] - 0.1} x={540} y={1000} text="IP PÚBLICA" bg="#ff4d5e" color="#fff" rot={-4} />
      {H(1)}
      <Title t={t} a={HACK_END[1]} b={C.despues - 0.1} l1="Red privada" l2="solo habla el servidor" c2="#3dff8a" y={Y} size={86} />

      <Title t={t} a={C.despues} b={HACK[2] - 0.1} l1="Paso 3:" l2="el bucket" y={Y} />
      <Sticker t={t} a={C.publico} b={HACK[2] - 0.1} x={540} y={1000} text="PÚBLICO" bg="#ff4d5e" color="#fff" rot={5} />
      {H(2)}
      <Title t={t} a={HACK_END[2]} b={C.por - 0.1} l1="Bucket privado" l2="+ links que vencen" c2="#3dff8a" y={Y} size={90} />
      <Sticker t={t} a={C.links} b={C.por - 0.1} x={540} y={1000} text="link · vence en 5 min" mono rot={-3} size={44} />

      <Title t={t} a={C.por} b={HACK[3] - 0.1} l1="Paso 4:" l2="el código" y={Y} />
      <Sticker t={t} a={C.github} b={C.minando - 0.1} x={540} y={1000} text="GitHub (público)" bg="#24292f" color="#fff" rot={3} size={50} />
      <Sticker t={t} a={C.claves} b={HACK[3] - 0.1} x={720} y={1110} text="AWS_SECRET_KEY=..." mono rot={-4} size={38} />
      {H(3)}
      <Title t={t} a={C.encima} b={HACK_END[3] - 0.1} l1="Y encima" l2="pagas la factura" c2="#ff4d5e" y={Y} size={96} />
      <Sticker t={t} a={C.pagas} b={HACK_END[3] - 0.1} x={540} y={1000} text={money(lerp(0, 18430.5, ease(ramp(t, C.pagas, 0.9))))} mono bg="#0d0f17" color="#ff4d5e" rot={-3} size={64} />
      <Title t={t} a={HACK_END[3]} b={C.la - 0.1} l1="Roles" l2="+ gestor de secretos" c2="#3dff8a" y={Y} size={92} />

      <Title t={t} a={C.la} b={C.cual - 0.1} l1="La seguridad" l2="va en cada paso" y={Y} />
      <Title t={t} a={C.cual} b={END + 1.6} l1="¿Cuál de estas" l2="ya te pasó?" y={Y} />

      <TiendaFinal t={t} a={C.la} checksAt={CHECK_AT} stampAt={C.cada} />
      <WordCaptions words={WORDS} look="pop" y={0.88} size={72} />
      {audio ? <Audio src={staticFile("te-hackean-tienda/voice.wav")} /> : null}
      {audio ? <SfxTrack events={SFX} master={0.85} /> : null}
    </AbsoluteFill>
  );
};
