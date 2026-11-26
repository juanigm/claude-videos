// El remate: la tienda terminada, en una ventana de navegador, con el checklist de seguridad que se va tildando.
import React from "react";
import { clamp, ease, pop, ramp } from "../_cartoon3d/kit";

const INK = "#0d0f17";
const INTER = "Inter, sans-serif";

const Product: React.FC<{ name: string; price: string; color: string; shape: "taza" | "remera" | "gorra"; s: number }> = ({ name, price, color, shape, s }) => (
  <div style={{ flex: 1, background: "#fff", border: `4px solid ${INK}`, borderRadius: 18, padding: 12, transform: `scale(${s})`, boxShadow: `0 6px 0 ${INK}` }}>
    <div style={{ height: 120, borderRadius: 12, background: "#eef3ff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      {shape === "taza" ? (
        <div style={{ position: "relative", width: 64, height: 70 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 54, height: 70, background: color, border: `4px solid ${INK}`, borderRadius: "6px 6px 14px 14px" }} />
          <div style={{ position: "absolute", left: 48, top: 16, width: 24, height: 30, border: `6px solid ${INK}`, borderLeft: "none", borderRadius: "0 14px 14px 0" }} />
        </div>
      ) : shape === "remera" ? (
        <div style={{ width: 90, height: 84, background: color, border: `4px solid ${INK}`, clipPath: "polygon(25% 0, 40% 8%, 60% 8%, 75% 0, 100% 22%, 86% 38%, 78% 32%, 78% 100%, 22% 100%, 22% 32%, 14% 38%, 0 22%)" }} />
      ) : (
        <div style={{ position: "relative", width: 96, height: 60 }}>
          <div style={{ position: "absolute", left: 10, top: 0, width: 66, height: 46, background: color, border: `4px solid ${INK}`, borderRadius: "40px 40px 6px 6px" }} />
          <div style={{ position: "absolute", left: 54, top: 38, width: 46, height: 14, background: color, border: `4px solid ${INK}`, borderRadius: 8 }} />
        </div>
      )}
    </div>
    <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 24, color: INK, marginTop: 10 }}>{name}</div>
    <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 28, color: INK }}>{price}</div>
    <div style={{ marginTop: 8, background: "#ffd23f", border: `3px solid ${INK}`, borderRadius: 10, textAlign: "center", fontFamily: INTER, fontWeight: 800, fontSize: 22, padding: "6px 0", color: INK }}>Comprar</div>
  </div>
);

const Check: React.FC<{ text: string; on: number }> = ({ text, on }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: INTER, fontWeight: 600, fontSize: 25, color: on > 0.5 ? INK : "#8a93a6" }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, border: `3px solid ${INK}`, background: on > 0.5 ? "#3dff8a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.3 * on * (1 - on)})` }}>
      {on > 0.5 ? <div style={{ width: 14, height: 8, borderLeft: `5px solid ${INK}`, borderBottom: `5px solid ${INK}`, transform: "rotate(-45deg) translate(2px,-2px)" }} /> : null}
    </div>
    {text}
  </div>
);

export const CHECKS = ["Puerto 22 cerrado", "Base de datos privada", "Bucket privado", "Secretos fuera del código"];

/** a = cuando aparece la ventana, checksAt = cuando se tilda cada ítem, stampAt = sello "100 % SEGURA" */
export const TiendaFinal: React.FC<{ t: number; a: number; checksAt: number[]; stampAt: number; top?: number; checks?: string[] }> = ({ t, a, checksAt, stampAt, top = 470, checks = CHECKS }) => {
  if (t < a - 0.05) return null;
  const s = pop(t, a, 0.5);
  const stamp = ramp(t, stampAt, 0.18);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `rgba(10,20,48,${0.35 * clamp(s)})` }} />
      <div style={{ position: "absolute", left: 90, right: 90, top, transform: `scale(${0.6 + 0.4 * s}) rotate(${-1.5 * (1 - ease(ramp(t, a, 0.8)))}deg)`, opacity: clamp(s * 2), transformOrigin: "50% 40%" }}>
        <div style={{ background: "#f6f8fc", border: `5px solid ${INK}`, borderRadius: 26, overflow: "hidden", boxShadow: `0 14px 0 ${INK}` }}>
          {/* barra del navegador */}
          <div style={{ background: "#1f2433", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
            <div style={{ flex: 1, marginLeft: 10, background: "#0d1020", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 20, height: 24 }}>
                <div style={{ position: "absolute", left: 3, top: 0, width: 14, height: 14, border: "4px solid #3dff8a", borderBottom: "none", borderRadius: "8px 8px 0 0" }} />
                <div style={{ position: "absolute", left: 0, top: 10, width: 20, height: 14, background: "#3dff8a", borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 26, color: "#3dff8a" }}>https://</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 26, color: "#e8eef7", marginLeft: -12 }}>mitienda.com</span>
            </div>
          </div>
          {/* la tienda */}
          <div style={{ padding: "18px 24px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 54, color: INK, letterSpacing: 1 }}>MI TIENDA</div>
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 24, color: "#fff", background: INK, borderRadius: 999, padding: "8px 18px" }}>Carrito (2)</div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
              <Product name="Taza cloud" price="$ 12" color="#38bdf8" shape="taza" s={pop(t, a + 0.15, 0.35)} />
              <Product name="Remera DevOps" price="$ 25" color="#ffd23f" shape="remera" s={pop(t, a + 0.25, 0.35)} />
              <Product name="Gorra K8s" price="$ 18" color="#a78bfa" shape="gorra" s={pop(t, a + 0.35, 0.35)} />
            </div>
            {/* checklist de seguridad */}
            <div style={{ marginTop: 18, background: "#fff", border: `4px solid ${INK}`, borderRadius: 18, padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 12, columnGap: 10 }}>
              {checks.map((c, i) => <Check key={c} text={c} on={ramp(t, checksAt[i], 0.2)} />)}
            </div>
          </div>
        </div>
        {/* sello */}
        {stamp > 0 ? (
          <div style={{ position: "absolute", right: -20, top: 70, transform: `rotate(-12deg) scale(${2.2 - 1.2 * ease(stamp)})`, opacity: stamp,
            border: "8px solid #16a34a", borderRadius: 18, padding: "6px 22px", background: "rgba(220,252,231,0.92)", fontFamily: "Anton, sans-serif", fontSize: 58, color: "#16a34a", letterSpacing: 2 }}>
            100 % SEGURA
          </div>
        ) : null}
      </div>
    </>
  );
};
