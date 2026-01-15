/**
 * Configuracao do Playwright para testes E2E via CDP
 *
 * IMPORTANTE: Este projeto usa Chrome DevTools Protocol (CDP) para conectar
 * ao navegador remoto. NAO usa browser local.
 *
 * A conexao CDP e gerenciada pela fixture em fixtures/test.fixture.ts
 *
 * Variaveis de ambiente (obrigatorias):
 * - BROWSER_CDP_HOST: Host e porta do CDP (obrigatorio, sem fallback)
 * - FRONTEND_URL: URL do frontend (obrigatorio, sem fallback)
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 60000,

  use: {
    // Configuracoes de trace/debug (desabilitados conforme requisitos)
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },

  // Sem setup de projeto global
  projects: [
    {
      name: 'e2e-tests',
      use: {},
    },
  ],
});
