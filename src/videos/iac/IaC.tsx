// "Infraestructura como código, problema por problema" — estilo 2D premium, 9:16, todas las redes.
// 13 escenas con transiciones. Cada evento está atado a una palabra de la voz (words.json): una voz nueva solo pide
// volver a transcribir. SFX: biblioteca v2 (public/sfx2, scripts/audio/sfx_kit2.py) + cama musical con ducking.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/iac/voice/words.json";
import { Sticker, Title, clamp, ease, lerp, makeCue, pop, ramp, rnd, useFonts } from "../_cartoon3d/kit";
import { Defs, PAL, Stars, sceneT } from "../_premium2d/art";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);
const cue = makeCue(WORDS);
const C = {
  infra: cue("infraestructura"), vamos: cue("vamos"), tienes: cue("tienes"), red: cue("red"), servidor: cue("servidor"), base: cue("base"),
  entras: cue("entras"), clic1: cue("clic"), clic2: cue("clic", 2), clic3: cue("clic", 3),
  pero1: cue("pero"), repites: cue("repites"), olvidas: cue("olvidas"), anda: cue("anda"), produccion: cue("producción"), no1: cue("no"),
  entonces: cue("entonces"), codigo: cue("código"), escribes: cue("escribes"), quieres: cue("quieres"), tener: cue("tener"),
  herramienta: cue("herramienta"), lee: cue("lee"), crea: cue("crea"), mismo: cue("mismo", 2), resultado: cue("resultado"),
  pero2: cue("pero", 2), equivocas: cue("equivocas"), antes: cue("antes"), muestra: cue("muestra"), crear: cue("crear"), cambiar: cue("cambiar"), borrar: cue("borrar"),
  apruebas: cue("apruebas"), aplica: cue("aplica"), estado: cue("estado"), memoria: cue("memoria"), creo: cue("creó"), saber: cue("saber"),
  pero3: cue("pero", 3), quien: cue("quién"), git: cue("git"), historial: cue("historial"), revisan: cue("revisan"), sale: cue("sale"), vuelves: cue("vuelves"),
  y9: cue("día") - 0.35, borra: cue("borra"), rehaces: cue("rehaces"), aplicas: cue("aplicas"), minutos: cue("minutos"),
  asi: cue("así"), ciclo: cue("ciclo"), escribes2: cue("escribes", 2), revisas: cue("revisas"), aplicas2: cue("aplicas", 2), cambias: cue("cambias"),
  destruyes: cue("destruyes"), pagarlo: cue("pagarlo"),
  con: cue("con"), terraform: cue("terraform"), cloudformation: cue("cloudformation"), bicep: cue("bicep"), pulumi: cue("pulumi"), python: cue("python"),
  pero4: cue("pero", 4), comandos: cue("comandos"), cada: cue("cada"), aprobado: cue("aprobado"), solo: cue("solo"),
  pipeline: cue("pipeline"), proximo: cue("próximo"), tu: cue("tú"),
};
const END = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((END + 2.2) * FPS);

// escenas (inicio, fin): se superponen ~0.35 s para fundir
const S = {
  hook: [0, C.tienes - 0.15], office: [C.tienes - 0.15, C.pero1], envs: [C.pero1, C.entonces], code: [C.entonces, C.herramienta - 0.15],
  tool: [C.herramienta - 0.15, C.pero2], plan: [C.pero2, C.estado - 0.2], state: [C.estado - 0.2, C.pero3], git: [C.pero3, C.y9],
  boom: [C.y9, C.asi - 0.1], cycle: [C.asi - 0.1, C.con - 0.15], tools: [C.con - 0.15, C.pero4], cicd: [C.pero4, C.tu - 0.25],
  final: [C.tu - 0.25, 999],
} as const;
const PIECES = [C.entonces, C.herramienta, C.muestra, C.estado, C.git];

// ---------------------------------------------------------------- piezas de dibujo
const INK = "#16203f";
const F = { anton: "Anton, sans-serif", inter: "Inter, sans-serif", mono: '"JetBrains Mono", monospace' };
type RK = "net" | "srv" | "db";
const RES: Record<RK, { c: string; label: string }> = {
  net: { c: "#38bdf8", label: "red" }, srv: { c: "#a78bfa", label: "servidor" }, db: { c: "#fbbf24", label: "base de datos" },
};

