# "Montamos una tienda online... y te hackean, bro" — versión GENERAL (Instagram, TikTok, Shorts, Facebook)

Misma historia y escenas que la versión LinkedIn (`SCRIPT.md`), contada para gente que no es de sistemas:
cada concepto técnico se explica con algo cotidiano y el término real queda solo como cartel en pantalla.
Formato 9:16. Objetivo ~60-65 s.

## Voz (ElevenLabs, Eleven v3)

```
[casual] Vamos a montar una tienda online. [mischievously] Spoiler: nos van a hackear.
[confident] Primero, un servidor: la computadora que atiende a tus clientes.
[proud] Para entrar a arreglarla, dejas la puerta trasera abierta... con la clave admin123.
[short pause] [deadpan] Y te hackean, bro.
[matter-of-fact] Hay robots probando puertas todo el día. Así que la cierras, y entras con una llave imposible de adivinar.
[upbeat] Luego guardas los datos de tus clientes... [casual] a la vista de todo internet.
[short pause] [deadpan] Y te hackean, bro.
[matter-of-fact] Es como dejar la libreta de clientes en la vidriera. Entonces la guardas atrás, solo para tu tienda.
[upbeat] Después subes las fotos y facturas a un depósito público. [casual] Total, ¿quién lo va a encontrar?
[sighs] Los robots.
[deadpan] Y te hackean, bro.
[matter-of-fact] Así que lo cierras, y compartes con links que se vencen.
[proud] Por último, publicas el código de tu tienda... [short pause] con la llave de tu cuenta adentro.
[laughs] En minutos, alguien la usa para minar cripto. Con tu tarjeta.
[deadpan] Y te hackean, bro. [short pause] [sighs] Y encima pagas la factura.
[serious] Las llaves nunca van en el código: van en una caja fuerte digital.
[warm] La seguridad va en cada paso. [curious] ¿Cuál te sorprendió más?
```

## Qué cambia respecto de la versión LinkedIn
| Concepto | LinkedIn (técnico) | General (analogía en la voz) | Cartel en pantalla |
|---|---|---|---|
| Servidor | "levantas un servidor" | "la computadora que atiende a tus clientes" | SERVIDOR |
| SSH abierto a internet | "puerto 22 abierto a todo internet" | "dejas la puerta trasera abierta" | PUERTO 22 |
| Llaves SSH | "cambias la contraseña por llaves" | "una llave imposible de adivinar" | LLAVES SSH |
| Base con IP pública | "le pones una IP pública" | "los dejas a la vista de todo internet" / "la libreta en la vidriera" | IP PÚBLICA |
| Red privada | "red privada, solo el servidor le habla" | "la guardas atrás, solo para tu tienda" | RED PRIVADA |
| Bucket público | "bucket público" | "un depósito público" | BUCKET |
| URLs firmadas | "links que vencen" | "links que se vencen" | LINK · VENCE EN 5 MIN |
| Claves en GitHub | "subes el código a GitHub con las claves" | "publicas el código con la llave de tu cuenta" | GITHUB |
| Gestor de secretos + roles | "roles y un gestor de secretos" | "una caja fuerte digital" | GESTOR DE SECRETOS |

## Cambios visuales que pide esta versión
- Paso 2: en vez de la antena de "IP pública", la base de datos aparece **en una vidriera** con gente mirando
  (y se mueve "atrás" con la cúpula).
- Paso 1: la puerta del costado del servidor se dibuja como una **puerta con felpudo** (la clave abajo).
- Todo lo demás se reutiliza.
