// "Montamos una tienda online... y te hackean, bro" — versión GENERAL (Reels / TikTok / Shorts), 9:16.
// Misma puesta que TeHackeanTienda (LinkedIn), con el guion para no técnicos y sus cambios visuales:
// felpudo con la llave, bots probando puertas, vidriera con curiosos, checklist final en palabras simples.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/tienda-general/voice/words.json";
import {
  Bucket3D, CamRig, Card3D, CloudIsland, Coin3D, Counter, Database3D, Fire, Glitch, Hacker3D, Hud, Key3D, Lights,
  Padlock3D, Person3D, Rack3D, Safe3D, Sfx, SfxTrack, Shot, Sticker, Title, Toon, V3,
  clamp, drop, ease, layoutFor, lerp, makeCue, pop, ramp, rnd, shotAt, skyBg, useFonts,
} from "../_cartoon3d/kit";
import { TiendaFinal } from "../te-hackean-tienda/TiendaFinal";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const n = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const HACK = WORDS.map((w, i) => (n(w.w) === "hackean" ? WORDS[i - 2].s : -1)).filter((x) => x >= 0);

const C = {
  spoiler: cue("spoiler"), primero: cue("primero"), servidor: cue("servidor"), dejas: cue("dejas"), puerta: cue("puerta"), admin: cue("admin123"),
  hay: cue("hay"), robots1: cue("robots"), asi1: cue("así"), cierras: cue("cierras"), llave: cue("llave"),
  luego: cue("luego"), datos: cue("datos"), vista: cue("vista"), es: cue("es"), entonces: cue("entonces"), atras: cue("atrás"), solo: cue("solo"),
  despues: cue("después"), subes: cue("subes"), publico: cue("público"), losRobots: cue("robots", 2) - 0.6, asi2: cue("así", 2),
  cierras2: cue("cierras", 2), links: cue("links"),
  por: cue("por"), publicas: cue("publicas"), llave2: cue("llave", 2), minar: cue("minar"), cripto: cue("cripto"),
  encima: cue("encima"), pagas: cue("pagas"), las: cue("las", 2), llaves: cue("llaves"), caja: cue("caja"), digital: cue("digital"),
  la: cue("seguridad") - 0.2, cada: cue("cada"), cual: cue("cuál"),
};
// el hackeo dura hasta que arranca la explicación o el arreglo
const HACK_END = [C.hay, C.es, C.asi2, C.encima];
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.6) * FPS);

const P = { rack: [0, 0, 0] as V3, db: [-2.7, 0, 0] as V3, bucket: [2.6, 0, -0.5] as V3, safe: [1.5, 0, 2.0] as V3, code: [-1.0, 3.7, -2.6] as V3 };
const hackOn = (t: number) => HACK.map((a, i) => clamp(ramp(t, a, 0.2) - ramp(t, (i === 3 ? C.las : HACK_END[i]), 0.4)));
const hacked = (t: number) => Math.max(...hackOn(t));

const security = (t: number) => {
  const steps: [number, number][] = [[0, 100], [C.puerta, 50], [C.admin, 15], [HACK[0], 0], [C.cierras, 80],
    [C.vista, 35], [HACK[1], 0], [C.atras, 85], [C.publico, 35], [HACK[2], 0], [C.cierras2, 90], [C.llave2, 30], [HACK[3], 0], [C.llaves, 100]];
  let v = 100;
  for (const [a, x] of steps) v = lerp(v, x, ease(ramp(t, a, 0.6)));
  return v;
};

