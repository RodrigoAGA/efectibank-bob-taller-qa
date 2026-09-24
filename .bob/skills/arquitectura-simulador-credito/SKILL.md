---
name: arquitectura-simulador-credito
description: Mantiene decisiones de arquitectura trazables para el simulador.
---

Objetivo: diseñar una arquitectura implementable y trazable para el Simulador
de Crédito.

Fuentes de verdad: docs/requisitos/historias-usuario-refinadas.md,
docs/contracts/tarifario-api.yaml y docs/contracts/contacto-asesor-api.yaml.
No sustituyas ni extiendas esos contratos sin registrar la decisión.

Para todo diagrama, ADR o límite de API: separa cliente, API del simulador,
motor de cálculo, persistencia y servicios externos; relaciona componentes con
RF; especifica datos, errores y responsabilidades en cada frontera; y etiqueta
como SUPUESTO cualquier decisión no definida por el PRD.

Restricciones: el tarifario y contacto de asesor son dependencias externas; no
propongas reimplementarlos. Para el MVP, la persistencia es SQLite local,
encapsulada detrás de un repositorio del backend; no inventes autenticación,
core bancario ni acuerdos de disponibilidad. Toda decisión de stack debe incluir
alternativas consideradas, consecuencias y un criterio de reversión.

Control de salida: antes de editar enumera archivos y RF afectados. Después
verifica que nombres de endpoints, modelos y componentes coincidan en el ADR,
diagramas y contratos; reporta preguntas abiertas por separado.
