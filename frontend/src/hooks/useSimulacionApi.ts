import { useCallback, useState } from 'react';
import type { FormState, PeriodoCronograma, ResultadoSimulacion } from '../types/creditTypes';

/**
 * Integración con el backend real (Lab 06, paso 6 / Lab 05): reemplaza los cálculos financieros
 * locales del navegador (`useCreditoCalculator`, que queda sin uso en el flujo principal) por la
 * respuesta de `POST /api/simulaciones`.
 */

interface SimulacionApiState {
  resultado: ResultadoSimulacion | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string> | null;
}

const ESTADO_INICIAL: SimulacionApiState = {
  resultado: null,
  loading: false,
  error: null,
  fieldErrors: null,
};

function formatFecha(fechaStr: string): string {
  const [y, m, d] = fechaStr.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`;
}

interface ResumenApi {
  montoFinanciado: number;
  tem: number;
  cuotaBase: number;
  cuotaConSeguro: number;
  totalIntereses: number;
  totalSeguros: number;
  totalPagar: number;
  primeraCuota: string;
}

interface CronogramaApi {
  numero: number;
  fecha: string;
  saldoInicial: number;
  interes: number;
  capital: number;
  seguro: number;
  cuotaTotal: number;
  saldoFinal: number;
}

interface RespuestaSimulacionOk {
  simulacionId: string;
  resumen: ResumenApi;
  cronograma: CronogramaApi[];
}

interface RespuestaSimulacionError {
  errors: Record<string, string>;
}

function mapearResultado(body: RespuestaSimulacionOk): ResultadoSimulacion {
  const cronograma: PeriodoCronograma[] = body.cronograma.map((p) => ({
    numero: p.numero,
    fecha: formatFecha(p.fecha),
    saldoInicial: p.saldoInicial,
    interes: p.interes,
    capital: p.capital,
    seguro: p.seguro,
    cuotaTotal: p.cuotaTotal,
    saldoFinal: p.saldoFinal,
  }));

  return {
    montoFinanciado: body.resumen.montoFinanciado,
    tem: body.resumen.tem,
    cuotaBase: body.resumen.cuotaBase,
    cuotaConSeguro: body.resumen.cuotaConSeguro,
    totalIntereses: body.resumen.totalIntereses,
    totalSeguros: body.resumen.totalSeguros,
    totalPagar: body.resumen.totalPagar,
    primeraCuota: formatFecha(body.resumen.primeraCuota),
    cronograma,
  };
}

export function useSimulacionApi() {
  const [state, setState] = useState<SimulacionApiState>(ESTADO_INICIAL);

  const simular = useCallback(async (form: FormState) => {
    setState({ resultado: null, loading: true, error: null, fieldErrors: null });

    try {
      const res = await fetch('/api/simulaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productoCodigo: form.productoCodigo,
          valorBien: form.valorBien,
          cuotaInicialPct: form.cuotaInicialPct,
          bono: form.bono,
          tea: form.tea,
          plazoMeses: form.plazoMeses,
          fechaDesembolso: form.fechaDesembolso,
          diaPago: form.diaPago,
          seguroActivo: form.seguroActivo,
          modalidadSeguro: form.seguroActivo ? form.modalidadSeguro : undefined,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        const errBody = body as RespuestaSimulacionError;
        setState({
          resultado: null,
          loading: false,
          error: 'No se pudo calcular la simulación. Revisa los datos ingresados.',
          fieldErrors: errBody.errors ?? null,
        });
        return;
      }

      const resultado = mapearResultado(body as RespuestaSimulacionOk);
      setState({ resultado, loading: false, error: null, fieldErrors: null });
    } catch {
      setState({
        resultado: null,
        loading: false,
        error: 'No se pudo conectar con el servidor. Inténtalo nuevamente.',
        fieldErrors: null,
      });
    }
  }, []);

  const reset = useCallback(() => setState(ESTADO_INICIAL), []);

  return { ...state, simular, reset };
}
