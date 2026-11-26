# ¿Qué es la nube de verdad?

Pilar: el por qué de las cosas. Formato 4:5 (1080 × 1350), ~45 s. Composición `QueEsLaNube`.

## Voz
El bloque de abajo es el texto de la voz (los scripts leen el primer bloque).

Las etiquetas entre corchetes son *audio tags* de ElevenLabs (modelo **Eleven v3**). Los scripts las ignoran.

```
[casual] "Mis fotos están en la nube." [curious] ¿Pero en qué nube?
[mischievously] Spoiler... [short pause] no hay ninguna nube.
[matter-of-fact] La nube es la computadora de otro.
[short pause] Pero no cualquier computadora.
[impressed] Son edificios enormes, llenos de servidores, que se llaman data centers.
Y hay cientos, repartidos por todo el mundo.
[confident] Empresas como AWS, Azure y Google Cloud los construyen, los enfrían, los protegen, y cambian cada disco que se rompe.
[short pause] Vos no comprás nada de eso.
[relaxed] Lo alquilás, y pagás por lo que usás.
[upbeat] ¿Necesitás un servidor? Está listo en minutos.
¿Ya no lo necesitás? Lo borrás, [short pause] y dejás de pagarlo.
[thoughtful] O sea: el hardware sigue existiendo.
Lo que cambia es quién se encarga de él.
[serious] Eso sí: cómo configurás y protegés lo que armás, [short pause] sigue siendo tu responsabilidad.
[warm] ¿Cuál fue tu primer contacto con la nube?
```

## Escenas (cada una arranca cuando la voz dice la palabra clave)
1. **"nube"**: una nube dibujada; fotos que vuelan hacia ella. "¿en qué nube?": la nube se queda quieta, con un signo de pregunta.
2. **"Spoiler"**: la nube se desarma en partículas y deja ver un servidor.
3. **"computadora de otro"**: el servidor con una etiqueta "de otro".
4. **"edificios"**: zoom out a un data center: un edificio con filas de racks y luces que titilan.
5. **"cientos"**: un mapa de puntos del mundo; se encienden puntos (regiones).
6. **"AWS, Azure y Google Cloud"**: tres tarjetas con el color de cada nube (sin logos). Íconos que aparecen con
   cada verbo: ladrillo (construyen), copo de nieve (enfrían), escudo (protegen), disco que se cambia.
7. **"Vos no comprás"**: una persona con una laptop; el data center tachado de su lado.
8. **"alquilás"**: un medidor que suma solo mientras hay algo prendido.
9. **"servidor? listo en minutos"**: una barra que se llena y aparece un servidor con check. **"Lo borrás"**: se
   desvanece y el medidor se frena.
10. **"hardware sigue existiendo"**: vuelve el rack. **"quién se encarga"**: una flecha lo pasa del lado del proveedor.
11. **"Eso sí"**: dos columnas, "Proveedor" (edificio, hardware, red física) y "Vos" (configuración, accesos, datos).
12. **Cierre**: la pregunta en pantalla.

## Notas de precisión
- "Cientos de data centers": AWS, Azure y GCP tienen decenas de regiones cada uno y cada región varios data centers.
- "Lo borrás y dejás de pagarlo": se dice *borrar* y no *apagar* a propósito (una VM apagada puede seguir cobrando
  el disco).
- La última idea es el modelo de responsabilidad compartida, simplificado.
