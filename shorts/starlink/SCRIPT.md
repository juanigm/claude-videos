# "Armamos una antena de Starlink desde cero"

Formato: se construye desde cero, problema por problema (como el candado / el Switch de la referencia). Cada pieza
aparece porque la anterior tiene un problema. Todo público, sin jerga. Estilo visual oficial: **2D premium** (ver
CANAL.md). 9:16, todas las redes. Objetivo ~85-90 s (incluye cómo se comunica la antena con el satélite). Sin logos de Starlink / SpaceX: el nombre solo como texto.

## Voz (ElevenLabs, Eleven v3)

```
[curious] Vives en el campo. No llega fibra, no llega cable... ¿cómo tienes internet? [short pause] Vamos a armar una antena de Starlink desde cero.
[confident] Si ningún cable llega a tu casa, la señal tiene que venir del cielo: de un satélite.
[thoughtful] Pero los satélites de siempre están a treinta y seis mil kilómetros: la señal tarda tanto, que una videollamada se traba.
[upbeat] Entonces Starlink los pone mucho más cerca: a unos quinientos cincuenta kilómetros.
[curious] Pero tan cerca, se mueven rapidísimo, y cada uno cruza tu cielo en minutos. Así que lanzan miles, para que siempre haya uno arriba tuyo.
[impressed] Pero tu antena tendría que perseguirlos. Por eso no es un plato que gira: es una placa con cientos de antenitas.
[curious] ¿Y cómo se habla con el satélite? Con ondas de radio, como las del WiFi, pero concentradas en un haz finito, como una linterna.
[thoughtful] Si cada antenita dispara su onda un instante antes que la de al lado, el haz se inclina. Así apunta al satélite... sin moverse.
[confident] Por ese haz sube tu pedido, y baja la respuesta.
[matter-of-fact] Ahora, el satélite no es internet: le pasa tu señal a una estación en tierra, conectada a internet... por fibra.
[mischievously] ¿Y en el medio del océano? Los satélites se pasan la señal entre ellos, con láseres.
[relaxed] En tu casa, la antena se conecta a un router, que reparte internet por WiFi.
[serious] Eso sí: la antena necesita ver el cielo. Si un árbol corta el haz, se corta internet.
[warm] Y listo: internet desde el espacio... que igual termina en un cable. [curious] ¿Lo sabías?
```

## Las piezas (problema → pieza) y sus escenas
| # | Problema | Pieza | Escena (2D premium) |
|---|---|---|---|
| — | Hook: casa en el campo, sin cables | — | Casa sola en el campo al atardecer; un cable de fibra llega desde la ciudad y se corta lejos; ícono de WiFi tachado |
| 1 | Ningún cable llega | **El satélite** | La cámara sube al cielo; aparece un satélite |
| 2 | Los de siempre están a 36.000 km: la señal tarda (videollamada trabada) | **Órbita baja (~550 km)** | La Tierra desde el espacio con dos anillos: uno lejísimos (36.000 km) y uno pegado (550 km); un pulso tarda mucho en el lejano y poco en el cercano; una videollamada que se congela y luego fluye |
| 3 | Tan cerca se mueven rapidísimo y cruzan tu cielo en minutos | **Miles de satélites** (constelación) | Satélites que cruzan el cielo sobre la casa; la Tierra se llena de puntitos en órbita |
| 4 | La antena tendría que perseguirlos | **Antena plana** | Primer plano: un plato que gira mareado (tachado) vs. la placa; vista "por dentro" con cientos de antenitas en grilla |
| 5 | ¿Cómo se habla con el satélite? | **El haz de radio** | Fondo oscuro, explicación abstracta: ondas que salen de cada antenita; primero todas a la vez (haz recto, como una linterna); después cada una un instante antes que la vecina (las ondas se encadenan y el haz se inclina); el haz sigue al satélite que cruza mientras la placa queda quieta. Por el haz suben y bajan paquetitos (pedido / respuesta) |
| 6 | El satélite no es internet | **Estación en tierra** | Una estación con antenas grandes; desde ella un cable de fibra **bajo tierra** hasta la ciudad / data center |
| 7 | En el medio del océano no hay estaciones | **Láseres entre satélites** | Sobre el océano, líneas de láser que saltan de satélite en satélite hasta una estación lejana |
| 8 | En tu casa hay varios aparatos | **Router + WiFi** | Interior de la casa en corte: cable de la antena al router, ondas de WiFi a celular, tele y compu |
| 9 | Un árbol corta el haz | **Cielo despejado** | El haz choca con la copa de un árbol → ícono de corte; la antena pasa al techo → vuelve la señal |
| — | Remate | — | La cámara se aleja: casa → estación → fibra → la Tierra con la constelación. Fila de íconos de las 9 piezas |

Contador **"PIEZA N DE 9"** siempre visible.

## Notas de precisión (para el texto del post)
- Los satélites geoestacionarios tradicionales orbitan a ~35.786 km: la señal hace un viaje largo (mucha latencia).
  Starlink usa **órbita baja**, a unos 550 km (hay capas entre ~340 y ~570 km): mucha menos latencia.
- En órbita baja un satélite da la vuelta a la Tierra en ~95 minutos: por eso hacen falta **miles** para cubrir todo
  el tiempo, y la antena cambia de satélite cada pocos minutos.
- Antena y satélite se comunican con **ondas de radio de alta frecuencia (microondas, bandas Ku y Ka)**, en ambos
  sentidos: tu pedido sube y la respuesta baja.
- La antena es un **phased array**: muchos elementos pequeños que dirigen el haz **electrónicamente**, ajustando la fase
  (el "instante" en que emite cada elemento) para que las ondas se sumen en una dirección. Algunos modelos
  tienen motores o patas solo para orientarse al instalarla, pero el seguimiento de los satélites es electrónico.
- El satélite reenvía el tráfico a **estaciones terrenas (gateways)**, conectadas a internet por fibra. Donde no hay
  estaciones cerca, los satélites usan **enlaces láser** entre ellos.
- La antena necesita **vista despejada del cielo**: árboles o techos producen cortes. La app oficial tiene una
  herramienta para revisar obstrucciones antes de instalarla.
