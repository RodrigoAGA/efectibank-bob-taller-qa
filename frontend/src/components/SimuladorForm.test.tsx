import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SimuladorForm } from './SimuladorForm';

/**
 * Pruebas desde la perspectiva del usuario (roles y labels accesibles, no clases CSS ni detalles
 * internos de implementación). Basadas en el comportamiento real de SimuladorForm.tsx / Step1-4.
 *
 * El componente ahora llama al backend real (`/api/tarifario/v1/*`, `POST /api/simulaciones`, ver
 * `useTarifario` y `useSimulacionApi`) en vez de calcular localmente — acá se mockea `fetch` para no
 * depender de un servidor real durante estas pruebas de componente.
 */

const PRODUCTOS_MOCK = [
  { codigo: 'HIPOTECARIO', nombre: 'Crédito Hipotecario', teaMinima: 0.098, teaMaxima: 0.149, permitePeriodoGracia: false, permiteCuotasDobles: false },
  { codigo: 'AUTOMOTRIZ', nombre: 'Crédito Automotriz', teaMinima: 0.4, teaMaxima: 1.1413, permitePeriodoGracia: false, permiteCuotasDobles: false },
  { codigo: 'CONSUMO', nombre: 'Crédito al Consumo', teaMinima: 0.1599, teaMaxima: 1.1413, permitePeriodoGracia: true, permiteCuotasDobles: true },
  { codigo: 'COMERCIAL', nombre: 'Crédito Comercial', teaMinima: 0.45, teaMaxima: 1.1413, permitePeriodoGracia: false, permiteCuotasDobles: false },
];

const TASAS_SEGURO_MOCK = [
  { modalidad: 'SIN_DEVOLUCION', tasaMensual: 0.004 },
  { modalidad: 'CON_DEVOLUCION', tasaMensual: 0.0072 },
];

const SIMULACION_MOCK = {
  simulacionId: 'sim-test-1',
  resumen: {
    productoCodigo: 'CONSUMO',
    plazoMeses: 120,
    tea: 0.098,
    seguroActivo: true,
    modalidadSeguro: 'SIN_DEVOLUCION',
    periodoGraciaDias: null,
    cuotasDobles: false,
    montoFinanciado: 45000,
    tem: 0.0078,
    cuotaBase: 550.12,
    cuotaConSeguro: 730.12,
    totalIntereses: 20000,
    totalSeguros: 5000,
    totalPagar: 70000,
    primeraCuota: '2026-02-15',
  },
  cronograma: Array.from({ length: 120 }, (_, i) => ({
    numero: i + 1,
    fecha: '2026-02-15',
    saldoInicial: 45000,
    interes: 300,
    capital: 250.12,
    seguro: 180,
    cuotaTotal: 730.12,
    saldoFinal: 44749.88,
  })),
};

function mockFetch() {
  return vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.includes('/api/tarifario/v1/productos')) {
      return new Response(JSON.stringify(PRODUCTOS_MOCK), { status: 200 });
    }
    if (url.includes('/api/tarifario/v1/seguro-desgravamen')) {
      return new Response(JSON.stringify(TASAS_SEGURO_MOCK), { status: 200 });
    }
    if (url.includes('/api/simulaciones')) {
      return new Response(JSON.stringify(SIMULACION_MOCK), { status: 201 });
    }
    return new Response(JSON.stringify({}), { status: 404 });
  });
}

describe('SimuladorForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('permite seleccionar una única línea de producto (selección exclusiva)', async () => {
    const user = userEvent.setup();
    render(<SimuladorForm />);

    const consumo = await screen.findByRole('radio', { name: 'Crédito de Consumo' });
    const hipotecario = screen.getByRole('radio', { name: 'Crédito Hipotecario' });

    expect(consumo).toHaveAttribute('aria-checked', 'false');

    await user.click(consumo);
    expect(consumo).toHaveAttribute('aria-checked', 'true');
    expect(hipotecario).toHaveAttribute('aria-checked', 'false');

    await user.click(hipotecario);
    expect(hipotecario).toHaveAttribute('aria-checked', 'true');
    expect(consumo).toHaveAttribute('aria-checked', 'false');
  });

  it('muestra las opciones de plazo aplicables en el paso de condiciones', async () => {
    const user = userEvent.setup();
    render(<SimuladorForm />);

    const consumo = await screen.findByRole('radio', { name: 'Crédito de Consumo' });
    await user.click(consumo);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    for (const plazo of [60, 120, 180, 240, 360]) {
      expect(screen.getByRole('tab', { name: String(plazo) })).toBeInTheDocument();
    }
  });

  it('el botón Continuar queda deshabilitado (mensaje de validación implícito) con un monto inválido', async () => {
    const user = userEvent.setup();
    render(<SimuladorForm />);

    const consumo = await screen.findByRole('radio', { name: 'Crédito de Consumo' });
    await user.click(consumo);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    const valorBienInput = screen.getByLabelText('VALOR DEL BIEN');
    await user.clear(valorBienInput);
    await user.type(valorBienInput, '0');

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('muestra el campo de período de gracia solo cuando el producto es Consumo', async () => {
    const user = userEvent.setup();
    render(<SimuladorForm />);

    // Con Hipotecario: aviso de "sin opciones adicionales", sin mención a período de gracia.
    const hipotecario = await screen.findByRole('radio', { name: 'Crédito Hipotecario' });
    await user.click(hipotecario);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.queryByText(/período de gracia disponible/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no tiene opciones adicionales disponibles/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Atrás' }));
    await user.click(screen.getByRole('button', { name: 'Atrás' }));

    // Con Consumo: sí aparece el aviso de período de gracia.
    const consumo = screen.getByRole('radio', { name: 'Crédito de Consumo' });
    await user.click(consumo);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(screen.getByText(/período de gracia disponible/i)).toBeInTheDocument();
  });

  it('completa una simulación válida y muestra el resultado con la cuota estimada', async () => {
    const user = userEvent.setup();
    render(<SimuladorForm />);

    const consumo = await screen.findByRole('radio', { name: 'Crédito de Consumo' });
    await user.click(consumo);
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> paso 2
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> paso 3
    await user.click(screen.getByRole('button', { name: 'Continuar' })); // -> paso 4 (dispara POST)

    await waitFor(() => {
      expect(screen.getByText('CUOTA MENSUAL ESTIMADA')).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /ver cronograma de pagos/i })).toBeInTheDocument();
    expect(screen.getByText('Simulación referencial')).toBeInTheDocument(); // disclaimer (RF-16)

    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;
    const llamadaSimulacion = fetchMock.mock.calls.find(([url]) => String(url).includes('/api/simulaciones'));
    expect(llamadaSimulacion).toBeDefined();
    const [, opciones] = llamadaSimulacion!;
    expect(opciones.method).toBe('POST');
    const body = JSON.parse(opciones.body as string);
    expect(body.productoCodigo).toBe('CONSUMO');
  });
});
