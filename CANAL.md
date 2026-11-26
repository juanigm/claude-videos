# Guía del canal: videos Cloud (LinkedIn, TikTok, Instagram, Facebook, YouTube Shorts)

## Qué es
Videos animados cortos, en español, que explican Cloud de forma clara, visual y a veces con humor.
Siempre con la nube como base: aunque el tema sea Docker, redes o DevOps, se lo ata a cómo se vive en la nube.

## Un solo video para todas las redes
- **Un guion, un render** (`shorts/<nombre>/SCRIPT.md`) que se sube igual a LinkedIn, TikTok, Instagram, Facebook y
  YouTube Shorts. No se hacen versiones separadas (duplica el trabajo y los tokens).
- **Nivel: "técnico pero claro"**. Se nombran los conceptos reales (puerto 22, IP pública, bucket, gestor de
  secretos), pero cada uno se explica la primera vez con algo cotidiano (puerto abierto = puerta trasera abierta,
  gestor de secretos = caja fuerte digital). Le sirve a un junior en TikTok y a un senior en LinkedIn.
- **La diferencia va en el texto del post**, no en el video: LinkedIn lleva más profundidad (dato extra, experiencia
  propia, pregunta para debatir, fuentes); las otras redes, texto corto con palabras de búsqueda + 3–5 hashtags.

## Mascota y foto de perfil
- La mascota del canal: **una nube cartoon con cara pícara (ceja levantada, sonrisa de costado), gorra roja para
  atrás ("bro") y un candado dorado (seguridad)**, en el mismo 3D cartoon de los videos, sobre el cielo azul.
- Foto de perfil (la misma en todas las redes): `out/perfil/perfil.png`, se genera con la composición `Avatar`
  (`src/videos/avatar/Avatar.tsx`). Vista previa en círculo: `py -3.13 scripts/avatar_preview.py`.
- Se puede sumar a los videos (intro, cierre o como personaje) para que la marca se reconozca.

## Público
Devs, sysadmins, gente de infraestructura y de datos, estudiantes de IT y perfiles técnicos de negocio
(líderes, PMs) que quieren entender el "por qué". Asumir conocimiento técnico básico, no experto.

## Pilares de contenido
1. **Cómo funciona por dentro**: qué pasa realmente detrás de un servicio (un load balancer, un pod, un bucket).
2. **Lo mismo en 3 nubes**: AWS vs Azure vs GCP para llegar al mismo resultado (nombres, configuración, diferencias
   y trampas de cada una).
3. **El por qué de las cosas**: por qué existen las regiones y zonas, por qué contenedores, por qué IaC.
4. **Cloud en la vida diaria**: analogías con cosas cotidianas (un edificio de alquiler = cloud, un restaurante =
   Kubernetes, el delivery = CDN).
5. **On-prem vs nube**: costos, responsabilidades, cuándo conviene cada uno.
6. **Humor**: situaciones reconocibles (la factura sorpresa, "en mi máquina anda", el deploy del viernes).

## Estilo objetivo (referencias: @construyelowey y @stupy.doo en Instagram)
Lo que funciona en esas cuentas y vamos a adaptar (sin copiar sus chistes, personajes ni arte):
- **"Lo construimos desde cero, problema por problema."** Arranca con algo vacío o ingenuo (un servidor solo) y cada
  paso es un problema que aparece y la pieza que lo resuelve (se cae → load balancer; se llena la base → réplica...).
  Cada pieza nueva se presenta con un **título grande en mayúsculas** ("EL LOAD BALANCER").
- **Tono ameno**, con algún toque de humor cotidiano (el vecino que se cuelga del WiFi), pero **explicativo primero**:
  que cualquiera lo entienda. **El chiste "y te hackean, bro" NO va por defecto** (el usuario no quiere esa dinámica por
  ahora; solo usarlo si lo pide para un video puntual). Nada de jerga en la voz (DNS, IP, NAT...) salvo que el video
  sea específicamente sobre eso, y entonces explicada con algo cotidiano.
- **Gancho tipo "X NO está de adorno"** o "¿Por qué...?" en dos líneas grandes, blanco y amarillo con contorno negro.
- **Visual**: dibujos 3D estilo cartoon (cel shading, contorno negro, colores saturados), vistas en corte para ver
  "por dentro", y un **HUD** fijo (en ellos un velocímetro; para nosotros el medidor de costo o de requests).
- **Texto del post**: gancho + lista de piezas en orden + un consejo práctico con ⚠️ + pregunta para comentarios +
  **fuentes** (docs oficiales de AWS / Azure / GCP).

## Formato
- **1080 × 1920 (9:16), 30 fps** por defecto, para todas las redes.
- **Zona segura** (todo lo importante adentro: captions, diagramas, títulos, HUD):
  - **x de 60 a 940**: la derecha la tapan los botones de like / comentar / compartir (TikTok, Reels, Shorts).
  - **y de 285 a 1500**: arriba, LinkedIn puede recortar a 4:5 (franja de 285 px); abajo, TikTok/Reels/Shorts tapan
    unos 400 px con el usuario y la descripción.
  - Fuera de la zona segura: solo fondo y decoración (nada que haga falta leer).
  - Captions **abajo, dentro de la zona segura**: centro en y ≈ 1440 (`y={0.75}`), borde inferior < 1500. El contenido
    de las escenas va por encima (≈ 850–1370) para que no se pisen (desde 2026-11-24, pedido del usuario: al medio
    tapaban la escena).
