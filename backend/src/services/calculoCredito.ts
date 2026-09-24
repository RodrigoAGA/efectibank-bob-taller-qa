/**
 * Motor de cálculo financiero del Simulador de Crédito.
 *
 * Implementa las fórmulas de `docs/arquitectura/formulas-negocio.md` (extracto del PRD sección 5.7):
 * monto financiado, TEM desde TEA, cuota francesa, seguro de desgravamen y cronograma de pagos.
 *
 * Es una función pura: no hace I/O ni conoce el tarifario ni la base de datos. Todos los datos que
 * necesita (incluida la tasa de seguro resuelta) se le pasan como parámetros — así el JSON del
 * tarifario nunca se importa directamente acá, solo llega a través del cliente HTTP que resuelve el
 * llamador (ver `clients/tarifarioClient.ts` y `routes/simulaciones.ts`).
 *
 * Decisiones de diseño (el PRD deja estos dos puntos como reglas de alto nivel, sin fórmula exacta —
 * se documentan acá porque no estaban 100% especificadas):
 *
 * - **Período de gracia** (solo Consumo, 30 o 60 días): durante la gracia no se cobra cuota; el
 *   interés se sigue generando sobre el capital y se CAPITALIZA (se suma al saldo) mes a mes. Al
 *   finalizar la gracia, la cuota francesa se calcula sobre ese saldo ya capitalizado, a lo largo de
 *   los `plazoMeses` normales (la gracia se agrega COMO PERÍODOS EXTRA antes del inicio de pagos, no
 *   descuenta del plazo). No se cobra seguro durante la gracia (no hay cuota que lo incluya).
 * - **Cuotas dobles** (solo Consumo): se interpreta como el pago adicional que muchos bancos peruanos
 *   ofrecen en los meses de gratificación (cada 6 períodos, ej. períodos 6, 12, 18…), donde el cliente
 *   paga una cuota extra completa aplicada 100% a amortizar capital. Esto no cambia la cuota base de
 *   los demás períodos, pero acelera la reducción de saldo y puede terminar el cronograma antes del
 *   período `n` original (el bucle se detiene cuando el saldo llega a 0).
 */

import type { ModalidadSeguro, ProductoCodigo } from '../models/creditoTypes.js';

export class ReglaCreditoInvalidaError extends Error {
  campo: string;

  constructor(campo: string, message: string) {
    super(message);
    this.name = 'ReglaCreditoInvalidaError';
    this.campo = campo;
  }
}

export interface ParametrosCalculoCredito {
  productoCodigo: ProductoCodigo;
  valorBien: number;
  cuotaInicialPct: number;
  bono: number;
  tea: number;
  plazoMeses: number;
  /** Fecha de desembolso en formato 'YYYY-MM-DD'. */
  fechaDesembolso: string;
  /** Día de pago referencial (1-31). */
  diaPago: number;
  seguroActivo: boolean;
  modalidadSeguro?: ModalidadSeguro;
  /** Tasa mensual de seguro ya resuelta desde el tarifario (0 si seguroActivo es false). */
  tasaSeguroMensual: number;
  /** Solo aplica a CONSUMO. 30 o 60 días, o null/undefined si no se usa. */
  periodoGraciaDias?: 30 | 60 | null;
  /** Solo aplica a CONSUMO. */
  cuotasDobles?: boolean;
}

export interface PeriodoCronograma {
  numero: number;
  /** Fecha del período en formato 'YYYY-MM-DD'. */
  fecha: string;
  saldoInicial: number;
  interes: number;
  capital: number;
  seguro: number;
  cuotaTotal: number;
  saldoFinal: number;
  enGracia: boolean;
  esCuotaDoble: boolean;
}

export interface ResultadoCalculoCredito {
  montoFinanciado: number;
  tem: number;
  cuotaBase: number;
  cuotaConSeguro: number;
  totalIntereses: number;
  totalSeguros: number;
  totalPagar: number;
  /** Fecha de la primera cuota que efectivamente cobra un pago (posterior a la gracia, si aplica). */
  primeraCuota: string;
  cronograma: PeriodoCronograma[];
}

const MESES_POR_PERIODO_GRACIA: Record<30 | 60, number> = { 30: 1, 60: 2 };
const PERIODO_CUOTA_DOBLE = 6;
const TOLERANCIA_SALDO = 0.005;

function esConsumo(productoCodigo: ProductoCodigo): boolean {
  return productoCodigo === 'CONSUMO';
}

function validarReglasDeProducto(params: ParametrosCalculoCredito): void {
  const consumo = esConsumo(params.productoCodigo);

  if (params.cuotasDobles && !consumo) {
    throw new ReglaCreditoInvalidaError(
      'cuotasDobles',
      'Las cuotas dobles solo aplican al producto Crédito al Consumo.',
    );
  }

  if (params.periodoGraciaDias != null) {
    if (!consumo) {
      throw new ReglaCreditoInvalidaError(
        'periodoGraciaDias',
        'El período de gracia solo aplica al producto Crédito al Consumo.',
      );
    }
    if (params.periodoGraciaDias !== 30 && params.periodoGraciaDias !== 60) {
      throw new ReglaCreditoInvalidaError(
        'periodoGraciaDias',
        'El período de gracia solo admite 30 o 60 días.',
      );
    }
  }

  if (params.plazoMeses <= 0 || !Number.isFinite(params.plazoMeses)) {
    throw new ReglaCreditoInvalidaError('plazoMeses', 'El plazo debe ser un número de meses mayor a 0.');
  }

  if (params.tea <= 0 || !Number.isFinite(params.tea)) {
    throw new ReglaCreditoInvalidaError('tea', 'La TEA debe ser un número mayor a 0.');
  }
}

