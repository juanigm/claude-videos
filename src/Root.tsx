import React from "react";
import { Composition } from "remotion";
import { Demo, DEMO_FPS, DEMO_FRAMES } from "./demo/Demo";
import { QueEsLaNube, FPS as NUBE_FPS, DURATION as NUBE_FRAMES } from "./videos/que-es-la-nube/QueEsLaNube";
import { Avatar } from "./videos/avatar/Avatar";
import { IaC, FPS as IAC_FPS, DURATION as IAC_FRAMES } from "./videos/iac/IaC";
import { Starlink, FPS as SL_FPS, DURATION as SL_FRAMES } from "./videos/starlink/Starlink";
import { InternetEnCasa, FPS as IC_FPS, DURATION as IC_FRAMES } from "./videos/internet-en-casa/InternetEnCasa";
import { TiendaGeneral, FPS as TG_FPS, DURATION as TG_FRAMES } from "./videos/tienda-general/TiendaGeneral";
import { NubeGeneral, FPS as NG_FPS, DURATION as NG_FRAMES } from "./videos/nube-general/NubeGeneral";
import { QueEsLaNube3D, FPS as NUBE3D_FPS, DURATION as NUBE3D_FRAMES } from "./videos/que-es-la-nube/QueEsLaNube3D";
import { TeHackeanTienda, FPS as TIENDA_FPS, DURATION as TIENDA_FRAMES } from "./videos/te-hackean-tienda/TeHackeanTienda";
import { PruebaFactura, FPS as FAC_FPS, DURATION as FAC_FRAMES } from "./videos/prueba-factura/PruebaFactura";
import { PruebaHackeo, FPS as HACK_FPS, DURATION as HACK_FRAMES } from "./videos/prueba-hackeo/PruebaHackeo";

// Una <Composition> por video. LinkedIn: 1080 x 1350 (4:5) a 30 fps por defecto.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="IaC" component={IaC} durationInFrames={IAC_FRAMES} fps={IAC_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    <Composition id="Starlink" component={Starlink} durationInFrames={SL_FRAMES} fps={SL_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    <Composition id="InternetEnCasa" component={InternetEnCasa} durationInFrames={IC_FRAMES} fps={IC_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={1080} height={1080} />
    {/* versiones generales verticales 9:16 (Reels / TikTok / Shorts) */}
    <Composition id="TiendaGeneral" component={TiendaGeneral} durationInFrames={TG_FRAMES} fps={TG_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    <Composition id="NubeGeneral" component={NubeGeneral} durationInFrames={NG_FRAMES} fps={NG_FPS} width={1080} height={1920} defaultProps={{ audio: true }} />
    <Composition id="QueEsLaNube3D" component={QueEsLaNube3D} durationInFrames={NUBE3D_FRAMES} fps={NUBE3D_FPS} width={1080} height={1350} defaultProps={{ audio: true }} />
    <Composition id="TeHackeanTienda" component={TeHackeanTienda} durationInFrames={TIENDA_FRAMES} fps={TIENDA_FPS} width={1080} height={1350} defaultProps={{ audio: true }} />
    <Composition id="PruebaFactura" component={PruebaFactura} durationInFrames={FAC_FRAMES} fps={FAC_FPS} width={1080} height={1350} defaultProps={{ audio: true }} />
    <Composition id="PruebaHackeo" component={PruebaHackeo} durationInFrames={HACK_FRAMES} fps={HACK_FPS} width={1080} height={1350} defaultProps={{ audio: true }} />
    <Composition id="QueEsLaNube" component={QueEsLaNube} durationInFrames={NUBE_FRAMES} fps={NUBE_FPS} width={1080} height={1350} defaultProps={{ audio: true }} />
    <Composition id="Demo" component={Demo} durationInFrames={DEMO_FRAMES} fps={DEMO_FPS} width={1080} height={1920} defaultProps={{ look: "pop" as const, audio: true }} />
  </>
);
