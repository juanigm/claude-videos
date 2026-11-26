// "¿Qué es la nube de verdad?" v2: mismo guion, voz de David, estilo 3D cartoon del canal. 1080 x 1350.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/que-es-la-nube/voice/words.json";
import {
  CamRig, CloudIsland, Hud, Lights, Padlock3D, Person3D, Rack3D, Sfx, SfxTrack, Shot, Sticker, Title, Toon, V3,
  clamp, drop, ease, lerp, makeCue, pop, ramp, rnd, shotAt, skyBg, useFonts,
} from "../_cartoon3d/kit";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const C = {
  fotos: cue("fotos"), pero: cue("pero"), spoiler: cue("spoiler"), ninguna: cue("ninguna"), la: cue("computadora") - 0.8, otro: cue("otro"),
  cualquier: cue("cualquier"), son: cue("edificios") - 0.3, edificios: cue("edificios"), servidores: cue("servidores"), data: cue("data"),
  cientos: cue("cientos"), empresas: cue("empresas"), aws: cue("aws"), azure: cue("azure"), google: cue("google"),
  construyen: cue("construyen"), enfrian: cue("enfrían"), protegen: cue("protegen"), disco: cue("disco"),
  vos: cue("vos"), compras: cue("comprás"), alquilas: cue("alquilás"), pagas: cue("pagás"),
  necesitas: cue("necesitás"), listo: cue("listo"), necesitas2: cue("necesitás", 2), borras: cue("borrás"), dejas: cue("dejás"),
  osea: cue("sea") - 0.2, hardware: cue("hardware"), cambia: cue("cambia"), encarga: cue("encarga"),
  eso: cue("eso", 2), configuras: cue("configurás"), proteges: cue("protegés"), armas: cue("armás"), resp: cue("responsabilidad"),
  cual: cue("cuál"),
};
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.5) * FPS);

// ---------------------------------------------------------------- piezas nuevas
export const DataCenter3D: React.FC<{ t: number; position?: V3; s?: number; fill?: number }> = ({ t, position, s = 1, fill = 1 }) => (
  <group position={position} scale={s}>
    <Toon kind="box" args={[6, 2.6, 3.6]} position={[0, 1.3, 0]} color="#cfd8e6" />
    <Toon kind="box" args={[6.2, 0.25, 3.8]} position={[0, 2.72, 0]} color="#8a9bb8" />
    {/* ventanas con luces de servidores */}
    {Array.from({ length: 2 }, (_, rI) => Array.from({ length: 6 }, (_, c) => {
      const i = rI * 6 + c, on = clamp(fill * 12 - i);
      const blink = Math.sin(t * (3 + rnd(i) * 4) + i) > 0;
      return <Toon key={i} kind="box" args={[0.7, 0.55, 0.05]} position={[-2.45 + c * 0.98, 0.9 + rI * 0.95, 1.81]} color={on > 0.5 ? (blink ? "#3dff8a" : "#5cc8ff") : "#2a3550"} glow={on > 0.5 ? (blink ? "#3dff8a" : "#5cc8ff") : undefined} glowI={0.8} outline={0.02} />;
    }))}
    <Toon kind="box" args={[0.9, 1.3, 0.06]} position={[2.4, 0.65, 1.82]} color="#4a5873" outline={0.02} />
    {/* equipos de frío en el techo, con ventiladores que giran */}
    {[-1.8, 0, 1.8].map((x, i) => (
      <group key={x} position={[x, 3.15, 0.2]}>
        <Toon kind="box" args={[1.2, 0.6, 1.2]} color="#e2e8f0" />
        <group position={[0, 0.32, 0]} rotation={[0, t * 8 + i, 0]}>
          <Toon kind="box" args={[0.9, 0.04, 0.16]} color="#64748b" outline={0.01} />
          <Toon kind="box" args={[0.16, 0.04, 0.9]} color="#64748b" outline={0.01} />
        </group>
      </group>
    ))}
  </group>
);

const PINS: [number, number][] = [[40, -77], [37, -122], [45, -122], [-23, -46], [-33, -70], [53, -8], [51, 0], [50, 8], [48, 2], [59, 18],
  [25, 55], [1, 103], [35, 139], [37, 127], [22, 114], [19, 72], [-33, 151], [-26, 28], [39, 116], [40, -3], [19, -99], [-34, -58], [45, -73], [60, 25]];
