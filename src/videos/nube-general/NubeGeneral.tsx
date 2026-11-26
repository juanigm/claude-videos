// "¿Qué es la nube de verdad?" — versión GENERAL (Reels / TikTok / Shorts), 9:16.
// Misma puesta que QueEsLaNube3D (LinkedIn) con el guion para no técnicos y sus cambios visuales:
// fotos/chats/series que vuelan al data center, guardia en la puerta, medidor de luz, la compu que sale de tu casa,
// panel final "ellos / tú" sin jerga.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/nube-general/voice/words.json";
import {
  CamRig, CloudIsland, Hud, Lights, Person3D, Rack3D, Sfx, SfxTrack, Shot, Sticker, Title, Toon, V3,
  clamp, drop, ease, layoutFor, lerp, makeCue, pop, ramp, rnd, shotAt, skyBg, useFonts,
} from "../_cartoon3d/kit";
import { Bricks3D, DataCenter3D, Disk3D, Globe3D, Snow3D } from "../que-es-la-nube/QueEsLaNube3D";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const C = {
  fotos: cue("fotos"), pero: cue("pero"), spoiler: cue("spoiler"), ninguna: cue("ninguna"), la: cue("otro") - 1.6, otro: cue("otro"),
  bueno: cue("bueno"), miles: cue("miles"), edificios: cue("edificios"), data: cue("data"),
  cientos: cue("cientos") - 0.3, ahi: cue("ahí"), fotos2: cue("fotos", 2), chats: cue("chats"), serie: cue("serie"),
  empresas: cue("empresas"), amazon: cue("amazon"), microsoft: cue("microsoft"), google: cue("google"),
  construyen: cue("construyen"), enfrian: cue("enfrían"), cuidan: cue("cuidan"), disco: cue("disco"),
  tu: cue("tú"), compras: cue("compras"), alquilas: cue("alquilas"), luz: cue("luz"), pagas: cue("pagas"),
  necesitas: cue("necesitas"), lista: cue("lista"), ya: cue("ya"), borras: cue("borras"), dejas: cue("dejas"),
  osea: cue("sea") - 0.2, siguen: cue("siguen"), solo: cue("solo"), casa: cue("casa"),
  eso: cue("eso", 2), edificio: cue("edificio"), guardas: cue("guardas"), llave: cue("llave"), tuya: cue("tuya"),
  sabias: cue("sabías"),
};
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.5) * FPS);

// ---------------------------------------------------------------- piezas nuevas
const Guard3D: React.FC<{ t: number; position?: V3; s?: number }> = ({ t, position, s = 1 }) => (
  <group position={position} scale={s}>
    <Person3D t={t * 0.2} color="#1e3a8a" />
    <Toon kind="cyl" args={[0.27, 0.27, 0.12]} position={[0, 1.13, 0]} color="#1e3a8a" />
    <Toon kind="box" args={[0.36, 0.04, 0.2]} position={[0, 1.08, 0.2]} color="#0f172a" outline={0.01} />
    <Toon kind="box" args={[0.14, 0.16, 0.03]} position={[0.1, 0.45, 0.28]} color="#fbbf24" outline={0.01} />
  </group>
);

/** foto, globo de chat y pantalla con play: lo tuyo que vive en el data center */
const Mine3D: React.FC<{ kind: "foto" | "chat" | "serie"; t: number }> = ({ kind, t }) => {
  if (kind === "foto") return (
    <group rotation={[0, 0, 0.15 * Math.sin(t * 3)]}>
      <Toon kind="box" args={[0.9, 1.05, 0.06]} color="#ffffff" />
      <Toon kind="box" args={[0.72, 0.7, 0.03]} position={[0, 0.08, 0.04]} color="#60a5fa" outline={0} />
      <Toon kind="sphere" args={[0.12]} position={[0.18, 0.25, 0.06]} color="#fde047" outline={0} />
    </group>
  );
  if (kind === "chat") return (
    <group>
      <Toon kind="box" args={[1.1, 0.75, 0.12]} color="#4ade80" />
      <Toon kind="box" args={[0.25, 0.25, 0.12]} position={[-0.38, -0.42, 0]} rotation={[0, 0, 0.8]} color="#4ade80" outline={0.02} />
      {[-0.28, 0, 0.28].map((x) => <Toon key={x} kind="sphere" args={[0.07]} position={[x, 0, 0.08]} color="#065f46" outline={0} />)}
    </group>
  );
  return (
    <group>
      <Toon kind="box" args={[1.3, 0.85, 0.1]} color="#1f2937" />
      <Toon kind="box" args={[1.12, 0.68, 0.02]} position={[0, 0, 0.06]} color="#ef4444" outline={0} />
      <Toon kind="cone" args={[0.18, 0.3]} position={[0.03, 0, 0.09]} rotation={[0, 0, -Math.PI / 2]} color="#ffffff" outline={0} />
    </group>
  );
};