const ResIcon: React.FC<{ k: RK }> = ({ k }) => (
  <g>
    {k === "net" ? (
      <g>
        <path d="M-22 14 L0 -18 L22 14 Z" fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
        {[[-22, 14], [22, 14], [0, -18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="#fff" />)}
      </g>
    ) : null}
    {k === "srv" ? (
      <g>
        <rect x={-24} y={-30} width={48} height={60} rx={7} fill="#fff" />
        {[-17, -1, 15].map((y) => <g key={y}><rect x={-17} y={y} width={22} height={7} rx={3} fill={RES.srv.c} /><circle cx={13} cy={y + 3.5} r={3.5} fill="#22c55e" /></g>)}
      </g>
    ) : null}
    {k === "db" ? (
      <g>
        <rect x={-26} y={-20} width={52} height={40} fill="#fff" />
        <ellipse cx={0} cy={20} rx={26} ry={9} fill="#fff" />
        <ellipse cx={0} cy={-20} rx={26} ry={9} fill="#fff" stroke={RES.db.c} strokeWidth={3} />
        <path d="M-26 -3 Q0 8 26 -3" fill="none" stroke={RES.db.c} strokeWidth={3} />
      </g>
    ) : null}
  </g>
);

/** tarjeta de un recurso de la nube (red / servidor / base de datos) */
const Tile: React.FC<{ k: RK; x: number; y: number; s?: number; state?: "ok" | "ghost" | "down"; label?: string | false; fall?: number; check?: number }> =
  ({ k, x, y, s = 1, state = "ok", label, fall = 0, check = 0 }) => {
    if (s <= 0.001) return null;
    const lab = label === false ? null : label ?? RES[k].label;
    const grey = state === "down";
    return (
      <g transform={`translate(${x + fall * 40} ${y + fall * fall * 420}) rotate(${fall * 38}) scale(${s})`} opacity={1 - clamp(fall * 1.3)}>
        {state === "ghost" ? (
          <g>
            <rect x={-60} y={-60} width={120} height={120} rx={26} fill="#ffffff" fillOpacity={0.25} stroke={PAL.red} strokeWidth={5} strokeDasharray="14 10" />
            <text x={0} y={22} textAnchor="middle" fontFamily={F.anton} fontSize={66} fill={PAL.red}>?</text>
          </g>
        ) : (
          <g>
            <rect x={-60} y={-60} width={120} height={120} rx={26} fill="#ffffff" filter="url(#shSm)" />
            <circle cx={0} cy={0} r={44} fill={grey ? "#94a3b8" : RES[k].c} />
            <circle cx={-14} cy={-16} r={30} fill="#ffffff" opacity={0.18} />
            <ResIcon k={k} />
          </g>
        )}
        {lab ? <text x={0} y={96} textAnchor="middle" fontFamily={F.inter} fontWeight={800} fontSize={26} fill={state === "ghost" ? PAL.red : INK}>{lab}</text> : null}
        {check > 0 ? (
          <g transform={`translate(48 -48) scale(${check})`}>
            <circle r={22} fill="#22c55e" stroke="#fff" strokeWidth={4} />
            <path d="M-10 0 L-3 8 L11 -8" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
      </g>
    );
  };

const CloudGlyph: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = "#ffffff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <circle cx={-22} cy={4} r={20} /><circle cx={2} cy={-9} r={27} /><circle cx={26} cy={5} r={19} /><rect x={-42} y={4} width={86} height={20} rx={10} />
  </g>
);

/** panel de una nube/entorno: tarjeta clara con píldora de título */
const Panel: React.FC<{ x: number; y: number; w: number; h: number; label: string; color: string; s?: number; dim?: number; children?: React.ReactNode }> =
  ({ x, y, w, h, label, color, s = 1, dim = 0, children }) => (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
      <rect width={w} height={h} rx={36} fill="#ffffff" fillOpacity={0.92} filter="url(#sh)" />
      <rect x={6} y={6} width={w - 12} height={h - 12} rx={31} fill="none" stroke={color} strokeWidth={4} opacity={0.5} />
      <rect width={w} height={h} rx={36} fill="#334155" opacity={dim * 0.55} />
      <g transform={`translate(${w / 2} 0)`}>
        <rect x={-label.length * 11 - 52} y={-28} width={label.length * 22 + 104} height={56} rx={28} fill={color} filter="url(#shSm)" />
        <CloudGlyph x={-label.length * 11 - 18} y={-2} s={0.42} />
        <text x={14} y={11} textAnchor="middle" fontFamily={F.anton} fontSize={32} letterSpacing={1.5} fill="#ffffff">{label}</text>
      </g>
      {children}
    </g>
  );

/** ventana (navegador / editor / terminal) */
const Win: React.FC<{ x: number; y: number; w: number; h: number; title: string; dark?: boolean; s?: number; children?: React.ReactNode }> =
  ({ x, y, w, h, title, dark, s = 1, children }) => (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
      <rect width={w} height={h} rx={26} fill={dark ? "#0f1630" : "#ffffff"} filter="url(#sh)" />
      <path d={`M0 26 a26 26 0 0 1 26 -26 H${w - 26} a26 26 0 0 1 26 26 V62 H0 Z`} fill={dark ? "#1b2550" : "#eef1f8"} />
      {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => <circle key={c} cx={34 + i * 30} cy={31} r={9} fill={c} />)}
      <text x={w / 2} y={41} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={24} fill={dark ? "#9fb0e0" : "#64748b"}>{title}</text>
      {children}
    </g>
  );

/** persona 2D simple con expresión. Origen: abajo al centro del torso */
const Person: React.FC<{ x: number; y: number; s?: number; shirt?: string; skin?: string; hair?: string; mood?: "ok" | "happy" | "worry"; t: number; typing?: number; seed?: number }> =
  ({ x, y, s = 1, shirt = "#6d7fe0", skin = "#f3c6a0", hair = "#3b2a20", mood = "ok", t, typing = 0, seed = 0 }) => {
    const blink = (t * 0.7 + seed * 0.37) % 3.2 < 0.12;
    const bob = Math.sin(t * 2 + seed) * 2;
    return (
      <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
        <ellipse cx={0} cy={4} rx={80} ry={12} fill="#0b1530" opacity={0.12} />
        <path d="M-64 0 Q-66 -96 0 -106 Q66 -96 64 0 Z" fill={shirt} filter="url(#shSm)" />
        <path d="M-20 -104 Q0 -84 20 -104" fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={5} />
        <rect x={-13} y={-122} width={26} height={22} fill={skin} />
        <circle cx={0} cy={-158} r={46} fill={skin} />
        <path d="M-48 -158 Q-48 -214 0 -210 Q48 -214 48 -156 Q34 -186 0 -184 Q-30 -186 -48 -158 Z" fill={hair} />
        <ellipse cx={-16} cy={-156} rx={5.5} ry={blink ? 1 : 7.5} fill={INK} />
        <ellipse cx={16} cy={-156} rx={5.5} ry={blink ? 1 : 7.5} fill={INK} />
        <circle cx={-30} cy={-138} r={7} fill="#ff8f8f" opacity={0.35} />
        <circle cx={30} cy={-138} r={7} fill="#ff8f8f" opacity={0.35} />
        {mood === "happy" ? <path d="M-15 -134 Q0 -118 15 -134" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
        {mood === "ok" ? <path d="M-11 -131 Q0 -125 11 -131" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
        {mood === "worry" ? (
          <g>
            <path d="M-12 -126 Q0 -134 12 -126" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
            <path d="M-26 -176 L-8 -170 M26 -176 L8 -170" stroke={INK} strokeWidth={5} strokeLinecap="round" />
            <path d="M40 -186 Q48 -172 40 -166 Q32 -172 40 -186 Z" fill="#7dd3fc" />
          </g>
        ) : null}
        {typing > 0 ? [-1, 1].map((d) => (
          <rect key={d} x={d * 30 - 14} y={-58 + 5 * Math.sin(t * 22 + d * 1.7) * typing} width={28} height={58} rx={14} fill={shirt} stroke="#0b1530" strokeOpacity={0.12} strokeWidth={3} transform={`rotate(${d * -18} ${d * 30} -58)`} />
        )) : null}
      </g>
    );
  };

const Sweat: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <g opacity={0.9}>{[0, 1, 2].map((i) => <text key={i} x={x + i * 34} y={y - 14 * Math.abs(Math.sin(t * 5 + i))} fontFamily={F.anton} fontSize={54} fill={PAL.red}>?</text>)}</g>
);

/** archivo de código (main.tf) */
const FileCard: React.FC<{ x: number; y: number; s?: number; rot?: number; o?: number }> = ({ x, y, s = 1, rot = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <path d="M-70 -90 H40 L70 -60 V90 H-70 Z" fill="#ffffff" filter="url(#sh)" />
    <path d="M40 -90 V-60 H70" fill="#e2e8f0" />
    {[-40, -14, 12, 38].map((yy, i) => <rect key={yy} x={-50} y={yy} width={[90, 70, 100, 60][i]} height={10} rx={5} fill={["#c084fc", "#38bdf8", "#c084fc", "#4ade80"][i]} />)}
    <rect x={-70} y={58} width={140} height={32} fill="#7b42bc" />
    <text x={0} y={81} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={20} fill="#ffffff">main.tf</text>
  </g>
);

// ---------------------------------------------------------------- fondos
const BgStudio: React.FC<{ a?: string; b?: string; t: number }> = ({ a = "#eef0ff", b = "#cdd5fb", t }) => (
  <g>
    <defs><linearGradient id={`st${a}${b}`.replace(/#/g, "")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
    <rect width={1080} height={2100} fill={`url(#${`st${a}${b}`.replace(/#/g, "")})`} />
    {Array.from({ length: 14 }, (_, r) => Array.from({ length: 9 }, (_, c) => (
      <circle key={`${r}-${c}`} cx={60 + c * 120 + (r % 2) * 60} cy={120 + r * 130 + Math.sin(t * 0.6 + c) * 4} r={4} fill="#5b6bd6" opacity={0.12} />
    )))}
    <circle cx={540} cy={1240} r={520} fill="#ffffff" opacity={0.35} filter="url(#blur20)" />
  </g>
);

const BgInk: React.FC<{ t: number; glow?: string; red?: number }> = ({ t, glow = "#7b42bc", red = 0 }) => (
  <g>
    <rect width={1080} height={2100} fill="url(#gNight)" />
    <rect width={1080} height={2100} fill="#5a0f1c" opacity={red * 0.55} />
    <g opacity={0.12}>
      {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={i * 100 + 40} y1={0} x2={i * 100 + 40} y2={2100} stroke="#8fa7ff" strokeWidth={1.5} />)}
      {Array.from({ length: 22 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 100 + ((t * 20) % 100)} x2={1080} y2={i * 100 + ((t * 20) % 100)} stroke="#8fa7ff" strokeWidth={1.5} />)}
    </g>
    <circle cx={540} cy={1230} r={420} fill={red > 0.5 ? PAL.red : glow} opacity={0.28} filter="url(#blur20)" />
    <Stars t={t} n={50} h={1920} seed={3} />
  </g>
);

const City: React.FC<{ t: number; y?: number }> = ({ t, y = 1360 }) => (
  <g>
    {Array.from({ length: 13 }, (_, i) => {
      const w = 70 + rnd(i) * 50, h = 160 + rnd(i + 7) * 320, x = i * 86 - 20;
      return (
        <g key={i}>
          <rect x={x} y={y - h} width={w} height={h + 600} fill={i % 2 ? "#1d2756" : "#232f66"} />
          {Array.from({ length: Math.floor(h / 40) }, (_, r) => Array.from({ length: 2 }, (_, c) => {
            const on = rnd(i * 31 + r * 7 + c) > 0.45;
            return <rect key={`${r}-${c}`} x={x + 14 + c * (w / 2 - 6)} y={y - h + 20 + r * 40} width={w / 2 - 26} height={16} rx={3} fill={on ? PAL.glass : "#2f3d7a"} opacity={on ? 0.75 + 0.25 * Math.sin(t * 2 + i + r) : 1} />;
          }))}
        </g>
      );
    })}
  </g>
);

/** la gran nube con servidores adentro */
const BigCloud: React.FC<{ x: number; y: number; s?: number; t: number; glow?: number }> = ({ x, y, s = 1, t, glow = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(t * 1.2) * 10}) scale(${s})`}>
    <ellipse cx={0} cy={40} rx={380} ry={170} fill={PAL.cyan} opacity={0.18 * glow} filter="url(#blur20)" />
    <g filter="url(#sh)" fill="#f4f8ff">
      <circle cx={-190} cy={40} r={120} /><circle cx={-40} cy={-50} r={170} /><circle cx={150} cy={-10} r={140} /><circle cx={260} cy={70} r={90} />
      <rect x={-300} y={40} width={630} height={130} rx={65} />
    </g>
    <circle cx={-90} cy={-110} r={90} fill="#ffffff" opacity={0.6} />
    {[-170, -50, 70, 190].map((rx, i) => (
      <g key={rx} transform={`translate(${rx} ${-10 + (i % 2) * 20})`}>
        <rect x={-42} y={-60} width={84} height={150} rx={12} fill="#1e2a5a" />
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            <rect x={-30} y={-46 + k * 27} width={60} height={18} rx={4} fill="#2c3b7a" />
            <circle cx={20} cy={-37 + k * 27} r={4} fill={Math.sin(t * 6 + i * 2 + k * 1.3) > -0.2 ? PAL.green : "#64748b"} />
            <circle cx={8} cy={-37 + k * 27} r={4} fill={Math.sin(t * 4 + i + k) > 0.3 ? PAL.cyan : "#475569"} />
          </g>
        ))}
      </g>
    ))}
  </g>
);

// ---------------------------------------------------------------- escenas
const Hook: React.FC<{ t: number; final?: boolean }> = ({ t, final }) => {
  const z = final ? 1 - 0.08 * ease(ramp(t, S.final[0], 3)) : 1 + 0.08 * ease(ramp(t, 0, 4));
  const cloud = final ? 1 : pop(t, 0.1, 0.6);
  return (
    <g>
      <rect width={1080} height={2100} fill="url(#gNight)" />
      <Stars t={t} n={130} h={1300} seed={1} />
      <circle cx={860} cy={360} r={60} fill="#fff6d6" opacity={0.9} filter="url(#glowSm)" />
      <g transform={`translate(540 1200) scale(${z}) translate(-540 -1200)`}>
        {/* datos que suben desde la ciudad a la nube */}
        {Array.from({ length: 7 }, (_, i) => {
          const x0 = 100 + i * 140, u = (t * 0.6 + rnd(i)) % 1;
          return (
            <g key={i}>
              <path d={`M${x0} 1400 C ${x0} 1260, ${540 + (i - 3) * 60} 1250, ${540 + (i - 3) * 60} 1140`} stroke={PAL.cyan} strokeWidth={3} fill="none" opacity={0.35} />
              <circle cx={lerp(x0, 540 + (i - 3) * 60, u)} cy={lerp(1400, 1140, u)} r={7} fill="#ffffff" filter="url(#glowSm)" opacity={1 - u * 0.5} />
            </g>
          );
        })}
        <BigCloud x={540} y={1130} s={0.9 * cloud} t={t} />
        <City t={t} y={1640} />
      </g>
    </g>
  );
};

const Office: React.FC<{ t: number }> = ({ t }) => {
  const zoom = ease(ramp(t, C.entras - 0.1, 0.8));
  const sc = lerp(1, 3.1, zoom);
  const ui = ramp(t, C.entras + 0.35, 0.35);
  const btn = [C.clic1, C.clic2, C.clic3];
  const done = btn.map((b) => ramp(t, b + 0.05, 0.2));
  // cursor: va a cada botón justo antes de su clic
  const B: [number, number][] = [0, 1, 2].map((i) => [812, 1120 + i * 130]);
  let cx = 900, cy = 1470;
  btn.forEach((b, i) => {
    const u = ease(ramp(t, b - 0.3, 0.26));
    if (u > 0) { const [px, py] = i ? B[i - 1] : [900, 1470]; cx = lerp(px, B[i][0], u); cy = lerp(py, B[i][1], u); }
  });
  const press = btn.some((b) => t > b - 0.03 && t < b + 0.1);
  const ks: RK[] = ["net", "srv", "db"];
  return (
    <g>
      <g transform={`translate(670 1170) scale(${sc}) translate(-670 -1170)`} opacity={1 - ui * 0.9}>
        <rect width={1080} height={2100} fill="#f3dfc4" />
        <rect y={1440} width={1080} height={700} fill="#c99566" />
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 140} y={1440} width={4} height={480} fill="#b07f52" />)}
        <rect y={1430} width={1080} height={16} fill="#fff4e3" />
        {/* ventana con la ciudad de noche */}
        <g filter="url(#sh)"><rect x={90} y={640} width={330} height={330} rx={14} fill="#ffffff" /></g>
        <svg x={104} y={654} width={302} height={302} viewBox="0 900 1080 1080"><rect y={900} width={1080} height={1080} fill="url(#gNight)" /><City t={t} y={1900} /></svg>
        <path d="M255 654 V956 M104 805 H406" stroke="#ffffff" strokeWidth={10} />
        {/* lámpara colgante y cuadro */}
        <line x1={600} y1={0} x2={600} y2={600} stroke="#4b3b30" strokeWidth={4} />
        <circle cx={600} cy={690} r={190} fill="url(#gWarm)" opacity={0.75} />
        <path d="M540 640 Q600 560 660 640 Z" fill="#2d3a6b" />
        <g filter="url(#shSm)"><rect x={770} y={700} width={170} height={210} rx={8} fill="#ffffff" /><rect x={786} y={716} width={138} height={178} fill="#7cc7ff" /></g>
        <CloudGlyph x={855} y={805} s={1.1} />
        {/* planta */}
        <g transform="translate(960 1440)"><path d="M-40 0 L-30 -80 H30 L40 0 Z" fill="#e07a5f" />{[-40, -10, 20, 45].map((a, i) => <ellipse key={i} cx={a * 0.6} cy={-120 - (i % 2) * 30} rx={20} ry={56} fill={i % 2 ? "#3f9d5a" : "#5ec27a"} transform={`rotate(${a} 0 -80)`} />)}</g>
        {/* escritorio, monitor y silla */}
        <rect x={380} y={1290} width={530} height={24} rx={8} fill="#8a5a3c" filter="url(#shSm)" />
        <rect x={400} y={1314} width={18} height={130} fill="#6e4630" /><rect x={872} y={1314} width={18} height={130} fill="#6e4630" />
        <rect x={650} y={1250} width={40} height={42} fill="#475569" /><rect x={600} y={1280} width={140} height={12} rx={6} fill="#334155" />
        <rect x={515} y={1075} width={310} height={185} rx={14} fill="#111827" filter="url(#sh)" />
        <rect x={527} y={1087} width={286} height={161} rx={6} fill="#1e3a8a" />
        {ks.map((k, i) => <Tile key={k} k={k} x={575 + i * 95} y={1160} s={0.5 * pop(t, [C.red, C.servidor, C.base][i] - 0.05, 0.35)} label={false} />)}
        <rect x={180} y={1300} width={150} height={130} rx={20} fill="#3f4a7a" />
        <Person x={290} y={1330} s={1.05} t={t} typing={ramp(t, C.entras - 0.6, 0.2)} />
        <rect x={140} y={1230} width={40} height={200} rx={16} fill="#4b5694" />
      </g>
      {/* la consola web (lo que se ve en el monitor) */}
      {ui > 0 ? (
        <g opacity={ui} transform={`translate(505 1220) scale(${0.9 + 0.1 * ease(ui)}) translate(-505 -1220)`}>
          <Win x={80} y={960} w={850} h={520} title="consola.nube.com">
            <rect x={0} y={62} width={190} height={458} fill="#f6f7fb" />
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={26} y={100 + i * 56} width={i === 1 ? 140 : 110} height={20} rx={10} fill={i === 1 ? "#ff9f43" : "#d7dce8"} />)}
            {ks.map((k, i) => (
              <g key={k} transform={`translate(0 ${150 + i * 130})`}>
                <Tile k={k} x={270} y={0} s={0.62} label={false} check={pop(t, btn[i] + 0.12, 0.3)} />
                <text x={340} y={10} fontFamily={F.inter} fontWeight={800} fontSize={32} fill={INK}>{RES[k].label}</text>
                <g transform={`translate(${620 + 90} 0) scale(${press && Math.abs(t - btn[i]) < 0.1 ? 0.93 : 1})`}>
                  <rect x={-90} y={-30} width={180} height={60} rx={14} fill={done[i] > 0.5 ? "#22c55e" : "#ff9f43"} filter="url(#shSm)" />
                  <text x={0} y={11} textAnchor="middle" fontFamily={F.inter} fontWeight={800} fontSize={28} fill="#ffffff">{done[i] > 0.5 ? "Creado" : "Crear"}</text>
                </g>
              </g>
            ))}
          </Win>
          {/* cursor */}
          <g transform={`translate(${cx} ${cy}) scale(${press ? 0.85 : 1})`} filter="url(#shSm)">
            <path d="M0 0 L0 52 L14 40 L24 62 L34 57 L24 36 L42 36 Z" fill="#ffffff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          </g>
          {press ? <circle cx={cx} cy={cy} r={18 + 30 * ((t * 8) % 1)} fill="none" stroke="#ff9f43" strokeWidth={4} opacity={0.7} /> : null}
        </g>
      ) : null}
    </g>
  );
};

/** firewall: pared de ladrillos con candado (o su hueco punteado si te olvidaste de crearlo) */
const Firewall: React.FC<{ x: number; y: number; s?: number; ghost?: boolean; hit?: number }> = ({ x, y, s = 1, ghost, hit = 0 }) => {
  if (s <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.08 * hit)})`}>
      {ghost ? (
        <g>
          <rect x={-150} y={-26} width={300} height={52} rx={12} fill="#ffffff" fillOpacity={0.3} stroke={PAL.red} strokeWidth={5} strokeDasharray="14 10" />
          <text x={0} y={13} textAnchor="middle" fontFamily={F.anton} fontSize={34} letterSpacing={1} fill={PAL.red}>¿FIREWALL?</text>
        </g>
      ) : (
        <g>
          <rect x={-150} y={-26} width={300} height={52} rx={12} fill="#ea580c" filter="url(#shSm)" />
          {[-13, 0, 13].map((yy, r) => Array.from({ length: 7 }, (_, c) => (
            <rect key={`${r}-${c}`} x={-146 + c * 42 + (r % 2) * 21} y={yy - 5} width={38} height={10} rx={2} fill="#fb923c" opacity={0.7} />
          )))}
          <circle r={26} fill="#ffffff" stroke="#ea580c" strokeWidth={4} />
          <rect x={-11} y={-4} width={22} height={17} rx={4} fill="#ea580c" />
          <path d="M-7 -4 V-10 A7 7 0 0 1 7 -10 V-4" fill="none" stroke="#ea580c" strokeWidth={4} />
          {hit > 0 ? <circle r={40 + 50 * hit} fill="none" stroke={PAL.red} strokeWidth={6} opacity={1 - hit} /> : null}
        </g>
      )}
    </g>
  );
};

const Envs: React.FC<{ t: number }> = ({ t }) => {
  const ks: RK[] = ["net", "srv", "db"];
  const ok = pop(t, C.anda + 0.15, 0.35), bad = pop(t, C.no1, 0.35);
  const shake = t > C.no1 && t < C.no1 + 0.5 ? Math.sin(t * 70) * 8 : 0;
  // la petición de un usuario entra a cada entorno: en pruebas no hay firewall y llega a la base; en producción rebota
  const okU = ramp(t, C.anda - 0.55, 0.65);
  const badU = ramp(t, C.no1 - 0.55, 0.45);
  const bounce = ramp(t, C.no1 - 0.1, 0.45);
  const tileY = (i: number) => 185 + i * 112;
  const Req: React.FC<{ y: number; o: number; c: string }> = ({ y, o, c }) => (
    <g transform={`translate(205 ${y})`} opacity={o}>
      <circle r={20} fill={c} filter="url(#glowSm)" /><path d="M-8 -3 L0 7 L8 -3" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <BgStudio t={t} />
      <Panel x={70} y={990} w={410} h={480} label="PRUEBAS" color="#f59e0b" s={pop(t, C.pero1 + 0.15, 0.4)}>
        <Firewall x={205} y={82} s={0.95 * pop(t, C.olvidas - 0.1, 0.35)} ghost />
        {ks.map((k, i) => <Tile key={k} k={k} x={205} y={tileY(i)} s={0.72 * pop(t, C.repites + 0.15 + i * 0.32, 0.3)} label={false} />)}
        {[0, 1, 2].map((i) => {
          const u = ramp(t, C.repites + 0.15 + i * 0.32, 0.35);
          return u > 0 && u < 1 ? <circle key={i} cx={260} cy={tileY(i) + 30} r={20 + 60 * u} fill="none" stroke="#f59e0b" strokeWidth={5} opacity={1 - u} /> : null;
        })}
        {okU > 0 && okU < 1 ? <Req y={lerp(-40, tileY(2), ease(okU))} o={1} c="#22c55e" /> : null}
        <g transform={`translate(340 ${tileY(2)}) scale(${ok})`}><circle r={40} fill="#22c55e" filter="url(#shSm)" /><path d="M-17 0 L-5 13 L19 -13" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></g>
      </Panel>
      <g transform={`translate(${shake} 0)`}>
        <Panel x={530} y={990} w={410} h={480} label="PRODUCCIÓN" color="#22c55e" s={pop(t, C.pero1 + 0.3, 0.4)} dim={0.45 * clamp(bad)}>
          <Firewall x={205} y={82} s={0.95 * pop(t, C.pero1 + 0.4, 0.35)} hit={t > C.no1 - 0.1 ? ramp(t, C.no1 - 0.1, 0.5) : 0} />
          {ks.map((k, i) => <Tile key={k} k={k} x={205} y={tileY(i)} s={0.72 * pop(t, C.pero1 + 0.5 + i * 0.08, 0.3)} label={false} />)}
          {badU > 0 && bounce < 1 ? <Req y={t < C.no1 - 0.1 ? lerp(-40, 40, ease(badU)) : lerp(40, -60, ease(bounce))} o={1 - bounce} c={t < C.no1 - 0.1 ? "#3b82f6" : PAL.red} /> : null}
          <g transform={`translate(340 ${tileY(1)}) scale(${bad})`}><circle r={40} fill={PAL.red} filter="url(#shSm)" /><path d="M-14 -14 L14 14 M14 -14 L-14 14" stroke="#fff" strokeWidth={8} strokeLinecap="round" /></g>
        </Panel>
      </g>
      {/* "no son iguales" */}
      <g transform={`translate(505 1072) scale(${pop(t, C.olvidas + 0.2, 0.35)})`}>
        <circle r={36} fill={PAL.red} filter="url(#shSm)" />
        <path d="M-16 -7 H16 M-16 9 H16 M9 -22 L-9 23" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      </g>
    </g>
  );
};

type Seg = [string, string];
const KW = "#c084fc", STR = "#4ade80", ID = "#7dd3fc", TXT = "#e2e8f0", COM = "#64748b";
const CODE: Seg[][] = [
  [["resource ", KW], ['"red" ', STR], ['"principal" ', ID], ["{", TXT]],
  [["  rango  = ", TXT], ['"10.0.0.0/16"', STR]],
  [["}", TXT]],
  [["", TXT]],
  [["resource ", KW], ['"servidor" ', STR], ['"web" ', ID], ["{", TXT]],
  [["  tamaño = ", TXT], ['"mediano"', STR]],
  [["}", TXT]],
  [["", TXT]],
  [["resource ", KW], ['"base_de_datos" ', STR], ['"app" ', ID], ["{", TXT]],
  [["  motor  = ", TXT], ['"postgres"', STR]],
  [["}", TXT]],
];
const CODE_LEN = CODE.reduce((s, l) => s + l.reduce((a, g) => a + g[0].length, 0) + 1, 0);

const CodeLines: React.FC<{ x: number; y: number; n: number; size?: number; lh?: number; caret?: boolean; t: number }> = ({ x, y, n, size = 29, lh = 40, caret, t }) => {
  let left = n, caretAt: [number, number] | null = null;
  return (
    <g fontFamily={F.mono} fontWeight={700} fontSize={size}>
      {CODE.map((line, li) => {
        const parts: React.ReactNode[] = [];
        let col = 0;
        line.forEach(([s, c], gi) => {
          const k = Math.max(0, Math.min(s.length, left));
          left -= k;
          if (k > 0) parts.push(<tspan key={gi} fill={c}>{s.slice(0, k).replace(/ /g, " ")}</tspan>);
          col += k;
        });
        if (left > 0) left -= 1; else if (!caretAt) caretAt = [col, li];
        return (
          <g key={li}>
            <text x={x - 46} y={y + li * lh} fontSize={size * 0.8} fill={COM} textAnchor="end">{li + 1}</text>
            <text x={x} y={y + li * lh}>{parts}</text>
          </g>
        );
      })}
      {caret && caretAt && Math.floor(t * 2.5) % 2 === 0 ? <rect x={x + (caretAt as [number, number])[0] * size * 0.6} y={y + (caretAt as [number, number])[1] * lh - size * 0.85} width={size * 0.5} height={size * 1.05} fill="#a78bfa" opacity={0.85} /> : null}
    </g>
  );
};

const Code: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(CODE_LEN * clamp((t - C.codigo + 0.1) / Math.max(0.8, C.herramienta - 0.4 - C.codigo)));
  return (
    <g>
      <BgInk t={t} />
      <g transform={`translate(0 ${(1 - ease(ramp(t, C.entonces, 0.5))) * 120})`} opacity={ramp(t, C.entonces, 0.3)}>
        <Win x={70} y={960} w={870} h={520} title="main.tf" dark>
          <CodeLines x={110} y={130} n={n} t={t} caret />
        </Win>
      </g>
    </g>
  );
};

