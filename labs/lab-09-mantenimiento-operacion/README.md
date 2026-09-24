# Lab 09 — Mantenimiento y Operación

## 1. Objetivo del lab

Cerrar el ciclo del SDLC con la fase de **Mantenimiento**: triage de un incidente real (tasa desactualizada, primer riesgo identificado en la sección 8.1 del PRD desde el Lab 01), implementación de un hotfix con Bob, postmortem, y planificación del backlog de la fase 2 (las "preguntas abiertas" del PRD que quedaron pendientes). Se cierra además con una revisión de **Bobalytics** para medir cómo usó Bob el equipo durante todo el bootcamp.

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| SRE / Soporte | Detecta y hace triage del incidente. |
| Developers | Implementan el hotfix y la regresión. |
| Product Owner | Prioriza backlog v2 y revisa aprendizajes. |

## 3. Artefactos de entrada

Los siguientes archivos ya están preparados en el repositorio:

- `docs/operacion/incident-report.md` — plantilla vacía lista para completar.
- `docs/operacion/bobalytics-review.md` — plantilla vacía lista para el Paso 6.

## 4. Paso a paso con Bob

### Modo recomendado — `incident-commander`

`incident-commander` delimita impacto, coordina el hotfix y documenta el
postmortem. Úsalo en los pasos 2–5; el Paso 1 se hace en Ask para un triage sin cambios.

### Paso 0 — Verificar el modo `incident-commander` y el Skill `respuesta-incidente-tarifario`

El modo y el Skill ya están configurados en el repositorio:

- `.bob/custom_modes.yaml` — modo `incident-commander` disponible. Verifica que aparece en el selector y selecciónalo antes de iniciar el Paso 2.
- `.bob/skills/respuesta-incidente-tarifario/SKILL.md` — Skill disponible. Actívalo antes del Paso 1 y mantenlo activo durante los pasos 2–5.

### Paso 1 — Triage del incidente (modo Ask)
```
Con el Skill respuesta-incidente-tarifario activo, lee @labs/lab-09-mantenimiento-operacion/artefactos/bug-ejemplo.md. Con base en el código del motor de cálculo en /backend y el
cliente del tarifario, dame un diagnóstico probable de la causa raíz y el nivel
de severidad (dado que afecta una cifra mostrada a clientes de un banco).
Ten en cuenta que /backend vive en la raíz del repositorio.
```

### Paso 2 — Crear y usar una persona para mapear el impacto (cambia a `incident-commander`)
Los subagents solo se pueden lanzar en modos que los permitan; Ask no puede iniciarlos. Cambia de Ask a `incident-commander` con `Ctrl+.`.
En la pantalla de subagents, crea la persona `tarifario-impact-analyst` con acceso
solo a lectura y pega este contenido:

```markdown
---
name: tarifario-impact-analyst
description: Maps the impact of tariff and credit-rate changes. Read-only.
tools:
- read
---

You are a Banco ACME incident analyst. Trace every direct and indirect consumer
of tariff data, TEA, insurance rates, and validation ranges. Return a table with
File, dependency or field, impact if the range changes, and evidence. Separate
confirmed facts from assumptions. Do not edit files or propose a fix.
```

Antes de tocar código, quieres saber en cuántos lugares del repo se consume el tarifario sin llenar tu conversación principal con los resultados de una búsqueda exhaustiva. Esta persona especializa al subagent de exploración y conserva un límite de solo lectura.
```
Usa la persona tarifario-impact-analyst en un subagent de exploración para mapear
todos los archivos del repo que consumen tarifarioClient o que leen tasas TEA/de
seguro directamente. Devuelve la tabla definida por la persona y un resumen de
qué se rompería si cambio la validación de rangos.
```
Aprueba el subagent cuando Bob lo solicite.

### Paso 3 — Implementar el hotfix (sigue en `incident-commander`)
```
Con el Skill respuesta-incidente-tarifario activo y con ese mapa de impacto, implementa el fix para @labs/lab-09-mantenimiento-operacion/artefactos/bug-ejemplo.md: el
mock de tarifario debe versionar las tasas y el backend (en /backend en la raíz del repositorio) debe rechazar
explícitamente una tasa fuera del rango TEA mínima/máxima del producto en vez
de aceptarla silenciosamente. Agrega una prueba de regresión para este caso.
```
Antes de abrir el PR, corre `/review` sobre el fix.

### Paso 4 — Postmortem (sigue en `incident-commander`)
```
Con el Skill respuesta-incidente-tarifario activo, redacta un postmortem del incidente: qué pasó, impacto, causa raíz, cómo se
detectó, el fix aplicado, y 2-3 acciones preventivas (p. ej. una prueba de
regresión automática de rangos de tasa en el pipeline de CI del Lab 08).
Guarda en docs/operacion/postmortem.md.
```
Si necesitas confirmar exactamente qué introdujo el bug, puedes preguntar directamente por un commit puntual: `¿qué cambió el commit @a1b2c3d que tocó el tarifario-seed.json?` La mención `@<hash>` trae el mensaje, autor, fecha y diff completo de ese commit al chat, útil para reconstruir la causa raíz sin buscar manualmente en el historial de Git.

### Paso 5 — Backlog v2 (sigue en `incident-commander`)
```
Con el Skill respuesta-incidente-tarifario activo, usando
@docs/plan/risk-register.md y @docs/plan/epicas-priorizadas.md, arma el
backlog de la fase 2: integración con solicitud real de crédito, autenticación,
evaluación crediticia, captura de contacto para envío por correo. Prioriza con
MoSCoW. Guarda en docs/operacion/backlog-v2-mejoras.md.
```

### Paso 6 — Revisión de Bobalytics
Como cierre del bootcamp, entra al portal de Bob ([bob.ibm.com](https://bob.ibm.com)) → **Admin** → **Bobalytics**, y revisa con el equipo:
- Tasa de adopción durante el bootcamp.
- Bob factor (líneas de código generadas por Bob en el repo `simulador-credito-banco-acme`).
- Gasto en Bobcoins de los 9 labs.

Documenta hallazgos y aprendizajes en `docs/operacion/bobalytics-review.md` usando
la estructura incluida al inicio de este lab.

## 5. Al completar el lab

- `docs/operacion/postmortem.md`, `backlog-v2-mejoras.md` y
  `bobalytics-review.md` creados.
- La persona `tarifario-impact-analyst` usada para el análisis de impacto.