const House3D: React.FC<{ position?: V3; s?: number }> = ({ position, s = 1 }) => (
  <group position={position} scale={s}>
    <Toon kind="box" args={[3.2, 0.25, 3.0]} position={[0, -0.12, 0]} color="#86efac" />
    <Toon kind="box" args={[2.6, 2.0, 2.2]} position={[0, 1.0, -0.2]} color="#fde68a" />
    <Toon kind="cone" args={[2.1, 1.2]} position={[0, 2.6, -0.2]} rotation={[0, Math.PI / 4, 0]} color="#dc2626" />
    <Toon kind="box" args={[0.6, 1.0, 0.05]} position={[0.6, 0.5, 0.92]} color="#92400e" outline={0.02} />
    <Toon kind="box" args={[0.6, 0.5, 0.05]} position={[-0.6, 1.2, 0.92]} color="#7dd3fc" outline={0.02} />
  </group>
);

// ---------------------------------------------------------------- escena
const SHOTS: Shot[] = [
  { at: 0, target: [0, 0.3, 0], r: 19, h: 7.5, ang: 0.4 },
  { at: C.spoiler, target: [0, 1.0, 0], r: 9, h: 4.5, ang: 0.55 },
  { at: C.miles - 0.3, target: [0, 1.0, 0], r: 12, h: 5.5, ang: 0.5 },
  { at: C.edificios - 0.3, target: [0, 1.6, 0], r: 15, h: 7, ang: 0.45 },
  { at: C.cientos - 0.2, target: [0, 1.2, 0], r: 13, h: 4.5, ang: 0.3 },
  { at: C.ahi - 0.15, target: [0, 1.6, 0.5], r: 16, h: 6.5, ang: 0.45 },
  { at: C.empresas, target: [0, 1.0, 0.6], r: 19, h: 8, ang: 0.35 },
  { at: C.tu - 0.2, target: [0, 1.0, 0], r: 13, h: 6, ang: 0.35 },
  { at: C.osea, target: [0, 1.0, 0], r: 15, h: 6.5, ang: 0.15 },
  { at: C.eso, target: [0, 1.0, 0], r: 18, h: 9, ang: 0.3 },
  { at: C.sabias - 0.2, target: [0, 1.2, 0], r: 15, h: 6, ang: 0.4 },
];

