import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearApp } from './app.js';
import { iniciarTarifarioMockServer } from './mocks/tarifarioMockServer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT ?? 3001);
const TARIFARIO_MOCK_PORT = Number(process.env.TARIFARIO_MOCK_PORT ?? 4001);
const DB_PATH = process.env.SIMULACIONES_DB_PATH ?? path.resolve(__dirname, '../data/simulaciones.db');

async function main(): Promise<void> {
  await iniciarTarifarioMockServer(TARIFARIO_MOCK_PORT);
  console.log(`Mock de Tarifario escuchando en http://localhost:${TARIFARIO_MOCK_PORT}`);

  const { app } = crearApp({
    tarifarioBaseUrl: `http://localhost:${TARIFARIO_MOCK_PORT}`,
    dbPath: DB_PATH,
  });

  app.listen(PORT, () => {
    console.log(`Backend del Simulador de Crédito escuchando en http://localhost:${PORT}`);
    console.log(`Base de datos: ${DB_PATH}`);
  });
}

main().catch((err) => {
  console.error('No se pudo iniciar el backend:', err);
  process.exit(1);
});