const SHOTS: Shot[] = [
  { at: 0, target: [0, 1, 0], r: 17, h: 7.5, ang: 0.5 },
  { at: 0.2, target: [0, 1, 0], r: 13.5, h: 7, ang: 0.45 },
  { at: C.servidor - 0.3, target: [0, 1.1, 0], r: 10, h: 5.5, ang: 0.55 },
  { at: C.dejas, target: [0.4, 1.0, 0], r: 8, h: 4.5, ang: 0.95 },
  { at: HACK[0] - 0.1, target: [0, 1.6, -0.6], r: 11.5, h: 6.5, ang: 0.6 },
  { at: C.hay, target: [0, 1.4, 0], r: 12, h: 6.5, ang: 0.6 },
  { at: C.asi1, target: [0.5, 1.1, 0], r: 8.5, h: 4.8, ang: 0.95 },
  { at: C.luego, target: [-2.6, 1.1, 0.4], r: 10, h: 5.5, ang: 0.2 },
  { at: HACK[1] - 0.1, target: [-2.4, 1.6, -0.8], r: 11.5, h: 6.5, ang: 0.25 },
  { at: C.entonces, target: [-1.3, 1.0, 0], r: 10, h: 5.5, ang: 0.3 },
  { at: C.despues, target: [2.6, 0.9, -0.5], r: 8.5, h: 5, ang: 0.85 },
  { at: C.losRobots - 0.3, target: [2.4, 1.2, -0.8], r: 11.5, h: 6.5, ang: 0.7 },
  { at: C.asi2, target: [2.6, 0.9, -0.5], r: 8.5, h: 5, ang: 0.85 },
  { at: C.por, target: [-1.0, 3.5, -2.6], r: 9.5, h: 6.5, ang: 0.45 },
  { at: HACK[3] - 0.1, target: [0, 1.8, -1], r: 15, h: 8, ang: 0.5 },
  { at: C.las, target: [0.4, 1.6, 0.6], r: 12, h: 6.5, ang: 0.55 },
  { at: C.la, target: [0, 1.2, 0], r: 16.5, h: 8.5, ang: 0.45 },
];

const Bot: React.FC<{ position: V3; s: number }> = ({ position, s }) => (
  <group position={position} scale={s * 0.6}>
    <Toon kind="sphere" args={[0.32]} color="#e23b4a" />
    <Toon kind="box" args={[0.36, 0.1, 0.05]} position={[0, 0.06, 0.3]} color="#ffef5c" basic outline={0} />
  </group>
);

