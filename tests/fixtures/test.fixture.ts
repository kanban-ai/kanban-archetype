/**
 * Fixture customizada para testes E2E do Hello World CRUD
 * Usa CDP (Chrome DevTools Protocol) para conectar ao browser remoto
 */
import { test as base, Browser, chromium, Page } from '@playwright/test';

// Variaveis obrigatorias
const CDP_HOST = process.env.BROWSER_CDP_HOST;
if (!CDP_HOST) {
  throw new Error('BROWSER_CDP_HOST environment variable is required');
}

const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) {
  throw new Error('FRONTEND_URL environment variable is required');
}
export const FRONTEND_URL = frontendUrl;

const apiUrl = process.env.API_URL;
if (!apiUrl) {
  throw new Error('API_URL environment variable is required');
}
export const API_URL = apiUrl;

export interface TestFixtures {
  testPage: Page;
}

interface WorkerFixtures {
  sharedBrowser: Browser;
}

const DEFAULT_VIEWPORT = { width: 1920, height: 1080 };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  sharedBrowser: [async ({}, use) => {
    const browser = await chromium.connectOverCDP(`http://${CDP_HOST}`);
    await use(browser);
  }, { scope: 'worker' }],

  testPage: async ({ sharedBrowser }, use) => {
    const contexts = sharedBrowser.contexts();
    const context = contexts[0] || await sharedBrowser.newContext({ viewport: DEFAULT_VIEWPORT });
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
