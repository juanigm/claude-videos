// Kit 3D cartoon para los videos del canal: materiales toon (sombras en escalones) + contorno negro
// (técnica "inverted hull": una copia un poco más grande, negra, que solo pinta las caras de atrás).
// Más piezas 2D para encima: títulos grandes, HUD, nota adhesiva.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Audio, continueRender, delayRender, Sequence, staticFile, useVideoConfig } from "remotion";
import "@fontsource/anton/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import { Word } from "../../captions/WordCaptions";

// ---------------------------------------------------------------- tiempo
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const ramp = (t: number, a: number, d = 0.35) => clamp((t - a) / d);
export const ease = (x: number) => 1 - Math.pow(1 - x, 3);
export const back = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2));
export const pop = (t: number, a: number, d = 0.4) => back(ramp(t, a, d));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** caída con rebote: 0 arriba, 1 apoyado */
export const drop = (t: number, a: number, d = 0.55) => {
  const u = clamp((t - a) / d);
  if (u < 0.6) return (u / 0.6) ** 2;
  const v = (u - 0.6) / 0.4;
  return 1 - Math.sin(v * Math.PI) * 0.12 * (1 - v);
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
/** cue("factura", 2) = segundo en que empieza la 2.ª vez que se dice "factura" */
export const makeCue = (words: Word[]) => (key: string, n = 1) => {
  let k = 0;
  for (const w of words) if (norm(w.w) === norm(key) && ++k === n) return w.s;
  throw new Error(`cue no encontrado: ${key} #${n}`);
};

export const useFonts = () => {
  const [h] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    Promise.all([document.fonts.load('400 80px "Anton"'), document.fonts.load('700 40px "JetBrains Mono"'),
      document.fonts.load('600 30px "Inter"'), document.fonts.load('800 30px "Inter"')])
      .then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------------------------------------------------------------- efectos de sonido
// Los wav viven en public/sfx (los genera scripts/audio/sfx_kit.py). s = nombre, at = segundo, v = volumen.
export type SfxName = "whoosh_down" | "whoosh_up" | "whoosh" | "thud" | "pop" | "slap" | "click" | "keys" | "coins" | "cash" |
  "door" | "ding" | "shield" | "hack" | "hack_heavy" | "bots" | "bleep" | "fire" | "safe";
export type Sfx = { at: number; s: SfxName; v?: number };
export const SfxTrack: React.FC<{ events: Sfx[]; master?: number }> = ({ events, master = 1 }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {events.filter((e) => e.at >= 0).map((e, i) => (
        <Sequence key={i} from={Math.round(e.at * fps)} layout="none" name={`sfx ${e.s}`}>
          <Audio src={staticFile(`sfx/${e.s}.wav`)} volume={(e.v ?? 1) * master} />
        </Sequence>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- materiales y contorno
let GRAD: THREE.DataTexture | null = null;
const gradient = () => {
  if (!GRAD) {
    GRAD = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
    GRAD.minFilter = THREE.NearestFilter; GRAD.magFilter = THREE.NearestFilter; GRAD.needsUpdate = true;
  }
  return GRAD;
};

type Kind = "box" | "sphere" | "cyl" | "torus" | "cone";
const Geo: React.FC<{ kind: Kind; args: number[] }> = ({ kind, args }) => {
  if (kind === "box") return <boxGeometry args={args as [number, number, number]} />;
  if (kind === "sphere") return <sphereGeometry args={[args[0], 32, 20]} />;
  if (kind === "cyl") return <cylinderGeometry args={[args[0], args[1], args[2], 32]} />;
  if (kind === "cone") return <coneGeometry args={[args[0], args[1], 32]} />;
  return <torusGeometry args={[args[0], args[1], 16, 40]} />;
};
const hullScale = (kind: Kind, a: number[], o: number): [number, number, number] => {
  if (kind === "box") return [(a[0] + 2 * o) / a[0], (a[1] + 2 * o) / a[1], (a[2] + 2 * o) / a[2]];
  if (kind === "sphere") { const s = (a[0] + o) / a[0]; return [s, s, s]; }
  if (kind === "cyl") { const r = Math.max(a[0], a[1]); const s = (r + o) / r; return [s, (a[2] + 2 * o) / a[2], s]; }
  if (kind === "cone") { const s = (a[0] + o) / a[0]; return [s, (a[1] + 2 * o) / a[1], s]; }
  const s = (a[0] + a[1] + o) / (a[0] + a[1]); return [s, s, (a[1] + o) / a[1]];
};

export type V3 = [number, number, number];
export const Toon: React.FC<{
  kind: Kind; args: number[]; color: string; position?: V3; rotation?: V3; scale?: number | V3;
  outline?: number; glow?: string; glowI?: number; basic?: boolean; opacity?: number;
}> = ({ kind, args, color, position, rotation, scale, outline = 0.035, glow, glowI = 1, basic, opacity = 1 }) => {
  const g = gradient();
  const tr = opacity < 1;
  return (
    <group position={position} rotation={rotation} scale={scale as never}>
      <mesh>
        <Geo kind={kind} args={args} />
        {basic
          ? <meshBasicMaterial color={color} transparent={tr} opacity={opacity} />
          : <meshToonMaterial color={color} gradientMap={g} emissive={glow ?? "#000000"} emissiveIntensity={glow ? glowI : 0} transparent={tr} opacity={opacity} />}
      </mesh>
      {outline > 0 ? (
        <mesh scale={hullScale(kind, args, outline)}>
          <Geo kind={kind} args={args} />
          <meshBasicMaterial color="#0d0f17" side={THREE.BackSide} transparent={tr} opacity={opacity} />
        </mesh>
      ) : null}
    </group>
  );
};

/** cámara: posición y punto al que mira, más un temblor opcional */
export const CamRig: React.FC<{ pos: V3; target: V3; shake?: number; t: number }> = ({ pos, target, shake = 0, t }) => {
  const { camera } = useThree();
  const sx = shake * Math.sin(t * 61) * 0.15, sy = shake * Math.cos(t * 47) * 0.15;
  camera.position.set(pos[0] + sx, pos[1] + sy, pos[2]);
  camera.lookAt(target[0], target[1], target[2]);
  camera.updateProjectionMatrix();
  return null;
};

export const Lights: React.FC<{ night?: number; red?: number }> = ({ night = 0, red = 0 }) => {
  const c = useMemo(() => new THREE.Color(), []);
  c.set("#ffffff").lerp(new THREE.Color("#7f8fff"), night).lerp(new THREE.Color("#ff5a5a"), red);
  return (
    <>
      <ambientLight intensity={0.75 - 0.35 * night} color={c} />
      <directionalLight position={[5, 9, 6]} intensity={1.7 - 0.8 * night} color={c} />
    </>
  );
};

// ---------------------------------------------------------------- piezas
/** la nube-plataforma donde vive todo */
export const CloudIsland: React.FC<{ s?: number; t: number }> = ({ s = 1, t }) => {
  const puffs: [number, number, number, number][] = [[-3.2, -0.5, 0.6, 1.3], [-1.6, -0.7, -1.4, 1.4], [0.6, -0.8, -1.8, 1.5], [2.7, -0.6, -1, 1.3],
    [3.4, -0.5, 0.9, 1.2], [1.4, -0.7, 1.9, 1.4], [-1.1, -0.7, 2, 1.4], [0, -1.1, 0, 2.1]];
  return (
    <group scale={s} position={[0, 0.06 * Math.sin(t * 1.3), 0]}>
      <Toon kind="cyl" args={[4.2, 4.2, 0.5]} position={[0, -0.25, 0]} color="#f4f8ff" />
      {puffs.map(([x, y, z, r], i) => <Toon key={i} kind="sphere" args={[r]} position={[x, y, z]} color={i % 2 ? "#e3ecfb" : "#f4f8ff"} />)}
    </group>
  );
};

/** rack de servidores. state: "ok" (LEDs verdes que titilan), "off", "alert" (rojo) */
export const Rack3D: React.FC<{ t: number; position?: V3; rotation?: V3; s?: number; state?: "ok" | "alert" | "off"; seed?: number; body?: string }> =
  ({ t, position, rotation, s = 1, state = "ok", seed = 0, body = "#4a5873" }) => (
    <group position={position} rotation={rotation} scale={s}>
      <Toon kind="box" args={[1.3, 2.2, 1.1]} position={[0, 1.1, 0]} color={body} />
      {Array.from({ length: 5 }, (_, i) => {
        const on = state !== "off" && Math.sin(t * (4 + rnd(i + seed * 7) * 6) + i * 2 + seed) > -0.3;
        const led = state === "alert" ? "#ff3b3b" : "#3dff8a";
        return (
          <group key={i} position={[0, 0.4 + i * 0.38, 0.56]}>
            <Toon kind="box" args={[1.05, 0.26, 0.08]} color="#26314a" outline={0.02} />
            <Toon kind="box" args={[0.09, 0.09, 0.04]} position={[-0.38, 0, 0.06]} color={on ? led : "#1d2a24"} glow={on ? led : undefined} glowI={1.4} outline={0} />
            <Toon kind="box" args={[0.09, 0.09, 0.04]} position={[-0.24, 0, 0.06]} color={on && i % 2 ? "#5cc8ff" : "#1b2a36"} glow={on && i % 2 ? "#5cc8ff" : undefined} outline={0} />
            <Toon kind="box" args={[0.42, 0.06, 0.03]} position={[0.22, 0, 0.06]} color="#6b7a99" outline={0} />
          </group>
        );
      })}
    </group>
  );

/** usuario cartoon (cuerpo + cabeza) */
export const Person3D: React.FC<{ position?: V3; color?: string; s?: number; t: number; seed?: number; face?: number }> = ({ position, color = "#ffd166", s = 1, t, seed = 0, face = 0 }) => (
  <group position={position} scale={s} rotation={[0, face, 0]}>
    <group position={[0, Math.abs(Math.sin(t * 9 + seed)) * 0.12, 0]}>
      <Toon kind="cyl" args={[0.22, 0.3, 0.6]} position={[0, 0.3, 0]} color={color} />
      <Toon kind="sphere" args={[0.24]} position={[0, 0.85, 0]} color="#ffe0bd" />
    </group>
  </group>
);

/** fuego + humo saliendo de un punto */
export const Fire: React.FC<{ t: number; a: number; on: number; position?: V3; n?: number; size?: number }> = ({ t, a, on, position, n = 22, size = 1 }) => {
  if (on <= 0) return null;
  return (
    <group position={position} scale={size}>
      {Array.from({ length: n }, (_, i) => {
        const life = ((t - a) * (0.9 + rnd(i) * 0.6) + rnd(i + 5)) % 1;
        const x = (rnd(i + 2) - 0.5) * 0.9 * (1 - life * 0.5), z = (rnd(i + 3) - 0.5) * 0.6;
        const smoke = i % 3 === 0;
        const r = (smoke ? 0.32 : 0.22) * (smoke ? 0.5 + life : 1 - life * 0.7) * on;
        return <Toon key={i} kind="sphere" args={[Math.max(0.01, r)]} position={[x, life * (smoke ? 2.6 : 1.6), z]}
          color={smoke ? "#59606e" : life < 0.35 ? "#fff3a3" : life < 0.7 ? "#ffb02e" : "#ff5a1f"} basic={!smoke} outline={smoke ? 0.02 : 0} opacity={smoke ? 0.85 * (1 - life) : 1} />;
      })}
    </group>
  );
};

/** hacker encapuchado con ojos que brillan y una laptop */
export const Hacker3D: React.FC<{ position?: V3; s?: number; t: number }> = ({ position, s = 1, t }) => (
  <group position={position} scale={s}>
    <Toon kind="cyl" args={[0.55, 0.9, 1.6]} position={[0, 0.8, 0]} color="#22232e" />
    <Toon kind="sphere" args={[0.62]} position={[0, 2.0, 0]} color="#22232e" />
    <Toon kind="cone" args={[0.45, 0.7]} position={[0, 2.6, -0.15]} rotation={[-0.4, 0, 0]} color="#22232e" />
    <Toon kind="sphere" args={[0.43]} position={[0, 1.98, 0.3]} color="#07080c" outline={0} />
    {[-0.15, 0.15].map((x) => <Toon key={x} kind="sphere" args={[0.075]} position={[x, 2.03 + 0.02 * Math.sin(t * 7), 0.68]} color="#ff2d2d" basic outline={0} />)}
    <group position={[0, 1.2, 0.75]} rotation={[0.25, 0, 0]}>
      <Toon kind="box" args={[1.0, 0.06, 0.6]} color="#9aa6bd" />
      <Toon kind="box" args={[1.0, 0.62, 0.05]} position={[0, 0.3, -0.3]} rotation={[-0.25, 0, 0]} color="#9aa6bd" />
      <Toon kind="box" args={[0.86, 0.48, 0.02]} position={[0, 0.3, -0.27]} rotation={[-0.25, 0, 0]} color="#39ff7a" glow="#39ff7a" outline={0} />
    </group>
  </group>
);

export const Padlock3D: React.FC<{ position?: V3; s?: number; open?: number }> = ({ position, s = 1, open = 0 }) => (
  <group position={position} scale={s}>
    <Toon kind="box" args={[0.9, 0.75, 0.35]} color="#ffc93c" />
    <Toon kind="torus" args={[0.3, 0.08]} position={[0, 0.42 + 0.25 * open, 0]} color="#c9d3e3" />
    <Toon kind="cyl" args={[0.08, 0.08, 0.1]} position={[0, -0.02, 0.18]} rotation={[Math.PI / 2, 0, 0]} color="#3a2a00" outline={0} />
  </group>
);

export const Key3D: React.FC<{ position?: V3; rotation?: V3; s?: number }> = ({ position, rotation, s = 1 }) => (
  <group position={position} rotation={rotation} scale={s}>
    <Toon kind="torus" args={[0.22, 0.08]} position={[-0.55, 0, 0]} color="#ffc93c" />
    <Toon kind="box" args={[0.8, 0.12, 0.1]} position={[0.05, 0, 0]} color="#ffc93c" />
    <Toon kind="box" args={[0.1, 0.22, 0.1]} position={[0.35, -0.12, 0]} color="#ffc93c" outline={0.02} />
    <Toon kind="box" args={[0.1, 0.16, 0.1]} position={[0.18, -0.1, 0]} color="#ffc93c" outline={0.02} />
  </group>
);

export const Coin3D: React.FC<{ position?: V3; rotation?: V3; s?: number }> = ({ position, rotation, s = 1 }) => (
  <group position={position} rotation={rotation} scale={s}>
    <Toon kind="cyl" args={[0.28, 0.28, 0.07]} rotation={[Math.PI / 2, 0, 0]} color="#ffcf3a" />
  </group>
);

/** la factura: un papel largo con renglones */
export const Bill3D: React.FC<{ position?: V3; rotation?: V3; s?: number }> = ({ position, rotation, s = 1 }) => (
  <group position={position} rotation={rotation} scale={s}>
    <Toon kind="box" args={[1.6, 2.4, 0.04]} color="#fbfbf5" />
    <Toon kind="box" args={[1.2, 0.2, 0.02]} position={[0, 0.9, 0.03]} color="#ff9900" outline={0} />
    {Array.from({ length: 6 }, (_, i) => <Toon key={i} kind="box" args={[i === 5 ? 0.6 : 1.2, 0.06, 0.02]} position={[i === 5 ? 0.3 : 0, 0.5 - i * 0.22, 0.03]} color={i === 5 ? "#e11d48" : "#b8bfcc"} outline={0} />)}
  </group>
);

/** base de datos: discos apilados */
export const Database3D: React.FC<{ position?: V3; s?: number; t: number; alert?: boolean }> = ({ position, s = 1, t, alert }) => (
  <group position={position} scale={s}>
    {[0, 1, 2].map((i) => (
      <group key={i} position={[0, 0.35 + i * 0.62, 0]}>
        <Toon kind="cyl" args={[0.75, 0.75, 0.5]} color={alert ? "#c2414f" : "#3b82f6"} />
        <Toon kind="cyl" args={[0.76, 0.76, 0.06]} position={[0, 0.27, 0]} color="#bfdbfe" outline={0.015} />
        <Toon kind="box" args={[0.1, 0.1, 0.04]} position={[0.45, 0, 0.6]} rotation={[0, 0.6, 0]} color="#3dff8a" glow={Math.sin(t * 5 + i) > 0 ? "#3dff8a" : undefined} outline={0} />
      </group>
    ))}
  </group>
);

/** el bucket: un balde con fotos asomando */
export const Bucket3D: React.FC<{ position?: V3; s?: number; t: number; photos?: number; lid?: number }> = ({ position, s = 1, t, photos = 1, lid = 0 }) => (
  <group position={position} scale={s}>
    <Toon kind="cyl" args={[0.85, 0.62, 1.2]} position={[0, 0.6, 0]} color="#14b8a6" />
    <Toon kind="cyl" args={[0.8, 0.8, 0.02]} position={[0, 1.2, 0]} color="#0d3b37" outline={0} />
    <Toon kind="torus" args={[0.86, 0.05]} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]} color="#5eead4" outline={0.015} />
    <group position={[0, 1.2, 0]} rotation={[0, 0, 0]}>
      <Toon kind="torus" args={[0.7, 0.04]} position={[0, 0.05, 0]} rotation={[0, 0, 0]} color="#9aa6bd" outline={0.01} />
    </group>
    {photos > 0 ? [0, 1, 2, 3].map((i) => (
      <Toon key={i} kind="box" args={[0.42, 0.5, 0.04]} position={[-0.36 + i * 0.24, 1.25 + 0.12 * Math.sin(t * 2 + i), (i % 2) * 0.15 - 0.1]} rotation={[0.2, 0, (i - 1.5) * 0.25]}
        color={["#fde68a", "#f9a8d4", "#a5f3fc", "#fecaca"][i]} scale={photos} outline={0.02} />
    )) : null}
    {lid > 0 ? (
      <group position={[0, 1.25 + (1 - lid) * 2.5, 0]}>
        <Toon kind="cyl" args={[0.92, 0.92, 0.14]} color="#0f766e" />
        <Toon kind="box" args={[0.3, 0.12, 0.3]} position={[0, 0.13, 0]} color="#0f766e" />
      </group>
    ) : null}
  </group>
);

/** caja fuerte de secretos */
export const Safe3D: React.FC<{ position?: V3; s?: number; glow?: number }> = ({ position, s = 1, glow = 0 }) => (
  <group position={position} scale={s}>
    <Toon kind="box" args={[1.2, 1.2, 1.0]} position={[0, 0.6, 0]} color="#64748b" />
    <Toon kind="box" args={[0.95, 0.95, 0.06]} position={[0, 0.6, 0.52]} color="#94a3b8" outline={0.02} />
    <Toon kind="cyl" args={[0.2, 0.2, 0.08]} position={[0.1, 0.6, 0.58]} rotation={[Math.PI / 2, 0, 0]} color={glow > 0.5 ? "#3dff8a" : "#e2e8f0"} glow={glow > 0.5 ? "#3dff8a" : undefined} />
    <Toon kind="box" args={[0.06, 0.3, 0.08]} position={[-0.3, 0.6, 0.58]} color="#e2e8f0" outline={0.01} />
  </group>
);

/** tarjeta de crédito */
export const Card3D: React.FC<{ position?: V3; rotation?: V3; s?: number }> = ({ position, rotation, s = 1 }) => (
  <group position={position} rotation={rotation} scale={s}>
    <Toon kind="box" args={[1.4, 0.88, 0.05]} color="#7c3aed" />
    <Toon kind="box" args={[0.28, 0.22, 0.02]} position={[-0.38, 0.08, 0.035]} color="#fbbf24" outline={0.01} />
    <Toon kind="box" args={[1.0, 0.08, 0.02]} position={[0, -0.24, 0.035]} color="#ddd6fe" outline={0} />
  </group>
);

// ---------------------------------------------------------------- 2D
export const SKY = { day: ["#7cc4ff", "#e3f3ff"], night: ["#0a1430", "#26356b"], red: ["#3a0a12", "#7a1a24"] };
const mix = (a: string, b: string, u: number) => {
  const c = new THREE.Color(a).lerp(new THREE.Color(b), clamp(u));
  return `#${c.getHexString()}`;
};
export const skyBg = (night: number, red: number) => {
  const top = mix(mix(SKY.day[0], SKY.night[0], night), SKY.red[0], red);
  const bot = mix(mix(SKY.day[1], SKY.night[1], night), SKY.red[1], red);
  return `linear-gradient(180deg, ${top} 0%, ${bot} 100%)`;
};

/** título grande en dos líneas: blanco arriba, amarillo abajo, contorno negro grueso */
export const Title: React.FC<{ t: number; a: number; b: number; l1: string; l2?: string; y?: number; size?: number; shake?: number; c2?: string }> =
  ({ t, a, b, l1, l2, y = 150, size = 92, shake = 0, c2 = "#ffd23f" }) => {
    if (t < a - 0.05 || t > b) return null;
    const s = pop(t, a, 0.32) * (1 - ease(ramp(t, b - 0.18, 0.18)));
    const dx = shake * Math.sin(t * 70) * 10, dy = shake * Math.cos(t * 53) * 8;
    const st: React.CSSProperties = { fontFamily: "Anton, sans-serif", fontSize: size, lineHeight: 1.04, letterSpacing: 1, textTransform: "uppercase", WebkitTextStroke: `${size * 0.16}px #0d0f17`, paintOrder: "stroke fill", textShadow: `0 ${size * 0.08}px 0 #0d0f17` };
    return (
      <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(${-2 * Math.sin(a * 3)}deg)`, transformOrigin: "50% 0%" }}>
        <div style={{ ...st, color: "#ffffff" }}>{l1}</div>
        {l2 ? <div style={{ ...st, color: c2 }}>{l2}</div> : null}
      </div>
    );
  };

/** HUD arriba a la derecha: etiqueta + valor + barra */
export const Hud: React.FC<{ label: string; value: string; bar: number; color: string; o?: number; pulse?: number; top?: number }> = ({ label, value, bar, color, o = 1, pulse = 0, top = 40 }) => (
  <div style={{ position: "absolute", right: 40, top, width: 400, opacity: o, transform: `scale(${1 + 0.08 * pulse})`, transformOrigin: "100% 0%",
    background: "rgba(13,15,23,0.86)", border: `5px solid ${color}`, borderRadius: 24, padding: "14px 22px 18px", boxShadow: "0 8px 0 #0d0f17" }}>
    <div style={{ fontFamily: "Anton, sans-serif", fontSize: 30, color: "#aab4c8", letterSpacing: 2 }}>{label}</div>
    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 46, color, lineHeight: 1.1, whiteSpace: "nowrap" }}>{value}</div>
    <div style={{ marginTop: 10, height: 16, borderRadius: 8, background: "#2a3042" }}>
      <div style={{ width: `${clamp(bar) * 100}%`, height: "100%", borderRadius: 8, background: color }} />
    </div>
  </div>
);

/** contador del chiste recurrente ("HACKEOS: 3"), arriba a la izquierda; salta cada vez que sube */
export const Counter: React.FC<{ label: string; n: number; t: number; lastAt: number; o?: number; color?: string; top?: number }> = ({ label, n, t, lastAt, o = 1, color = "#ff4d5e", top = 40 }) => {
  const bump = 1 + 0.35 * (1 - ease(ramp(t, lastAt, 0.4))) * (t >= lastAt ? 1 : 0);
  return (
    <div style={{ position: "absolute", left: 40, top, opacity: o, background: "rgba(13,15,23,0.86)", border: `5px solid ${color}`, borderRadius: 24,
      padding: "14px 26px 16px", boxShadow: "0 8px 0 #0d0f17", display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 36, color: "#aab4c8", letterSpacing: 2 }}>{label}</div>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 76, lineHeight: 1, color, transform: `scale(${bump})` }}>{n}</div>
    </div>
  );
};

/** franjas de glitch sobre toda la pantalla */
export const Glitch: React.FC<{ t: number; on: boolean; h?: number }> = ({ t, on, h = 1350 }) => {
  if (!on || Math.sin(t * 37) < 0.2) return null;
  const k = Math.floor(t * 12);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: (rnd(k + i) * h) | 0, height: 10 + rnd(i + k) * 40,
          background: i % 2 ? "rgba(255,40,60,0.35)" : "rgba(40,255,200,0.25)", transform: `translateX(${(rnd(i * 3 + k) - 0.5) * 80}px)` }} />
      ))}
    </div>
  );
};

/** interpola una lista de "tomas" de cámara: cada una entra suavemente desde la anterior */
export type Shot = { at: number; target: V3; r: number; h: number; ang: number };
export const shotAt = (shots: Shot[], t: number, d = 0.9) => {
  let v = { ...shots[0] };
  for (const k of shots.slice(1)) {
    const u = ease(ramp(t, k.at, d));
    if (u <= 0) break;
    v = { at: k.at, target: [lerp(v.target[0], k.target[0], u), lerp(v.target[1], k.target[1], u), lerp(v.target[2], k.target[2], u)],
      r: lerp(v.r, k.r, u), h: lerp(v.h, k.h, u), ang: lerp(v.ang, k.ang, u) };
  }
  return v;
};

/** posiciones para cada formato. Vertical (Reels/TikTok/Shorts): la interfaz tapa ~220 px arriba, ~420 px abajo
 *  y ~150 px a la derecha en la mitad de abajo, así que todo se corre hacia el centro. */
export const layoutFor = (height: number) => {
  const v = height > 1600;
  return {
    v,
    fov: v ? 44 : 34,          // con 44° en 9:16 se ve el mismo ancho de escena que con 34° en 4:5
    hudTop: v ? 230 : 40,
    titleY: v ? 420 : 250,
    stickerY: v ? 1290 : 1000, // fila de carteles debajo de la escena
    capY: v ? 0.735 : 0.88,    // captions (fracción del alto)
    camLift: v ? 1.15 : 0.8,    // cuánto más arriba del objeto mira la cámara (más = objeto más abajo en pantalla)
  };
};

/** cartelito tipo nota adhesiva o etiqueta */
export const Sticker: React.FC<{ t: number; a: number; b: number; x: number; y: number; text: string; bg?: string; color?: string; rot?: number; size?: number; mono?: boolean }> =
  ({ t, a, b, x, y, text, bg = "#ffe45c", color = "#0d0f17", rot = -6, size = 54, mono }) => {
    if (t < a - 0.05 || t > b) return null;
    const s = pop(t, a, 0.35) * (1 - ease(ramp(t, b - 0.15, 0.15)));
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${s})`, background: bg, color, border: "5px solid #0d0f17",
        borderRadius: 14, padding: "12px 26px", boxShadow: "0 8px 0 #0d0f17", fontFamily: mono ? '"JetBrains Mono", monospace' : "Anton, sans-serif", fontWeight: 700, fontSize: size, whiteSpace: "nowrap" }}>{text}</div>
    );
  };
