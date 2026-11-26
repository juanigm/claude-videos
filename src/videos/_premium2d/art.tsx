// Kit de ilustración 2D premium (SVG): degradados suaves, sombras proyectadas, brillos y luz cálida.
// Estilo oficial del canal desde 2026-11-23 (ver CANAL.md). Todo se dibuja en un lienzo de 1080 x 1920.
import React from "react";
import { clamp, ease, rnd } from "../_cartoon3d/kit";

export const PAL = {
  ink: "#1b2240", night0: "#0b1030", night1: "#1d2a5a", dusk0: "#2d2a6b", dusk1: "#e9897e", dusk2: "#ffc98b",
  day0: "#7cc7ff", day1: "#dff3ff", grass0: "#7fd18b", grass1: "#4fae6b", soil0: "#8a5a3c", soil1: "#5e3a26",
  wall: "#fff3dc", wallShade: "#f1dcb8", roof0: "#e2574c", roof1: "#b83b37", glass: "#ffe6a3",
  cyan: "#5ee7ff", blue: "#3b82f6", green: "#4ade80", red: "#ff5a6a", yellow: "#ffd23f", white: "#ffffff",
};

/** filtros y degradados compartidos: van una sola vez dentro del <svg> */
export const Defs: React.FC = () => (
  <defs>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0b1530" floodOpacity="0.28" /></filter>
    <filter id="shSm" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0b1530" floodOpacity="0.25" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="glowSm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="blur20"><feGaussianBlur stdDeviation="20" /></filter>
    <linearGradient id="gDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.dusk0} /><stop offset="0.55" stopColor={PAL.dusk1} /><stop offset="1" stopColor={PAL.dusk2} /></linearGradient>
    <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.night0} /><stop offset="1" stopColor={PAL.night1} /></linearGradient>
    <linearGradient id="gDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.day0} /><stop offset="1" stopColor={PAL.day1} /></linearGradient>
    <linearGradient id="gSpace" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05071a" /><stop offset="1" stopColor="#141c44" /></linearGradient>
    <linearGradient id="gGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.grass0} /><stop offset="1" stopColor={PAL.grass1} /></linearGradient>
    <linearGradient id="gSoil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.soil0} /><stop offset="1" stopColor={PAL.soil1} /></linearGradient>
    <linearGradient id="gWall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={PAL.wall} /><stop offset="1" stopColor={PAL.wallShade} /></linearGradient>
    <linearGradient id="gRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.roof0} /><stop offset="1" stopColor={PAL.roof1} /></linearGradient>
    <linearGradient id="gMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4f7fb" /><stop offset="1" stopColor="#a9b4c6" /></linearGradient>
    <linearGradient id="gPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3f6fd8" /><stop offset="1" stopColor="#1c3279" /></linearGradient>
    <linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b4e8a" /><stop offset="1" stopColor="#0a1f45" /></linearGradient>
    <radialGradient id="gEarth" cx="0.38" cy="0.35" r="0.75"><stop offset="0" stopColor="#5fb6ff" /><stop offset="0.7" stopColor="#1f5fbf" /><stop offset="1" stopColor="#123877" /></radialGradient>
    <radialGradient id="gNightSide" cx="0.85" cy="0.7" r="0.8"><stop offset="0" stopColor="#020617" stopOpacity="0.75" /><stop offset="0.6" stopColor="#020617" stopOpacity="0.15" /><stop offset="1" stopColor="#020617" stopOpacity="0" /></radialGradient>
    <radialGradient id="gWarm" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd88a" stopOpacity="0.9" /><stop offset="1" stopColor="#ffd88a" stopOpacity="0" /></radialGradient>
    <linearGradient id="gBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={PAL.cyan} stopOpacity="0.7" /><stop offset="1" stopColor={PAL.cyan} stopOpacity="0.05" /></linearGradient>
    <linearGradient id="gFiber" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7af3ff" /><stop offset="1" stopColor="#3cc3ff" /></linearGradient>
  </defs>
);

export const Stars: React.FC<{ t: number; n?: number; h?: number; seed?: number }> = ({ t, n = 90, h = 1300, seed = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const k = i + seed * 100;
      const tw = 0.5 + 0.5 * Math.sin(t * (1 + rnd(k) * 2) + k);
      return <circle key={i} cx={rnd(k + 1) * 1080} cy={rnd(k + 2) * h} r={0.8 + rnd(k + 3) * 2.2} fill="#ffffff" opacity={0.25 + 0.6 * tw} />;
    })}
  </g>
);

