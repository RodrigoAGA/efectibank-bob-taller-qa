/** Tipos de dominio compartidos del Simulador de Crédito (backend). */

export type ProductoCodigo = 'CONSUMO' | 'AUTOMOTRIZ' | 'COMERCIAL' | 'HIPOTECARIO';

export type ModalidadSeguro = 'SIN_DEVOLUCION' | 'CON_DEVOLUCION';

export const PRODUCTOS_VALIDOS: ProductoCodigo[] = ['CONSUMO', 'AUTOMOTRIZ', 'COMERCIAL', 'HIPOTECARIO'];

export const MODALIDADES_SEGURO_VALIDAS: ModalidadSeguro[] = ['SIN_DEVOLUCION', 'CON_DEVOLUCION'];

/** Producto tal como lo publica el Tarifario (RF-01, RF-02, RF-06, RF-10). */
export interface ProductoTarifario {
  codigo: ProductoCodigo;
  nombre: string;
  teaMinima: number;
  teaMaxima: number;
  permitePeriodoGracia: boolean;
  periodoGraciaDias?: number[];
  permiteCuotasDobles: boolean;
}

/** Tasa de seguro de desgravamen por modalidad, publicada por el Tarifario (RF-12). */
export interface ModalidadSeguroTarifario {
  modalidad: ModalidadSeguro;
  tasaMensual: number;
}