export const Globe3D: React.FC<{ t: number; a: number; s?: number }> = ({ t, a, s = 1 }) => {
  const rot = -1.4 + (t - a) * 0.5;
  return (
    <group scale={s} position={[0, 1.6, 0]}>
      <Toon kind="sphere" args={[2.2]} color="#3b82f6" />
      {/* "continentes" como manchas verdes que giran con el globo */}
      <group rotation={[0.35, rot, 0]}>
        {Array.from({ length: 14 }, (_, i) => {
          const la = (rnd(i) - 0.5) * 2.2, lo = rnd(i + 9) * Math.PI * 2;
          // manchas chatas pegadas a la superficie, orientadas hacia afuera
          const n: V3 = [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
          return (
            <group key={i} position={[2.1 * n[0], 2.1 * n[1], 2.1 * n[2]]} rotation={[-la, lo, 0]}>
              <Toon kind="cyl" args={[0.42 + rnd(i + 3) * 0.3, 0.42 + rnd(i + 3) * 0.3, 0.12]} rotation={[Math.PI / 2, 0, 0]} color="#4ade80" outline={0.015} />
            </group>
          );
        })}
        {PINS.map(([la, lo], i) => {
          const L = (la * Math.PI) / 180, O = (lo * Math.PI) / 180;
          const p = pop(t, a + 0.1 + i * 0.07, 0.3);
          const R = 2.25;
          return (
            <group key={i} position={[R * Math.cos(L) * Math.sin(O), R * Math.sin(L), R * Math.cos(L) * Math.cos(O)]} scale={p}>
              <Toon kind="sphere" args={[0.13]} color="#ffd23f" glow="#ffd23f" glowI={0.6} />
            </group>
          );
        })}
      </group>
    </group>
  );
};

export const Bricks3D: React.FC<{ u: number }> = ({ u }) => (
  <group>
    {[0, 1, 2].map((r) => [0, 1].map((c) => {
      const i = r * 2 + c, k = clamp(u * 6 - i);
      return <Toon key={i} kind="box" args={[0.55, 0.28, 0.3]} position={[c * 0.6 - 0.3 + (r % 2) * 0.15, 0.14 + r * 0.3 + (1 - ease(k)) * 2, 0]} color="#c2410c" opacity={1} scale={k > 0 ? 1 : 0.001} />;
    }))}
  </group>
);
export const Snow3D: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[0, 0, t * 0.8]}>
    {[0, 1, 2].map((i) => <Toon key={i} kind="box" args={[1.3, 0.14, 0.14]} rotation={[0, 0, (i * Math.PI) / 3]} color="#7dd3fc" glow="#7dd3fc" glowI={0.3} />)}
  </group>
);
export const Disk3D: React.FC<{ t: number }> = ({ t }) => (
  <group rotation={[Math.PI / 2 - 0.3, 0, t * 4]}>
    <Toon kind="cyl" args={[0.6, 0.6, 0.08]} color="#cbd5e1" />
    <Toon kind="cyl" args={[0.15, 0.15, 0.1]} color="#475569" outline={0.01} />
  </group>
);

