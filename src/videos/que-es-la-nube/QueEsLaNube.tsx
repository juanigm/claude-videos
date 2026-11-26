// "¿Qué es la nube de verdad?" - 1080 x 1350 (4:5) para LinkedIn.
// Cada escena y cada animación arranca en una palabra de la voz (cue() busca la palabra en words.json),
// así que con una voz nueva solo hay que volver a transcribir.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "@fontsource/jetbrains-mono/700.css";
import { joinWords, Word, WordCaptions } from "../../captions/WordCaptions";
import raw from "../../../shorts/que-es-la-nube/voice/words.json";

export const FPS = 30;
const WORDS: Word[] = joinWords(raw as Word[]);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const cue = (key: string, n = 1) => {
  let k = 0;
  for (const w of WORDS) if (norm(w.w) === norm(key) && ++k === n) return w.s;
  throw new Error(`cue no encontrado: ${key} #${n}`);
};

const C = {
  fotos: cue("fotos"), que: cue("qué"), spoiler: cue("spoiler"), noHay: cue("no", 1), otro: cue("otro"),
  cualquier: cue("cualquier"), edificios: cue("edificios"), servidores: cue("servidores"), data: cue("data"),
  cientos: cue("cientos"), empresas: cue("empresas"), aws: cue("aws"), azure: cue("azure"), google: cue("google"),
  construyen: cue("construyen"), enfrian: cue("enfrían"), protegen: cue("protegen"), disco: cue("disco"),
  vos: cue("vos"), compras: cue("comprás"), alquilas: cue("alquilás"), pagas: cue("pagás"), necesitas: cue("necesitás", 1),
  listo: cue("listo"), borras: cue("borrás"), dejas: cue("dejás"), hardware: cue("hardware"), cambia: cue("cambia"),
  encarga: cue("encarga"), eso: cue("eso", 2), configuras: cue("configurás"), protegesVos: cue("protegés"),
  armas: cue("armás"), resp: cue("responsabilidad"), cual: cue("cuál"),
};
const LAST = WORDS[WORDS.length - 1].e;
export const DURATION = Math.ceil((LAST + 1.4) * FPS);

// ---------------------------------------------------------------- helpers
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (t: number, a: number, d = 0.35) => clamp((t - a) / d);
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const back = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2));
const pop = (t: number, a: number, d = 0.4) => back(ramp(t, a, d));
/** visible de a a b, con fundido de entrada y salida */
const vis = (t: number, a: number, b: number, f = 0.3) => Math.min(ramp(t, a - 0.05, f), 1 - ramp(t, b - f, f));
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const COL = {
  bg0: "#0b1220", bg1: "#14203a", card: "#16213a", line: "#2a3a5c", text: "#e8eef7", dim: "#8a9bbd",
  accent: "#38bdf8", yellow: "#ffd166", red: "#ff5d6c", green: "#4ade80",
  aws: "#ff9900", azure: "#0078d4", gcp: ["#4285f4", "#ea4335", "#fbbc04", "#34a853"],
};
const SANS = "Grotesk, sans-serif";
const MONO = '"JetBrains Mono", monospace';

