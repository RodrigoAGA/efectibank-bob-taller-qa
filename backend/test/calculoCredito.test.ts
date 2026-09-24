import { describe, expect, it } from 'vitest';
import {
  calcularSimulacion,
  ReglaCreditoInvalidaError,
  type ParametrosCalculoCredito,
} from '../src/services/calculoCredito.js';

function baseParams(overrides: Partial<ParametrosCalculoCredito> = {}): ParametrosCalculoCredito {
  return {
    productoCodigo: 'CONSUMO',
    valorBien: 10000,
    cuotaInicialPct: 0,
    bono: 0,
    tea: 0.3,
    plazoMeses: 12,
    fechaDesembolso: '2026-01-15',
    diaPago: 15,
    seguroActivo: true,
    modalidadSeguro: 'SIN_DEVOLUCION',
    tasaSeguroMensual: 0.004,
    ...overrides,
  };
}

describe('calcularSimulacion — caso de referencia del PRD (Anexo 2)', () => {
  // Parámetros y tabla de amortización tomados literalmente de
  // prd/PRD_Simulador_de_Credito_v2.pdf, Anexo 2: monto 10,000, TEA 30%, TEM 2.2104%, plazo 12
  // meses, seguro sin devolución 0.40%. Sirve como "golden fixture" para validar la fórmula exacta.
  const resultado = calcularSimulacion(baseParams());

  it('calcula el monto financiado y la TEM esperados', () => {
    expect(resultado.montoFinanciado).toBeCloseTo(10000, 2);
    expect(resultado.tem).toBeCloseTo(0.022104, 5);
  });

  it('calcula la cuota base esperada (S/ 957.86)', () => {
    expect(resultado.cuotaBase).toBeCloseTo(957.86, 2);
  });

  it('genera 12 períodos y el cronograma coincide con la tabla de amortización del PRD', () => {
    expect(resultado.cronograma).toHaveLength(12);

    const p1 = resultado.cronograma[0];
    expect(p1.capital).toBeCloseTo(736.82, 2);
    expect(p1.interes).toBeCloseTo(221.04, 2);
    expect(p1.seguro).toBeCloseTo(40.0, 2);
    expect(p1.cuotaTotal).toBeCloseTo(997.86, 2);
    expect(p1.saldoFinal).toBeCloseTo(9263.18, 2);

    const p2 = resultado.cronograma[1];
    expect(p2.capital).toBeCloseTo(753.1, 2);
    expect(p2.interes).toBeCloseTo(204.76, 2);
    expect(p2.saldoFinal).toBeCloseTo(8510.08, 2);

    const p12 = resultado.cronograma[11];
    expect(p12.capital).toBeCloseTo(937.14, 2);
    expect(p12.interes).toBeCloseTo(20.72, 2);
    expect(p12.seguro).toBeCloseTo(3.75, 2);
    expect(p12.cuotaTotal).toBeCloseTo(961.61, 2);
    expect(p12.saldoFinal).toBeCloseTo(0, 2);
  });

  it('el capital amortizado aumenta y el interés disminuye período a período (amortización francesa)', () => {
    for (let i = 1; i < resultado.cronograma.length; i++) {
      expect(resultado.cronograma[i].capital).toBeGreaterThan(resultado.cronograma[i - 1].capital);
      expect(resultado.cronograma[i].interes).toBeLessThan(resultado.cronograma[i - 1].interes);
    }
  });
});

describe('calcularSimulacion — casos válidos y valores límite', () => {
  it('calcula sin seguro cuando seguroActivo es false (seguro y su total quedan en 0)', () => {
    const resultado = calcularSimulacion(baseParams({ seguroActivo: false, tasaSeguroMensual: 0 }));
    expect(resultado.totalSeguros).toBe(0);
    for (const periodo of resultado.cronograma) {
      expect(periodo.seguro).toBe(0);
    }
  });

  it('con cuotaInicialPct = 1 y bono = 0, el monto financiado es 0', () => {
    const resultado = calcularSimulacion(baseParams({ cuotaInicialPct: 1, bono: 0 }));
    expect(resultado.montoFinanciado).toBeCloseTo(0, 6);
  });

  it('con plazoMeses = 1, el crédito se salda por completo en el único período', () => {
    const resultado = calcularSimulacion(baseParams({ plazoMeses: 1 }));
    expect(resultado.cronograma).toHaveLength(1);
    expect(resultado.cronograma[0].saldoFinal).toBeCloseTo(0, 6);
  });

  it('respeta los límites de TEA de Hipotecario (9.80% y 14.90%) sin lanzar error', () => {
    expect(() =>
      calcularSimulacion(baseParams({ productoCodigo: 'HIPOTECARIO', tea: 0.098, seguroActivo: false, tasaSeguroMensual: 0 })),
    ).not.toThrow();
    expect(() =>
      calcularSimulacion(baseParams({ productoCodigo: 'HIPOTECARIO', tea: 0.149, seguroActivo: false, tasaSeguroMensual: 0 })),
    ).not.toThrow();
  });
});

