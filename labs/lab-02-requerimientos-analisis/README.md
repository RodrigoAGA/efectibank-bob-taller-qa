# Lab 02 — Requerimientos y Análisis

## 1. Objetivo del lab

Refinar los requerimientos funcionales del PRD (RF-01 a RF-18) a **historias de usuario en formato INVEST** con criterios de aceptación Gherkin más granulares y construir una **matriz de trazabilidad**. Esta es la fase de **Análisis de requerimientos** del SDLC: se pasa de "qué quiere el negocio" a "qué debe construir el equipo, con qué límites exactos".

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| Business Analyst | Refina historias y matriz de trazabilidad. |
| Product Owner | Valida la intención de negocio. |
| QA Lead | Define criterios de aceptación que luego se puedan probar. |

## 2. Paso a paso con Bob

### Paso 1 — Verificar los insumos del proyecto

Los archivos de este paso ya están preparados en el repositorio. Verifica que tienes lo siguiente antes de continuar:

- `prd/PRD_Simulador_de_Credito_v2.pdf` — PRD fuente del Lab 01.
- `docs/plan/epicas-priorizadas.md` y `docs/plan/risk-register.md` — artefactos del Lab 01.
- `docs/requisitos/historias-usuario-refinadas.md` — plantilla vacía lista para completar.
- `docs/requisitos/matriz-trazabilidad.csv` — RF-01 a RF-18 en estado Pendiente.

### Paso 2 — Verificar el modo `requirements-analyst`

El modo ya está configurado en `.bob/custom_modes.yaml` junto al modo `product-planner` del Lab 01. Verifica que `requirements-analyst` aparece en el selector de modos de Bob antes de continuar.

### Paso 3 — Verificar el Skill de trazabilidad de requisitos

El Skill ya está creado en `.bob/skills/trazabilidad-requisitos-credito/SKILL.md`. Verifica que aparece en la pestaña **Skills** de Bob y aprueba su activación si Bob lo solicita. Úsalo a partir del Paso 4.

### Paso 4 — Aclarar reglas de negocio ambiguas (modo Ask)
```
Lee la sección 5 (Reglas de negocio) de @prd/PRD_Simulador_de_Credito_v2.pdf y
las preguntas abiertas en @docs/plan/risk-register.md. Identifica,
para cada campo de la tabla 5.1, cualquier caso donde el PRD sea ambiguo o
incompleto (p. ej. formato de exportación, dónde se almacena la simulación,
canal del botón de contacto).
```

### Paso 5 — Refinar historias de usuario (cambia a `requirements-analyst`, mismo chat)
Sin abrir una conversación nueva, cambia con `Ctrl+.` (o el selector) a
**`requirements-analyst`**.
```
Con el Skill trazabilidad-requisitos-credito activo, usa @prd/PRD_Simulador_de_Credito_v2.pdf y la plantilla en @docs/requisitos/historias-usuario-refinadas.md,
convierte cada RF-01 a RF-18 en una
historia de usuario formato INVEST: "Como [rol] quiero [acción] para [beneficio]",
con 2-4 criterios de aceptación en formato Gherkin (Dado/Cuando/Entonces),
más específicos que los del PRD original. Agrupa por épica según
@docs/plan/epicas-priorizadas.md. Guarda el resultado en
docs/requisitos/historias-usuario-refinadas.md.
```

### Paso 6 — Matriz de trazabilidad (sigue en `requirements-analyst`)
```
Con el Skill trazabilidad-requisitos-credito activo, a partir de docs/requisitos/historias-usuario-refinadas.md, genera una matriz de
trazabilidad en CSV con columnas: RF, Épica, Historia, Criterio de aceptación,
Estado (Pendiente). Usa el formato de matriz creado arriba. Guarda el
resultado en docs/requisitos/matriz-trazabilidad.csv.
```
Esta matriz se reutiliza en el Lab 07 para verificar cobertura de pruebas.

### Paso 7 — Glosario de negocio (sigue en `requirements-analyst`)
```
Con el Skill trazabilidad-requisitos-credito activo, del PRD arma un glosario de negocio para el equipo técnico con: TEA, TEM,
cuota inicial, bono, período de gracia, cuotas dobles, seguro de desgravamen
(sin/con devolución), monto financiado. Usa lenguaje simple, un párrafo por
término. Guarda el resultado en docs/requisitos/glosario-negocio.md.
```

## 4. Al completar el lab

En `docs/requisitos/` debes tener:
- `historias-usuario-refinadas.md`
- `matriz-trazabilidad.csv`
- `glosario-negocio.md`

Estos documentos alimentan los Labs 03 y 04, y el Lab 07 usa los criterios Gherkin como base de pruebas.