const Scene: React.FC<{ t: number; lift: number }> = ({ t, lift }) => {
  const hk = hackOn(t);
  const red = hacked(t);
  const sh = shotAt(SHOTS, t);
  const ang = sh.ang + 0.02 * Math.sin(t * 0.4) + (t > C.la ? (t - C.la) * 0.06 : 0);
  const shake = Math.max(...HACK.map((a, i) => (ramp(t, a, 0.05) - ramp(t, a + (i === 3 ? 1.4 : 0.8), 0.4)) * (i === 3 ? 1.6 : 1)));

  const door = ease(ramp(t, C.puerta, 0.5)) * (1 - ease(ramp(t, C.cierras, 0.4)));
  const mat = pop(t, C.puerta + 0.2, 0.4) * (1 - ease(ramp(t, C.cierras, 0.4)));
  const lock1 = pop(t, C.cierras + 0.3, 0.45);
  const key1 = ease(ramp(t, C.llave - 0.2, 0.8));
  const dbIn = drop(t, C.datos - 0.2);
  const shop = pop(t, C.vista - 0.1, 0.45) * (1 - ease(ramp(t, C.atras, 0.4)));
  const dome = pop(t, C.atras - 0.1, 0.5);
  const pipe = ease(ramp(t, C.solo - 0.1, 0.6));
  const bIn = drop(t, C.subes - 0.2);
  const lid = ease(ramp(t, C.cierras2 - 0.1, 0.5));
  const codeIn = pop(t, C.publicas - 0.1, 0.5);
  const codeKey = pop(t, C.llave2 - 0.1, 0.4);
  const keyFly = ease(ramp(t, C.llaves, 1.0));
  const safe = pop(t, C.llaves - 0.1, 0.45);
  const crypto = clamp(ramp(t, C.minar - 0.1, 0.3) - ramp(t, C.las, 0.4));
  const bots1 = clamp(ramp(t, C.hay, 0.3) - ramp(t, C.asi1 + 0.3, 0.4));

  const hackerPos: V3[] = [[-0.6, 0, -2.4], [-3.4, 0, -2.2], [3.2, 0, -2.6], [0, 0, -3.0]];
  return (
    <>
      <CamRig pos={[sh.target[0] + Math.sin(ang) * sh.r * 1.08, sh.h, sh.target[2] + Math.cos(ang) * sh.r * 1.08]} target={[sh.target[0], sh.target[1] + lift, sh.target[2]]} shake={shake} t={t} />
      <Lights red={red} />
      <group scale={pop(t, 0, 0.6)}><CloudIsland t={t} s={1.15} /></group>

      {t > C.spoiler - 0.2 && t < C.primero + 0.3 ? (
        <Hacker3D t={t} s={1.2} position={[0.4, lerp(-3.5, -1.0, ease(ramp(t, C.spoiler, 0.4)) * (1 - ease(ramp(t, C.primero - 0.4, 0.4)))), -2.6]} />
      ) : null}

      {/* 1. servidor con su puerta trasera */}
      {t > C.servidor - 0.3 ? (
        <group position={[P.rack[0], (1 - drop(t, C.servidor - 0.25)) * 9, P.rack[2]]}>
          <Rack3D t={t} state={red > 0.5 ? "alert" : "ok"} />
          <Toon kind="box" args={[0.03, 0.62, 0.46]} position={[0.66, 1.15, 0]} color="#ff2d2d" glow="#ff2d2d" glowI={1.5 * door} outline={0} />
          <group position={[0.68, 1.15, 0.25]} rotation={[0, door * 1.7, 0]}>
            <Toon kind="box" args={[0.05, 0.66, 0.5]} position={[0, 0, -0.25]} color="#7c8aa6" outline={0.02} />
          </group>
          {/* el felpudo, con la "llave" (admin123) abajo */}
          <group position={[1.15, 0.04, 0]} scale={mat}>
            <Toon kind="box" args={[0.7, 0.06, 0.9]} color="#a16207" />
            <Toon kind="box" args={[0.5, 0.02, 0.7]} position={[0, 0.04, 0]} color="#ca8a04" outline={0} />
            <Key3D position={[0.18, 0.12, 0.3]} rotation={[-Math.PI / 2, 0, 0.6]} s={0.35} />
          </group>
          <group position={[0.85, 1.15, 0]} rotation={[0, Math.PI / 2, 0]}><Padlock3D s={0.55 * lock1} open={1 - ease(ramp(t, C.llave + 0.7, 0.3))} /></group>
          {t > C.llave - 0.3 && t < C.llave + 1.6 ? (
            <Key3D position={[lerp(4, 1.35, key1), 1.15 + (1 - key1) * 2.5, 0]} rotation={[key1 > 0.95 ? ease(ramp(t, C.llave + 0.8, 0.3)) * 1.5 : t * 5, 0, Math.PI]} s={0.7 * (1 - ramp(t, C.llave + 1.3, 0.3))} />
          ) : null}
        </group>
      ) : null}
      {/* robots probando puertas alrededor del servidor */}
      {bots1 > 0 ? Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + t * 0.6;
        return <Bot key={i} position={[Math.cos(a) * 2.6, 1.2 + 0.4 * Math.sin(t * 4 + i), Math.sin(a) * 2.6]} s={bots1 * pop(t, C.hay + i * 0.06, 0.3)} />;
      }) : null}

      {/* 2. los datos de clientes, en una vidriera */}
      {t > C.datos - 0.3 ? (
        <group position={[P.db[0], (1 - dbIn) * 9, P.db[2]]}>
          <Database3D t={t} alert={hk[1] > 0.5} />
          {shop > 0.01 ? (
            <group scale={shop}>
              <Toon kind="box" args={[2.0, 2.4, 2.0]} position={[0, 1.2, 0]} color="#a5f3fc" opacity={0.18} outline={0} />
              {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => <Toon key={`${x}${z}`} kind="box" args={[0.08, 2.4, 0.08]} position={[x, 1.2, z]} color="#0e7490" />)}
              <Toon kind="box" args={[2.1, 0.1, 2.1]} position={[0, 2.42, 0]} color="#0e7490" />
              {[-0.8, 0, 0.8].map((x, i) => <Person3D key={x} t={t * 0.3} seed={i} position={[x, 0, 1.9]} s={0.8} face={Math.PI} color={["#ff8fab", "#7bdff2", "#ffd166"][i]} />)}
            </group>
          ) : null}
          {dome > 0 ? <Toon kind="sphere" args={[1.55]} position={[0, 0.2, 0]} scale={[dome, dome * 1.05, dome]} color="#38bdf8" opacity={0.22} outline={0} /> : null}
          {dome > 0 ? <Toon kind="torus" args={[1.55, 0.07]} position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={dome} color="#38bdf8" /> : null}
        </group>
      ) : null}
      {hk[1] > 0 ? Array.from({ length: 12 }, (_, i) => {
        const u = ((t - HACK[1]) * 0.9 + rnd(i)) % 1;
        return <Toon key={i} kind="box" args={[0.3, 0.2, 0.03]} color="#f8fafc" outline={0.015}
          position={[lerp(P.db[0], hackerPos[1][0], u) + (rnd(i + 2) - 0.5), lerp(1.8, 3.0, u) + Math.sin(u * Math.PI) * 1.2, lerp(P.db[2], hackerPos[1][2], u)]} rotation={[t * 3 + i, t * 2, 0]} scale={hk[1]} />;
      }) : null}
      {pipe > 0 ? (
        <group position={[(P.rack[0] + P.db[0]) / 2, 0.55, 0]}>
          <Toon kind="cyl" args={[0.11, 0.11, 1.4]} rotation={[0, 0, Math.PI / 2]} scale={[1, pipe, 1]} color="#ffd23f" />
        </group>
      ) : null}

      {/* 3. el depósito (bucket) */}
      {t > C.subes - 0.3 ? (
        <group position={[P.bucket[0], (1 - bIn) * 9, P.bucket[2]]}>
          <Bucket3D t={t} lid={lid} photos={1 - 0.6 * hk[2]} />
          <group position={[0, 1.15, 0.95]}><Padlock3D s={0.45 * pop(t, C.cierras2 + 0.3, 0.4)} /></group>
        </group>
      ) : null}
      {hk[2] > 0 ? Array.from({ length: 10 }, (_, i) => {
        const u = ((t - HACK[2]) * 1.0 + rnd(i + 7)) % 1;
        return <Toon key={i} kind="box" args={[0.36, 0.44, 0.04]} color={["#fde68a", "#f9a8d4", "#a5f3fc", "#fecaca"][i % 4]} outline={0.015}
          position={[lerp(P.bucket[0], hackerPos[2][0], u) + (rnd(i) - 0.5), lerp(1.5, 3.0, u) + Math.sin(u * Math.PI), lerp(P.bucket[2], hackerPos[2][2], u)]} rotation={[t * 2 + i, t * 3, 0]} scale={hk[2]} />;
      }) : null}
      {t > C.losRobots - 0.2 && t < C.cierras2 + 0.5 ? Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI * (1.0 + (i / 7) * 1.2) + 0.5;
        const rr = lerp(4.5, 1.7, ease(ramp(t, C.losRobots, 1.2)));
        return <Bot key={i} position={[P.bucket[0] + Math.cos(a) * rr, 1.5 + 0.3 * Math.sin(t * 3 + i) + rnd(i) * 0.8, P.bucket[2] + Math.sin(a) * rr]} s={pop(t, C.losRobots + i * 0.05, 0.3) * (1 - ramp(t, C.cierras2, 0.4))} />;
      }) : null}

      {/* 4. el código publicado, con la llave adentro */}
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
      {keyFly > 0.02 && keyFly < 1 ? (
        <Key3D position={[lerp(P.code[0], P.safe[0], keyFly), lerp(P.code[1] + 1.2, 1.1, keyFly) + Math.sin(keyFly * Math.PI) * 1.5, lerp(P.code[2], P.safe[2] + 0.6, keyFly)]} rotation={[0, t * 6, 0]} s={0.8} />
      ) : null}
      {safe > 0 ? <Safe3D position={P.safe} s={safe} glow={ramp(t, C.digital, 0.2)} /> : null}
      {crypto > 0 ? (
        <group position={[P.code[0] + 2.2, P.code[1] - 0.6, P.code[2] + 0.8]} scale={crypto}>
          <Card3D rotation={[0.1, -0.4, 0.15 * Math.sin(t * 8)]} />
          <Fire t={t} a={C.minar} on={1} position={[0, 0.3, 0]} size={0.6} n={14} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + t * 2;
            return <Coin3D key={i} position={[Math.cos(a) * 1.4, Math.sin(a * 2) * 0.3, Math.sin(a) * 1.4]} rotation={[0, t * 4 + i, 0]} s={0.8} />;
          })}
        </group>
      ) : null}

      {hk.map((h, i) => (h > 0 ? <Hacker3D key={i} t={t} s={i === 3 ? 2.1 : 1.35} position={[hackerPos[i][0], lerp(-4.5, 0, ease(h)), hackerPos[i][2]]} /> : null))}
    </>
  );
};

