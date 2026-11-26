// Stills of a composition: bundles once, renders with the GPU (ANGLE), writes <outPrefix><frame>.jpg (or .png).
// usage (PowerShell): $env:COMP='Demo'; node scripts/stills.mjs out/demo/f_ 0,45,90 0.5
//   COMP   composition id (required)
//   PROPS  '[["name", {inputProps}], ...]' renders every frame once per variant, as <prefix><name><frame>.jpg
//   FORMAT jpeg (default) or png
//   REMOTION_TMP  folder for the temporary bundles (each one is a copy of the project + public/); default C:/remotion-tmp
import fs from "node:fs";
const tmp = process.env.REMOTION_TMP || (fs.existsSync("C:/remotion-tmp") ? "C:/remotion-tmp" : "");
if (tmp) { fs.mkdirSync(tmp, { recursive: true }); process.env.TEMP = process.env.TMP = tmp; }
import { bundle } from "@remotion/bundler";
import { ensureBrowser, renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [prefix, frames, scale = "0.5"] = process.argv.slice(2);
if (!prefix || !frames || !process.env.COMP) { console.error("usage: COMP=<id> node scripts/stills.mjs <outPrefix> <frame,frame,...> [scale]"); process.exit(1); }
// Use the installed Chrome when there is one; otherwise Remotion downloads and uses its own headless browser.
// STILLS_BROWSER=remotion forces Remotion's own browser.
const chromes = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA ?? ""}/Google/Chrome/Application/chrome.exe`];
const browserExecutable = process.env.STILLS_BROWSER === "remotion" ? undefined : chromes.find((p) => fs.existsSync(p));
if (!browserExecutable) await ensureBrowser();
const chromiumOptions = { gl: "angle" };
const png = process.env.FORMAT === "png";
fs.mkdirSync(path.dirname(path.resolve(prefix + "x")), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const variants = process.env.PROPS ? JSON.parse(process.env.PROPS) : [["", {}]];
const onBrowserLog = (l) => { if (l.type === "error" || l.type === "warning") console.log(`[${l.type}]`, l.text.slice(0, 300)); };
for (const [name, inputProps] of variants) {
  const composition = await selectComposition({ serveUrl, id: process.env.COMP, browserExecutable, chromiumOptions, inputProps });
  for (const f of frames.split(",").map(Number)) {
    const t0 = Date.now();
    await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${name}${f}.${png ? "png" : "jpg"}`, imageFormat: png ? "png" : "jpeg", jpegQuality: png ? undefined : 88,
      scale: Number(scale), browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000, onBrowserLog, inputProps });
    console.log("still", name, f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
  }
}