const useFonts = () => {
  const [h] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    const ff = new FontFace("Grotesk", `url(${staticFile("fonts/SpaceGrotesk-Bold.ttf")})`, { weight: "700" });
    Promise.all([
      ff.load().then((f) => (document.fonts as unknown as Set<FontFace>).add(f)),
      document.fonts.load('700 40px "JetBrains Mono"'),
    ]).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

const Label: React.FC<{ x: number; y: number; size?: number; color?: string; o?: number; mono?: boolean; children: React.ReactNode; anchor?: "middle" | "start" | "end" }> =
  ({ x, y, size = 44, color = COL.text, o = 1, mono, children, anchor = "middle" }) => (
    <text x={x} y={y} fontSize={size} fill={color} opacity={o} textAnchor={anchor} fontFamily={mono ? MONO : SANS} fontWeight={700}>{children}</text>
  );

// ---------------------------------------------------------------- piezas
const CloudShape: React.FC<{ fill: string }> = ({ fill }) => (
  <g fill={fill}>
    <circle cx={-150} cy={20} r={105} /><circle cx={-30} cy={-55} r={140} /><circle cx={120} cy={-5} r={115} />
    <circle cx={215} cy={50} r={72} /><rect x={-250} y={20} width={480} height={122} rx={61} />
  </g>
);

const Rack: React.FC<{ x: number; y: number; s?: number; t: number; seed?: number; o?: number }> = ({ x, y, s = 1, t, seed = 0, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-90} y={-170} width={180} height={340} rx={14} fill="#1b2944" stroke="#3b5079" strokeWidth={4} />
    {Array.from({ length: 7 }, (_, i) => {
      const on = Math.sin(t * (3 + rnd(i + seed * 13) * 5) + i * 2.1 + seed) > -0.2;
      return (
        <g key={i} transform={`translate(0 ${-140 + i * 44})`}>
          <rect x={-72} y={0} width={144} height={34} rx={6} fill="#0f1a2e" />
          <circle cx={-52} cy={17} r={6} fill={on ? COL.green : "#1f3b2a"} />
          <circle cx={-34} cy={17} r={6} fill={on && i % 2 ? COL.accent : "#173246"} />
          <rect x={-10} y={13} width={66} height={8} rx={4} fill="#2a3a5c" />
        </g>
      );
    })}
  </g>
);

const Card: React.FC<{ x: number; y: number; w: number; h: number; stroke?: string; o?: number; s?: number; children?: React.ReactNode }> =
  ({ x, y, w, h, stroke = COL.line, o = 1, s = 1, children }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={COL.card} stroke={stroke} strokeWidth={4} />
      {children}
    </g>
  );

const Person: React.FC<{ x: number; y: number; o?: number; s?: number }> = ({ x, y, o = 1, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-120} r={52} fill={COL.yellow} />
    <path d="M -95 60 Q -95 -50 0 -50 Q 95 -50 95 60 Z" fill={COL.yellow} />
    <path d="M -120 40 L 120 40 L 100 -40 L -100 -40 Z" fill="#c7d2e4" />
    <rect x={-140} y={40} width={280} height={18} rx={8} fill="#9fb0cc" />
    <circle cx={0} cy={0} r={10} fill={COL.accent} />
  </g>
);

const Building: React.FC<{ x: number; y: number; s?: number; t: number; o?: number; fill?: number }> = ({ x, y, s = 1, t, o = 1, fill = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <rect x={-380} y={-230} width={760} height={460} rx={22} fill="#111b30" stroke="#3b5079" strokeWidth={5} />
    <path d="M -380 -230 L 0 -320 L 380 -230 Z" fill="#1b2944" stroke="#3b5079" strokeWidth={5} />
    {Array.from({ length: 3 }, (_, r) => Array.from({ length: 6 }, (_, c) => {
      const i = r * 6 + c;
      const a = clamp(fill * 18 - i);
      return <Rack key={i} x={-300 + c * 120} y={-140 + r * 140} s={0.33 * (0.6 + 0.4 * a)} t={t} seed={i} o={a} />;
    }))}
  </g>
);

// íconos de 120 px
const Icon: React.FC<{ kind: "ladrillo" | "frio" | "escudo" | "disco"; t: number }> = ({ kind, t }) => {
  const st = { fill: "none", stroke: COL.text, strokeWidth: 8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "ladrillo") return (
    <g fill="#c2410c" stroke="#fdba74" strokeWidth={4} transform="scale(0.78) translate(0 -8)">
      {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
        <rect key={`${r}${c}`} x={-75 + c * 50 + (r % 2 ? -25 : 0)} y={-45 + r * 32} width={48} height={28} rx={4} />
      )))}
    </g>
  );
  if (kind === "frio") return (
    <g {...st} stroke="#7dd3fc" transform={`rotate(${t * 20})`}>
      {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-60} x2={0} y2={60} transform={`rotate(${a})`} />)}
      {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M -16 -42 L 0 -26 L 16 -42" transform={`rotate(${a})`} />)}
    </g>
  );
  if (kind === "escudo") return (
    <g>
      <path d="M 0 -62 L 52 -42 C 52 12 30 46 0 64 C -30 46 -52 12 -52 -42 Z" fill="#14532d" stroke={COL.green} strokeWidth={7} />
      <path d="M -20 2 L -4 18 L 24 -14" {...st} stroke={COL.green} />
    </g>
  );
  return (
    <g>
      <circle r={52} fill="#334155" stroke="#cbd5e1" strokeWidth={6} />
      <circle r={14} fill="#cbd5e1" />
      <g transform={`rotate(${t * 140})`}><path d="M 0 -76 A 76 76 0 0 1 76 0" {...st} stroke={COL.yellow} /><path d="M 64 -6 L 76 6 L 88 -6" {...st} stroke={COL.yellow} /></g>
    </g>
  );
};

