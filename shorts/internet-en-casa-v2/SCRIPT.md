# "Internet no viene del aire" — Cómo llega internet a tu casa (v2)

Versión 2 de `internet-en-casa`. **Una sola historia con un protagonista**: seguimos a **un video de gatitos** desde el
data center donde vive hasta tu celular. Cada pieza aparece porque ese video se topa con un obstáculo en el camino, y
cada frase arranca donde terminó la anterior. Todo público, sin jerga. 9:16, todas las redes. Objetivo ~75-80 s (más largo que la v1 porque ahora explica también
cómo pides y recibes lo que ves o descargas).

## Voz (ElevenLabs, Eleven v3)

```
[intrigued] Internet no viene del aire. [short pause] Y te lo demuestro siguiendo un video de gatitos, desde donde vive hasta tu celular.
[matter-of-fact] Todo lo que ves en internet vive en data centers: edificios llenos de computadoras, a veces en otro continente.
[curious] Cuando tocas play, tu celular le pide ese video al data center. Y el data center te lo manda en miles de pedacitos.
[thoughtful] Esos pedacitos se convierten en luz y cruzan el océano por cables de fibra óptica, tendidos en el fondo del mar.
[upbeat] Llegan a la costa, a un edificio donde las empresas de internet se conectan entre sí. Ahí pasan a la red de tu proveedor.
[confident] Tu proveedor los lleva por la fibra de tu calle, poste por poste, hasta tu casa.
[curious] Pero llegan como luz, y tus aparatos no entienden luz. Por eso el técnico instaló un módem, que traduce la luz a una señal que tus equipos entienden.
[relaxed] El módem tiene una sola salida, pero en tu casa hay celular, tele, consola... Por eso se le conecta un router, que reparte los pedacitos a cada aparato.
[mischievously] Y recién en los últimos metros, el router los manda por el aire: eso es el WiFi.
[warm] Tu celular junta los pedacitos y el gatito aparece. Y si lo descargas, es lo mismo: solo que se quedan guardados.
[warm] Miles de kilómetros de cable... para unos metros de aire. [curious] ¿Lo sabías?
```

## El viaje del video (obstáculo → pieza), en orden
| # | Dónde está el video | Obstáculo | Pieza | Lugar |
|---|---|---|---|---|
| — | Hook | "Internet viene del aire" (mito) | — | Un celular con el video de gatitos y ondas de WiFi → X roja → "te lo demuestro" |
| 1 | En su casa | Vive lejos, quizás en otro continente | **Data center** | Edificio enorme; el video de gatitos en uno de los servidores |
| 2 | Al tocar play | El celular tiene que pedirlo y el data center mandarlo | **El pedido y los pedacitos** | Una flechita sale del celular hacia el data center; vuelve el video partido en muchos pedacitos con la carita del gato |
| 3 | En camino | Tienen que cruzar el océano | **Cable submarino** (luz por vidrio) | Los pedacitos se convierten en pulsos de luz y bajan al fondo del mar |
| 4 | En la costa | Las empresas de internet tienen que conectarse | **Edificio de intercambio** | Cables de colores que se cruzan; los pulsos pasan a la red (color) de tu proveedor |
| 5 | En tu ciudad | Hay kilómetros hasta tu casa | **Tu proveedor** (fibra por la calle) | Los pulsos corren por los postes de tu calle |
| 6 | En la puerta | Llegan como luz y los aparatos no la entienden | **El módem** (cartel: "MÓDEM · en fibra: ONT") | La luz entra al módem y sale señal |
| 7 | En tu casa | El módem tiene una sola salida y hay varios aparatos | **El router** | El router reparte: cada pedacito a su aparato |
| 8 | Los últimos metros | — | **El WiFi** | Los pedacitos salen del router por el aire; el celular los junta y el gatito aparece. "Descargar" = los pedacitos quedan guardados (icono de descarga) |
| — | Remate | "Miles de km de cable para unos metros de aire" | — | La cámara se aleja de tu casa hasta el globo con todos los cables encendidos (loop con el inicio) |

## Hilo visual
- El **gatito convertido en luz** (un pulso con su carita) es lo que sigue la cámara en todo el video: las transiciones
  son el propio viaje (bajar al mar, salir a la costa, correr por los postes, entrar a la casa).
- Contador **"PIEZA N DE 8"** siempre visible.
- Al final el gatito aparece reproduciéndose en el celular: la promesa del principio se cumple.

## Notas de precisión (para el texto del post)
- Casi todo el tráfico entre continentes viaja por **cables submarinos de fibra óptica**; los satélites llevan una parte
  muy chica.
- Los "edificios de intercambio" son los **puntos de intercambio de internet (IXP)**: ahí las redes de distintas
  empresas se conectan entre sí. También se conectan por acuerdos directos entre proveedores.
- Muchas plataformas guardan copias de sus videos cerca de los usuarios (dentro del país o del propio proveedor), así que
  a veces el video no cruza el océano: el ejemplo muestra el camino completo.
- Los "pedacitos" son los **paquetes de datos**: todo lo que viaja por internet va partido en paquetes que se rearman al
  llegar.
- En fibra, el aparato que convierte la luz se llama técnicamente **ONT**; en la calle todos le dicen **módem** (el
  módem propiamente dicho es el de cable o ADSL). Muchas veces viene **en la misma caja que el router**.
- El WiFi es solo el tramo final, de unos metros, entre el router y tus aparatos.
