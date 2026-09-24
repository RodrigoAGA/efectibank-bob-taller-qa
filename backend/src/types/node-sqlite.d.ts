/**
 * Declaración mínima del módulo built-in `node:sqlite` (disponible sin flags desde Node 22+,
 * estable en la versión de Node usada para este proyecto). @types/node de esta versión todavía
 * no incluye tipos oficiales para este módulo, así que se declara aquí la porción de la API que
 * usamos (DatabaseSync + StatementSync con bind de parámetros posicionales).
 */
declare module 'node:sqlite' {
  export interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    run(...params: unknown[]): StatementResultingChanges;
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
  }

  export class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
