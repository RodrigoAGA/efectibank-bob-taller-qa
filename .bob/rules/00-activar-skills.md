# Activación de skills al inicio de conversación

Al comenzar cualquier conversación, activa todas las siguientes skills antes de
responder cualquier solicitud. Si una skill ya está activa en esta conversación,
no la vuelvas a activar.

Skills obligatorias para este proyecto:

1. `trazabilidad-requisitos-credito`
2. `reglas-negocio-credito`
3. `arquitectura-simulador-credito`
4. `frontend-simulador-credito`
5. `validacion-simulador`
6. `release-seguro-simulador`
7. `respuesta-incidente-tarifario`

Actívalas en paralelo. Si una skill no se encuentra, informa al usuario que
debe verificar que el archivo `.bob/skills/<nombre>/SKILL.md` existe en el
repositorio e iniciar una nueva conversación para que Bob la indexe.
