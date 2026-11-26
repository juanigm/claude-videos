// Prueba B: "Y te hackean, bro". 3D cartoon, 1080 x 1350. Cada evento atado a una palabra de la voz.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/prueba-hackeo/voice/words.json";
import {
  CamRig, CloudIsland, Hacker3D, Hud, Key3D, Lights, Padlock3D, Rack3D, Sticker, Title, Toon,
  clamp, drop, ease, lerp, makeCue, pop, ramp, rnd, skyBg, useFonts,
} from "../_cartoon3d/kit";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const C = {
  paso: cue("paso"), servidor: cue("servidor"), para: cue("para"), abrimos: cue("abrimos"), veintidos: cue("veintidós"),
  internet: cue("internet"), contrasena: cue("contraseña"), admin: cue("admin"), anda: cue("anda"), y: cue("y", 1),
  hackean: cue("hackean"), cerra: cue("cerrá"), llaves: cue("llaves"),
};
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.3) * FPS);

const security = (t: number) => {
  if (t < C.abrimos) return 100;
  if (t < C.admin) return lerp(100, 55, ease(ramp(t, C.abrimos, 0.6)));
  if (t < C.y) return lerp(55, 15, ease(ramp(t, C.admin, 0.6)));
  if (t < C.cerra) return lerp(15, 0, ease(ramp(t, C.y, 0.3)));
  if (t < C.llaves) return lerp(0, 60, ease(ramp(t, C.cerra, 0.6)));
  return lerp(60, 100, ease(ramp(t, C.llaves, 0.8)));
};

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const hacked = clamp(ramp(t, C.y, 0.25) - ramp(t, C.cerra, 0.5));
  const ang = 0.6 + 0.03 * t;
  const close = ease(ramp(t, C.abrimos, 0.8)) * (1 - ease(ramp(t, C.contrasena, 0.8)));
  const r = lerp(lerp(15, 11, ease(ramp(t, 0, 1.6))), 8.5, close) + 2.5 * hacked, h = 6 + 1.5 * hacked;
  const shake = ramp(t, C.y, 0.05) - ramp(t, C.y + 0.9, 0.4);
  const door = ease(ramp(t, C.abrimos, 0.5)) * (1 - ease(ramp(t, C.cerra, 0.4)));
  const lock = pop(t, C.cerra + 0.3, 0.45);
  const keyU = ease(ramp(t, C.llaves - 0.1, 0.9));
  const hk = ease(ramp(t, C.y - 0.1, 0.5)) * (1 - ease(ramp(t, C.cerra, 0.5)));
  const mainDrop = drop(t, C.servidor - 0.25);
  return (
    <>
      <CamRig pos={[Math.sin(ang) * r, h, Math.cos(ang) * r]} target={[0, 1.2, 0]} shake={shake} t={t} />
      <Lights red={hacked} />
      <group scale={pop(t, 0, 0.6)}><CloudIsland t={t} /></group>

      {t > C.servidor - 0.3 ? (
        <group position={[0, (1 - mainDrop) * 9, 0]}>
          <Rack3D t={t} state={hacked > 0.5 ? "alert" : "ok"} />
          {/* el puerto 22: un agujero rojo en el costado y su puerta */}
          <Toon kind="box" args={[0.03, 0.62, 0.46]} position={[0.66, 1.15, 0]} color="#ff2d2d" glow="#ff2d2d" glowI={1.5 * door} outline={0} />
          <group position={[0.68, 1.15, 0.25]} rotation={[0, door * 1.7, 0]}>
            <Toon kind="box" args={[0.05, 0.66, 0.5]} position={[0, 0, -0.25]} color="#7c8aa6" outline={0.02} />
          </group>
          <group position={[0.85, 1.15, 0]} rotation={[0, Math.PI / 2, 0]}>
            <Padlock3D s={0.55 * lock} open={1 - ease(ramp(t, C.llaves + 0.7, 0.3))} />
          </group>
        </group>
      ) : null}

      {/* bots de internet que se acercan */}
      {t > C.internet - 0.1 && t < C.cerra + 0.6 ? Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * (1.05 + (i / 8) * 1.1); // solo del lado de atrás: no tapan la cámara
        const rr = lerp(7, 3.0, ease(ramp(t, C.internet, C.y - C.internet)));
        const s = pop(t, C.internet + i * 0.04, 0.3) * (1 - ramp(t, C.cerra, 0.4));
        return (
          <group key={i} position={[Math.cos(a + 0.6) * rr, 1.4 + 0.3 * Math.sin(t * 3 + i) + rnd(i) * 1.2, Math.sin(a + 0.6) * rr]} scale={s * 0.6}>
            <Toon kind="sphere" args={[0.32]} color="#e23b4a" />
            <Toon kind="box" args={[0.36, 0.1, 0.05]} position={[0, 0.06, 0.3]} rotation={[0, 0, 0]} color="#ffef5c" basic outline={0} />
          </group>
        );
      }) : null}

      {/* el hacker aparece atrás del servidor */}
      {hk > 0 ? <Hacker3D t={t} position={[-1.9, lerp(-4, 0, hk), -1.2]} s={1.35} /> : null}

      {/* la llave entra al candado */}
      {t > C.llaves - 0.2 ? (
        <Key3D position={[lerp(4.5, 1.35, keyU), 1.15 + (1 - keyU) * 2.5, 0]} rotation={[keyU > 0.95 ? ease(ramp(t, C.llaves + 0.9, 0.3)) * 1.5 : t * 5, 0, Math.PI]} s={0.7 * (1 - ramp(t, C.llaves + 1.4, 0.3))} />
      ) : null}
    </>
  );
};