// ---------------------------------------------------------------- escenas
const W = 1080, CX = 540, CY = 760;

const SceneCloud: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 0, C.spoiler + 1.0);
  const burst = ramp(t, C.spoiler, 0.9);
  const enter = ease(ramp(t, 0, 0.6));
  const q = pop(t, C.que - 0.1, 0.45);
  return (
    <g opacity={o}>
      <g transform={`translate(${CX} ${CY - 20 + (1 - enter) * 60})`}>
        <g opacity={(1 - burst) * enter} transform={`scale(${1 + 0.06 * Math.sin(t * 2)})`}>
          <CloudShape fill="rgba(56,189,248,0.18)" />
          <g transform="scale(0.94)"><CloudShape fill="#dfe8f5" /></g>
        </g>
        {burst > 0 && Array.from({ length: 46 }, (_, i) => {
          const a = rnd(i) * Math.PI * 2, d = (120 + rnd(i + 50) * 320) * ease(burst);
          return <circle key={i} cx={(rnd(i + 9) - 0.5) * 400 + Math.cos(a) * d} cy={(rnd(i + 19) - 0.5) * 180 + Math.sin(a) * d} r={10 + rnd(i + 3) * 26} fill="#dfe8f5" opacity={1 - burst} />;
        })}
        {/* fotos que vuelan a la nube */}
        {Array.from({ length: 5 }, (_, i) => {
          const u = ease(ramp(t, C.fotos - 0.15 + i * 0.22, 0.75));
          if (u <= 0 || u >= 1) return null;
          const sx = -420 + i * 210, sy = 520;
          return (
            <g key={i} transform={`translate(${sx * (1 - u)} ${sy * (1 - u) + 10}) rotate(${(i - 2) * 12 * (1 - u)}) scale(${1 - 0.7 * u})`}>
              <rect x={-55} y={-62} width={110} height={124} rx={8} fill="#fff" />
              <rect x={-45} y={-52} width={90} height={80} rx={4} fill={[COL.accent, COL.yellow, COL.green, "#f472b6", "#a78bfa"][i]} />
            </g>
          );
        })}
      </g>
      <g transform={`translate(${CX + 300} ${CY - 250}) scale(${q}) rotate(${12 * Math.sin(t * 3)})`} opacity={1 - burst}>
        <Label x={0} y={60} size={190} color={COL.yellow}>?</Label>
      </g>
    </g>
  );
};

const SceneServer: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, C.noHay - 0.2, C.edificios + 0.1);
  const s = pop(t, C.noHay - 0.2, 0.5);
  const tag = pop(t, C.otro - 0.15, 0.4);
  const multi = ease(ramp(t, C.cualquier, 0.6));
  return (
    <g opacity={o}>
      {[-1, 1].map((d) => <Rack key={d} x={CX + d * 260 * multi} y={CY} s={1.1 - 0.25 * multi} t={t} seed={d + 5} o={multi * 0.85} />)}
      <Rack x={CX} y={CY} s={(1.4 - 0.4 * multi) * s} t={t} />
      <g transform={`translate(${CX + 170 - 60 * multi} ${CY - 250}) rotate(${-8 + 3 * Math.sin(t * 2)}) scale(${tag})`}>
        <rect x={-150} y={-46} width={300} height={92} rx={18} fill={COL.yellow} />
        <circle cx={-118} cy={0} r={12} fill={COL.bg0} />
        <Label x={18} y={16} size={44} color={COL.bg0}>DE OTRO</Label>
      </g>
    </g>
  );
};

const SceneDC: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, C.edificios - 0.1, C.cientos + 0.1);
  const b = pop(t, C.edificios - 0.1, 0.55);
  const fill = ramp(t, C.servidores - 0.3, 1.2);
  const lab = pop(t, C.data - 0.1, 0.4);
  return (
    <g opacity={o}>
      <Building x={CX} y={CY + 10} s={1.12 * b} t={t} fill={fill} />
      <g transform={`translate(${CX} ${CY + 380}) scale(${lab})`}>
        <rect x={-230} y={-50} width={460} height={88} rx={44} fill={COL.accent} />
        <Label x={0} y={12} size={46} color={COL.bg0} mono>DATA CENTER</Label>
      </g>
    </g>
  );
};

