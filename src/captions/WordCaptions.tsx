// Burned-in captions, ONE spoken word at a time, timed to a voice's words.json ([{w, s, e}] in seconds).
// Four looks, all with fonts bundled in public/fonts (OFL):
// - "pop":     white Nunito Black with a dark outline ring and a soft drop shadow; each word pops in. 88 px.
// - "outline": white Arial Black (Montserrat ExtraBold as fallback) with a THICK black outline. 60 px.
// - "pill":    white Space Grotesk Bold on a soft dark rounded pill. 64 px.
// - "chip":    white Inter Bold on a charcoal rounded card with a hairline border. 64 px.
// Sizes are composition pixels for a 1080 x 1920 frame. `y` is the caption centre as a fraction of the height.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export type Word = { w: string; s: number; e: number };
export type CaptionLook = "pop" | "outline" | "pill" | "chip";
const FONTS: Record<CaptionLook, { family: string; src: string; weight: string }> = {
  pop: { family: "CaptionPop", src: `url(${staticFile("fonts/Nunito-Variable.ttf")})`, weight: "200 1000" },
  // Arial Black comes with Windows; Montserrat is the bundled fallback
  outline: { family: "CaptionOutline", src: `local("Arial Black"), local("ArialBlack"), local("Arial-Black"), url(${staticFile("fonts/Montserrat-ExtraBold.ttf")})`, weight: "900" },
  pill: { family: "CaptionPill", src: `url(${staticFile("fonts/SpaceGrotesk-Bold.ttf")})`, weight: "700" },
  chip: { family: "CaptionChip", src: `url(${staticFile("fonts/Inter-Bold.ttf")})`, weight: "700" },
};

/** load the caption font once (blocks the render until it is ready, so no frame shows a fallback face) */
const useCaptionFont = (look: CaptionLook) => {
  const [handle] = useState(() => delayRender(`caption font ${look}`));
  useEffect(() => {
    const F = FONTS[look];
    const ff = new FontFace(F.family, F.src, { weight: F.weight });
    // lib.dom lacks FontFaceSet.add here, hence the cast; on failure the render goes on with the fallback face
    ff.load()
      .then((f) => { (document.fonts as unknown as Set<FontFace>).add(f); continueRender(handle); })
      .catch(() => continueRender(handle));
  }, [handle, look]);
};

/** whisper splits hyphenated numbers ("forty", "-four"): glue those back into one word */
export const joinWords = (words: Word[]): Word[] => {
  const out: Word[] = [];
  for (const w of words) {
    const prev = out[out.length - 1];
    if (prev && /^[-–]/.test(w.w)) { prev.w += w.w.replace(/^–/, "-"); prev.e = w.e; }
    else out.push({ w: w.w.trim(), s: w.s, e: w.e });
  }
  return out;
};

/** which word is on screen at time t: from its start to the next word's start, but it leaves `hold` s after it ends
 *  when a pause follows (the screen stays clean in the gaps) */
export const wordAt = (words: Word[], t: number, hold = 0.25) => {
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i];
    if (t < w.s) continue;
    const next = words[i + 1];
    const until = next ? Math.min(next.s, w.e + hold) : w.e + hold;
    return t < until ? w : null;
  }
  return null;
};

// a ring of 16 hard dark shadows = an outline that works on any background
const RING = (r: number) => Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2;
  return `${(Math.cos(a) * r).toFixed(2)}px ${(Math.sin(a) * r).toFixed(2)}px 0 rgba(8,10,14,0.92)`;
}).join(", ");

export const WordCaptions: React.FC<{ words: Word[]; y?: number; size?: number; lead?: number; look?: CaptionLook }> =
  ({ words, y, size, lead = 1, look = "pop" }) => {
    useCaptionFont(look);
    const f = useCurrentFrame(), { fps, height } = useVideoConfig();
    const t = (f + lead) / fps; // lead: show the word one frame early (eye + subtitle convention)
    const w = wordAt(words, t, look === "pop" ? 0.3 : 0.25);
    if (!w) return null;
    const px = size ?? (look === "pop" ? 88 : look === "outline" ? 60 : 64);
    const long = w.w.length > 16 ? 16 / w.w.length : 1; // very long words shrink to stay inside the frame
    const top = height * (y ?? (look === "pop" ? 0.172 : 0.7));
    const at: React.CSSProperties = { position: "absolute", left: 0, right: 0, top, transform: "translateY(-50%)", textAlign: "center", lineHeight: 1 };
    if (look === "pop") {
      // pop in: 0.82 -> 1 with a slight overshoot over 0.14 s
      const u = Math.max(0, Math.min(1, (t - w.s) / 0.14));
      const pop = 0.82 + 0.18 * (1 + 2.2 * (u - 1) ** 3 + 1.2 * (u - 1) ** 2);
      return (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{
            ...at, left: 40, right: 40, transform: `translateY(-50%) scale(${pop})`, whiteSpace: "nowrap", lineHeight: 1.1,
            fontFamily: `${FONTS.pop.family}, sans-serif`, fontWeight: 900, fontSize: px * long, letterSpacing: -0.5, color: "#ffffff",
            textShadow: `${RING(px * 0.051)}, 0 4px 14px rgba(0,0,0,0.75)`,
          }}>{w.w}</div>
        </AbsoluteFill>
      );
    }
    if (look === "chip") return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ ...at, display: "flex", justifyContent: "center" }}>
          <span style={{
            fontFamily: `${FONTS.chip.family}, Inter, sans-serif`, fontWeight: 700, fontSize: px * long, letterSpacing: -px * 0.02, color: "#ffffff",
            background: "rgba(20,22,28,0.86)", padding: `${px * 0.2}px ${px * 0.32}px ${px * 0.24}px`, borderRadius: px * 0.26,
            border: "2px solid rgba(255,255,255,0.14)", boxShadow: `0 ${px * 0.12}px ${px * 0.4}px rgba(0,0,0,0.45)`, backdropFilter: "blur(8px)",
          }}>{w.w}</span>
        </div>
      </AbsoluteFill>
    );
    if (look === "pill") return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ ...at, display: "flex", justifyContent: "center" }}>
          <span style={{
            fontFamily: `${FONTS.pill.family}, "Space Grotesk", sans-serif`, fontWeight: 700, fontSize: px * long, letterSpacing: -px * 0.023, color: "#ffffff",
            background: "rgba(4,7,20,0.55)", padding: `${px * 0.25}px ${px * 0.47}px ${px * 0.31}px`, borderRadius: px * 0.34, backdropFilter: "blur(6px)",
          }}>{w.w}</span>
        </div>
      </AbsoluteFill>
    );
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          ...at, fontFamily: `${FONTS.outline.family}, "Arial Black", sans-serif`, fontWeight: 900, fontSize: px * long, color: "#ffffff", letterSpacing: "-0.01em",
          // paint-order puts the stroke behind the fill: half of this width shows, i.e. 0.10 x size outside the letters
          WebkitTextStroke: `${px * 0.2}px #000000`, paintOrder: "stroke fill",
          textShadow: `${px * 0.04}px ${px * 0.06}px ${px * 0.1}px rgba(0,0,0,0.7)`,
        }}>{w.w}</div>
      </AbsoluteFill>
    );
  };
