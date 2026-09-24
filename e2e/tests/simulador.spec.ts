import { expect, test } from '@playwright/test';

/**
 * E2E del Lab 07 contra el frontend y backend reales (no mocks). Selectores accesibles (role/label),
 * tomados de `frontend/src/components/SimuladorForm.tsx` y `Step1Producto.tsx`/`Step2Condiciones.tsx`
 * reales — nunca clases CSS ni estructura del DOM.
 */

test('flujo Consumo completo: cuota, cronograma y disclaimers tras la respuesta real de /api/simulaciones', async ({
  page,
}) => {
  await page.goto('/');

  // Paso 1 — selección de producto (RF-01)
  await page.getByRole('radio', { name: 'Crédito de Consumo' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Paso 2 — condiciones: se usan los valores válidos por defecto del formulario.
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Paso 3 — personalización: se deja el seguro activo por defecto y se avanza, lo que dispara
  // el POST real a /api/simulaciones.
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/api/simulaciones') && res.request().method() === 'POST',
    ),
    page.getByRole('button', { name: 'Continuar' }).click(),
  ]);
  expect(response.status()).toBe(201);

  // Paso 4 — resultado visible: cuota, cronograma y disclaimers (RF-13, RF-14, RF-16).
  await expect(page.getByText('CUOTA MENSUAL ESTIMADA')).toBeVisible();
  await expect(page.getByRole('link', { name: /ver cronograma de pagos/i })).toBeVisible();
  await expect(page.getByText('Simulación referencial', { exact: true })).toBeVisible();

  // El cronograma abre en un modal con el detalle período a período (RF-14).
  await page.getByRole('link', { name: /ver cronograma de pagos/i }).click();
  await expect(page.getByRole('heading', { name: /cronograma de pagos/i })).toBeVisible();
});

test('monto inválido no dispara ningún POST a /api/simulaciones', async ({ page }) => {
  let seDisparoPost = false;
  page.on('request', (req) => {
    if (req.url().includes('/api/simulaciones') && req.method() === 'POST') {
      seDisparoPost = true;
    }
  });

  await page.goto('/');

  await page.getByRole('radio', { name: 'Crédito de Consumo' }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();

  // Paso 2: se deja el valor del bien en 0, lo que debe bloquear el avance (RF-04).
  const valorBienInput = page.getByLabel('VALOR DEL BIEN');
  await valorBienInput.fill('');
  await valorBienInput.fill('0');

  const continuarBtn = page.getByRole('button', { name: 'Continuar' });
  await expect(continuarBtn).toBeDisabled();

  // Pequeño margen para confirmar que no hay actividad de red pendiente hacia /api/simulaciones.
  await page.waitForTimeout(500);
  expect(seDisparoPost).toBe(false);
});