// puntos en latitud/longitud aproximados de zonas con regiones cloud
const SITES = [[40, -77], [37, -122], [45, -122], [43, -79], [-23, -46], [-33, -70], [53, -8], [51, 0], [50, 8], [48, 2], [59, 18], [45, 9],
  [25, 55], [1, 103], [35, 139], [37, 127], [22, 114], [19, 72], [-33, 151], [-37, 144], [-26, 28], [31, 121], [39, 116], [52, 13], [40, -3], [19, -99], [-34, -58]];
const SceneGlobe: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, C.cientos - 0.1, C.empresas + 0.1);
  const R = 330, rot = -1.2 + (t - C.cientos) * 0.35;
  const g = ease(ramp(t, C.cientos - 0.1, 0.5));
  return (
    <g opacity={o} transform={`translate(${CX} ${CY}) scale(${0.8 + 0.2 * g})`}>
      <circle r={R} fill="#0f1a2e" stroke="#3b5079" strokeWidth={4} />
      {[-60, -30, 0, 30, 60].map((la) => <ellipse key={la} cx={0} cy={-R * Math.sin((la * Math.PI) / 180)} rx={R * Math.cos((la * Math.PI) / 180)} ry={18 * Math.cos((la * Math.PI) / 180)} fill="none" stroke="#24365a" strokeWidth={3} />)}
      {[0, 1, 2, 3, 4, 5].map((k) => <ellipse key={k} cx={0} cy={0} rx={Math.abs(R * Math.sin(rot + (k * Math.PI) / 6))} ry={R} fill="none" stroke="#24365a" strokeWidth={3} />)}
      {SITES.map(([la, lo], i) => {
        const lat = (la * Math.PI) / 180, lon = (lo * Math.PI) / 180 + rot;
        if (Math.cos(lon) < 0.05) return null;
        const a = pop(t, C.cientos + i * 0.06, 0.35);
        const x = R * Math.cos(lat) * Math.sin(lon), y = -R * Math.sin(lat);
        return <g key={i} transform={`translate(${x} ${y}) scale(${a})`}><circle r={22} fill={COL.yellow} opacity={0.25} /><circle r={10} fill={COL.yellow} /></g>;
      })}
    </g>
  );
};

const SceneProviders: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, C.empresas - 0.1, C.vos + 0.1);
  const cards = [
    { name: "AWS", at: C.aws, color: COL.aws },
    { name: "Azure", at: C.azure, color: COL.azure },
    { name: "Google Cloud", at: C.google, color: COL.gcp[0] },
  ];
  const icons = [
    { k: "ladrillo" as const, at: C.construyen, l: "construyen" },
    { k: "frio" as const, at: C.enfrian, l: "enfrían" },
    { k: "escudo" as const, at: C.protegen, l: "protegen" },
    { k: "disco" as const, at: C.disco, l: "cambian discos" },
  ];
  return (
    <g opacity={o}>
      {cards.map((c, i) => {
        const s = pop(t, c.at - 0.15, 0.4);
        return (
          <Card key={c.name} x={200 + i * 340} y={570} w={310} h={230} stroke={c.color} s={s} o={clamp(s * 2)}>
            {i === 2
              ? COL.gcp.map((g, k) => <rect key={g} x={-110 + k * 56} y={-80} width={50} height={14} rx={7} fill={g} />)
              : <rect x={-110} y={-80} width={220} height={14} rx={7} fill={c.color} />}
            <Label x={0} y={i === 2 ? 22 : 34} size={i === 2 ? 46 : 66} color={COL.text}>{i === 2 ? "Google" : c.name}</Label>
            {i === 2 ? <Label x={0} y={80} size={46} color={COL.text}>Cloud</Label> : null}
          </Card>
        );
      })}
      {icons.map((ic, i) => {
        const s = pop(t, ic.at - 0.12, 0.4);
        const x = 160 + i * 253;
        return (
          <g key={ic.k} transform={`translate(${x} 990)`} opacity={clamp(s * 2)}>
            <circle r={95 * s} fill="#13203a" stroke={COL.line} strokeWidth={4} />
            <g transform={`scale(${s})`}><Icon kind={ic.k} t={t} /></g>
            <Label x={0} y={155} size={38} color={COL.dim}>{ic.l}</Label>
          </g>
        );
      })}
    </g>
  );
};

/** medidor: corre de "pagás" a "dejás", más rápido mientras el servidor existe */
const meterValue = (t: number) => {
  const run = (a: number, b: number, rate: number) => Math.max(0, Math.min(t, b) - a) * rate;
  return run(C.pagas, C.listo, 0.0004) + run(C.listo, C.dejas, 0.0031);
};