const Tool: React.FC<{ t: number }> = ({ t }) => {
  const fileU = ease(ramp(t, C.lee - 0.1, 0.6));
  const gear = t * 160 * (t > C.lee ? 2.5 : 0.6);
  const beam = ramp(t, C.crea - 0.15, 0.4);
  const ks: RK[] = ["net", "srv", "db"];
  const eq = pop(t, C.mismo, 0.35);
  return (
    <g>
      <BgStudio t={t} a="#f3ecff" b="#d9c9ff" />
      {/* la herramienta */}
      <g transform={`translate(540 1060) scale(${pop(t, C.herramienta - 0.1, 0.4)})`}>
        <ellipse cx={0} cy={0} rx={200} ry={120} fill="#7b42bc" opacity={0.25 + 0.2 * beam} filter="url(#blur20)" />
        <rect x={-130} y={-90} width={260} height={180} rx={28} fill="url(#gMetal)" filter="url(#sh)" />
        <rect x={-100} y={-62} width={200} height={110} rx={18} fill="#2a1a52" />
        <g transform={`translate(-38 -8) rotate(${gear})`}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={-7} y={-40} width={14} height={80} rx={4} fill="#a78bfa" transform={`rotate(${i * 22.5})`} />)}<circle r={26} fill="#7b42bc" /><circle r={10} fill="#2a1a52" /></g>
        <g transform={`translate(42 22) rotate(${-gear * 1.4})`}>{Array.from({ length: 6 }, (_, i) => <rect key={i} x={-5} y={-24} width={10} height={48} rx={3} fill="#c4b5fd" transform={`rotate(${i * 30})`} />)}<circle r={15} fill="#8b5cf6" /></g>
        <text x={44} y={-18} textAnchor="middle" fontFamily={F.anton} fontSize={40} fill="#ffffff">IaC</text>
        <rect x={-60} y={-104} width={120} height={18} rx={9} fill="#475569" />
      </g>
      {/* el archivo entra a la máquina */}
      <FileCard x={lerp(170, 540, fileU)} y={lerp(1000, 950, fileU)} s={lerp(0.9, 0.35, fileU) * pop(t, C.herramienta, 0.4)} rot={lerp(-8, 0, fileU)} o={1 - ramp(t, C.lee + 0.45, 0.15)} />
      {/* rayos hacia los dos entornos */}
      {[280, 800].map((px, i) => (
        <g key={px} opacity={beam}>
          <path d={`M540 1150 C 540 1220, ${px} 1200, ${px} 1270`} stroke="#8b5cf6" strokeWidth={8} fill="none" strokeDasharray="4 18" strokeDashoffset={-t * 120} strokeLinecap="round" />
          {Array.from({ length: 3 }, (_, k) => {
            const u = (t * 1.4 + k / 3 + i * 0.1) % 1;
            const bx = 540 + (px - 540) * (3 * u * u - 2 * u * u * u), by = 1150 + 120 * u;
            return <circle key={k} cx={bx} cy={by} r={9} fill="#ffffff" filter="url(#glowSm)" />;
          })}
        </g>
      ))}
      {(["PRUEBAS", "PRODUCCIÓN"] as const).map((lab, i) => (
        <Panel key={lab} x={i ? 545 : 85} y={1275} w={390} h={200} label={lab} color={i ? "#22c55e" : "#f59e0b"} s={pop(t, C.herramienta + 0.2 + i * 0.1, 0.4)}>
          {ks.map((k, j) => <Tile key={k} k={k} x={80 + j * 115} y={112} s={0.66 * pop(t, C.crea + j * 0.22, 0.3)} label={false} />)}
          <g transform={`translate(${390 - 18} 18) scale(${pop(t, C.mismo + 0.1 + i * 0.12, 0.35)})`}><circle r={30} fill="#22c55e" stroke="#fff" strokeWidth={5} /><path d="M-13 0 L-4 10 L14 -10" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /></g>
        </Panel>
      ))}
      <g transform={`translate(540 1375) scale(${eq})`}><circle r={40} fill="#7b42bc" filter="url(#shSm)" /><path d="M-18 -9 H18 M-18 9 H18" stroke="#fff" strokeWidth={8} strokeLinecap="round" /></g>
    </g>
  );
};