/** colinas en capas (paisaje de campo) */
export const Hills: React.FC<{ y: number; tone?: "dusk" | "day" | "night" }> = ({ y, tone = "day" }) => {
  const c = tone === "dusk" ? ["#7a6aa8", "#5d8a6e", "#4e9a62"] : tone === "night" ? ["#22305e", "#1d3b4a", "#1f4a3c"] : ["#a5d8b0", "#7fcf8f", "#5fbf74"];
  return (
    <g>
      <path d={`M0 ${y - 90} C 200 ${y - 170}, 380 ${y - 60}, 560 ${y - 120} S 900 ${y - 190}, 1080 ${y - 110} L1080 ${y + 400} L0 ${y + 400} Z`} fill={c[0]} />
      <path d={`M0 ${y - 30} C 260 ${y - 110}, 520 ${y + 10}, 760 ${y - 60} S 980 ${y - 80}, 1080 ${y - 40} L1080 ${y + 400} L0 ${y + 400} Z`} fill={c[1]} />
      <path d={`M0 ${y + 20} C 300 ${y - 20}, 700 ${y + 40}, 1080 ${y + 10} L1080 ${y + 400} L0 ${y + 400} Z`} fill={c[2]} />
    </g>
  );
};

export const Tree: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#shSm)">
    <rect x={-12} y={-120} width={24} height={120} rx={8} fill="#7a4a2c" />
    {[[0, -190, 90], [-60, -150, 64], [62, -150, 66], [0, -250, 64]].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#3f9d5a" : "#4fb267"} />
    ))}
    <circle cx={-25} cy={-215} r={34} fill="#6ccb82" opacity={0.6} />
  </g>
);

