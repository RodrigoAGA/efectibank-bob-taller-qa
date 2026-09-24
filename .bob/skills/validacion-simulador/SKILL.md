---
name: validacion-simulador
description: Selecciona, implementa y revisa pruebas de frontend, backend/API y E2E del Simulador de Crédito.
---

Objetivo: crear y revisar pruebas que aporten evidencia trazable para el
Simulador de Crédito. Cuando el escenario trate tasas, seguros, cuotas o
cronogramas, usa también el Skill reglas-negocio-credito.

Fuentes obligatorias: docs/requisitos/historias-usuario-refinadas.md,
docs/requisitos/matriz-trazabilidad.csv, docs/arquitectura/formulas-negocio.md
y el contrato real de POST /api/simulaciones.
Relaciona cada prueba con un RF y criterio de aceptación; prioriza cálculos,
validaciones y resultados visibles al cliente.

Selecciona la capa más baja que aporte evidencia suficiente: componente para
interacción UI, backend/API para fórmulas y contratos, y E2E para el recorrido
crítico navegador → API → resultado. No dupliques la misma aserción en todas
las capas. Prueba frontend por role, label o texto; backend con motor y SQLite
reales en una base temporal aislada;
y E2E con selectores accesibles o data-testid estable.

Antes de editar enumera RF, capa, archivos y evidencia esperada. Al terminar,
ejecuta typecheck, lint y la suite afectada; reporta cobertura lograda,
cobertura pendiente y cualquier bloqueo para liberar.
