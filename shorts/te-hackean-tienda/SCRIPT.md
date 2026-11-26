# "Armamos una tienda online en la nube... y te hackean, bro"

Serie: **Y te hackean, bro**. Formato: construir desde cero, problema por problema; cada pieza se agrega mal,
te hackean, y se arregla. ~60 s, 4:5. Composición `TeHackeanTienda`.

## Voz (ElevenLabs, modelo Eleven v3: las etiquetas entre corchetes son audio tags)

```
[casual] Vamos a montar una tienda online en la nube. [mischievously] Spoiler: nos van a hackear.
[confident] Primero, levantas un servidor y dejas el puerto veintidós abierto a todo internet, [proud] con la contraseña admin, uno, dos, tres.
[short pause] [deadpan] Y te hackean, bro.
[matter-of-fact] Entonces cierras ese puerto al mundo, y cambias la contraseña por llaves.
[upbeat] Luego agregas la base de datos de clientes, [casual] y le pones una IP pública para revisarla desde casa.
[short pause] [deadpan] Y te hackean, bro.
[matter-of-fact] Así que le quitas la IP pública, la mueves a una red privada, y solo dejas que el servidor le hable.
[upbeat] Después guardas las fotos y facturas en un bucket público. [casual] Total, ¿quién va a adivinar el nombre?
[sighs] Los bots.
[deadpan] Y te hackean, bro.
[matter-of-fact] Entonces lo haces privado, y usas links que vencen.
[proud] Por último, subes el código a GitHub... [short pause] con las claves de la nube adentro.
[laughs] En minutos, alguien está minando cripto con tu tarjeta.
[deadpan] Y te hackean, bro. [short pause] [sighs] Y encima pagas la factura.
[serious] Así que sacas las claves del código, y usas roles y un gestor de secretos.
[warm] La seguridad no es un paso más: va en cada paso. [curious] ¿Cuál de estas ya te pasó?
```

## Escenas (cada una arranca en la palabra clave)
| Palabra | Qué se ve | HUD "SEGURIDAD" |
|---|---|---|
| "tienda" | Nube-plataforma; cae un cartel de tienda ("MI TIENDA") | aparece, 100 % |
| "Spoiler" | Guiño: el hacker asoma un segundo por detrás de la nube y se esconde | |
| "servidor" | Cae el rack | |
| "veintidós" | Se abre el puerto en el costado (rojo) + etiqueta `0.0.0.0/0` | baja |
| "admin" | Nota adhesiva `admin123` | baja |
| "hackean" #1 | Pantalla roja, glitch, hacker sube atrás. Título "Y TE HACKEAN, BRO" + contador "HACKEOS: 1" | HACKEADO |
| "cierras" | Puerta se cierra, candado + llave | sube |
| "base" | Aparece un cilindro de base de datos (con íconos de personas) | |
| "IP pública" | Un cable/antena al mundo con cartel `IP PÚBLICA` | baja |
| "hackean" #2 | Hackeo; los datos (fichitas) salen volando de la base | HACKEOS: 2 |
| "red privada" | Una cúpula/vallado alrededor de la base; un único caño la une al servidor | sube |
| "bucket" | Un balde 3D lleno de fotos y facturas, con cartel `PÚBLICO` | baja |
| "bots" | Bots rojos rodean el balde | |
| "hackean" #3 | Las fotos salen volando del balde | HACKEOS: 3 |
| "privado" | Tapa con candado sobre el balde; un link con reloj ("vence en 5 min") | sube |
| "GitHub" | Una caja de código sube a una nube aparte; dentro brilla una llave dorada | |
| "cripto" | Monedas girando + la tarjeta de crédito echando humo; aparece el **HUD de la factura** (cameo de la prueba A) | |
| "hackean" #4 | Hackeo final, el más exagerado | HACKEOS: 4 |
| "sacas" | La llave sale del código y entra en una caja fuerte ("SECRETOS"); el servidor lleva un gafete ("ROL") | 100 % |
| "cada paso" | Plano general de todo armado y con candados | 100 % |
| "¿Cuál...?" | Cartel de cierre con la pregunta | |

Chiste recurrente: el contador **"HACKEOS: N"** que sube cada vez que se dice "y te hackean, bro".

## Precisión técnica (para el texto del post)
1. **SSH (puerto 22) abierto a 0.0.0.0/0**: los bots escanean internet buscándolo todo el tiempo. Arreglo: no exponerlo;
   entrar con llaves SSH y desde una IP o bastión permitido, o con el acceso por sesión del proveedor (AWS Systems
   Manager Session Manager, Azure Bastion, IAP en GCP). Reglas: Security Groups (AWS), NSG (Azure), firewall de VPC (GCP).
2. **Base de datos con IP pública**: va en una subred privada y su regla de entrada solo acepta al servidor de la app.
3. **Bucket público**: AWS S3 Block Public Access, Azure "acceso anónimo deshabilitado" en la cuenta de storage,
   GCP "public access prevention". Para compartir: URLs firmadas que vencen (presigned URL / SAS / signed URL).
4. **Claves en GitHub**: hay bots que leen repos públicos buscando claves; el uso típico es minar cripto con tu cuenta.
   Arreglo: roles en vez de claves (IAM roles / managed identities / service accounts) y gestor de secretos
   (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager). Si una clave se filtró: revocarla ya, no solo borrar el commit.

## Texto del post (borrador)
Armamos una tienda online en la nube y nos hackearon 4 veces 🔓

1. Servidor con el puerto 22 abierto al mundo
2. Base de datos con IP pública
3. Bucket público "total nadie adivina el nombre"
4. Claves de la nube subidas a GitHub

⚠️ Si alguna vez subiste una clave a un repo: borrar el commit no alcanza. Revocala ya.

¿Cuál de estas ya te pasó? 👇

📚 Fuentes: documentación oficial de AWS (Security Groups, S3 Block Public Access, IAM roles, Secrets Manager),
Azure (NSG, Key Vault, Managed Identities) y Google Cloud (VPC firewall, Public Access Prevention, Secret Manager).