const SceneYou: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, C.vos - 0.1, C.hardware + 0.05);
  const p = pop(t, C.vos - 0.1, 0.45);
  const dc = vis(t, C.vos + 0.1, C.alquilas + 0.1) * pop(t, C.vos + 0.1, 0.45);
  const x = ease(ramp(t, C.compras, 0.35));
  const m = pop(t, C.alquilas - 0.1, 0.45);
  const running = t >= C.pagas && t < C.dejas;
  const srv = pop(t, C.necesitas - 0.1, 0.4) * (1 - ease(ramp(t, C.borras, 0.6)));
  const bar = ease(ramp(t, C.necesitas + 0.3, C.listo - C.necesitas - 0.3));
  const ok = pop(t, C.listo, 0.35);
  return (
    <g opacity={o}>
      <Person x={270} y={CY + 140} s={1.25 * p} o={clamp(p * 2)} />
      <Label x={270} y={CY + 290} size={40} color={COL.dim} o={p}>vos</Label>
      {/* el data center que no comprás */}
      <g opacity={dc} transform={`translate(780 ${CY + 80}) scale(${0.42 * dc})`}>
        <Building x={0} y={0} t={t} fill={1} />
        <g stroke={COL.red} strokeWidth={34} strokeLinecap="round">
          <line x1={-380} y1={-300} x2={-380 + 760 * x} y2={-300 + 560 * x} />
          <line x1={380} y1={-300} x2={380 - 760 * x} y2={-300 + 560 * x} opacity={x > 0.5 ? 1 : 0} />
        </g>
      </g>
      {/* medidor de consumo */}
      <g transform={`translate(${CX} 380) scale(${m})`} opacity={clamp(m * 2)}>
        <rect x={-400} y={-80} width={800} height={160} rx={30} fill="#0f1a2e" stroke={running ? COL.green : COL.line} strokeWidth={5} />
        <Label x={-360} y={-25} size={30} color={COL.dim} anchor="start">COSTO</Label>
        <Label x={-360} y={50} size={66} color={COL.text} anchor="start" mono>$ {meterValue(t).toFixed(4)}</Label>
        <circle cx={240} cy={0} r={14} fill={running ? COL.green : "#475569"} opacity={running ? 0.5 + 0.5 * Math.sin(t * 8) : 1} />
        <Label x={270} y={12} size={32} color={running ? COL.green : COL.dim} anchor="start">{running ? "usando" : t >= C.dejas ? "detenido" : "—"}</Label>
      </g>
      {/* servidor bajo demanda */}
      <g transform={`translate(780 ${CY + 80}) scale(${srv})`} opacity={clamp(srv * 2)}>
        <rect x={-200} y={-150} width={400} height={300} rx={28} fill={COL.card} stroke={ok > 0.5 ? COL.green : COL.accent} strokeWidth={5} />
        <Label x={0} y={-80} size={38} color={COL.text} mono>servidor-01</Label>
        <rect x={-150} y={-30} width={300} height={30} rx={15} fill="#0f1a2e" />
        <rect x={-150} y={-30} width={300 * bar} height={30} rx={15} fill={COL.accent} />
        <g transform={`translate(0 80) scale(${ok})`}>
          <circle r={44} fill={COL.green} />
          <path d="M -20 0 L -5 15 L 22 -14" fill="none" stroke={COL.bg0} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
    </g>
  );
};

const SceneHardware: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, C.hardware - 0.1, C.eso + 0.05);
  const z = pop(t, C.hardware - 0.1, 0.45);
  const mv = ease(ramp(t, C.cambia, 0.9));
  const hi = ramp(t, C.encarga, 0.4);
  return (
    <g opacity={o}>
      {[{ x: 280, l: "Tu oficina", c: COL.line }, { x: 800, l: "Proveedor cloud", c: hi > 0 ? COL.accent : COL.line }].map((zn, i) => (
        <g key={i} opacity={clamp(z * 2)}>
          <rect x={zn.x - 230} y={CY - 330} width={460} height={640} rx={36} fill={i && hi ? "rgba(56,189,248,0.08)" : "#0f1a2e"} stroke={zn.c} strokeWidth={5} strokeDasharray={i ? "0" : "18 14"} />
          <Label x={zn.x} y={CY + 400} size={42} color={i && hi ? COL.accent : COL.dim}>{zn.l}</Label>
        </g>
      ))}
      <Rack x={280 + 520 * mv} y={CY - 10} s={1.2 * z} t={t} />
      <Label x={280 + 520 * mv} y={CY - 370} size={40} color={COL.yellow} o={z} mono>hardware</Label>
    </g>
  );
};