const PlanScene: React.FC<{ t: number }> = ({ t }) => {
  const lines: { at: number; txt: string; c: string; mono?: boolean }[] = [
    { at: C.antes - 0.1, txt: "$ terraform plan", c: "#e2e8f0" },
    { at: C.crear, txt: "+ crear    servidor.web", c: "#4ade80" },
    { at: C.cambiar, txt: "~ cambiar  red.principal", c: "#fbbf24" },
    { at: C.borrar, txt: "- borrar   base_de_datos.vieja", c: "#ff6b7a" },
    { at: C.borrar + 0.45, txt: "Plan: 1 crear, 1 cambiar, 1 borrar", c: "#9fb0e0" },
    { at: C.aplica - 0.05, txt: "$ terraform apply", c: "#e2e8f0" },
  ];
  const q = pop(t, C.pero2 + 0.1, 0.4) * (1 - ramp(t, C.antes - 0.2, 0.25));
  const stamp = t > C.apruebas - 0.05 ? 1 + 1.6 * (1 - ease(ramp(t, C.apruebas - 0.05, 0.18))) : 0;
  const prog = ease(ramp(t, C.aplica + 0.2, 0.7));
  return (
    <g>
      <BgInk t={t} glow="#2563eb" />
      <g opacity={ramp(t, C.pero2, 0.3)}>
        <Win x={80} y={960} w={860} h={520} title="terminal" dark>
          {lines.map((l, i) => {
            const k = Math.floor(l.txt.length * clamp((t - l.at) / (i === 0 || i === 5 ? 0.45 : 0.18)));
            if (k <= 0) return null;
            const y = 120 + i * 58 + (i >= 4 ? 10 : 0);
            return (
              <g key={i}>
                {i >= 1 && i <= 3 ? <rect x={30} y={y - 34} width={800} height={46} rx={8} fill={l.c} opacity={0.12} /> : null}
                <text x={46} y={y} fontFamily={F.mono} fontWeight={700} fontSize={29} fill={l.c}>{l.txt.slice(0, k).replace(/ /g, " ")}</text>
              </g>
            );
          })}
          {prog > 0 ? (
            <g transform="translate(46 470)">
              <rect width={560} height={22} rx={11} fill="#24305e" />
              <rect width={560 * prog} height={22} rx={11} fill="#4ade80" />
              <text x={590} y={20} fontFamily={F.mono} fontWeight={700} fontSize={26} fill="#4ade80">{prog > 0.98 ? "¡listo!" : `${Math.round(prog * 100)}%`}</text>
            </g>
          ) : null}
        </Win>
      </g>
      {q > 0 ? <g transform={`translate(540 1220) scale(${q})`}><circle r={110} fill={PAL.red} filter="url(#sh)" /><text y={52} textAnchor="middle" fontFamily={F.anton} fontSize={160} fill="#fff">?</text></g> : null}
      {stamp > 0 ? (
        <g transform={`translate(640 1130) rotate(-12) scale(${stamp})`} opacity={1 - ramp(t, C.aplica + 0.1, 0.3)}>
          <rect x={-210} y={-62} width={420} height={124} rx={18} fill="#0f1630" fillOpacity={0.6} stroke="#4ade80" strokeWidth={10} />
          <text y={30} textAnchor="middle" fontFamily={F.anton} fontSize={84} letterSpacing={4} fill="#4ade80">APROBADO</text>
        </g>
      ) : null}
    </g>
  );
};