const Scene: React.FC<{ t: number; lift: number }> = ({ t, lift }) => {
  const sh = shotAt(SHOTS, t);
  const ang = sh.ang + 0.02 * t;
  const cloud1 = pop(t, 0, 0.6) * (1 - ease(ramp(t, C.spoiler + 0.2, 0.5)));
  const rack = pop(t, C.ninguna - 0.3, 0.45) * (1 - ease(ramp(t, C.edificios - 0.3, 0.4)));
  const multi = ease(ramp(t, C.miles, 0.6));
  const dc = pop(t, C.edificios - 0.1, 0.55) * (1 - ease(ramp(t, C.cientos - 0.2, 0.3)));
  const globe = pop(t, C.cientos - 0.1, 0.5) * (1 - ease(ramp(t, C.ahi - 0.15, 0.3)));
  const dc2 = pop(t, C.ahi, 0.5) * (1 - ease(ramp(t, C.tu - 0.2, 0.3)));
  const you = pop(t, C.tu - 0.1, 0.45) * (1 - ease(ramp(t, C.osea, 0.3)));
  const srv = pop(t, C.necesitas, 0.4) * (1 - ease(ramp(t, C.borras + 0.1, 0.4)));
  const hw = pop(t, C.osea, 0.45) * (1 - ease(ramp(t, C.eso - 0.1, 0.3)));
  const move = ease(ramp(t, C.solo, 1.0));
  const fin = pop(t, C.eso - 0.05, 0.5) * (1 - ease(ramp(t, C.sabias - 0.2, 0.3)));
  const close = pop(t, C.sabias - 0.1, 0.5);
  const mine: { k: "foto" | "chat" | "serie"; at: number; x: number }[] = [
    { k: "foto", at: C.fotos2, x: -3.2 }, { k: "chat", at: C.chats, x: 0 }, { k: "serie", at: C.serie, x: 3.2 }];
  return (
    <>
      <CamRig pos={[sh.target[0] + Math.sin(ang) * sh.r, sh.h, sh.target[2] + Math.cos(ang) * sh.r]} target={[sh.target[0], sh.target[1] + lift, sh.target[2]]} t={t} />
      <Lights />

      {cloud1 > 0.01 ? (
        <group scale={cloud1} position={[0, 0.3 * Math.sin(t), 0]}>
          <CloudIsland t={t} s={0.9} />
          {Array.from({ length: 6 }, (_, i) => {
            const u = ((t - C.fotos + 0.3) * 0.7 + i / 6) % 1;
            if (t < C.fotos - 0.3) return null;
            return (
              <group key={i} position={[(rnd(i) - 0.5) * 5, lerp(-5, 1.2, ease(u)), 2.5 + rnd(i + 2) * 2]} rotation={[0.2, 0.4 * Math.sin(t + i), 0.3 * Math.sin(t * 2 + i)]} scale={1.7 * (1 - u * 0.7)}>
                <Toon kind="box" args={[0.6, 0.72, 0.05]} color="#ffffff" />
                <Toon kind="box" args={[0.48, 0.48, 0.02]} position={[0, 0.06, 0.035]} color={["#fbbf24", "#f472b6", "#22d3ee", "#f87171", "#a78bfa", "#4ade80"][i]} outline={0} />
              </group>
            );
          })}
        </group>
      ) : null}
      {t > C.spoiler + 0.2 && t < C.spoiler + 1.4 ? Array.from({ length: 16 }, (_, i) => {
        const u = ease(ramp(t, C.spoiler + 0.2, 1.1));
        const a = (i / 16) * Math.PI * 2;
        return <Toon key={i} kind="sphere" args={[0.5 + rnd(i) * 0.5]} position={[Math.cos(a) * u * 6, rnd(i + 1) * 2 * u, Math.sin(a) * u * 6]} color="#f4f8ff" scale={1 - u} outline={0.02} />;
      }) : null}

      {rack > 0.01 ? (
        <group scale={rack}>
          <Toon kind="cyl" args={[3.2, 3.2, 0.3]} position={[0, -0.15, 0]} color="#d9e0ea" />
          <Rack3D t={t} />
          {[-1, 1, -2, 2].map((d, i) => <Rack3D key={d} t={t} seed={i + 2} position={[d * 1.55 * multi, 0, -0.5 * Math.abs(d) * multi]} s={0.85 * clamp(multi * 2 - i * 0.3)} />)}
        </group>
      ) : null}

      {dc > 0.01 ? <group position={[0, (1 - drop(t, C.edificios - 0.15)) * 6, 0]}><DataCenter3D t={t} s={dc} fill={ramp(t, C.edificios + 0.4, 1.2)} /></group> : null}
      {globe > 0.01 ? <Globe3D t={t} a={C.cientos} s={globe} /> : null}

      {/* tus cosas vuelan al data center, y después los proveedores lo cuidan */}
      {dc2 > 0.01 ? (
        <group scale={dc2}>
          <DataCenter3D t={t} />
          {mine.map((m) => {
            const u = ease(ramp(t, m.at, 1.1));
            if (t < m.at - 0.05 || u >= 1) return null;
            return <group key={m.k} position={[lerp(m.x, 0, u), lerp(5.2, 1.6, u) + Math.sin(u * Math.PI) * 0.8, lerp(3, 1.9, u)]} scale={1.3 * (1 - 0.8 * u) * pop(t, m.at, 0.3)}><Mine3D kind={m.k} t={t} /></group>;
          })}
          <group position={[-3.0, 0, 2.6]} scale={0.8 * pop(t, C.construyen - 0.1, 0.4)}><Bricks3D u={ramp(t, C.construyen, 0.8)} /></group>
          <group position={[-1.0, 0.9, 2.6]} scale={0.65 * pop(t, C.enfrian - 0.1, 0.4)}><Snow3D t={t} /></group>
          <Guard3D t={t} position={[1.0, 0, 2.6]} s={1.1 * pop(t, C.cuidan - 0.1, 0.4)} />
          <group position={[3.0, 0.8, 2.6]} scale={0.8 * pop(t, C.disco - 0.1, 0.4)}><Disk3D t={t} /></group>
        </group>
      ) : null}

      {you > 0.01 ? (
        <group scale={you}>
          <Toon kind="cyl" args={[3.6, 3.6, 0.3]} position={[0, -0.15, 0]} color="#d9e0ea" />
          <Person3D t={t * 0.3} position={[-1.6, 0, 0.6]} s={1.6} face={0.5} />
          {t < C.necesitas ? (
            <group position={[1.8, 0, -0.4]} scale={0.38 * pop(t, C.tu, 0.4) * (1 - ease(ramp(t, C.necesitas - 0.4, 0.3)))}>
              <DataCenter3D t={t} />
              {[0.75, -0.75].map((r) => (
                <Toon key={r} kind="box" args={[8 * clamp(ramp(t, C.compras, 0.25) * 2 - (r < 0 ? 1 : 0)), 0.5, 0.5]} position={[0, 1.6, 2.2]} rotation={[0, 0, r]} color="#ff3b3b" />
              ))}
            </group>
          ) : null}
          {srv > 0.01 ? (
            <group position={[1.6, (1 - drop(t, C.necesitas - 0.1)) * 5, 0]} scale={srv}>
              <group scale={0.55}><CloudIsland t={t} /></group>
              <Rack3D t={t} s={0.8} position={[0, 0.1, 0]} />
            </group>
          ) : null}
          {t > C.borras + 0.1 && t < C.borras + 1.1 ? Array.from({ length: 10 }, (_, i) => {
            const u = ease(ramp(t, C.borras + 0.1, 0.9)), a = (i / 10) * Math.PI * 2;
            return <Toon key={i} kind="sphere" args={[0.3]} position={[1.6 + Math.cos(a) * u * 2, 1 + Math.sin(a) * u * 1.4, 0]} color="#f4f8ff" scale={1 - u} outline={0.02} />;
          }) : null}
        </group>
      ) : null}

      {/* las computadoras siguen existiendo... solo que ya no están en tu casa */}
      {hw > 0.01 ? (
        <group scale={hw}>
          <House3D position={[-3.4, 0, 0]} />
          <group position={[3.4, 0, 0]} scale={0.75}><CloudIsland t={t} /></group>
          <group position={[lerp(-3.0, 3.4, move), lerp(0.05, 0.2, move) + Math.sin(move * Math.PI) * 2.6, lerp(1.3, 0, move)]}><Rack3D t={t} s={0.75} /></group>
        </group>
      ) : null}

      {fin > 0.01 ? <group scale={fin * 0.8}><CloudIsland t={t} /><Rack3D t={t} /></group> : null}

      {close > 0.01 ? (
        <group scale={close}>
          <CloudIsland t={t} s={1.0} />
          <group scale={0.45}><DataCenter3D t={t} /></group>
          <group position={[0, 3.2 + 0.2 * Math.sin(t * 2), 1.2]} scale={1.2}><Mine3D kind="foto" t={t} /></group>
        </group>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 2D
/** medidor de luz: un disco que gira mientras pagas por uso */
const LightMeter: React.FC<{ t: number; o: number; top: number; spin: boolean }> = ({ t, o, top, spin }) => (
  <div style={{ position: "absolute", left: 40, top, opacity: o, background: "rgba(13,15,23,0.86)", border: "5px solid #ffd23f", borderRadius: 24, padding: "14px 22px",
    boxShadow: "0 8px 0 #0d0f17", display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 70, height: 70, borderRadius: 35, background: "#f8fafc", border: "4px solid #0d0f17", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 31, top: 4, width: 8, height: 30, background: "#dc2626", transformOrigin: "4px 31px", transform: `rotate(${spin ? t * 360 : 0}deg)` }} />
    </div>
    <div style={{ fontFamily: "Anton, sans-serif", fontSize: 34, color: "#ffd23f", lineHeight: 1.05 }}>COMO LA LUZ<br /><span style={{ color: "#aab4c8", fontSize: 26 }}>PAGAS LO QUE USAS</span></div>
  </div>
);

const FinalPanel: React.FC<{ t: number; top: number }> = ({ t, top }) => {
  if (t < C.eso - 0.1 || t > C.sabias) return null;
  const s = pop(t, C.eso, 0.45) * (1 - ease(ramp(t, C.sabias - 0.25, 0.25)));
  const glow = ramp(t, C.tuya, 0.3);
  const card = (title: string, color: string, icon: React.ReactNode, lines: { l: string; at: number }[], hl: number) => (
    <div style={{ flex: 1, background: "#fff", border: `5px solid ${hl ? "#ffd23f" : "#0d0f17"}`, borderRadius: 26, padding: "18px 16px 22px", textAlign: "center",
      boxShadow: `0 10px 0 #0d0f17${hl ? ", 0 0 0 10px rgba(255,210,63,0.4)" : ""}` }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 58, color, WebkitTextStroke: "2px #0d0f17" }}>{title}</div>
      <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      {lines.map((it) => {
        const k = pop(t, it.at, 0.35);
        return <div key={it.l} style={{ marginTop: 12, transform: `scale(${k})`, opacity: clamp(k * 2), background: "#f1f5fb", border: "4px solid #0d0f17", borderRadius: 16,
          padding: "12px 8px", fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 30, color: "#0d0f17" }}>{it.l}</div>;
      })}
    </div>
  );
  const building = (
    <div style={{ position: "relative", width: 120, height: 110 }}>
      <div style={{ position: "absolute", left: 10, top: 20, width: 100, height: 90, background: "#cfd8e6", border: "5px solid #0d0f17", borderRadius: 8 }} />
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <div key={`${r}${c}`} style={{ position: "absolute", left: 24 + c * 28, top: 34 + r * 24, width: 16, height: 12, background: "#3dff8a", border: "2px solid #0d0f17" }} />))}
    </div>
  );
  const keyBox = (
    <div style={{ position: "relative", width: 140, height: 110 }}>
      <div style={{ position: "absolute", left: 0, top: 30, width: 90, height: 76, background: "#fbbf24", border: "5px solid #0d0f17", borderRadius: 10 }} />
      <div style={{ position: "absolute", left: 80, top: 8, width: 34, height: 34, borderRadius: 17, border: "8px solid #0d0f17", background: "#ffd23f" }} />
      <div style={{ position: "absolute", left: 104, top: 36, width: 12, height: 56, background: "#0d0f17", borderRadius: 4 }} />
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", gap: 30, transform: `scale(${s})`, transformOrigin: "50% 30%" }}>
      {card("ELLOS", "#38bdf8", building, [{ l: "El edificio", at: C.edificio - 0.3 }, { l: "Las máquinas", at: C.edificio }], 0)}
      {card("TÚ", "#ffd23f", keyBox, [{ l: "Lo que guardas", at: C.guardas }, { l: "Quién tiene la llave", at: C.llave }], glow)}
    </div>
  );
};

