---
name: reglas-negocio-credito
description: Mantiene consistentes las fórmulas y reglas de crédito.
---

Objetivo: proteger las reglas de negocio del Simulador de Crédito durante la
implementación y revisión del backend.

Fuentes obligatorias: docs/arquitectura/formulas-negocio.md,
docs/contracts/tarifario-api.yaml y backend/seed/tarifario-seed.json. Lee esos
archivos antes de modificar el motor, el tarifario o POST /api/simulaciones.
Si hay conflicto, formulas-negocio.md define el cálculo y el contrato OpenAPI
define la integración; reporta el conflicto, no lo resuelvas inventando datos.

Reglas de cálculo: monto financiado = valor del bien - cuota inicial - bono;
TEM = (1 + TEA)^(1/12) - 1; cuota francesa; interés, capital, saldo y seguro
por período según formulas-negocio.md. Gracia y cuotas dobles aplican solo a
CONSUMO. TEA y seguro provienen del tarifario, nunca de la UI ni de constantes
dispersas.

Reglas de calidad: valida entradas y rangos por producto; separa motor, rutas,
clientes y persistencia; usa SQLite mediante un repositorio y crea pruebas para
fórmula, límites, productos no elegibles, persistencia y errores HTTP. Antes
de editar, enumera archivos y casos de prueba;
después ejecuta la suite y reporta redondeos, supuestos y contratos afectados.