const StateScene: React.FC<{ t: number }> = ({ t }) => {
  const ks: RK[] = ["net", "srv", "db"];
  const names = ["red.principal", "servidor.web", "base_de_datos.app"];
  const marks = [C.memoria, C.memoria + 0.4, C.creo];
  const cmp = ramp(t, C.saber - 0.1, 0.4);
  return (
    <g>
      <BgStudio t={t} a="#eafaf3" b="#c6efdc" />
      <Panel x={80} y={990} w={330} h={480} label="NUBE" color="#3b82f6" s={pop(t, C.estado - 0.1, 0.4)}>
        {ks.map((k, i) => <Tile key={k} k={k} x={165} y={110 + i * 140} s={0.78} label={false} />)}
      </Panel>
      {/* la libreta del estado */}
      <g transform={`translate(690 1230) scale(${pop(t, C.estado + 0.05, 0.45)}) rotate(2) translate(-220 -240)`}>
        <rect width={440} height={480} rx={22} fill="#fffdf6" filter="url(#sh)" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={30} y1={120 + i * 42} x2={410} y2={120 + i * 42} stroke="#cfe0f5" strokeWidth={3} />)}
        <line x1={70} y1={0} x2={70} y2={480} stroke="#ffb4b4" strokeWidth={3} />
        {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={40 + i * 72} cy={0} r={13} fill="none" stroke="#94a3b8" strokeWidth={6} />)}
        <text x={90} y={82} fontFamily={F.anton} fontSize={50} fill={INK}>ESTADO</text>
        {names.map((nm, i) => (
          <g key={nm} opacity={ramp(t, marks[i] - 0.05, 0.2)}>
            <text x={90} y={170 + i * 84} fontFamily={F.mono} fontWeight={700} fontSize={25} fill={INK}>{nm}</text>
            <g transform={`translate(392 ${162 + i * 84}) scale(${pop(t, marks[i] + 0.1, 0.3)})`}><circle r={19} fill="#22c55e" /><path d="M-8 0 L-2 7 L9 -7" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" /></g>
          </g>
        ))}
      </g>
      {/* hilos entre lo que existe y lo anotado */}
      {ks.map((k, i) => (
        <path key={k} d={`M365 ${1100 + i * 140} C 430 ${1100 + i * 140}, 440 ${1160 + i * 84 - 30}, 500 ${1160 + i * 84 - 30}`} stroke="#22c55e" strokeWidth={5} fill="none" strokeDasharray="10 10" strokeDashoffset={-t * 40} opacity={ramp(t, marks[i], 0.3)} />
      ))}
      {/* comparar: código vs estado */}
      {cmp > 0 ? (
        <g transform={`translate(540 1450) scale(${ease(cmp)})`}>
          <rect x={-250} y={-36} width={500} height={72} rx={36} fill={INK} filter="url(#shSm)" />
          <text y={12} textAnchor="middle" fontFamily={F.inter} fontWeight={800} fontSize={30} fill="#ffffff">código  ↔  estado  ↔  nube</text>
        </g>
      ) : null}
    </g>
  );
};

