# Lab 03 — Arquitectura

## Objetivo

Define componentes, límites entre frontend y backend, persistencia SQLite local,
servicios externos, secuencia de simulación y decisiones de stack.

## Roles involucrados

| Rol | Qué hace en este lab |
|---|---|
| Arquitecto de Software / Tech Lead | Define componentes, contratos y ADR. |
| Product Owner | Resuelve preguntas abiertas de alcance. |

## Paso a paso con Bob

### Paso 1 — Verificar contratos y plantilla de ADR

Los siguientes archivos ya están preparados en el repositorio. Verifica que los tienes antes de continuar:

- `docs/contracts/tarifario-api.yaml` — contrato del servicio mock de tasas TEA y seguro.
- `docs/contracts/contacto-asesor-api.yaml` — contrato del servicio mock de leads comerciales.
- `docs/arquitectura/adr-001-stack.md` — plantilla vacía lista para completar.

### Paso 2 — Verificar el modo `software-architect`

El modo ya está configurado en `.bob/custom_modes.yaml` junto a los modos anteriores. Verifica que `software-architect` aparece en el selector de modos de Bob antes de continuar.

### Paso 3 — Verificar el Skill de arquitectura

El Skill ya está creado en `.bob/skills/arquitectura-simulador-credito/SKILL.md`. Verifica que aparece en la pestaña **Skills** de Bob y aprueba su activación si Bob lo solicita. Actívalo para los pasos restantes.

### Paso 4 — Entender los insumos con Ask

Selecciona el modo **Ask**. En el chat de Bob, pega y envía este prompt:

```text
Lee @docs/requisitos/historias-usuario-refinadas.md,
@docs/contracts/tarifario-api.yaml y @docs/contracts/contacto-asesor-api.yaml.
Resume los componentes necesarios, las responsabilidades de cada uno, los datos
que cruzan cada límite y las decisiones que el PRD no define. No crees archivos.
```

Revisa la respuesta. Si Bob asume una integración o dato que no aparece en los
insumos, anótalo como pregunta abierta, no como decisión.

### Paso 5 — Generar el diagrama

Cambia el selector al modo `software-architect`. Comprueba que el Skill
`arquitectura-simulador-credito` sigue activo. En el chat de Bob, pega y envía:

```text
Con el Skill arquitectura-simulador-credito activo, usa las historias y los dos
OpenAPI que acabamos de revisar. Crea
docs/arquitectura/architecture-diagram.md con:
1. un diagrama Mermaid de componentes;
2. un diagrama Mermaid de secuencia para simular crédito;
3. una tabla que relacione cada componente con los RF que cubre, incluida la
   persistencia SQLite local;
4. el límite entre el repositorio de simulaciones y SQLite, indicando que el
   archivo solo es accesible por el backend y no se versiona.
Marca los supuestos explícitamente.
```

Abre el archivo generado y confirma que el tarifario y el contacto de asesor se 
tratan como servicios externos.

### Paso 6 — Registrar la decisión de stack

En el mismo chat de Bob, envía:

```text
Usa el archivo @docs/arquitectura/adr-001-stack.md y el Skill
arquitectura-simulador-credito. Complétalo. Decide React + Carbon para
frontend, Node + Express + TypeScript para backend y SQLite local para
persistencia de simulaciones. Incluye contexto, decisión, alternativas
descartadas, consecuencias y criterio de reversión. Explica que el acceso a
SQLite queda detrás de un repositorio y que el archivo no se versiona. No
inventes una integración que no esté en los insumos.
```

### Paso 7 — Delimitar las APIs

En el mismo chat de Bob, sin cambiar de modo ni desactivar el Skill, envía:

```text
Crea docs/arquitectura/api-boundaries.md. Para cada API externa
indica: propósito, endpoint usado, datos enviados/recibidos, dueño del servicio,
qué debe hacer el simulador y qué no debe reimplementar. Incluye el contrato interno
propuesto para POST /api/simulaciones.
```

### Paso 8 — Verificar consistencia antes de continuar

Debes tener tres archivos en `docs/arquitectura/`: `architecture-diagram.md`,
`adr-001-stack.md` y `api-boundaries.md`. Léelos y verifica que los nombres de
componentes, endpoints y RF sean consistentes. Luego continúa al Lab 04.
