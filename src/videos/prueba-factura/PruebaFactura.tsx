// Prueba A: "La factura". 3D cartoon, 1080 x 1350. Cada evento atado a una palabra de la voz.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/prueba-factura/voice/words.json";
import {
  Bill3D, CamRig, CloudIsland, Coin3D, Fire, Hud, Lights, Person3D, Rack3D, Title, V3,
  clamp, drop, ease, lerp, makeCue, pop, ramp, rnd, skyBg, useFonts,
} from "../_cartoon3d/kit";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const C = {
  nube: cue("nube"), paso: cue("paso"), servidor: cue("servidor"), llegan: cue("llegan"), cae: cue("cae"),
  solucion: cue("solución"), diez: cue("diez"), anda: cue("anda"), pero: cue("pero"), factura: cue("factura"),
  factura2: cue("factura", 2), usa: cue("usá"), apague: cue("apague"),
};
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 1.3) * FPS);

const GRID: V3[] = [[-2.4, 0, -1.7], [-0.8, 0, -1.7], [0.8, 0, -1.7], [2.4, 0, -1.7], [-2.2, 0, 0], [2.2, 0, 0],
  [-2.4, 0, 1.7], [-0.8, 0, 1.7], [0.8, 0, 1.7], [2.4, 0, 1.7]];
const KEEP = [4, 5]; // los que quedan prendidos con autoescalado

/** costo acumulado: 1 servidor, después 11, el fin de semana el tiempo vuela */
const cost = (t: number) => {
  const run = (a: number, b: number, r: number) => Math.max(0, Math.min(t, b) - a) * r;
  return run(C.servidor, C.diez, 0.4) + run(C.diez, C.pero, 4.4) + run(C.pero, C.factura, 420) + run(C.factura, C.usa, 9) + run(C.usa, 99, 0.8);
};

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const night = ramp(t, C.pero, 0.6) * (1 - ramp(t, C.usa, 0.6));
  const shake = (ramp(t, C.cae, 0.05) - ramp(t, C.cae + 0.5, 0.3)) + (ramp(t, C.factura, 0.05) - ramp(t, C.factura + 0.8, 0.4));
  const wide = ease(ramp(t, C.diez - 0.2, 0.9)) * (1 - 0.4 * ease(ramp(t, C.usa, 0.9)));
  const ang = 0.55 + 0.035 * t;
  const r = lerp(lerp(15, 11, ease(ramp(t, 0, 1.6))), 15.5, wide), h = lerp(6, 8.5, wide);
  const fallen = t >= C.cae && t < C.solucion;
  const fire = clamp(ramp(t, C.cae, 0.2) - ramp(t, C.solucion, 0.3));
  const mainDrop = drop(t, C.servidor - 0.25);
  return (
    <>
      <CamRig pos={[Math.sin(ang) * r, h, Math.cos(ang) * r]} target={[0, 1, 0]} shake={shake} t={t} />
      <Lights night={night} red={0.4 * fire} />
      <group scale={pop(t, 0, 0.6)}><CloudIsland t={t} /></group>

      {/* el servidor principal: cae del cielo, se cae con los usuarios, se arregla */}
      {t > C.servidor - 0.3 ? (
        <group position={[0, (1 - mainDrop) * 9, 0]} rotation={[0, 0, fallen ? -0.22 * ease(ramp(t, C.cae, 0.25)) : 0]}>
          <Rack3D t={t} s={lerp(1, 0.8, wide > 0 ? 1 : 0)} state={fallen ? "alert" : "ok"} />
          <Fire t={t} a={C.cae} on={fire} position={[0, 2.2, 0]} />
        </group>
      ) : null}

      {/* usuarios que llegan corriendo */}
      {t > C.llegan - 0.2 && t < C.solucion + 0.5 ? Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + rnd(i) * 0.4;
        const u = ease(ramp(t, C.llegan + rnd(i + 4) * 0.5, 1.4));
        const rr = lerp(4.2, 1.6 + rnd(i + 8) * 0.5, u);
        const s = pop(t, C.llegan + rnd(i + 4) * 0.5, 0.3) * (1 - ramp(t, C.solucion, 0.4));
        return <Person3D key={i} t={fallen ? t * 1.6 : t} seed={i} s={s * 0.9} position={[Math.cos(a) * rr, 0, Math.sin(a) * rr]} face={-a - Math.PI / 2} color={["#ffd166", "#ff8fab", "#7bdff2", "#b2f7ef"][i % 4]} />;
      }) : null}

      {/* los 10 servidores más */}
      {GRID.map((p, i) => {
        const s = pop(t, C.diez + i * 0.07, 0.35);
        const keep = KEEP.includes(i);
        const off = keep ? 1 : 1 - ease(ramp(t, C.apague + (i % 4) * 0.08, 0.35));
        return s > 0 && off > 0 ? <Rack3D key={i} t={t} seed={i + 1} position={p} s={0.8 * s * off} /> : null;
      })}

      {/* la factura y la lluvia de monedas */}
      {t > C.factura - 0.1 ? (
        <group position={[0, lerp(10, 2.4, drop(t, C.factura - 0.1, 0.6)), 2.6]} rotation={[-0.25, 0.4 + 0.15 * Math.sin(t * 2), 0.05 * Math.sin(t * 3)]}
          scale={1.4 * (1 - ease(ramp(t, C.usa, 0.4)))}>
          <Bill3D />
        </group>
      ) : null}
      {t > C.factura && t < C.usa + 1 ? Array.from({ length: 26 }, (_, i) => {
        const y = 9 - ((t - C.factura) * (3 + rnd(i) * 3) + rnd(i + 3) * 6) % 9;
        return <Coin3D key={i} position={[(rnd(i + 1) - 0.5) * 9, y, (rnd(i + 2) - 0.5) * 7]} rotation={[t * 3 + i, t * 2, 0]} s={1 - ramp(t, C.usa, 0.5)} />;
      }) : null}
    </>
  );
};