const GitScene: React.FC<{ t: number }> = ({ t }) => {
  const confused = t < C.git;
  const commits = [
    { x: 170, at: C.historial - 0.1, lab: "crea red" }, { x: 390, at: C.historial + 0.15, lab: "+ servidor" },
    { x: 610, at: C.historial + 0.4, lab: "+ base" }, { x: 830, at: C.sale - 0.05, lab: "cambia red" },
  ];
  const bad = ramp(t, C.sale, 0.2), back = ease(ramp(t, C.vuelves, 0.6));
  const shirts = ["#6d7fe0", "#f472b6", "#34d399"], hairs = ["#3b2a20", "#7c2d12", "#111827"];
  return (
    <g>
      <rect width={1080} height={2100} fill="#f6e6cf" />
      <rect y={1300} width={1080} height={800} fill="#ead2b1" />
      <circle cx={540} cy={760} r={420} fill="url(#gWarm)" opacity={0.5} />
      {[270, 540, 810].map((x, i) => (
        <g key={x}>
          <Person x={x} y={1245} s={0.9} t={t} seed={i * 3} shirt={shirts[i]} hair={hairs[i]} mood={confused ? "worry" : t > C.sale && t < C.vuelves + 0.4 ? "worry" : "happy"} />
          {confused && t > C.quien - 0.1 ? <Sweat x={x - 30} y={1010} t={t + i} /> : null}
          {/* revisan: burbuja con tilde */}
          <g transform={`translate(${x + 80} 1020) scale(${pop(t, C.revisan + i * 0.12, 0.3) * (1 - ramp(t, C.sale, 0.2))})`}>
            <path d="M-36 -30 H36 A14 14 0 0 1 50 -16 V16 A14 14 0 0 1 36 30 H-6 L-22 46 L-20 30 H-36 A14 14 0 0 1 -50 16 V-16 A14 14 0 0 1 -36 -30 Z" fill="#ffffff" filter="url(#shSm)" />
            <path d="M-14 0 L-4 10 L16 -10" fill="none" stroke="#22c55e" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      ))}
      {/* el historial */}
      <g opacity={ramp(t, C.git - 0.1, 0.3)}>
        <rect x={70} y={1290} width={880} height={190} rx={30} fill="#ffffff" filter="url(#sh)" />
        <text x={106} y={1336} fontFamily={F.mono} fontWeight={700} fontSize={24} fill="#94a3b8">git log</text>
        <line x1={170} y1={1390} x2={t < C.sale - 0.05 ? lerp(170, 610, ramp(t, C.historial - 0.1, 0.6)) : lerp(610, 830, ramp(t, C.sale - 0.05, 0.25))} y2={1390} stroke="#cbd5e1" strokeWidth={8} strokeLinecap="round" />
        {commits.map((c, i) => {
          const isBad = i === 3;
          const s = pop(t, c.at, 0.3) * (isBad ? 1 - back * 0.65 : 1);
          const col = isBad ? (bad > 0.5 ? PAL.red : "#f59e0b") : i === 2 && back > 0.5 ? "#22c55e" : "#7b42bc";
          return (
            <g key={i} opacity={isBad ? 1 - back * 0.55 : 1}>
              <circle cx={c.x} cy={1390} r={24 * s} fill={col} stroke="#ffffff" strokeWidth={6} filter="url(#shSm)" />
              {i === 2 && back > 0.5 ? <circle cx={c.x} cy={1390} r={34 + 6 * Math.sin(t * 8)} fill="none" stroke="#22c55e" strokeWidth={4} /> : null}
              <text x={c.x} y={1450} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={23} fill={INK} opacity={s}>{c.lab}</text>
              {isBad && bad > 0 ? <path d={`M${c.x - 12} 1378 L${c.x + 12} 1402 M${c.x + 12} 1378 L${c.x - 12} 1402`} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={bad} /> : null}
            </g>
          );
        })}
        {back > 0 ? <path d={`M830 1350 Q 720 ${1290 - 20 * back} 640 1352`} fill="none" stroke="#22c55e" strokeWidth={7} strokeLinecap="round" strokeDasharray={`${260 * back} 400`} /> : null}
        {back > 0.9 ? <path d="M640 1352 l20 -4 l-8 18 Z" fill="#22c55e" stroke="#22c55e" strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    </g>
  );
};

const Boom: React.FC<{ t: number }> = ({ t }) => {
  const ks: RK[] = ["net", "srv", "db"];
  const gone = ramp(t, C.borra - 0.05, 0.9);
  const fileU = ease(ramp(t, C.aplicas - 0.15, 0.55));
  const rebuilt = ks.map((_, i) => pop(t, C.aplicas + 0.45 + i * 0.25, 0.35));
  const red = clamp(ramp(t, C.borra, 0.3) - ramp(t, C.aplicas + 0.5, 0.6));
  const watch = pop(t, C.minutos - 0.15, 0.35);
  return (
    <g>
      <BgInk t={t} glow="#22c55e" red={red} />
      <g transform={`translate(${red > 0.2 && red < 0.95 ? Math.sin(t * 60) * 6 * red : 0} 0)`}>
        <Panel x={110} y={1030} w={820} h={430} label="PRODUCCIÓN" color={red > 0.5 ? PAL.red : "#22c55e"} dim={red * 0.4}>
          {ks.map((k, i) => (
            <g key={k}>
              <Tile k={k} x={190 + i * 220} y={200} s={1} fall={t < C.aplicas ? clamp(gone * 1.4 - i * 0.18) : 1} />
              <Tile k={k} x={190 + i * 220} y={200} s={rebuilt[i]} check={pop(t, C.minutos + i * 0.08, 0.3)} />
              {t > C.borra + 0.5 && rebuilt[i] < 0.1 ? <rect x={190 + i * 220 - 60} y={140} width={120} height={120} rx={26} fill="none" stroke="#94a3b8" strokeWidth={4} strokeDasharray="10 10" opacity={0.6} /> : null}
            </g>
          ))}
        </Panel>
      </g>
      <FileCard x={540} y={lerp(700, 1150, fileU)} s={lerp(1.1, 0.4, fileU)} o={(t > C.aplicas - 0.2 ? 1 : 0) * (1 - ramp(t, C.aplicas + 0.4, 0.15))} />
      {/* cronómetro */}
      <g transform={`translate(850 1035) scale(${watch})`}>
        <circle r={64} fill="#ffffff" filter="url(#sh)" /><rect x={-12} y={-86} width={24} height={20} rx={5} fill="#cbd5e1" />
        <circle r={50} fill="none" stroke="#22c55e" strokeWidth={8} strokeDasharray={`${314 * clamp((t - C.minutos) / 1.2)} 400`} transform="rotate(-90)" />
        <line x1={0} y1={0} x2={Math.sin(t * 9) * 38} y2={-Math.cos(t * 9) * 38} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <circle r={7} fill={INK} />
      </g>
    </g>
  );
};

const Cycle: React.FC<{ t: number }> = ({ t }) => {
  const steps = [
    { lab: "ESCRIBIR", at: C.escribes2, c: "#7b42bc" }, { lab: "REVISAR", at: C.revisas, c: "#3b82f6" },
    { lab: "APLICAR", at: C.aplicas2, c: "#22c55e" }, { lab: "CAMBIAR", at: C.cambias, c: "#f59e0b" }, { lab: "DESTRUIR", at: C.destruyes, c: PAL.red },
  ];
  const R = 250, cx = 540, cy = 1215;
  const pos = (i: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.9] as const; };
  const ring = ramp(t, C.ciclo - 0.2, 0.8);
  const cost = lerp(340, 0, ease(ramp(t, C.destruyes + 0.2, 0.9)));
  return (
    <g>
      <BgStudio t={t} a="#e8f4ff" b="#c4defb" />
      <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.9} fill="none" stroke="#94a3b8" strokeWidth={10} strokeDasharray={`${1600 * ring} 2000`} opacity={0.6} />
      <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.9} fill="none" stroke="#7b42bc" strokeWidth={10} strokeDasharray="30 1540" strokeDashoffset={-t * 300} opacity={ring} strokeLinecap="round" />
      {steps.map((s, i) => {
        const [x, y] = pos(i);
        const on = t >= s.at - 0.1, sc = pop(t, s.at - 0.15, 0.35);
        return (
          <g key={s.lab} transform={`translate(${x} ${y}) scale(${0.75 + 0.25 * sc})`} opacity={0.35 + 0.65 * sc}>
            <circle r={60} fill={on ? s.c : "#cbd5e1"} filter="url(#shSm)" />
            {i === 0 ? <path d="M-18 18 L-22 26 L-14 22 L20 -12 L12 -20 Z" fill="#fff" /> : null}
            {i === 1 ? <g><circle cx={-4} cy={-4} r={16} fill="none" stroke="#fff" strokeWidth={6} /><line x1={8} y1={8} x2={22} y2={22} stroke="#fff" strokeWidth={7} strokeLinecap="round" /></g> : null}
            {i === 2 ? <path d="M-8 -22 L18 0 L-8 22 Z" fill="#fff" /> : null}
            {i === 3 ? <g><path d="M-20 -6 A20 20 0 0 1 16 -12" fill="none" stroke="#fff" strokeWidth={6} /><path d="M20 6 A20 20 0 0 1 -16 12" fill="none" stroke="#fff" strokeWidth={6} /><path d="M12 -22 L18 -10 L6 -8 Z M-12 22 L-18 10 L-6 8 Z" fill="#fff" /></g> : null}
            {i === 4 ? <g><rect x={-16} y={-12} width={32} height={36} rx={4} fill="#fff" /><rect x={-22} y={-22} width={44} height={8} rx={4} fill="#fff" /></g> : null}
            <rect x={-82} y={72} width={164} height={44} rx={22} fill="#ffffff" filter="url(#shSm)" />
            <text y={104} textAnchor="middle" fontFamily={F.anton} fontSize={30} letterSpacing={1} fill={on ? s.c : "#94a3b8"}>{s.lab}</text>
          </g>
        );
      })}
      {/* costo por mes */}
      <g transform={`translate(${cx} ${cy}) scale(${pop(t, C.ciclo, 0.4)})`}>
        <rect x={-130} y={-80} width={260} height={160} rx={26} fill={INK} filter="url(#sh)" />
        <text y={-34} textAnchor="middle" fontFamily={F.inter} fontWeight={800} fontSize={24} letterSpacing={2} fill="#9fb0e0">COSTO / MES</text>
        <text y={34} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={58} fill={cost < 1 ? "#4ade80" : "#ffd23f"}>${Math.round(cost)}</text>
        <rect x={-100} y={52} width={200} height={12} rx={6} fill="#2a355f" />
        <rect x={-100} y={52} width={200 * (cost / 340)} height={12} rx={6} fill="#ffd23f" />
      </g>
    </g>
  );
};