- Duración: **30 a 90 segundos**. Mensaje principal en los primeros 2–3 segundos (gancho).
- Casi todos miran sin sonido: las **captions** son obligatorias y los diagramas tienen que entenderse solos.
- Un cambio visual cada 2–3 segundos. Final con remate o loop.
- Cierre con una pregunta o una idea para comentar, no con "seguime" ni pidiendo likes.

## Distribución
**LinkedIn (perfil personal, que ya tiene red):**
- Perfil ajustado antes del primer video: título que diga de qué publicas, temas en "Acerca de", video fijado en
  Destacados. Primer post: presentación de la serie con el video más fuerte (tema amplio).
- 2–3 videos por semana en días fijos. Responder todos los comentarios en la primera hora.
- Links externos en el primer comentario, no en el post. Sumar conexiones del nicho y comentar en posts de Cloud.

**TikTok, Instagram, Facebook, YouTube Shorts (perfiles nuevos):**
- Configuración (una vez): mismo usuario en todas, foto y bio de una línea, cuenta de creador/profesional.
  TikTok: activar "Subir en HD". Instagram: "Subir en la máxima calidad" (Configuración → Uso de datos).
  Facebook: conectar Instagram en el Centro de cuentas para que los Reels se publiquen solos también ahí.
  YouTube: verificar el canal con el teléfono (vertical y hasta 3 min = Short).
- Al subir: siempre el mp4 original del render (nunca uno con marca de agua de otra red). Título y descripción con
  las palabras que la gente busca ("qué es Kubernetes"). 3–5 hashtags. Portada con el título legible.
- No borrar y volver a subir un video que anduvo mal: subir uno nuevo.
- Programar en tanda: TikTok desde la web, Instagram + Facebook desde Meta Business Suite, YouTube desde Studio.
- Expectativa: los primeros videos, cientos a pocos miles de vistas; los picos grandes suelen llegar después de
  20–50 videos.

## Ahorro de trabajo (y tokens)
- Plantilla fija de serie (gancho → explicación → remate) y biblioteca de escenas reutilizables (diagrama de
  arquitectura, comparativa A vs B, contador). Cada video nuevo = guion + datos, no rediseño.
- Guion cerrado antes de animar, pocas tandas de stills. Escribir varios guiones juntos y producir después.

## Estructura de guion (base)
1. **Gancho** (0–3 s): una pregunta, un dato o una situación graciosa.
2. **Contexto** (una o dos frases): el problema que se resuelve.
3. **Explicación** visual paso a paso (diagrama que se va armando al ritmo de la voz).
4. **Comparación o giro** (las 3 nubes, on-prem vs cloud, el error típico).
5. **Cierre**: una frase para llevarse + pregunta para comentarios.
Guiones en **español neutro con "tú"** (nada de voseo ni modismos locales como "zafás"; "bro" sí, es el remate),
frases cortas, cada término técnico explicado la primera vez. Narración en cadena, contando lo que "tú" haces:
"levantas esto así... y te hackean, bro. Entonces le quitas esto y agregas aquello. Luego montas esto otro..."

## Estilo visual oficial (desde 2026-11-23): 2D premium
Referencia: la versión que hizo un amigo de "internet en casa" (guardada en `referencias/internet-en-casa_amigo.mp4`).
**Reemplaza al 3D cartoon** para los videos nuevos.
- **Ilustración 2D vectorial premium** (SVG en Remotion, no 3D): degradados suaves, sombras proyectadas suaves, luz
  cálida (lámparas, ventanas, brillos), paleta pastel coherente, bordes limpios sin contorno negro grueso.
- **Espacios construidos con precisión y detalle**: si es una casa, en corte, con pisos, muebles, cuadros, lámparas,
  plantas; si hay infraestructura, **donde va en la realidad** (la fibra va **bajo tierra**, no por el aire).
- **Varios espacios con transiciones**, no todo en un solo set: zoom in/out dentro de un mismo lugar y cortes a lugares
  distintos (la Tierra desde el espacio, la calle, un primer plano abstracto sobre fondo oscuro para explicar un
  concepto, vuelta a la casa). Un cambio visual cada 2–3 s.
- **Personajes 2D simples con expresión** (técnico con casco, alguien triste sin señal, el vecino).
- Se mantienen títulos "Problema / Pieza", contador, carteles y captions, **pulidos y acomodados al estilo**.
- **Remate visual**: al final, resumen con los íconos de todas las piezas en fila.

## Identidad visual
- Fondo oscuro azul noche (`#0b1220` → `#111a2e`), acentos por nube:
  AWS naranja `#ff9900`, Azure azul `#0078d4`, GCP con su azul/rojo/amarillo/verde (`#4285f4` `#ea4335`
  `#fbbc04` `#34a853`). Kubernetes `#326ce5`, Docker `#2496ed`, Terraform `#7b42bc`.
- Tipografía: Space Grotesk / Inter para texto, JetBrains Mono para código y comandos.
- Íconos y diagramas dibujados en SVG dentro del video (cajas, flechas, paquetes que viajan). **No usar los logos
  oficiales** de AWS / Azure / GCP ni de otras marcas salvo que el usuario los aporte y confirme que puede usarlos:
  representar cada nube con su color y su nombre en texto.
- Animaciones: los elementos aparecen cuando la voz los nombra (atados a `words.json`).

## Precisión técnica
- Verificar nombres de servicios y comportamientos antes de afirmarlos (cambian seguido). Si algo es una
  simplificación, decirlo ("simplificando un poco...").
- Nada de precios exactos sin fuente y fecha.
