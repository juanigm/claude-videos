# videos-animados-cloud

Proyecto de Remotion para hacer videos animados con código para **LinkedIn** (y los mismos videos para TikTok,
Instagram, Facebook y YouTube Shorts), todos sobre **Cloud**
(AWS / Azure / GCP, Kubernetes, Docker, CI/CD, DevOps, Terraform, networking, on-prem vs nube).
Base técnica: el kit de videos animados (captions palabra por palabra sincronizadas a la voz).

**Skills de animación instaladas:** plugin *Remotion* (buenas prácticas, animaciones, captions, 3D) y
*video-shotcraft* (recetas de tomas, componentes, SFX). Usarlas al diseñar escenas. **Nunca** usar `remotion-upgrade`
ni nada que suba React o Remotion: el proyecto queda en React 18 y Remotion 4.0.540 (ver abajo).

**Antes de armar un video, leer `CANAL.md`** (tono, formatos, identidad visual, pilares de contenido).
Ideas pendientes en `IDEAS.md`.

## Diferencias con el kit original
- Voz en **español**: transcribir siempre con modelo multilingüe, `... SCRIPT.md small es` (o `medium es` si
  `words_check.py` marca muchas palabras mal oídas). Los términos técnicos en inglés (Kubernetes, pod, load
  balancer) se escriben en el guion tal como se dicen, así whisper los toma del prompt.
- Formato por defecto **1080 × 1920 (9:16)** a 30 fps: un solo render para LinkedIn, TikTok, Instagram, Facebook y
  YouTube Shorts. Todo lo importante dentro de la **zona segura x 60–940, y 285–1500** (LinkedIn puede recortar a
  4:5; abajo y a la derecha tapa la interfaz de las otras redes). Captions abajo dentro de la zona segura (centro y ≈ 1440,
  `y={0.75}`), con la escena por encima. Ver `CANAL.md`.
- La voz provisoria (`tts_placeholder.ps1`) prefiere una voz de Windows en español si hay una instalada.

## Lo que hay instalado
- Windows. Node.js, Python 3.13 (numpy, scipy, pillow, faster-whisper), ffmpeg, Remotion 4.0.540.
- **No actualizar React.** Tiene que seguir en `react@18`, `@react-three/fiber@8` y `@react-three/postprocessing@2`:
  con React 19 / R3F 9 las escenas 3D con EffectComposer salen en negro. Reinstalar siempre con `npm ci`.
- Renderizar siempre con `--gl=angle`.
- Los scripts de Python se corren con `py -3.13`. Sus paquetes están fijados en `requirements.txt`.
- Cada render o still deja en la carpeta temporal una copia del proyecto + `public/` (cientos de MB). Por eso los
  temporales van a `C:\remotion-tmp` (variable `REMOTION_TMP`) y se limpian con `scripts\clean-remotion-tmp.ps1`.
  `scripts\render.ps1` ya lo hace solo; después de una tanda de stills, correrlo a mano.

## Carpetas
- `src/Root.tsx`: una `<Composition>` por video. `src/videos/<nombre>/`: el código de cada video.
- `src/captions/WordCaptions.tsx`: las captions (ver abajo).
- `src/demo/`: video de prueba. Se puede borrar junto con su línea en Root.tsx, `shorts/demo` y `public/demo`.
- `shorts/<nombre>/`: guion (`SCRIPT.md`), voz (`voice/voice.wav`) y tiempos (`voice/words.json`).
- `public/`: lo que el video carga con `staticFile()` (audio, imágenes, fuentes en `public/fonts`).
- `out/`: renders e imágenes de prueba (no va a git).

