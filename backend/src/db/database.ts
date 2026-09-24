import { createRequire } from 'node:module';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';

// `node:sqlite` se carga con `createRequire` (en vez de un `import` estático) porque el resolvedor de
// módulos de Vite/Vitest (usado para correr los tests) todavía no reconoce "sqlite" dentro de su lista
// de builtins de Node y falla al intentar resolverlo como paquete de npm. Con `require` nativo se evita
// por completo ese pipeline de resolución; en ejecución real (tsx / node) no cambia nada.
const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite') as { DatabaseSync: typeof DatabaseSyncType };

/**
 * Crea (o abre) la base SQLite y garantiza el esquema de `simulaciones`.
 * Usa el módulo built-in `node:sqlite` (sin dependencias nativas que compilar — importante para que
 * la instalación funcione sin fricción el día de la capacitación).
 *
 * `location` puede ser una ruta de archivo (desarrollo, ver `backend/data/`) o `:memory:`
 * (pruebas — cada llamada crea una base nueva y aislada).
 */
export function crearDatabase(location: string): DatabaseSyncType {
  const db = new DatabaseSync(location);

  db.exec(`
    CREATE TABLE IF NOT EXISTS simulaciones (
      id TEXT PRIMARY KEY,
      producto_codigo TEXT NOT NULL,
      valor_bien REAL NOT NULL,
      cuota_inicial_pct REAL NOT NULL,
      bono REAL NOT NULL,
      tea REAL NOT NULL,
      tem REAL NOT NULL,
      plazo_meses INTEGER NOT NULL,
      fecha_desembolso TEXT NOT NULL,
      dia_pago INTEGER NOT NULL,
      seguro_activo INTEGER NOT NULL,
      modalidad_seguro TEXT,
      periodo_gracia_dias INTEGER,
      cuotas_dobles INTEGER NOT NULL,
      monto_financiado REAL NOT NULL,
      cuota_base REAL NOT NULL,
      cuota_con_seguro REAL NOT NULL,
      total_intereses REAL NOT NULL,
      total_seguros REAL NOT NULL,
      total_pagar REAL NOT NULL,
      primera_cuota TEXT NOT NULL,
      cronograma_json TEXT NOT NULL,
      creado_en TEXT NOT NULL
    )
  `);

  return db;
}
