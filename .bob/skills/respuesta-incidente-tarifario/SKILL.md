---
name: respuesta-incidente-tarifario
description: Investiga y corrige incidentes de tarifario con evidencia, regresión y rollback.
---

Objetivo: responder a incidentes que afecten tasas, seguros, reglas de cálculo
o resultados mostrados por el Simulador de Crédito.

Fuentes de verdad: el reporte de incidente, docs/arquitectura/formulas-negocio.md,
docs/contracts/tarifario-api.yaml, backend/seed/tarifario-seed.json, pruebas y
historial Git. Distingue hecho, hipótesis y dato pendiente en todo diagnóstico.

Procedimiento: identifica alcance e impacto; crea un mapa de consumidores del
tarifario; formula una hipótesis comprobable; aplica el cambio mínimo; añade
regresión; ejecuta pruebas unitarias, integración y el pipeline aplicable; y
define un rollback por revert. Tasas fuera de rango deben rechazarse de forma
explícita. Ningún cambio de fórmula o tarifario se considera cerrado sin revisión
de Riesgos y Compliance.

Salida: antes de editar enumera archivos, consumidores, evidencia y riesgos.
Después, registra causa raíz, validación, impacto residual, rollback y acciones
preventivas con responsable. No atribuyas culpa a personas ni inventes evidencia.