const cost = (t: number) => {
  const run = (a: number, b: number, r: number) => Math.max(0, Math.min(t, b) - a) * r;
  return run(C.pagas, C.lista, 0.004) + run(C.lista, C.dejas, 0.031);
};

const SFX: Sfx[] = [
  { at: 0, s: "whoosh_up", v: 0.7 }, { at: 0.05, s: "pop" }, { at: C.fotos, s: "whoosh_up", v: 0.6 }, { at: C.pero, s: "pop" },
  { at: C.spoiler, s: "pop" }, { at: C.spoiler + 0.2, s: "whoosh", v: 1 }, { at: C.ninguna - 0.3, s: "thud", v: 0.8 },
  { at: C.la, s: "pop" }, { at: C.otro, s: "slap" }, { at: C.bueno, s: "pop", v: 0.7 }, { at: C.miles + 0.2, s: "thud", v: 0.5 },
  { at: C.edificios - 0.55, s: "whoosh_down" }, { at: C.edificios + 0.18, s: "thud" }, { at: C.data, s: "slap" },
  { at: C.cientos, s: "whoosh_up", v: 0.7 }, ...[0, 1, 2, 3, 4, 5].map((i): Sfx => ({ at: C.cientos + 0.3 + i * 0.22, s: "pop", v: 0.45 })),
  { at: C.ahi, s: "whoosh", v: 0.8 }, { at: C.fotos2, s: "whoosh_up", v: 0.6 }, { at: C.chats, s: "whoosh_up", v: 0.6 }, { at: C.serie, s: "whoosh_up", v: 0.6 },
  { at: C.empresas, s: "pop" }, { at: C.amazon, s: "slap" }, { at: C.microsoft, s: "slap" }, { at: C.google, s: "slap" },
  { at: C.construyen, s: "thud", v: 0.6 }, { at: C.enfrian, s: "shield", v: 0.6 }, { at: C.cuidan, s: "pop" }, { at: C.disco, s: "whoosh", v: 0.7 },
  { at: C.tu - 0.1, s: "pop" }, { at: C.compras, s: "slap" }, { at: C.alquilas, s: "pop" }, { at: C.luz, s: "click" }, { at: C.pagas, s: "coins", v: 0.6 },
  { at: C.necesitas - 0.3, s: "whoosh_down", v: 0.8 }, { at: C.necesitas + 0.1, s: "thud", v: 0.7 }, { at: C.lista, s: "ding" },
  { at: C.borras + 0.1, s: "whoosh", v: 0.9 }, { at: C.dejas, s: "click" },
  { at: C.osea, s: "pop" }, { at: C.solo, s: "whoosh_up" }, { at: C.solo + 0.9, s: "thud", v: 0.7 },
  { at: C.eso, s: "pop" }, { at: C.edificio - 0.3, s: "pop", v: 0.7 }, { at: C.edificio, s: "pop", v: 0.7 },
  { at: C.guardas, s: "pop", v: 0.7 }, { at: C.llave, s: "keys", v: 0.8 }, { at: C.tuya, s: "ding", v: 0.8 },
  { at: C.sabias, s: "whoosh_up", v: 0.7 }, { at: C.sabias + 0.05, s: "pop" },
];

