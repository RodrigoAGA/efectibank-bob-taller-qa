/**
 * Cliente HTTP del Tarifario. Es la única puerta de entrada a los datos de productos/tasas de seguro
 * dentro del backend principal: el motor de cálculo (`services/calculoCredito.ts`) nunca importa el
 * JSON semilla directamente, siempre recibe los datos ya resueltos a través de este cliente
 * (ver `docs/contracts/tarifario-api.yaml` / `openapi/tarifario-api.yaml` para el contrato).
 */
import type { ModalidadSeguroTarifario, ProductoTarifario } from '../models/creditoTypes.js';

export class TarifarioNoDisponibleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TarifarioNoDisponibleError';
  }
}

export class TarifarioClient {
  constructor(private readonly baseUrl: string) {}

  async obtenerProductos(): Promise<ProductoTarifario[]> {
    return this.get<ProductoTarifario[]>('/tarifario/v1/productos');
  }

  async obtenerTasasSeguro(): Promise<ModalidadSeguroTarifario[]> {
    return this.get<ModalidadSeguroTarifario[]>('/tarifario/v1/seguro-desgravamen');
  }

  private async get<T>(path: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`);
    } catch (err) {
      throw new TarifarioNoDisponibleError(
        `No se pudo conectar con el Tarifario en ${this.baseUrl}${path}: ${(err as Error).message}`,
      );
    }
    if (!response.ok) {
      throw new TarifarioNoDisponibleError(`El Tarifario respondió ${response.status} en ${path}`);
    }
    return (await response.json()) as T;
  }
}
