// Demo of the pipeline: a voice track + its words.json -> one-word captions over a simple animated background.
// Delete this folder (and its line in Root.tsx) once your first real video exists.
import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionLook, joinWords, Word, WordCaptions } from "../captions/WordCaptions";
import raw from "../../shorts/demo/voice/words.json";

export const DEMO_FPS = 30;
export const DEMO_WORDS: Word[] = joinWords(raw as Word[]);
export const DEMO_FRAMES = Math.ceil((DEMO_WORDS[DEMO_WORDS.length - 1].e + 0.9) * DEMO_FPS);

const DOTS = Array.from({ length: 9 }, (_, i) => ({ r: 150 + i * 62, speed: 0.35 + i * 0.07, size: 26 + ((i * 37) % 5) * 9, hue: 168 + i * 9, phase: i * 1.7 }));

export const Demo: React.FC<{ look?: CaptionLook; audio?: boolean }> = ({ look = "pop", audio = true }) => {
  const f = useCurrentFrame(), { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const enter = spring({ frame: f, fps, config: { damping: 14, stiffness: 90 } });
  const cx = width / 2, cy = height * 0.56;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1d3a4f 0%, #0d1b2a 55%, #070d16 100%)" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {DOTS.map((d, i) => {
          const a = d.phase + t * d.speed;
          return <circle key={i} cx={cx + Math.cos(a) * d.r * enter} cy={cy + Math.sin(a) * d.r * 0.82 * enter} r={d.size * enter} fill={`hsl(${d.hue} 70% 62%)`} opacity={0.85} />;
        })}
        <circle cx={cx} cy={cy} r={(92 + 10 * Math.sin(t * 2.4)) * enter} fill="#ffd166" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", color: "rgba(255,255,255,0.72)", fontFamily: "sans-serif", fontSize: 34, letterSpacing: 6, opacity: interpolate(f, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        DEMO · CAPTIONS
      </div>
      <WordCaptions words={DEMO_WORDS} look={look} />
      {audio ? <Audio src={staticFile("demo/voice.wav")} /> : null}
    </AbsoluteFill>
  );
};