const TOOLS = [
  { n: "Terraform", sub: "casi cualquier nube", c: "#7b42bc", tag: "TF", at: () => C.terraform },
  { n: "OpenTofu", sub: "versión abierta de Terraform", c: "#d4a514", tag: "OT", at: () => C.terraform + 0.55 },
  { n: "CloudFormation", sub: "AWS", c: "#ff9900", tag: "CF", at: () => C.cloudformation },
  { n: "Bicep", sub: "Azure", c: "#0078d4", tag: "BI", at: () => C.bicep },
  { n: "Pulumi", sub: "Python, TypeScript, Go...", c: "#8a3ffc", tag: "PU", at: () => C.pulumi },
  { n: "AWS CDK", sub: "AWS con lenguajes", c: "#e8730c", tag: "CDK", at: () => C.pulumi + 0.5 },
  { n: "Ansible", sub: "configura servidores", c: "#e0464e", tag: "AN", at: () => C.pulumi + 0.75 },
  { n: "Crossplane", sub: "desde Kubernetes", c: "#326ce5", tag: "XP", at: () => C.pulumi + 1.0 },
];
const Tools: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <BgInk t={t} glow="#3b82f6" />
    {TOOLS.map((k, i) => {
      const x = i % 2 ? 525 : 85, y = 990 + Math.floor(i / 2) * 122;
      const s = pop(t, k.at() - 0.05, 0.35);
      const hl = i === 0 && t > C.terraform && t < C.cloudformation ? 1 : 0;
      return (
        <g key={k.n} transform={`translate(${x + 205} ${y + 52}) scale(${s * (1 + 0.04 * hl)}) translate(-205 -52)`}>
          <rect width={410} height={104} rx={24} fill="#ffffff" filter="url(#sh)" />
          {hl ? <rect x={-6} y={-6} width={422} height={116} rx={28} fill="none" stroke={k.c} strokeWidth={5} /> : null}
          <rect x={12} y={12} width={80} height={80} rx={18} fill={k.c} />
          <text x={52} y={63} textAnchor="middle" fontFamily={F.anton} fontSize={k.tag.length > 2 ? 26 : 34} fill="#ffffff">{k.tag}</text>
          <text x={108} y={50} fontFamily={F.inter} fontWeight={800} fontSize={k.n.length > 12 ? 31 : 36} fill={INK}>{k.n}</text>
          <text x={108} y={83} fontFamily={F.inter} fontWeight={600} fontSize={22} fill="#64748b">{k.sub}</text>
        </g>
      );
    })}
  </g>
);

const Cicd: React.FC<{ t: number }> = ({ t }) => {
  const pipe = ramp(t, C.cada - 0.2, 0.5);
  const manual = 1 - pipe;
  const cmds = [{ at: C.comandos - 0.4, s: "$ terraform plan" }, { at: C.comandos + 0.4, s: "$ terraform apply" }, { at: C.cada - 0.7, s: "$ terraform apply" }];
  const gates = [{ x: 330, lab: "PLAN" }, { x: 560, lab: "APROBAR" }, { x: 790, lab: "APLICAR" }];
  const belt = (t - C.cada) * 160;
  return (
    <g>
      <BgStudio t={t} a="#fff4e6" b="#ffd9b0" />
      {manual > 0.01 ? (
        <g opacity={manual}>
          <Person x={250} y={1440} s={1.25} t={t} typing={1} mood="worry" shirt="#6d7fe0" />
          <path d="M170 1330 H330 L340 1400 H160 Z" fill="#cbd5e1" filter="url(#shSm)" /><rect x={130} y={1396} width={240} height={14} rx={7} fill="#94a3b8" /><CloudGlyph x={250} y={1362} s={0.5} fill="#94a3b8" />
          <Win x={410} y={990} w={520} h={300} title="terminal" dark>
            {cmds.map((c, i) => {
              const k = Math.floor(c.s.length * clamp((t - c.at) / 0.4));
              return k > 0 ? <text key={i} x={36} y={124 + i * 56} fontFamily={F.mono} fontWeight={700} fontSize={28} fill="#e2e8f0">{c.s.slice(0, k).replace(/ /g, " ")}</text> : null;
            })}
          </Win>
        </g>
      ) : null}
      {pipe > 0 ? (
        <g opacity={pipe}>
          {/* la nube de destino */}
          <g transform={`translate(800 1040) scale(${pop(t, C.cada + 0.2, 0.4)})`}>
            <CloudGlyph x={0} y={0} s={2.2} fill="#ffffff" />
            <text x={4} y={30} textAnchor="middle" fontFamily={F.anton} fontSize={30} fill="#3b82f6">NUBE</text>
          </g>
          <path d="M790 1150 V1080" stroke="#22c55e" strokeWidth={8} strokeDasharray="10 10" strokeDashoffset={-t * 60} opacity={ramp(t, C.aprobado, 0.3)} />
          {/* cinta */}
          <rect x={70} y={1370} width={880} height={56} rx={28} fill="#334155" filter="url(#sh)" />
          {Array.from({ length: 22 }, (_, i) => <rect key={i} x={70 + ((i * 44 + belt) % 880)} y={1382} width={20} height={32} rx={4} fill="#475569" />)}
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={110 + i * 160} cy={1398} r={10} fill="#64748b" />)}
          {/* el commit que entra y viaja por la cinta */}
          {Array.from({ length: 3 }, (_, i) => {
            const u = ((t - C.cada) * 0.38 - i * 0.36);
            if (u < 0 || u > 1) return null;
            return <FileCard key={i} x={lerp(110, 930, u)} y={1310} s={0.5} />;
          })}
          {gates.map((g, i) => {
            const passed = ((t - C.cada) * 0.38 * 820 + 110) > g.x;
            return (
              <g key={g.lab} transform={`translate(${g.x} 1250) scale(${pop(t, C.cada + 0.1 + i * 0.15, 0.35)})`}>
                <path d="M-80 120 V-40 A80 80 0 0 1 80 -40 V120" fill="none" stroke={passed ? "#22c55e" : "#94a3b8"} strokeWidth={14} strokeLinecap="round" />
                <rect x={-74} y={-110} width={148} height={46} rx={23} fill={passed ? "#22c55e" : INK} />
                <text y={-78} textAnchor="middle" fontFamily={F.anton} fontSize={26} letterSpacing={1} fill="#ffffff">{g.lab}</text>
              </g>
            );
          })}
          <g transform={`translate(130 1250) scale(${pop(t, C.cada, 0.35)})`}>
            <rect x={-62} y={-40} width={124} height={80} rx={20} fill="#7b42bc" filter="url(#shSm)" />
            <text y={12} textAnchor="middle" fontFamily={F.anton} fontSize={30} fill="#fff">COMMIT</text>
          </g>
        </g>
      ) : null}
    </g>
  );
};

const RECAP: { lab: string; c: string }[] = [
  { lab: "código", c: "#7b42bc" }, { lab: "herramienta", c: "#8b5cf6" }, { lab: "plan", c: "#3b82f6" }, { lab: "estado", c: "#22c55e" }, { lab: "Git", c: "#f59e0b" },
];
const Final: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Hook t={t} final />
    <rect width={1080} height={2100} fill="#0b1030" opacity={0.25} />
    {RECAP.map((r, i) => {
      const x = 140 + i * 170, s = pop(t, S.final[0] + 0.3 + i * 0.1, 0.35);
      return (
        <g key={r.lab} transform={`translate(${x} 1380) scale(${s})`}>
          <circle r={58} fill="#ffffff" filter="url(#sh)" />
          <circle r={48} fill={r.c} />
          <text y={14} textAnchor="middle" fontFamily={F.anton} fontSize={40} fill="#fff">{i + 1}</text>
          <text y={96} textAnchor="middle" fontFamily={F.inter} fontWeight={800} fontSize={24} fill="#ffffff">{r.lab}</text>
        </g>
      );
    })}
  </g>
);

// ---------------------------------------------------------------- sonido
type S2 = { at: number; s: string; v?: number };
const SfxTrack2: React.FC<{ events: S2[]; master?: number }> = ({ events, master = 1 }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {events.filter((e) => e.at >= 0).map((e, i) => (
        <Sequence key={i} from={Math.round(e.at * fps)} layout="none" name={`sfx ${e.s}`}>
          <Audio src={staticFile(`sfx2/${e.s}.wav`)} volume={(e.v ?? 1) * master} />
        </Sequence>
      ))}
    </>
  );
};
/** rota entre variantes: lo que se repite nunca suena dos veces igual seguido */
const rot = (names: string[]) => { let k = 0; return (at: number, v = 0.8): S2 => ({ at, s: names[k++ % names.length], v }); };
const P_ = rot(["pop1", "pop3", "pop2", "pop4"]);
const W_ = rot(["swish_a", "swish_c", "swish_b", "swish_d"]);
const T_ = rot(["tick1", "tick2", "tick3"]);
const RV = rot(["reveal", "reveal2", "reveal3"]);
const PR = rot(["problem", "problem2", "problem3"]);
const SU = rot(["success", "success2", "success3"]);
const CA = rot(["card1", "card2", "card3"]);
const M_ = (at: number, i: number, v = 0.9): S2 => ({ at, s: `mouse${(i % 3) + 1}`, v });
const cuts = [S.office, S.envs, S.code, S.tool, S.plan, S.state, S.git, S.boom, S.cycle, S.tools, S.cicd, S.final].map((s) => s[0]);

