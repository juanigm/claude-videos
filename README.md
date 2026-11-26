# videos-animados-cloud

Videos animados hechos con código ([Remotion](https://www.remotion.dev/)) sobre **Cloud** (AWS / Azure / GCP,
Kubernetes, Docker, CI/CD, DevOps, Terraform, networking) para LinkedIn, TikTok, Instagram, Facebook y YouTube Shorts.
Formato 1080 × 1920 (9:16) a 30 fps, voz en español y captions palabra por palabra sincronizadas a la voz.

- Tono, formatos e identidad visual del canal: [`CANAL.md`](CANAL.md)
- Ideas pendientes: [`IDEAS.md`](IDEAS.md)
- Flujo completo de un video y reglas técnicas: [`CLAUDE.md`](CLAUDE.md)

---

## Instalación en una máquina nueva (Windows)

### 1. Programas necesarios

| Programa | Versión probada | Instalar |
|---|---|---|
| Git | cualquiera reciente | `winget install --id Git.Git -e` |
| Node.js | 20 o más nuevo (probado con 26) | `winget install --id OpenJS.NodeJS -e` |
| Python | **3.13** | `winget install --id Python.Python.3.13 -e` |
| ffmpeg | 7 o más nuevo | `winget install --id Gyan.FFmpeg -e` |

Después de instalar, cerrar y volver a abrir la terminal y comprobar:

```powershell
git --version; node --version; py -3.13 --version; ffmpeg -version
```

### 2. Clonar el repositorio

```powershell
git clone https://github.com/juanigm/claude-videos.git videos-animados-cloud
cd videos-animados-cloud
```

### 3. Dependencias de Node

```powershell
npm ci
```

Usar siempre `npm ci` (no `npm install` ni `npm update`): instala exactamente lo que fija `package-lock.json`.
El proyecto **tiene que quedar en React 18, `@react-three/fiber@8`, `@react-three/postprocessing@2` y
Remotion 4.0.540**. Con React 19 / R3F 9 las escenas 3D salen en negro. No correr `remotion upgrade`.

### 4. Dependencias de Python (transcripción y audio)

```powershell
py -3.13 -m pip install -r requirements.txt
```

El modelo de whisper (`small` / `medium`) se descarga solo la primera vez que se corre `scripts/words.py`.

### 5. Carpeta para temporales de Remotion

Cada render copia el proyecto a una carpeta temporal (cientos de MB). Los scripts usan `C:\remotion-tmp`:

```powershell
New-Item -ItemType Directory -Force C:\remotion-tmp
```

### 6. Probar que todo anda

```powershell
npm run typecheck
```

```powershell
npm run studio
```

Remotion Studio se abre en el navegador con todos los videos de `src/Root.tsx`. Render de prueba a media resolución:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\render.ps1 Demo out\demo\demo.mp4 -Scale 0.5
```

(El Id de cada video es el `id` de su `<Composition>` en `src/Root.tsx`.)

---

## Estructura

```
src/Root.tsx               una <Composition> por video
src/videos/<nombre>/       código de cada video
src/captions/              captions palabra por palabra (looks pop / outline / pill / chip)
shorts/<nombre>/           guion (SCRIPT.md), voz (voice/voice.wav) y tiempos (voice/words.json)
public/                    lo que carga el video: voz, música, SFX (sfx/, sfx2/), fuentes (fonts/)
scripts/                   transcripción, stills, render, QA y síntesis de audio
out/                       renders e imágenes de prueba (no se sube)
```

## Qué no está en el repo

| Carpeta | Por qué | Cómo se recupera |
|---|---|---|
| `node_modules/` | se reconstruye | `npm ci` |
| `out/` | renders y stills | volver a renderizar |
| `voices/` | mp3 crudos de ElevenLabs / WhatsApp | la voz usada ya está en `shorts/<nombre>/voice/voice.wav` y `public/<nombre>/` |
| `referencias/` | videos de terceros usados como referencia | no se publican; guardarlos aparte |
| `.env`, claves | secretos | nunca se suben |

## Flujo de un video (resumen)

1. Guion en `shorts/<nombre>/SCRIPT.md` (texto de la voz dentro de un bloque ```).
2. Voz → `ffmpeg -i voz.mp3 -ar 48000 -ac 1 shorts/<nombre>/voice/voice.wav`.
3. Tiempos de cada palabra:
   ```powershell
   py -3.13 scripts/words.py shorts/<nombre>/voice/voice.wav shorts/<nombre>/SCRIPT.md small es
   py -3.13 scripts/words_snap.py shorts/<nombre>/voice
   py -3.13 scripts/words_check.py shorts/<nombre>
   ```
4. Componente en `src/videos/<nombre>/`, registrado en `src/Root.tsx`; copiar el wav a `public/<nombre>/`.
5. Stills de prueba: `$env:COMP='<Id>'; node scripts/stills.mjs out/<nombre>/f_ 0,45,90 0.5`
6. Render final: `powershell -ExecutionPolicy Bypass -File scripts\render.ps1 <Id> out\<nombre>\<nombre>_v1.mp4`
7. Control de calidad: `py -3.13 scripts/short_qa.py out\<nombre>\<nombre>_v1.mp4 out/<nombre>/qa`

Detalle de cada paso, sonido (SFX v2, música) y demás scripts en [`CLAUDE.md`](CLAUDE.md).

## Licencia de Remotion

Remotion es gratis para personas y empresas de hasta 3 personas; equipos más grandes necesitan
[licencia](https://www.remotion.dev/license).
