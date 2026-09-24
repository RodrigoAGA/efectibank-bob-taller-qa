import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { crearApp, type AppContext } from '../src/app.js';
import { iniciarTarifarioMockServer } from '../src/mocks/tarifarioMockServer.js';

describe('POST /api/simulaciones (integración)', () => {
  let mockServer: Server;
  let ctx: AppContext;

  beforeAll(async () => {
    // Puerto 0 = el SO asigna uno libre; evita colisiones si el backend real ya está corriendo.
    mockServer = await iniciarTarifarioMockServer(0);
    const { port } = mockServer.address() as AddressInfo;

    // Base SQLite en memoria, aislada de la base de desarrollo (backend/data/simulaciones.db).
    ctx = crearApp({ tarifarioBaseUrl: `http://localhost:${port}`, dbPath: ':memory:' });
  });

  afterAll(() => {
    mockServer.close();
  });

  it('GET /health responde 200 con {status: "ok"}', async () => {
    const res = await request(ctx.app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('una solicitud válida devuelve 201 con resumen y cronograma, y queda registrada', async () => {
    const payload = {
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
    };

    const res = await request(ctx.app).post('/api/simulaciones').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.simulacionId).toBeTruthy();
    expect(res.body.resumen.cuotaBase).toBeCloseTo(957.86, 1);
    expect(res.body.resumen.montoFinanciado).toBeCloseTo(10000, 2);
    expect(res.body.cronograma).toHaveLength(12);
    expect(res.body.cronograma[0]).toMatchObject({ numero: 1 });

    // Verificación de persistencia a través del repositorio, no solo de la respuesta HTTP.
    const registro = ctx.repository.obtenerPorId(res.body.simulacionId);
    expect(registro).toBeDefined();
    expect(registro?.input.productoCodigo).toBe('CONSUMO');
    expect(registro?.resultado.cuotaBase).toBeCloseTo(957.86, 1);
  });

  it('una solicitud inválida devuelve 400 con el detalle por campo', async () => {
    const res = await request(ctx.app)
      .post('/api/simulaciones')
      .send({
        productoCodigo: 'CONSUMO',
        valorBien: -100,
        cuotaInicialPct: 2, // fuera de rango 0-1
        bono: 0,
        tea: -0.1, // debe ser > 0
        plazoMeses: 0,
        fechaDesembolso: 'fecha-invalida',
        diaPago: 40,
        seguroActivo: true,
        // falta modalidadSeguro, requerido cuando seguroActivo=true
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toMatchObject({
      valorBien: expect.any(String),
      cuotaInicialPct: expect.any(String),
      tea: expect.any(String),
      plazoMeses: expect.any(String),
      fechaDesembolso: expect.any(String),
      diaPago: expect.any(String),
      modalidadSeguro: expect.any(String),
    });
  });

  it('rechaza con 400 una TEA fuera del rango publicado para el producto', async () => {
    const res = await request(ctx.app)
      .post('/api/simulaciones')
      .send({
        productoCodigo: 'HIPOTECARIO',
        valorBien: 200000,
        cuotaInicialPct: 0.1,
        bono: 0,
        tea: 0.5, // Hipotecario va de 9.80% a 14.90%
        plazoMeses: 180,
        fechaDesembolso: '2026-01-15',
        diaPago: 15,
        seguroActivo: false,
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.tea).toBeDefined();
  });

  it('rechaza con 400 cuotas dobles o período de gracia en un producto que no es Consumo', async () => {
    const res = await request(ctx.app)
      .post('/api/simulaciones')
      .send({
        productoCodigo: 'AUTOMOTRIZ',
        valorBien: 50000,
        cuotaInicialPct: 0.2,
        bono: 0,
        tea: 0.45,
        plazoMeses: 36,
        fechaDesembolso: '2026-01-15',
        diaPago: 15,
        seguroActivo: false,
        cuotasDobles: true,
        periodoGraciaDias: 30,
      });

    expect(res.status).toBe(400);
    expect(res.body.errors.cuotasDobles).toBeDefined();
    expect(res.body.errors.periodoGraciaDias).toBeDefined();
  });

  it('no registra ninguna simulación cuando la solicitud es inválida', async () => {
    const antes = ctx.repository.contarTodas();
    await request(ctx.app).post('/api/simulaciones').send({ productoCodigo: 'CONSUMO' });
    const despues = ctx.repository.contarTodas();
    expect(despues).toBe(antes);
  });
});