## Flujo de un video
1. **Guion** en `shorts/<nombre>/SCRIPT.md`, con el texto de la voz dentro de un bloque ``` (los scripts leen el
   primer bloque; las etiquetas entre corchetes como `[pause]` se ignoran).
2. **Voz**: el usuario la graba o la genera y la deja en `shorts/<nombre>/voice/`. Convertir a wav:
   `ffmpeg -i voz.mp3 -ar 48000 -ac 1 shorts/<nombre>/voice/voice.wav`.
   Voz provisoria para probar tiempos: `powershell -ExecutionPolicy Bypass -File scripts\tts_placeholder.ps1 <nombre>`.
3. **Transcripción** (tiempo de cada palabra):
   - `py -3.13 scripts/words.py shorts/<nombre>/voice/voice.wav shorts/<nombre>/SCRIPT.md` → `voice/words.json`
     (`[{w, s, e, p}]` en segundos). Por defecto usa `small.en` (inglés). Otro idioma: agregar modelo e idioma,
     por ejemplo `... SCRIPT.md small es`. La primera vez baja el modelo.
   - `py -3.13 scripts/words_snap.py shorts/<nombre>/voice` corrige la primera palabra después de cada pausa
     (whisper la da tarde) y las palabras de duración cero. Guarda el original en `words_raw.json`.
   - `py -3.13 scripts/words_check.py shorts/<nombre>` compara con el guion: palabras faltantes o mal oídas, baja
     confianza, y una línea por oración con su frame de inicio. Corregir `words.json` a mano donde haga falta.
   - Opcional: `py -3.13 scripts/align_script.py <nombre> [maxChars]` alinea el texto exacto del guion con los
     tiempos y arma captions por frase → `shorts/<nombre>/timing.json`.
4. **Video**: componente en `src/videos/<nombre>/`, registrado en `src/Root.tsx`. Duración = fin de la última
   palabra + una cola corta, en frames. Copiar el wav a `public/<nombre>/` y cargarlo con
   `<Audio src={staticFile("<nombre>/voice.wav")} />`. Atar cada corte y animación a los tiempos de `words.json`,
   no a números a ojo: así una voz nueva solo pide volver a transcribir.
5. **Captions**: `<WordCaptions words={joinWords(words)} look="pop" />`. Una palabra por vez, en pantalla
   exactamente cuando se dice. Looks: `pop` (Nunito Black blanca con contorno oscuro y entrada con rebote, arriba),
   `outline` (Arial Black con contorno grueso), `pill` (Space Grotesk sobre píldora oscura), `chip` (Inter sobre
   tarjeta). Props: `y` (altura, fracción del alto), `size` (px), `lead` (frames de adelanto, 1 por defecto).
6. **Imágenes de prueba** antes de renderizar todo:
   `$env:COMP='<Id>'; node scripts/stills.mjs out/<nombre>/f_ 0,45,90 0.5`
   Hoja de contacto: `py -3.13 scripts/sheet.py out/<nombre>/hoja.jpg 5 out/<nombre>/f_ 0,45,90`.
   Mirar las imágenes antes de mostrarlas.
7. **Render final**: `powershell -ExecutionPolicy Bypass -File scripts\render.ps1 <Id> out\<nombre>\<nombre>_v1.mp4`
   (correrlo en segundo plano: tarda minutos). Vista previa rápida: agregar `-Scale 0.5`.
   Props de entrada: escribirlas en un archivo `.json` y pasar `-Props out/<nombre>/props.json`. El JSON escrito
   directo en la línea de comandos pierde las comillas.
8. **Control de calidad**: `py -3.13 scripts/short_qa.py <video.mp4> out/<nombre>/qa` (specs, volumen, frames negros
   o congelados, hojas de contacto de todo el video). No se puede escuchar el audio desde acá: decirlo al entregar.

## Sonido (desde el video de IaC)
- **SFX v2**: `py -3.13 scripts/audio/sfx_kit2.py` → `public/sfx2/` (estéreo, reverb corta, capas y variantes:
  `swish_a/b`, `swish_down`, `riser`, `impact`, `reveal` (cada "Pieza N"), `problem` (cada "Problema"), `pop1..4`,
  `mouse1..3`, `tick`, `typing`, `typing_short`, `stamp`, `crumble`, `build`, `success`, `error`, `glitch`,
  `conveyor`, `sparkle`). Se usan con `SfxTrack2` (ver `src/videos/iac/IaC.tsx`); rotar las variantes de pop/mouse.
- **Música**: `py -3.13 scripts/audio/music_bed.py public/<nombre>/music.wav <dur_s> "200:201" -31` y bajarla
  cuando habla la voz (`musicVol` en `IaC.tsx`).
- `scripts/words_from_script.py shorts/<nombre>`: después de `words_snap.py`, reemplaza en `words.json` lo que whisper
  oyó mal (nombres de herramientas, siglas) por el texto exacto del guion, conservando los tiempos.

## Otros scripts
- `scripts/voice_tighten.py`: acorta las pausas de una voz hasta una duración objetivo.
- `scripts/sbs_sheet.py`: hoja lado a lado (lo nuestro arriba, la referencia abajo).
- `scripts/audio/dsp.py`: kit para sintetizar música y efectos con numpy/scipy (filtros, ruido, reverb, loudness,
  leer y escribir wav). `scripts/audio/clicks.py mezcla.wav voz.wav 0` lista golpes agudos que no vienen de la voz
  (posibles glitches).
- `npm run studio`: abre Remotion Studio para ver el video en vivo. `npm run typecheck`: revisa los tipos.

## Reglas
- Fuentes: solo las de `public/fonts` o los paquetes `@fontsource/*` (libres). No usar fuentes del sistema en el
  video, salvo Arial Black en el look `outline`.
- Escribir los `.tsx` en UTF-8 sin BOM.
- No subir claves ni archivos `.env`.
- Remotion es gratis para personas y empresas de hasta 3 personas; más grandes necesitan licencia.
