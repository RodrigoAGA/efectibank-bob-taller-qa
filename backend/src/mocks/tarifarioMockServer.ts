/**
 * Mock HTTP del Tarifario de Banco ACME (ver `openapi/tarifario-api.yaml`). Simula el sistema real
 * donde Riesgos/Tesorería publica y versiona las tasas TEA y de seguro de desgravamen. Es un servidor
 * HTTP real y separado del backend principal (aunque hoy vive en el mismo repo y se levanta desde el
 * mismo `npm start` para simplificar el día de la capacitación) — el backend principal solo le habla
 * a través de `TarifarioClient`.
 */
import express, { type Express } from 'express';
import type { Server } from 'node:http';
import { cargarTarifarioSeed } from './tarifarioSeed.js';

export function crearTarifarioMockApp(): Express {
  const app = express();
  const seed = cargarTarifarioSeed();

  app.get('/tarifario/v1/productos', (_req, res) => {
    res.status(200).json(seed.productos);
  });

  app.get('/tarifario/v1/seguro-desgravamen', (_req, res) => {
    res.status(200).json(seed.seguroDesgravamen);
  });

  return app;
}

export function iniciarTarifarioMockServer(port: number): Promise<Server> {
  const app = crearTarifarioMockApp();
  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}