const CHECK_AT = [0, 1, 2, 3].map((i) => C.la + 0.55 + i * 0.45);
const SFX: Sfx[] = [
  { at: 0, s: "whoosh_up", v: 0.7 }, { at: 0.1, s: "pop" },
  { at: C.spoiler, s: "pop" }, { at: C.spoiler + 0.05, s: "whoosh", v: 0.8 },
  { at: C.primero, s: "pop" }, { at: C.servidor - 0.45, s: "whoosh_down" }, { at: C.servidor + 0.08, s: "thud" },
  { at: C.dejas, s: "pop" }, { at: C.puerta, s: "door", v: 0.7 }, { at: C.puerta + 0.2, s: "slap", v: 0.7 }, { at: C.admin, s: "slap" },
  ...HACK.map((a, i): Sfx => ({ at: a, s: "hack", v: i === 3 ? 1.0 : 0.85 })),
  { at: C.hay, s: "pop" }, { at: C.hay + 0.1, s: "bots" },
  { at: C.asi1, s: "ding", v: 0.9 }, { at: C.cierras, s: "door" }, { at: C.cierras + 0.35, s: "click" },
  { at: C.llave - 0.2, s: "keys" }, { at: C.llave + 0.75, s: "click" },
  { at: C.luego, s: "pop" }, { at: C.datos - 0.4, s: "whoosh_down" }, { at: C.datos + 0.13, s: "thud" },
  { at: C.vista, s: "slap" }, { at: C.vista + 0.1, s: "pop", v: 0.7 },
  { at: C.es, s: "pop" }, { at: C.entonces, s: "ding", v: 0.9 }, { at: C.atras, s: "shield" }, { at: C.solo, s: "whoosh_up", v: 0.6 },
  { at: C.despues, s: "pop" }, { at: C.subes - 0.4, s: "whoosh_down" }, { at: C.subes + 0.13, s: "thud" },
  { at: C.publico, s: "slap" }, { at: C.losRobots, s: "bots" },
  { at: C.asi2, s: "ding", v: 0.9 }, { at: C.cierras2 + 0.3, s: "thud", v: 0.6 }, { at: C.cierras2 + 0.35, s: "click" }, { at: C.links, s: "slap" },
  { at: C.por, s: "pop" }, { at: C.publicas, s: "whoosh_up", v: 0.8 }, { at: C.publicas + 0.2, s: "slap" },
  { at: C.llave2, s: "keys" }, { at: C.llave2 + 0.1, s: "slap", v: 0.7 },
  { at: C.minar, s: "fire" }, { at: C.cripto, s: "coins" },
  { at: C.encima, s: "pop" }, { at: C.pagas, s: "cash" },
  { at: C.las, s: "ding", v: 0.9 }, { at: C.llaves + 0.1, s: "whoosh" }, { at: C.llaves, s: "pop", v: 0.7 }, { at: C.llaves + 0.95, s: "safe" },
  { at: C.caja, s: "slap", v: 0.7 }, { at: C.digital, s: "ding", v: 0.6 },
  { at: C.la, s: "whoosh_up", v: 0.8 }, { at: C.la + 0.05, s: "pop" },
  ...CHECK_AT.map((a): Sfx => ({ at: a, s: "click", v: 0.9 })),
  { at: C.cada, s: "thud", v: 0.7 }, { at: C.cada + 0.05, s: "ding", v: 0.8 }, { at: C.cual, s: "pop" },
];