const SFX: S2[] = [
  { at: 0, s: "impact", v: 0.7 }, W_(0.08, 0.7), P_(C.vamos),
  ...cuts.map((a) => W_(a - 0.2, 0.6)),
  // a mano
  P_(C.red, 0.7), P_(C.servidor, 0.7), P_(C.base, 0.7),
  { at: C.entras - 0.1, s: "swish_down", v: 0.55 }, { at: C.entras + 0.1, s: "typing_short", v: 0.6 },
  M_(C.clic1, 0), M_(C.clic2, 1), M_(C.clic3, 2),
  PR(C.pero1, 0.85), M_(C.repites + 0.15, 1, 0.7), M_(C.repites + 0.47, 2, 0.7), M_(C.repites + 0.79, 0, 0.7),
  { at: C.olvidas - 0.1, s: "error", v: 0.75 }, SU(C.anda + 0.15, 0.5), { at: C.no1 - 0.1, s: "glitch", v: 0.85 },
  // piezas
  { at: C.entonces - 1.05, s: "riser", v: 0.75 }, ...PIECES.map((a) => RV(a, 0.8)),
  { at: C.codigo, s: "typing", v: 0.7 },
  W_(C.lee - 0.1, 0.45), { at: C.crea - 0.15, s: "build", v: 0.75 }, SU(C.mismo + 0.1, 0.75),
  PR(C.pero2, 0.85), { at: C.antes - 0.1, s: "typing_short", v: 0.65 }, T_(C.crear), T_(C.cambiar), T_(C.borrar),
  { at: C.apruebas - 0.05, s: "stamp", v: 0.9 }, { at: C.aplica + 0.2, s: "build", v: 0.55 }, SU(C.aplica + 0.9, 0.6),
  { at: C.memoria - 0.05, s: "pen", v: 0.8 }, { at: C.creo, s: "pen2", v: 0.7 },
  PR(C.pero3, 0.85), P_(C.quien, 0.7),
  T_(C.historial - 0.1, 0.7), T_(C.historial + 0.15, 0.7), T_(C.historial + 0.4, 0.7),
  P_(C.revisan, 0.5), P_(C.revisan + 0.12, 0.5), P_(C.revisan + 0.24, 0.5),
  { at: C.sale, s: "error", v: 0.75 }, { at: C.vuelves, s: "swish_down", v: 0.65 },
  { at: C.borra - 0.05, s: "crumble", v: 0.9 }, { at: C.borra, s: "glitch", v: 0.6 },
  { at: C.aplicas - 0.15, s: "swish_down", v: 0.6 }, { at: C.aplicas + 0.4, s: "build", v: 0.8 }, SU(C.minutos + 0.2, 0.75),
  // ciclo, herramientas, CI/CD
  ...[C.escribes2, C.revisas, C.aplicas2, C.cambias].map((a) => P_(a - 0.15, 0.6)),
  { at: C.destruyes - 0.15, s: "impact", v: 0.45 }, { at: C.pagarlo, s: "sparkle", v: 0.65 },
  ...TOOLS.map((k) => CA(k.at() - 0.05, 0.85)),
  PR(C.pero4, 0.8), { at: C.comandos - 0.4, s: "typing", v: 0.55 },
  { at: C.cada, s: "conveyor", v: 0.75 }, T_(C.cada + 1.6, 0.7), T_(C.cada + 2.2, 0.7), T_(C.cada + 2.8, 0.7),
  { at: C.pipeline - 0.9, s: "riser", v: 0.65 }, RV(C.pipeline + 0.1, 0.85),
  { at: C.tu - 0.25, s: "impact", v: 0.5 }, ...RECAP.map((_, i) => P_(S.final[0] + 0.3 + i * 0.1, 0.5)), SU(S.final[0] + 0.85, 0.6),
];
/** música: baja mientras habla la voz y sube en los huecos; entra y sale con fundido */
const musicVol = (f: number, fps: number) => {
  const t = f / fps;
  let talk = 0;
  for (let k = -3; k <= 3; k++) {
    const u = t + k * 0.1;
    if (WORDS.some((w) => u >= w.s - 0.05 && u <= w.e + 0.1)) talk += 1 / 7;
  }
  const fade = Math.min(clamp(t / 1.0), clamp((END + 2.1 - t) / 1.4));
  return fade * lerp(1.0, 0.55, talk) * 0.9;
};

// ---------------------------------------------------------------- video
const Layer: React.FC<{ t: number; ab: readonly [number, number]; children: (t: number) => React.ReactNode }> = ({ t, ab, children }) => {
  const { o, z } = sceneT(t, ab[0], ab[1]);
  if (o <= 0) return null;
  return <g opacity={o} transform={`translate(0 ${-LIFT}) translate(540 960) scale(${z}) translate(-540 -960)`}>{children(t)}</g>;
};

const P = (t: number, a: number, b: number, l2: string) => <Title t={t} a={a} b={b} l1="Problema:" l2={l2} c2="#ff5a6a" y={420} size={84} />;
const Pz = (t: number, a: number, b: number, n: number, l2: string) => <Title t={t} a={a} b={b} l1={`Pieza ${n}:`} l2={l2} c2="#4ade80" y={420} size={86} />;
const T2 = (t: number, a: number, b: number, l1: string, l2: string, c2 = "#ffd23f", size = 86) => <Title t={t} a={a} b={b} l1={l1} l2={l2} c2={c2} y={420} size={size} />;
const SY = 745;
// captions abajo, dentro de la zona segura (centro en y = 1440, borde inferior ~1485 < 1500); por eso todo el contenido de las escenas sube LIFT px
const LIFT = 110, CAP_Y = 0.75;

export const IaC: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const t = f / fps;
  return (
    <AbsoluteFill style={{ background: "#0b1030" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Defs />
        <Layer t={t} ab={S.hook}>{(tt) => <Hook t={tt} />}</Layer>
        <Layer t={t} ab={S.office}>{(tt) => <Office t={tt} />}</Layer>
        <Layer t={t} ab={S.envs}>{(tt) => <Envs t={tt} />}</Layer>
        <Layer t={t} ab={S.code}>{(tt) => <Code t={tt} />}</Layer>
        <Layer t={t} ab={S.tool}>{(tt) => <Tool t={tt} />}</Layer>
        <Layer t={t} ab={S.plan}>{(tt) => <PlanScene t={tt} />}</Layer>
        <Layer t={t} ab={S.state}>{(tt) => <StateScene t={tt} />}</Layer>
        <Layer t={t} ab={S.git}>{(tt) => <GitScene t={tt} />}</Layer>
        <Layer t={t} ab={S.boom}>{(tt) => <Boom t={tt} />}</Layer>
        <Layer t={t} ab={S.cycle}>{(tt) => <Cycle t={tt} />}</Layer>
        <Layer t={t} ab={S.tools}>{(tt) => <Tools t={tt} />}</Layer>
        <Layer t={t} ab={S.cicd}>{(tt) => <Cicd t={tt} />}</Layer>
        <Layer t={t} ab={S.final}>{(tt) => <Final t={tt} />}</Layer>
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></radialGradient>
        <rect width={1080} height={1920} fill="url(#vig)" pointerEvents="none" />
      </svg>


      {T2(t, 0.05, C.vamos - 0.1, "Infraestructura", "como código")}
      {T2(t, C.vamos, C.tienes - 0.2, "Problema", "por problema", "#5ee7ff")}
      {T2(t, C.tienes - 0.1, C.entras - 0.1, "Tienes", "una app")}
      {P(t, C.entras, C.pero1 - 0.1, "todo a mano")}
      <Sticker t={t} a={C.clic1} b={C.pero1 - 0.1} x={540} y={SY} text="clic, clic, clic..." rot={-3} size={46} />
      {P(t, C.pero1, C.entonces - 0.1, "pruebas y producción")}
      <Sticker t={t} a={C.olvidas} b={C.entonces - 0.1} x={540} y={SY} text="¡NO SON IGUALES!" bg="#ff5a6a" color="#fff" rot={3} size={50} />
      {Pz(t, C.entonces, C.herramienta - 0.1, 1, "el código")}
      <Sticker t={t} a={C.quieres} b={C.herramienta - 0.1} x={540} y={SY} text="describes QUÉ quieres, no CÓMO" rot={-2} size={38} />
      {Pz(t, C.herramienta, C.pero2 - 0.1, 2, "la herramienta")}
      <Sticker t={t} a={C.mismo} b={C.pero2 - 0.1} x={540} y={SY} text="mismo archivo = mismo resultado" bg="#c4b5fd" rot={2} size={38} />
      {P(t, C.pero2, C.muestra - 0.1, "¿y si te equivocas?")}
      {Pz(t, C.muestra, C.estado - 0.1, 3, "el plan")}
      {Pz(t, C.estado, C.pero3 - 0.1, 4, "el estado")}
      <Sticker t={t} a={C.memoria} b={C.pero3 - 0.1} x={540} y={SY} text="terraform.tfstate" mono bg="#4ade80" rot={-3} size={38} />
      {P(t, C.pero3, C.git - 0.1, "¿quién cambió qué?")}
      {Pz(t, C.git, C.y9 - 0.1, 5, "Git")}
      <Sticker t={t} a={C.vuelves} b={C.y9 - 0.1} x={540} y={SY} text="volver atrás = 1 commit" mono bg="#ffd23f" rot={2} size={36} />
      {P(t, C.borra - 0.1, C.minutos - 0.2, "se borró todo")}
      {T2(t, C.minutos - 0.15, C.asi - 0.15, "En minutos,", "otra vez en pie", "#4ade80")}
      {T2(t, C.asi, C.con - 0.15, "El ciclo de vida", "de la infraestructura", "#5ee7ff", 80)}
      <Sticker t={t} a={C.pagarlo - 0.1} b={C.con - 0.15} x={540} y={SY} text="lo que no existe, no se paga" bg="#4ade80" rot={-2} size={38} />
      {T2(t, C.con, C.pero4 - 0.1, "¿Con qué", "se hace?")}
      {P(t, C.pero4, C.cada - 0.1, "todavía a mano")}
      {T2(t, C.cada, C.pipeline - 0.1, "¿Y si se aplicara", "solo?", "#ffd23f", 82)}
      {T2(t, C.pipeline, C.tu - 0.15, "Próximo video:", "pipelines de CI/CD", "#5ee7ff", 84)}
      {T2(t, C.tu - 0.1, END + 2.2, "¿Tú qué", "herramienta usas?")}

      <WordCaptions words={WORDS} look="pop" y={CAP_Y} size={78} />
      {audio ? <Audio src={staticFile("iac/voice.wav")} /> : null}
      {audio ? <Audio src={staticFile("iac/music.wav")} volume={(fr) => musicVol(fr, fps)} /> : null}
      {audio ? <SfxTrack2 events={SFX} master={0.85} /> : null}
    </AbsoluteFill>
  );
};