// ---------------------------------------------------------------- escena
const SHOTS: Shot[] = [
  { at: 0, target: [0, 0.3, 0], r: 19, h: 7.5, ang: 0.4 },
  { at: C.spoiler, target: [0, 1.0, 0], r: 9, h: 4.5, ang: 0.55 },
  { at: C.cualquier, target: [0, 1.0, 0], r: 12, h: 5.5, ang: 0.5 },
  { at: C.son, target: [0, 1.6, 0], r: 15, h: 7, ang: 0.45 },
  { at: C.cientos - 0.2, target: [0, 1.2, 0], r: 13, h: 4.5, ang: 0.3 },
  { at: C.empresas, target: [0, 1.0, 0.6], r: 19, h: 8, ang: 0.35 },
  { at: C.vos - 0.2, target: [0, 1.0, 0], r: 13, h: 6, ang: 0.35 },
  { at: C.osea, target: [0, 1.0, 0], r: 14, h: 6.5, ang: 0.15 },
  { at: C.eso, target: [0, 1.0, 0], r: 18, h: 9, ang: 0.3 },
  { at: C.cual - 0.2, target: [0, 0.6, 0], r: 13, h: 5, ang: 0.4 },
];

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const sh = shotAt(SHOTS, t);
  const ang = sh.ang + 0.02 * t;
  const cloud1 = pop(t, 0, 0.6) * (1 - ease(ramp(t, C.spoiler + 0.2, 0.5)));          // la nube del principio
  const rack = pop(t, C.ninguna - 0.3, 0.45) * (1 - ease(ramp(t, C.son, 0.4)));       // "no hay nube": un servidor
  const multi = ease(ramp(t, C.cualquier, 0.6));
  const dc = pop(t, C.edificios - 0.1, 0.55) * (1 - ease(ramp(t, C.cientos - 0.2, 0.3)));
  const globe = pop(t, C.cientos - 0.1, 0.5) * (1 - ease(ramp(t, C.empresas - 0.15, 0.3)));
  const dc2 = pop(t, C.empresas, 0.5) * (1 - ease(ramp(t, C.vos - 0.2, 0.3)));
  const you = pop(t, C.vos - 0.1, 0.45) * (1 - ease(ramp(t, C.osea, 0.3)));
  const srv = pop(t, C.necesitas, 0.4) * (1 - ease(ramp(t, C.borras + 0.1, 0.4)));
  const hw = pop(t, C.osea, 0.45) * (1 - ease(ramp(t, C.eso - 0.1, 0.3)));
  const move = ease(ramp(t, C.cambia, 1.0));
  const fin = pop(t, C.eso - 0.05, 0.5);
  const close = pop(t, C.cual - 0.1, 0.5);
  return (
    <>
      <CamRig pos={[sh.target[0] + Math.sin(ang) * sh.r, sh.h, sh.target[2] + Math.cos(ang) * sh.r]} target={[sh.target[0], sh.target[1] + 0.8, sh.target[2]]} t={t} />
      <Lights />

      {/* 1. la nube y las fotos que suben */}
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
      {/* nubecitas que se desarman en el spoiler */}
      {t > C.spoiler + 0.2 && t < C.spoiler + 1.4 ? Array.from({ length: 16 }, (_, i) => {
        const u = ease(ramp(t, C.spoiler + 0.2, 1.1));
        const a = (i / 16) * Math.PI * 2;
        return <Toon key={i} kind="sphere" args={[0.5 + rnd(i) * 0.5]} position={[Math.cos(a) * u * 6, rnd(i + 1) * 2 * u, Math.sin(a) * u * 6]} color="#f4f8ff" scale={1 - u} outline={0.02} />;
      }) : null}

      {/* 2-3. no hay nube: hay un servidor (y después muchos) */}
      {rack > 0.01 ? (
        <group scale={rack}>
          <Toon kind="cyl" args={[3.2, 3.2, 0.3]} position={[0, -0.15, 0]} color="#d9e0ea" />
          <Rack3D t={t} />
          {[-1, 1, -2, 2].map((d, i) => <Rack3D key={d} t={t} seed={i + 2} position={[d * 1.55 * multi, 0, -0.5 * Math.abs(d) * multi]} s={0.85 * clamp(multi * 2 - i * 0.3)} />)}
        </group>
      ) : null}

      {/* 4. el data center */}
      {dc > 0.01 ? <group position={[0, (1 - drop(t, C.edificios - 0.15)) * 6, 0]}><DataCenter3D t={t} s={dc} fill={ramp(t, C.servidores - 0.2, 1.2)} /></group> : null}

      {/* 5. el mundo */}
      {globe > 0.01 ? <Globe3D t={t} a={C.cientos} s={globe} /> : null}

      {/* 6. los proveedores: construyen, enfrían, protegen, cambian discos */}
      {dc2 > 0.01 ? (
        <group scale={dc2}>
          <DataCenter3D t={t} />
          {/* los 4 trabajos del proveedor, en fila delante del edificio */}
          <group position={[-3.0, 0, 2.6]} scale={0.8 * pop(t, C.construyen - 0.1, 0.4)}><Bricks3D u={ramp(t, C.construyen, 0.8)} /></group>
          <group position={[-1.0, 0.9, 2.6]} scale={0.65 * pop(t, C.enfrian - 0.1, 0.4)}><Snow3D t={t} /></group>
          <group position={[1.0, 0.6, 2.6]} scale={0.8 * pop(t, C.protegen - 0.1, 0.4)}><Padlock3D s={1.1} /></group>
          <group position={[3.0, 0.8, 2.6]} scale={0.8 * pop(t, C.disco - 0.1, 0.4)}><Disk3D t={t} /></group>
        </group>
      ) : null}

      {/* 7-8. vos, sin comprar nada; un servidor que aparece y desaparece */}
      {you > 0.01 ? (
        <group scale={you}>
          <Toon kind="cyl" args={[3.6, 3.6, 0.3]} position={[0, -0.15, 0]} color="#d9e0ea" />
          <Person3D t={t * 0.3} position={[-1.6, 0, 0.6]} s={1.6} face={0.5} />
          {/* el data center que NO comprás: chiquito y tachado */}
          {t < C.necesitas ? (
            <group position={[1.8, 0, -0.4]} scale={0.38 * pop(t, C.vos, 0.4) * (1 - ease(ramp(t, C.necesitas - 0.4, 0.3)))}>
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
          {/* poof cuando lo borrás */}
          {t > C.borras + 0.1 && t < C.borras + 1.1 ? Array.from({ length: 10 }, (_, i) => {
            const u = ease(ramp(t, C.borras + 0.1, 0.9)), a = (i / 10) * Math.PI * 2;
            return <Toon key={i} kind="sphere" args={[0.3]} position={[1.6 + Math.cos(a) * u * 2, 1 + Math.sin(a) * u * 1.4, 0]} color="#f4f8ff" scale={1 - u} outline={0.02} />;
          }) : null}
        </group>
      ) : null}

      {/* 9. el hardware cambia de manos: de tu oficina a la nube del proveedor */}
      {hw > 0.01 ? (
        <group scale={hw}>
          <group position={[-3.3, 0, 0]}>
            <Toon kind="box" args={[3.6, 0.3, 3.2]} position={[0, -0.15, 0]} color="#c8b79a" />
            <Toon kind="box" args={[3.6, 2.6, 0.2]} position={[0, 1.15, -1.5]} color="#e7dcc8" />
          </group>
          <group position={[3.3, 0, 0]} scale={0.75}><CloudIsland t={t} /></group>
          <group position={[lerp(-3.3, 3.3, move), 0.2 + Math.sin(move * Math.PI) * 2.2, 0]}><Rack3D t={t} /></group>
          {/* el técnico del proveedor aparece cuando "se encarga" */}
          <Person3D t={t} position={[4.8, 0.2, 0.6]} s={1.3 * pop(t, C.encarga, 0.4)} color="#ff9900" face={-0.6} />
        </group>
      ) : null}

      {/* 10. responsabilidad compartida: fondo del panel 2D */}
      {fin > 0.01 && t < C.cual ? <group scale={fin * 0.8}><CloudIsland t={t} /><Rack3D t={t} /></group> : null}

      {/* 11. cierre */}
      {close > 0.01 ? (
        <group scale={close}>
          <CloudIsland t={t} s={0.9} />
          <Rack3D t={t} position={[-1.2, 0, 0]} s={0.8} />
          <Rack3D t={t} seed={3} position={[1.2, 0, -0.3]} s={0.8} />
        </group>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- 2D
const PROV = [{ n: "AWS", c: "#ff9900" }, { n: "Azure", c: "#0078d4" }, { n: "Google Cloud", c: "#4285f4" }];

const SharedPanel: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.eso - 0.1 || t > C.cual) return null;
  const s = pop(t, C.eso, 0.45) * (1 - ease(ramp(t, C.cual - 0.25, 0.25)));
  const glow = ramp(t, C.resp, 0.3);
  const col = (title: string, color: string, items: { l: string; at: number }[], hl: number) => (
    <div style={{ flex: 1, background: "#fff", border: `5px solid ${hl ? "#ffd23f" : "#0d0f17"}`, borderRadius: 24, padding: "18px 18px 22px", boxShadow: `0 10px 0 #0d0f17${hl ? ", 0 0 0 10px rgba(255,210,63,0.35)" : ""}` }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 50, color, textAlign: "center", WebkitTextStroke: "2px #0d0f17" }}>{title}</div>
      {items.map((it) => {
        const k = pop(t, it.at, 0.35);
        return (
          <div key={it.l} style={{ marginTop: 14, transform: `scale(${k})`, opacity: clamp(k * 2), background: "#f1f5fb", border: "4px solid #0d0f17", borderRadius: 16, padding: "14px 10px",
            fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 30, color: "#0d0f17", textAlign: "center" }}>{it.l}</div>
        );
      })}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 500, display: "flex", gap: 30, transform: `scale(${s})`, transformOrigin: "50% 30%" }}>
      {col("PROVEEDOR", "#38bdf8", ["Edificio y energía", "Servidores y discos", "Red física"].map((l, i) => ({ l, at: C.eso + 0.2 + i * 0.2 })), 0)}
      {col("VOS", "#ffd23f", [{ l: "Configuración", at: C.configuras }, { l: "Accesos y seguridad", at: C.proteges }, { l: "Tus datos y apps", at: C.armas }], glow)}
    </div>
  );
};

