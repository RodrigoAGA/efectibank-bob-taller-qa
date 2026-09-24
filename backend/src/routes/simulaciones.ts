import { Router } from 'express';
import type { TarifarioClient } from '../clients/tarifarioClient.js';
import { calcularSimulacion, ReglaCreditoInvalidaError } from '../services/calculoCredito.js';
import type { SimulacionRepository } from '../db/simulacionRepository.js';
import { validarSimulacionInput } from '../validation/simulacionValidator.js';

export function simulacionesRouter(tarifarioClient: TarifarioClient, repository: SimulacionRepository): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const validacion = validarSimulacionInput(req.body);
    if (!validacion.ok) {
      return res.status(400).json({ errors: validacion.errors });
    }
    const input = validacion.data;

    let productos;
    let tasasSeguro;
    try {
      [productos, tasasSeguro] = await Promise.all([
        tarifarioClient.obtenerProductos(),
        tarifarioClient.obtenerTasasSeguro(),
      ]);
    } catch (err) {
      return res.status(502).json({ errors: { tarifario: (err as Error).message } });
    }

    const producto = productos.find((p) => p.codigo === input.productoCodigo);
    if (!producto) {
      return res.status(400).json({ errors: { productoCodigo: 'Producto no reconocido en el Tarifario vigente.' } });
    }

    const erroresNegocio: Record<string, string> = {};

    if (input.tea < producto.teaMinima || input.tea > producto.teaMaxima) {
      erroresNegocio.tea = `Para ${producto.nombre} la TEA debe estar entre ${producto.teaMinima} y ${producto.teaMaxima}.`;
    }
    if (input.periodoGraciaDias != null && !producto.permitePeriodoGracia) {
      erroresNegocio.periodoGraciaDias = `${producto.nombre} no permite período de gracia.`;
    }
    if (input.cuotasDobles && !producto.permiteCuotasDobles) {
      erroresNegocio.cuotasDobles = `${producto.nombre} no permite cuotas dobles.`;
    }

    let tasaSeguroMensual = 0;
    if (input.seguroActivo) {
      const tasa = tasasSeguro.find((t) => t.modalidad === input.modalidadSeguro);
      if (!tasa) {
        erroresNegocio.modalidadSeguro = 'Modalidad de seguro no reconocida en el Tarifario vigente.';
      } else {
        tasaSeguroMensual = tasa.tasaMensual;
      }
    }

    if (Object.keys(erroresNegocio).length > 0) {
      return res.status(400).json({ errors: erroresNegocio });
    }

    let resultado;
    try {
      resultado = calcularSimulacion({
        productoCodigo: input.productoCodigo,
        valorBien: input.valorBien,
        cuotaInicialPct: input.cuotaInicialPct,
        bono: input.bono,
        tea: input.tea,
        plazoMeses: input.plazoMeses,
        fechaDesembolso: input.fechaDesembolso,
        diaPago: input.diaPago,
        seguroActivo: input.seguroActivo,
        modalidadSeguro: input.modalidadSeguro,
        tasaSeguroMensual,
        periodoGraciaDias: input.periodoGraciaDias,
        cuotasDobles: input.cuotasDobles,
      });
    } catch (err) {
      if (err instanceof ReglaCreditoInvalidaError) {
        return res.status(400).json({ errors: { [err.campo]: err.message } });
      }
      throw err;
    }

    const registro = repository.crear(input, resultado);

    return res.status(201).json({
      simulacionId: registro.id,
      resumen: {
        productoCodigo: input.productoCodigo,
        plazoMeses: input.plazoMeses,
        tea: input.tea,
        seguroActivo: input.seguroActivo,
        modalidadSeguro: input.modalidadSeguro ?? null,
        periodoGraciaDias: input.periodoGraciaDias ?? null,
        cuotasDobles: !!input.cuotasDobles,
        montoFinanciado: resultado.montoFinanciado,
        tem: resultado.tem,
        cuotaBase: resultado.cuotaBase,
        cuotaConSeguro: resultado.cuotaConSeguro,
        totalIntereses: resultado.totalIntereses,
        totalSeguros: resultado.totalSeguros,
        totalPagar: resultado.totalPagar,
        primeraCuota: resultado.primeraCuota,
      },
      cronograma: resultado.cronograma,
    });
  });

  return router;
}
