/**
 * Validación de forma/tipo del body de `POST /api/simulaciones` (RF-04).
 *
 * Solo valida lo que se puede validar sin consultar el Tarifario (tipos, rangos genéricos,
 * combinaciones producto/campo). Las reglas que dependen del Tarifario (TEA dentro del rango del
 * producto, período de gracia/cuotas dobles permitidos por el producto) se validan después, en
 * `routes/simulaciones.ts`, una vez que se consulta el Tarifario — pero se devuelven en el mismo
 * formato de error por campo para que el frontend los trate de manera uniforme.
 */
import {
  MODALIDADES_SEGURO_VALIDAS,
  PRODUCTOS_VALIDOS,
  type ModalidadSeguro,
  type ProductoCodigo,
} from '../models/creditoTypes.js';

export interface SimulacionInput {
  productoCodigo: ProductoCodigo;
  valorBien: number;
  cuotaInicialPct: number;
  bono: number;
  tea: number;
  plazoMeses: number;
  fechaDesembolso: string;
  diaPago: number;
  seguroActivo: boolean;
  modalidadSeguro?: ModalidadSeguro;
  periodoGraciaDias?: 30 | 60;
  cuotasDobles?: boolean;
}

export type ValidationResult =
  | { ok: true; data: SimulacionInput }
  | { ok: false; errors: Record<string, string> };

const FECHA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALOR_BIEN_MAXIMO = 5_000_000;

function esNumeroFinito(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

export function validarSimulacionInput(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  const b = (body ?? {}) as Record<string, unknown>;

  // productoCodigo
  if (typeof b.productoCodigo !== 'string' || !PRODUCTOS_VALIDOS.includes(b.productoCodigo as ProductoCodigo)) {
    errors.productoCodigo = `Debe ser una de: ${PRODUCTOS_VALIDOS.join(', ')}.`;
  }

  // valorBien
  if (!esNumeroFinito(b.valorBien) || b.valorBien <= 0) {
    errors.valorBien = 'Debe ser un número mayor a 0.';
  } else if (b.valorBien > VALOR_BIEN_MAXIMO) {
    errors.valorBien = 'No puede superar S/ 5,000,000.';
  }

  // cuotaInicialPct
  if (!esNumeroFinito(b.cuotaInicialPct) || b.cuotaInicialPct < 0 || b.cuotaInicialPct > 1) {
    errors.cuotaInicialPct = 'Debe ser un número entre 0 y 1 (porcentaje como decimal).';
  }

  // bono
  const bono = b.bono === undefined ? 0 : b.bono;
  if (!esNumeroFinito(bono) || bono < 0) {
    errors.bono = 'Debe ser un número mayor o igual a 0.';
  }

  // tea
  if (!esNumeroFinito(b.tea) || b.tea <= 0) {
    errors.tea = 'Debe ser un número mayor a 0 (decimal, ej. 0.15 para 15%).';
  }

  // plazoMeses
  if (!esNumeroFinito(b.plazoMeses) || !Number.isInteger(b.plazoMeses) || b.plazoMeses <= 0 || b.plazoMeses > 600) {
    errors.plazoMeses = 'Debe ser un número entero de meses entre 1 y 600.';
  }

  // fechaDesembolso
  if (typeof b.fechaDesembolso !== 'string' || !FECHA_ISO_REGEX.test(b.fechaDesembolso) || Number.isNaN(Date.parse(b.fechaDesembolso))) {
    errors.fechaDesembolso = 'Debe ser una fecha válida en formato YYYY-MM-DD.';
  }

  // diaPago
  if (!esNumeroFinito(b.diaPago) || !Number.isInteger(b.diaPago) || b.diaPago < 1 || b.diaPago > 31) {
    errors.diaPago = 'Debe ser un número entero entre 1 y 31.';
  }

  // seguroActivo
  if (typeof b.seguroActivo !== 'boolean') {
    errors.seguroActivo = 'Debe ser true o false.';
  }

  // modalidadSeguro (requerido solo si seguroActivo)
  if (b.seguroActivo === true) {
    if (typeof b.modalidadSeguro !== 'string' || !MODALIDADES_SEGURO_VALIDAS.includes(b.modalidadSeguro as ModalidadSeguro)) {
      errors.modalidadSeguro = `Requerido cuando seguroActivo es true. Debe ser una de: ${MODALIDADES_SEGURO_VALIDAS.join(', ')}.`;
    }
  }

  // periodoGraciaDias (opcional; si viene, debe ser 30 o 60, y solo para CONSUMO — la validación de
  // producto se completa en routes/simulaciones.ts contra el Tarifario)
  if (b.periodoGraciaDias !== undefined && b.periodoGraciaDias !== null) {
    if (b.periodoGraciaDias !== 30 && b.periodoGraciaDias !== 60) {
      errors.periodoGraciaDias = 'Solo se admite 30 o 60 días.';
    } else if (b.productoCodigo !== 'CONSUMO') {
      errors.periodoGraciaDias = 'El período de gracia solo aplica al producto Crédito al Consumo.';
    }
  }

  // cuotasDobles (opcional; solo para CONSUMO)
  if (b.cuotasDobles === true && b.productoCodigo !== 'CONSUMO') {
    errors.cuotasDobles = 'Las cuotas dobles solo aplican al producto Crédito al Consumo.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      productoCodigo: b.productoCodigo as ProductoCodigo,
      valorBien: b.valorBien as number,
      cuotaInicialPct: b.cuotaInicialPct as number,
      bono: bono as number,
      tea: b.tea as number,
      plazoMeses: b.plazoMeses as number,
      fechaDesembolso: b.fechaDesembolso as string,
      diaPago: b.diaPago as number,
      seguroActivo: b.seguroActivo as boolean,
      modalidadSeguro: b.seguroActivo ? (b.modalidadSeguro as ModalidadSeguro) : undefined,
      periodoGraciaDias: (b.periodoGraciaDias ?? undefined) as 30 | 60 | undefined,
      cuotasDobles: b.cuotasDobles === true,
    },
  };
}
