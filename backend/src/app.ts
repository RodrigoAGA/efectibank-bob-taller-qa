import cors from 'cors';
import express, { type Express } from 'express';
import { TarifarioClient } from './clients/tarifarioClient.js';
import { crearDatabase } from './db/database.js';
import { SimulacionRepository } from './db/simulacionRepository.js';
import { healthRouter } from './routes/health.js';
import { simulacionesRouter } from './routes/simulaciones.js';
import { tarifarioRouter } from './routes/tarifario.js';

export interface CrearAppOptions {
  /** Base URL del mock de Tarifario, ej. 'http://localhost:4001'. */
  tarifarioBaseUrl: string;
  /** Ruta del archivo SQLite, o ':memory:' para una base aislada (pruebas). */
  dbPath: string;
}

export interface AppContext {
  app: Express;
  tarifarioClient: TarifarioClient;
  repository: SimulacionRepository;
}

/** Construye la app Express con todas sus dependencias explícitas — sin estado global. */
export function crearApp(options: CrearAppOptions): AppContext {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const tarifarioClient = new TarifarioClient(options.tarifarioBaseUrl);
  const db = crearDatabase(options.dbPath);
  const repository = new SimulacionRepository(db);

  app.use(healthRouter());
  app.use('/api/tarifario/v1', tarifarioRouter(tarifarioClient));
  app.use('/api/simulaciones', simulacionesRouter(tarifarioClient, repository));

  return { app, tarifarioClient, repository };
}