export const NubeGeneral: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const L = layoutFor(height);
  const t = f / fps;
  const Y = L.titleY, SY = L.stickerY;
  const v = cost(t);
  const running = t >= C.pagas && t < C.dejas;
  const billO = clamp(ramp(t, C.alquilas, 0.3) - ramp(t, C.osea, 0.3));
  return (
    <AbsoluteFill style={{ background: skyBg(0, 0) }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: L.fov, position: [8, 6, 10] }}>
        <Scene t={t} lift={L.camLift} />
      </ThreeCanvas>

      <Title t={t} a={0.05} b={C.pero - 0.1} l1="Mis fotos están" l2="en la nube" y={Y} />
      <Title t={t} a={C.pero} b={C.spoiler - 0.1} l1="¿Pero en" l2="qué nube?" y={Y} />
      <Title t={t} a={C.spoiler} b={C.la - 0.1} l1="Spoiler:" l2="no hay ninguna nube" y={Y} size={88} />
      <Title t={t} a={C.la} b={C.bueno - 0.1} l1="La nube es" l2="la compu de otro" y={Y} />
      <Sticker t={t} a={C.otro} b={C.edificios - 0.3} x={720} y={SY - 300} text="DE OTRO" rot={-8} size={60} />
      <Title t={t} a={C.bueno} b={C.edificios - 0.1} l1="Bueno... de" l2="miles de compus" y={Y} />
      <Title t={t} a={C.edificios} b={C.cientos - 0.1} l1="En edificios" l2="gigantes" y={Y} />
      <Sticker t={t} a={C.data} b={C.cientos - 0.1} x={540} y={SY} text="DATA CENTER" mono bg="#38bdf8" rot={3} size={56} />
      <Title t={t} a={C.cientos} b={C.ahi - 0.1} l1="Hay cientos" l2="en todo el mundo" y={Y} />
      <Title t={t} a={C.ahi} b={C.empresas - 0.1} l1="Ahí viven tus" l2="fotos, chats y series" y={Y} size={84} />
      <Title t={t} a={C.empresas} b={C.tu - 0.1} l1="Ellos se" l2="encargan de todo" y={Y} />
      {[{ n: "Amazon", c: "#ff9900", a: C.amazon }, { n: "Microsoft", c: "#0078d4", a: C.microsoft }, { n: "Google", c: "#4285f4", a: C.google }].map((p, i) => (
        <Sticker key={p.n} t={t} a={p.a} b={C.construyen - 0.1} x={[220, 540, 860][i]} y={SY} text={p.n} bg={p.c} color="#fff" rot={[-5, 3, -3][i]} size={46} />
      ))}
      {["construyen", "los enfrían", "los cuidan", "cambian discos"].map((l, i) => (
        <Sticker key={l} t={t} a={[C.construyen, C.enfrian, C.cuidan, C.disco][i]} b={C.tu - 0.1} x={[210, 430, 660, 880][i]} y={SY + (i % 2) * 70} text={l} rot={[-4, 3, -3, 4][i]} size={36} />
      ))}
      <Title t={t} a={C.tu - 0.1} b={C.alquilas - 0.1} l1="Tú no" l2="compras nada" y={Y} />
      <Title t={t} a={C.alquilas} b={C.necesitas - 0.1} l1="Lo alquilas" l2="como la luz" y={Y} />
      <Title t={t} a={C.necesitas} b={C.ya - 0.1} l1="¿Más potencia?" l2="lista en minutos" c2="#3dff8a" y={Y} />
      <Title t={t} a={C.ya} b={C.osea - 0.1} l1="¿Ya no?" l2="la borras" y={Y} />
      <Hud label="FACTURA" value={`$ ${v.toFixed(3)}`} bar={clamp(v / 0.2)} color={running ? "#3dff8a" : "#aab4c8"} o={billO} pulse={0} top={L.hudTop} />
      <LightMeter t={t} o={clamp(ramp(t, C.luz - 0.1, 0.3) - ramp(t, C.osea, 0.3))} top={L.hudTop} spin={running} />
      <Title t={t} a={C.osea} b={C.solo - 0.1} l1="Las compus" l2="siguen existiendo" y={Y} />
      <Title t={t} a={C.solo} b={C.eso - 0.1} l1="Solo que no están" l2="en tu casa" y={Y} size={88} />
      <Sticker t={t} a={C.osea + 0.3} b={C.eso - 0.1} x={260} y={SY} text="tu casa" rot={-4} size={44} />
      <Sticker t={t} a={C.solo + 0.6} b={C.eso - 0.1} x={820} y={SY} text="la nube" bg="#38bdf8" rot={4} size={44} />
      <Title t={t} a={C.eso} b={C.sabias - 0.1} l1="Eso sí:" l2="lo de adentro es tuyo" y={Y} size={88} />
      <FinalPanel t={t} top={L.v ? 700 : 500} />
      <Title t={t} a={C.sabias} b={END + 1.5} l1="¿Sabías que tus fotos" l2="viven en un edificio así?" y={Y} size={78} />

      <WordCaptions words={WORDS} look="pop" y={L.capY} size={L.v ? 80 : 72} />
      {audio ? <Audio src={staticFile("nube-general/voice.wav")} /> : null}
      {audio ? <SfxTrack events={SFX} master={0.85} /> : null}
    </AbsoluteFill>
  );
};