/** Suma `meses` a una fecha 'YYYY-MM-DD' y fija el día al `diaPago`, ajustando a fin de mes si no existe. */
function calcularFechaPeriodo(fechaDesembolsoIso: string, mesesOffset: number, diaPago: number): string {
  const [y, m, d] = fechaDesembolsoIso.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCMonth(base.getUTCMonth() + mesesOffset);

  const anio = base.getUTCFullYear();
  const mes = base.getUTCMonth();
  const ultimoDiaDelMes = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  const diaAjustado = Math.min(diaPago, ultimoDiaDelMes);

  const fechaFinal = new Date(Date.UTC(anio, mes, diaAjustado));
  return fechaFinal.toISOString().slice(0, 10);
}

export function calcularSimulacion(params: ParametrosCalculoCredito): ResultadoCalculoCredito {
  validarReglasDeProducto(params);

  const consumo = esConsumo(params.productoCodigo);
  const cuotaInicial = params.valorBien * params.cuotaInicialPct;
  const montoFinanciadoOriginal = params.valorBien - cuotaInicial - params.bono;
  const tem = Math.pow(1 + params.tea, 1 / 12) - 1;
  const n = params.plazoMeses;

  const mesesGracia = consumo && params.periodoGraciaDias ? MESES_POR_PERIODO_GRACIA[params.periodoGraciaDias] : 0;
  const aplicaCuotasDobles = consumo && !!params.cuotasDobles;
  const tasaSeguro = params.seguroActivo ? params.tasaSeguroMensual : 0;

  const cronograma: PeriodoCronograma[] = [];
  let saldo = montoFinanciadoOriginal;
  let totalIntereses = 0;
  let totalSeguros = 0;
  let primeraCuota: string | null = null;

  // ── Período de gracia: el interés se capitaliza, no se cobra cuota ni seguro ──────────────────
  for (let g = 1; g <= mesesGracia; g++) {
    const interesGracia = saldo * tem;
    const saldoInicial = saldo;
    saldo += interesGracia; // capitalización
    totalIntereses += interesGracia;

    cronograma.push({
      numero: g,
      fecha: calcularFechaPeriodo(params.fechaDesembolso, g, params.diaPago),
      saldoInicial,
      interes: interesGracia,
      capital: 0,
      seguro: 0,
      cuotaTotal: 0,
      saldoFinal: saldo,
      enGracia: true,
      esCuotaDoble: false,
    });
  }

  // La cuota base de amortización francesa se calcula sobre el saldo ya capitalizado por la gracia.
  const montoFinanciadoParaCuota = saldo;
  const factor = Math.pow(1 + tem, n);
  const cuotaBase = (montoFinanciadoParaCuota * (tem * factor)) / (factor - 1);

  // ── Amortización francesa (con cuotas dobles opcionales cada PERIODO_CUOTA_DOBLE períodos) ─────
  for (let i = 1; i <= n; i++) {
    if (saldo <= TOLERANCIA_SALDO) break;

    const numeroPeriodo = mesesGracia + i;
    const interes = saldo * tem;
    const esCuotaDoble = aplicaCuotasDobles && i % PERIODO_CUOTA_DOBLE === 0;
    const extraAmortizacion = esCuotaDoble ? cuotaBase : 0;

    let capital = cuotaBase - interes + extraAmortizacion;
    if (capital > saldo) capital = saldo; // última cuota (o pago que salda el crédito antes de plazo)

    const seguro = saldo * tasaSeguro;
    const cuotaTotal = interes + capital + seguro;
    const saldoFinal = Math.max(0, saldo - capital);
    const fecha = calcularFechaPeriodo(params.fechaDesembolso, numeroPeriodo, params.diaPago);

    if (primeraCuota === null) primeraCuota = fecha;

    cronograma.push({
      numero: numeroPeriodo,
      fecha,
      saldoInicial: saldo,
      interes,
      capital,
      seguro,
      cuotaTotal,
      saldoFinal,
      enGracia: false,
      esCuotaDoble,
    });

    totalIntereses += interes;
    totalSeguros += seguro;
    saldo = saldoFinal;
  }

  const cuotaConSeguro = cuotaBase + montoFinanciadoParaCuota * tasaSeguro;
  const totalPagar = montoFinanciadoOriginal + totalIntereses + totalSeguros;

  return {
    montoFinanciado: montoFinanciadoOriginal,
    tem,
    cuotaBase,
    cuotaConSeguro,
    totalIntereses,
    totalSeguros,
    totalPagar,
    primeraCuota: primeraCuota ?? calcularFechaPeriodo(params.fechaDesembolso, mesesGracia + 1, params.diaPago),
    cronograma,
  };
}