/** casa vista desde afuera */
export const HouseExt: React.FC<{ x: number; y: number; s?: number; lit?: number; dish?: number }> = ({ x, y, s = 1, lit = 1, dish = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={230} ry={26} fill="#0b1530" opacity={0.18} />
    <g filter="url(#sh)">
      <rect x={-170} y={-230} width={340} height={230} rx={6} fill="url(#gWall)" />
      <path d="M-200 -222 L0 -370 L200 -222 Z" fill="url(#gRoof)" />
      <rect x={90} y={-345} width={36} height={80} fill="#a84a40" />
    </g>
    <rect x={-30} y={-110} width={64} height={110} rx={6} fill="#8a5a3c" />
    <circle cx={22} cy={-55} r={4} fill="#ffd23f" />
    {[[-120, -180], [70, -180]].map(([wx, wy], i) => (
      <g key={i}>
        <rect x={wx} y={wy} width={70} height={64} rx={6} fill={lit > 0.5 ? PAL.glass : "#9ec7e6"} />
        {lit > 0.5 ? <rect x={wx - 30} y={wy - 30} width={130} height={124} fill="url(#gWarm)" opacity={0.55 * lit} /> : null}
        <path d={`M${wx + 35} ${wy} V${wy + 64} M${wx} ${wy + 32} H${wx + 70}`} stroke="#ffffff" strokeWidth={5} opacity={0.8} />
      </g>
    ))}
    {dish > 0 ? (
      <g transform={`translate(-60 -300) scale(${dish}) rotate(-25)`} filter="url(#shSm)">
        <rect x={-6} y={0} width={12} height={40} fill="#8b95a8" />
        <rect x={-46} y={-30} width={92} height={60} rx={10} fill="url(#gMetal)" />
      </g>
    ) : null}
  </g>
);

export const Satellite: React.FC<{ x: number; y: number; s?: number; rot?: number; glow?: boolean }> = ({ x, y, s = 1, rot = 0, glow = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} filter={glow ? "url(#glowSm)" : undefined}>
    {[-1, 1].map((d) => (
      <g key={d}>
        <rect x={d > 0 ? 40 : -150} y={-26} width={110} height={52} rx={4} fill="url(#gPanel)" stroke="#9cc0ff" strokeWidth={2} />
        {[1, 2, 3].map((k) => <line key={k} x1={(d > 0 ? 40 : -150) + k * 27.5} y1={-26} x2={(d > 0 ? 40 : -150) + k * 27.5} y2={26} stroke="#9cc0ff" strokeWidth={1.5} opacity={0.6} />)}
        <rect x={d > 0 ? 28 : -40} y={-4} width={12} height={8} fill="#c8d2e2" />
      </g>
    ))}
    <rect x={-28} y={-34} width={56} height={68} rx={8} fill="url(#gMetal)" />
    <rect x={-18} y={-22} width={36} height={14} rx={3} fill="#e7b04a" />
    <circle cx={0} cy={44} r={7} fill="#e7eef8" />
  </g>
);

export const Earth: React.FC<{ cx: number; cy: number; r: number; t: number; lights?: number }> = ({ cx, cy, r, t, lights = 0 }) => {
  const spin = (t * 6) % 360;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.07} fill="#62c8ff" opacity={0.18} filter="url(#blur20)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#gEarth)" />
      <clipPath id={`ec${Math.round(cx)}${Math.round(cy)}`}><circle cx={cx} cy={cy} r={r} /></clipPath>
      <g clipPath={`url(#ec${Math.round(cx)}${Math.round(cy)})`}>
        {/* continentes estilizados que se desplazan (la Tierra gira) */}
        {Array.from({ length: 9 }, (_, i) => {
          const x = cx - r + ((rnd(i) * 2.4 * r + spin / 360 * 2.4 * r) % (2.4 * r)) - 0.2 * r;
          const y = cy + (rnd(i + 4) - 0.5) * 1.3 * r;
          const w = r * (0.25 + rnd(i + 8) * 0.35), h = r * (0.15 + rnd(i + 9) * 0.25);
          return <ellipse key={i} cx={x} cy={y} rx={w} ry={h} fill="#55c27a" opacity={0.95} transform={`rotate(${rnd(i + 2) * 60 - 30} ${x} ${y})`} />;
        })}
        {lights > 0 ? Array.from({ length: 140 }, (_, i) => {
          const x = cx + (rnd(i + 50) - 0.5) * 1.8 * r, y = cy + (rnd(i + 70) - 0.5) * 1.6 * r;
          return <circle key={i} cx={x} cy={y} r={2 + rnd(i) * 2.5} fill="#fff2b0" opacity={lights * clamp(lights * 3 - rnd(i + 90) * 2)} filter="url(#glowSm)" />;
        }) : null}
        <circle cx={cx} cy={cy} r={r} fill="url(#gNightSide)" />
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#a8e3ff" strokeWidth={3} opacity={0.6} />
    </g>
  );
};

