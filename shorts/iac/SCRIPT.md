# "Infraestructura como código (IaC), problema por problema"

Video **explicativo** (pilar "el por qué de las cosas"), 9:16 para todas las redes, estilo **2D premium** (ver CANAL.md).
Formato de `internet-en-casa`: se arranca a mano, cada problema trae su pieza, con títulos "PROBLEMA: / PIEZA N:" y el
contador "PIEZAS". Cierra con el ciclo de vida, las ventajas, las herramientas y el gancho al próximo video (CI/CD).
Objetivo ~80-85 s.

## Voz (ElevenLabs, Eleven v3)

```
[curious] ¿Cómo crean su infraestructura las empresas en la nube? [short pause] Vamos problema por problema.
[matter-of-fact] Tienes una app y necesitas una red, un servidor y una base de datos. Entras a la consola y los creas a mano: clic, clic, clic.
[thoughtful] Pero ahora necesitas lo mismo para pruebas. Repites todos los clics... y te olvidas de uno. En pruebas anda, en producción no.
[confident] Entonces aparece la infraestructura como código: escribes en un archivo lo que quieres tener.
[matter-of-fact] Una herramienta lee ese archivo y lo crea por ti. Mismo archivo, mismo resultado.
[thoughtful] Pero, ¿y si te equivocas? Antes de tocar nada, la herramienta te muestra un plan: qué va a crear, qué va a cambiar y qué va a borrar.
[matter-of-fact] Lo apruebas, lo aplica, y guarda un estado: una memoria de todo lo que creó, para saber qué cambiar la próxima vez.
[curious] Pero en un equipo, ¿quién cambió qué? Como es código, va a Git: queda el historial, tus compañeros lo revisan, y si algo sale mal, vuelves atrás.
[sighs] Y si un día se borra todo... no lo rehaces de memoria: aplicas el archivo y en minutos está otra vez en pie.
[upbeat] Así, la infraestructura vive el mismo ciclo que una app: escribes, revisas, aplicas, cambias... y lo que ya no usas, lo destruyes y dejas de pagarlo.
[upbeat] ¿Con qué se hace? Terraform sirve para casi cualquier nube. CloudFormation es de AWS, Bicep de Azure, y Pulumi te deja usar lenguajes como Python.
[mischievously] Pero todavía alguien tiene que correr esos comandos a mano. ¿Y si cada cambio aprobado se aplicara solo?
[excited] Eso hace un pipeline de CI/CD. Lo vemos en el próximo video. [curious] ¿Tú qué herramienta usas?
```

Al generar la voz: "CI/CD" se pronuncia en inglés ("si-ai si-di"). Si ElevenLabs lo lee raro, escribir "ci ai, ci di"
solo en el texto que se le pasa a ElevenLabs (el guion de acá queda igual, para las captions).

## Escenas (problema → pieza)
| # | Escena (lugar) | Problema | Pieza / título |
|---|---|---|---|
| 0 | Ciudad de noche con una nube gigante llena de servidores | — | INFRAESTRUCTURA COMO CÓDIGO / PROBLEMA POR PROBLEMA |
| 1 | Oficina en corte: dev en su escritorio; zoom al monitor con la consola web, el cursor hace clic en "Crear" | TODO A MANO | sticker "clic, clic, clic" |
| 2 | Pantalla partida PRUEBAS / PRODUCCIÓN: a pruebas le falta una pieza, cartel rojo | PRUEBAS ≠ PRODUCCIÓN | sticker "¿anda en una sola?" |
| 3 | Editor de código sobre fondo oscuro: se tipea `main.tf` (red, servidor, base de datos) | — | PIEZA 1: EL CÓDIGO |
| 4 | El archivo entra a una máquina (la herramienta) y salen los recursos, iguales en los dos entornos | — | PIEZA 2: LA HERRAMIENTA |
| 5 | Terminal con el plan: + crear, ~ cambiar, − borrar; sello APROBADO | ¿Y SI TE EQUIVOCAS? | PIEZA 3: EL PLAN |
| 6 | La libreta del estado: lo que existe en la nube con tildes | — | PIEZA 4: EL ESTADO |
| 7 | Equipo de 3, gráfico de commits, revisión, flecha de "volver atrás" | ¿QUIÉN CAMBIÓ QUÉ? | PIEZA 5: GIT |
| 8 | La nube se apaga y los recursos se caen; se aplica el archivo y todo vuelve con un reloj | SE BORRÓ TODO | EN MINUTOS, OTRA VEZ EN PIE |
| 9 | Ciclo circular: escribir → revisar → aplicar → cambiar → destruir; medidor de costo que baja | — | EL CICLO DE VIDA |
| 10 | Grilla de herramientas (fichas de color con el nombre, sin logos) | — | ¿CON QUÉ SE HACE? |
| 11 | Dev tipeando comandos → cinta transportadora del pipeline que lleva el cambio a la nube | TODAVÍA A MANO | PRÓXIMO VIDEO: CI/CD |
| 12 | Fila con las 5 piezas + pregunta | — | ¿TÚ QUÉ HERRAMIENTA USAS? |

## Notas de precisión (para el texto del post)
- "Declarativo": describes **el resultado** (qué quieres tener), no los pasos. La herramienta calcula qué hacer.
- Terraform: `terraform plan` muestra los cambios; `terraform apply` los aplica; `terraform destroy` borra todo lo
  que maneja. El **estado** (`terraform.tfstate`) se guarda en un backend remoto compartido (S3, Azure Storage, GCS,
  HCP Terraform) con bloqueo, no en la laptop, y **puede tener datos sensibles**: cifrado y con acceso restringido.
- Terraform cambió su licencia a BSL en 2023; **OpenTofu** es el fork abierto (Linux Foundation), casi compatible.
- CloudFormation (AWS) y Bicep (Azure, compila a plantillas ARM) son de cada nube; en GCP, **Infrastructure Manager**
  usa Terraform por debajo. Pulumi y **AWS CDK** usan lenguajes de programación (Python, TypeScript, Go, C#...).
- **Ansible** (y Chef / Puppet) se usa más para **configurar** lo que corre dentro de los servidores; se combina con
  Terraform.
- "Drift": si alguien cambia algo a mano en la consola, el próximo `plan` lo detecta y propone volver a lo escrito.
- ⚠️ Consejo: nunca subir el archivo de estado ni claves al repo; las credenciales van en el pipeline o en un gestor de
  secretos.