/** costo: corre de "pagás" a "dejás"; más rápido mientras existe el servidor */
const cost = (t: number) => {
  const run = (a: number, b: number, r: number) => Math.max(0, Math.min(t, b) - a) * r;
  return run(C.pagas, C.listo, 0.004) + run(C.listo, C.dejas, 0.031);
};

const SFX: Sfx[] = [
  { at: 0, s: "whoosh_up", v: 0.7 }, { at: 0.05, s: "pop" }, { at: C.fotos, s: "whoosh_up", v: 0.6 }, { at: C.pero, s: "pop" },
  { at: C.spoiler, s: "pop" }, { at: C.spoiler + 0.2, s: "whoosh", v: 1 }, { at: C.ninguna - 0.3, s: "thud", v: 0.8 },
  { at: C.la, s: "pop" }, { at: C.otro, s: "slap" }, { at: C.cualquier, s: "pop", v: 0.7 }, { at: C.cualquier + 0.2, s: "thud", v: 0.5 },
  { at: C.edificios - 0.55, s: "whoosh_down" }, { at: C.edificios + 0.18, s: "thud" }, { at: C.data, s: "slap" },
  { at: C.cientos, s: "whoosh_up", v: 0.7 }, ...[0, 1, 2, 3, 4, 5].map((i): Sfx => ({ at: C.cientos + 0.2 + i * 0.25, s: "pop", v: 0.45 })),
  { at: C.empresas, s: "whoosh", v: 0.8 }, { at: C.aws, s: "slap" }, { at: C.azure, s: "slap" }, { at: C.google, s: "slap" },
  { at: C.construyen, s: "thud", v: 0.6 }, { at: C.enfrian, s: "shield", v: 0.6 }, { at: C.protegen, s: "click" }, { at: C.disco, s: "whoosh", v: 0.7 },
  { at: C.vos - 0.1, s: "pop" }, { at: C.compras, s: "slap" }, { at: C.alquilas, s: "pop" }, { at: C.pagas, s: "coins", v: 0.6 },
  { at: C.necesitas - 0.3, s: "whoosh_down", v: 0.8 }, { at: C.necesitas + 0.1, s: "thud", v: 0.7 }, { at: C.listo, s: "ding" },
  { at: C.borras + 0.1, s: "whoosh", v: 0.9 }, { at: C.dejas, s: "click" },
  { at: C.osea, s: "pop" }, { at: C.cambia, s: "whoosh_up" }, { at: C.cambia + 0.9, s: "thud", v: 0.7 }, { at: C.encarga, s: "pop" },
  { at: C.eso, s: "pop" }, { at: C.configuras, s: "pop", v: 0.7 }, { at: C.proteges, s: "pop", v: 0.7 }, { at: C.armas, s: "pop", v: 0.7 },
  { at: C.resp, s: "ding", v: 0.8 }, { at: C.cual, s: "whoosh_up", v: 0.7 }, { at: C.cual + 0.05, s: "pop" },
];