describe('calcularSimulacion — período de gracia y cuotas dobles solo aplican a Consumo', () => {
  it('rechaza cuotasDobles en Automotriz', () => {
    expect(() => calcularSimulacion(baseParams({ productoCodigo: 'AUTOMOTRIZ', cuotasDobles: true }))).toThrow(
      ReglaCreditoInvalidaError,
    );
  });

  it('rechaza cuotasDobles en Comercial', () => {
    expect(() => calcularSimulacion(baseParams({ productoCodigo: 'COMERCIAL', cuotasDobles: true }))).toThrow(
      ReglaCreditoInvalidaError,
    );
  });

  it('rechaza periodoGraciaDias en Hipotecario', () => {
    expect(() =>
      calcularSimulacion(baseParams({ productoCodigo: 'HIPOTECARIO', periodoGraciaDias: 30 })),
    ).toThrow(ReglaCreditoInvalidaError);
  });

  it('rechaza un período de gracia distinto de 30 o 60 días, incluso en Consumo', () => {
    try {
      calcularSimulacion(baseParams({ periodoGraciaDias: 45 as unknown as 30 }));
      expect.fail('debía lanzar ReglaCreditoInvalidaError');
    } catch (err) {
      expect(err).toBeInstanceOf(ReglaCreditoInvalidaError);
      expect((err as ReglaCreditoInvalidaError).campo).toBe('periodoGraciaDias');
    }
  });

  it('acepta período de gracia de 30 y 60 días en Consumo y capitaliza el interés durante la gracia', () => {
    const sinGracia = calcularSimulacion(baseParams());
    const conGracia30 = calcularSimulacion(baseParams({ periodoGraciaDias: 30 }));
    const conGracia60 = calcularSimulacion(baseParams({ periodoGraciaDias: 60 }));

    // 1 período de gracia + 12 de amortización = 13; 2 + 12 = 14
    expect(conGracia30.cronograma).toHaveLength(13);
    expect(conGracia60.cronograma).toHaveLength(14);

    expect(conGracia30.cronograma[0].enGracia).toBe(true);
    expect(conGracia30.cronograma[0].capital).toBe(0);
    expect(conGracia30.cronograma[0].cuotaTotal).toBe(0);
    expect(conGracia30.cronograma[0].interes).toBeGreaterThan(0);

    // El saldo capitalizado durante la gracia hace que la cuota base sea mayor que sin gracia.
    expect(conGracia30.cuotaBase).toBeGreaterThan(sinGracia.cuotaBase);
    expect(conGracia60.cuotaBase).toBeGreaterThan(conGracia30.cuotaBase);
  });

  it('aplica cuotas dobles en Consumo cada 6 períodos y refleja el pago adicional en el cronograma', () => {
    const resultado = calcularSimulacion(baseParams({ plazoMeses: 12, cuotasDobles: true }));
    const periodosDobles = resultado.cronograma.filter((p) => p.esCuotaDoble);

    expect(periodosDobles.length).toBeGreaterThan(0);
    for (const periodo of periodosDobles) {
      expect(periodo.numero % 6).toBe(0);
    }

    // Al pagar cuotas dobles, el crédito puede terminar de pagarse antes o exactamente en el plazo,
    // nunca después.
    expect(resultado.cronograma.length).toBeLessThanOrEqual(12);
    expect(resultado.cronograma[resultado.cronograma.length - 1].saldoFinal).toBeCloseTo(0, 2);
  });
});