export const PruebaHackeo: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const hacked = clamp(ramp(t, C.y, 0.25) - ramp(t, C.cerra, 0.5));
  const s = security(t);
  const col = s > 70 ? "#3dff8a" : s > 30 ? "#ffd23f" : "#ff4d5e";
  // glitch: franjas desplazadas mientras dura el hackeo
  const glitch = hacked > 0.5 && Math.sin(t * 37) > 0.2;
  return (
    <AbsoluteFill style={{ background: skyBg(0.25 * hacked, hacked) }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 34, position: [8, 6, 10] }}>
        <Scene t={t} />
      </ThreeCanvas>
      {glitch ? (
        <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
          {Array.from({ length: 5 }, (_, i) => {
            const y = (rnd(Math.floor(t * 12) + i) * 1350) | 0;
            return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 10 + rnd(i + Math.floor(t * 12)) * 40, background: i % 2 ? "rgba(255,40,60,0.35)" : "rgba(40,255,200,0.25)", transform: `translateX(${(rnd(i * 3 + Math.floor(t * 12)) - 0.5) * 80}px)` }} />;
          })}
        </AbsoluteFill>
      ) : null}
      <Hud label="SEGURIDAD" value={hacked > 0.5 ? "HACKEADO" : `${Math.round(s)} %`} bar={s / 100} color={col} o={ramp(t, C.servidor, 0.3)} pulse={hacked} />
      <Title t={t} a={0.1} b={C.paso - 0.05} l1="Levantamos una app" l2="en la nube" y={210} />
      <Title t={t} a={C.paso} b={C.para - 0.1} l1="Paso 1:" l2="un servidor" y={210} />
      <Title t={t} a={C.para} b={C.contrasena - 0.1} l1="Puerto 22" l2="abierto al mundo" y={210} />
      <Sticker t={t} a={C.internet} b={C.contrasena - 0.1} x={540} y={1010} text="0.0.0.0/0" mono bg="#ff4d5e" color="#fff" rot={4} />
      <Title t={t} a={C.contrasena} b={C.anda - 0.1} l1="Contraseña" l2="súper segura" y={210} />
      <Sticker t={t} a={C.admin} b={C.anda - 0.1} x={540} y={1010} text="admin123" mono rot={-5} size={64} />
      <Title t={t} a={C.anda} b={C.y - 0.05} l1="Anda" l2="perfecto" c2="#3dff8a" y={210} />
      <Title t={t} a={C.y} b={C.cerra - 0.1} l1="Y te hackean," l2="bro" c2="#ff4d5e" y={210} size={110} shake={glitch ? 1 : 0.4} />
      <Title t={t} a={C.cerra} b={C.llaves - 0.1} l1="Cerrá" l2="el puerto 22" y={210} />
      <Title t={t} a={C.llaves} b={END + 1.3} l1="Llaves," l2="no contraseñas" y={210} />
      <WordCaptions words={WORDS} look="pop" y={0.86} size={74} />
      {audio ? <Audio src={staticFile("prueba-hackeo/voice.wav")} /> : null}
    </AbsoluteFill>
  );
};
