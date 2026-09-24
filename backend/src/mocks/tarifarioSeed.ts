import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import type { ModalidadSeguroTarifario, ProductoTarifario } from '../models/creditoTypes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.resolve(__dirname, '../../seed/tarifario-seed.json');

interface TarifarioSeed {
  productos: ProductoTarifario[];
  seguroDesgravamen: ModalidadSeguroTarifario[];
}

/**
 * Carga `backend/seed/tarifario-seed.json`. Este es el único módulo del backend con permiso para leer
 * ese archivo directamente — representa el sistema real de Riesgos/Tesorería que el mock HTTP simula
 * (ver `openapi/tarifario-api.yaml`). El motor de cálculo y las rutas de la API siempre pasan por
 * `TarifarioClient`, nunca por este archivo.
 */
export function cargarTarifarioSeed(): TarifarioSeed {
  const raw = readFileSync(SEED_PATH, 'utf-8');
  return JSON.parse(raw) as TarifarioSeed;
}
