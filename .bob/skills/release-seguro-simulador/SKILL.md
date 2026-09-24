---
name: release-seguro-simulador
description: Construye CI, release notes y rollback con trazabilidad y controles humanos.
---

Objetivo: preparar una liberación verificable del Simulador de Crédito sin
exponer secretos ni omitir controles.

Fuentes de verdad: package.json de frontend y backend, resultados del Lab 07,
.github/workflows/ si existe y docs/release/. Antes de editar, identifica los
comandos reales de lint, typecheck, test y build de cada paquete; no inventes
scripts ni hosting.

Reglas: ningún secreto en código, logs, YAML o documentación; staging es
simulado; deploy requiere Environment y aprobación humana; main permanece
desplegable; cada cambio debe poder revertirse con un PR de revert. El workflow
debe separar verificación, build y deploy, y detener el deploy si falla una
verificación previa.

Salida requerida: antes de editar enumera archivos, permisos y riesgos. Después
de editar, explica triggers, jobs, dependencias, gate, evidencia de ejecución,
versión liberada y pasos de rollback. Si falta una aprobación o secreto, deja
el paso bloqueado y explica quién debe resolverlo.
