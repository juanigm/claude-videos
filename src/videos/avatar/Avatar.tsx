// Foto de perfil del canal (1080 x 1080, una sola imagen para todas las redes).
// La mascota: una nube con cara canchera, gorra para atrás ("bro") y un candado dorado (seguridad), en el estilo
// 3D cartoon de los videos. Todo dentro del círculo central, porque las redes recortan la foto en círculo.
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { CamRig, Lights, Padlock3D, Toon } from "../_cartoon3d/kit";

const W = "#ffffff";

const Mascot: React.FC = () => (
  <group position={[0, -0.05, 0]} scale={0.82}>
    {/* cuerpo de nube */}
    <Toon kind="sphere" args={[1.35]} position={[0, 0.25, 0]} color={W} outline={0.06} />
    <Toon kind="sphere" args={[1.0]} position={[-1.35, -0.25, 0.1]} color={W} outline={0.06} />
    <Toon kind="sphere" args={[1.05]} position={[1.35, -0.2, 0.05]} color={W} outline={0.06} />
    <Toon kind="sphere" args={[0.8]} position={[-0.65, -0.6, 0.6]} color={W} outline={0.06} />
    <Toon kind="sphere" args={[0.85]} position={[0.7, -0.6, 0.6]} color={W} outline={0.06} />
    {/* mejillas */}
    <Toon kind="sphere" args={[0.2]} position={[-0.85, -0.05, 1.12]} scale={[1, 0.6, 0.3]} color="#ffb4c6" outline={0} />
    <Toon kind="sphere" args={[0.2]} position={[0.85, -0.05, 1.12]} scale={[1, 0.6, 0.3]} color="#ffb4c6" outline={0} />
    {/* ojos con mirada pícara */}
    {[-0.45, 0.45].map((x) => (
      <group key={x} position={[x, 0.35, 1.22]}>
        <Toon kind="sphere" args={[0.27]} scale={[1, 1.15, 0.5]} color="#ffffff" outline={0.035} />
        <Toon kind="sphere" args={[0.14]} position={[0.07, -0.02, 0.12]} scale={[1, 1.1, 0.5]} color="#0d0f17" outline={0} />
        <Toon kind="sphere" args={[0.045]} position={[0.11, 0.05, 0.19]} color="#ffffff" basic outline={0} />
      </group>
    ))}
    {/* cejas: una levantada (canchero) */}
    <Toon kind="box" args={[0.38, 0.08, 0.06]} position={[-0.45, 0.78, 1.25]} rotation={[0, 0, 0.12]} color="#0d0f17" outline={0} />
    <Toon kind="box" args={[0.38, 0.08, 0.06]} position={[0.47, 0.84, 1.2]} rotation={[0, 0, -0.32]} color="#0d0f17" outline={0} />
    {/* sonrisa de costado: una fila de puntos en curva */}
    {Array.from({ length: 9 }, (_, i) => {
      const u = i / 8, x = -0.32 + u * 0.75, y = -0.18 - Math.sin(u * Math.PI) * 0.16 + u * 0.08;
      return <Toon key={i} kind="sphere" args={[0.055]} position={[x, y, 1.3]} color="#0d0f17" outline={0} />;
    })}
    {/* gorra para atrás */}
    <group position={[0.05, 1.35, -0.05]} rotation={[-0.15, 0, 0.12]}>
      <Toon kind="sphere" args={[0.95]} scale={[1, 0.55, 1]} color="#ff4d5e" outline={0.05} />
      <Toon kind="box" args={[1.0, 0.1, 0.75]} position={[0, -0.15, -0.95]} rotation={[-0.25, 0, 0]} color="#e11d48" outline={0.04} />
      <Toon kind="sphere" args={[0.12]} position={[0, 0.52, 0]} color="#e11d48" outline={0.03} />
      <Toon kind="box" args={[0.5, 0.18, 0.05]} position={[0, 0.0, 0.93]} rotation={[0.2, 0, 0]} color="#ffd23f" outline={0.02} />
    </group>
    {/* el candado, colgando adelante */}
    <group position={[1.25, -1.05, 1.9]} rotation={[0.05, -0.3, 0.18]}>
      <Padlock3D s={0.9} />
    </group>
  </group>
);

export const Avatar: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #9fd8ff 0%, #4aa8f0 45%, #1f5fb8 100%)" }}>
      {/* anillo suave para que el círculo se lea bien en fondo blanco y negro */}
      <div style={{ position: "absolute", left: 60, top: 60, right: 60, bottom: 60, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 70%)" }} />
      <ThreeCanvas width={width} height={height} camera={{ fov: 30, position: [0, 0.4, 11] }}>
        <CamRig pos={[1.2, 0.9, 11]} target={[0, 0.1, 0]} t={0} />
        <Lights />
        <Mascot />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