/** antena plana (vista frontal), con opción de "abrirla" y ver las antenitas */
export const FlatDish: React.FC<{ x: number; y: number; s?: number; open?: number; t?: number; tilt?: number }> = ({ x, y, s = 1, open = 0, t = 0, tilt = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={250} rx={130} ry={18} fill="#0b1530" opacity={0.2} />
    <rect x={-10} y={60} width={20} height={190} rx={6} fill="#c8d0dc" filter="url(#shSm)" />
    <rect x={-60} y={236} width={120} height={18} rx={9} fill="#9aa5b8" />
    <g transform={`rotate(${tilt})`}>
      {/* grilla de antenitas que queda a la vista */}
      <rect x={-170} y={-130} width={340} height={210} rx={22} fill="#1a2552" filter="url(#sh)" />
      {Array.from({ length: 8 }, (_, r) => Array.from({ length: 13 }, (_, c) => {
        const on = 0.5 + 0.5 * Math.sin(t * 3 + r * 0.7 + c * 0.4);
        return <circle key={`${r}-${c}`} cx={-150 + c * 25} cy={-110 + r * 25} r={6.5} fill={PAL.cyan} opacity={0.35 + 0.65 * on * open} />;
      }))}
      {/* tapa blanca que se levanta */}
      <g transform={`translate(${open * 230} ${-open * 170}) rotate(${open * 18})`} opacity={1 - 0.15 * open}>
        <rect x={-174} y={-134} width={348} height={218} rx={24} fill="url(#gMetal)" filter="url(#sh)" />
        <rect x={-150} y={-112} width={300} height={10} rx={5} fill="#ffffff" opacity={0.7} />
      </g>
    </g>
  </g>
);

/** plato parabólico clásico (de perfil) */
export const ParabolicDish: React.FC<{ x: number; y: number; s?: number; rot?: number; big?: boolean }> = ({ x, y, s = 1, rot = -30, big }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#shSm)">
    <rect x={-10} y={0} width={20} height={big ? 160 : 110} rx={6} fill="#b8c2d2" />
    {big ? <rect x={-70} y={150} width={140} height={22} rx={8} fill="#8b95a8" /> : null}
    <g transform={`rotate(${rot})`}>
      <path d="M-110 -10 Q0 90 110 -10 Z" fill="url(#gMetal)" stroke="#8b95a8" strokeWidth={3} />
      <line x1={0} y1={30} x2={0} y2={-70} stroke="#8b95a8" strokeWidth={6} />
      <circle cx={0} cy={-74} r={10} fill="#e2e8f0" />
    </g>
  </g>
);

export const Router: React.FC<{ x: number; y: number; s?: number; on?: number; t?: number }> = ({ x, y, s = 1, on = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#shSm)">
    {[-38, 0, 38].map((ax, i) => <rect key={i} x={ax - 4} y={-62} width={8} height={50} rx={4} fill="#1f2937" transform={`rotate(${(i - 1) * 12} ${ax} -12)`} />)}
    <rect x={-60} y={-18} width={120} height={34} rx={10} fill="#111827" />
    {[0, 1, 2, 3].map((k) => <circle key={k} cx={-36 + k * 24} cy={0} r={4} fill={on > 0.5 && Math.sin(t * 7 + k * 2) > -0.3 ? PAL.green : "#334155"} />)}
  </g>
);

/** arcos de WiFi que se expanden */
export const WifiRings: React.FC<{ x: number; y: number; t: number; on: number; max?: number; color?: string }> = ({ x, y, t, on, max = 220, color = PAL.cyan }) => {
  if (on <= 0) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const u = (t * 0.8 + i / 3) % 1;
        return <circle key={i} cx={x} cy={y} r={20 + u * max} fill="none" stroke={color} strokeWidth={5} opacity={on * (1 - u) * 0.9} />;
      })}
    </g>
  );
};

/** ícono de WiFi (para tachar o mostrar señal) */
export const WifiIcon: React.FC<{ x: number; y: number; s?: number; color?: string; crossed?: number }> = ({ x, y, s = 1, color = "#ffffff", crossed = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[60, 40, 20].map((r, i) => <path key={i} d={`M${-r} ${-r * 0.2} A ${r} ${r} 0 0 1 ${r} ${-r * 0.2}`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" transform={`translate(0 ${i * 4})`} />)}
    <circle cx={0} cy={18} r={8} fill={color} />
    {crossed > 0 ? <line x1={-60} y1={-50} x2={-60 + 120 * crossed} y2={-50 + 90 * crossed} stroke={PAL.red} strokeWidth={12} strokeLinecap="round" /> : null}
  </g>
);

export const Phone: React.FC<{ x: number; y: number; s?: number; on?: number; content?: React.ReactNode }> = ({ x, y, s = 1, on = 1, content }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#shSm)">
    <rect x={-34} y={-62} width={68} height={124} rx={12} fill="#111827" />
    <rect x={-29} y={-54} width={58} height={108} rx={8} fill={on > 0.5 ? "#60a5fa" : "#334155"} />
    {content}
  </g>
);

/** pulso de luz / paquete que viaja */
export const Pulse: React.FC<{ x: number; y: number; r?: number; color?: string }> = ({ x, y, r = 10, color = "#ffffff" }) => (
  <circle cx={x} cy={y} r={r} fill={color} filter="url(#glowSm)" />
);

/** posición sobre una polilínea (u en 0..1) */
export const alongPath = (pts: [number, number][], u: number): [number, number] => {
  const L = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = clamp(u) * L.reduce((s, x) => s + x, 0);
  for (let i = 0; i < L.length; i++) {
    if (d <= L[i] || i === L.length - 1) {
      const k = L[i] ? d / L[i] : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    d -= L[i];
  }
  return pts[pts.length - 1];
};

/** visibilidad de una escena con fundido y un leve zoom de entrada */
export const sceneT = (t: number, a: number, b: number, f = 0.35) => {
  const o = Math.min(clamp((t - a + f / 2) / f), 1 - clamp((t - b + f / 2) / f));
  const z = 1.06 - 0.06 * ease(clamp((t - a + f / 2) / 0.8));
  return { o, z };
};
