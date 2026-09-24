/**
 * Rutas `/api/tarifario/v1/*` que el frontend consume (ver `frontend/src/hooks/useTarifario.ts`).
 * Son un simple passthrough hacia el mock HTTP del Tarifario a través de `TarifarioClient` — el
 * backend principal actúa como BFF y nunca lee el JSON semilla directamente.
 */
import { Router } from 'express';
import type { TarifarioClient } from '../clients/tarifarioClient.js';

export function tarifarioRouter(tarifarioClient: TarifarioClient): Router {
  const router = Router();

  router.get('/productos', async (_req, res) => {
    try {
      const productos = await tarifarioClient.obtenerProductos();
      res.status(200).json(productos);
    } catch (err) {
      res.status(502).json({ errors: { tarifario: (err as Error).message } });
    }
  });

  router.get('/seguro-desgravamen', async (_req, res) => {
    try {
      const tasas = await tarifarioClient.obtenerTasasSeguro();
      res.status(200).json(tasas);
    } catch (err) {
      res.status(502).json({ errors: { tarifario: (err as Error).message } });
    }
  });

  return router;
}