const money = (v: number) => `$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const TiendaGeneral: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const L = layoutFor(height);
  const t = f / fps;
  const red = hacked(t);
  const s = security(t);
  const col = s > 70 ? "#3dff8a" : s > 30 ? "#ffd23f" : "#ff4d5e";
  const count = HACK.filter((a) => t >= a).length;
  const lastHack = [...HACK].reverse().find((a) => t >= a) ?? 999;
  const Y = L.titleY, SY = L.stickerY;
  const H = (i: number) => (
    <Title key={`h${i}`} t={t} a={HACK[i]} b={(i === 3 ? C.encima : HACK_END[i]) - 0.1} l1="Y te hackean," l2="bro" c2="#ff4d5e" y={Y} size={i === 3 ? 124 : 104}
      shake={red > 0.5 && Math.sin(t * 37) > 0.2 ? 1 : 0.4} />
  );
  return (
    <AbsoluteFill style={{ background: skyBg(0.2 * red, red) }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: L.fov, position: [8, 6, 10] }}>
        <Scene t={t} lift={L.camLift} />
      </ThreeCanvas>
      <Glitch t={t} on={red > 0.5} h={height} />
      <Hud label="SEGURIDAD" value={red > 0.5 ? "HACKEADO" : `${Math.round(s)} %`} bar={s / 100} color={col} o={ramp(t, C.servidor, 0.3)} pulse={red} top={L.hudTop} />
      <Counter label="HACKEOS" n={count} t={t} lastAt={lastHack} o={ramp(t, C.servidor, 0.3)} color={count ? "#ff4d5e" : "#aab4c8"} top={L.hudTop} />

      <Title t={t} a={0.1} b={C.spoiler - 0.1} l1="Montamos una" l2="tienda online" y={Y} />
      <Title t={t} a={C.spoiler} b={C.primero - 0.1} l1="Spoiler:" l2="nos hackean" c2="#ff4d5e" y={Y} />
      <Title t={t} a={C.primero} b={C.dejas - 0.1} l1="Paso 1:" l2="el servidor" y={Y} />
      <Sticker t={t} a={C.servidor + 0.6} b={C.dejas - 0.1} x={540} y={SY} text="la compu que atiende a tus clientes" rot={-2} size={36} />
      <Title t={t} a={C.dejas} b={HACK[0] - 0.1} l1="Puerta trasera" l2="abierta" y={Y} />
      <Sticker t={t} a={C.puerta} b={HACK[0] - 0.1} x={360} y={SY} text="PUERTO 22" mono bg="#ff4d5e" color="#fff" rot={4} size={46} />
      <Sticker t={t} a={C.admin} b={HACK[0] - 0.1} x={740} y={SY + 100} text="admin123" mono rot={-6} size={54} />
      {H(0)}
      <Title t={t} a={C.hay} b={C.asi1 - 0.1} l1="Robots probando" l2="puertas 24/7" c2="#ff4d5e" y={Y} />
      <Title t={t} a={C.asi1} b={C.luego - 0.1} l1="Puerta cerrada" l2="+ llave secreta" c2="#3dff8a" y={Y} />
      <Sticker t={t} a={C.llave} b={C.luego - 0.1} x={540} y={SY} text="LLAVES SSH" mono bg="#3dff8a" rot={-3} size={46} />

      <Title t={t} a={C.luego} b={HACK[1] - 0.1} l1="Paso 2:" l2="datos de clientes" y={Y} />
      <Sticker t={t} a={C.vista} b={HACK[1] - 0.1} x={540} y={SY} text="A LA VISTA DE TODOS" bg="#ff4d5e" color="#fff" rot={-4} size={48} />
      {H(1)}
      <Title t={t} a={C.es} b={C.entonces - 0.1} l1="Como la libreta" l2="en la vidriera" y={Y} />
      <Title t={t} a={C.entonces} b={C.despues - 0.1} l1="Guardada atrás" l2="solo para tu tienda" c2="#3dff8a" y={Y} size={88} />
      <Sticker t={t} a={C.atras} b={C.despues - 0.1} x={540} y={SY} text="RED PRIVADA" mono bg="#3dff8a" rot={3} size={46} />

      <Title t={t} a={C.despues} b={HACK[2] - 0.1} l1="Paso 3:" l2="fotos y facturas" y={Y} />
      <Sticker t={t} a={C.publico} b={HACK[2] - 0.1} x={540} y={SY} text="DEPÓSITO PÚBLICO" bg="#ff4d5e" color="#fff" rot={5} size={48} />
      {H(2)}
      <Title t={t} a={HACK_END[2]} b={C.por - 0.1} l1="Depósito cerrado" l2="+ links que se vencen" c2="#3dff8a" y={Y} size={84} />
      <Sticker t={t} a={C.links} b={C.por - 0.1} x={540} y={SY} text="link · vence en 5 min" mono rot={-3} size={42} />

      <Title t={t} a={C.por} b={HACK[3] - 0.1} l1="Paso 4:" l2="el código" y={Y} />
      <Sticker t={t} a={C.publicas} b={C.minar - 0.1} x={540} y={SY} text="CÓDIGO PÚBLICO" bg="#24292f" color="#fff" rot={3} size={48} />
      <Sticker t={t} a={C.llave2} b={HACK[3] - 0.1} x={680} y={SY + 110} text="LLAVE DE TU CUENTA" mono rot={-4} size={38} />
      {H(3)}
      <Title t={t} a={C.encima} b={C.las - 0.1} l1="Y encima" l2="pagas la factura" c2="#ff4d5e" y={Y} size={96} />
      <Sticker t={t} a={C.pagas} b={C.las - 0.1} x={540} y={SY} text={money(lerp(0, 18430.5, ease(ramp(t, C.pagas, 0.9))))} mono bg="#0d0f17" color="#ff4d5e" rot={-3} size={64} />
      <Title t={t} a={C.las} b={C.la - 0.1} l1="Las llaves van" l2="en una caja fuerte" c2="#3dff8a" y={Y} size={90} />
      <Sticker t={t} a={C.caja} b={C.la - 0.1} x={540} y={SY} text="GESTOR DE SECRETOS" mono bg="#3dff8a" rot={2} size={40} />

      <Title t={t} a={C.la} b={C.cual - 0.1} l1="La seguridad" l2="va en cada paso" y={Y} />
      <Title t={t} a={C.cual} b={END + 1.6} l1="¿Cuál te" l2="sorprendió más?" y={Y} />
      <TiendaFinal t={t} a={C.la} checksAt={CHECK_AT} stampAt={C.cada} top={L.v ? 660 : 470}
        checks={["Puerta trasera cerrada", "Datos guardados atrás", "Depósito privado", "Llaves en la caja fuerte"]} />

      <WordCaptions words={WORDS} look="pop" y={L.capY} size={L.v ? 80 : 72} />
      {audio ? <Audio src={staticFile("tienda-general/voice.wav")} /> : null}
      {audio ? <SfxTrack events={SFX} master={0.85} /> : null}
    </AbsoluteFill>
  );
};
