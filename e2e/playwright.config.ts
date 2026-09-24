import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Config de Playwright del Lab 07. Levanta el backend (Lab 05, con su propio mock de Tarifario) y el
 * frontend (Lab 06) automáticamente antes de correr las pruebas: basta con
 * `cd e2e && npm install && npm test`, sin abrir terminales aparte para backend/frontend.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  // Usa el Microsoft Edge ya instalado en la máquina (`channel: 'msedge'`) en vez del Chromium que
  // descarga Playwright, para no depender de `npx playwright install chromium` (en redes corporativas
  // esa descarga suele estar bloqueada). Edge es Chromium por debajo, el comportamiento es
  // equivalente. Para usar el Chromium de Playwright: `devices['Desktop Chrome']` sin `channel`.
  projects: [{ name: 'msedge', use: { ...devices['Desktop Edge'], channel: 'msedge' } }],
  webServer: [
    {
      command: 'npm start',
      cwd: path.resolve(__dirname, '../backend'),
      url: 'http://localhost:3001/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      cwd: path.resolve(__dirname, '../frontend'),
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