export const PruebaFactura: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const night = ramp(t, C.pero, 0.6) * (1 - ramp(t, C.usa, 0.6));
  const v = cost(t);
  const alarm = t >= C.factura && t < C.usa;
  const col = alarm ? "#ff4d5e" : t >= C.pero && t < C.usa ? "#ffd23f" : "#3dff8a";
  return (
    <AbsoluteFill style={{ background: skyBg(night, alarm ? 0.35 : 0) }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 34, position: [8, 6, 10] }}>
        <Scene t={t} />
      </ThreeCanvas>
      <Hud label="FACTURA DEL MES" value={`$ ${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} bar={clamp(v / 1200)} color={col}
        o={ramp(t, C.servidor, 0.3)} pulse={alarm ? Math.abs(Math.sin(t * 9)) : 0} />
      <Title t={t} a={0.1} b={C.paso - 0.05} l1="Levantamos una app" l2="en la nube" y={210} />
      <Title t={t} a={C.paso} b={C.llegan - 0.1} l1="Paso 1:" l2="un servidor" y={210} />
      <Title t={t} a={C.llegan} b={C.cae - 0.05} l1="Llegan" l2="los usuarios" y={210} />
      <Title t={t} a={C.cae} b={C.solucion - 0.1} l1="Se cayó" y={210} size={130} shake={1} />
      <Title t={t} a={C.solucion} b={C.anda - 0.1} l1="Solución:" l2="+10 servidores" y={210} />
      <Title t={t} a={C.anda} b={C.pero - 0.1} l1="Anda" l2="perfecto" c2="#3dff8a" y={210} />
      <Title t={t} a={C.pero} b={C.factura - 0.1} l1="Fin de semana" l2="0 usuarios" y={210} />
      <Title t={t} a={C.factura} b={C.usa - 0.1} l1="La factura," l2="bro" c2="#ff4d5e" y={210} size={110} shake={0.6} />
      <Title t={t} a={C.usa} b={END + 1.3} l1="Autoescalado" l2="apagá lo que no usás" y={210} size={80} />
      <WordCaptions words={WORDS} look="pop" y={0.86} size={74} />
      {audio ? <Audio src={staticFile("prueba-factura/voice.wav")} /> : null}
    </AbsoluteFill>
  );
};