const SceneShared: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, C.eso - 0.1, C.cual + 0.05);
  const h = pop(t, C.eso - 0.1, 0.45);
  const glow = ramp(t, C.resp - 0.1, 0.4);
  const left = ["Edificio y energía", "Servidores y discos", "Red física"];
  const right = [{ l: "Configuración", at: C.configuras }, { l: "Accesos y seguridad", at: C.protegesVos }, { l: "Tus datos y apps", at: C.armas }];
  const col = (x: number, title: string, color: string, items: { l: string; at: number }[], hl: number) => (
    <g>
      <rect x={x - 240} y={CY - 330} width={480} height={680} rx={34} fill="#0f1a2e" stroke={hl ? COL.yellow : COL.line} strokeWidth={hl ? 6 : 4} opacity={h} />
      {hl ? <rect x={x - 240} y={CY - 330} width={480} height={680} rx={34} fill="none" stroke={COL.yellow} strokeWidth={22} opacity={0.18 * hl} /> : null}
      <Label x={x} y={CY - 250} size={44} color={color} o={h}>{title}</Label>
      {items.map((it, i) => {
        const s = pop(t, it.at, 0.4);
        return (
          <g key={it.l} transform={`translate(${x} ${CY - 120 + i * 150}) scale(${s})`} opacity={clamp(s * 2)}>
            <rect x={-205} y={-52} width={410} height={104} rx={22} fill={COL.card} stroke={color} strokeWidth={3} />
            <Label x={0} y={14} size={34} color={COL.text}>{it.l}</Label>
          </g>
        );
      })}
    </g>
  );
  return (
    <g opacity={o}>
      {col(290, "Proveedor", COL.accent, left.map((l, i) => ({ l, at: C.eso + 0.15 + i * 0.18 })), 0)}
      {col(790, "Vos", COL.yellow, right, glow)}
    </g>
  );
};

const SceneClose: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, C.cual - 0.1, 0.5);
  return (
    <g opacity={clamp(s * 2)} transform={`translate(${CX} ${CY}) scale(${s})`}>
      <g transform="translate(0 -230) scale(0.55)"><CloudShape fill="#dfe8f5" /></g>
      <rect x={-440} y={-60} width={880} height={330} rx={40} fill={COL.card} stroke={COL.yellow} strokeWidth={5} />
      <Label x={0} y={40} size={58}>¿Cuál fue tu primer</Label>
      <Label x={0} y={115} size={58}>contacto con la nube?</Label>
      <Label x={0} y={210} size={36} color={COL.dim}>Te leo en los comentarios</Label>
    </g>
  );
};

// ---------------------------------------------------------------- video
export const QueEsLaNube: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  useFonts();
  const f = useCurrentFrame(), { fps, width, height, durationInFrames } = useVideoConfig();
  const t = f / fps;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${COL.bg1} 0%, ${COL.bg0} 70%)` }}>
      <svg width={width} height={height} viewBox={`0 0 ${W} 1350`} style={{ position: "absolute", inset: 0 }}>
        {/* grilla de fondo muy suave */}
        <g stroke="#ffffff" strokeOpacity={0.035} strokeWidth={2}>
          {Array.from({ length: 12 }, (_, i) => <line key={`v${i}`} x1={i * 90 + 45} y1={0} x2={i * 90 + 45} y2={1350} />)}
          {Array.from({ length: 15 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 90 + 45} x2={W} y2={i * 90 + 45} />)}
        </g>
        <SceneCloud t={t} />
        <SceneServer t={t} />
        <SceneDC t={t} />
        <SceneGlobe t={t} />
        <SceneProviders t={t} />
        <SceneYou t={t} />
        <SceneHardware t={t} />
        <SceneShared t={t} />
        {t >= C.cual - 0.2 ? <SceneClose t={t} /> : null}
        {/* barra de progreso */}
        <rect x={0} y={1342} width={W * (f / durationInFrames)} height={8} fill={COL.accent} opacity={0.8} />
      </svg>
      <WordCaptions words={WORDS} look="pop" y={0.125} size={84} />
      {audio ? <Audio src={staticFile("que-es-la-nube/voice.wav")} /> : null}
    </AbsoluteFill>
  );
};
