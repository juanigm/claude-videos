# Textos para publicar

Regla general: la primera línea es el gancho y lleva las palabras clave (Instagram y TikTok funcionan como buscadores).
Después de publicar: **fijar como comentario la pregunta del final** y responder todo en la primera hora.

---

## Video 1 · Tienda online hackeada

### LinkedIn (video técnico 4:5 · `out/te-hackean-tienda/te-hackean-tienda_v4_final.mp4`)
```
Montamos una tienda online en la nube y nos hackearon 4 veces. 🔓

Los 4 errores de seguridad más comunes al desplegar en cloud, en 60 segundos:

1️⃣ SSH (puerto 22) abierto a 0.0.0.0/0 con contraseña débil
→ No lo expongas: llaves SSH + acceso por bastión o por sesión del proveedor (Session Manager, Azure Bastion, IAP).

2️⃣ Base de datos con IP pública
→ Subred privada y regla de entrada que solo acepte al servidor de la app.

3️⃣ Bucket público "total nadie adivina el nombre"
→ Bloqueo de acceso público + URLs firmadas que vencen (presigned URL / SAS / signed URL).

4️⃣ Claves de la nube subidas a GitHub
→ Roles en vez de claves (IAM roles / managed identities / service accounts) y un gestor de secretos.

⚠️ Si alguna vez subiste una clave a un repo: borrar el commit no alcanza. Revocala ya.

La seguridad no es un paso más: va en cada paso.
¿Cuál de estas ya te pasó (o viste en producción)? 👇

#CloudSecurity #AWS #DevOps
```

### Instagram (video general 9:16 · `out/tienda-general/tienda-general_9x16_v1.mp4`)
```
Así te hackean una tienda online (4 errores que comete casi todo el mundo) 🔓

1. Dejar la "puerta trasera" del servidor abierta con la clave admin123
2. Dejar los datos de tus clientes a la vista de internet
3. Guardar fotos y facturas en un depósito público
4. Publicar el código con la llave de tu cuenta adentro

⚠️ Hay robots probando puertas abiertas en internet las 24 horas. No es "si" te encuentran, es "cuándo".

Guárdalo para cuando armes tu tienda y mándaselo a ese amigo que usa la misma contraseña para todo 😅

¿Cuál te sorprendió más? 👇

#ciberseguridad #tiendaonline #emprendedores #tecnologia #seguridadinformatica
```
Comentario fijado: `¿Cuál de los 4 te sorprendió más? 1, 2, 3 o 4 👇`
Portada: cuadro del hacker con el título "Y TE HACKEAN, BRO".

### TikTok
```
4 formas de que te hackeen una tienda online 🔓 La 4 duele en la tarjeta 💳 ¿Cuál te sorprendió más?
#ciberseguridad #tiendaonline #emprendimiento #tecnologia #aprendeentiktok
```

### YouTube Shorts
- **Título:** `Así te hackean una tienda online (y cómo evitarlo) 🔓`
- **Descripción:**
```
4 errores de seguridad que cometen casi todas las tiendas online, explicados con dibujos:
puerta trasera abierta, datos a la vista, depósito público y la llave en el código.
¿Cuál te sorprendió más?
#ciberseguridad #tiendaonline #shorts
```

### Facebook (Reel)
```
¿Tienes o piensas abrir una tienda online? 🛒 Estas son las 4 formas más comunes de que te la hackeen, y cómo evitarlas en un minuto.
Compártelo con alguien que esté por emprender 👇
#ciberseguridad #emprendedores #tiendaonline
```

---

## Video 2 · ¿Qué es la nube de verdad?

### LinkedIn (video técnico 4:5 · `out/que-es-la-nube/que-es-la-nube_v2_final.mp4`)
```
"Está en la nube." ☁️ ¿Qué significa eso, exactamente?

Spoiler: no hay ninguna nube. Hay data centers.

En 50 segundos:
• Cientos de data centers repartidos por el mundo (AWS, Azure y Google Cloud tienen decenas de regiones cada uno, con varios data centers por región).
• El proveedor construye, enfría, protege y reemplaza el hardware.
• Vos no comprás: alquilás y pagás por uso. Un servidor está listo en minutos y deja de cobrarse cuando lo borrás (ojo: apagado no siempre es gratis, los discos siguen cobrando).
• El hardware sigue existiendo. Lo que cambia es quién se encarga de él.

Y lo más importante: el modelo de responsabilidad compartida. El proveedor cuida el edificio, los servidores y la red física. La configuración, los accesos y tus datos siguen siendo tuyos.

¿Cuál fue tu primer contacto con la nube? 👇

#CloudComputing #AWS #Azure
```

### Instagram (video general 9:16 · `out/nube-general/nube-general_9x16_v1.mp4`)
```
¿Dónde están tus fotos cuando dices "están en la nube"? ☁️

Spoiler: no hay ninguna nube. Hay edificios gigantes llenos de computadoras, en todo el mundo, cuidados las 24 horas.

✔️ Ahí viven tus fotos, tus chats y la serie que viste anoche
✔️ Empresas como Amazon, Microsoft y Google los construyen y los cuidan
✔️ Las empresas no compran esas computadoras: las alquilan, como la luz o el agua

⚠️ Ellos cuidan el edificio. Lo que guardas adentro y a quién le das la llave (tu contraseña) sigue siendo cosa tuya.

Mándaselo a alguien que todavía cree que la nube está en el cielo ☁️😂

¿Sabías esto? 👇

#lanube #tecnologia #datoscuriosos #internet #aprendeconmigo
```
Comentario fijado: `¿Sabías que tus fotos vivían en un edificio así? Sí / No 👇`
Portada: el data center con el título "NO HAY NINGUNA NUBE".

### TikTok
```
La nube no existe ☁️ Tus fotos viven en un edificio gigante (y no es tuyo) 🏢 ¿Sabías esto?
#lanube #tecnologia #datoscuriosos #internet #aprendeentiktok
```

### YouTube Shorts
- **Título:** `¿Dónde están tus fotos cuando están "en la nube"? ☁️`
- **Descripción:**
```
Spoiler: no hay ninguna nube. Te explico en 1 minuto qué es la nube, quién la cuida y qué parte te toca a ti.
#lanube #tecnologia #shorts
```

### Facebook (Reel)
```
Todos decimos "está en la nube"... pero ¿dónde está realmente? ☁️ Te lo explico en un minuto, sin palabras raras.
Compártelo con alguien que siempre pregunta "¿y dónde se guarda eso?" 👇
#tecnologia #lanube #datoscuriosos
```

---

## Orden sugerido de publicación
1. **"¿Qué es la nube?"** primero: es la base y le habla a todo el mundo.
2. **"Tienda hackeada"** 2 o 3 días después: estrena la serie "Y te hackean, bro #1".
3. En cada red, publicar a la misma hora durante las primeras semanas y mirar en Insights cuál funciona mejor.
