import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { ResultadoCalculoCredito } from '../services/calculoCredito.js';
import type { SimulacionInput } from '../validation/simulacionValidator.js';

export interface SimulacionRegistro {
  id: string;
  creadoEn: string;
  input: SimulacionInput;
  resultado: ResultadoCalculoCredito;
}

/** Persistencia de simulaciones en SQLite (RF-18). */
export class SimulacionRepository {
  constructor(private readonly db: DatabaseSync) {}

  crear(input: SimulacionInput, resultado: ResultadoCalculoCredito): SimulacionRegistro {
    const id = randomUUID();
    const creadoEn = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO simulaciones (
          id, producto_codigo, valor_bien, cuota_inicial_pct, bono, tea, tem, plazo_meses,
          fecha_desembolso, dia_pago, seguro_activo, modalidad_seguro, periodo_gracia_dias,
          cuotas_dobles, monto_financiado, cuota_base, cuota_con_seguro, total_intereses,
          total_seguros, total_pagar, primera_cuota, cronograma_json, creado_en
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        input.productoCodigo,
        input.valorBien,
        input.cuotaInicialPct,
        input.bono,
        input.tea,
        resultado.tem,
        input.plazoMeses,
        input.fechaDesembolso,
        input.diaPago,
        input.seguroActivo ? 1 : 0,
        input.modalidadSeguro ?? null,
        input.periodoGraciaDias ?? null,
        input.cuotasDobles ? 1 : 0,
        resultado.montoFinanciado,
        resultado.cuotaBase,
        resultado.cuotaConSeguro,
        resultado.totalIntereses,
        resultado.totalSeguros,
        resultado.totalPagar,
        resultado.primeraCuota,
        JSON.stringify(resultado.cronograma),
        creadoEn,
      );

    return { id, creadoEn, input, resultado };
  }

  obtenerPorId(id: string): SimulacionRegistro | undefined {
    const row = this.db.prepare('SELECT * FROM simulaciones WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined;
    if (!row) return undefined;

    return {
      id: row.id as string,
      creadoEn: row.creado_en as string,
      input: {
        productoCodigo: row.producto_codigo as SimulacionInput['productoCodigo'],
        valorBien: row.valor_bien as number,
        cuotaInicialPct: row.cuota_inicial_pct as number,
        bono: row.bono as number,
        tea: row.tea as number,
        plazoMeses: row.plazo_meses as number,
        fechaDesembolso: row.fecha_desembolso as string,
        diaPago: row.dia_pago as number,
        seguroActivo: row.seguro_activo === 1,
        modalidadSeguro: (row.modalidad_seguro as SimulacionInput['modalidadSeguro']) ?? undefined,
        periodoGraciaDias: (row.periodo_gracia_dias as 30 | 60 | null) ?? undefined,
        cuotasDobles: row.cuotas_dobles === 1,
      },
      resultado: {
        montoFinanciado: row.monto_financiado as number,
        tem: row.tem as number,
        cuotaBase: row.cuota_base as number,
        cuotaConSeguro: row.cuota_con_seguro as number,
        totalIntereses: row.total_intereses as number,
        totalSeguros: row.total_seguros as number,
        totalPagar: row.total_pagar as number,
        primeraCuota: row.primera_cuota as string,
        cronograma: JSON.parse(row.cronograma_json as string),
      },
    };
  }

  contarTodas(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS total FROM simulaciones').get() as { total: number };
    return row.total;
  }
}
