# Activación de skills al inicio de sesión — modo product-planner

Al comenzar cualquier conversación en este modo, activa las siguientes skills
antes de responder cualquier solicitud. Si una skill ya está activa en esta
sesión, no la vuelvas a activar.

Skills obligatorias para este modo:

1. `planificacion-simulador-credito`
2. `trazabilidad-requisitos-credito`
3. `reglas-negocio-credito`

Orden: actívalas en paralelo si están disponibles, o en secuencia si alguna
falla. Si una skill no se encuentra, informa al usuario que debe verificar que
el archivo `.bob/skills/<nombre>/SKILL.md` existe en el repositorio y reiniciar
la sesión para que Bob la indexe.