export const QueEsLaNube3D: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const Y = 250;
  const v = cost(t);
  const running = t >= C.pagas && t < C.dejas;
  return (
    <AbsoluteFill style={{ background: skyBg(0, 0) }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 34, position: [8, 6, 10] }}>
        <Scene t={t} />
      </ThreeCanvas>

      <Title t={t} a={0.05} b={C.pero - 0.1} l1="Mis fotos están" l2="en la nube" y={Y} />
      <Title t={t} a={C.pero} b={C.spoiler - 0.1} l1="¿Pero en" l2="qué nube?" y={Y} />
      <Title t={t} a={C.spoiler} b={C.la - 0.1} l1="Spoiler:" l2="no hay ninguna nube" y={Y} size={88} />
      <Title t={t} a={C.la} b={C.cualquier - 0.1} l1="La nube es" l2="la compu de otro" y={Y} />
      <Sticker t={t} a={C.otro} b={C.son - 0.1} x={720} y={760} text="DE OTRO" rot={-8} size={60} />
      <Title t={t} a={C.cualquier} b={C.son - 0.1} l1="Pero no" l2="cualquier compu" y={Y} />
      <Title t={t} a={C.son} b={C.cientos - 0.1} l1="Edificios enormes" l2="llenos de servidores" y={Y} size={84} />
      <Sticker t={t} a={C.data} b={C.cientos - 0.1} x={540} y={1060} text="DATA CENTER" mono bg="#38bdf8" rot={3} size={56} />
      <Title t={t} a={C.cientos} b={C.empresas - 0.1} l1="Hay cientos" l2="en todo el mundo" y={Y} />
      <Title t={t} a={C.empresas} b={C.vos - 0.1} l1="Ellos se" l2="encargan de todo" y={Y} />
      {PROV.map((p, i) => (
        <Sticker key={p.n} t={t} a={[C.aws, C.azure, C.google][i]} b={C.construyen - 0.1} x={[220, 540, 860][i]} y={1050} text={p.n} bg={p.c} color="#fff" rot={[-5, 3, -3][i]} size={46} />
      ))}
      {["construyen", "enfrían", "protegen", "cambian discos"].map((l, i) => (
        <Sticker key={l} t={t} a={[C.construyen, C.enfrian, C.protegen, C.disco][i]} b={C.vos - 0.1} x={[200, 420, 660, 880][i]} y={[1040, 1080, 1040, 1080][i]} text={l} rot={[-4, 3, -3, 4][i]} size={38} />
      ))}
      <Title t={t} a={C.vos - 0.1} b={C.alquilas - 0.1} l1="Vos no" l2="comprás nada" y={Y} />
      <Title t={t} a={C.alquilas} b={C.necesitas - 0.1} l1="Lo alquilás" l2="y pagás lo que usás" y={Y} size={84} />
      <Title t={t} a={C.necesitas} b={C.necesitas2 - 0.1} l1="¿Un servidor?" l2="listo en minutos" c2="#3dff8a" y={Y} />
      <Title t={t} a={C.necesitas2} b={C.osea - 0.1} l1="¿Ya no?" l2="lo borrás" y={Y} />
      <Hud label="FACTURA" value={`$ ${v.toFixed(3)}`} bar={clamp(v / 0.2)} color={running ? "#3dff8a" : "#aab4c8"} o={clamp(ramp(t, C.alquilas, 0.3) - ramp(t, C.osea, 0.3))} pulse={0} />
      <Title t={t} a={C.osea} b={C.cambia - 0.1} l1="El hardware" l2="sigue existiendo" y={Y} />
      <Title t={t} a={C.cambia} b={C.eso - 0.1} l1="Cambia quién" l2="se encarga" y={Y} />
      <Sticker t={t} a={C.osea + 0.3} b={C.eso - 0.1} x={260} y={1040} text="tu oficina" rot={-4} size={44} />
      <Sticker t={t} a={C.cambia + 0.6} b={C.eso - 0.1} x={820} y={1040} text="el proveedor" bg="#38bdf8" rot={4} size={44} />
      <Title t={t} a={C.eso} b={C.cual - 0.1} l1="Eso sí:" l2="tu parte es tuya" y={Y} />
      <SharedPanel t={t} />
      <Title t={t} a={C.cual} b={END + 1.5} l1="¿Cuál fue tu primer" l2="contacto con la nube?" y={Y} size={84} />

      <WordCaptions words={WORDS} look="pop" y={0.88} size={72} />
      {audio ? <Audio src={staticFile("que-es-la-nube/voice.wav")} /> : null}
      {audio ? <SfxTrack events={SFX} master={0.85} /> : null}
    </AbsoluteFill>
  );
};
